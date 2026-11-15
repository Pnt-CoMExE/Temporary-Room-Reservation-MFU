# CITS Deployment Runbook

คู่มือติดตั้งและดูแลระบบบนเซิร์ฟเวอร์ (localhost / Docker พร้อม deploy)

## สิ่งที่ต้องมี

- Docker & Docker Compose
- ไฟล์ `.env.production` (คัดลอกจาก `.env.production.example`)
- PostgreSQL 16, Redis 7 (รวมใน docker-compose)

## ติดตั้งครั้งแรก

```bash
# 1. ตั้งค่า environment
cp .env.production.example .env.production
# แก้ไข JWT_SECRET, DB password, Google OAuth, SMTP (เมื่อได้จาก มฟล.)

# 2. Build และรัน
docker compose -f docker-compose.prod.yml up -d --build

# 3. Seed ข้อมูลเริ่มต้น (production)
docker compose -f docker-compose.prod.yml exec backend npm run seed:production
```

## คำสั่งประจำวัน

```bash
# ดูสถานะ
docker compose -f docker-compose.prod.yml ps

# ดู logs
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend

# Restart
docker compose -f docker-compose.prod.yml restart backend frontend

# หยุดระบบ
docker compose -f docker-compose.prod.yml down
```

## Health Check

- Frontend: `http://localhost/` (หรือ port ที่ตั้งใน compose)
- API: `http://localhost/api/rooms`
- Payment providers: `http://localhost/api/payment/providers`

## อัปเดตเวอร์ชัน

```bash
git pull origin master
docker compose -f docker-compose.prod.yml up -d --build
```

## Rollback

```bash
git checkout <previous-tag>
docker compose -f docker-compose.prod.yml up -d --build
```

## Local Docker (UAT บนเครื่อง)

```bash
docker compose -f docker-compose.prod.yml -f docker-compose.local.yml --env-file .env.production up -d --build
```

| Service | URL |
|---------|-----|
| Web | http://localhost:8080 |
| API (via Nginx) | http://localhost:8080/api |
| Backend direct | http://localhost:3001 (host mapped → container `:3000`) |
| Postgres | `localhost:5433` |

รันคู่กับ `npm run dev` ได้: local API ใช้ `:3000` · Docker backend ใช้ `:3001`

### Clone DB จากเครื่อง (parity กับ npm)

ถ้า dump จาก Postgres ใหม่กว่า image `postgres:16` อาจมี `SET transaction_timeout` ที่ PG16 ไม่รู้จัก — ตัดบรรทัดนั้นออกก่อน restore:

```powershell
# ตัวอย่าง PowerShell
pg_dump -h localhost -p 5432 -U postgres -d room_booking_db --no-owner --no-acl --clean --if-exists -f dump.sql
(Get-Content dump.sql) | Where-Object { $_ -notmatch 'transaction_timeout' } | Set-Content dump_clean.sql
psql -h localhost -p 5433 -U mfu_admin -d mfu_reservation -v ON_ERROR_STOP=1 -f dump_clean.sql
```

รายละเอียด backup/restore ทั่วไป: [`BACKUP_RESTORE.md`](./BACKUP_RESTORE.md)

## หมายเหตุ

- **Payment (UAT / acceptance):** `PAYMENT_PROVIDER=stripe` + `STRIPE_SECRET_KEY=sk_test_…` — ดู [`../payment/STRIPE.md`](../payment/STRIPE.md). `mock_sandbox` / PromptPay ยังมีในโค้ดแต่ไม่ใช่เส้นทางหลัก
- **Payment (production):** Stripe live (`sk_live_` + HTTPS + webhook) ตาม `STRIPE.md`
- **Email:** ตั้ง `SMTP_*` เมื่อได้เมลเซิร์ฟเวอร์จาก มฟล. (UAT มักใช้พอร์ต **465**)
- **Admin UAT / bootstrap:** ตั้ง `DEV_ADMIN_EMAILS` แล้ว login — จากนั้น promote คนอื่นใน Admin Users (ไม่ใช้ auto-admin จากโดเมน). **ปิด** `DEV_*` / `RATE_LIMIT_DISABLED` บนเซิร์ฟจริง
