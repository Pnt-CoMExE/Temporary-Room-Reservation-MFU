import { query } from "../../db";

export async function logAdminAction(
  adminName: string,
  action: string,
  details?: string
): Promise<void> {
  try {
    await query(
      "INSERT INTO admin_activity_logs (admin_name, action, details) VALUES ($1, $2, $3)",
      [adminName, action, details ?? null]
    );
  } catch (err) {
    console.error("[auditLog] Failed to write log:", err);
  }
}

export function adminNameFromReq(req: { user?: { name?: string; email?: string } }): string {
  return req.user?.name || req.user?.email || "System Admin";
}
