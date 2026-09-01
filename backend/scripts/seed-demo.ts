/**
 * Sprint 2 — Unified Demo Seed Script
 * สคริปต์ seed ข้อมูลตัวอย่างสมจริงทั้งระบบ สำหรับ UAT Demo
 *
 * รันด้วย: npm run seed:demo
 *
 * ข้อมูลที่ seed:
 * - Users (5 คน): Admin, Internal Staff ×2, Student, External
 * - Rooms (8 ห้อง): ครอบคลุม 8 ประเภทพื้นที่
 * - Room Pricing: 3-tier (internal / co-organizer / external)
 * - Addons (5 รายการ)
 * - Promo Codes (3 รหัส)
 * - Banners (3 แบนเนอร์)
 * - Sample Bookings (5 รายการ): สถานะต่างๆ
 * - Featured Rooms (3 ห้อง)
 * - Activity Logs (4 รายการ)
 */
import dotenv from "dotenv";
dotenv.config();
import { query, pool } from "../db";

async function seedDemo() {
  console.log("\n🌱 ====== MFU Space Management — UAT Demo Seed ======\n");

  try {
    // ============================================================
    // 1. USERS — 5 ผู้ใช้ตัวอย่าง
    // ============================================================
    console.log("👤 Seeding Users...");
    const users = [
      {
        google_id: "demo_admin_001",
        firstname: "สมชาย",
        lastname: "จัดการทรัพย์สิน",
        email: "admin.demo@property.mfu.ac.th",
        phone_number: "053-916-000",
        user_type: "admin",
        profile_picture: "https://ui-avatars.com/api/?name=Admin&background=dc2626&color=fff&size=128",
      },
      {
        google_id: "demo_staff_001",
        firstname: "วิชัย",
        lastname: "อาจารย์มฟล",
        email: "wichai.staff@mfu.ac.th",
        phone_number: "053-916-101",
        user_type: "internal",
        profile_picture: "https://ui-avatars.com/api/?name=Wichai&background=2563eb&color=fff&size=128",
      },
      {
        google_id: "demo_staff_002",
        firstname: "สุดา",
        lastname: "บุคลากรมฟล",
        email: "suda.staff@mfu.ac.th",
        phone_number: "053-916-102",
        user_type: "internal",
        profile_picture: "https://ui-avatars.com/api/?name=Suda&background=7c3aed&color=fff&size=128",
      },
      {
        google_id: "demo_student_001",
        firstname: "ปิยะ",
        lastname: "นักศึกษาทดสอบ",
        email: "piya.student@lamduan.mfu.ac.th",
        phone_number: "091-234-5678",
        user_type: "external",
        profile_picture: "https://ui-avatars.com/api/?name=Piya&background=059669&color=fff&size=128",
      },
      {
        google_id: "demo_external_001",
        firstname: "John",
        lastname: "External Co.",
        email: "john.external@company.com",
        phone_number: "081-999-8888",
        user_type: "external",
        profile_picture: "https://ui-avatars.com/api/?name=John&background=d97706&color=fff&size=128",
      },
    ];

    const userIds: Record<string, number> = {};
    for (const u of users) {
      const existing = await query("SELECT id FROM users WHERE email = $1", [u.email]);
      if (existing.rows.length > 0) {
        userIds[u.email] = existing.rows[0].id;
        console.log(`  ℹ️  User exists: ${u.firstname} ${u.lastname} (${u.email})`);
      } else {
        const res = await query(
          `INSERT INTO users (google_id, firstname, lastname, email, phone_number, user_type, profile_picture)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
          [u.google_id, u.firstname, u.lastname, u.email, u.phone_number, u.user_type, u.profile_picture]
        );
        userIds[u.email] = res.rows[0].id;
        console.log(`  ✅ Added User: ${u.firstname} ${u.lastname} (${u.email})`);
      }
    }

    // ============================================================
    // 2. ROOMS — 8 ห้อง ครอบคลุมทุกประเภท
    // ============================================================
    console.log("\n🏢 Seeding Rooms (8 types)...");
    const rooms = [
      {
        name: "ห้องประชุม C3-101 (Meeting Room C3-101)",
        type: "Meeting Room",
        capacity: 50,
        location: "อาคาร C3 ชั้น 1 มหาวิทยาลัยแม่ฟ้าหลวง",
        image_url: "/images/rooms/c3-101.jpg",
      },
      {
        name: "ห้องบรรยาย C5-301 (Lecture Hall C5-301)",
        type: "Lecture Hall",
        capacity: 120,
        location: "อาคาร C5 ชั้น 3 มหาวิทยาลัยแม่ฟ้าหลวง",
        image_url: "/images/rooms/c5-301.jpg",
      },
      {
        name: "ห้องสัมมนา E3A-201 (E3A Seminar Room)",
        type: "Seminar Room",
        capacity: 80,
        location: "อาคาร E3A ชั้น 2 มหาวิทยาลัยแม่ฟ้าหลวง",
        image_url: "/images/rooms/e3a-201.jpg",
      },
      {
        name: "ห้องประชุมใหญ่ C3-Auditorium (C3 Grand Hall)",
        type: "Auditorium",
        capacity: 300,
        location: "อาคาร C3 ชั้น 2 มหาวิทยาลัยแม่ฟ้าหลวง",
        image_url: "/images/rooms/c3-auditorium.jpg",
      },
      {
        name: "ห้องปฏิบัติการคอมพิวเตอร์ S2-401 (Computer Lab S2-401)",
        type: "Laboratory",
        capacity: 40,
        location: "อาคาร S2 ชั้น 4 มหาวิทยาลัยแม่ฟ้าหลวง",
        image_url: "/images/rooms/s2-401.jpg",
      },
      {
        name: "อาคารกีฬาเฉลิมพระเกียรติ (MFU Sports Complex)",
        type: "Sports Center",
        capacity: 500,
        location: "อาคารกีฬาเฉลิมพระเกียรติ มหาวิทยาลัยแม่ฟ้าหลวง",
        image_url: "/images/rooms/sports-complex.jpg",
      },
      {
        name: "ลานกิจกรรม M-Complex (M-Complex Multipurpose Plaza)",
        type: "Event Plaza",
        capacity: 500,
        location: "อาคาร M-Complex ชั้น 1 มหาวิทยาลัยแม่ฟ้าหลวง",
        image_url: "/images/rooms/m-complex-plaza.jpg",
      },
      {
        name: "อาคาร D1 ห้องจัดเลี้ยง (D1 Banquet Hall)",
        type: "Building",
        capacity: 200,
        location: "อาคาร D1 ชั้น 1 มหาวิทยาลัยแม่ฟ้าหลวง",
        image_url: "/images/rooms/d1-banquet.jpg",
      },
    ];

    const roomIds: Record<string, number> = {};
    for (const r of rooms) {
      const existing = await query("SELECT id FROM rooms WHERE name = $1", [r.name]);
      let roomId: number;

      if (existing.rows.length > 0) {
        roomId = existing.rows[0].id;
        console.log(`  ℹ️  Room exists: ${r.name}`);
      } else {
        const res = await query(
          `INSERT INTO rooms (name, type, capacity, location, image_url, status, is_active)
           VALUES ($1, $2, $3, $4, $5, 'available', true) RETURNING id`,
          [r.name, r.type, r.capacity, r.location, r.image_url]
        );
        roomId = res.rows[0].id;
        console.log(`  ✅ Added Room: ${r.name}`);
      }
      roomIds[r.name] = roomId;

      // Seed pricing for this room (3-tier)
      const existingPricing = await query(
        "SELECT id FROM room_pricing WHERE room_id = $1 AND is_active = true",
        [roomId]
      );
      if (existingPricing.rows.length === 0) {
        const isBig = r.capacity >= 200;
        const isMedium = r.capacity >= 80 && r.capacity < 200;
        const baseMultiplier = isBig ? 3 : isMedium ? 2 : 1;

        const halfInternal = 500 * baseMultiplier;
        const fullInternal = 1000 * baseMultiplier;
        const halfCoop = 750 * baseMultiplier;
        const fullCoop = 1500 * baseMultiplier;
        const halfExternal = 1000 * baseMultiplier;
        const fullExternal = 2000 * baseMultiplier;

        await query(
          `INSERT INTO room_pricing (
            room_id,
            price_half_day_internal, price_full_day_internal,
            price_half_day_co_organizer, price_full_day_co_organizer,
            price_half_day_external, price_full_day_external,
            effective_date, is_active
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), true)`,
          [roomId, halfInternal, fullInternal, halfCoop, fullCoop, halfExternal, fullExternal]
        );
        console.log(`     └─ Pricing: ½day internal ฿${halfInternal} | fullday internal ฿${fullInternal}`);
      }
    }

    // ============================================================
    // 3. ADDONS — 5 อุปกรณ์เสริม
    // ============================================================
    console.log("\n🔧 Seeding Add-ons...");
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
        console.log(`  ✅ Added Add-on: ${a.name} (฿${a.price}/${a.unit})`);
      } else {
        console.log(`  ℹ️  Add-on exists: ${a.name}`);
      }
    }

    // ============================================================
    // 4. PROMO CODES — 3 รหัสส่วนลด
    // ============================================================
    console.log("\n🏷️  Seeding Promo Codes...");
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
        console.log(`  ✅ Added Promo: ${p.code} (ลด ฿${p.discount}, limit ${p.limit})`);
      } else {
        console.log(`  ℹ️  Promo exists: ${p.code}`);
      }
    }

    // ============================================================
    // 5. BANNERS — 3 แบนเนอร์
    // ============================================================
    console.log("\n🖼️  Seeding Banners...");
    const bannerCount = await query("SELECT COUNT(*) FROM banners");
    if (parseInt(bannerCount.rows[0].count as string) === 0) {
      await query(`
        INSERT INTO banners (title, image_url, link) VALUES
        ('ยินดีต้อนรับ! ระบบจองพื้นที่ มฟล. เปิดให้บริการแล้ว',
         'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2000&auto=format&fit=crop', '/rooms'),
        ('จองลานกิจกรรมประดู่แดงล่วงหน้า รับฟรีอุปกรณ์เสริม',
         'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2000&auto=format&fit=crop', '/rooms'),
        ('MFU Co-Working Space เปิดให้บริการ 24 ชั่วโมง',
         'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2000&auto=format&fit=crop', '/rooms')
      `);
      console.log("  ✅ Added 3 banners");
    } else {
      console.log("  ℹ️  Banners already exist");
    }

    // ============================================================
    // 6. SAMPLE BOOKINGS — 5 รายการจองตัวอย่าง
    // ============================================================
    console.log("\n📋 Seeding Sample Bookings...");
    const bookingCount = await query("SELECT COUNT(*) FROM bookings");
    if (parseInt(bookingCount.rows[0].count as string) === 0) {
      // Get first user IDs and room IDs
      const allUsers = await query("SELECT id, email, user_type FROM users ORDER BY id LIMIT 5");
      const allRooms = await query("SELECT id, name FROM rooms WHERE is_active = true ORDER BY id LIMIT 5");

      if (allUsers.rows.length >= 2 && allRooms.rows.length >= 3) {
        const bookings = [
          {
            booking_no: "BK-DEMO-0001",
            user_id: allUsers.rows[1]?.id || 1, // staff
            room_id: allRooms.rows[0]?.id || 1,
            organization_type: "internal",
            partner_name: "สำนักวิชาเทคโนโลยีสารสนเทศ",
            booking_date: "2026-09-15",
            time_slot: "full",
            objective: "ประชุมคณะกรรมการประจำสำนักวิชา ครั้งที่ 5/2569",
            room_price: 1000,
            addons_price: 700,
            total_price: 1700,
            status: "pending",
            payment_status: "unpaid",
          },
          {
            booking_no: "BK-DEMO-0002",
            user_id: allUsers.rows[2]?.id || allUsers.rows[1]?.id || 1, // staff 2
            room_id: allRooms.rows[1]?.id || 1,
            organization_type: "internal",
            partner_name: "ศูนย์บริการเทคโนโลยีสารสนเทศ (CITS)",
            booking_date: "2026-09-18",
            time_slot: "half_morning",
            objective: "อบรมเชิงปฏิบัติการ Digital Literacy สำหรับบุคลากรใหม่",
            room_price: 1000,
            addons_price: 1400,
            total_price: 2400,
            status: "approved",
            payment_status: "verified",
          },
          {
            booking_no: "BK-DEMO-0003",
            user_id: allUsers.rows[3]?.id || allUsers.rows[1]?.id || 1, // student
            room_id: allRooms.rows[2]?.id || 1,
            organization_type: "internal",
            partner_name: "สโมสรนักศึกษา มหาวิทยาลัยแม่ฟ้าหลวง",
            booking_date: "2026-09-20",
            time_slot: "half_afternoon",
            objective: "กิจกรรมปฐมนิเทศนักศึกษาชั้นปีที่ 1 สำนักวิชา IT",
            room_price: 800,
            addons_price: 200,
            total_price: 1000,
            status: "pending",
            payment_status: "unpaid",
            promo_code: "STUDENT10",
          },
          {
            booking_no: "BK-DEMO-0004",
            user_id: allUsers.rows[4]?.id || allUsers.rows[1]?.id || 1, // external
            room_id: allRooms.rows[3]?.id || allRooms.rows[0]?.id || 1,
            organization_type: "external",
            partner_name: "บริษัท ABC Training จำกัด",
            booking_date: "2026-09-22",
            time_slot: "full",
            objective: "จัดอบรมสัมมนาเชิงพาณิชย์ — AI & Digital Transformation",
            room_price: 6000,
            addons_price: 1900,
            total_price: 7900,
            status: "approved",
            payment_status: "pending_verification",
          },
          {
            booking_no: "BK-DEMO-0005",
            user_id: allUsers.rows[1]?.id || 1, // staff
            room_id: allRooms.rows[4]?.id || allRooms.rows[0]?.id || 1,
            organization_type: "internal",
            partner_name: "สำนักวิชาวิทยาศาสตร์",
            booking_date: "2026-09-25",
            time_slot: "full",
            objective: "สอบปฏิบัติการปลายภาค วิชา Computer Programming",
            room_price: 500,
            addons_price: 0,
            total_price: 500,
            status: "disapproved",
            payment_status: "unpaid",
          },
        ];

        for (const b of bookings) {
          const existing = await query("SELECT id FROM bookings WHERE booking_no = $1", [b.booking_no]);
          if (existing.rows.length === 0) {
            await query(
              `INSERT INTO bookings (
                booking_no, user_id, room_id, organization_type, partner_name,
                booking_date, time_slot, objective, room_price, addons_price,
                total_price, status, payment_status, promo_code
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
              [
                b.booking_no, b.user_id, b.room_id, b.organization_type, b.partner_name,
                b.booking_date, b.time_slot, b.objective, b.room_price, b.addons_price,
                b.total_price, b.status, b.payment_status, (b as any).promo_code || null,
              ]
            );
            console.log(`  ✅ Booking: ${b.booking_no} — ${b.status} (${b.objective.slice(0, 40)}...)`);
          } else {
            console.log(`  ℹ️  Booking exists: ${b.booking_no}`);
          }
        }
      } else {
        console.log("  ⚠️  ข้อมูล users/rooms ไม่พอสำหรับสร้าง sample bookings");
      }
    } else {
      console.log("  ℹ️  Bookings already exist, skipping sample data");
    }

    // ============================================================
    // 7. ACTIVITY LOGS — บันทึกกิจกรรม admin ตัวอย่าง
    // ============================================================
    console.log("\n📝 Seeding Activity Logs...");
    const logCount = await query("SELECT COUNT(*) FROM admin_activity_logs");
    if (parseInt(logCount.rows[0].count as string) === 0) {
      const logs = [
        { admin_name: "สมชาย จัดการทรัพย์สิน", action: "อนุมัติคำขอจอง", details: "อนุมัติคำขอจองหมายเลข BK-DEMO-0002 — อบรมเชิงปฏิบัติการ Digital Literacy" },
        { admin_name: "สมชาย จัดการทรัพย์สิน", action: "ปฏิเสธคำขอจอง", details: "ปฏิเสธคำขอจองหมายเลข BK-DEMO-0005 — เนื่องจากห้องปฏิบัติการปิดปรับปรุง" },
        { admin_name: "สมชาย จัดการทรัพย์สิน", action: "ยืนยันการชำระเงิน", details: "ตรวจสอบสลิปการโอนเงินสำหรับคำขอ BK-DEMO-0002 เรียบร้อยแล้ว" },
        { admin_name: "สมชาย จัดการทรัพย์สิน", action: "สร้างรหัสส่วนลด", details: "สร้าง Promo Code: MFUWELCOME ลด 100 บาท จำกัด 200 ครั้ง" },
      ];

      for (const log of logs) {
        await query(
          "INSERT INTO admin_activity_logs (admin_name, action, details) VALUES ($1, $2, $3)",
          [log.admin_name, log.action, log.details]
        );
      }
      console.log(`  ✅ Added ${logs.length} activity logs`);
    } else {
      console.log("  ℹ️  Activity logs already exist");
    }

    // ============================================================
    // 8. FEEDBACKS — รีวิวตัวอย่าง
    // ============================================================
    console.log("\n⭐ Seeding Feedbacks...");
    const feedbackCount = await query("SELECT COUNT(*) FROM feedbacks");
    if (parseInt(feedbackCount.rows[0].count as string) === 0) {
      // Get approved booking for feedback
      const approvedBooking = await query(
        "SELECT id FROM bookings WHERE status = 'approved' LIMIT 1"
      );
      if (approvedBooking.rows.length > 0) {
        await query(
          "INSERT INTO feedbacks (booking_id, rating, comment) VALUES ($1, $2, $3)",
          [approvedBooking.rows[0].id, 5, "ห้องสะอาด อุปกรณ์พร้อมใช้งาน ระบบจองสะดวกมากครับ ขอบคุณครับ"]
        );
        console.log("  ✅ Added sample feedback (5 stars)");
      }
    } else {
      console.log("  ℹ️  Feedbacks already exist");
    }

    // ============================================================
    // Summary
    // ============================================================
    console.log("\n" + "=".repeat(60));
    console.log("✨ UAT Demo Seed Completed Successfully!");
    console.log("=".repeat(60));

    const counts = {
      users: (await query("SELECT COUNT(*) FROM users")).rows[0].count,
      rooms: (await query("SELECT COUNT(*) FROM rooms WHERE is_active = true")).rows[0].count,
      addons: (await query("SELECT COUNT(*) FROM addons WHERE is_active = true")).rows[0].count,
      promos: (await query("SELECT COUNT(*) FROM promo_codes")).rows[0].count,
      banners: (await query("SELECT COUNT(*) FROM banners")).rows[0].count,
      bookings: (await query("SELECT COUNT(*) FROM bookings")).rows[0].count,
      logs: (await query("SELECT COUNT(*) FROM admin_activity_logs")).rows[0].count,
    };

    console.log(`\n📊 Database Summary:`);
    console.log(`   👤 Users:          ${counts.users}`);
    console.log(`   🏢 Rooms:          ${counts.rooms}`);
    console.log(`   🔧 Add-ons:        ${counts.addons}`);
    console.log(`   🏷️  Promo Codes:    ${counts.promos}`);
    console.log(`   🖼️  Banners:        ${counts.banners}`);
    console.log(`   📋 Bookings:       ${counts.bookings}`);
    console.log(`   📝 Activity Logs:  ${counts.logs}`);

    console.log(`\n🔑 Demo Login Accounts:`);
    console.log(`   Admin:    admin.demo@property.mfu.ac.th`);
    console.log(`   Staff:    wichai.staff@mfu.ac.th / suda.staff@mfu.ac.th`);
    console.log(`   Student:  piya.student@lamduan.mfu.ac.th`);
    console.log(`   External: john.external@company.com`);

    console.log(`\n🏷️  Demo Promo Codes:`);
    console.log(`   MFUWELCOME — ลด ฿100 (ใช้ได้ 200 ครั้ง)`);
    console.log(`   PROMO2026  — ลด ฿200 (ใช้ได้ 100 ครั้ง)`);
    console.log(`   STUDENT10  — ลด ฿50  (ใช้ได้ 500 ครั้ง)\n`);

  } catch (err: any) {
    console.error("\n❌ Seed Error:", err.message);
    console.error(err.stack);
  } finally {
    await pool.end();
    process.exit();
  }
}

seedDemo();
