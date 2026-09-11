import { query } from "../../db";

export interface RevenueItem {
  label: string;
  revenue: number;
}

/** Monthly revenue — default last 6 months, or all months in `year` */
export async function getRevenueByMonth(year?: number): Promise<RevenueItem[]> {
  if (year && Number.isFinite(year)) {
    const result = await query(
      `
      SELECT
        TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') AS month_label,
        DATE_TRUNC('month', created_at) AS month_date,
        COALESCE(SUM(total_price), 0) AS revenue
      FROM bookings
      WHERE status = 'approved_paid'
        AND EXTRACT(YEAR FROM created_at) = $1
      GROUP BY month_date, month_label
      ORDER BY month_date ASC
    `,
      [year]
    );
    return result.rows.map((r: any) => ({
      label: r.month_label,
      revenue: parseFloat(String(r.revenue).replace(/,/g, "")),
    }));
  }

  const result = await query(`
    SELECT
      TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') AS month_label,
      DATE_TRUNC('month', created_at) AS month_date,
      COALESCE(SUM(total_price), 0) AS revenue
    FROM bookings
    WHERE status = 'approved_paid'
      AND created_at >= DATE_TRUNC('month', NOW()) - INTERVAL '5 months'
    GROUP BY month_date, month_label
    ORDER BY month_date ASC
  `);
  return result.rows.map((r: any) => ({
    label: r.month_label,
    revenue: parseFloat(String(r.revenue).replace(/,/g, "")),
  }));
}

/** Revenue grouped by month within an inclusive date range (on created_at) */
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
    WHERE status = 'approved_paid'
      AND created_at::date BETWEEN $1::date AND $2::date
    GROUP BY month_date, month_label
    ORDER BY month_date ASC
  `,
    [from, to]
  );
  return result.rows.map((r: any) => ({
    label: r.month_label,
    revenue: parseFloat(String(r.revenue).replace(/,/g, "")),
  }));
}
