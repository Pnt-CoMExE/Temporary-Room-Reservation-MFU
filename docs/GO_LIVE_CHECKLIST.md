# Go-Live Checklist

ใช้ก่อนเปิดใช้งานจริง (หรือ demo ให้หน่วยงาน)

## Environment

- [ ] `JWT_SECRET` และ `SESSION_SECRET` เปลี่ยนจากค่า default
- [ ] `POSTGRES_PASSWORD` ตั้งรหัสแข็งแรง
- [ ] `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` ตั้งค่าแล้ว
- [ ] `GOOGLE_CALLBACK_URL` ตรงกับ URL ที่ลงทะเบียนใน Google Console
- [ ] `FRONTEND_URL` ตั้งค่าถูกต้อง
- [ ] `PAYMENT_PROVIDER` ตั้งตามนโยบาย (ปัจจุบัน: `mock_sandbox` สำหรับ UAT)
- [ ] `SMTP_*` ตั้งค่าเมื่อได้เมลเซิร์ฟเวอร์จาก มฟล. (ถ้ายังไม่มี → อีเมล log ที่ console)
- [ ] `DEV_ADMIN_EMAILS` ตั้งสำหรับผู้ทดสอบ Admin (ถ้าจำเป็น)

## ข้อมูล

- [ ] รัน `npm run seed:production` (หรือ import ข้อมูลห้องจริงจาก Excel)
- [ ] ตรวจสอบอัตราค่าบริการตรงกับ `data/room-pricing-rates.xlsx`
- [ ] ไม่มีข้อมูล demo bookings ใน production

## ทดสอบ

- [ ] `npm test` ผ่านทั้งหมด (backend)
- [ ] `npm run typecheck` ผ่าน (backend + frontend)
- [ ] `npm run build` ผ่าน (frontend)
- [ ] UAT Sign-Off ลงนามแล้ว (`docs/UAT_SIGNOFF.md`)

## Docker / Deploy

- [ ] `docker compose -f docker-compose.prod.yml up -d --build` สำเร็จ
- [ ] Health check API ตอบ 200
- [ ] Login ด้วย Google OAuth สำเร็จ
- [ ] Flow จอง → อนุมัติ → ชำระเงิน (mock) → ยืนยัน ครบ

## หลัง Go-Live

- [ ] ตั้ง cron backup (`backend/scripts/backup.sh`)
- [ ] มอบหมายผู้ดูแลระบบ @property.mfu.ac.th
- [ ] แจ้งช่องทาง support ให้ผู้ใช้
