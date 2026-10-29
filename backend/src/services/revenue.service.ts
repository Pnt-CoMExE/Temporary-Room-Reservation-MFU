import { query } from "../../db";

export interface RevenueItem {
  label: string;
  revenue: number;
}

const MONTH_EN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** Always 12 bars for a calendar year (missing months = 0) */
function fillYearMonths(
  year: number,
  rows: { monthNum: number; revenue: number }[]
): RevenueItem[] {
  const map = new Map(rows.map((r) => [r.monthNum, r.revenue]));
  return MONTH_EN.map((lab, i) => ({
    label: `${lab} ${year}`,
    revenue: map.get(i + 1) || 0,
  }));
}

/** Monthly revenue — default last 12 months, or all 12 months in `year` */
export async function getRevenueByMonth(year?: number): Promise<RevenueItem[]> {
  if (year && Number.isFinite(year)) {
    const result = await query(
      `
      SELECT
        EXTRACT(MONTH FROM DATE_TRUNC('month', created_at))::int AS month_num,
        COALESCE(SUM(total_price), 0) AS revenue
      FROM bookings
      WHERE status IN ('approved_paid', 'completed')
        AND EXTRACT(YEAR FROM created_at) = $1
      GROUP BY month_num
      ORDER BY month_num ASC
    `,
      [year]
    );
    return fillYearMonths(
      year,
      result.rows.map((r: any) => ({
        monthNum: Number(r.month_num),
        revenue: parseFloat(String(r.revenue).replace(/,/g, "")),
      }))
    );
  }

  const result = await query(`
    SELECT
      TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') AS month_label,
      DATE_TRUNC('month', created_at) AS month_date,
      COALESCE(SUM(total_price), 0) AS revenue
    FROM bookings
    WHERE status IN ('approved_paid', 'completed')
      AND created_at >= DATE_TRUNC('month', NOW()) - INTERVAL '11 months'
    GROUP BY month_date, month_label
    ORDER BY month_date ASC
  `);
  return result.rows.map((r: any) => ({
    label: r.month_label,
    revenue: parseFloat(String(r.revenue).replace(/,/g, "")),
  }));
}

/** Yearly revenue within inclusive date range (one bar per calendar year) */
export async function getRevenueByYearInRange(
  from: string,
  to: string
): Promise<RevenueItem[]> {
  const result = await query(
    `
    SELECT
      TO_CHAR(DATE_TRUNC('year', created_at), 'YYYY') AS year_label,
      DATE_TRUNC('year', created_at) AS year_date,
      COALESCE(SUM(total_price), 0) AS revenue
    FROM bookings
    WHERE status IN ('approved_paid', 'completed')
      AND created_at::date BETWEEN $1::date AND $2::date
    GROUP BY year_date, year_label
    ORDER BY year_date ASC
  `,
    [from, to]
  );
  return result.rows.map((r: any) => ({
    label: r.year_label,
    revenue: parseFloat(String(r.revenue).replace(/,/g, "")),
  }));
}

/**
 * Revenue in range — monthly bars, auto-switch to yearly when month bars > 12
 */
export async function getRevenueInRange(
  from: string,
  to: string
): Promise<RevenueItem[]> {
  const result = await query(
    `
    SELECT
      TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') AS month_label,
      DATE_TRUNC('month', created_at) AS month_date,
      COALESCE(SUM(total_price), 0) AS revenue
    FROM bookings
    WHERE status IN ('approved_paid', 'completed')
      AND created_at::date BETWEEN $1::date AND $2::date
    GROUP BY month_date, month_label
    ORDER BY month_date ASC
  `,
    [from, to]
  );
  const monthly = result.rows.map((r: any) => ({
    label: r.month_label,
    revenue: parseFloat(String(r.revenue).replace(/,/g, "")),
    monthDate: r.month_date as Date,
  }));
  if (monthly.length > 12) {
    return getRevenueByYearInRange(from, to);
  }

  // Single calendar year range → always return 12 month bars
  const fromY = Number(String(from).slice(0, 4));
  const toY = Number(String(to).slice(0, 4));
  if (
    Number.isFinite(fromY) &&
    fromY === toY &&
    String(from).endsWith("-01-01") &&
    String(to).endsWith("-12-31")
  ) {
    return fillYearMonths(
      fromY,
      monthly.map((r) => ({
        monthNum: new Date(r.monthDate).getUTCMonth() + 1,
        revenue: r.revenue,
      }))
    );
  }

  return monthly.map(({ label, revenue }) => ({ label, revenue }));
}
