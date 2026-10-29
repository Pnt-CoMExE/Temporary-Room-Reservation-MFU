### พาร์ท (Parttime) — Admin จอง/เอกสาร, Promote Admin
**สรุปความก้าวหน้า:** 12 / 12 เคสที่ยังอยู่ใน tracker (เคส PromptPay/สลิปถูกตัดออก 2026-10-30)

| TC# | ชื่อเคส | Owner | สถานะ | หลักฐาน | หมายเหตุ |
|-----|---------|-------|--------|----------|----------|
| TC-U-02b | Admin promote ผู้ใช้เป็น admin | พาร์ท | ✅ | `docs/testing/evidence/Parttime/TC-U-02b.png` <br> `docs/testing/evidence/Parttime/TC-U-02b-login-admin.png` | ตั้ง Role แล้วผู้ใช้ล็อกอินได้สิทธิ์ Admin เรียบร้อย |
| TC-U-24b | จำลองชำระเงิน Mock Sandbox | พาร์ท | ✅ | `docs/testing/evidence/Parttime/TC-U-24b.png` | โหมด mock รูปขึ้นจำลองสำเร็จ |
| TC-A-03 | ดูรายการคำขอจอง | พาร์ท | ✅ | `docs/testing/evidence/Parttime/TC-A-03.png` | แสดงรายการคำขอจองครบถ้วน |
| TC-A-04 | กรองคำขอตามสถานะ | พาร์ท | ✅ | `docs/testing/evidence/Parttime/TC-A-04.png` | กรองและค้นหาคำขอจองได้ถูกต้อง |
| TC-A-06 | ปฏิเสธคำขอจอง | พาร์ท | ✅ | `docs/testing/evidence/Parttime/TC-A-06-admin.png` <br> `docs/testing/evidence/Parttime/TC-A-06-user.png` | ปฏิเสธคำขอสำเร็จและผู้ใช้เห็นเหตุผลในประวัติ |
| TC-A-07 | ดาวน์โหลดเอกสาร Memo | พาร์ท | ✅ | `docs/testing/evidence/Parttime/TC-A-07.png` | เปิดเอกสาร PDF ได้ถูกต้อง |
| TC-A-08 | ส่งออกเอกสาร ZIP | พาร์ท | ✅ | `docs/testing/evidence/Parttime/TC-A-08.png` | รวมไฟล์เอกสารเป็น ZIP ดาวน์โหลดสำเร็จ |
| TC-A-12 | เปิด/ปิดการใช้งานห้อง | พาร์ท | ✅ | `docs/testing/evidence/Parttime/TC-A-12-admin.png` <br> `docs/testing/evidence/Parttime/TC-A-12-user.png` | ปิดสวิตช์แล้วห้องซ่อนจากรายการฝั่งผู้ใช้ |
| TC-A-21 | เปลี่ยน Role / Promote Admin | พาร์ท | ✅ | `docs/testing/evidence/Parttime/TC-A-21.png` | อัปเดต Role ผู้ใช้สำเร็จ |
| TC-E-07 | อีเมลยืนยันหลังจอง | พาร์ท | ✅ | `docs/testing/evidence/Parttime/TC-E-07.png` | แสดง Log การส่งอีเมลยืนยันคำขอจองผ่าน Console |
| TC-E-08 | อีเมลแจ้งผลอนุมัติ | พาร์ท | ✅ | `docs/testing/evidence/Parttime/TC-E-08.png` | แสดง Log การส่งอีเมลแจ้งผลการพิจารณาผ่าน Console |
| TC-A-R4-02 | Preview เอกสารก่อนอนุมัติ | พาร์ท | ✅ | `docs/testing/evidence/Parttime/TC-A-R4-02.png` | แสดง Preview เอกสารก่อนอนุมัติเรียบร้อย |

> ไฟล์รูป `TC-U-23.png` / `TC-U-24.png` อาจยังอยู่ในโฟลเดอร์นี้เป็นของเก่า — ไม่ผูกกับ tracker แล้ว
