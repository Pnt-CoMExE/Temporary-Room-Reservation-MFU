import { Router, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { query } from "../../db";
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

    const bookingRes = await query(
      "SELECT id, booking_no, total_price, status FROM bookings WHERE id = $1",
      [bookingId]
    );

    if (bookingRes.rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบข้อมูลการจอง" });
    }

    const booking = bookingRes.rows[0];

    const session = await paymentGateway.createPaymentSession({
      bookingId: booking.id,
      bookingNo: booking.booking_no,
      amount: Number(booking.total_price),
      customerEmail: req.user?.email,
      customerName: req.user?.firstname ? `${req.user.firstname} ${req.user.lastname || ""}`.trim() : undefined,
    });

    res.json(session);
  } catch (err: any) {
    console.error("[payment/checkout] Error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการสร้างรายการชำระเงิน" });
  }
});

/**
 * POST /api/payment/webhook/:provider
 * Webhook handler for external payment gateways (Opn, SCB, KBank, KTB, Mock Sandbox)
 */
router.post("/webhook/:provider", async (req: any, res: Response) => {
  try {
    const providerId = req.params.provider;
    const result = await paymentGateway.handleWebhook(providerId, req.body, req.headers);

    if (result.success && result.bookingNo && result.status === "verified") {
      await query(
        `UPDATE bookings
         SET payment_status = 'verified', status = 'approved'
         WHERE booking_no = $1`,
        [result.bookingNo]
      );
    }

    res.json({
      received: true,
      result,
    });
  } catch (err: any) {
    console.error(`[payment/webhook/${req.params.provider}] Error:`, err);
    res.status(500).json({ message: "Webhook processing error" });
  }
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

    const bookingRes = await query(
      "SELECT id, booking_no, total_price, status FROM bookings WHERE id = $1",
      [bookingId]
    );

    if (bookingRes.rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบข้อมูลการจอง" });
    }

    const booking = bookingRes.rows[0];
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

      const slipUrl = `/uploads/${req.file.filename}`;

      const updateRes = await query(
        `UPDATE bookings
         SET payment_slip_url = $1, payment_status = 'pending_verification'
         WHERE id = $2
         RETURNING id, booking_no, payment_status`,
        [slipUrl, bookingId]
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
          bookingDate: String(booking.booking_date).split("T")[0],
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

    await logAdminAction(
      adminNameFromReq(req),
      isVerified ? "ยืนยันการชำระเงิน" : "ปฏิเสธการชำระเงิน",
      `Booking #${bookingId} (${booking.booking_no})${remark ? ` | ${remark}` : ""}`
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
