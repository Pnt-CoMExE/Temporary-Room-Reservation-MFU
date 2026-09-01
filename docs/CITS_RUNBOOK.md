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

## หมายเหตุ

- **Payment:** ตั้ง `PAYMENT_PROVIDER=mock_sandbox` สำหรับ UAT; เปลี่ยนเป็น `promptpay_manual` เมื่อพร้อม
- **Email:** ตั้ง `SMTP_*` เมื่อได้เมลเซิร์ฟเวอร์จาก มฟล.
- **Admin UAT:** ตั้ง `DEV_ADMIN_EMAILS` สำหรับทดสอบโดยไม่มีอีเมล @property.mfu.ac.th
