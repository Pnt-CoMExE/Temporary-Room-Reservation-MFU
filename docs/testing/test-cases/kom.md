# Test Cases — คอม

**Owner:** คอม  
**โฟกัส:** จองซับซ้อน, promo, อนุมัติ+เรท+log, Stripe, AuthZ  
**จำนวน:** 15 เคส  
**ส่งก่อน:** TC-P-R4-01, TC-P-R4-02, TC-A-R4-01, TC-A-R4-03, TC-U-12, TC-Z-01

**เอกสารหลักรวมทุกคน:** [`../TEST_CASE_TRACKER.md`](../TEST_CASE_TRACKER.md)  
**หลักฐาน:** ใส่รูปใน [`../evidence/`](../evidence/) ชื่อไฟล์ตรง `TC-...`

### วิธีใช้
1. รันตาม **Scenario**
2. เทียบ **Expected**
3. Screenshot → `docs/evidence/<TC#>.png`
4. แก้ **ผล** เป็น ✅ / ❌ / ⏭️ ในไฟล์นี้ **และ** sync ในตารางรวมถ้าสะดวก

| สัญลักษณ์ | ความหมาย |
|-----------|----------|
| ⬜ | ยังไม่ทดสอบ |
| ✅ | ผ่าน |
| ❌ | ไม่ผ่าน |
| ⏭️ | ข้าม |

### สภาพแวดล้อมสั้น ๆ
- Dev: `http://localhost:5173` + backend `:3000`
- Docker: `http://localhost:8080`
- Payment UAT: `PAYMENT_PROVIDER=mock_sandbox` · Stripe: `PAYMENT_PROVIDER=stripe`

---

## ตารางของ คอม

| TC# | เดิม | ชื่อเคส | หน้า | Scenario | Expected | ผล | หลักฐาน | หมายเหตุ |
|-----|------|---------|------|----------|----------|----|---------|----------|
| TC-U-12 | U-12 | ส่งคำขอจอง — กรอกครบ | `/booking/:id` | 1. กรอกฟอร์มครบ 2. แนบ PDF 3. ส่ง | สำเร็จ + redirect /dashboard + สถานะรออนุมัติ | ⬜ |  |  |
| TC-U-15 | U-15 | ใช้รหัสส่วนลด | `/booking/:id` | 1. พิมพ์ MFUWELCOME 2. ตรวจสอบ | ลด 100 บาท + รวมลดลง | ⬜ |  |  |
| TC-U-16 | U-16 | ใช้รหัสส่วนลดที่ไม่มี | `/booking/:id` | 1. พิมพ์ INVALID123 2. ตรวจสอบ | error รหัสไม่ถูกต้อง | ⬜ |  |  |
| TC-U-18 | U-18 | แนบไฟล์ที่ไม่ใช่ PDF | `/booking/:id` | 1. แนบ .txt 2. ส่ง | error เฉพาะ PDF | ⬜ |  |  |
| TC-U-19 | U-19 | จองซ้ำ slot เดียวกัน | `/booking/:id` | 1. มีจองเต็มวันแล้ว 2. จองครึ่งวันเช้าวันเดียวกัน | error จองช่วงเวลานั้นไม่ได้ | ⬜ |  |  |
| TC-A-05 | A-05 | อนุมัติคำขอจอง (แนบใบ+confirm) | `Admin คำขอจอง` | 1. แนบใบอนุมัติ 2. อนุมัติ 3. ยืนยัน confirm | สถานะรอชำระเงิน (approved_pending_payment) | ⬜ |  |  |
| TC-E-02 | E-02 | Session หมดอายุ / ไม่ login | `API/หน้า protected` | 1. ลบ session 2. เรียกหน้าที่ต้อง auth | Redirect Login | ⬜ |  |  |
| TC-E-03 | E-03 | Non-admin เข้า Admin | `/admin/dashboard` | 1. Login user ธรรมดา 2. เปิด /admin | กันเข้า / redirect | ⬜ |  |  |
| TC-E-05 | E-05 | อัปโหลดไฟล์เกิน 10MB | `/booking/:id` | 1. แนบ PDF ~15MB 2. ส่ง | error ไฟล์ใหญ่เกินไป | ⬜ |  |  |
| TC-P-R4-01 | — (R4) | Stripe demo checkout | `/dashboard` | 1. PAYMENT_PROVIDER=stripe 2. กดชำระ Stripe 3. demo checkout 4. Callback | สถานะ approved_paid | ⬜ |  | ดู PAYMENT_STRIPE_NOTES.md |
| TC-P-R4-02 | — (R4) | Stripe callback / Transaction ID | `/dashboard?stripe=success` | 1. ต่อจาก P-R4-01 2. อ่าน Tx ID 3. ตรวจ payments.transaction_id | มี Transaction ID + จ่ายแล้ว | ⬜ |  |  |
| TC-A-R4-01 | — (R4) | เลือกเรทตอนอนุมัติ | `Admin confirm` | 1. อนุมัติ 2. เลือกเรท 3. ยืนยัน | เรท+ราคาตรงที่เลือก | ⬜ |  |  |
| TC-A-R4-03 | — (R4) | Log เปลี่ยนเรท | `Admin ประวัติจอง` | 1. อนุมัติพร้อมเปลี่ยนเรท 2. ดูประวัติ | มี log เรท/ราคาเก่า→ใหม่ | ⬜ |  |  |
| TC-Z-01 | — (≈E-03) | AuthZ กันหน้า Admin | `/admin/dashboard` | 1. Login non-admin 2. เปิด /admin | กันเข้าได้ | ⬜ |  |  |
| TC-Z-02 | — (Unit) | รัน npm test AuthZ | `backend` | 1. cd backend 2. npm test | เทส AuthZ/เขียว | ⬜ |  |  |

---

## Checklist ส่งงาน

- [ ] เคส priority: TC-P-R4-01, TC-P-R4-02, TC-A-R4-01, TC-A-R4-03, TC-U-12, TC-Z-01
- [ ] เคสอื่นของคอม ในตารางด้านบน
- [ ] รูปใน `docs/evidence/`

ไฟล์อื่น: [คอม](./kom.md) · [ซี](./cee.md) · [พาร์ท](./part.md) · [เจ](./jay.md)
