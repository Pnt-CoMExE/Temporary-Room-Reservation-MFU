# Setup จาก `.env.example` (clone จาก GitHub)

สำหรับคนที่ **ไม่มีไฟล์ `.env` จริง** ในเครื่อง — ตั้งค่าจากตัวอย่างใน repo แล้วกรอกค่าทดสอบเอง

Full handover guide (DB · seed · Docker · ready-to-use checklist): [`../../README.md`](../../README.md)

**อย่า commit ไฟล์ `.env`** · ตัวอย่างไม่ใช่ secret production

---

## 1) คัดลอกไฟล์

```bash
cd backend
cp .env.example .env
# Windows PowerShell:
# Copy-Item .env.example .env
```

แก้ค่าใน `backend/.env` ตามตารางด้านล่าง

---

## 2) คีย์ที่ต้องใส่ (จาก example)

| ตัวแปร | ความหมาย | ค่าเริ่มต้น / วิธีได้ |
|--------|----------|------------------------|
| `JWT_SECRET` | เซ็น JWT | ใส่สตริงยาวสุ่มสำหรับ dev |
| `DB_*` | PostgreSQL | ตาม Postgres ท้องถิ่น / Docker |
| `GOOGLE_CLIENT_ID` / `SECRET` / `CALLBACK_URL` | Google OAuth | Google Cloud Console → OAuth client |
| `FRONTEND_URL` | Origin ของ Vue | `http://localhost:5173` |
| `PAYMENT_PROVIDER` | ชำระเงิน UAT | `mock_sandbox` (เร็ว) หรือ `stripe` |
| `STRIPE_SECRET_KEY` | Stripe test | `sk_test_…` จาก [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys) — ดู [`../payment/STRIPE.md`](../payment/STRIPE.md) |
| `STRIPE_PUBLISHABLE_KEY` | ฝั่ง frontend (ถ้าใช้) | `pk_test_…` |
| `STRIPE_WEBHOOK_SECRET` | Webhook (optional UAT) | `whsec_…` |
| `DEV_ADMIN_EMAILS` | Promote admin ตอน UAT | อีเมล Google ที่ใช้เทส (คั่นด้วย `,`) |
| `DEV_INTERNAL_EMAILS` | Force role internal | เมื่อไม่มี `@mfu.ac.th` จริง |

SMTP / Redis ใน example เป็น optional — ไม่ใส่ระบบยังรันได้ (อีเมล log ที่ console · session ใช้ memory)

---

## 3) ลำดับรันหลังตั้ง `.env`

```bash
# DB (ตัวอย่าง Docker — ดู README หลัก)
cd backend
npm install
npm run init-schema   # หรือตามสคริปต์ใน README
npm run seed:demo     # ถ้าต้องการข้อมูลตัวอย่าง
npm run import:rooms  # นำเข้าจาก data/room-pricing-rates.xlsx

cd ../frontend
npm install
npm run dev
```

Backend: `npm run dev` ที่พอร์ต `PORT` (ค่าเริ่ม 3000)

---

## 4) Checklist บทที่ 3 / 5 (ติดตั้ง & ตั้งค่า)

ใช้ตอนเขียนเอกสารโครงงาน / สอบ:

- [ ] อธิบายสถาปัตยกรรม: Vue frontend + Express API + PostgreSQL
- [ ] ขั้นตอนติดตั้ง: clone → `cp .env.example .env` → ใส่ key → `npm install` ทั้งสองฝั่ง
- [ ] ระบุว่า API Key มาจากไหน (Google / Stripe test / JWT เอง)
- [ ] ระบุโหมดชำระเงิน UAT: `mock_sandbox` vs Stripe test (`STRIPE.md`)
- [ ] ระบุบทบาทอีเมล: `@mfu.ac.th` = internal · อื่น = external · admin = promote / `DEV_ADMIN_EMAILS`
- [ ] ห้ามแนบ `.env` จริงในรายงาน — แนบเฉพาะ screenshot ของ example ที่ปิดบัง secret

รายละเอียดบทที่ 4 (ทดสอบ): [`../product/THESIS_CHAPTERS_CHECKLIST.md`](../product/THESIS_CHAPTERS_CHECKLIST.md)
