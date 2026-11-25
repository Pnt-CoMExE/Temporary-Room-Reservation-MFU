# Go-Live Checklist

ใช้ก่อนเปิดใช้งานจริง (หรือ demo ให้หน่วยงาน)

## Environment

- [ ] `JWT_SECRET` และ `SESSION_SECRET` เปลี่ยนจากค่า default
- [ ] `POSTGRES_PASSWORD` ตั้งรหัสแข็งแรง
- [ ] `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` ตั้งค่าแล้ว
- [ ] `GOOGLE_CALLBACK_URL` ตรงกับ URL ที่ลงทะเบียนใน Google Console
- [ ] `FRONTEND_URL` ตั้งค่าถูกต้อง
- [ ] `PAYMENT_PROVIDER=stripe` + `STRIPE_SECRET_KEY` (test สำหรับ UAT / live สำหรับ production — ดู `docs/payment/STRIPE.md`)
- [ ] `SMTP_*` ตั้งค่าเมื่อได้เมลเซิร์ฟเวอร์จาก มฟล. (ถ้ายังไม่มี → อีเมล log ที่ console)
- [ ] `DEV_ADMIN_EMAILS` ตั้งสำหรับผู้ทดสอบ Admin (ถ้าจำเป็น)

## ข้อมูล

- [ ] รัน `npm run seed:production` (หรือ import ข้อมูลห้องจริงจาก Excel)
- [ ] ตรวจสอบอัตราค่าบริการตรงกับ `data/room-pricing-rates.xlsx` (ดาวน์โหลดเทมเพลตจาก Admin Rooms = ไฟล์นี้)
- [ ] หลัง Import ตรวจว่าห้องที่ไม่อยู่ในไฟล์ถูกปิดบริการ (ไม่ลบ booking เก่า)
- [ ] ไม่มีข้อมูล demo bookings ใน production

## ทดสอบ

- [ ] `npm test` ผ่านทั้งหมด (backend)
- [ ] `npm run typecheck` ผ่าน (backend + frontend)
- [ ] `npm run build` ผ่าน (frontend)
- [ ] UAT Sign-Off ลงนามแล้ว (`docs/testing/UAT_SIGNOFF.md`)
- [ ] Flow อนุมัติแบบ **คิดเงิน** → Stripe → อีเมล + PDF permit
- [ ] Flow อนุมัติแบบ **ยกเว้นค่าธรรมเนียม** → `approved_waived` · ยอด 0 · อีเมล · ไม่ Stripe
- [ ] Admin Dashboard: filter วันที่ sync สถิติ/utilization + **Export Excel** ได้

## Docker / Deploy

- [ ] `docker compose -f docker-compose.prod.yml up -d --build` สำเร็จ
- [ ] Health check API ตอบ 200
- [ ] Login ด้วย Google OAuth สำเร็จ
- [ ] Flow จอง → อนุมัติ → ชำระเงิน (Stripe) → อีเมล + PDF permit ครบ
- [ ] อ่าน [`CITS_RUNBOOK.md`](./CITS_RUNBOOK.md) ครบ (waive / import template / export)

## หลัง Go-Live

- [ ] ตั้ง cron backup (`backend/scripts/backup.sh`)
- [ ] ตั้ง cron สถานะจอง (`cd backend && npm run jobs:booking-status` รายวัน) — รวม `approved_waived` → `completed`
- [ ] มอบหมายผู้ดูแลระบบ (promote ในหน้า Admin Users; **ถอด** `DEV_ADMIN_EMAILS` บนเซิร์ฟจริง)
- [ ] แจ้งช่องทาง support ให้ผู้ใช้
- [ ] ส่งมอบ `data/room-pricing-rates.xlsx` ล่าสุด + บัญชี admin ให้ส่วนทรัพย์สิน
