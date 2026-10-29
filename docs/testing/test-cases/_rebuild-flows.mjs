/**
 * Rebuild flow-based test case docs (readable layout).
 * Run: node docs/testing/test-cases/_rebuild-flows.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));
const testingRoot = path.join(root, "..");

/**
 * @typedef {{ id: string, old: string, name: string, page: string, steps: string, expect: string, result: string, evidence: string, note?: string }} Case
 * @typedef {{ file: string, title: string, phase: string, blurb: string, sections: { heading: string, cases: Case[] }[] }} Flow
 */

/** @type {Flow[]} */
const flows = [
  {
    file: "01-auth",
    title: "1. Auth — เข้าสู่ระบบ / สิทธิ์",
    phase: "ผู้ใช้",
    blurb: "Login ตามโดเมน · Logout · กันหน้าที่ต้อง auth · กัน Admin",
    sections: [
      {
        heading: "Login ตามประเภทผู้ใช้",
        cases: [
          { id: "TC-AUTH-01", old: "TC-U-01", name: "Login บุคลากรภายใน (internal)", page: "`/`", steps: "Sign in with Google → บัญชี internal", expect: "เข้าได้ · Role=internal · ไป `/home`", result: "✅", evidence: "`evidence/CCC/TC-U-01.png`", note: "UAT ใช้ `DEV_INTERNAL_EMAILS` ได้ถ้าไม่มี `@mfu.ac.th`" },
          { id: "TC-AUTH-02", old: "TC-U-02", name: "Login `@lamduan.mfu.ac.th`", page: "`/`", steps: "Sign in → เมล lamduan", expect: "Role=external · ไป `/home`", result: "✅", evidence: "`evidence/CCC/TC-U-02.png`", note: "ถอดเมลออกจาก `DEV_INTERNAL_EMAILS` ชั่วคราวถ้าเคยบังคับ internal" },
          { id: "TC-AUTH-03", old: "TC-U-03", name: "Login โดเมนอื่น (เช่น Gmail)", page: "`/`", steps: "Sign in → `@gmail.com`", expect: "Role=external · ไป `/home`", result: "✅", evidence: "`evidence/CCC/TC-U-03.png`" },
        ],
      },
      {
        heading: "Session / Logout / Guard",
        cases: [
          { id: "TC-AUTH-04", old: "TC-U-04", name: "ออกจากระบบ", page: "Navbar", steps: "เมนู → ออกจากระบบ → ยืนยัน", expect: "กลับ Login · ลบ session", result: "✅", evidence: "`evidence/JJ/TC-U-04.png`" },
          { id: "TC-AUTH-05", old: "TC-U-05", name: "เปิดหน้า protected โดยไม่ login", page: "`/home`", steps: "เปิด `/home` โดยตรง", expect: "Redirect Login", result: "✅", evidence: "`evidence/CCC/TC-U-05.png`" },
          { id: "TC-AUTH-06", old: "TC-E-02", name: "Session หมด / ไม่มี token", page: "`/dashboard`", steps: "ลบ cookie/session → เปิดหน้า auth", expect: "Redirect Login", result: "✅", evidence: "`evidence/CoM/TC-E-02.png`" },
        ],
      },
      {
        heading: "AuthZ — กันหน้า Admin",
        cases: [
          { id: "TC-AUTH-07", old: "TC-E-03", name: "User ทั่วไปเปิด `/admin`", page: "`/admin/dashboard`", steps: "Login user → เปิด Admin", expect: "กันเข้า / ส่งกลับ `/home`", result: "✅", evidence: "`evidence/CoM/TC-E-03.png`" },
          { id: "TC-AUTH-08", old: "TC-Z-01", name: "ยืนยัน AuthZ หน้า Admin", page: "`/admin/dashboard`", steps: "Login non-admin → `/admin`", expect: "กันเข้าได้", result: "✅", evidence: "`evidence/CoM/TC-Z-01.png`", note: "เคสยืนยันซ้ำของ AuthZ UI" },
          { id: "TC-AUTH-09", old: "TC-Z-02", name: "Unit test AuthZ", page: "backend", steps: "`cd backend && npm test`", expect: "ชุดเทส AuthZ ผ่าน", result: "✅", evidence: "`evidence/CoM/README.md`" },
        ],
      },
    ],
  },
  {
    file: "02-home-rooms",
    title: "2. Home / Rooms — ค้นหาห้อง",
    phase: "ผู้ใช้",
    blurb: "หน้าหลัก Featured → รายการห้อง → กรอง/ค้นหา → รายละเอียด",
    sections: [
      {
        heading: "หน้าหลัก",
        cases: [
          { id: "TC-HOME-01", old: "TC-U-06", name: "Banner + Featured Rooms", page: "`/home`", steps: "Login → `/home`", expect: "เห็นแบนเนอร์และห้องแนะนำ", result: "✅", evidence: "`evidence/JJ/TC-U-06.png`" },
        ],
      },
      {
        heading: "รายการและค้นหา",
        cases: [
          { id: "TC-ROOM-01", old: "TC-U-07", name: "หน้ารายการห้อง", page: "`/rooms`", steps: "เปิดเมนูห้องทั้งหมด", expect: "การ์ดมีรูป ชื่อ ราคา", result: "✅", evidence: "`evidence/CCC/TC-U-07.png`" },
          { id: "TC-ROOM-02", old: "TC-U-08", name: "กรองประเภทพื้นที่", page: "`/rooms`", steps: "เลือกประเภท เช่น Meeting Room", expect: "เหลือเฉพาะประเภทนั้น", result: "✅", evidence: "`evidence/CCC/TC-U-08.png`" },
          { id: "TC-ROOM-03", old: "TC-U-09", name: "ค้นหาภาษาไทย", page: "`/rooms`", steps: "พิมพ์คำค้นไทย", expect: "ผลตรงชื่อ", result: "✅", evidence: "`evidence/CCC/TC-U-09.png`" },
          { id: "TC-ROOM-04", old: "TC-U-10", name: "ค้นหาภาษาอังกฤษ", page: "`/rooms`", steps: "พิมพ์คำค้น EN", expect: "ผลสอดคล้องกับค้นไทย", result: "✅", evidence: "`evidence/CCC/TC-U-10.png`" },
        ],
      },
      {
        heading: "รายละเอียดห้อง",
        cases: [
          { id: "TC-ROOM-05", old: "TC-U-11", name: "หน้ารายละเอียดห้อง", page: "`/rooms/:id`", steps: "คลิกการ์ดห้อง", expect: "รูป ความจุ ที่ตั้ง ราคาตามเรทผู้ใช้ ปฏิทิน", result: "✅", evidence: "`evidence/CCC/TC-U-11.png`", note: "สามเรทเต็มอยู่ที่ตารางแอดมิน" },
        ],
      },
    ],
  },
  {
    file: "03-booking",
    title: "3. Booking — ส่งคำขอจอง",
    phase: "ผู้ใช้",
    blurb: "เลือกวัน/ช่วง → Add-on/โปรโม → แนบ PDF → ส่ง · ตามด้วยเคส error",
    sections: [
      {
        heading: "Happy path",
        cases: [
          { id: "TC-BOOK-01", old: "TC-U-13", name: "เลือกวันและช่วงเวลา", page: "`/booking/:id`", steps: "เลือกวัน → เช้า/บ่าย/เต็มวัน", expect: "ราคาเปลี่ยนตามช่วง", result: "✅", evidence: "`evidence/CCC/TC-U-13.png`" },
          { id: "TC-BOOK-02", old: "TC-U-14", name: "เลือก Add-on", page: "`/booking/:id`", steps: "เลือกอุปกรณ์เสริม", expect: "ราคารวมอัปเดตถูกต้อง", result: "✅", evidence: "`evidence/CCC/TC-U-14.png`" },
          { id: "TC-BOOK-03", old: "TC-U-15", name: "ใช้รหัสส่วนลดที่ถูกต้อง", page: "`/booking/:id`", steps: "ใส่โปรโมที่ใช้ได้ → ตรวจสอบ", expect: "ลดราคาตามเงื่อนไข", result: "✅", evidence: "`evidence/CoM/TC-U-15.png`", note: "เช่น `MFUWELCOME`" },
          { id: "TC-BOOK-04", old: "TC-U-12", name: "ส่งคำขอจองครบถ้วน", page: "`/booking/:id`", steps: "กรอกครบ → แนบ PDF → ส่ง", expect: "สำเร็จ · ไป `/dashboard` · รออนุมัติ", result: "✅", evidence: "`evidence/CoM/TC-U-12.png`" },
        ],
      },
      {
        heading: "Validation / Error",
        cases: [
          { id: "TC-BOOK-05", old: "TC-E-04", name: "ส่งฟอร์มว่าง", page: "`/booking/:id`", steps: "กดส่งโดยไม่กรอก", expect: "validation error", result: "✅", evidence: "`evidence/CCC/TC-E-04.png`" },
          { id: "TC-BOOK-06", old: "TC-U-17", name: "ไม่แนบ PDF", page: "`/booking/:id`", steps: "กรอกครบแต่ไม่แนบ → ส่ง", expect: "ขอแนบเอกสาร · ไม่สร้างจอง", result: "✅", evidence: "`evidence/CCC/TC-U-17.png`" },
          { id: "TC-BOOK-07", old: "TC-U-18", name: "แนบไฟล์ไม่ใช่ PDF", page: "`/booking/:id`", steps: "แนบ `.txt` → ส่ง", expect: "รับเฉพาะ PDF", result: "✅", evidence: "`evidence/CoM/TC-U-18.png`" },
          { id: "TC-BOOK-08", old: "TC-E-05", name: "ไฟล์เกินขนาด", page: "`/booking/:id`", steps: "แนบ PDF ~15MB → ส่ง", expect: "error ไฟล์ใหญ่เกินไป", result: "✅", evidence: "`evidence/CoM/TC-E-05.png`", note: "ลิมิต 10MB" },
          { id: "TC-BOOK-09", old: "TC-U-16", name: "รหัสส่วนลดไม่มีจริง", page: "`/booking/:id`", steps: "ใส่รหัสผิด → ตรวจสอบ", expect: "error รหัสไม่ถูกต้อง", result: "✅", evidence: "`evidence/CoM/TC-U-16.png`" },
          { id: "TC-BOOK-10", old: "TC-U-19", name: "จองซ้ำช่วงเวลาเดียวกัน", page: "`/booking/:id`", steps: "มีจองทับช่วงแล้ว → จองซ้ำ", expect: "ช่วงไม่ว่าง / error", result: "✅", evidence: "`evidence/CoM/TC-U-19.png`" },
        ],
      },
    ],
  },
  {
    file: "04-user-dashboard",
    title: "4. User Dashboard — ติดตามคำขอ",
    phase: "ผู้ใช้",
    blurb: "ดู/กรอง/ค้นหาจอง · ยกเลิก · รีวิว · โปรไฟล์",
    sections: [
      {
        heading: "รายการจอง",
        cases: [
          { id: "TC-UDASH-01", old: "TC-U-20", name: "ดูรายการจองของตัวเอง", page: "`/dashboard`", steps: "เข้า `/dashboard`", expect: "เห็นจอง + badge สถานะ", result: "✅", evidence: "`evidence/CCC/TC-U-20.png`" },
          { id: "TC-UDASH-02", old: "TC-U-21", name: "กรองตามสถานะ", page: "`/dashboard`", steps: "เลือก filter สถานะ", expect: "เหลือเฉพาะสถานะนั้น", result: "✅", evidence: "`evidence/CCC/TC-U-21.png`" },
          { id: "TC-UDASH-03", old: "TC-U-22", name: "ค้นหาเลขที่จอง", page: "`/dashboard`", steps: "พิมพ์เลข booking", expect: "เจอรายการตรงเลข", result: "✅", evidence: "`evidence/CCC/TC-U-22.png`" },
          { id: "TC-UDASH-04", old: "TC-U-25", name: "ยกเลิกคำขอ (pending)", page: "`/dashboard`", steps: "ยกเลิก → ยืนยัน", expect: "สถานะยกเลิกแล้ว", result: "✅", evidence: "`evidence/CCC/TC-U-25.png`" },
          { id: "TC-UDASH-05", old: "TC-U-26", name: "ส่งรีวิวความพึงพอใจ", page: "`/dashboard`", steps: "ให้ดาว + คอมเมนต์ → ส่ง", expect: "บันทึกรีวิวสำเร็จ", result: "✅", evidence: "`evidence/CCC/TC-U-26.png`" },
        ],
      },
      {
        heading: "โปรไฟล์",
        cases: [
          { id: "TC-UDASH-06", old: "TC-U-27", name: "ดูข้อมูลส่วนตัว", page: "`/dashboard` โปรไฟล์", steps: "เปิดแท็บโปรไฟล์", expect: "ชื่อ อีเมล Role เบอร์", result: "✅", evidence: "`evidence/CCC/TC-U-27.png`" },
          { id: "TC-UDASH-07", old: "TC-U-28", name: "แก้ไขเบอร์โทร", page: "`/dashboard` โปรไฟล์", steps: "แก้เบอร์ → บันทึก", expect: "ค่าคงหลังรีโหลด", result: "✅", evidence: "`evidence/CCC/TC-U-28.png`" },
        ],
      },
    ],
  },
  {
    file: "05-payment",
    title: "5. Payment — ชำระเงิน",
    phase: "ผู้ใช้",
    blurb: "Stripe checkout + Transaction ID · Mock Sandbox",
    sections: [
      {
        heading: "Stripe",
        cases: [
          { id: "TC-PAY-01", old: "TC-P-R4-01", name: "ชำระผ่าน Stripe checkout", page: "`/dashboard`", steps: "`PAYMENT_PROVIDER=stripe` → ชำระ → checkout → callback", expect: "สถานะชำระแล้ว (`approved_paid`)", result: "✅", evidence: "`evidence/CoM/TC-P-R4-01.png`" },
          { id: "TC-PAY-02", old: "TC-P-R4-02", name: "อ่าน Transaction ID หลัง callback", page: "`/dashboard`", steps: "ต่อจาก TC-PAY-01", expect: "มี Tx ID + สถานะจ่ายแล้ว", result: "✅", evidence: "`evidence/CoM/TC-P-R4-02.png`" },
        ],
      },
      {
        heading: "Mock (UAT ไม่ตัดบัตร)",
        cases: [
          { id: "TC-PAY-03", old: "TC-U-24b", name: "จำลองชำระ Mock Sandbox", page: "`/dashboard`", steps: "`PAYMENT_PROVIDER=mock_sandbox` → จำลองชำระ", expect: "อัปเดตสถานะโดยไม่โอนจริง", result: "✅", evidence: "`evidence/Parttime/TC-U-24b.png`" },
        ],
      },
    ],
  },
  {
    file: "06-admin-dashboard",
    title: "6. Admin Dashboard",
    phase: "แอดมิน",
    blurb: "สถิติและเมนูแอดมิน",
    sections: [
      {
        heading: "ภาพรวม",
        cases: [
          { id: "TC-ADM-DASH-01", old: "TC-A-01", name: "Dashboard สถิติ", page: "`/admin/dashboard`", steps: "Login admin → เปิด dashboard", expect: "กราฟ/สถิติจอง", result: "✅", evidence: "`evidence/JJ/TC-A-01.png`" },
          { id: "TC-ADM-DASH-02", old: "TC-A-02", name: "Sidebar ครบ", page: "`/admin/*`", steps: "ตรวจเมนูด้านข้าง", expect: "แท็บหลักครบ", result: "✅", evidence: "`evidence/JJ/TC-A-02.png`" },
        ],
      },
    ],
  },
  {
    file: "07-admin-bookings",
    title: "7. Admin Bookings — พิจารณาคำขอ",
    phase: "แอดมิน",
    blurb: "รายการ → กรอง → พรีวิว → อนุมัติ/เรท → ปฏิเสธ → เอกสาร",
    sections: [
      {
        heading: "รายการและกรอง",
        cases: [
          { id: "TC-ADM-BOOK-01", old: "TC-A-03", name: "ดูรายการคำขอจอง", page: "Admin คำขอจอง", steps: "เปิดแท็บคำขอจอง", expect: "ตารางเลขที่ ผู้จอง ห้อง วัน สถานะ เอกสาร", result: "✅", evidence: "`evidence/Parttime/TC-A-03.png`" },
          { id: "TC-ADM-BOOK-02", old: "TC-A-04", name: "กรองตามสถานะ", page: "Admin คำขอจอง", steps: "filter รออนุมัติ", expect: "เฉพาะ pending", result: "✅", evidence: "`evidence/Parttime/TC-A-04.png`" },
        ],
      },
      {
        heading: "อนุมัติ / เรท / พรีวิว",
        cases: [
          { id: "TC-ADM-BOOK-03", old: "TC-A-R4-02", name: "Preview เอกสารก่อนอนุมัติ", page: "Admin confirm", steps: "เปิด confirm → ดู preview", expect: "เห็น PDF/รูป", result: "✅", evidence: "`evidence/Parttime/TC-A-R4-02.png`" },
          { id: "TC-ADM-BOOK-04", old: "TC-A-05", name: "อนุมัติคำขอ (แนบใบ+confirm)", page: "Admin คำขอจอง", steps: "แนบใบอนุมัติ → อนุมัติ → ยืนยัน", expect: "สถานะรอชำระเงิน", result: "✅", evidence: "`evidence/CoM/TC-A-05.png`" },
          { id: "TC-ADM-BOOK-05", old: "TC-A-R4-01", name: "เลือกเรทตอนอนุมัติ", page: "Admin confirm", steps: "อนุมัติ → เลือกเรท → ยืนยัน", expect: "เรทและราคาตรงที่เลือก", result: "✅", evidence: "`evidence/CoM/TC-A-R4-01.png`" },
          { id: "TC-ADM-BOOK-06", old: "TC-A-R4-03", name: "Log เปลี่ยนเรท", page: "Admin กิจกรรม", steps: "อนุมัติพร้อมเปลี่ยนเรท → ดู log", expect: "มีเรท/ราคาเก่า→ใหม่", result: "✅", evidence: "`evidence/CoM/TC-A-R4-03.png`" },
        ],
      },
      {
        heading: "ปฏิเสธและเอกสาร",
        cases: [
          { id: "TC-ADM-BOOK-07", old: "TC-A-06", name: "ปฏิเสธคำขอจอง", page: "Admin คำขอจอง", steps: "ปฏิเสธ → ใส่เหตุผล → ยืนยัน", expect: "disapproved · ผู้ใช้เห็นเหตุผล", result: "✅", evidence: "`evidence/Parttime/TC-A-06-admin.png` + `TC-A-06-user.png`" },
          { id: "TC-ADM-BOOK-08", old: "TC-A-07", name: "ดาวน์โหลด Memo", page: "Admin คำขอจอง", steps: "คลิกลิงก์เอกสาร", expect: "เปิด/ดาวน์โหลด PDF ได้", result: "✅", evidence: "`evidence/Parttime/TC-A-07.png`" },
          { id: "TC-ADM-BOOK-09", old: "TC-A-08", name: "ส่งออก ZIP", page: "Admin คำขอจอง", steps: "ติ๊กหลายรายการ → ดาวน์โหลด ZIP", expect: "ZIP แยกตาม booking_no", result: "✅", evidence: "`evidence/Parttime/TC-A-08.png`" },
        ],
      },
    ],
  },
  {
    file: "08-admin-rooms-addons",
    title: "8. Admin Rooms / Add-ons",
    phase: "แอดมิน",
    blurb: "จัดการห้อง · Import Excel · ราคา Add-on",
    sections: [
      {
        heading: "ห้อง",
        cases: [
          { id: "TC-ADM-ROOM-01", old: "TC-A-11", name: "ดูรายการห้อง", page: "Admin ห้อง", steps: "เปิดแท็บจัดการห้อง", expect: "ตาราง + active/inactive", result: "✅", evidence: "`evidence/JJ/TC-A-11.png`" },
          { id: "TC-ADM-ROOM-02", old: "TC-A-12", name: "เปิด/ปิดห้อง", page: "Admin ห้อง", steps: "Toggle → ตรวจ `/rooms`", expect: "ห้องปิดไม่โชว์ฝั่งผู้ใช้", result: "✅", evidence: "`evidence/Parttime/TC-A-12-admin.png` + `TC-A-12-user.png`" },
        ],
      },
      {
        heading: "Import Excel",
        cases: [
          { id: "TC-ADM-ROOM-03", old: "TC-A-23", name: "Import เทมเพลตถูกต้อง", page: "Admin ห้อง", steps: "ใช้ `room-pricing-rates.xlsx` → Import", expect: "สำเร็จ + นับรายการ", result: "✅", evidence: "`evidence/CoM/TC-A-23.png`" },
          { id: "TC-ADM-ROOM-04", old: "TC-A-24", name: "Import ไฟล์ผิดรูปแบบ", page: "Admin ห้อง", steps: "อัปโหลดไฟล์ว่าง/คอลัมน์ผิด", expect: "error ไม่พบข้อมูลห้อง", result: "✅", evidence: "`evidence/CoM/TC-A-24.png`" },
          { id: "TC-ADM-ROOM-05", old: "TC-A-25", name: "จำนวนห้องสมเหตุสมผล", page: "Admin ห้อง", steps: "Import → นับแถว", expect: "ไม่เป็น 0 / ใกล้เคียงไฟล์", result: "✅", evidence: "`evidence/CoM/TC-A-25.png`" },
          { id: "TC-ADM-ROOM-06", old: "TC-A-26", name: "ราคาครึ่ง/เต็มวันถูกต้อง", page: "Admin ห้อง", steps: "เทียบราคากับ Excel", expect: "half/full 3 เรทตรง", result: "✅", evidence: "`evidence/CoM/TC-A-26.png`" },
        ],
      },
      {
        heading: "Add-on",
        cases: [
          { id: "TC-ADM-ADDON-01", old: "TC-A-27", name: "แก้ราคา Add-on", page: "Admin อุปกรณ์เสริม", steps: "แก้ราคา → บันทึก → เปิดหน้าจอง", expect: "ราคาตาม DB", result: "✅", evidence: "`evidence/CoM/TC-A-27.png`", note: "restore หลังเทส" },
        ],
      },
    ],
  },
  {
    file: "09-admin-content",
    title: "9. Admin Content — Banner / Promo / ประกาศ",
    phase: "แอดมิน",
    blurb: "แบนเนอร์หน้าแรก · ประกาศ · รหัสส่วนลด",
    sections: [
      {
        heading: "Banner / Broadcast",
        cases: [
          { id: "TC-ADM-BAN-01", old: "TC-A-13", name: "ดูรายการแบนเนอร์", page: "Admin แบนเนอร์", steps: "เปิดแท็บบันเนอร์", expect: "รายการ + preview", result: "✅", evidence: "`evidence/JJ/TC-A-13.png`" },
          { id: "TC-ADM-BAN-02", old: "TC-A-14", name: "เพิ่มแบนเนอร์", page: "Admin แบนเนอร์", steps: "กรอก + อัปโหลด → บันทึก", expect: "โชว์ใน admin และ `/home`", result: "✅", evidence: "`evidence/JJ/TC-A-14.png`" },
          { id: "TC-ADM-BAN-03", old: "TC-A-15", name: "เปิด/ปิดแบนเนอร์", page: "Admin แบนเนอร์", steps: "Toggle", expect: "ที่ปิดไม่โชว์ `/home`", result: "✅", evidence: "`evidence/JJ/TC-A-15(admin).png`" },
          { id: "TC-ADM-BAN-04", old: "TC-A-15b", name: "ลบแบนเนอร์", page: "Admin แบนเนอร์", steps: "ลบ → ยืนยัน", expect: "หายจาก admin และ `/home`", result: "✅", evidence: "`evidence/JJ/TC-A-15b(admin).png`" },
          { id: "TC-ADM-BAN-05", old: "TC-A-15c", name: "ส่งประกาศ Broadcast", page: "Admin", steps: "ส่งประกาศ", expect: "ผู้ใช้เห็นในกระดิ่ง Navbar", result: "✅", evidence: "`evidence/JJ/TC-A-15c.png`" },
        ],
      },
      {
        heading: "Promo codes",
        cases: [
          { id: "TC-ADM-PROMO-01", old: "TC-A-16", name: "ดูรายการ Promo", page: "Admin โปรโม", steps: "เปิดแท็บรหัสส่วนลด", expect: "เห็นรหัส + สถิติ", result: "✅", evidence: "`evidence/JJ/TC-A-16.png`" },
          { id: "TC-ADM-PROMO-02", old: "TC-A-17", name: "สร้าง Promo ใหม่", page: "Admin โปรโม", steps: "กรอกฟอร์ม → สร้าง", expect: "ใช้ได้ตอนจอง", result: "✅", evidence: "`evidence/JJ/TC-A-17.png`" },
          { id: "TC-ADM-PROMO-03", old: "TC-A-18", name: "เปิด/ปิด Promo", page: "Admin โปรโม", steps: "Toggle", expect: "รหัสที่ปิดใช้ไม่ได้", result: "✅", evidence: "`evidence/JJ/TC-A-18.png`" },
          { id: "TC-ADM-PROMO-04", old: "TC-A-28", name: "ไม่มีปุ่มลบ Promo (เหลือ toggle)", page: "Admin โปรโม", steps: "ตรวจ UI · ลอง DELETE API", expect: "มีเปิด/ปิด ไม่มีลบ · DELETE → 403", result: "✅", evidence: "`evidence/JJ/TC-A-28.png`" },
        ],
      },
    ],
  },
  {
    file: "10-admin-users-logs",
    title: "10. Admin Users / Logs",
    phase: "แอดมิน",
    blurb: "ผู้ใช้ · Promote Admin · บันทึกกิจกรรม",
    sections: [
      {
        heading: "Users",
        cases: [
          { id: "TC-ADM-USER-01", old: "TC-A-19", name: "ดูรายการผู้ใช้", page: "Admin Users", steps: "เปิดแท็บผู้ใช้", expect: "ชื่อ อีเมล Role สถิติ", result: "✅", evidence: "`evidence/JJ/TC-A-19.png`" },
          { id: "TC-ADM-USER-02", old: "TC-A-20", name: "ค้นหาผู้ใช้", page: "Admin Users", steps: "พิมพ์ชื่อ/อีเมล", expect: "กรองตรง", result: "✅", evidence: "`evidence/JJ/TC-A-20.png`" },
          { id: "TC-ADM-USER-03", old: "TC-U-02b", name: "Promote เป็น admin", page: "Admin Users", steps: "ตั้ง Role=admin", expect: "ได้สิทธิ์ admin หลัง login", result: "✅", evidence: "`evidence/Parttime/TC-U-02b.png`", note: "promote ได้เฉพาะ `@mfu.ac.th`" },
          { id: "TC-ADM-USER-04", old: "TC-A-21", name: "เปลี่ยน Role / Demote", page: "Admin Users", steps: "ตั้ง/ถอด Admin", expect: "Role อัปเดตสำเร็จ", result: "✅", evidence: "`evidence/Parttime/TC-A-21.png`" },
          { id: "TC-ADM-USER-05", old: "TC-A-R4-04", name: "ไม่มีปุ่มตั้ง Co-op", page: "Admin Users", steps: "ดูปุ่มจัดการ Role", expect: "ไม่มีปุ่มตั้ง Co-op", result: "✅", evidence: "`evidence/JJ/TC-A-R4-04.png`" },
        ],
      },
      {
        heading: "Activity log",
        cases: [
          { id: "TC-ADM-LOG-01", old: "TC-A-22", name: "ดูบันทึกกิจกรรม", page: "Admin Logs", steps: "เปิดแท็บบันทึกกิจกรรม", expect: "เห็นการกระทำ รายละเอียด เวลา", result: "✅", evidence: "`evidence/JJ/TC-A-22.png`" },
        ],
      },
    ],
  },
  {
    file: "11-i18n",
    title: "11. i18n — ภาษาไทย / อังกฤษ",
    phase: "ข้ามระบบ",
    blurb: "สลับภาษาทั้ง Navbar, Login, Modal, ชื่อห้อง, สถานะ, Footer",
    sections: [
      {
        heading: "สลับภาษา",
        cases: [
          { id: "TC-I18N-01", old: "TC-I-01", name: "TH → EN", page: "Navbar", steps: "กดเปลี่ยนภาษา", expect: "ข้อความเป็นอังกฤษ", result: "✅", evidence: "`evidence/CCC/TC-I-01.png`" },
          { id: "TC-I18N-02", old: "TC-I-02", name: "EN → TH", page: "Navbar", steps: "สลับกลับ", expect: "ข้อความเป็นไทย", result: "✅", evidence: "`evidence/CCC/TC-I-02.png`" },
          { id: "TC-I18N-03", old: "TC-I-03", name: "หน้า Login สลับภาษา", page: "Login", steps: "สลับภาษาบน Login", expect: "หัวข้อ/ปุ่มเปลี่ยนถูก", result: "✅", evidence: "`evidence/CCC/TC-I-03.png`" },
          { id: "TC-I18N-04", old: "TC-I-04", name: "Modal สลับภาษา", page: "Modal", steps: "เปิด Modal → สลับภาษา", expect: "ข้อความใน Modal ถูก", result: "✅", evidence: "`evidence/CCC/TC-I-04.png`" },
          { id: "TC-I18N-05", old: "TC-I-05", name: "ชื่อห้องแปลอัตโนมัติ", page: "`/rooms`", steps: "สลับ EN → ดูชื่อห้อง", expect: "ชื่อตาม translator", result: "✅", evidence: "`evidence/CCC/TC-I-05.png`" },
          { id: "TC-I18N-06", old: "TC-I-06", name: "สถานะจองแปลอัตโนมัติ", page: "`/dashboard`", steps: "สลับ EN → ดูสถานะ", expect: "สถานะเป็น EN", result: "✅", evidence: "`evidence/CCC/TC-I-06.png`" },
          { id: "TC-I18N-07", old: "TC-I-07", name: "Footer สลับภาษา", page: "Footer", steps: "สลับภาษา", expect: "Footer เปลี่ยนภาษา", result: "✅", evidence: "`evidence/CCC/TC-I-07.png`" },
        ],
      },
    ],
  },
  {
    file: "12-edge-email",
    title: "12. Edge / Email / Responsive",
    phase: "ข้ามระบบ",
    blurb: "404 · Mobile · อีเมลแจ้งเตือน",
    sections: [
      {
        heading: "Edge / UI",
        cases: [
          { id: "TC-EDGE-01", old: "TC-E-01", name: "URL ไม่มีอยู่ → 404", page: "`/nonexistent`", steps: "เปิด URL มั่ว", expect: "หน้า 404", result: "✅", evidence: "`evidence/CCC/TC-E-01.png`" },
          { id: "TC-EDGE-02", old: "TC-E-06", name: "Responsive mobile", page: "ทั้งระบบ", steps: "DevTools iPhone/Pixel", expect: "ไม่มีเลื่อนแนวนอนผิดปกติ", result: "✅", evidence: "`evidence/JJ/TC-E-06.png`" },
        ],
      },
      {
        heading: "อีเมล",
        cases: [
          { id: "TC-EMAIL-01", old: "TC-E-07", name: "อีเมลยืนยันหลังจอง", page: "อีเมล / console", steps: "ส่งจอง → ดู inbox หรือ backend log", expect: "มีอีเมลยืนยัน (หรือ log ถ้ายังไม่มี SMTP)", result: "✅", evidence: "`evidence/Parttime/TC-E-07.png`" },
          { id: "TC-EMAIL-02", old: "TC-E-08", name: "อีเมลแจ้งผลอนุมัติ/ปฏิเสธ", page: "อีเมล / console", steps: "Admin อนุมัติหรือปฏิเสธ → ดู inbox", expect: "มีอีเมลแจ้งผล (หรือ log)", result: "✅", evidence: "`evidence/Parttime/TC-E-08.png`" },
        ],
      },
    ],
  },
];

function countCases(flow) {
  return flow.sections.reduce((n, s) => n + s.cases.length, 0);
}

function caseRow(c) {
  const note = c.note || "";
  return `| ${c.id} | ${c.name} | ${c.page} | ${c.steps} | ${c.expect} | ${c.result} | ${c.evidence} | ${note} |`;
}

function writeFlowFile(flow) {
  const n = countCases(flow);
  const parts = [
    `# ${flow.title}`,
    "",
    `**เฟส:** ${flow.phase}  ·  **จำนวน:** ${n} เคส`,
    "",
    `> ${flow.blurb}`,
    "",
    "ตารางรวมทุกโฟลว์: [`../TEST_CASE_TRACKER.md`](../TEST_CASE_TRACKER.md)  ·  แผนที่รหัสเก่า: [`_id-map.md`](./_id-map.md)",
    "",
    "| ผล | ความหมาย |",
    "|----|----------|",
    "| ✅ | ผ่าน |",
    "| ❌ | ไม่ผ่าน |",
    "| ⬜ | ยังไม่ทดสอบ |",
    "",
  ];

  for (const sec of flow.sections) {
    parts.push(`## ${sec.heading}`, "");
    parts.push(
      "| TC# | ชื่อเคส | หน้า | ขั้นตอน | คาดหวัง | ผล | หลักฐาน | หมายเหตุ |",
      "|-----|---------|------|---------|---------|----|---------|----------|",
    );
    for (const c of sec.cases) parts.push(caseRow(c));
    parts.push("");
  }

  parts.push("---", "", "← [ดัชนีโฟลว์](./README.md)");
  fs.writeFileSync(path.join(root, `${flow.file}.md`), parts.join("\n") + "\n", "utf8");
}

function writeReadme(flowsList, total) {
  const lines = [
    "# Test Cases — ตามโฟลว์การใช้งาน",
    "",
    "เรียงตามลำดับใช้งานจริง: **ผู้ใช้จอง** → **แอดมินจัดการ** → **ข้ามระบบ**",
    "",
    "| เอกสาร | ลิงก์ |",
    "|--------|------|",
    "| ตารางรวม + สภาพแวดล้อม | [`../TEST_CASE_TRACKER.md`](../TEST_CASE_TRACKER.md) |",
    "| แผนที่รหัสใหม่ ↔ เดิม (หลักฐาน) | [`_id-map.md`](./_id-map.md) |",
    "",
    "## เฟส A — ผู้ใช้",
    "",
    "| # | โฟลว์ | ไฟล์ | เคส |",
    "|---|--------|------|------|",
  ];

  const byPhase = { ผู้ใช้: [], แอดมิน: [], "ข้ามระบบ": [] };
  for (const f of flowsList) byPhase[f.phase].push(f);

  const emit = (phase, label) => {
    if (label) {
      lines.push("", `## ${label}`, "");
      lines.push("| # | โฟลว์ | ไฟล์ | เคส |", "|---|--------|------|------|");
    }
    for (const f of byPhase[phase]) {
      const short = f.title.replace(/^\d+\.\s*/, "");
      const num = f.file.slice(0, 2);
      lines.push(
        `| ${num} | ${short} | [\`${f.file}.md\`](./${f.file}.md) | ${countCases(f)} |`,
      );
    }
  };

  // first phase already started header
  for (const f of byPhase["ผู้ใช้"]) {
    const short = f.title.replace(/^\d+\.\s*/, "");
    const num = f.file.slice(0, 2);
    lines.push(
      `| ${num} | ${short} | [\`${f.file}.md\`](./${f.file}.md) | ${countCases(f)} |`,
    );
  }
  emit("แอดมิน", "เฟส B — แอดมิน");
  emit("ข้ามระบบ", "เฟส C — ข้ามระบบ");

  lines.push(
    "",
    `**รวมทั้งหมด: ${total} เคส** (ผ่านครบ)`,
    "",
    "### ลำดับแนะนำตอนรัน",
    "",
    "```",
    "Auth → Home/Rooms → Booking → User Dashboard → Payment",
    "     → Admin Dashboard → Admin Bookings → Rooms/Add-ons",
    "     → Content → Users/Logs → i18n → Edge/Email",
    "```",
    "",
    "> ไฟล์เก่า `kom.md` / `cee.md` / `part.md` / `jay.md` เป็น redirect มาที่นี่",
  );

  fs.writeFileSync(path.join(root, "README.md"), lines.join("\n") + "\n", "utf8");
}

function writeIdMap(all) {
  const lines = [
    "# แผนที่รหัส TC (ใหม่ → เดิม)",
    "",
    "ใช้จับคู่ไฟล์หลักฐานใน `docs/testing/evidence/` ที่ยังตั้งชื่อตามรหัสเก่า",
    "",
    "| ใหม่ | เดิม | ชื่อเคส |",
    "|------|------|---------|",
  ];
  for (const c of all) {
    lines.push(`| ${c.id} | ${c.old} | ${c.name} |`);
  }
  fs.writeFileSync(path.join(root, "_id-map.md"), lines.join("\n") + "\n", "utf8");
}

function writeTracker(flowsList, total) {
  const lines = [
    "# Test Case Tracker",
    "",
    "**อัปเดต:** 2026-10-30  ·  **รวม:** " + total + " เคส (ผ่านครบ)",
    "",
    "ดัชนีไฟล์: [`test-cases/README.md`](./test-cases/README.md)  ·  แผนที่รหัส: [`test-cases/_id-map.md`](./test-cases/_id-map.md)",
    "",
    "---",
    "",
    "## วิธีใช้ (สั้น)",
    "",
    "1. เปิดไฟล์โฟลว์ตามลำดับในดัชนี",
    "2. ทำตาม **ขั้นตอน** → เทียบ **คาดหวัง**",
    "3. เก็บ screenshot ตามคอลัมน์ **หลักฐาน** (ชื่อไฟล์ = รหัสเก่า)",
    "4. อัปเดต **ผล** ในไฟล์โฟลว์และตารางด้านล่าง",
    "",
    "| ผล | ความหมาย |",
    "|----|----------|",
    "| ✅ | ผ่าน |",
    "| ❌ | ไม่ผ่าน |",
    "| ⬜ | ยังไม่ทดสอบ |",
    "",
    "---",
    "",
    "## สภาพแวดล้อม",
    "",
    "| | Dev | Docker UAT |",
    "|--|------|------------|",
    "| Frontend | `http://localhost:5173` | `http://localhost:8080` |",
    "| API | `http://localhost:3000` | `http://localhost:8080/api` |",
    "| Payment | `stripe` หรือ `mock_sandbox` | ตั้งใน `.env` |",
    "| Admin bootstrap | `DEV_ADMIN_EMAILS` | เหมือนกัน |",
    "",
    "Role จากอีเมล: `@mfu.ac.th` → internal · อื่นๆ → external · admin = promote / `DEV_ADMIN_EMAILS`",
    "",
    "---",
    "",
    "## สารบัญโฟลว์",
    "",
  ];

  for (const f of flowsList) {
    const n = countCases(f);
    lines.push(
      `- [${f.title}](./test-cases/${f.file}.md) (${n})`,
    );
  }

  lines.push("", "---", "");

  for (const f of flowsList) {
    lines.push(`## ${f.title}`, "");
    lines.push(`*${f.phase}* — ${f.blurb}`, "");
    lines.push(`รายละเอียดเต็ม: [\`test-cases/${f.file}.md\`](./test-cases/${f.file}.md)`, "");
    for (const sec of f.sections) {
      lines.push(`### ${sec.heading}`, "");
      lines.push(
        "| TC# | ชื่อเคส | หน้า | ขั้นตอน | คาดหวัง | ผล | หลักฐาน |",
        "|-----|---------|------|---------|---------|----|---------|",
      );
      for (const c of sec.cases) {
        lines.push(
          `| ${c.id} | ${c.name} | ${c.page} | ${c.steps} | ${c.expect} | ${c.result} | ${c.evidence} |`,
        );
      }
      lines.push("");
    }
    lines.push("---", "");
  }

  lines.push(
    "## สรุป",
    "",
    `| รวม | **${total}** |`,
    `| ผ่าน | **${total}** |`,
    "",
    "ก่อนเทส (ถ้าต้องการข้อมูลตัวอย่าง): `cd backend && npm run seed:demo`",
    "",
    "หลักฐาน: [`evidence/`](./evidence/)",
  );

  fs.writeFileSync(
    path.join(testingRoot, "TEST_CASE_TRACKER.md"),
    lines.join("\n") + "\n",
    "utf8",
  );
}

// --- run ---
const all = [];
for (const f of flows) {
  writeFlowFile(f);
  for (const s of f.sections) all.push(...s.cases);
}
const total = all.length;
writeReadme(flows, total);
writeIdMap(all);
writeTracker(flows, total);

for (const p of ["kom", "cee", "part", "jay"]) {
  fs.writeFileSync(
    path.join(root, `${p}.md`),
    `# ย้ายแล้ว → จัดตามโฟลว์\n\nดูดัชนี: [README.md](./README.md)\n\nตารางรวม: [../TEST_CASE_TRACKER.md](../TEST_CASE_TRACKER.md)\n`,
    "utf8",
  );
}

console.log(`ok: ${flows.length} flows, ${total} cases`);
