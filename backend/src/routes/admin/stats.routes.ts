import { Router, Response } from "express";
import { query } from "../../../db";
import { verifyToken, verifyAdmin } from "../../middleware/auth";
import {
  getRevenueByMonth,
  getRevenueInRange,
  getRevenueByYearInRange,
} from "../../services/revenue.service";

const router = Router();

function parseDateParam(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const d = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
  return d;
}

// GET /api/admin/stats — dashboard statistics
// ?from=&to= YYYY-MM-DD | ?scope=all (all-time, no date filter)
router.get("/", verifyToken, verifyAdmin, async (req: any, res: Response) => {
  try {
    const from = parseDateParam(req.query.from);
    const to = parseDateParam(req.query.to);
    const scopeAll =
      String(req.query.scope || "").toLowerCase() === "all" ||
      req.query.all === "1" ||
      req.query.all === "true";
    const hasRange = Boolean(from && to) && !scopeAll;

    const effectiveFrom = scopeAll
      ? null
      : hasRange
        ? from
        : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            .toISOString()
            .slice(0, 10);
    const effectiveTo = scopeAll
      ? null
      : hasRange
        ? to
        : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
            .toISOString()
            .slice(0, 10);

    const dateFilterBookings = scopeAll
      ? ""
      : `AND booking_date::date BETWEEN $1::date AND $2::date`;
    const dateFilterCreated = scopeAll
      ? ""
      : `AND created_at::date BETWEEN $1::date AND $2::date`;
    const params = scopeAll ? [] : [effectiveFrom, effectiveTo];

    const pendingCount = await query(
      `SELECT COUNT(*) FROM bookings WHERE status = 'pending' ${dateFilterBookings}`,
      params
    );
    const approvedCount = await query(
      `SELECT COUNT(*) FROM bookings
       WHERE status IN ('approved_pending_payment', 'approved_paid', 'approved_waived', 'approved', 'completed')
       ${dateFilterBookings}`,
      params
    );
    const paidCount = await query(
      `SELECT COUNT(*) FROM bookings WHERE status IN ('approved_paid', 'approved_waived', 'completed') ${dateFilterBookings}`,
      params
    );
    const revenue = await query(
      `SELECT COALESCE(SUM(total_price), 0) AS sum FROM bookings
       WHERE status IN ('approved_paid', 'completed') ${dateFilterCreated}`,
      params
    );

    let approvedToday = 0;
    if (!hasRange && !scopeAll) {
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
      approvedToday: hasRange || scopeAll
        ? parseInt(approvedCount.rows[0].count as string, 10)
        : approvedToday,
      currentMonthRevenue: rangeRevenue,
      rangeRevenue,
      from: effectiveFrom,
      to: effectiveTo,
      filtered: hasRange || scopeAll,
      scope: scopeAll ? "all" : hasRange ? "range" : "latest",
    });
  } catch (err) {
    console.error("[admin/stats] Error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงสถิติ" });
  }
});

// GET /api/admin/stats/export.xlsx — Excel report for current filter (Excel only)
router.get("/export.xlsx", verifyToken, verifyAdmin, async (req: any, res: Response) => {
  try {
    const ExcelJS = (await import("exceljs")).default;
    const from = parseDateParam(req.query.from);
    const to = parseDateParam(req.query.to);
    const scopeAll =
      String(req.query.scope || "").toLowerCase() === "all" ||
      req.query.all === "1" ||
      req.query.all === "true";
    const hasRange = Boolean(from && to) && !scopeAll;
    const effectiveFrom = scopeAll
      ? null
      : hasRange
        ? from
        : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            .toISOString()
            .slice(0, 10);
    const effectiveTo = scopeAll
      ? null
      : hasRange
        ? to
        : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
            .toISOString()
            .slice(0, 10);
    const dateFilter = scopeAll
      ? ""
      : `AND b.booking_date::date BETWEEN $1::date AND $2::date`;
    const params = scopeAll ? [] : [effectiveFrom, effectiveTo];

    const bookingsRes = await query(
      `SELECT b.booking_no, b.booking_date, b.time_slot, b.status,
              b.organization_type, b.room_price, b.addons_price, b.total_price,
              b.objective, r.name AS room_name,
              TRIM(CONCAT(u.firstname, ' ', u.lastname)) AS renter_name,
              u.email
       FROM bookings b
       JOIN rooms r ON r.id = b.room_id
       JOIN users u ON u.id = b.user_id
       WHERE 1=1 ${dateFilter}
       ORDER BY b.booking_date DESC, b.id DESC`,
      params
    );

    const roomUtilRes = await query(
      `SELECT r.name AS room_name, COUNT(*)::int AS booking_count,
              COALESCE(SUM(CASE WHEN b.status IN ('approved_paid','approved_waived','completed') THEN b.total_price ELSE 0 END), 0) AS revenue
       FROM bookings b
       JOIN rooms r ON r.id = b.room_id
       WHERE b.status NOT IN ('disapproved', 'ยกเลิกแล้ว', 'cancelled')
       ${dateFilter}
       GROUP BY r.name
       ORDER BY booking_count DESC`,
      params
    );

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "MFU Space Reservation";
    const summary = workbook.addWorksheet("สรุป");
    summary.addRow(["รายงานสรุปการจองพื้นที่", "MFU Temporary Space"]);
    summary.addRow([
      "ช่วงวันที่",
      scopeAll ? "ทั้งหมด" : `${effectiveFrom} — ${effectiveTo}`,
    ]);
    summary.addRow(["จำนวนรายการ", bookingsRes.rows.length]);
    summary.addRow([
      "รายได้ (ชำระแล้ว/ยกเว้นไม่นับเงิน)",
      bookingsRes.rows
        .filter((r: any) =>
          ["approved_paid", "completed"].includes(String(r.status))
        )
        .reduce((s: number, r: any) => s + Number(r.total_price || 0), 0),
    ]);
    summary.addRow([]);
    summary.addRow(["ห้อง", "จำนวนจอง", "รายได้"]);
    roomUtilRes.rows.forEach((r: any) => {
      summary.addRow([r.room_name, r.booking_count, Number(r.revenue)]);
    });

    const sheet = workbook.addWorksheet("รายการจอง");
    sheet.addRow([
      "รหัสจอง",
      "วันที่",
      "ช่วงเวลา",
      "ห้อง",
      "ผู้จอง",
      "อีเมล",
      "เรท",
      "สถานะ",
      "ค่าห้อง",
      "ค่าแอดออน",
      "รวม",
      "วัตถุประสงค์",
    ]);
    sheet.getRow(1).font = { bold: true };
    bookingsRes.rows.forEach((r: any) => {
      sheet.addRow([
        r.booking_no,
        r.booking_date,
        r.time_slot,
        r.room_name,
        r.renter_name,
        r.email,
        r.organization_type,
        r.status,
        Number(r.room_price || 0),
        Number(r.addons_price || 0),
        Number(r.total_price || 0),
        r.objective || "",
      ]);
    });

    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="mfu-booking-report-${stamp}.xlsx"`
    );
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("[admin/stats/export.xlsx] Error:", err);
    res.status(500).json({ message: "ส่งออกรายงานไม่สำเร็จ" });
  }
});

// GET /api/admin/stats/revenue — ?year=2026 | ?from=&to= | ?group=year
router.get("/revenue", verifyToken, verifyAdmin, async (req: any, res: Response) => {
  try {
    const year = req.query.year ? Number(req.query.year) : undefined;
    const from = parseDateParam(req.query.from);
    const to = parseDateParam(req.query.to);
    const groupYear = String(req.query.group || "").toLowerCase() === "year";
    if (from && to) {
      const data = groupYear
        ? await getRevenueByYearInRange(from, to)
        : await getRevenueInRange(from, to);
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
