/**
 * Seed paid bookings in 2024–2025 so admin revenue chart can show multi-year bars.
 * Usage: npx tsx scripts/seed-revenue-history.ts
 *
 * Safe to re-run: uses unique booking_no BK-HIST-YYYY-MM
 */
import { query } from "../db";

type MonthSeed = { year: number; month: number; total: number };

/** Spread totals across months so chart has >12 month bars before yearly switch */
const MONTHS: MonthSeed[] = [
  // 2024 — 12 months
  { year: 2024, month: 1, total: 4200 },
  { year: 2024, month: 2, total: 5100 },
  { year: 2024, month: 3, total: 6800 },
  { year: 2024, month: 4, total: 4500 },
  { year: 2024, month: 5, total: 7200 },
  { year: 2024, month: 6, total: 3900 },
  { year: 2024, month: 7, total: 8100 },
  { year: 2024, month: 8, total: 5600 },
  { year: 2024, month: 9, total: 9400 },
  { year: 2024, month: 10, total: 6100 },
  { year: 2024, month: 11, total: 7800 },
  { year: 2024, month: 12, total: 10200 },
  // 2025 — 12 months
  { year: 2025, month: 1, total: 5500 },
  { year: 2025, month: 2, total: 6300 },
  { year: 2025, month: 3, total: 7100 },
  { year: 2025, month: 4, total: 4800 },
  { year: 2025, month: 5, total: 8600 },
  { year: 2025, month: 6, total: 9200 },
  { year: 2025, month: 7, total: 7500 },
  { year: 2025, month: 8, total: 8800 },
  { year: 2025, month: 9, total: 9900 },
  { year: 2025, month: 10, total: 11200 },
  { year: 2025, month: 11, total: 10500 },
  { year: 2025, month: 12, total: 12800 },
];

async function main() {
  const users = await query("SELECT id FROM users ORDER BY id LIMIT 1");
  const rooms = await query(
    "SELECT id FROM rooms WHERE COALESCE(is_active, true) = true ORDER BY id LIMIT 1"
  );
  if (!users.rows[0] || !rooms.rows[0]) {
    throw new Error("Need at least 1 user and 1 room in DB");
  }
  const userId = users.rows[0].id as number;
  const roomId = rooms.rows[0].id as number;

  let inserted = 0;
  let skipped = 0;

  for (const m of MONTHS) {
    const bookingNo = `BK-HIST-${m.year}-${String(m.month).padStart(2, "0")}`;
    const exists = await query("SELECT id FROM bookings WHERE booking_no = $1", [
      bookingNo,
    ]);
    if (exists.rows.length > 0) {
      skipped += 1;
      continue;
    }

    const day = 15;
    const bookingDate = `${m.year}-${String(m.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    // created_at drives revenue chart grouping
    const createdAt = `${bookingDate} 10:30:00`;

    await query(
      `INSERT INTO bookings (
         booking_no, user_id, room_id, organization_type, partner_name,
         booking_date, time_slot, objective,
         room_price, addons_price, total_price,
         status, payment_status, created_at, updated_at
       ) VALUES (
         $1, $2, $3, 'internal', $4,
         $5::date, 'full', $6,
         $7, 0, $7,
         'approved_paid', 'verified', $8::timestamp, $8::timestamp
       )`,
      [
        bookingNo,
        userId,
        roomId,
        `Historical seed ${m.year}-${String(m.month).padStart(2, "0")}`,
        bookingDate,
        `ข้อมูลตัวอย่างรายได้ UAT ${m.year}/${m.month}`,
        m.total,
        createdAt,
      ]
    );
    inserted += 1;
  }

  const sum24 = MONTHS.filter((x) => x.year === 2024).reduce((a, b) => a + b.total, 0);
  const sum25 = MONTHS.filter((x) => x.year === 2025).reduce((a, b) => a + b.total, 0);
  console.log(`✅ Seeded revenue history: inserted=${inserted} skipped=${skipped}`);
  console.log(`   2024 total ≈ ฿${sum24.toLocaleString()} · 2025 total ≈ ฿${sum25.toLocaleString()}`);
  console.log(`   Tip: Admin → ทั้งหมด → กราฟควรเป็นรายปี (แท่งเดือน > 12)`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
