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

/** Format YYYY-MM-DD (or Date/ISO) for display in local calendar day. */
export function formatDateKey(
  value: unknown,
  locale: string = "th-TH",
  options?: Intl.DateTimeFormatOptions
): string {
  const key = toDateKey(value);
  if (!key) return "";
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  });
}
