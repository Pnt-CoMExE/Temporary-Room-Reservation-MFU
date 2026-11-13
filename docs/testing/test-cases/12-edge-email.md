# 12. Edge / Email / Responsive

**เฟส:** ข้ามระบบ  ·  **จำนวน:** 4 เคส

> 404 · Mobile · อีเมลสถานะจอง (SMTP จริงหรือ console) · วันที่/ช่วงเวลาอ่านได้ · **EN บน / TH ล่าง** · Gmail รวมเธรด

ตารางรวมทุกโฟลว์: [`../TEST_CASE_TRACKER.md`](../TEST_CASE_TRACKER.md)  ·  แผนที่รหัสเก่า: [`_id-map.md`](./_id-map.md)

| ผล | ความหมาย |
|----|----------|
| ✅ | ผ่าน |
| ❌ | ไม่ผ่าน |
| ⬜ | ยังไม่ทดสอบ |

**SMTP:** ตั้งค่าตาม [README §3.4](../../../README.md#34-smtp-email-notifications-recommended-for-uat) · สรุปสั้นใน [`README.md`](./README.md#smtp-สำหรับรันเคสเมล-uat) · ไม่ตั้ง = ดูข้อความใน backend console  
**เมลหลังชำระ + PDF:** ดูโฟลว์ Payment [`05-payment.md`](./05-payment.md) (TC-PAY-03, TC-PAY-04)

## Edge / UI

| TC# | ชื่อเคส | หน้า | ขั้นตอน | คาดหวัง | ผล | หลักฐาน | หมายเหตุ |
|-----|---------|------|---------|---------|----|---------|----------|
| TC-EDGE-01 | URL ไม่มีอยู่ → 404 | `/nonexistent` | เปิด URL มั่ว | หน้า 404 | ✅ | `evidence/CCC/TC-E-01.png` |  |
| TC-EDGE-02 | Responsive mobile | ทั้งระบบ | DevTools iPhone/Pixel | ไม่มีเลื่อนแนวนอนผิดปกติ | ✅ | `evidence/JJ/TC-E-06.png` |  |

## อีเมล

| TC# | ชื่อเคส | หน้า | ขั้นตอน | คาดหวัง | ผล | หลักฐาน | หมายเหตุ |
|-----|---------|------|---------|---------|----|---------|----------|
| TC-EMAIL-01 | อีเมลยืนยันหลังจอง | อีเมล / console | ส่งจองสำเร็จ → เปิด inbox (หรือ log) | มีเมลยืนยัน · **EN บน / TH ล่าง** · หัวข้อยืนยันสีเขียว · มี**วันที่จอง**อ่านง่าย · มี**ช่วงเวลา**พร้อมนาฬิกา | ✅ | `evidence/Parttime/TC-E-07.png` · เธรด/bilingual: `evidence/CoM/TC-EMAIL-thread-04b-gmail-open.png` | SMTP หรือ console |
| TC-EMAIL-02 | อีเมลแจ้งผลอนุมัติ/ปฏิเสธ | อีเมล / console | Admin อนุมัติหรือปฏิเสธ → เปิด inbox | มีเมลแจ้งผล · **EN บน / TH ล่าง** · สถานะถูก · รวม Gmail conversation กับเมลยืนยันรหัสจองเดิม · ถ้าปฏิเสธมีเหตุผล (หัวแดง) | ✅ | `evidence/Parttime/TC-E-08.png` · เธรด: `evidence/CoM/TC-EMAIL-thread-04-gmail.png` / `04c-gmail-deny.png` | SMTP หรือ console |

### จุดตรวจร่วมในเนื้อเมล (EMAIL-01 / 02)

| # | จุดตรวจ | คาดหวัง |
|---|---------|---------|
| 1 | วันที่จอง | อ่านง่ายทั้ง EN และ TH — **ห้าม** `Wed Nov 04 2026 00:00:00 GMT…` |
| 2 | ช่วงเวลา | TH: `ครึ่งวันเช้า (08:00 - 12:00 น.)` ฯลฯ · EN: `Morning Half Day (08:00 - 12:00)` ฯลฯ — **ห้าม** `HALF_AFTERNOON` ดิบ |
| 3 | รหัสจอง | ตรงระบบ |
| 4 | ภาษาในตัวเมล | ส่วน **English** อยู่บน · ส่วน **ภาษาไทย / Thai** อยู่ล่าง |
| 5 | สีหัวข้อ | ยืนยันจอง = เขียว · ไม่อนุมัติ = แดง (ไม่ใช้แดงกับเมลยืนยัน) |
| 6 | Gmail conversation | รหัสจองเดียวกัน = 1 เธรด (subject คงที่ + `Re:` + `In-Reply-To`) |
| 7 | การส่ง | SMTP เปิด → ถึง inbox · ไม่เปิด SMTP → มี log ใน backend |

---

← [ดัชนีโฟลว์](./README.md)
