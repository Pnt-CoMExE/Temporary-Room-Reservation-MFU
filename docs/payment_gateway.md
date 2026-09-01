# 💳 Modular Payment Gateway System Architecture & Configuration Guide
# คู่มือสถาปัตยกรรมและการกำหนดค่าระบบชำระเงินแบบโมดูลาร์ (Modular Payment Gateway)

ระบบชำระเงินของ **Temporary Rental Space Management System of MFU** ถูกออกแบบด้วยสถาปัตยกรรมแบบ **Modular Payment Adapter Pattern** เพื่อรองรับการเปิดใช้งานและสลับผู้ให้บริการชำระเงิน (Payment Service Provider) ของบริษัทเอกชนหรือธนาคารต่างๆ ได้ทันทีเมื่อส่วนทรัพย์สิน มหาวิทยาลัยแม่ฟ้าหลวง มีข้อสรุป

---

## 🎯 Current Operational State / สถานะการทำงานปัจจุบัน

* **Active Mode (Default):** Dynamic PromptPay EMVCo QR Code + Manual Slip Upload Verification by Admin.
  * ระบบทำงานในรูปแบบ PromptPay QR Code ตามยอดราคาสุทธิ ผู้ใช้ทำการอัปโหลดสลิปหลักฐาน และเจ้าหน้าที่ตรวจสอบ/อนุมัติผ่านระบบ Admin Dashboard
* **Standby Mode (External Gateways Prepared):**
  * โค้ดส่วนเชื่อมต่อ (Adapters) สำหรับ **Opn Payments (Omise)**, **SCB Mae Manee**, **KBank K-Payment Gateway**, **Krungthai Bank (KTB)** และ **Mock Sandbox (UAT)** ได้ถูกพัฒนาและจัดเตรียมไว้เรียบร้อยแล้ว
  * Gateways เหล่านี้จะถูกปิดใช้งาน (Inactive) ไว้ล่วงหน้า จนกว่าจะมีการระบุ environment variables ในไฟล์ `.env`

---

## 🛠️ Supported Payment Adapters / รายชื่อ Adapter ที่รองรับ

| Provider ID | Provider Name | Supporting Payment Methods | Status |
| :--- | :--- | :--- | :--- |
| `promptpay_manual` | Dynamic PromptPay EMVCo | PromptPay QR Code + Admin Slip Verification | **ACTIVE (Default)** |
| `opn` | Opn Payments (Formerly Omise) | Credit/Debit Card, PromptPay, Internet Banking | Standby (Ready) |
| `scb` | SCB Mae Manee / Open API | SCB Easy App, PromptPay QR, Direct Debit | Standby (Ready) |
| `kbank` | KBank K-Payment Gateway | K PLUS, Credit/Debit Card, PromptPay QR | Standby (Ready) |
| `ktb` | Krungthai Bank Corporate Portal | KTB Netbank, PromptPay, Corporate Direct | Standby (Ready) |
| `mock_sandbox` | Mock Sandbox Gateway | Instant payment simulation for UAT testing | Testing Ready |

---

## ⚙️ How to Activate a Payment Provider / วิธีการเปิดใช้งาน Payment Provider

เมื่อส่วนทรัพย์สินได้ข้อสรุปเลือกค่าย Payment Gateway แล้ว สามารถเปิดใช้งานได้ง่ายๆ เพียงแก้ไขไฟล์ `.env` หรือ `.env.production` โดยไม่ต้องแก้ไขโค้ดโปรแกรม:

### 1. Opn Payments (Omise)
```env
PAYMENT_PROVIDER=opn
OPN_PUBLIC_KEY=pkey_live_xxxxxxxxxxxxxxxxx
OPN_SECRET_KEY=skey_live_xxxxxxxxxxxxxxxxx
```

### 2. SCB Mae Manee / Open API
```env
PAYMENT_PROVIDER=scb
SCB_API_KEY=your_production_scb_api_key
SCB_API_SECRET=your_production_scb_api_secret
SCB_MERCHANT_ID=your_production_scb_merchant_id
```

### 3. KBank K-Payment Gateway
```env
PAYMENT_PROVIDER=kbank
KBANK_MERCHANT_ID=your_production_kbank_merchant_id
KBANK_SECRET_KEY=your_production_kbank_secret_key
```

### 4. Krungthai Bank (KTB)
```env
PAYMENT_PROVIDER=ktb
KTB_MERCHANT_ID=your_production_ktb_merchant_id
KTB_SECRET_KEY=your_production_ktb_secret_key
```

### 5. Mock Sandbox (สำหรับทดสอบ UAT)
```env
PAYMENT_PROVIDER=mock_sandbox
```

เมื่อเปิดใช้งาน Mock Sandbox:
- หน้า User Dashboard จะแสดงปุ่ม **"จำลองชำระเงิน (ทดสอบ)"** แทน QR Code
- เรียก `POST /api/payment/mock/simulate` เพื่อจำลองการชำระเงินสำเร็จ (ไม่โอนเงินจริง)
- สถานะการจองเปลี่ยนเป็น `pending_verification` รอเจ้าหน้าที่ตรวจสอบตามขั้นตอนปกติ

---

## 🌐 Webhook Configuration / การตั้งค่า Webhook

เมื่อเปิดใช้งาน Gateway ของธนาคารหรือเอกชน ให้กำหนดค่า Webhook URL ในระบบหลังบ้านของผู้ให้บริการชำระเงินดังนี้:

* **Webhook Endpoint Format:** `https://<YOUR_DOMAIN>/api/payment/webhook/<PROVIDER_ID>`
* **Examples:**
  * `https://space-booking.mfu.ac.th/api/payment/webhook/opn`
  * `https://space-booking.mfu.ac.th/api/payment/webhook/scb`
  * `https://space-booking.mfu.ac.th/api/payment/webhook/kbank`
  * `https://space-booking.mfu.ac.th/api/payment/webhook/ktb`

เมื่อได้รับการแจ้งเตือนจาก Webhook ว่าชำระเงินสำเร็จ ระบบจะทำการปรับสถานะรายการจองเป็น `verified` และ `approved` โดยอัตโนมัติทันที

---

## 📡 API Reference / API ใช้งานสำหรับนักพัฒนา

### 1. ดึงรายการ Payment Providers ทั้งหมดและสถานะปัจจุบัน
* **Endpoint:** `GET /api/payment/providers`
* **Response Sample:**
```json
{
  "activeProvider": {
    "id": "promptpay_manual",
    "name": "Dynamic PromptPay EMVCo (Manual Slip Upload)"
  },
  "providers": [
    { "id": "promptpay_manual", "name": "Dynamic PromptPay EMVCo", "isEnabled": true, "isActive": true },
    { "id": "opn", "name": "Opn Payments (Formerly Omise)", "isEnabled": false, "isActive": false },
    { "id": "scb", "name": "SCB Mae Manee / Open API", "isEnabled": false, "isActive": false }
  ]
}
```

### 2. สร้างรายการชำระเงิน (Unified Checkout)
* **Endpoint:** `POST /api/payment/checkout` (Requires Bearer Token)
* **Body:**
```json
{
  "bookingId": 12
}
```
* **Response Sample (PromptPay Mode):**
```json
{
  "success": true,
  "providerId": "promptpay_manual",
  "providerName": "Dynamic PromptPay EMVCo (Manual Slip Upload)",
  "transactionId": "PP-BK-2026-101-1772030000000",
  "qrPayload": "00020101021229370016A000000677010111011300575532000100530376454061500.005802TH6304ABCD",
  "paymentStatus": "pending_verification",
  "message": "สร้าง QR Code สำหรับ PromptPay เรียบร้อยแล้ว กรุณาอัปโหลดสลิปหลังชำระเงิน"
}
```

### 3. จำลองการชำระเงิน (Mock Sandbox — UAT Only)
* **Endpoint:** `POST /api/payment/mock/simulate` (Requires Bearer Token)
* **เงื่อนไข:** `PAYMENT_PROVIDER=mock_sandbox` ต้องเปิดใช้งาน
* **Body:**
```json
{
  "bookingId": 12
}
```
* **Response Sample:**
```json
{
  "message": "[UAT] จำลองการชำระเงินสำเร็จ — รอเจ้าหน้าที่ตรวจสอบและยืนยัน",
  "bookingNo": "BK-DEMO-001",
  "transactionId": "MOCK-xxx",
  "paymentStatus": "pending_verification",
  "mode": "mock_sandbox"
}
```
