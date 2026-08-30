#!/bin/bash
# ==========================================
# MFU Room Reservation — Automated PostgreSQL Backup Script
# ==========================================
# วิธีใช้ (Usage):
#   รันตรง:     ./scripts/backup.sh
#   ใน Docker:  docker exec mfu_space_db /backup.sh
#   Cron (ทุกวัน 02:00):  0 2 * * * /path/to/backup.sh >> /var/log/mfu_backup.log 2>&1
# ==========================================

set -euo pipefail

# ---- Config ----
DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${POSTGRES_DB:-mfu_reservation}"
DB_USER="${POSTGRES_USER:-mfu_admin}"
PGPASSWORD="${POSTGRES_PASSWORD:-mfu_secure_password_2026}"

BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"  # เก็บ backup ไว้ 30 วัน
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/mfu_db_backup_${TIMESTAMP}.sql.gz"

export PGPASSWORD

# ---- Create backup directory ----
mkdir -p "$BACKUP_DIR"

echo "🗄️  [$(date)] เริ่มสำรองข้อมูล MFU Database..."
echo "   Database: ${DB_NAME} @ ${DB_HOST}:${DB_PORT}"

# ---- Run pg_dump and compress ----
if pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --no-password \
  --format=plain \
  --verbose \
  | gzip > "$BACKUP_FILE"; then

  BACKUP_SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
  echo "✅ สำรองข้อมูลสำเร็จ: ${BACKUP_FILE} (${BACKUP_SIZE})"
else
  echo "❌ ล้มเหลวในการสำรองข้อมูล!"
  exit 1
fi

# ---- Delete old backups (older than RETENTION_DAYS) ----
echo "🧹 ลบไฟล์ backup เก่ากว่า ${RETENTION_DAYS} วัน..."
find "$BACKUP_DIR" -name "mfu_db_backup_*.sql.gz" -mtime +${RETENTION_DAYS} -delete
REMAINING=$(ls -1 "$BACKUP_DIR"/mfu_db_backup_*.sql.gz 2>/dev/null | wc -l)
echo "📦 Backup ที่เหลืออยู่: ${REMAINING} ไฟล์"

echo "✅ Backup เสร็จสมบูรณ์ — $(date)"
