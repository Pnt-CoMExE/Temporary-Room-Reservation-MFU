import { Router, Request, Response } from "express";
import { query } from "../../db";
import { verifyToken } from "../middleware/auth";
import { validateUpdateProfile, validateFeedback } from "../middleware/validate";

const router = Router();

// GET /api/user/profile — get user profile by email
router.get("/profile", verifyToken, async (req: Request, res: Response) => {
  const { email } = req.query;
  try {
    const result = await query(
      "SELECT firstname, lastname, phone_number, profile_picture FROM users WHERE email = $1",
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้งาน" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("[user] Error fetching profile:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

// PUT /api/user/profile — update user profile
router.put("/profile", verifyToken, ...validateUpdateProfile, async (req: Request, res: Response) => {
  const { email, firstname, lastname, phone_number } = req.body;
  try {
    await query(
      "UPDATE users SET firstname = $1, lastname = $2, phone_number = $3 WHERE email = $4",
      [firstname, lastname, phone_number, email]
    );
    res.json({ message: "อัปเดตข้อมูลสำเร็จ" });
  } catch (err) {
    console.error("[user] Error updating profile:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" });
  }
});

// GET /api/user/bookings/:userId — get user's bookings
router.get("/bookings/:userId", verifyToken, async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const result = await query(
      `SELECT b.*, r.name as room_name, r.location as room_location, r.image_url as room_image,
              EXISTS(SELECT 1 FROM feedbacks f WHERE f.booking_id = b.id) as has_feedback
       FROM bookings b
       JOIN rooms r ON b.room_id = r.id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("[user] Error fetching user bookings:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลการจอง" });
  }
});

// PUT /api/user/bookings/:id/cancel — cancel a pending booking
router.put("/bookings/:id/cancel", verifyToken, async (req: any, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;
  try {
    const check = await query(
      "SELECT id FROM bookings WHERE id = $1 AND user_id = $2 AND status = 'pending'",
      [id, userId]
    );
    if (check.rows.length === 0) {
      return res
        .status(400)
        .json({ message: "ไม่พบการจอง หรือไม่สามารถยกเลิกได้ในขณะนี้" });
    }
    await query("UPDATE bookings SET status = 'ยกเลิกแล้ว', updated_at = NOW() WHERE id = $1", [id]);
    res.json({ message: "ยกเลิกการจองสำเร็จ" });
  } catch (err) {
    console.error("[user] Error cancelling booking:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการยกเลิกการจอง" });
  }
});

// POST /api/user/feedback — submit feedback for a booking
router.post("/feedback", verifyToken, ...validateFeedback, async (req: Request, res: Response) => {
  const { bookingId, rating, comment } = req.body;
  try {
    await query(
      "INSERT INTO feedbacks (booking_id, rating, comment) VALUES ($1, $2, $3)",
      [bookingId, rating, comment]
    );
    res.status(201).json({ message: "บันทึกรีวิวสำเร็จ" });
  } catch (err) {
    console.error("[user] Error submitting feedback:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการบันทึกรีวิว" });
  }
});

export default router;
