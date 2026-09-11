import { Router, Response } from "express";
import { query } from "../../../db";
import { verifyToken, verifyAdmin } from "../../middleware/auth";
import {
  getRevenueByMonth,
  getRevenueInRange,
} from "../../services/revenue.service";

const router = Router();

function parseDateParam(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const d = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
  return d;
}

// GET /api/admin/stats — dashboard statistics (optional ?from=&to= YYYY-MM-DD)
router.get("/", verifyToken, verifyAdmin, async (req: any, res: Response) => {
  try {
    const from = parseDateParam(req.query.from);
    const to = parseDateParam(req.query.to);
    const hasRange = Boolean(from && to);

    const dateFilterBookings = hasRange
      ? `AND booking_date::date BETWEEN $1::date AND $2::date`
      : "";
    const dateFilterCreated = hasRange
      ? `AND created_at::date BETWEEN $1::date AND $2::date`
      : "";
    const params = hasRange ? [from, to] : [];

    const pendingCount = await query(
      `SELECT COUNT(*) FROM bookings WHERE status = 'pending' ${dateFilterBookings}`,
      params
    );
    const approvedCount = await query(
      `SELECT COUNT(*) FROM bookings
       WHERE status IN ('approved_pending_payment', 'approved_paid', 'approved')
       ${dateFilterBookings}`,
      params
    );
    const paidCount = await query(
      `SELECT COUNT(*) FROM bookings WHERE status = 'approved_paid' ${dateFilterBookings}`,
      params
    );
    const revenue = await query(
      `SELECT COALESCE(SUM(total_price), 0) AS sum FROM bookings
       WHERE status = 'approved_paid' ${dateFilterCreated}`,
      params
    );

    // Keep approvedToday for backward compat when no range
    let approvedToday = 0;
    if (!hasRange) {
      const todayRes = await query(
        `SELECT COUNT(*) FROM bookings
         WHERE status LIKE 'approved%' AND DATE(COALESCE(approved_at, created_at)) = CURRENT_DATE`
      );
      approvedToday = parseInt(todayRes.rows[0].count as string, 10);
    }

    const rangeRevenue = parseFloat(String(revenue.rows[0].sum || "0"));

    res.json({
      pendingCount: parseInt(pendingCount.rows[0].count as string, 10),
      approvedCount: parseInt(approvedCount.rows[0].count as string, 10),
      paidCount: parseInt(paidCount.rows[0].count as string, 10),
      approvedToday: hasRange
        ? parseInt(approvedCount.rows[0].count as string, 10)
        : approvedToday,
      currentMonthRevenue: rangeRevenue,
      rangeRevenue,
      from: from || null,
      to: to || null,
    });
  } catch (err) {
    console.error("[admin/stats] Error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงสถิติ" });
  }
});

// GET /api/admin/stats/revenue — ?year=2026 optional
router.get("/revenue", verifyToken, verifyAdmin, async (req: any, res: Response) => {
  try {
    const year = req.query.year ? Number(req.query.year) : undefined;
    const from = parseDateParam(req.query.from);
    const to = parseDateParam(req.query.to);
    if (from && to) {
      const data = await getRevenueInRange(from, to);
      return res.json(data);
    }
    const data = await getRevenueByMonth(year);
    res.json(data);
  } catch (err) {
    console.error("[admin/stats/revenue] Error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลรายได้" });
  }
});

export default router;
