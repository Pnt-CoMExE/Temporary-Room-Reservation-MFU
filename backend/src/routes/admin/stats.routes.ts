import { Router, Response } from "express";
import { query } from "../../../db";
import { verifyToken, verifyAdmin } from "../../middleware/auth";
import { getRevenueByMonth } from "../../services/revenue.service";

const router = Router();

// GET /api/admin/stats — dashboard statistics
router.get("/", verifyToken, verifyAdmin, async (_req: any, res: Response) => {
  try {
    const pendingCount = await query(
      "SELECT COUNT(*) FROM bookings WHERE status = 'pending'"
    );
    const approvedToday = await query(
      "SELECT COUNT(*) FROM bookings WHERE status LIKE 'approved%' AND DATE(approved_at) = CURRENT_DATE"
    );
    const revenueMonth = await query(
      "SELECT SUM(total_price) FROM bookings WHERE status = 'approved_paid' AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)"
    );

    res.json({
      pendingCount: parseInt(pendingCount.rows[0].count as string),
      approvedToday: parseInt(approvedToday.rows[0].count as string),
      currentMonthRevenue: parseFloat(revenueMonth.rows[0].sum as string || "0"),
    });
  } catch (err) {
    console.error("[admin/stats] Error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงสถิติ" });
  }
});

// GET /api/admin/stats/revenue — revenue chart data
router.get("/revenue", verifyToken, verifyAdmin, async (_req: any, res: Response) => {
  try {
    const data = await getRevenueByMonth();
    res.json(data);
  } catch (err) {
    console.error("[admin/stats/revenue] Error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลรายได้" });
  }
});

export default router;
