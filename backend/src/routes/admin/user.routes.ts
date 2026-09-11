import { Router, Response } from "express";
import { query } from "../../../db";
import { verifyToken, verifyAdmin } from "../../middleware/auth";
import { adminNameFromReq, logAdminAction } from "../../services/auditLog.service";

const router = Router();

// GET /api/admin/users — list users with booking stats (stats-first)
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
        COALESCE(u.is_active, TRUE) AS is_active,
        u.created_at,
        COALESCE(b.total_bookings, 0) AS total_bookings,
        COALESCE(b.approved_bookings, 0) AS approved_bookings,
        COALESCE(b.paid_bookings, 0) AS paid_bookings
      FROM users u
      LEFT JOIN (
        SELECT
          user_id,
          COUNT(*) AS total_bookings,
          COUNT(*) FILTER (
            WHERE status IN ('approved_pending_payment', 'approved_paid', 'approved')
          ) AS approved_bookings,
          COUNT(*) FILTER (WHERE status = 'approved_paid') AS paid_bookings
        FROM bookings
        GROUP BY user_id
      ) b ON u.id = b.user_id
      ORDER BY COALESCE(b.total_bookings, 0) DESC, u.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("[admin/users] Error fetching users:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้" });
  }
});

// PUT /api/admin/users/:id/active — enable / disable account (admin management)
router.put("/:id/active", verifyToken, verifyAdmin, async (req: any, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;
  if (typeof isActive !== "boolean") {
    return res.status(400).json({ message: "กรุณาระบุ isActive เป็น boolean" });
  }
  if (Number(id) === Number(req.user?.userId)) {
    return res.status(400).json({ message: "ไม่สามารถปิดใช้งานบัญชีของตนเองได้" });
  }
  try {
    const result = await query(
      "UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id, email, is_active, user_type",
      [isActive, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้" });
    }
    const row = result.rows[0];
    await logAdminAction(
      adminNameFromReq(req),
      isActive ? `เปิดใช้งานผู้ใช้ #${id}` : `ปิดใช้งานผู้ใช้ #${id}`,
      `${row.email} (${row.user_type})`
    );
    res.json({
      message: isActive ? "เปิดใช้งานบัญชีสำเร็จ" : "ปิดใช้งานบัญชีสำเร็จ",
      user: row,
    });
  } catch (err) {
    console.error("[admin/users] Error updating active:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดตสถานะบัญชี" });
  }
});

// PUT /api/admin/users/:id/role — limited: promote/demote admin only
router.put("/:id/role", verifyToken, verifyAdmin, async (req: any, res: Response) => {
  const { id } = req.params;
  const { userType } = req.body;
  // Recording 3: role change is secondary — only admin promote/demote via UI
  const validRoles = ["admin", "internal"];
  if (!validRoles.includes(userType)) {
    return res.status(400).json({
      message: "อนุญาตเฉพาะการตั้งเป็น admin หรือคืนเป็น internal",
    });
  }
  try {
    const existing = await query("SELECT id, email, user_type FROM users WHERE id = $1", [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้" });
    }
    await query("UPDATE users SET user_type = $1 WHERE id = $2", [userType, id]);
    await logAdminAction(
      adminNameFromReq(req),
      `เปลี่ยน Role ผู้ใช้ #${id}`,
      `${existing.rows[0].email}: ${existing.rows[0].user_type} → ${userType}`
    );
    res.json({ message: "อัปเดต Role สำเร็จ" });
  } catch (err) {
    console.error("[admin/users] Error updating role:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดต Role" });
  }
});

export default router;
