/**
 * Cron / scheduled job: auto-update booking statuses
 *
 * Rules:
 * 1) approved_pending_payment + booking_date < today → ยกเลิกแล้ว (หมดเวลาชำระ)
 * 2) pending + booking_date < today → ยกเลิกแล้ว (ไม่ได้อนุมัติทันวันใช้งาน)
 * 3) approved_paid + เลยวัน/เวลาใช้งานแล้ว → completed (สำเร็จแล้ว)
 *
 * Usage:
 *   cd backend && npx tsx scripts/auto-update-booking-status.ts
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

  // ชำระเงินแล้ว + เลยวัน/เวลาใช้งาน → สำเร็จแล้ว
  const completed = await query(
    `UPDATE bookings
     SET status = 'completed',
         updated_at = NOW()
     WHERE status = 'approved_paid'
       AND (
         booking_date::date < CURRENT_DATE
         OR (
           booking_date::date = CURRENT_DATE
           AND (
             (time_slot = 'half_morning' AND CURRENT_TIME > TIME '12:00')
             OR (time_slot IN ('half_afternoon', 'full') AND CURRENT_TIME > TIME '17:00')
           )
         )
       )
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
      /* ignore */
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

  for (const row of completed.rows) {
    try {
      await query(
        `INSERT INTO admin_activity_logs (admin_name, action, details, booking_id)
         VALUES ($1, $2, $3, $4)`,
        [
          "System Cron",
          `อัปเดตสถานะการจอง #${row.id}`,
          `สถานะ: สำเร็จแล้ว (เลยวันใช้งาน — booking_no=${row.booking_no})`,
          row.id,
        ]
      );
    } catch {
      /* ignore */
    }
  }

  console.log(
    `[cron] cancelled unpaid=${unpaid.rows.length}, stale-pending=${stalePending.rows.length}, completed=${completed.rows.length}`
  );
  process.exit(0);
}

run().catch((err) => {
  console.error("[cron] failed:", err);
  process.exit(1);
});
