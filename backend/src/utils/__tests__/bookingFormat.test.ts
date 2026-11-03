import { describe, it, expect } from "vitest";
import {
  formatBookingDateTh,
  formatBookingDateEn,
  formatBookingDateIso,
  timeSlotLabelTh,
  timeSlotLabelEn,
  toReceiptEnglish,
} from "../bookingFormat";

describe("bookingFormat", () => {
  it("formats Date from pg without dumping toString()", () => {
    const d = new Date(Date.UTC(2026, 10, 4)); // Nov 4 2026 UTC
    const th = formatBookingDateTh(d);
    expect(th).not.toMatch(/GMT|00:00:00/);
    expect(th).toMatch(/4/);
    expect(th).toMatch(/2026|2569/);
    expect(formatBookingDateIso(d)).toBe("2026-11-04");
    expect(formatBookingDateEn(d)).toMatch(/4/);
  });

  it("formats YYYY-MM-DD string", () => {
    expect(formatBookingDateIso("2026-11-04")).toBe("2026-11-04");
    expect(formatBookingDateTh("2026-11-04")).not.toMatch(/GMT/);
  });

  it("labels time slots with clock hours", () => {
    expect(timeSlotLabelTh("half_afternoon")).toContain("13:00");
    expect(timeSlotLabelEn("full")).toContain("08:00 - 17:00");
  });

  it("normalizes UPPER_SNAKE and dashed slot keys", () => {
    expect(timeSlotLabelEn("HALF_AFTERNOON")).toContain("13:00");
    expect(timeSlotLabelEn("Half-Afternoon")).toContain("Afternoon");
    expect(timeSlotLabelTh("HALF_MORNING")).toContain("08:00");
  });

  it("keeps already-formatted EN slot labels", () => {
    const label = "Afternoon Half Day (13:00 - 17:00)";
    expect(timeSlotLabelEn(label)).toBe(label);
  });

  it("toReceiptEnglish keeps room codes and falls back for pure Thai", () => {
    expect(toReceiptEnglish("ห้องประชุม A", "Space")).toBe("A");
    expect(toReceiptEnglish("อาคาร E2", "Campus")).toBe("E2");
    expect(toReceiptEnglish("C3-101", "Space")).toBe("C3-101");
    expect(toReceiptEnglish("ห้องประชุมใหญ่", "MFU Meeting Space")).toBe(
      "MFU Meeting Space"
    );
  });
});

