import { describe, it, expect, vi, beforeEach } from "vitest";
import { getRevenueByMonth } from "../revenue.service";

// Mock the entire db module
vi.mock("../../../db", () => ({
  query: vi.fn(),
}));

// Get the mocked query function for assertions
import { query } from "../../../db";
const mockQuery = query as ReturnType<typeof vi.fn>;

// ─── getRevenueByMonth ─────────────────────────────────
describe("getRevenueByMonth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ควรคืนรายการรายได้ 6 เดือนล่าสุดที่มีข้อมูล", async () => {
    mockQuery.mockResolvedValue({
      rows: [
        { month_label: "Dec 2025", month_date: "2025-12-01", revenue: "15000" },
        { month_label: "Jan 2026", month_date: "2026-01-01", revenue: "22000" },
        { month_label: "Feb 2026", month_date: "2026-02-01", revenue: "18500" },
        { month_label: "Mar 2026", month_date: "2026-03-01", revenue: "30000" },
        { month_label: "Apr 2026", month_date: "2026-04-01", revenue: "27500" },
        { month_label: "May 2026", month_date: "2026-05-01", revenue: "35000" },
      ],
    });

    const result = await getRevenueByMonth();

    expect(result).toHaveLength(6);
    expect(result[0]).toEqual({ label: "Dec 2025", revenue: 15000 });
    expect(result[1]).toEqual({ label: "Jan 2026", revenue: 22000 });
    expect(result[2]).toEqual({ label: "Feb 2026", revenue: 18500 });
    expect(result[3]).toEqual({ label: "Mar 2026", revenue: 30000 });
    expect(result[4]).toEqual({ label: "Apr 2026", revenue: 27500 });
    expect(result[5]).toEqual({ label: "May 2026", revenue: 35000 });
  });

  it("ควรคืน revenue เป็น float number (parseFloat)", async () => {
    mockQuery.mockResolvedValue({
      rows: [
        { month_label: "Jan 2026", month_date: "2026-01-01", revenue: "12345.67" },
      ],
    });

    const result = await getRevenueByMonth();

    expect(result[0].revenue).toBe(12345.67);
    expect(typeof result[0].revenue).toBe("number");
  });

  it("ควรคืน revenue = 0 เมื่อไม่มีรายได้ในเดือนนั้น (COALESCE)", async () => {
    mockQuery.mockResolvedValue({
      rows: [
        { month_label: "Jan 2026", month_date: "2026-01-01", revenue: "0" },
        { month_label: "Feb 2026", month_date: "2026-02-01", revenue: "0" },
      ],
    });

    const result = await getRevenueByMonth();

    expect(result[0].revenue).toBe(0);
    expect(result[1].revenue).toBe(0);
  });

  it("ควรเรียงลำดับตามเดือน (ASC)", async () => {
    mockQuery.mockResolvedValue({
      rows: [
        { month_label: "Jan 2026", month_date: "2026-01-01", revenue: "100" },
        { month_label: "Feb 2026", month_date: "2026-02-01", revenue: "200" },
        { month_label: "Mar 2026", month_date: "2026-03-01", revenue: "300" },
      ],
    });

    const result = await getRevenueByMonth();

    // ASC order should be Jan → Feb → Mar
    expect(result[0].label).toBe("Jan 2026");
    expect(result[1].label).toBe("Feb 2026");
    expect(result[2].label).toBe("Mar 2026");
  });

  it("ควรคืน empty array เมื่อไม่มีข้อมูล bookings ที่ status approved_paid", async () => {
    mockQuery.mockResolvedValue({ rows: [] });

    const result = await getRevenueByMonth();

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it("ควรส่ง query SQL ไปยัง database ด้วย parameter ที่ถูกต้อง", async () => {
    mockQuery.mockResolvedValue({ rows: [] });

    await getRevenueByMonth();

    // Verify query was called exactly once
    expect(mockQuery).toHaveBeenCalledTimes(1);

    // Verify the SQL contains key parts
    const sql = mockQuery.mock.calls[0][0] as string;
    expect(sql).toContain("SELECT");
    expect(sql).toContain("FROM bookings");
    expect(sql).toContain("status = 'approved_paid'");
    expect(sql).toContain("SUM(total_price)");
    expect(sql).toContain("ORDER BY month_date ASC");
  });

  it("ควร throw error เมื่อ database query ล้มเหลว", async () => {
    mockQuery.mockRejectedValue(new Error("Connection refused"));

    await expect(getRevenueByMonth()).rejects.toThrow("Connection refused");
  });

  it("ควร handle revenue string ที่มี commas (รูปแบบไทย) — แก้ไขแล้ว", async () => {
    mockQuery.mockResolvedValue({
      rows: [
        { month_label: "Jan 2026", month_date: "2026-01-01", revenue: "1,500" },
        { month_label: "Feb 2026", month_date: "2026-02-01", revenue: "25,000.50" },
      ],
    });

    const result = await getRevenueByMonth();

    // ต้อง strip commas ก่อน parseFloat
    expect(result[0].revenue).toBe(1500);
    expect(result[1].revenue).toBe(25000.50);
  });

  it("ควร handle ค่า revenue NULL", async () => {
    mockQuery.mockResolvedValue({
      rows: [
        { month_label: "Jan 2026", month_date: "2026-01-01", revenue: null },
      ],
    });

    const result = await getRevenueByMonth();

    // parseFloat(null) = NaN, so this should be NaN
    expect(result[0].revenue).toBeNaN();
  });

  it("ควรคืน label และ revenue ทุกครั้ง", async () => {
    mockQuery.mockResolvedValue({
      rows: [
        { month_label: "May 2026", month_date: "2026-05-01", revenue: "50000" },
      ],
    });

    const result = await getRevenueByMonth();

    expect(result[0]).toHaveProperty("label");
    expect(result[0]).toHaveProperty("revenue");
    expect(typeof result[0].label).toBe("string");
    expect(typeof result[0].revenue).toBe("number");
  });
});
