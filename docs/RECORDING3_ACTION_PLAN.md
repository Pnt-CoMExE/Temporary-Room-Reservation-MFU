# Recording 3 — Action Plan (Advisor Feedback)

**อัปเดต:** 2026-09-11  
**ที่มา:** Standard recording 3 — Testing / Security / Payment + UX / Admin / Dashboard

เอกสาร Demo / Security / Testing ที่มีอยู่:
- [`FRIDAY_DEMO_PREP.md`](./FRIDAY_DEMO_PREP.md)
- [`DEMO_SECURITY.md`](./DEMO_SECURITY.md)
- [`TESTING_PLAN.md`](./TESTING_PLAN.md)
- [`PAYMENT_STRIPE_NOTES.md`](./PAYMENT_STRIPE_NOTES.md)

---

## สถานะจอง (canonical)

| โค้ด DB | แสดง UI (TH) | หมายเหตุ |
|---------|--------------|----------|
| `pending` | รออนุมัติ | |
| `approved_pending_payment` | รอชำระเงิน | |
| `approved_paid` | **ชำระแล้ว** | ไม่ใช้คำว่า “สำเร็จแล้ว” รวมรีวิว |
| (+ `has_feedback`) | **มีรีวิวแล้ว** (badge แยก) | ตาราง `feedbacks` ไม่ใช่ status ใหม่ |
| `disapproved` | ไม่อนุมัติ | |
| cancelled / `ยกเลิกแล้ว` | ยกเลิกแล้ว | Cron อาจตั้งให้อัตโนมัติเมื่อเลยวัน |

Shared util: `frontend/src/utils/bookingStatus.ts`

---

## เฟสงาน

| เฟส | งาน | สถานะ |
|-----|-----|--------|
| **1** | UX สถานะสีชัด + แยกชำระ/รีวิว + ตาราง zebra/hover + ปุ่ม action สม่ำเสมอ | **Done** |
| **2** | จัดการแอดมิน enable/disable; Users เน้นสถิติ; บังคับเบอร์โทร | **Done** |
| **3** | Dashboard date range + กล่องสถานะ/รายได้ตามช่วง | **Done** |
| **4** | Log ผูก booking_id + คอลัมน์ดูประวัติใน AdminBookings | **Done** |
| **5** | Cron อัปเดตสถานะอัตโนมัติ | **Done** (`npm run jobs:booking-status`) |
| **6** | Testing ขยาย + Payment Stripe notes | **Done** |

---

## Phase 1 — สิ่งที่เปลี่ยน

- `bookingStatus.ts`, AdminBookings, DashboardView, i18n status_*

## Phase 2

- `users.is_active` + `PUT /api/admin/users/:id/active`
- OAuth ปฏิเสธบัญชีที่ถูกปิด
- AdminUsers เน้นสถิติ + เปิด/ปิด; Role จำกัด admin↔internal
- โปรไฟล์บังคับเบอร์โทร

## Phase 3

- `GET /api/admin/stats?from&to` → pending / approved / paid / revenue
- Revenue ตามปีหรือช่วงวัน
- AdminDashboard date filter UI

## Phase 4

- `admin_activity_logs.booking_id`
- `GET /api/admin/logs?bookingId=`
- ปุ่มดูประวัติใน AdminBookings

## Phase 5

- `backend/scripts/auto-update-booking-status.ts`
- ยกเลิก `approved_pending_payment` / `pending` ที่เลย `booking_date`

## Phase 6

- TESTING_PLAN §8 Postman + Manual
- PAYMENT_STRIPE_NOTES.md
