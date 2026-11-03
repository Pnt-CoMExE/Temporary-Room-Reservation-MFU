import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  sendEmail,
  sendBookingSubmittedEmail,
  sendBookingStatusEmail,
  timeSlotLabelTh,
} from "../email.service";

describe("Email Service Unit Tests", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it("timeSlotLabelTh maps slot codes to Thai with clock times", () => {
    expect(timeSlotLabelTh("half_morning")).toBe("ครึ่งวันเช้า (08:00 - 12:00 น.)");
    expect(timeSlotLabelTh("half_afternoon")).toBe("ครึ่งวันบ่าย (13:00 - 17:00 น.)");
    expect(timeSlotLabelTh("full")).toBe("เต็มวัน (08:00 - 17:00 น.)");
  });

  it("sendEmail should return true when options are valid", async () => {
    const res = await sendEmail({
      to: "test@mfu.ac.th",
      subject: "Test Subject",
      html: "<p>Test Content</p>",
    });
    expect(res).toBe(true);
  });

  it("sendBookingSubmittedEmail includes time slot in subject", async () => {
    const res = await sendBookingSubmittedEmail(
      "user@mfu.ac.th",
      "BK-20260825-001",
      "Meeting Room C3",
      "2026-09-01",
      "half_morning"
    );
    expect(res).toBe(true);
    const dumped = logSpy.mock.calls.map((c) => c.join(" ")).join("\n");
    expect(dumped).toContain("BK-20260825-001");
    expect(dumped).toContain("ครึ่งวันเช้า (08:00 - 12:00 น.)");
  });

  it("sendBookingStatusEmail treats approved_pending_payment as approved and includes slot", async () => {
    const res = await sendBookingStatusEmail(
      "user@mfu.ac.th",
      "BK-20260825-001",
      "Meeting Room C3",
      "approved_pending_payment",
      undefined,
      "2026-09-01",
      "full"
    );
    expect(res).toBe(true);
    const dumped = logSpy.mock.calls.map((c) => c.join(" ")).join("\n");
    expect(dumped).toContain("อนุมัติแล้ว");
    expect(dumped).toContain("รอชำระเงิน");
    expect(dumped).toContain("เต็มวัน (08:00 - 17:00 น.)");
    expect(dumped).not.toContain("ไม่อนุมัติ");
  });

  it("sendBookingStatusEmail marks disapproved in subject", async () => {
    const res = await sendBookingStatusEmail(
      "user@mfu.ac.th",
      "BK-20260825-001",
      "Meeting Room C3",
      "disapproved",
      "ห้องปิดปรับปรุง",
      "2026-09-01",
      "half_afternoon"
    );
    expect(res).toBe(true);
    const dumped = logSpy.mock.calls.map((c) => c.join(" ")).join("\n");
    expect(dumped).toContain("ไม่อนุมัติ");
    expect(dumped).toContain("ครึ่งวันบ่าย (13:00 - 17:00 น.)");
  });
});



