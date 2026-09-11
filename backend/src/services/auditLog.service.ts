import { query } from "../../db";

export async function logAdminAction(
  adminName: string,
  action: string,
  details?: string,
  bookingId?: number | null
): Promise<void> {
  try {
    await query(
      "INSERT INTO admin_activity_logs (admin_name, action, details, booking_id) VALUES ($1, $2, $3, $4)",
      [adminName, action, details ?? null, bookingId ?? null]
    );
  } catch (err) {
    console.error("[auditLog] Failed to write log:", err);
  }
}

export function adminNameFromReq(req: {
  user?: { name?: string; email?: string };
}): string {
  return req.user?.name || req.user?.email || "System Admin";
}
