# เทสเคส — พาร์ท (Parttime)

**หลักฐาน:** [`../evidence/Parttime/`](../evidence/Parttime/) · README: [`../evidence/Parttime/README.md`](../evidence/Parttime/README.md)  
**ตารางรวม:** [`../TEST_CASE_TRACKER.md`](../TEST_CASE_TRACKER.md) · แผนที่รหัส: [`_id-map.md`](./_id-map.md)

อัปเดต: 2026-11-03 · แยกตามผู้รับผิดชอบจากโฟลเดอร์ evidence ใน tracker

| TC (flow) | ชื่อเคส | ผล | หลักฐาน |
|-----------|---------|----|---------|
| TC-ADM-BOOK-01 | ดูรายการคำขอจอง | ✅ | `evidence/Parttime/TC-A-03.png` |
| TC-ADM-BOOK-02 | กรองตามสถานะ | ✅ | `evidence/Parttime/TC-A-04.png` |
| TC-ADM-BOOK-03 | Preview เอกสารก่อนอนุมัติ | ✅ | `evidence/Parttime/TC-A-R4-02.png` |
| TC-ADM-BOOK-07 | ปฏิเสธคำขอจอง | ✅ | `evidence/Parttime/TC-A-06-admin.png` + `TC-A-06-user.png` |
| TC-ADM-BOOK-08 | ดาวน์โหลด Memo | ✅ | `evidence/Parttime/TC-A-07.png` |
| TC-ADM-BOOK-09 | ส่งออก ZIP | ✅ | `evidence/Parttime/TC-A-08.png` |
| TC-ADM-ROOM-02 | เปิด/ปิดห้อง | ✅ | `evidence/Parttime/TC-A-12-admin.png` + `TC-A-12-user.png` |
| TC-ADM-USER-03 | Promote เป็น admin | ✅ | `evidence/Parttime/TC-U-02b.png` |
| TC-ADM-USER-04 | เปลี่ยน Role / Demote | ✅ | `evidence/Parttime/TC-A-21.png` |
| TC-EMAIL-01 | อีเมลยืนยันหลังจอง | ✅ | `evidence/Parttime/TC-E-07.png` |
| TC-EMAIL-02 | อีเมลแจ้งผลอนุมัติ/ปฏิเสธ | ✅ | `evidence/Parttime/TC-E-08.png` |

**รวม 11 เคส** ใน tracker ปัจจุบัน  
(เคส mock PromptPay/สลิปเก่าถูกตัดออกจาก suite แล้ว — ดู README ของ Parttime)
