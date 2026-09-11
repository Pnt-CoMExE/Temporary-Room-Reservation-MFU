/**
 * Cron / scheduled job: auto-update booking statuses
 *
 * Rules:
 * 1) approved_pending_payment + booking_date < today → ยกเลิกแล้ว (หมดเวลาชำระ)
 * 2) pending + booking_date < today → ยกเลิกแล้ว (ไม่ได้อนุมัติทันวันใช้งาน)
 *
 * Does NOT invent a new "สำเร็จแล้ว" DB status — paid stays approved_paid;
 * review remains in feedbacks. This keeps dashboard queries simple (Recording 3).
 *
 * Usage:
 *   cd backend && npx tsx scripts/auto-update-booking-status.ts
 * Cron example (daily 01:15):
 *   15 1 * * * cd /path/to/backend && npx tsx scripts/auto-update-booking-status.ts >> /var/log/mfu-booking-cron.log 2>&1
 */
import dotenv from "dotenv";
dotenv.config();

import { query } from "../db";

async function run() {
  const unpaid = await query(
    `UPDATE bookings
     SET status = 'ยกเลิกแล้ว',
         updated_at = NOW()
     WHERE status = 'approved_pending_payment'
       AND booking_date::date < CURRENT_DATE
     RETURNING id, booking_no`
  );

  const stalePending = await query(
    `UPDATE bookings
     SET status = 'ยกเลิกแล้ว',
         updated_at = NOW()
     WHERE status = 'pending'
       AND booking_date::date < CURRENT_DATE
     RETURNING id, booking_no`
  );

  for (const row of unpaid.rows) {
    try {
      await query(
        `INSERT INTO admin_activity_logs (admin_name, action, details, booking_id)
         VALUES ($1, $2, $3, $4)`,
        [
          "System Cron",
          `หมดเวลาชำระเงิน #${row.id}`,
          `ยกเลิกอัตโนมัติ (booking_no=${row.booking_no})`,
          row.id,
        ]
      );
    } catch {
      /* column may not exist on very old DB — ignore */
    }
  }

  for (const row of stalePending.rows) {
    try {
      await query(
        `INSERT INTO admin_activity_logs (admin_name, action, details, booking_id)
         VALUES ($1, $2, $3, $4)`,
        [
          "System Cron",
          `หมดเวลารออนุมัติ #${row.id}`,
          `ยกเลิกอัตโนมัติ (booking_no=${row.booking_no})`,
          row.id,
        ]
      );
    } catch {
      /* ignore */
    }
  }

  console.log(
    `[cron] cancelled unpaid-after-date=${unpaid.rows.length}, stale-pending=${stalePending.rows.length}`
  );
  process.exit(0);
}

run().catch((err) => {
  console.error("[cron] failed:", err);
  process.exit(1);
});
