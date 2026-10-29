# 10. Admin Users / Logs

**เฟส:** แอดมิน  ·  **จำนวน:** 6 เคส

> ผู้ใช้ · Promote Admin · บันทึกกิจกรรม

ตารางรวมทุกโฟลว์: [`../TEST_CASE_TRACKER.md`](../TEST_CASE_TRACKER.md)  ·  แผนที่รหัสเก่า: [`_id-map.md`](./_id-map.md)

| ผล | ความหมาย |
|----|----------|
| ✅ | ผ่าน |
| ❌ | ไม่ผ่าน |
| ⬜ | ยังไม่ทดสอบ |

## Users

| TC# | ชื่อเคส | หน้า | ขั้นตอน | คาดหวัง | ผล | หลักฐาน | หมายเหตุ |
|-----|---------|------|---------|---------|----|---------|----------|
| TC-ADM-USER-01 | ดูรายการผู้ใช้ | Admin Users | เปิดแท็บผู้ใช้ | ชื่อ อีเมล Role สถิติ | ✅ | `evidence/JJ/TC-A-19.png` |  |
| TC-ADM-USER-02 | ค้นหาผู้ใช้ | Admin Users | พิมพ์ชื่อ/อีเมล | กรองตรง | ✅ | `evidence/JJ/TC-A-20.png` |  |
| TC-ADM-USER-03 | Promote เป็น admin | Admin Users | ตั้ง Role=admin | ได้สิทธิ์ admin หลัง login | ✅ | `evidence/Parttime/TC-U-02b.png` | promote ได้เฉพาะ `@mfu.ac.th` |
| TC-ADM-USER-04 | เปลี่ยน Role / Demote | Admin Users | ตั้ง/ถอด Admin | Role อัปเดตสำเร็จ | ✅ | `evidence/Parttime/TC-A-21.png` |  |
| TC-ADM-USER-05 | ไม่มีปุ่มตั้ง Co-op | Admin Users | ดูปุ่มจัดการ Role | ไม่มีปุ่มตั้ง Co-op | ✅ | `evidence/JJ/TC-A-R4-04.png` |  |

## Activity log

| TC# | ชื่อเคส | หน้า | ขั้นตอน | คาดหวัง | ผล | หลักฐาน | หมายเหตุ |
|-----|---------|------|---------|---------|----|---------|----------|
| TC-ADM-LOG-01 | ดูบันทึกกิจกรรม | Admin Logs | เปิดแท็บบันทึกกิจกรรม | เห็นการกระทำ รายละเอียด เวลา | ✅ | `evidence/JJ/TC-A-22.png` |  |

---

← [ดัชนีโฟลว์](./README.md)
