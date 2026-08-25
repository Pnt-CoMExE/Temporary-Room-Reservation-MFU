import { Router, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { query, pool } from "../../db";
import { verifyToken } from "../middleware/auth";
import { validateCreateBooking } from "../middleware/validate";
import { sendBookingSubmittedEmail } from "../services/email.service";

const router = Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => cb(null, uploadsDir),
  filename: (_req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "memo-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (_req: any, file: any, cb: any) => {
    if (file.fieldname === "memoDocument" && file.mimetype !== "application/pdf") {
      return cb(new Error("เฉพาะไฟล์ PDF เท่านั้น"), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

// POST /api/bookings — create a new booking
router.post(
  "/",
  verifyToken,
  upload.single("memoDocument"),
  ...validateCreateBooking,
  async (req: any, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ message: "กรุณาแนบหนังสือบันทึกข้อความ (ไฟล์ PDF)" });
    }

    const memoDocumentUrl = `/uploads/${req.file.filename}`;
    const {
      userId, roomId, userType, partnerName, bookingDate,
      timeSlot, objective, roomPrice, addonsPrice, totalPrice, addons, promoCode,
    } = req.body;

    let parsedAddons: any[] = [];
    if (addons) {
      try {
        parsedAddons = typeof addons === "string" ? JSON.parse(addons) : addons;
      } catch { /* ignore parse errors */ }
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      let conflictCondition = "";
      if (timeSlot === "full") {
        conflictCondition = "AND time_slot IN ('full', 'half_morning', 'half_afternoon')";
      } else if (timeSlot === "half_morning") {
        conflictCondition = "AND time_slot IN ('full', 'half_morning')";
      } else if (timeSlot === "half_afternoon") {
        conflictCondition = "AND time_slot IN ('full', 'half_afternoon')";
      }

      const checkOverlap = await client.query(
        `SELECT id FROM bookings
         WHERE room_id = $1 AND booking_date = $2
           AND status NOT IN ('disapproved', 'ยกเลิกแล้ว')
           ${conflictCondition}
         LIMIT 1`,
        [roomId, bookingDate]
      );

      if (checkOverlap.rows.length > 0) {
        await client.query("ROLLBACK");
        return res
          .status(400)
          .json({ message: "ไม่สามารถจองได้ เนื่องจากมีการจองในช่วงเวลาดังกล่าวแล้ว" });
      }

      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
      const bookingNo = `BK-${dateStr}-${randomStr}`;

      const bookingResult = await client.query(
        `INSERT INTO bookings (
          booking_no, user_id, room_id, organization_type, partner_name,
          booking_date, time_slot, objective, room_price, addons_price,
          total_price, status, memo_document_url, promo_code
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending', $12, $13)
        RETURNING id`,
        [bookingNo, userId, roomId, userType, partnerName, bookingDate,
         timeSlot, objective, roomPrice, addonsPrice, totalPrice, memoDocumentUrl, promoCode || null]
      );

      const bookingId = bookingResult.rows[0].id;

      if (parsedAddons.length > 0) {
        for (const item of parsedAddons) {
          if (item.quantity > 0) {
            await client.query(
              `INSERT INTO booking_addons (booking_id, addon_id, quantity, unit_price, total_price)
               VALUES ($1, $2, $3, $4, $5)`,
              [bookingId, item.addon_id, item.quantity, item.unit_price, item.total_price]
            );
          }
        }
      }

      await client.query("COMMIT");

      // Trigger email notification
      (async () => {
        try {
          const userRes = await query("SELECT email FROM users WHERE id = $1", [userId]);
          const roomRes = await query("SELECT name FROM rooms WHERE id = $1", [roomId]);
          const userEmail = userRes.rows[0]?.email || "user@mfu.ac.th";
          const roomName = roomRes.rows[0]?.name || "ห้องประชุม";
          await sendBookingSubmittedEmail(userEmail, bookingNo, roomName, String(bookingDate));
        } catch (e) {
          console.error("[bookings] Email dispatch error:", e);
        }
      })();

      res.status(201).json({ message: "ส่งคำขอจองสำเร็จ!", bookingId, bookingNo });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("[bookings] Error creating booking:", err);
      res.status(500).json({ message: "เกิดข้อผิดพลาดในการบันทึกการจอง" });
    } finally {
      client.release();
    }
  }
);

export default router;
