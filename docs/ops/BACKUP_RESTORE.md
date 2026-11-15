# Backup & Restore Guide

## สำรองข้อมูล (Backup)

### อัตโนมัติ (สคริปต์)

```bash
cd backend
bash scripts/backup.sh
```

สคริปต์จะ:
- รัน `pg_dump` และบีบอัดเป็น `.sql.gz`
- เก็บใน `backend/backups/`
- ลบไฟล์เก่ากว่า 30 วัน

### Manual (Docker)

```bash
docker compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U mfu_admin mfu_reservation > backup_$(date +%Y%m%d).sql
```

### ไฟล์ uploads

```bash
# สำรองสลิปและ memo PDF
tar -czf uploads_backup.tar.gz backend/uploads/
```

## กู้คืนข้อมูล (Restore)

```bash
# จากไฟล์ SQL
docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U mfu_admin -d mfu_reservation < backup_20260901.sql

# จากไฟล์ gzip
gunzip -c backup.sql.gz | docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U mfu_admin -d mfu_reservation
```

## Clone จาก Postgres บนเครื่อง → Docker (PG version mismatch)

`pg_dump` จาก Postgres 17+ อาจใส่ `SET transaction_timeout = …` ซึ่ง **PostgreSQL 16** ใน Docker ปฏิเสธ

ก่อน restore ให้ตัดพารามิเตอร์นั้นออก (หรือ dump ด้วย client/server คู่กัน):

```powershell
(Get-Content dump.sql) | Where-Object { $_ -notmatch 'transaction_timeout' } | Set-Content dump_clean.sql
psql -h localhost -p 5433 -U mfu_admin -d mfu_reservation -v ON_ERROR_STOP=1 -f dump_clean.sql
```

ดูเพิ่มใน [`CITS_RUNBOOK.md`](./CITS_RUNBOOK.md) § Local Docker

## แนะนำ

- สำรองก่อน deploy ทุกครั้ง
- ทดสอบ restore บน staging อย่างน้อย 1 ครั้งก่อน go-live
- เก็บ backup นอกเซิร์ฟเวอร์ (cloud / NAS)
