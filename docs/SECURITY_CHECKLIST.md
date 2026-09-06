# Security Checklist (Sprint 5 + AuthZ harden 2026-09-06)

## Authentication & Authorization

- [x] Google OAuth 2.0 สำหรับ login
- [x] JWT หมดอายุ 8 ชั่วโมง (cookie `mfu_token`, HttpOnly)
- [x] `resolveUserType()` กำหนด role จากโดเมนอีเมล
- [x] `verifyAdmin` middleware บน admin API routes
- [x] Frontend guard `requiresAdmin` สำหรับ `/admin/*` (UI only — API เป็น source of truth)
- [x] `DEV_ADMIN_EMAILS` สำหรับ UAT เท่านั้น (ปิดใน production จริง)
- [x] Profile / bookings ใช้ identity จาก JWT เท่านั้น (anti-IDOR)
- [x] สร้างจองบังคับ `userId` จาก JWT — ไม่เชื่อ body จาก client
- [x] Payment checkout / PromptPay / slip ตรวจเจ้าของ booking
- [x] External ไม่สามารถปลอม `userType=internal` ตอนจอง
- [x] Tests: `auth.test.ts`, `resolveUserType.test.ts`, `authz_idor.test.ts`

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

## Demo

- [x] สคริปต์อธิบาย AuthN/AuthZ: [`DEMO_SECURITY.md`](DEMO_SECURITY.md)

## Production Hardening (เมื่อ deploy จริง)

- [ ] เปลี่ยน secrets ทั้งหมดจาก default
- [ ] ปิด `DEV_ADMIN_EMAILS`
- [ ] เปิด HTTPS + HSTS ใน nginx
- [ ] จำกัด firewall เฉพาะ port 80/443
- [ ] ไม่ตั้ง `RATE_LIMIT_DISABLED=true`
