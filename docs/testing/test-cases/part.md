# Test Cases — พาร์ท

**Owner:** พาร์ท  
**โฟกัส:** Admin จอง/เอกสาร, promote admin  
**จำนวน:** 16 เคส (ข้าม 4 เคสสลิป/PromptPay เพราะ UAT ปัจจุบันจ่ายด้วย Stripe)  
**ส่งก่อน:** TC-A-R4-02, TC-A-06, TC-A-08

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
- Payment ปัจจุบัน: `PAYMENT_PROVIDER=stripe` (จ่ายเองจนเป็นชำระแล้ว ไม่มีขั้นตรวจสลิป)
- สลิป/QR ยังอยู่ในโค้ดเมื่อสลับเป็น `promptpay_manual` เท่านั้น ไม่ต้องเทสรอบนี้

### บัญชี Admin (UAT)
- ของพาร์ท: `6631501081@lamduan.mfu.ac.th` → **admin** (`DEV_ADMIN_EMAILS`)
- เคสส่วนใหญ่ใช้ **admin** · เคส mock (`TC-U-24b`) ใช้ user แยก

---

## ตารางของ พาร์ท

| TC# | เดิม | ชื่อเคส | หน้า | Scenario | Expected | ผล | หลักฐาน | หมายเหตุ |
|-----|------|---------|------|----------|----------|----|---------|----------|
| TC-U-02b | U-02b | Admin promote ผู้ใช้เป็น admin | `Admin Users` | 1. Login Admin 2. Users 3. ตั้ง Role=admin | ผู้ใช้นั้น login แล้วได้ Role=admin | ✅ | `evidence/Parttime/TC-U-02b.png` + `TC-U-02b-login-admin.png` | ตั้ง Role แล้วผู้ใช้ล็อกอินได้สิทธิ์ Admin เรียบร้อย |
| TC-U-23 | U-23 | ดู QR Code PromptPay | `/dashboard` | 1. PAYMENT_PROVIDER=promptpay_manual 2. สแกนชำระเงิน | Modal QR + ยอด + อัปโหลดสลิป | ⏭️ | `evidence/Parttime/TC-U-23.png` | ข้าม: UAT ปัจจุบันเป็น Stripe มีรูป QR เก่าไว้แล้ว |
| TC-U-24 | U-24 | อัปโหลดสลิปการโอน | `/dashboard` | 1. ใน Modal แนบสลิป jpg 2. ส่ง | รอตรวจสอบการชำระเงิน | ⏭️ | `evidence/Parttime/TC-U-24.png` | ข้าม: Stripe ไม่มีขั้นส่งสลิป มีรูปเก่าไว้แล้ว |
| TC-U-24b | U-24b | จำลองชำระเงิน Mock Sandbox | `/dashboard` | 1. PAYMENT_PROVIDER=mock_sandbox 2. จำลองชำระ 3. ยืนยัน | pending_verification โดยไม่โอนจริง | ✅ | `evidence/Parttime/TC-U-24b.png` | โหมด mock รูปขึ้นจำลองสำเร็จ |
| TC-A-03 | A-03 | ดูรายการคำขอจอง | `Admin คำขอจอง` | 1. เปิดแท็บคำขอจอง | ตารางเลขที่ ผู้จอง ห้อง วัน สถานะ เอกสาร | ✅ | `evidence/Parttime/TC-A-03.png` | แสดงรายการคำขอจองครบถ้วน |
| TC-A-04 | A-04 | กรองคำขอตามสถานะ | `Admin คำขอจอง` | 1. filter รออนุมัติ | เฉพาะ pending | ✅ | `evidence/Parttime/TC-A-04.png` | กรองและค้นหาคำขอจองได้ถูกต้อง |
| TC-A-06 | A-06 | ปฏิเสธคำขอจอง | `Admin คำขอจอง` | 1. ปฏิเสธ 2. ใส่เหตุผล 3. ยืนยัน | disapproved + ผู้ใช้เห็นเหตุผล | ✅ | `evidence/Parttime/TC-A-06-admin.png` + `TC-A-06-user.png` | ปฏิเสธคำขอสำเร็จและผู้ใช้เห็นเหตุผลในประวัติ |
| TC-A-07 | A-07 | ดาวน์โหลดเอกสาร Memo | `Admin คำขอจอง` | 1. คลิกลิงก์เอกสารแนบ | เปิด/ดาวน์โหลด PDF ได้ | ✅ | `evidence/Parttime/TC-A-07.png` | เปิดเอกสาร PDF ได้ถูกต้อง |
| TC-A-08 | A-08 | ส่งออกเอกสาร ZIP | `Admin คำขอจอง` | 1. ติ๊กหลายรายการ 2. ดาวน์โหลด ZIP | ZIP แยกตาม booking_no | ✅ | `evidence/Parttime/TC-A-08.png` | รวมไฟล์เอกสารเป็น ZIP ดาวน์โหลดสำเร็จ |
| TC-A-09 | A-09 | ดูสลิปการชำระเงิน | `Admin คำขอจอง` | 1. เปิดรายการ pending_verification | เห็นรูปสลิป | ⏭️ | | ข้าม: Stripe ไม่มีสลิปให้แอดมินเปิดดู |
| TC-A-10 | A-10 | ยืนยันการชำระเงิน | `Admin คำขอจอง` | 1. กดยืนยันการชำระเงิน | verified / ชำระแล้ว | ⏭️ | | ข้าม: Stripe ตั้งชำระแล้วเอง ดู TC-P-R4-01 |
| TC-A-12 | A-12 | เปิด/ปิดการใช้งานห้อง | `Admin ห้อง` | 1. Toggle ห้อง 2. ดู /rooms | ห้องที่ปิดไม่โชว์ฝั่งผู้ใช้ | ✅ | `evidence/Parttime/TC-A-12-admin.png` + `TC-A-12-user.png` | ปิดสวิตช์แล้วห้องซ่อนจากรายการฝั่งผู้ใช้ |
| TC-A-21 | A-21 | เปลี่ยน Role / Promote Admin | `Admin Users` | 1. ตั้ง/ถอด Admin | Role อัปเดตสำเร็จ | ✅ | `evidence/Parttime/TC-A-21.png` | อัปเดต Role ผู้ใช้สำเร็จ |
| TC-E-07 | E-07 | อีเมลยืนยันหลังจอง | `อีเมล` | 1. ส่งจอง 2. ดู inbox | ได้อีเมลยืนยัน (หรือ console ถ้ายังไม่มี SMTP) | ✅ | `evidence/Parttime/TC-E-07.png` | แสดง Log การส่งอีเมลยืนยันคำขอจองผ่าน Console |
| TC-E-08 | E-08 | อีเมลแจ้งผลอนุมัติ | `อีเมล` | 1. Admin อนุมัติ 2. ดู inbox ผู้ใช้ | ได้อีเมลแจ้งผล | ✅ | `evidence/Parttime/TC-E-08.png` | แสดง Log การส่งอีเมลแจ้งผลการพิจารณาผ่าน Console |
| TC-A-R4-02 | — (R4) | Preview เอกสารก่อนอนุมัติ | `Admin confirm` | 1. เปิด confirm 2. ดู Preview | เห็น preview PDF/รูป | ✅ | `evidence/Parttime/TC-A-R4-02.png` | แสดง Preview เอกสารก่อนอนุมัติเรียบร้อย |

---

## Checklist ส่งงาน

- [x] เคส priority ที่ยังไม่ครบ: TC-A-06 (เห็นเหตุผลฝั่งผู้ใช้แล้ว) · TC-A-R4-02 และ TC-A-08 มีรูปแล้ว
- [x] ข้ามสลิปแล้ว: TC-U-23, TC-U-24, TC-A-09, TC-A-10
- [x] เคสทั้งหมดของพาร์ทครบ 100% เรียบร้อยแล้ว
- [x] รูปอยู่ใน `docs/testing/evidence/Parttime/`

ไฟล์อื่น: [คอม](./kom.md) · [ซี](./cee.md) · [พาร์ท](./part.md) · [เจ](./jay.md)