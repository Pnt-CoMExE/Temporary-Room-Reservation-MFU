import { Router, Response } from "express";
import { query } from "../../../db";
import { verifyToken, verifyAdmin } from "../../middleware/auth";

const router = Router();

// GET /api/admin/users — list all users with booking stats
router.get("/", verifyToken, verifyAdmin, async (_req: any, res: Response) => {
  try {
    const result = await query(`
      SELECT
        u.id,
        u.firstname,
        u.lastname,
        u.email,
        u.user_type,
        u.profile_picture,
        u.created_at,
        COALESCE(b.total_bookings, 0) AS total_bookings,
        COALESCE(b.approved_bookings, 0) AS approved_bookings
      FROM users u
      LEFT JOIN (
        SELECT
          user_id,
          COUNT(*) AS total_bookings,
          COUNT(*) FILTER (WHERE status = 'approved') AS approved_bookings
        FROM bookings
        GROUP BY user_id
      ) b ON u.id = b.user_id
      ORDER BY u.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("[admin/users] Error fetching users:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้" });
  }
});

// PUT /api/admin/users/:id/role — update user role
router.put("/:id/role", verifyToken, verifyAdmin, async (req: any, res: Response) => {
  const { id } = req.params;
  const { userType } = req.body;
  const validRoles = ["admin", "internal", "co_op", "external"];
  if (!validRoles.includes(userType)) {
    return res.status(400).json({ message: "ประเภทผู้ใช้ไม่ถูกต้อง" });
  }
  try {
    await query("UPDATE users SET user_type = $1 WHERE id = $2", [userType, id]);
    res.json({ message: "อัปเดต Role สำเร็จ" });
  } catch (err) {
    console.error("[admin/users] Error updating role:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดต Role" });
  }
});

export default router;
