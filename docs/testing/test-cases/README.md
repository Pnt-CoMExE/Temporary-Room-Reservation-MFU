# Test Cases — ตามโฟลว์การใช้งาน

เรียงตามลำดับใช้งานจริง: **ผู้ใช้จอง** → **แอดมินจัดการ** → **ข้ามระบบ**

| เอกสาร | ลิงก์ |
|--------|------|
| ตารางรวม + สภาพแวดล้อม | [`../TEST_CASE_TRACKER.md`](../TEST_CASE_TRACKER.md) |
| แผนที่รหัสใหม่ ↔ เดิม (หลักฐาน) | [`_id-map.md`](./_id-map.md) |
| Setup SMTP (GitHub README) | [`../../../README.md#34-smtp-email-notifications-recommended-for-uat`](../../../README.md#34-smtp-email-notifications-recommended-for-uat) |

**อัปเดต:** 2026-11-03 · รวม **80** เคส (ผ่านครบ)  
**Payment (05):** 4 เคส — Stripe + เมล/PDF ใบอนุญาตอังกฤษ (TC-PAY-03/04) · ไม่ใช้ mock ใน product path  
**Email (12):** ตรวจวัน/ช่วงเวลาในเมล · เมลหลังจ่ายดูที่โฟลว์ 05

## เฟส A — ผู้ใช้

| # | โฟลว์ | ไฟล์ | เคส |
|---|--------|------|------|
| 01 | Auth — เข้าสู่ระบบ / สิทธิ์ | [`01-auth.md`](./01-auth.md) | 9 |
| 02 | Home / Rooms — ค้นหาห้อง | [`02-home-rooms.md`](./02-home-rooms.md) | 6 |
| 03 | Booking — ส่งคำขอจอง | [`03-booking.md`](./03-booking.md) | 10 |
| 04 | User Dashboard — ติดตามคำขอ | [`04-user-dashboard.md`](./04-user-dashboard.md) | 7 |
| 05 | Payment — ชำระเงิน (Stripe · เมล+PDF EN) | [`05-payment.md`](./05-payment.md) | 4 |

## เฟส B — แอดมิน

| # | โฟลว์ | ไฟล์ | เคส |
|---|--------|------|------|
| 06 | Admin Dashboard | [`06-admin-dashboard.md`](./06-admin-dashboard.md) | 2 |
| 07 | Admin Bookings — พิจารณาคำขอ | [`07-admin-bookings.md`](./07-admin-bookings.md) | 9 |
| 08 | Admin Rooms / Add-ons | [`08-admin-rooms-addons.md`](./08-admin-rooms-addons.md) | 7 |
| 09 | Admin Content — Banner / Promo / ประกาศ | [`09-admin-content.md`](./09-admin-content.md) | 9 |
| 10 | Admin Users / Logs | [`10-admin-users-logs.md`](./10-admin-users-logs.md) | 6 |

## เฟส C — ข้ามระบบ

| # | โฟลว์ | ไฟล์ | เคส |
|---|--------|------|------|
| 11 | i18n — ภาษาไทย / อังกฤษ | [`11-i18n.md`](./11-i18n.md) | 7 |
| 12 | Edge / Email / Responsive (วัน+slot ในเมล) | [`12-edge-email.md`](./12-edge-email.md) | 4 |

**รวมทั้งหมด: 80 เคส** (ผ่านครบ)

### ลำดับแนะนำตอนรัน

```
Auth → Home/Rooms → Booking → User Dashboard → Payment
     → Admin Dashboard → Admin Bookings → Rooms/Add-ons
     → Content → Users/Logs → i18n → Edge/Email
```

> ไฟล์เก่า `kom.md` / `cee.md` / `part.md` / `jay.md` เป็น redirect มาที่นี่
