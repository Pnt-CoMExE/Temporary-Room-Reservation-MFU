# Recording 3 — Action Plan (Advisor Feedback)

**อัปเดต:** 2026-09-15  
**ที่มา:** Standard recording 3 (2026-09-11 14:42–15:42) — Testing / Security / Payment + UX / Admin / Dashboard

เอกสารประกอบ:
- [`FRIDAY_DEMO_PREP.md`](./FRIDAY_DEMO_PREP.md)
- [`DEMO_SECURITY.md`](./DEMO_SECURITY.md)
- [`TESTING_PLAN.md`](./TESTING_PLAN.md)
- [`PAYMENT_STRIPE_NOTES.md`](./PAYMENT_STRIPE_NOTES.md)

---

## สรุปเทียบ meeting ↔ สถานะปัจจุบัน

| # | หัวข้อใน meeting | Verdict | รายละเอียดสั้น |
|---|------------------|---------|----------------|
| 1 | สิทธิ์ Admin / Internal / External + Google SSO | **Done** | Admin = promote ใน Users / `DEV_ADMIN_EMAILS`; Internal = `@mfu.ac.th` ตรงๆ; External = `@lamduan.mfu.ac.th` + อื่นๆ — **ไม่**ใช้ `@property.mfu.ac.th` อัตโนมัติ |
| 2 | UI/UX: CBA/zebra, hover, สถานะสีเดียวกัน, ปุ่ม≠สถานะ, ขอบชัด | **Done** | + ไอคอนสถานะครบชุด |
| 3 | รูปห้องหลากหลายต่อห้อง | **Partial** | SVG หลากหลายตาม id — ยังไม่ใช่รูปถ่ายจริง |
| 4 | โปรไฟล์: แก้ชื่อได้ + บังคับเบอร์ | **Done** | Dashboard / Booking form |
| 5 | สถานะจอง: แยกจ่ายแล้ว vs สำเร็จแล้ว + อัปเดตตามวันเวลา | **Done** | + รีวิวได้หลัง `completed` |
| 6 | Dashboard: filter ช่วงวัน / สถานะ / รายได้ / สัดส่วน / แนวโน้มปี | **Done** | รวมโหมด **ทั้งหมด** (`scope=all`) |
| 7 | อัตราใช้งานห้องตามช่วง filter | **Done** | % จากจำนวนจองในช่วงที่กรอง (top 5) |
| 8 | Log ผูกการจอง + ดูประวัติ | **Done** | `booking_id` + ปุ่มใน AdminBookings |
| 9 | อธิบาย AuthN / AuthZ (JWT, cookie) | **Done** | [`DEMO_SECURITY.md`](./DEMO_SECURITY.md) |
| 10 | แผนทดสอบ FE/BE + ความปลอดภัย | **Done** | checklist ใน TESTING_PLAN ติ๊กแล้ว (CI + automated) |
| 11 | พิจารณา Payment Gateway (Stripe) | **Partial** | โน้ตศึกษา — ยังไม่ผูก Stripe |

### Drift จากถ้อยคำ meeting (ตั้งใจ / แก้แล้ว)

| Meeting บอก | ความจริงในระบบ | หมายเหตุ |
|-------------|----------------|----------|
| Internal = `@mw.ac.th` | `@mfu.ac.th` | น่าจะพิมพ์ผิดในสรุปประชุม |
| Admin จาก domain `@property...` หรือ hardcode | promote ใน DB + `DEV_ADMIN_EMAILS` | ยืดหยุ่นตามข้อเสนอ “เก็บ admin / env” โดยไม่พึ่งเมลที่ไม่มีจริง |
| Pending → Approved → รอจ่าย → จ่าย → สำเร็จ (รีวิวหรือเลยวัน) | อนุมัติแล้วเข้า `รอชำระเงิน` เลย; รีวิว = badge แยก ไม่ใช่เงื่อนไข `completed` | แยกจ่ายแล้ว / สำเร็จแล้ว / มีรีวิว ชัดกว่า meeting |
| อาจไม่ต้องใช้ cron | มี cron ตามวัน+ช่วงเวลา (เช้า/บ่าย/เต็มวัน) | ตรงเจตนา “เลยวันใช้งานแล้วเปลี่ยนสถานะ” |

---

## สถานะจอง (canonical)

| โค้ด DB | แสดง UI (TH) | หมายเหตุ |
|---------|--------------|----------|
| `pending` | รออนุมัติ | |
| `approved_pending_payment` | รอชำระเงิน | หลัง admin อนุมัติ |
| `approved_paid` | **ชำระเงินแล้ว** | |
| `completed` | **สำเร็จแล้ว** | Cron: หลังเลยวัน/เวลาใช้งาน |
| (+ `has_feedback`) | **มีรีวิวแล้ว** | badge แยก — ตาราง `feedbacks` |
| `disapproved` | ไม่อนุมัติ | |
| cancelled / `ยกเลิกแล้ว` | ยกเลิกแล้ว | Cron ยกเลิก pending / รอชำระที่เลยวัน |

Shared util: `frontend/src/utils/bookingStatus.ts`  
Job: `cd backend && npm run jobs:booking-status`

---

## Role policy (ปัจจุบัน)

```text
@mfu.ac.th (โดเมนตรงๆ)     → internal
@lamduan.mfu.ac.th / อื่นๆ → external
admin                       → promote ใน Admin Users (เก็บ DB) หรือ DEV_ADMIN_EMAILS (bootstrap/UAT)
```

โค้ด: `backend/src/utils/resolveUserType.ts`

---

## เฟสงาน (implementation)

| เฟส | งาน | สถานะ |
|-----|-----|--------|
| **1** | UX สถานะสีชัด + แยกชำระ/รีวิว + ตาราง zebra/hover + ปุ่ม action | **Done** |
| **2** | Admin enable/disable; Users สถิติ; บังคับเบอร์; promote admin | **Done** |
| **3** | Dashboard date range + สถานะ/รายได้ตามช่วง | **Done** (ขาด all-time → Partial ในตารางบน) |
| **4** | Log ผูก `booking_id` + คอลัมน์ดูประวัติ | **Done** |
| **5** | Cron อัปเดตสถานะอัตโนมัติ | **Done** |
| **6** | TESTING_PLAN + PAYMENT_STRIPE_NOTES | **Done** (เอกสาร); Stripe ยังไม่ integrate |
| **7** | Featured by frequency, date TZ, admin reason, logout | **Done** (2026-09-15) |
| **8** | Role: admin via promote; mfu internal; lamduan external | **Done** (2026-09-15) |

---

## Gap ที่ยังเปิด (ถ้าจะปิดต่อ)

1. ~~**รูปห้องจริงหลายรูป**~~ → มีชุด SVG หลากหลายตาม room id (`/images/rooms/room-0N.svg`) — รูปถ่ายจริงยังอัปโหลดทีหลังได้  
2. ~~**Dashboard filter “ทั้งหมด”**~~ → โหมด `ทั้งหมด` + `?scope=all`  
3. ~~**Stripe adapter**~~ → ยังเป็นเอกสารเท่านั้น (ไม่บล็อก demo)  
4. ~~**ปิด checklist manual / Postman**~~ → ติ๊กแล้วใน TESTING_PLAN (อิง CI + automated)  
5. ~~**ไอคอนสถานะ**~~ → `getBookingStatusIcon` + แสดงใน User/Admin  
6. ~~**รีวิวหลัง completed**~~ → `canLeaveReview` รวม `approved_paid` + `completed`  
7. (ทางเลือก) รูปถ่ายจริงต่อห้องแทน SVG  

---

## Phase notes (อ้างอิงโค้ด)

### Phase 1–2
- `bookingStatus.ts`, AdminBookings, DashboardView, i18n  
- `users.is_active`, AdminUsers promote/demote, โปรไฟล์เบอร์โทร  

### Phase 3
- `GET /api/admin/stats?from&to`, revenue by year/range, AdminDashboard filters  

### Phase 4–5
- `admin_activity_logs.booking_id`, `GET /api/admin/logs?bookingId=`  
- `backend/scripts/auto-update-booking-status.ts`  

### Phase 6
- [`TESTING_PLAN.md`](./TESTING_PLAN.md), [`PAYMENT_STRIPE_NOTES.md`](./PAYMENT_STRIPE_NOTES.md)  

### UX polish
- Card contrast / `shadow-card*` ใน `main.css`  
- Room images: placeholder ชั่วคราว (`frontend/src/utils/roomImage.ts`)  
