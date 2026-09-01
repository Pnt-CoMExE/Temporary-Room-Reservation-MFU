# UAT Checklist — Docker Local (End-to-End)

**โครงการ:** ระบบจองพื้นที่อาคารและสถานที่ มหาวิทยาลัยแม่ฟ้าหลวย (MFU Space Booking)  
**เวอร์ชัน:** 1.0  
**อัปเดตล่าสุด:** 2026-09-02  
**สภาพแวดล้อม:** Docker Compose local (`docker-compose.prod.yml` + `docker-compose.local.yml`)

---

## 1. สิ่งที่ต้องเตรียมก่อนทดสอบ

| รายการ | รายละเอียด |
|--------|------------|
| Docker Desktop | เปิดใช้งานแล้ว |
| ไฟล์ env | คัดลอก `.env.production.example` → `.env.production` (ไม่ commit) |
| Google OAuth | ตั้ง `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL=http://localhost:8080/api/auth/google/callback` |
| Redirect URI | เพิ่มใน Google Cloud Console ให้ตรง callback ด้านบน |
| Admin UAT | `DEV_ADMIN_EMAILS=<อีเมล Google ของคุณ>` |
| HTTP local | `COOKIE_SECURE=false`, `FRONTEND_URL=http://localhost:8080` |
| Rate limit UAT | `RATE_LIMIT_DISABLED=true` (เฉพาะ local — **ห้าม**ใช้ production) |
| Payment UAT | `PAYMENT_PROVIDER=mock_sandbox` |

---

## 2. คำสั่งเริ่มระบบ

```powershell
cd D:\MFU\Project

# รัน stack
docker compose -f docker-compose.prod.yml -f docker-compose.local.yml --env-file .env.production up -d --build

# (ครั้งแรก) นำเข้าห้องจาก Excel
cd backend
$env:DB_HOST="localhost"; $env:DB_PORT="5433"
$env:DB_NAME="mfu_reservation"; $env:DB_USER="mfu_admin"
$env:DB_PASSWORD="<รหัสจาก .env.production>"
npm run import:rooms

# (ถ้าต้องการ) seed demo users, addons, promo codes
npm run seed:demo
```

| URL | หน้าที่ |
|-----|--------|
| http://localhost:8080 | Frontend + Nginx reverse proxy |
| http://localhost:8080/api/rooms | API ตัวอย่าง |
| localhost:5433 | PostgreSQL (เครื่อง host → container) |

---

## 3. Checklist — Flow หลัก (E2E)

ทดสอบครบวงจรตามลำดับนี้:

| # | ขั้นตอน | ผู้ทำ | ผลที่คาดหวัง | สถานะ |
|---|--------|------|--------------|-------|
| 1 | เปิด http://localhost:8080 | User | หน้า Login แสดงปกติ (ไม่ blank) | ✅ |
| 2 | Sign in with Google | User | Redirect กลับพร้อม `loginSuccess=true` → Admin ไป `/admin/dashboard` | ✅ |
| 3 | เปิด `/rooms` → เลือกห้อง → จอง | User | โหลดห้อง + addons ได้ | ✅ |
| 4 | กรอกฟอร์ม + แนบ PDF + ส่งจอง | User | 201 สำเร็จ, สถานะ **รออนุมัติ** (pending) | ✅ |
| 5 | Admin → `/admin/bookings` | Admin | เห็นรายการจองใหม่ | ✅ |
| 6 | แนบใบอนุมัติ → กดอนุมัติ | Admin | สถานะ **รอชำระเงิน** (`approved_pending_payment`) | ✅ |
| 7 | User → `/dashboard` → Mock ชำระเงิน | User | จำลองชำระสำเร็จ (`pending_verification`) | ✅ |
| 8 | Admin → ยืนยันรับชำระเงิน | Admin | สถานะ **สำเร็จแล้ว** (`approved_paid`) | ✅ |
| 9 | Logout / Login ใหม่ | User | Session ทำงานปกติ | ⬜ |
| 10 | สลับภาษา TH/EN | User | ข้อความเปลี่ยนภาษา | ⬜ |

> **ผล UAT รอบ Docker (2026-09-02):** ขั้นตอน 1–8 ผ่านครบ

---

## 4. Checklist — การตั้งค่าและความปลอดภัย (Local)

| # | รายการ | สถานะ |
|---|--------|-------|
| S-01 | `.env.production` ไม่อยู่ใน git | ✅ |
| S-02 | `uploads/` ไม่อยู่ใน git | ✅ |
| S-03 | Cookie HttpOnly + `withCredentials` | ✅ |
| S-04 | Admin route ใช้ `requiresAdmin` guard | ✅ |
| S-05 | Rate limit เปิดใน production (`RATE_LIMIT_DISABLED` ไม่ตั้ง) | ⬜ (ทดสอบตอน deploy จริง) |

---

## 5. ปัญหาที่พบและแก้ไขแล้ว (รอบนี้)

| อาการ | สาเหตุ | การแก้ |
|-------|--------|--------|
| หน้าขาว | Vite 8 build กับ vue-router | Downgrade Vite 6 + vue-router 4.5 |
| Login error หลัง OAuth | HttpOnly cookie อ่านจาก JS ไม่ได้ | ใช้ `localStorage` + `auth.ts` |
| 429 ตอน login/จอง | Rate limit + Redis สะสม | `RATE_LIMIT_DISABLED=true` (local), skip OAuth/booking จาก general limiter |
| จองไม่ได้ (ไม่มี PDF) | Axios ส่ง `application/json` แทน multipart | `api.ts` ลบ Content-Type เมื่อ FormData |
| อนุมัติ 500 | ไม่มีคอลัมน์ `approval_document_url` | Migration + `init-schema.sql` |
| จอง 500 | `pg_advisory_xact_lock` type ผิด | ใช้ `int, int` |

---

## 6. ก่อน Deploy Production

| รายการ | Local UAT | Production |
|--------|-----------|------------|
| `COOKIE_SECURE` | `false` | `true` (HTTPS) |
| `RATE_LIMIT_DISABLED` | `true` | **ไม่ตั้ง** หรือ `false` |
| `FRONTEND_URL` | `http://localhost:8080` | `https://<domain>` |
| Google Callback | `http://localhost:8080/api/auth/google/callback` | `https://<domain>/api/auth/google/callback` |
| `DEV_ADMIN_EMAILS` | ใช้ได้สำหรับ UAT | ลบหรือเว้นว่าง |

อ้างอิงเพิ่มเติม: [GO_LIVE_CHECKLIST.md](GO_LIVE_CHECKLIST.md), [CITS_RUNBOOK.md](CITS_RUNBOOK.md)

---

## 7. เอกสารที่เกี่ยวข้อง

- [UAT_TEST_SCENARIOS.md](UAT_TEST_SCENARIOS.md) — 65 test cases แยกตามโมดูล
- [UAT_DOCKER_ROUND_RESULTS.md](UAT_DOCKER_ROUND_RESULTS.md) — บันทึกผลรอบ Docker
- [UAT_SIGNOFF.md](UAT_SIGNOFF.md) — แบบฟอร์มลงนามรับ UAT
