import { describe, it, expect } from "vitest";
import {
  sendEmail,
  sendBookingSubmittedEmail,
  sendBookingStatusEmail,
} from "../email.service";

describe("Email Service Unit Tests", () => {
  it("sendEmail should return true when options are valid", async () => {
    const res = await sendEmail({
      to: "test@mfu.ac.th",
      subject: "Test Subject",
      html: "<p>Test Content</p>",
    });
    expect(res).toBe(true);
  });

  it("sendBookingSubmittedEmail should construct and send confirmation email", async () => {
    const res = await sendBookingSubmittedEmail(
      "user@mfu.ac.th",
      "BK-20260825-001",
      "Meeting Room C3",
      "2026-09-01"
    );
    expect(res).toBe(true);
  });

  it("sendBookingStatusEmail should construct and send approval status email", async () => {
    const resApproved = await sendBookingStatusEmail(
      "user@mfu.ac.th",
      "BK-20260825-001",
      "Meeting Room C3",
      "approved",
      "อนุมัติการใช้งาน"
    );
    expect(resApproved).toBe(true);

    const resDisapproved = await sendBookingStatusEmail(
      "user@mfu.ac.th",
      "BK-20260825-001",
      "Meeting Room C3",
      "disapproved",
      "ห้องปิดปรับปรุง"
    );
    expect(resDisapproved).toBe(true);
  });
});
