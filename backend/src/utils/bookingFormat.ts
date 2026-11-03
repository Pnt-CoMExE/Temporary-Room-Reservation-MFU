/** Shared booking date / time-slot labels for email + PDF (avoid raw Date.toString()). */

const TIME_SLOT_TH: Record<string, string> = {
  half_morning: "ครึ่งวันเช้า (08:00 - 12:00 น.)",
  half_afternoon: "ครึ่งวันบ่าย (13:00 - 17:00 น.)",
  full: "เต็มวัน (08:00 - 17:00 น.)",
  morning: "ครึ่งวันเช้า (08:00 - 12:00 น.)",
  afternoon: "ครึ่งวันบ่าย (13:00 - 17:00 น.)",
};

const TIME_SLOT_EN: Record<string, string> = {
  half_morning: "Morning Half Day (08:00 - 12:00)",
  half_afternoon: "Afternoon Half Day (13:00 - 17:00)",
  full: "Full Day (08:00 - 17:00)",
  morning: "Morning Half Day (08:00 - 12:00)",
  afternoon: "Afternoon Half Day (13:00 - 17:00)",
};

/** Parse pg DATE / ISO / Date without timezone day-shift. */
export function toBookingUtcDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  }
  const raw = String(value ?? "").trim();
  if (!raw) return null;

  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    return new Date(Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])));
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()));
  }
  return null;
}

/** Thai display for emails e.g. วันพุธที่ 4 พฤศจิกายน 2026 */
export function formatBookingDateTh(value: unknown): string {
  const d = toBookingUtcDate(value);
  if (!d) return String(value ?? "").trim() || "-";
  return d.toLocaleDateString("th-TH", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Compact ISO yyyy-mm-dd (stable for PDF / logs) */
export function formatBookingDateIso(value: unknown): string {
  const d = toBookingUtcDate(value);
  if (!d) {
    const m = String(value ?? "").match(/^(\d{4}-\d{2}-\d{2})/);
    return m?.[1] || "-";
  }
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** English long date for PDF permit */
export function formatBookingDateEn(value: unknown): string {
  const d = toBookingUtcDate(value);
  if (!d) return formatBookingDateIso(value);
  return d.toLocaleDateString("en-GB", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function normalizeTimeSlotKey(timeSlot: string): string {
  return String(timeSlot || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

export function timeSlotLabelTh(timeSlot: string): string {
  const key = normalizeTimeSlotKey(timeSlot);
  return TIME_SLOT_TH[key] || String(timeSlot || "").trim() || "-";
}

export function timeSlotLabelEn(timeSlot: string): string {
  const key = normalizeTimeSlotKey(timeSlot);
  // Already human-readable (e.g. from a previous format pass) — keep as-is
  if (!TIME_SLOT_EN[key] && /[:(]|Half Day|Full Day|ครึ่ง|เต็ม/.test(timeSlot)) {
    return String(timeSlot).trim();
  }
  return TIME_SLOT_EN[key] || String(timeSlot || "").trim() || "-";
}

/**
 * PDFKit Helvetica cannot render Thai — strip non-ASCII and keep room codes / Latin.
 * Falls back when nothing readable remains (e.g. pure Thai names).
 */
export function toReceiptEnglish(text: unknown, fallback: string): string {
  const raw = String(text ?? "").trim();
  if (!raw) return fallback;

  const ascii = raw
    .replace(/[\u0E00-\u0E7F]+/g, " ")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^[\-_|/.,:;]+|[\-_|/.,:;]+$/g, "")
    .trim();

  return ascii.length >= 1 ? ascii : fallback;
}
