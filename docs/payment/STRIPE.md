# Payment — Stripe (เชื่อมจริง)

**สถานะ:** ทีมเลือก Stripe · ใช้ **test key** (`sk_test_`) ก่อนเสมอ  
**อัปเดต:** 2026-10-06

---

## ขั้นตอนเชื่อม Stripe Test (แนะนำ)

### 1) สร้างกุญแจใน Stripe Dashboard

1. เปิด [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register) (หรือ login)
2. สลับโหมด **Test mode** (มุมขวาบน)
3. **Developers → API keys**
4. คัดลอก:
   - **Secret key** → `sk_test_...`
   - **Publishable key** → `pk_test_...` (เก็บไว้ ยังไม่บังคับใน flow ปัจจุบัน)

อย่า commit key ลง git · ใส่เฉพาะ `backend/.env`

### 2) ตั้ง `backend/.env`

```env
PAYMENT_PROVIDER=stripe
STRIPE_SECRET_KEY=sk_test_วางคีย์จริงตรงนี้
FRONTEND_URL=http://localhost:5173
# ถ้า backend รันคนละพอร์ต / Docker ให้ตั้ง APP_URL ให้ถูกต้อง เช่น
# APP_URL=http://localhost:3000
```

Docker ที่พอร์ต 8080:

```env
PAYMENT_PROVIDER=stripe
STRIPE_SECRET_KEY=sk_test_...
FRONTEND_URL=http://localhost:8080
APP_URL=http://localhost:8080
```

### 3) Restart backend

```bash
cd backend
# หยุด process เดิม แล้ว
npm run dev
```

ตรวจ: `GET /api/payment/providers` → `activeProvider.id` = `stripe`

### 4) ทดสอบจ่าย

1. มีจองสถานะ **รอชำระเงิน**
2. Dashboard → **ชำระผ่าน Stripe** → ไปหน้า Stripe Checkout
3. ใช้บัตรทดสอบ: `4242 4242 4242 4242` · วันหมดอายุอนาคต · CVC อะไรก็ได้ · ชื่ออะไรก็ได้
4. หลังจ่าย สำเร็จ → กลับ `/dashboard?stripe=success&session_id=cs_...`
5. ระบบเรียก `POST /api/payment/stripe/confirm` → สถานะ **ชำระแล้ว** + Transaction ID

---

## ทำไมต้อง `confirm` บน localhost

Webhook จาก Stripe Cloud **ยิงเข้าเครื่องคุณไม่ได้** ถ้าไม่มี tunnel  
เลยยืนยันด้วยการดึง Checkout Session จาก API หลัง redirect กลับ

ถ้า deploy มีโดเมนสาธารณะ ค่อยตั้ง webhook:

```text
POST https://<โดเมน>/api/payment/webhook/stripe
Event: checkout.session.completed
```

แล้วใส่ `STRIPE_WEBHOOK_SECRET=whsec_...` (verify signature จะเพิ่มทีหลังได้)

ทางเลือก local: `stripe listen --forward-to localhost:3000/api/payment/webhook/stripe`

---

## โหมดอื่น

| Env | ผล |
|-----|-----|
| `PAYMENT_PROVIDER=stripe` + **ไม่มี** key | Demo หน้าในเครื่อง (ไม่เรียก Stripe) |
| `PAYMENT_PROVIDER=stripe` + `sk_test_...` | Checkout จริงใน Test mode |
| `PAYMENT_PROVIDER=mock_sandbox` | จำลองจ่ายแบบเดิม |
| `sk_live_...` | เงินจริง — ใช้เมื่อ มฟล./CITS พร้อมเท่านั้น |

---

## Checklist ด่วน

- [ ] Test mode ใน Dashboard
- [ ] `STRIPE_SECRET_KEY=sk_test_...` ใน `.env` (ไม่ commit)
- [ ] `PAYMENT_PROVIDER=stripe`
- [ ] Restart backend
- [ ] จ่ายด้วย `4242...` สำเร็จ + สถานะจองเป็นชำระแล้ว
