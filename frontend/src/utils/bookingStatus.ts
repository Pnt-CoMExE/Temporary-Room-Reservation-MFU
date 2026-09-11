/**
 * Shared booking status labels / badge colors (User + Admin).
 * Distinguishes "paid" vs "reviewed" without a new DB status.
 */

export type BookingStatusKey =
  | "pending"
  | "approved_pending_payment"
  | "approved_paid"
  | "disapproved"
  | "cancelled"
  | "unknown";

/** SweetAlert action button classes — keep approve / reject / pay / cancel consistent */
export const statusActionBtn = {
  approve:
    "bg-emerald-600 text-white rounded-xl px-6 py-3 font-bold hover:bg-emerald-700 shadow-md transition-all cursor-pointer",
  reject:
    "bg-[#ba0b2f] text-white rounded-xl px-6 py-3 font-bold hover:bg-[#8c0823] shadow-md transition-all cursor-pointer",
  cancel:
    "bg-gray-100 text-gray-700 border border-gray-200 rounded-xl px-6 py-3 font-bold hover:bg-gray-200 transition-all cursor-pointer",
  primary:
    "bg-[#ba0b2f] text-white rounded-xl px-4 py-3 font-bold hover:bg-[#8c0823] shadow-md transition-all flex-1 whitespace-nowrap cursor-pointer",
  secondary:
    "bg-gray-100 text-gray-700 border border-gray-200 rounded-xl px-4 py-3 font-bold hover:bg-gray-200 transition-all flex-1 whitespace-nowrap cursor-pointer",
  confirmPayment:
    "bg-sky-600 text-white rounded-xl px-4 py-3 font-bold hover:bg-sky-700 shadow-md transition-all flex-1 whitespace-nowrap cursor-pointer",
} as const;

export function normalizeBookingStatus(
  status: string | null | undefined
): BookingStatusKey {
  const s = String(status || "").trim();
  if (s === "pending" || s === "รออนุมัติ") return "pending";
  if (s === "approved_pending_payment" || s === "รอชำระเงิน")
    return "approved_pending_payment";
  if (
    s === "approved_paid" ||
    s === "approved" ||
    s === "สำเร็จแล้ว" ||
    s === "ชำระแล้ว"
  )
    return "approved_paid";
  if (s === "disapproved" || s === "ไม่อนุมัติ") return "disapproved";
  if (s === "ยกเลิกแล้ว" || s === "cancelled" || s === "canceled")
    return "cancelled";
  return "unknown";
}

export function isBookingStatus(
  status: string | null | undefined,
  key: BookingStatusKey
): boolean {
  return normalizeBookingStatus(status) === key;
}

/** Primary status label — paid is NOT the same wording as "reviewed" */
export function getBookingStatusLabel(
  status: string | null | undefined,
  locale: string = "th"
): string {
  const key = normalizeBookingStatus(status);
  const en = locale === "en";
  switch (key) {
    case "pending":
      return en ? "Pending approval" : "รออนุมัติ";
    case "approved_pending_payment":
      return en ? "Awaiting payment" : "รอชำระเงิน";
    case "approved_paid":
      return en ? "Paid" : "ชำระแล้ว";
    case "disapproved":
      return en ? "Disapproved" : "ไม่อนุมัติ";
    case "cancelled":
      return en ? "Cancelled" : "ยกเลิกแล้ว";
    default:
      return String(status || "");
  }
}

export function getReviewedLabel(locale: string = "th"): string {
  return locale === "en" ? "Reviewed" : "มีรีวิวแล้ว";
}

export function getAwaitingReviewLabel(locale: string = "th"): string {
  return locale === "en" ? "No review yet" : "ยังไม่มีรีวิว";
}

export function getBookingStatusBadgeClass(
  status: string | null | undefined
): string {
  switch (normalizeBookingStatus(status)) {
    case "pending":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "approved_pending_payment":
      return "bg-sky-50 text-sky-800 border-sky-200";
    case "approved_paid":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "disapproved":
      return "bg-rose-50 text-rose-800 border-rose-200";
    case "cancelled":
      return "bg-slate-100 text-slate-500 border-slate-200 line-through opacity-80";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}

export function getReviewedBadgeClass(): string {
  return "bg-violet-50 text-violet-800 border-violet-200";
}
