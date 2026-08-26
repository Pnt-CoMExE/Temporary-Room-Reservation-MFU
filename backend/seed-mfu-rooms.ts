import dotenv from "dotenv";
dotenv.config();
import { query } from "./db";

async function seedDatabase() {
  console.log("🌱 Starting MFU Space Management Database Seeder...");

  try {
    // 1. Seed Rooms
    const rooms = [
      {
        name: "ห้องประชุม C3-101 (Meeting Room C3-101)",
        type: "Meeting Room",
        capacity: 50,
        location: "อาคาร C3 ชั้น 1 มหาวิทยาลัยแม่ฟ้าหลวง",
        image_url: "/images/rooms/c3-101.jpg",
      },
      {
        name: "ห้องประชุมใหญ่ C3-Auditorium (C3 Grand Hall)",
        type: "Auditorium",
        capacity: 300,
        location: "อาคาร C3 ชั้น 2 มหาวิทยาลัยแม่ฟ้าหลวง",
        image_url: "/images/rooms/c3-auditorium.jpg",
      },
      {
        name: "ลานกิจกรรม M-Complex (M-Complex Multipurpose Plaza)",
        type: "Event Plaza",
        capacity: 500,
        location: "อาคาร M-Complex ชั้น 1",
        image_url: "/images/rooms/m-complex-plaza.jpg",
      },
      {
        name: "ห้องสัมมนา E3A-201 (E3A Seminar Room)",
        type: "Seminar Room",
        capacity: 100,
        location: "อาคาร E3A ชั้น 2",
        image_url: "/images/rooms/e3a-201.jpg",
      },
    ];

    for (const r of rooms) {
      const existing = await query("SELECT id FROM rooms WHERE name = $1", [r.name]);
      let roomId: number;

      if (existing.rows.length === 0) {
        const res = await query(
          `INSERT INTO rooms (name, type, capacity, location, image_url, status, is_active)
           VALUES ($1, $2, $3, $4, $5, 'available', true)
           RETURNING id`,
          [r.name, r.type, r.capacity, r.location, r.image_url]
        );
        roomId = res.rows[0].id;
        console.log(`  ✅ Added Room: ${r.name}`);
      } else {
        roomId = existing.rows[0].id;
        console.log(`  ℹ️ Room exists: ${r.name}`);
      }

      // Seed Room Pricing Tiers
      const existingPricing = await query(
        "SELECT id FROM room_pricing WHERE room_id = $1 AND is_active = true",
        [roomId]
      );
      if (existingPricing.rows.length === 0) {
        const isBig = r.capacity >= 200;
        const halfInternal = isBig ? 1500 : 500;
        const fullInternal = isBig ? 3000 : 1000;

        const halfCoop = isBig ? 2250 : 750;
        const fullCoop = isBig ? 4500 : 1500;

        const halfExternal = isBig ? 3000 : 1000;
        const fullExternal = isBig ? 6000 : 2000;

        await query(
          `INSERT INTO room_pricing (
            room_id,
            price_half_day_internal, price_full_day_internal,
            price_half_day_co_organizer, price_full_day_co_organizer,
            price_half_day_external, price_full_day_external,
            effective_date, is_active
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), true)`,
          [
            roomId,
            halfInternal,
            fullInternal,
            halfCoop,
            fullCoop,
            halfExternal,
            fullExternal,
          ]
        );
        console.log(`     └─ Added Pricing Tier for ${r.name}`);
      }
    }

    // 2. Seed Addons
    const addons = [
      { name: "เครื่องโปรเจคเตอร์และฉากรับภาพ (Projector Set)", price: 500, unit: "ชุด" },
      { name: "ไมโครโฟนไร้สาย (Wireless Microphone)", price: 200, unit: "ตัว" },
      { name: "ชุดเครื่องเสียงจัดงาน (Sound System Package)", price: 1200, unit: "ชุด" },
      { name: "โต๊ะลงทะเบียน/จัดเลี้ยง (Registration Table)", price: 100, unit: "ตัว" },
      { name: "เก้าอี้เสริม (Extra Chair)", price: 20, unit: "ตัว" },
    ];

    for (const a of addons) {
      const exist = await query("SELECT id FROM addons WHERE name = $1", [a.name]);
      if (exist.rows.length === 0) {
        await query(
          "INSERT INTO addons (name, price_per_unit, unit_name, is_active) VALUES ($1, $2, $3, true)",
          [a.name, a.price, a.unit]
        );
        console.log(`  ✅ Added Add-on: ${a.name}`);
      }
    }

    // 3. Seed Promo Codes
    const promos = [
      { code: "MFUWELCOME", discount: 100, limit: 200 },
      { code: "PROMO2026", discount: 200, limit: 100 },
      { code: "STUDENT10", discount: 50, limit: 500 },
    ];

    for (const p of promos) {
      const exist = await query("SELECT id FROM promo_codes WHERE code = $1", [p.code]);
      if (exist.rows.length === 0) {
        await query(
          "INSERT INTO promo_codes (code, discount, limit_count, is_active) VALUES ($1, $2, $3, true)",
          [p.code, p.discount, p.limit]
        );
        console.log(`  ✅ Added Promo Code: ${p.code}`);
      }
    }

    console.log("✨ MFU Database Seeding Completed Successfully!");
  } catch (err: any) {
    console.error("❌ Seeding Error:", err.message);
  } finally {
    process.exit();
  }
}

seedDatabase();
