/**
 * Production seed — ข้อมูลเริ่มต้นสำหรับระบบจริง (ไม่มี demo bookings)
 * รัน: npm run seed:production
 *
 * นำเข้า: ห้อง/พื้นที่, อัตราค่าบริการ, อุปกรณ์เสริม, แบนเนอร์เริ่มต้น
 * ไม่สร้างผู้ใช้ demo — Admin มาจาก Google OAuth (@property.mfu.ac.th)
 */
import dotenv from "dotenv";
dotenv.config();
import { query, pool } from "../db";

async function seedProduction() {
  console.log("\n🏭 ====== MFU Space Management — Production Seed ======\n");

  try {
    const rooms = [
      { name: "ห้องประชุม C3-101", type: "Meeting Room", capacity: 50, location: "อาคาร C3 ชั้น 1" },
      { name: "ห้องประชุมใหญ่ C3-Auditorium", type: "Auditorium", capacity: 300, location: "อาคาร C3 ชั้น 2" },
      { name: "ลานกิจกรรม M-Complex", type: "Event Plaza", capacity: 500, location: "อาคาร M-Complex" },
    ];

    console.log("🏢 Seeding rooms...");
    for (const room of rooms) {
      const existing = await query("SELECT id FROM rooms WHERE name = $1", [room.name]);
      if (existing.rows.length > 0) continue;

      const res = await query(
        `INSERT INTO rooms (name, type, capacity, location, status, is_active)
         VALUES ($1, $2, $3, $4, 'available', true) RETURNING id`,
        [room.name, room.type, room.capacity, room.location]
      );
      const roomId = res.rows[0].id;
      await query(
        `INSERT INTO room_pricing (
          room_id, price_half_day_internal, price_full_day_internal,
          price_half_day_co_organizer, price_full_day_co_organizer,
          price_half_day_external, price_full_day_external, is_active
        ) VALUES ($1, 500, 1000, 750, 1500, 1000, 2000, true)`,
        [roomId]
      );
      console.log(`  ✅ ${room.name}`);
    }

    const bannerCount = await query("SELECT COUNT(*) FROM banners");
    if (parseInt(bannerCount.rows[0].count as string) === 0) {
      await query(
        `INSERT INTO banners (title, image_url, link, is_active) VALUES
         ('ยินดีต้อนรับสู่ระบบจองพื้นที่ มฟล.', '/images/mfu-logo.png', '/rooms', true)`
      );
      console.log("🖼️  Default banner created");
    }

    console.log("\n✨ Production seed completed.");
    console.log("ℹ️  Admin users are created on first Google OAuth login (@property.mfu.ac.th)");
    console.log("ℹ️  For UAT without institutional email, set DEV_ADMIN_EMAILS in .env\n");
  } catch (err) {
    console.error("❌ Production seed failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedProduction();
