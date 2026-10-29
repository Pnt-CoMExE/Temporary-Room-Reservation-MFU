# 9. Admin Content — Banner / Promo / ประกาศ

**เฟส:** แอดมิน  ·  **จำนวน:** 9 เคส

> แบนเนอร์หน้าแรก · ประกาศ · รหัสส่วนลด

ตารางรวมทุกโฟลว์: [`../TEST_CASE_TRACKER.md`](../TEST_CASE_TRACKER.md)  ·  แผนที่รหัสเก่า: [`_id-map.md`](./_id-map.md)

| ผล | ความหมาย |
|----|----------|
| ✅ | ผ่าน |
| ❌ | ไม่ผ่าน |
| ⬜ | ยังไม่ทดสอบ |

## Banner / Broadcast

| TC# | ชื่อเคส | หน้า | ขั้นตอน | คาดหวัง | ผล | หลักฐาน | หมายเหตุ |
|-----|---------|------|---------|---------|----|---------|----------|
| TC-ADM-BAN-01 | ดูรายการแบนเนอร์ | Admin แบนเนอร์ | เปิดแท็บบันเนอร์ | รายการ + preview | ✅ | `evidence/JJ/TC-A-13.png` |  |
| TC-ADM-BAN-02 | เพิ่มแบนเนอร์ | Admin แบนเนอร์ | กรอก + อัปโหลด → บันทึก | โชว์ใน admin และ `/home` | ✅ | `evidence/JJ/TC-A-14.png` |  |
| TC-ADM-BAN-03 | เปิด/ปิดแบนเนอร์ | Admin แบนเนอร์ | Toggle | ที่ปิดไม่โชว์ `/home` | ✅ | `evidence/JJ/TC-A-15(admin).png` |  |
| TC-ADM-BAN-04 | ลบแบนเนอร์ | Admin แบนเนอร์ | ลบ → ยืนยัน | หายจาก admin และ `/home` | ✅ | `evidence/JJ/TC-A-15b(admin).png` |  |
| TC-ADM-BAN-05 | ส่งประกาศ Broadcast | Admin | ส่งประกาศ | ผู้ใช้เห็นในกระดิ่ง Navbar | ✅ | `evidence/JJ/TC-A-15c.png` |  |

## Promo codes

| TC# | ชื่อเคส | หน้า | ขั้นตอน | คาดหวัง | ผล | หลักฐาน | หมายเหตุ |
|-----|---------|------|---------|---------|----|---------|----------|
| TC-ADM-PROMO-01 | ดูรายการ Promo | Admin โปรโม | เปิดแท็บรหัสส่วนลด | เห็นรหัส + สถิติ | ✅ | `evidence/JJ/TC-A-16.png` |  |
| TC-ADM-PROMO-02 | สร้าง Promo ใหม่ | Admin โปรโม | กรอกฟอร์ม → สร้าง | ใช้ได้ตอนจอง | ✅ | `evidence/JJ/TC-A-17.png` |  |
| TC-ADM-PROMO-03 | เปิด/ปิด Promo | Admin โปรโม | Toggle | รหัสที่ปิดใช้ไม่ได้ | ✅ | `evidence/JJ/TC-A-18.png` |  |
| TC-ADM-PROMO-04 | ไม่มีปุ่มลบ Promo (เหลือ toggle) | Admin โปรโม | ตรวจ UI · ลอง DELETE API | มีเปิด/ปิด ไม่มีลบ · DELETE → 403 | ✅ | `evidence/JJ/TC-A-28.png` |  |

---

← [ดัชนีโฟลว์](./README.md)
