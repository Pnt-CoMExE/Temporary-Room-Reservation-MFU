import { Router, Response } from "express";
import { query } from "../../../db";
import { verifyToken, verifyAdmin } from "../../middleware/auth";

const router = Router();

// GET /api/admin/logs — get recent activity logs
router.get("/", verifyToken, verifyAdmin, async (_req: any, res: Response) => {
  try {
    const result = await query(
      "SELECT * FROM admin_activity_logs ORDER BY created_at DESC LIMIT 100"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("[admin/logs] Error fetching logs:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล Log" });
  }
});

// POST /api/admin/logs — create an activity log (admin only; prefer server-side auditLog.service)
router.post("/", verifyToken, verifyAdmin, async (req: any, res: Response) => {
  const { adminName, action, details } = req.body;
  try {
    const result = await query(
      "INSERT INTO admin_activity_logs (admin_name, action, details) VALUES ($1, $2, $3) RETURNING *",
      [adminName || "System Admin", action, details]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("[admin/logs] Error creating log:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการบันทึก Log" });
  }
});

export default router;
