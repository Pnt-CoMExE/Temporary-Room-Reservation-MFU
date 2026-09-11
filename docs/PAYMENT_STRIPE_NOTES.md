# Payment Gateway Notes — Stripe vs QR (Recording 3 / Phase 6)

**สถานะ:** ศึกษา / ยังไม่ผูก production  
**อัปเดต:** 2026-09-11

## สิ่งที่มีในระบบแล้ว

- Modular adapters: PromptPay, Mock Sandbox, standby Opn/SCB/KBank/KTB  
- UAT: `PAYMENT_PROVIDER=mock_sandbox`  
- คู่มือหลัก: [`payment_gateway.md`](./payment_gateway.md)

## ข้อเสนอจากอาจารย์

- ทดลอง Free / Developer mode ของ gateway เช่น **Stripe**  
- เปรียบเทียบค่าธรรมเนียมบัตร vs **QR / PromptPay** (มักถูกกว่า)

## Stripe (แนวทางขั้นถัดไป)

| หัวข้อ | รายละเอียด |
|--------|------------|
| โหมดทดสอบ | Stripe Dashboard → Developers → API keys (test) |
| ใช้ทำอะไรได้ | Card payment, PaymentIntent, webhook |
| กับโปรเจกต์นี้ | สร้าง adapter ใหม่ใต้ `backend/src/services/payment/` ตาม interface เดิม |
| ยังไม่ทำตอนนี้ | ไม่ผูก live key / ไม่รับเงินจริงจนกว่า มฟล. เลือก provider |

## QR / PromptPay

- มี EMVCo generator อยู่แล้ว  
- เหมาะกับค่าธรรมเนียมต่ำกว่าบัตรสำหรับบริบทไทย/มฟล.  
- ยังต้องมีขั้นตอนยืนยันสลิปโดยเจ้าหน้าที่ (หรือ webhook จากธนาคารในอนาคต)

## ค่าแนะนำทีม

1. คง Mock + PromptPay สำหรับ Demo/UAT  
2. ตัดสินใจ provider กับอาจารย์/หน่วยงาน ก่อนลง sandbox จริง  
3. เมื่อเลือกแล้ว: adapter + webhook + เทส ownership (มีฐาน AuthZ แล้ว)
