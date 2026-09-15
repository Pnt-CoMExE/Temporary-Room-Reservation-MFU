import { Router, Response } from "express";
import { query } from "../../db";
import { verifyToken } from "../middleware/auth";
import { validateUpdateProfile, validateFeedback } from "../middleware/validate";
import { createNotification } from "../services/notification.service";

const router = Router();

function jwtUserId(req: any): number {
  return Number(req.user?.userId);
}

function jwtEmail(req: any): string {
  return String(req.user?.email || "").trim().toLowerCase();
}

function formatRelativeTh(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "เมื่อสักครู่";
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} วันที่แล้ว`;
  return date.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
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

// GET /api/user/notifications — recent notifications for JWT user
router.get("/notifications", verifyToken, async (req: any, res: Response) => {
  const userId = jwtUserId(req);
  if (!Number.isFinite(userId)) {
    return res.status(401).json({ message: "กรุณาเข้าสู่ระบบ" });
  }
  try {
    const result = await query(
      `SELECT id, type, title, body, link, is_read, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    );
    res.json(
      result.rows.map((n: any) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        desc: n.body,
        link: n.link || "/dashboard",
        read: !!n.is_read,
        time: formatRelativeTh(new Date(n.created_at)),
        createdAt: n.created_at,
      }))
    );
  } catch (err) {
    console.error("[user] Error fetching notifications:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงการแจ้งเตือน" });
  }
});

// PUT /api/user/notifications/read-all
router.put("/notifications/read-all", verifyToken, async (req: any, res: Response) => {
  const userId = jwtUserId(req);
  try {
    await query(
      "UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE",
      [userId]
    );
    res.json({ message: "อ่านทั้งหมดแล้ว" });
  } catch (err) {
    console.error("[user] Error marking notifications read:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

// PUT /api/user/notifications/:id/read
router.put("/notifications/:id/read", verifyToken, async (req: any, res: Response) => {
  const userId = jwtUserId(req);
  const { id } = req.params;
  try {
    const result = await query(
      `UPDATE notifications SET is_read = TRUE
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบการแจ้งเตือน" });
    }
    res.json({ message: "อ่านแล้ว" });
  } catch (err) {
    console.error("[user] Error marking notification read:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
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
      `SELECT b.*,
              to_char(b.booking_date, 'YYYY-MM-DD') AS booking_date,
              r.name as room_name, r.location as room_location, r.image_url as room_image,
              EXISTS(SELECT 1 FROM feedbacks f WHERE f.booking_id = b.id) as has_feedback,
              TRIM(CONCAT(COALESCE(admin_u.firstname, ''), ' ', COALESCE(admin_u.lastname, ''))) AS admin_name,
              COALESCE((
                SELECT json_agg(json_build_object(
                  'id', a.id,
                  'name', a.name,
                  'quantity', ba.quantity,
                  'unitPrice', ba.unit_price,
                  'totalPrice', ba.total_price,
                  'unitName', a.unit_name
                ) ORDER BY a.name)
                FROM booking_addons ba
                JOIN addons a ON a.id = ba.addon_id
                WHERE ba.booking_id = b.id
              ), '[]'::json) AS addons
       FROM bookings b
       JOIN rooms r ON b.room_id = r.id
       LEFT JOIN users admin_u ON b.approved_by = admin_u.id
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
      "SELECT id, booking_no FROM bookings WHERE id = $1 AND user_id = $2 AND status = 'pending'",
      [id, userId]
    );
    if (check.rows.length === 0) {
      return res
        .status(400)
        .json({ message: "ไม่พบการจอง หรือไม่สามารถยกเลิกได้ในขณะนี้" });
    }
    await query("UPDATE bookings SET status = 'ยกเลิกแล้ว', updated_at = NOW() WHERE id = $1", [id]);
    await createNotification({
      userId,
      type: "booking_status",
      title: "ยกเลิกการจองแล้ว",
      body: `คำขอ ${check.rows[0].booking_no} ถูกยกเลิกเรียบร้อย`,
      link: "/dashboard",
    });
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
