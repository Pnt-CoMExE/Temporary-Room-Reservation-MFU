/**
 * Normalize API/DB date values to a calendar YYYY-MM-DD key
 * without timezone day-shift (common with DATE → ISO UTC).
 */
export function toDateKey(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") {
    const m = value.trim().match(/^(\d{4}-\d{2}-\d{2})/);
    if (m) return m[1];
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const y = value.getFullYear();
    const mo = String(value.getMonth() + 1).padStart(2, "0");
    const d = String(value.getDate()).padStart(2, "0");
    return `${y}-${mo}-${d}`;
  }
  const s = String(value);
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : "";
}

/** Always display as day/month/year (DD/MM/YYYY). */
export function formatDateDMY(value: unknown): string {
  const key = toDateKey(value);
  if (!key) return "";
  const [y, m, d] = key.split("-");
  return `${d}/${m}/${y}`;
}

/** Parse DD/MM/YYYY (also accepts D/M/YYYY) → YYYY-MM-DD or "". */
export function parseDateDMY(text: string): string {
  const raw = String(text || "").trim();
  const m = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return "";
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return "";
  const dt = new Date(year, month - 1, day);
  if (
    dt.getFullYear() !== year ||
    dt.getMonth() !== month - 1 ||
    dt.getDate() !== day
  ) {
    return "";
  }
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Format for UI display — day/month/year.
 * - Default / compact: DD/MM/YYYY
 * - If options.month is "long" | "short": localized label with day-first order (th-TH / en-GB)
 */
export function formatDateKey(
  value: unknown,
  locale: string = "th-TH",
  options?: Intl.DateTimeFormatOptions
): string {
  const key = toDateKey(value);
  if (!key) return "";

  const wantsLong =
    options?.month === "long" ||
    options?.month === "short" ||
    options?.month === "narrow";

  if (!wantsLong) {
    return formatDateDMY(key);
  }

  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const displayLocale =
    locale === "en" || locale.startsWith("en") ? "en-GB" : "th-TH";
  return date.toLocaleDateString(displayLocale, {
    year: "numeric",
    day: "numeric",
    ...options,
  });
}
