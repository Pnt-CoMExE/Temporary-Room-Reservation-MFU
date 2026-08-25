import { Router, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { query } from "../../db";
import { verifyToken, verifyAdmin } from "../middleware/auth";
import { generatePromptPayPayload } from "../services/promptpay.service";

const router = Router();

// Storage setup for payment slips
const uploadsDir = path.join(__dirname, "..", "..", "..", "uploads");
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
       RETURNING id, booking_no, status, payment_status`,
      [newPaymentStatus, newBookingStatus, bookingId]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบข้อมูลการจอง" });
    }

    res.json({
      message: isVerified ? "ยืนยันการชำระเงินเรียบร้อยแล้ว" : "ปฏิเสธการชำระเงินเรียบร้อยแล้ว",
      booking: updateRes.rows[0],
    });
  } catch (err: any) {
    console.error("[payment/verify] Error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการตรวจสอบการชำระเงิน" });
  }
});

export default router;
