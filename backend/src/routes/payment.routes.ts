import { Router, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { query, pool } from "../../db";
import { verifyToken, verifyAdmin } from "../middleware/auth";
import { generatePromptPayPayload } from "../services/promptpay.service";
import { paymentGateway } from "../services/payment/payment.manager";

const router = Router();

// Storage setup for payment slips
const uploadsDir = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => cb(null, uploadsDir),
  filename: (_req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "slip-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (_req: any, file: any, cb: any) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, WEBP) หรือ PDF เท่านั้น"), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

/**
 * Ensure the authenticated user owns the booking (Authorization / anti-IDOR).
 * Returns the booking row or sends 403/404 and null.
 */
async function requireBookingOwner(req: any, res: Response, bookingId: number) {
  const bookingRes = await query(
    "SELECT id, booking_no, total_price, status, user_id FROM bookings WHERE id = $1",
    [bookingId]
  );
  if (bookingRes.rows.length === 0) {
    res.status(404).json({ message: "ไม่พบข้อมูลการจอง" });
    return null;
  }
  const booking = bookingRes.rows[0];
  if (Number(booking.user_id) !== Number(req.user?.userId)) {
    res.status(403).json({ message: "ไม่มีสิทธิ์ดำเนินการกับการจองนี้" });
    return null;
  }
  return booking;
}

/**
 * GET /api/payment/providers
 * Returns list of available payment gateway adapters and active state
 */
router.get("/providers", (_req: any, res: Response) => {
  const activeAdapter = paymentGateway.getActiveAdapter();
  const providers = paymentGateway.listAvailableProviders();

  res.json({
    activeProvider: {
      id: activeAdapter.providerId,
      name: activeAdapter.providerName,
    },
    providers,
  });
});

/**
 * POST /api/payment/checkout
 * Unified payment session initialization for active payment provider
 */
router.post("/checkout", verifyToken, async (req: any, res: Response) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ message: "กรุณาระบุ bookingId" });
    }

    const booking = await requireBookingOwner(req, res, Number(bookingId));
    if (!booking) return;

    if (booking.status !== "approved_pending_payment") {
      return res.status(400).json({ message: "การจองนี้ยังไม่พร้อมสำหรับการชำระเงิน" });
    }

    const session = await paymentGateway.createPaymentSession({
      bookingId: booking.id,
      bookingNo: booking.booking_no,
      amount: Number(booking.total_price),
      customerEmail: req.user?.email,
      customerName: req.user?.name || undefined,
    });

    res.json(session);
  } catch (err: any) {
    console.error("[payment/checkout] Error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการสร้างรายการชำระเงิน" });
  }
});

/**
 * Apply verified payment callback → bookings + payments row (Transaction ID)
 */
async function applyVerifiedPayment(
  result: {
    bookingId?: number;
    bookingNo?: string;
    transactionId?: string;
    amount?: number;
  },
  providerId: string
) {
  let booking: { id: number; booking_no: string; total_price: number } | null = null;

  if (result.bookingId) {
    const byId = await query(
      "SELECT id, booking_no, total_price FROM bookings WHERE id = $1",
      [result.bookingId]
    );
    booking = byId.rows[0] || null;
  }
  if (!booking && result.bookingNo) {
    const byNo = await query(
      "SELECT id, booking_no, total_price FROM bookings WHERE booking_no = $1",
      [result.bookingNo]
    );
    booking = byNo.rows[0] || null;
  }
  if (!booking) return null;

  const txId = result.transactionId || `${providerId}_${Date.now()}`;
  const amount = result.amount != null ? Number(result.amount) : Number(booking.total_price);

  // Atomic: never leave booking paid without a payments row
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `UPDATE bookings
       SET payment_status = 'verified', status = 'approved_paid'
       WHERE id = $1`,
      [booking.id]
    );
    await client.query(
      `INSERT INTO payments (booking_id, transaction_id, amount, payment_method, payment_gateway_ref, status, paid_at)
       VALUES ($1, $2, $3, $4, $5, 'verified', NOW())
       ON CONFLICT (transaction_id) DO UPDATE
         SET status = 'verified',
             payment_gateway_ref = COALESCE(EXCLUDED.payment_gateway_ref, payments.payment_gateway_ref),
             paid_at = COALESCE(payments.paid_at, NOW())`,
      [booking.id, txId, amount, providerId, txId]
    );
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  return {
    bookingId: booking.id,
    bookingNo: booking.booking_no,
    transactionId: txId,
    amount,
  };
}

/**
 * POST /api/payment/webhook/:provider
 * Webhook / callback handler (Opn, SCB, KBank, KTB, Mock, Stripe)
 * Stripe Live: requires STRIPE_WEBHOOK_SECRET + verified Stripe-Signature (raw body from app.ts).
 */
router.post("/webhook/:provider", async (req: any, res: Response) => {
  try {
    const providerId = req.params.provider;

    if (providerId === "stripe") {
      const { verifyStripeWebhookSignature, isStripeLiveKey } = await import(
        "../services/payment/stripeWebhook.util"
      );
      const whsec = process.env.STRIPE_WEBHOOK_SECRET || "";
      const live = isStripeLiveKey(process.env.STRIPE_SECRET_KEY || "");
      if (live && !whsec) {
        return res.status(503).json({
          message: "Live Stripe requires STRIPE_WEBHOOK_SECRET",
        });
      }
      if (whsec) {
        const raw: Buffer | string =
          req.rawBody != null
            ? req.rawBody
            : typeof req.body === "string"
              ? req.body
              : JSON.stringify(req.body || {});
        const check = verifyStripeWebhookSignature(
          raw,
          req.headers["stripe-signature"] as string | undefined,
          whsec
        );
        if (!check.ok) {
          console.warn("[payment/webhook/stripe] signature failed:", check.reason);
          return res.status(400).json({ message: "Invalid Stripe signature", reason: check.reason });
        }
      }
    }

    const result = await paymentGateway.handleWebhook(providerId, req.body, req.headers);

    let applied = null;
    if (
      result.success &&
      result.status === "verified" &&
      (result.bookingNo || result.bookingId)
    ) {
      applied = await applyVerifiedPayment(result, providerId);
    }

    res.json({
      received: true,
      result,
      applied,
    });
  } catch (err: any) {
    console.error(`[payment/webhook/${req.params.provider}] Error:`, err);
    res.status(500).json({ message: "Webhook processing error" });
  }
});

/**
 * POST /api/payment/stripe/confirm
 * After Stripe Checkout redirect — retrieve session by ID and mark paid.
 * Needed on localhost (Stripe cloud webhook cannot reach your PC).
 */
router.post("/stripe/confirm", verifyToken, async (req: any, res: Response) => {
  try {
    const sessionId = String(req.body?.sessionId || req.body?.session_id || "").trim();
    if (!sessionId.startsWith("cs_")) {
      return res.status(400).json({ message: "กรุณาระบุ sessionId จาก Stripe Checkout" });
    }

    const secret = process.env.STRIPE_SECRET_KEY || "";
    if (!secret.startsWith("sk_test_") && !secret.startsWith("sk_live_")) {
      return res.status(400).json({
        message: "ยังไม่ได้ตั้ง STRIPE_SECRET_KEY (sk_test_... หรือ sk_live_...)",
      });
    }
    if (
      secret.startsWith("sk_live_") &&
      process.env.NODE_ENV !== "production" &&
      process.env.STRIPE_ALLOW_LIVE !== "true"
    ) {
      return res.status(403).json({
        message:
          "sk_live_ ถูกบล็อกนอก production — ตั้ง NODE_ENV=production หรือ STRIPE_ALLOW_LIVE=true",
      });
    }

    const stripeRes = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
      {
        headers: { Authorization: `Bearer ${secret}` },
      }
    );
    const session: any = await stripeRes.json();
    if (!stripeRes.ok) {
      return res.status(502).json({
        message: session?.error?.message || "ดึง Checkout Session จาก Stripe ไม่สำเร็จ",
        raw: session,
      });
    }

    const paid =
      session.payment_status === "paid" ||
      session.status === "complete";
    if (!paid) {
      return res.status(400).json({
        message: "ยังชำระไม่สำเร็จ",
        paymentStatus: session.payment_status,
        status: session.status,
      });
    }

    const bookingId = session.metadata?.bookingId
      ? Number(session.metadata.bookingId)
      : undefined;
    const bookingNo =
      session.client_reference_id || session.metadata?.bookingNo || undefined;

    if (!bookingId && !bookingNo) {
      return res.status(400).json({ message: "Session ไม่มี metadata การจอง" });
    }

    // Ownership: user may only confirm their own booking
    const lookup = bookingId
      ? await query("SELECT id, booking_no, user_id, total_price, status FROM bookings WHERE id = $1", [
          bookingId,
        ])
      : await query(
          "SELECT id, booking_no, user_id, total_price, status FROM bookings WHERE booking_no = $1",
          [bookingNo]
        );
    if (lookup.rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบการจอง" });
    }
    const booking = lookup.rows[0];
    if (Number(booking.user_id) !== Number(req.user?.userId)) {
      return res.status(403).json({ message: "ไม่มีสิทธิ์ยืนยันการชำระนี้" });
    }

    const applied = await applyVerifiedPayment(
      {
        bookingId: booking.id,
        bookingNo: booking.booking_no,
        transactionId: session.payment_intent || session.id,
        amount:
          session.amount_total != null
            ? Number(session.amount_total) / 100
            : Number(booking.total_price),
      },
      "stripe"
    );

    res.json({
      message: "ยืนยันการชำระเงินจาก Stripe สำเร็จ",
      applied,
      sessionId: session.id,
      transactionId: applied?.transactionId,
    });
  } catch (err: any) {
    console.error("[payment/stripe/confirm] Error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการยืนยัน Stripe" });
  }
});

/**
 * GET /api/payment/stripe/demo-checkout
 * Local Stripe demo UI (when STRIPE_SECRET_KEY is not set)
 */
router.get("/stripe/demo-checkout", async (req: any, res: Response) => {
  const tx = String(req.query.tx || "");
  const bookingId = String(req.query.bookingId || "");
  const bookingNo = String(req.query.bookingNo || "");
  const amount = String(req.query.amount || "0");
  const frontend = (process.env.FRONTEND_URL || "http://localhost:5173")
    .split(",")[0]
    .trim();

  if (!tx || !bookingNo) {
    return res.status(400).send("Missing checkout parameters");
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Stripe Demo Checkout — MFU</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #f8fafc; margin: 0; padding: 2rem; }
    .card { max-width: 420px; margin: 2rem auto; background: #fff; border-radius: 1.25rem;
            padding: 1.75rem; box-shadow: 0 10px 30px rgba(15,23,42,.08); border: 1px solid #e2e8f0; }
    h1 { font-size: 1.25rem; margin: 0 0 .5rem; color: #0f172a; }
    .muted { color: #64748b; font-size: .875rem; }
    .row { display: flex; justify-content: space-between; margin: .6rem 0; font-size: .95rem; }
    .amount { font-size: 1.75rem; font-weight: 800; color: #ba0b2f; }
    button { width: 100%; margin-top: 1.25rem; background: #635bff; color: #fff; border: 0;
             border-radius: .75rem; padding: .9rem 1rem; font-weight: 700; cursor: pointer; }
    button:disabled { opacity: .5; cursor: wait; }
    .ok { color: #059669; font-weight: 700; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Stripe Demo Checkout</h1>
    <p class="muted">โหมดทดสอบท้องถิ่น — ไม่เรียก Stripe จริง (ใส่ STRIPE_SECRET_KEY=sk_test_... เพื่อใช้ test mode จริง)</p>
    <div class="row"><span>Booking</span><strong>${bookingNo}</strong></div>
    <div class="row"><span>Transaction ID</span><strong style="font-size:.75rem">${tx}</strong></div>
    <div class="row"><span>Amount</span><span class="amount">฿${Number(amount).toLocaleString()}</span></div>
    <button id="pay">จำลองชำระเงิน (Callback)</button>
    <p id="msg" class="muted" style="margin-top:1rem"></p>
  </div>
  <script>
    const btn = document.getElementById('pay');
    const msg = document.getElementById('msg');
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      msg.textContent = 'กำลังส่ง callback...';
      try {
        const res = await fetch('/api/payment/webhook/stripe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source: 'stripe_demo',
            simulateStatus: 'success',
            bookingId: Number('${bookingId}') || undefined,
            bookingNo: '${bookingNo}',
            transactionId: '${tx}',
            amount: Number('${amount}')
          })
        });
        const data = await res.json();
        if (!res.ok || !data?.applied) throw new Error(data?.message || 'callback failed');
        msg.innerHTML = '<span class="ok">ชำระแล้ว</span><br/>Transaction ID: <code>' +
          (data.applied.transactionId || '${tx}') + '</code>';
        setTimeout(() => { location.href = '${frontend}/dashboard?stripe=success&tx=${encodeURIComponent(tx)}'; }, 1200);
      } catch (e) {
        msg.textContent = 'ล้มเหลว: ' + (e && e.message ? e.message : e);
        btn.disabled = false;
      }
    });
  </script>
</body>
</html>`);
});


/**
 * POST /api/payment/mock/simulate
 * จำลองการชำระเงินสำหรับ UAT — ไม่มีการโอนเงินจริง
 * ตั้ง PAYMENT_PROVIDER=mock_sandbox ใน .env ก่อนใช้งาน
 */
router.post("/mock/simulate", verifyToken, async (req: any, res: Response) => {
  try {
    const activeAdapter = paymentGateway.getActiveAdapter();
    if (activeAdapter.providerId !== "mock_sandbox") {
      return res.status(400).json({
        message: "โหมดจำลองการชำระเงินไม่ได้เปิดใช้งาน กรุณาตั้ง PAYMENT_PROVIDER=mock_sandbox",
      });
    }

    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ message: "กรุณาระบุ bookingId" });
    }

    const bookingRes = await query(
      "SELECT id, booking_no, total_price, status, user_id FROM bookings WHERE id = $1",
      [bookingId]
    );

    if (bookingRes.rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบข้อมูลการจอง" });
    }

    const booking = bookingRes.rows[0];

    if (booking.user_id !== req.user?.userId) {
      return res.status(403).json({ message: "ไม่มีสิทธิ์ดำเนินการกับการจองนี้" });
    }

    if (booking.status !== "approved_pending_payment") {
      return res.status(400).json({ message: "การจองนี้ยังไม่พร้อมสำหรับการชำระเงิน" });
    }

    const session = await paymentGateway.createPaymentSession({
      bookingId: booking.id,
      bookingNo: booking.booking_no,
      amount: Number(booking.total_price),
      customerEmail: req.user?.email,
    });

    const webhookResult = await paymentGateway.handleWebhook("mock_sandbox", {
      bookingId: booking.id,
      bookingNo: booking.booking_no,
      amount: Number(booking.total_price),
      transactionId: session.transactionId,
      simulateStatus: "success",
    });

    if (!webhookResult.success) {
      return res.status(500).json({ message: "การจำลองชำระเงินล้มเหลว" });
    }

    await query(
      `UPDATE bookings
       SET payment_status = 'pending_verification',
           payment_slip_url = '/uploads/mock-payment-simulated'
       WHERE id = $1`,
      [bookingId]
    );

    res.json({
      message: "[UAT] จำลองการชำระเงินสำเร็จ — รอเจ้าหน้าที่ตรวจสอบและยืนยัน",
      bookingNo: booking.booking_no,
      transactionId: session.transactionId,
      paymentStatus: "pending_verification",
      mode: "mock_sandbox",
    });
  } catch (err: any) {
    console.error("[payment/mock/simulate] Error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการจำลองการชำระเงิน" });
  }
});


/**
 * POST /api/payment/promptpay/generate
 * Generate dynamic PromptPay QR payload for a booking
 */
router.post("/promptpay/generate", verifyToken, async (req: any, res: Response) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ message: "กรุณาระบุ bookingId" });
    }

    const booking = await requireBookingOwner(req, res, Number(bookingId));
    if (!booking) return;

    const amount = Number(booking.total_price);
    const targetPromptPayId = process.env.PROMPTPAY_ID || "0575532000100"; // MFU Tax ID

    const qrPayload = generatePromptPayPayload(targetPromptPayId, amount);

    res.json({
      bookingId: booking.id,
      bookingNo: booking.booking_no,
      amount,
      promptpayId: targetPromptPayId,
      qrPayload,
    });
  } catch (err: any) {
    console.error("[payment/promptpay] Error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการสร้าง QR Code ชำระเงิน" });
  }
});

/**
 * POST /api/payment/slip/upload
 * Upload payment slip for a booking
 */
router.post(
  "/slip/upload",
  verifyToken,
  upload.single("slipImage"),
  async (req: any, res: Response) => {
    try {
      const { bookingId } = req.body;
      if (!bookingId) {
        return res.status(400).json({ message: "กรุณาระบุ bookingId" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "กรุณาแนบไฟล์สลิปการชำระเงิน" });
      }

      const owned = await requireBookingOwner(req, res, Number(bookingId));
      if (!owned) return;

      const slipUrl = `/uploads/${req.file.filename}`;

      const updateRes = await query(
        `UPDATE bookings
         SET payment_slip_url = $1, payment_status = 'pending_verification'
         WHERE id = $2 AND user_id = $3
         RETURNING id, booking_no, payment_status`,
        [slipUrl, bookingId, req.user.userId]
      );

      if (updateRes.rows.length === 0) {
        return res.status(404).json({ message: "ไม่พบข้อมูลการจองเพื่ออัปเดตสลิป" });
      }

      res.json({
        message: "อัปโหลดสลิปการชำระเงินสำเร็จ! รอเจ้าหน้าที่ตรวจสอบ",
        slipUrl,
        booking: updateRes.rows[0],
      });
    } catch (err: any) {
      console.error("[payment/slip] Upload error:", err);
      res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปโหลดสลิปชำระเงิน" });
    }
  }
);

import { generateBookingPDFReceipt } from "../services/pdf.service";
import { sendPaymentApprovedWithPermitEmail } from "../services/email.service";
import { adminNameFromReq, logAdminAction } from "../services/auditLog.service";
import { createNotification } from "../services/notification.service";

/**
 * POST /api/payment/verify
 * Admin verifies and approves/rejects payment slip
 */
router.post("/verify", verifyToken, verifyAdmin, async (req: any, res: Response) => {
  try {
    const { bookingId, isVerified, remark } = req.body;
    if (!bookingId) {
      return res.status(400).json({ message: "กรุณาระบุ bookingId" });
    }
    if (process.env.PAYMENT_PROVIDER === "stripe") {
      return res.status(403).json({
        message:
          "เมื่อใช้ Stripe แอดมินยืนยันสลิปเองไม่ได้ — รอลูกค้าชำระผ่าน Checkout",
      });
    }

    const newPaymentStatus = isVerified ? "verified" : "rejected";
    const newBookingStatus = isVerified ? "approved" : "disapproved";

    const updateRes = await query(
      `UPDATE bookings
       SET payment_status = $1, status = $2
       WHERE id = $3
       RETURNING id, booking_no, user_id, room_id, organization_type, booking_date, time_slot, room_price, addons_price, total_price, status, payment_status`,
      [newPaymentStatus, newBookingStatus, bookingId]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบข้อมูลการจอง" });
    }

    const booking = updateRes.rows[0];

    // If verified, generate PDF permit and send via email
    if (isVerified) {
      try {
        const userRes = await query("SELECT email, firstname, lastname FROM users WHERE id = $1", [booking.user_id]);
        const roomRes = await query("SELECT name, location FROM rooms WHERE id = $1", [booking.room_id]);

        const user = userRes.rows[0] || {};
        const room = roomRes.rows[0] || {};

        const pdfBuffer = await generateBookingPDFReceipt({
          bookingNo: booking.booking_no,
          userName: `${user.firstname || "ผู้ใช้"} ${user.lastname || ""}`.trim(),
          userEmail: user.email || "",
          organizationType: booking.organization_type || "internal",
          roomName: room.name || "พื้นที่อเนกประสงค์",
          location: room.location,
          bookingDate: String(booking.booking_date).match(/^(\d{4}-\d{2}-\d{2})/)?.[1]
            || String(booking.booking_date).split("T")[0],
          timeSlot: booking.time_slot,
          roomPrice: Number(booking.room_price || 0),
          addonsPrice: Number(booking.addons_price || 0),
          totalPrice: Number(booking.total_price || 0),
          paymentStatus: "verified",
          paidAt: new Date().toLocaleString("th-TH"),
        });

        if (user.email) {
          await sendPaymentApprovedWithPermitEmail(
            user.email,
            booking.booking_no,
            room.name || "พื้นที่จอง",
            pdfBuffer
          );
        }
      } catch (pdfErr) {
        console.error("[payment/verify] PDF generation/email error:", pdfErr);
      }
    }

    await createNotification({
      userId: Number(booking.user_id),
      type: "booking_status",
      title: isVerified ? "ยืนยันการชำระเงินแล้ว" : "ปฏิเสธการชำระเงิน",
      body: isVerified
        ? `รายการ ${booking.booking_no} ชำระเงินสำเร็จ — ตรวจสอบใบอนุญาตในอีเมล`
        : `รายการ ${booking.booking_no} การชำระเงินไม่ผ่าน${remark ? `: ${remark}` : ""}`,
      link: "/dashboard",
    });

    await logAdminAction(
      adminNameFromReq(req),
      isVerified ? "ยืนยันการชำระเงิน" : "ปฏิเสธการชำระเงิน",
      isVerified
        ? `เปลี่ยนจาก「รอชำระเงิน」เป็น「ชำระเงินแล้ว」 (รายการ ${booking.booking_no})${remark ? ` | ${remark}` : ""}`
        : `ปฏิเสธการชำระเงินของรายการ ${booking.booking_no}${remark ? ` | ${remark}` : ""}`,
      Number(bookingId)
    );

    res.json({
      message: isVerified ? "ยืนยันการชำระเงินเรียบร้อยแล้ว และส่งเอกสารใบอนุญาตเข้าอีเมลผู้ใช้แล้ว" : "ปฏิเสธการชำระเงินเรียบร้อยแล้ว",
      booking,
    });
  } catch (err: any) {
    console.error("[payment/verify] Error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการตรวจสอบการชำระเงิน" });
  }
});


export default router;
