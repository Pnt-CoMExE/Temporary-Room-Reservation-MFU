import { query } from "../../db";

export interface RevenueItem {
  label: string;
  revenue: number;
}

export async function getRevenueByMonth(): Promise<RevenueItem[]> {
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
    revenue: parseFloat(String(r.revenue).replace(/,/g, '')),
  }));
}
