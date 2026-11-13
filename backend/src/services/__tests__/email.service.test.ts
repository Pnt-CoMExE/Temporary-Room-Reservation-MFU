import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  sendEmail,
  sendBookingSubmittedEmail,
  sendBookingStatusEmail,
  timeSlotLabelTh,
  bookingThreadSubject,
  bookingReplySubject,
  bookingThreadMessageId,
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

  it("booking thread helpers keep a stable subject + Message-ID", () => {
    expect(bookingThreadSubject("BK-20260825-001")).toBe(
      "[MFU Space Reservation] BK-20260825-001 — คำขอจอง"
    );
    expect(bookingReplySubject("BK-20260825-001")).toBe(
      "Re: [MFU Space Reservation] BK-20260825-001 — คำขอจอง"
    );
    expect(bookingThreadMessageId("BK-20260825-001")).toBe(
      "<bk-20260825-001-root@mfu-space-reservation.local>"
    );
  });

  it("sendEmail should return ok when options are valid", async () => {
    const res = await sendEmail({
      to: "test@mfu.ac.th",
      subject: "Test Subject",
      html: "<p>Test Content</p>",
    });
    expect(res.ok).toBe(true);
  });

  it("sendEmail logs In-Reply-To when threading", async () => {
    const res = await sendEmail({
      to: "test@mfu.ac.th",
      subject: "Reply",
      html: "<p>Threaded</p>",
      inReplyTo: "<root@mfu.local>",
      references: "<root@mfu.local>",
    });
    expect(res.ok).toBe(true);
    const dumped = logSpy.mock.calls.map((c) => c.join(" ")).join("\n");
    expect(dumped).toContain("In-Reply-To: <root@mfu.local>");
  });

  it("sendBookingSubmittedEmail is bilingual EN then TH", async () => {
    const res = await sendBookingSubmittedEmail(
      "user@mfu.ac.th",
      "BK-20260825-001",
      "Meeting Room C3",
      "2026-09-01",
      "half_morning"
    );
    expect(res.ok).toBe(true);
    expect(res.messageId).toBe("<bk-20260825-001-root@mfu-space-reservation.local>");
    const dumped = logSpy.mock.calls.map((c) => c.join(" ")).join("\n");
    expect(dumped).toContain("Booking request submitted");
    expect(dumped).toContain("ส่งคำขอจองห้องเรียบร้อยแล้ว");
    expect(dumped).toContain("Morning Half Day (08:00 - 12:00)");
    expect(dumped).toContain("ครึ่งวันเช้า (08:00 - 12:00 น.)");
  });

  it("sendBookingStatusEmail bilingual approved_pending_payment", async () => {
    const res = await sendBookingStatusEmail(
      "user@mfu.ac.th",
      "BK-20260825-001",
      "Meeting Room C3",
      "approved_pending_payment",
      undefined,
      "2026-09-01",
      "full"
    );
    expect(res.ok).toBe(true);
    const dumped = logSpy.mock.calls.map((c) => c.join(" ")).join("\n");
    expect(dumped).toContain("Approved — awaiting payment");
    expect(dumped).toContain("อนุมัติแล้ว — รอชำระเงิน");
    expect(dumped).toContain("Full Day (08:00 - 17:00)");
    expect(dumped).toContain("เต็มวัน (08:00 - 17:00 น.)");
    expect(dumped).not.toContain("ไม่อนุมัติ");
  });

  it("sendBookingStatusEmail bilingual disapproved + thread headers", async () => {
    const res = await sendBookingStatusEmail(
      "user@mfu.ac.th",
      "BK-20260825-001",
      "Meeting Room C3",
      "disapproved",
      "ห้องปิดปรับปรุง",
      "2026-09-01",
      "half_afternoon",
      "<bk-20260825-001-root@mfu-space-reservation.local>"
    );
    expect(res.ok).toBe(true);
    const dumped = logSpy.mock.calls.map((c) => c.join(" ")).join("\n");
    expect(dumped).toContain("Disapproved");
    expect(dumped).toContain("ไม่อนุมัติ");
    expect(dumped).toContain("Reason for disapproval");
    expect(dumped).toContain("เหตุผลที่ไม่อนุมัติ");
    expect(dumped).toContain(
      "In-Reply-To: <bk-20260825-001-root@mfu-space-reservation.local>"
    );
  });
});
