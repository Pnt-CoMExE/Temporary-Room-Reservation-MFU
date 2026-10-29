/**
 * Merge legacy duplicate approve/rate activity logs into one row per action.
 *
 * Deletes:
 * - 「เปลี่ยนเรทราคาการจอง #N」 when a matching 「อัปเดตสถานะการจอง #N」 exists
 *   (same booking_id or same #id in action, within ±3s, same admin)
 * - Frontend 「อนุมัติคำขอจอง」 rows that pair with status update for same booking_no
 *
 * If status log is missing rate details but rate log has them, append into status details first.
 *
 * Usage: npx tsx scripts/merge-duplicate-approve-logs.ts
 */
import "dotenv/config";
import { query } from "../db";

type LogRow = {
  id: number;
  admin_name: string | null;
  action: string;
  details: string | null;
  booking_id: number | null;
  created_at: Date;
};

function bookingIdFromAction(action: string): number | null {
  const m = action.match(/#(\d+)\s*$/);
  return m ? Number(m[1]) : null;
}

function withinSeconds(a: Date, b: Date, sec: number): boolean {
  return Math.abs(a.getTime() - b.getTime()) <= sec * 1000;
}

async function main() {
  const res = await query(
    `SELECT id, admin_name, action, details, booking_id, created_at
     FROM admin_activity_logs
     WHERE action LIKE 'เปลี่ยนเรทราคาการจอง %'
        OR action LIKE 'อัปเดตสถานะการจอง %'
        OR action = 'อนุมัติคำขอจอง'
     ORDER BY created_at ASC, id ASC`
  );
  const rows = res.rows as LogRow[];

  const rateLogs = rows.filter((r) => r.action.startsWith("เปลี่ยนเรทราคาการจอง"));
  const statusLogs = rows.filter((r) => r.action.startsWith("อัปเดตสถานะการจอง"));
  const approveFrontend = rows.filter((r) => r.action === "อนุมัติคำขอจอง");

  const deleteIds = new Set<number>();
  let mergedDetails = 0;

  for (const rate of rateLogs) {
    const bid = rate.booking_id ?? bookingIdFromAction(rate.action);
    const match = statusLogs.find((s) => {
      const sid = s.booking_id ?? bookingIdFromAction(s.action);
      if (bid == null || sid == null || bid !== sid) return false;
      if ((s.admin_name || "") !== (rate.admin_name || "")) return false;
      return withinSeconds(new Date(s.created_at), new Date(rate.created_at), 3);
    });
    if (!match) continue;

    const rateText = String(rate.details || "")
      .replace(/^\s*\|\s*/, "")
      .trim();
    const statusDetails = String(match.details || "");
    const alreadyHasRate =
      /เรท\s*:/.test(statusDetails) ||
      (rateText && statusDetails.includes(rateText.slice(0, Math.min(40, rateText.length))));

    if (rateText && !alreadyHasRate) {
      const next = `${statusDetails}${statusDetails ? " | " : ""}${rateText}`.trim();
      await query(`UPDATE admin_activity_logs SET details = $1 WHERE id = $2`, [
        next,
        match.id,
      ]);
      match.details = next;
      mergedDetails++;
    }

    deleteIds.add(rate.id);
  }

  // Frontend duplicate: 「อนุมัติคำขอจอง」 with booking_no → map to booking id → pair status log
  for (const front of approveFrontend) {
    const details = String(front.details || "");
    const noMatch = details.match(/BK-[\w-]+/i);
    if (!noMatch) continue;
    const bookingNo = noMatch[0];
    const bRes = await query(`SELECT id FROM bookings WHERE booking_no = $1 LIMIT 1`, [
      bookingNo,
    ]);
    const bid = bRes.rows[0]?.id != null ? Number(bRes.rows[0].id) : null;
    if (bid == null) continue;

    const nearStatus = statusLogs.find((s) => {
      const sid = s.booking_id ?? bookingIdFromAction(s.action);
      if (sid !== bid) return false;
      if ((s.admin_name || "") !== (front.admin_name || "")) return false;
      return withinSeconds(new Date(s.created_at), new Date(front.created_at), 10);
    });
    if (nearStatus) deleteIds.add(front.id);
  }

  if (deleteIds.size === 0) {
    console.log("No duplicate approve/rate logs found.");
    return;
  }

  const ids = [...deleteIds];
  await query(`DELETE FROM admin_activity_logs WHERE id = ANY($1::int[])`, [ids]);
  console.log(
    `Merged rate details into ${mergedDetails} status log(s). Deleted ${ids.length} duplicate log(s): ${ids.join(", ")}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
