import { describe, it, expect } from "vitest";
import { generateBookingPDFReceipt } from "../pdf.service";
import { toReceiptEnglish, timeSlotLabelEn, formatBookingDateEn } from "../../utils/bookingFormat";

describe("generateBookingPDFReceipt", () => {
  it("builds a Helvetica PDF and English field helpers stay clean", async () => {
    expect(toReceiptEnglish("ห้องประชุม A", "Space")).toBe("A");
    expect(toReceiptEnglish("อาคาร E2", "Campus")).toBe("E2");
    expect(timeSlotLabelEn("HALF_AFTERNOON")).toContain("13:00");
    expect(formatBookingDateEn(new Date(Date.UTC(2026, 10, 4)))).not.toMatch(/GMT/);

    const buf = await generateBookingPDFReceipt({
      bookingNo: "BK-TEST-001",
      userName: "สมชาย ใจดี",
      userEmail: "somchai@lamduan.mfu.ac.th",
      organizationType: "external",
      roomName: "ห้องประชุม A",
      location: "อาคาร E2",
      bookingDate: String(new Date(Date.UTC(2026, 10, 4))),
      timeSlot: "HALF_AFTERNOON",
      roomPrice: 1500,
      addonsPrice: 0,
      totalPrice: 1500,
      paymentStatus: "verified",
      paidAt: "03/11/2026, 10:00:00",
    });

    expect(buf.length).toBeGreaterThan(1000);
    expect(buf.subarray(0, 4).toString("latin1")).toBe("%PDF");

    const asLatin1 = buf.toString("latin1");
    expect(asLatin1).toMatch(/Helvetica/);
    expect(asLatin1).not.toMatch(/ReceiptThai|NotoSansThai|Identity-H/);
    expect(asLatin1).not.toMatch(/HALF_AFTERNOON/);
  });
});
