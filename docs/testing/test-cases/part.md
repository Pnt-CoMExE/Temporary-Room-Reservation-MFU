# Test Cases — พาร์ท

**Owner:** พาร์ท  
**โฟกัส:** Admin จอง/เอกสาร/สลิป, PromptPay/Mock, promote admin  
**จำนวน:** 16 เคส  
**ส่งก่อน:** TC-A-R4-02, TC-A-06, TC-A-08, TC-U-24b

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

## ตารางของ พาร์ท

| TC# | เดิม | ชื่อเคส | หน้า | Scenario | Expected | ผล | หลักฐาน | หมายเหตุ |
|-----|------|---------|------|----------|----------|----|---------|----------|
| TC-U-02b | U-02b | Admin promote ผู้ใช้เป็น admin | `Admin Users` | 1. Login Admin 2. Users 3. ตั้ง Role=admin | ผู้ใช้นั้น login แล้วได้ Role=admin | ⬜ |  |  |
| TC-U-23 | U-23 | ดู QR Code PromptPay | `/dashboard` | 1. PAYMENT_PROVIDER=promptpay_manual 2. สแกนชำระเงิน | Modal QR + ยอด + อัปโหลดสลิป | ⬜ |  |  |
| TC-U-24 | U-24 | อัปโหลดสลิปการโอน | `/dashboard` | 1. ใน Modal แนบสลิป jpg 2. ส่ง | รอตรวจสอบการชำระเงิน | ⬜ |  |  |
| TC-U-24b | U-24b | จำลองชำระเงิน Mock Sandbox | `/dashboard` | 1. PAYMENT_PROVIDER=mock_sandbox 2. จำลองชำระ 3. ยืนยัน | pending_verification โดยไม่โอนจริง | ⬜ |  |  |
| TC-A-03 | A-03 | ดูรายการคำขอจอง | `Admin คำขอจอง` | 1. เปิดแท็บคำขอจอง | ตารางเลขที่ ผู้จอง ห้อง วัน สถานะ เอกสาร | ⬜ |  |  |
| TC-A-04 | A-04 | กรองคำขอตามสถานะ | `Admin คำขอจอง` | 1. filter รออนุมัติ | เฉพาะ pending | ⬜ |  |  |
| TC-A-06 | A-06 | ปฏิเสธคำขอจอง | `Admin คำขอจอง` | 1. ปฏิเสธ 2. ใส่เหตุผล 3. ยืนยัน | disapproved + ผู้ใช้เห็นเหตุผล | ⬜ |  |  |
| TC-A-07 | A-07 | ดาวน์โหลดเอกสาร Memo | `Admin คำขอจอง` | 1. คลิกลิงก์เอกสารแนบ | เปิด/ดาวน์โหลด PDF ได้ | ⬜ |  |  |
| TC-A-08 | A-08 | ส่งออกเอกสาร ZIP | `Admin คำขอจอง` | 1. ติ๊กหลายรายการ 2. ดาวน์โหลด ZIP | ZIP แยกตาม booking_no | ⬜ |  |  |
| TC-A-09 | A-09 | ดูสลิปการชำระเงิน | `Admin คำขอจอง` | 1. เปิดรายการ pending_verification | เห็นรูปสลิป | ⬜ |  |  |
| TC-A-10 | A-10 | ยืนยันการชำระเงิน | `Admin คำขอจอง` | 1. กดยืนยันการชำระเงิน | verified / ชำระแล้ว | ⬜ |  |  |
| TC-A-12 | A-12 | เปิด/ปิดการใช้งานห้อง | `Admin ห้อง` | 1. Toggle ห้อง 2. ดู /rooms | ห้องที่ปิดไม่โชว์ฝั่งผู้ใช้ | ⬜ |  |  |
| TC-A-21 | A-21 | เปลี่ยน Role / Promote Admin | `Admin Users` | 1. ตั้ง/ถอด Admin | Role อัปเดตสำเร็จ | ⬜ |  |  |
| TC-E-07 | E-07 | อีเมลยืนยันหลังจอง | `อีเมล` | 1. ส่งจอง 2. ดู inbox | ได้อีเมลยืนยัน (หรือ console ถ้ายังไม่มี SMTP) | ⬜ |  |  |
| TC-E-08 | E-08 | อีเมลแจ้งผลอนุมัติ | `อีเมล` | 1. Admin อนุมัติ 2. ดู inbox ผู้ใช้ | ได้อีเมลแจ้งผล | ⬜ |  |  |
| TC-A-R4-02 | — (R4) | Preview เอกสารก่อนอนุมัติ | `Admin confirm` | 1. เปิด confirm 2. ดู Preview | เห็น preview PDF/รูป | ⬜ |  |  |

---

## Checklist ส่งงาน

- [ ] เคส priority: TC-A-R4-02, TC-A-06, TC-A-08, TC-U-24b
- [ ] เคสอื่นของพาร์ท ในตารางด้านบน
- [ ] รูปใน `docs/evidence/`

ไฟล์อื่น: [คอม](./kom.md) · [ซี](./cee.md) · [พาร์ท](./part.md) · [เจ](./jay.md)
