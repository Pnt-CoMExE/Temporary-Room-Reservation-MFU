import { Router, Response } from "express";
import { query } from "../../db";
import { verifyToken } from "../middleware/auth";
import { validateUpdateProfile, validateFeedback } from "../middleware/validate";

const router = Router();

function jwtUserId(req: any): number {
  return Number(req.user?.userId);
}

function jwtEmail(req: any): string {
  return String(req.user?.email || "").trim().toLowerCase();
}

// GET /api/user/profile — profile of the authenticated user only (JWT)
router.get("/profile", verifyToken, async (req: any, res: Response) => {
  const email = jwtEmail(req);
  if (!email) {
    return res.status(401).json({ message: "ไม่มีสิทธิ์เข้าถึง: กรุณาเข้าสู่ระบบ" });
  }
  try {
    const result = await query(
      "SELECT firstname, lastname, phone_number, profile_picture, email, user_type FROM users WHERE email = $1",
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

// PUT /api/user/profile — update own profile only (JWT email)
router.put("/profile", verifyToken, ...validateUpdateProfile, async (req: any, res: Response) => {
  const email = jwtEmail(req);
  if (!email) {
    return res.status(401).json({ message: "ไม่มีสิทธิ์เข้าถึง: กรุณาเข้าสู่ระบบ" });
  }
  const { firstname, lastname, phone_number } = req.body;
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

// GET /api/user/bookings/:userId — own bookings only
router.get("/bookings/:userId", verifyToken, async (req: any, res: Response) => {
  const requestedId = Number(req.params.userId);
  const tokenUserId = jwtUserId(req);

  if (!Number.isFinite(requestedId) || requestedId !== tokenUserId) {
    return res.status(403).json({ message: "ไม่มีสิทธิ์เข้าถึงข้อมูลการจองของผู้ใช้อื่น" });
  }

  try {
    const result = await query(
      `SELECT b.*, r.name as room_name, r.location as room_location, r.image_url as room_image,
              EXISTS(SELECT 1 FROM feedbacks f WHERE f.booking_id = b.id) as has_feedback
       FROM bookings b
       JOIN rooms r ON b.room_id = r.id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [tokenUserId]
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
  const userId = jwtUserId(req);
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

// POST /api/user/feedback — only for own bookings
router.post("/feedback", verifyToken, ...validateFeedback, async (req: any, res: Response) => {
  const { bookingId, rating, comment } = req.body;
  const userId = jwtUserId(req);
  try {
    const ownership = await query(
      "SELECT id FROM bookings WHERE id = $1 AND user_id = $2",
      [bookingId, userId]
    );
    if (ownership.rows.length === 0) {
      return res.status(403).json({ message: "ไม่มีสิทธิ์รีวิวการจองนี้" });
    }

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
