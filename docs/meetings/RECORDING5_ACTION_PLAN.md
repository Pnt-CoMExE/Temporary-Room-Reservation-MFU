# Recording 5 — Action Plan (Advisor Feedback)

**อัปเดต:** 2026-10-22  
**ที่มา:** Standard recording 5 (2026-10-21 12:50–14:11) — UI booking / Promo+Add-on / Excel import / AuthZ / เอกสารโครงงาน

เอกสารประกอบ:
- [`RECORDING4_ACTION_PLAN.md`](./RECORDING4_ACTION_PLAN.md)
- [`TEST_CASE_TRACKER.md`](../testing/TEST_CASE_TRACKER.md)
- [`STRIPE.md`](../payment/STRIPE.md)
- [`requirements.md`](../product/requirements.md)
- [`SETUP_FROM_ENV_EXAMPLE.md`](../ops/SETUP_FROM_ENV_EXAMPLE.md)

---

## สรุปเทียบ meeting ↔ สถานะ

| # | หัวข้อใน meeting | Verdict | รายละเอียดสั้น |
|---|------------------|---------|----------------|
| 1 | แยกดีไซน์ half day / full day + สถานะจองให้ต่างชัด | **Done** | `RoomDetailView` การ์ดครึ่งวัน (amber) / เต็มวัน (แดง) + badge สถานะจาก `bookingStatus` |
| 2 | อุปกรณ์เสริม: ใช้รูปแทนไอคอนเล็ก | **Done** | `BookingView` + `resolveAddonImage` + SVG ใน `public/images/addons/` |
| 3 | แยกรายการค่าห้อง vs ค่าอุปกรณ์เสริม | **Done** | สรุปราคาหน้าจอง: `room_fee` / `addons_fee` / สุทธิ |
| 4 | แอดมินแก้ราคา add-on ได้ (ไม่ hard code) | **Done** | `AdminAddons` + `GET/POST/PUT /api/admin/addons` · หน้าจองอ่านจาก DB · เพิ่มรายการใหม่ได้ |
| 5 | Promo: ห้ามลบ — ใช้เปิด/ปิดอย่างเดียว | **Done** | UI ไม่มีปุ่มลบ · `DELETE` → 403 |
| 6 | Test case Import Excel (เทมเพลต / จำนวน / ราคา) | **Done** | TC-A-23…26 ✅ · หลักฐานใน `evidence/CoM/` |
| 7 | คนไม่มีสิทธิ์ admin ไม่มีปุ่มตั้งเป็น admin | **Done*** | หน้า Users หลัง admin guard · TC-Z-01 / E-03 |
| 8 | กันเข้าหน้าจัดการผ่าน URL โดยตรง | **Done** | TC-E-03 · TC-Z-01 ✅ |
| 9 | เอกสารบทที่ 4: Checklist ตาม Scope + ตัวอย่าง TC + ลิงก์ฉบับเต็ม | **Done** | [`THESIS_CHAPTERS_CHECKLIST.md`](../product/THESIS_CHAPTERS_CHECKLIST.md) |
| 10 | ปรับบทที่ 3 และ 5 + คู่มือติดตั้ง / ตั้งค่า API Key | **Done** | [`SETUP_FROM_ENV_EXAMPLE.md`](../ops/SETUP_FROM_ENV_EXAMPLE.md) |

\*ข้อ 6: เคสในตารางแล้ว — ทีมแนบรูปใน `evidence/` ตอน UAT  
\*ข้อ 7: ปุ่ม promote มีเฉพาะใน Admin

---

## เฟสงาน Recording 5

| เฟส | งาน | สถานะ |
|-----|-----|--------|
| **A** | เอกสารแผน R5 + แมปสถานะ | **Done** |
| **B** | UI half/full ในหน้ารายละเอียดห้องก่อนจอง + สถานะ · รูป add-on · แยกบิลห้อง/อุปกรณ์ | **Done** |
| **C** | Admin แก้ราคา add-on ได้ | **Done** |
| **D** | เอาปุ่มลบ promo ออก (เหลือเปิด/ปิด) | **Done** |
| **E** | TC Import Excel + หลักฐาน | **Done** |
| **F** | ยืนยัน AuthZ (ปุ่ม promote / URL admin) ในเอกสาร/หลักฐาน | **Done*** |
| **G** | เอกสารบท 3–5 + คู่มือติดตั้ง/API Key บน GitHub | **Done** |

---

## รายการงานย่อย

### B — UX รายละเอียดห้อง / จอง / แสดงราคา
- [x] `/rooms/:id`: แยกสไตล์ half vs full
- [x] badge สถานะจองสีต่างกัน
- [x] add-on เป็นรูป
- [x] สรุปราคา: ค่าห้อง + ค่าอุปกรณ์ แยกกัน

### C — ราคา add-on แก้ได้
- [x] schema / API
- [x] UI แอดมิน (`AdminAddons`)
- [x] หน้าจองอ่านจาก DB

### D — Promo ไม่ลบ
- [x] ซ่อนปุ่มลบใน `AdminPromoCodes.vue`
- [x] DELETE → 403
- [x] TC-A-28 ใน tracker

### E — Import Excel TC
- [x] TC-A-23…26 ใน tracker
- [x] แนบหลักฐานใน `docs/testing/evidence/CoM/` (TC-A-23…26)
- [x] Playwright: `frontend/e2e/r5-phase-e-import.spec.ts`

### G — เอกสารสอบ
- [x] บทที่ 4 checklist + ลิงก์ tracker
- [x] โน้ตบทที่ 3 และ 5
- [x] คู่มือจาก `.env.example`
- [x] อธิบาย API Key + Stripe · ห้าม commit `.env`

---

## สรุปจากที่ประชุม

ตรวจระบบจองแล้ว มีข้อเสนอแนะเรื่อง UI ราคา/add-on, ห้ามลบ promo, TC import Excel, AuthZ, และเอกสารเตรียมสอบ — ปิดโค้ด/เอกสาร + หลักฐาน TC-A-23…28 แล้ว · Excel มาตรฐานมี **96 ห้อง**
