import { query } from "../../db";

export type NotificationType = "broadcast" | "booking_status" | "system";

export async function createNotification(params: {
  userId: number;
  type: NotificationType;
  title: string;
  body: string;
  link?: string | null;
}): Promise<void> {
  try {
    await query(
      `INSERT INTO notifications (user_id, type, title, body, link)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        params.userId,
        params.type,
        params.title,
        params.body,
        params.link ?? "/dashboard",
      ]
    );
  } catch (err) {
    console.error("[notifications] Failed to create:", err);
  }
}

/** Insert one notification row for every active user. Returns recipient count. */
export async function broadcastToActiveUsers(params: {
  title: string;
  body: string;
  link?: string | null;
}): Promise<number> {
  const result = await query(
    `INSERT INTO notifications (user_id, type, title, body, link)
     SELECT u.id, 'broadcast', $1, $2, $3
     FROM users u
     WHERE COALESCE(u.is_active, TRUE) = TRUE
     RETURNING id`,
    [params.title, params.body, params.link ?? "/home"]
  );
  return result.rowCount || 0;
}
