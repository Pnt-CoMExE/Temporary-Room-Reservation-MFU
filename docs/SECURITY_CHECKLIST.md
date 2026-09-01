# Security Checklist (Sprint 5)

## Authentication & Authorization

- [x] Google OAuth 2.0 สำหรับ login
- [x] JWT หมดอายุ 8 ชั่วโมง
- [x] `resolveUserType()` กำหนด role จากโดเมนอีเมล
- [x] `verifyAdmin` middleware บน admin API routes
- [x] Frontend guard `requiresAdmin` สำหรับ `/admin/*`
- [x] `DEV_ADMIN_EMAILS` สำหรับ UAT เท่านั้น (ปิดใน production จริง)

## HTTP Security

- [x] Helmet security headers
- [x] CORS จำกัด origin (`FRONTEND_URL`)
- [x] Rate limiting (`generalLimiter`, `authLimiter`, `bookingLimiter`)
- [x] Cookie `httpOnly`, `secure` ใน production
- [x] Session `saveUninitialized: false`
- [x] `JWT_SECRET` required เมื่อ `NODE_ENV=production`

## Data & Database

- [x] Parameterized SQL queries (`$1, $2`)
- [x] PostgreSQL indexes บน columns สำคัญ
- [x] Advisory lock ป้องกัน double-booking (`pg_advisory_xact_lock`)
- [x] Transaction + `FOR UPDATE` ใน booking flow

## Audit & Logging

- [x] Server-side `auditLog.service` บน admin actions
- [x] `POST /api/admin/logs` จำกัดเฉพาะ admin
- [x] Morgan request logging (dev)

## File Upload

- [x] Multer file type validation (PDF memo, image slip)
- [x] File size limit 10MB
- [x] Uploads served from `/uploads` (ไม่ execute)

## Email

- [x] SMTP optional — console fallback เมื่อไม่มี credentials
- [ ] ตั้ง SMTP จากเมล มฟล. เมื่อได้รับ (รอหน่วยงาน)

## Production Hardening (เมื่อ deploy จริง)

- [ ] เปลี่ยน secrets ทั้งหมดจาก default
- [ ] ปิด `DEV_ADMIN_EMAILS`
- [ ] เปิด HTTPS + HSTS ใน nginx
- [ ] จำกัด firewall เฉพาะ port 80/443
