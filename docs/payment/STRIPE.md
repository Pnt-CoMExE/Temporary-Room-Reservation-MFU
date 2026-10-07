# Payment — Stripe

**สถานะ:** รองรับ Test (`sk_test_`) และ Live (`sk_live_`)  
**อัปเดต:** 2026-10-07

---

## ขั้นตอนเชื่อม Stripe Test (ก่อน Live เสมอ)

### 1) กุญแจใน Stripe Dashboard

1. [dashboard.stripe.com](https://dashboard.stripe.com) → สลับ **Test mode**
2. **Developers → API keys**
3. คัดลอก **Secret key** → `sk_test_...` (อย่า commit · ใส่เฉพาะ `backend/.env`)

### 2) `backend/.env`

```env
PAYMENT_PROVIDER=stripe
STRIPE_SECRET_KEY=sk_test_วางคีย์ตรงนี้
FRONTEND_URL=http://localhost:5173
# APP_URL=http://localhost:3000
```

Docker พอร์ต 8080: ตั้ง `FRONTEND_URL` + `APP_URL` เป็น `http://localhost:8080`

### 3) Restart + ทดสอบ

- `GET /api/payment/providers` → `activeProvider.id` = `stripe`
- จองรอชำระ → Dashboard → ชำระ Stripe → บัตร `4242 4242 4242 4242`
- กลับ `/dashboard?stripe=success&session_id=cs_...` → `POST /api/payment/stripe/confirm` → สถานะชำระแล้ว

Localhost: webhook จาก Stripe Cloud ยิงเข้าเครื่องไม่ได้ → ใช้ **confirm หลัง redirect**  
ทางเลือก: `stripe listen --forward-to localhost:3000/api/payment/webhook/stripe`

---

## โหมด Live (เงินจริง) — ใช้งานจริง

**ระวัง:** ตัดบัตรจริง · ต้องบัญชี Stripe ผ่าน Activate / Business details · โดเมน **HTTPS สาธารณะ**

### เงื่อนไขก่อนเปิด

| รายการ | ต้องมี |
|--------|--------|
| Stripe Account | เปิด **Live mode** แล้ว (ไม่ใช่แค่ Test) |
| Secret key | `sk_live_...` จาก Developers → API keys (ปิด Test mode) |
| โดเมน | `https://your-domain` ที่ Stripe ยิง webhook ได้ |
| Frontend / Backend URL | HTTPS จริงใน env |
| Webhook secret | `whsec_...` จาก endpoint ที่สร้างใน Dashboard |

### 1) สร้าง Webhook ใน Stripe (Live mode)

1. Dashboard → **ปิด Test mode**
2. **Developers → Webhooks → Add endpoint**
3. URL: `https://<โดเมนของคุณ>/api/payment/webhook/stripe`
4. Event: `checkout.session.completed`
5. คัดลอก **Signing secret** → `whsec_...`

### 2) Env บนเซิร์ฟเวอร์ (อย่าแปะในแชท / git)

```env
NODE_ENV=production
PAYMENT_PROVIDER=stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=https://your-domain
APP_URL=https://your-domain
# ถ้าต้องทด Live จากเครื่อง dev (ไม่แนะนำ): STRIPE_ALLOW_LIVE=true
```

`sk_live_` **ถูกบล็อก** นอก `NODE_ENV=production` เว้นแต่ตั้ง `STRIPE_ALLOW_LIVE=true`

### 3) Deploy + ตรวจ

1. Restart backend / container
2. Stripe Dashboard → Webhook → Send test event หรือจ่ายจริงจำนวนเล็ก
3. ดู log: signature ผ่าน + จองเป็น `approved_paid`
4. Fallback หลัง Checkout: `stripe/confirm` ยังใช้ได้ถ้า webhook ช้า

### Checklist Live

- [ ] ผ่าน Stripe Activate / KYC
- [ ] ใช้ `sk_live_` (ไม่ใช่ test)
- [ ] `STRIPE_WEBHOOK_SECRET` ตั้งแล้ว
- [ ] Webhook URL HTTPS สาธารณะ
- [ ] `FRONTEND_URL` / `APP_URL` เป็น HTTPS เดียวกับที่ deploy
- [ ] ไม่ commit `.env`
- [ ] ทดสอบยอดเล็กก่อนเปิดผู้ใช้จริง

---

## โหมดอื่น

| Env | ผล |
|-----|-----|
| `PAYMENT_PROVIDER=stripe` + ไม่มี key | Demo ในเครื่อง (production ปฏิเสธ) |
| `+ sk_test_...` | Checkout Test |
| `+ sk_live_...` + webhook secret | Checkout เงินจริง |
| `PAYMENT_PROVIDER=mock_sandbox` | จำลองจ่ายแบบเดิม |

---

## Checklist Test ด่วน

- [ ] Test mode ใน Dashboard
- [ ] `STRIPE_SECRET_KEY=sk_test_...`
- [ ] `PAYMENT_PROVIDER=stripe`
- [ ] Restart backend
- [ ] จ่าย `4242...` สำเร็จ + สถานะชำระแล้ว
