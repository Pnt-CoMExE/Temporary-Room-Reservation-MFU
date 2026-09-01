import { describe, it, expect, vi, beforeEach } from "vitest";
import { logAdminAction } from "../auditLog.service";

vi.mock("../../../db", () => ({
  query: vi.fn().mockResolvedValue({ rows: [] }),
}));

import { query } from "../../../db";

describe("auditLog.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("บันทึก admin activity log ลงฐานข้อมูล", async () => {
    await logAdminAction("Admin User", "อนุมัติคำขอจอง", "Booking #12");
    expect(query).toHaveBeenCalledWith(
      "INSERT INTO admin_activity_logs (admin_name, action, details) VALUES ($1, $2, $3)",
      ["Admin User", "อนุมัติคำขอจอง", "Booking #12"]
    );
  });
});
