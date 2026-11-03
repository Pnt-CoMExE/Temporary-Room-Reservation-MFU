# เทสเคส — ซี (CCC)

**หลักฐาน:** [`../evidence/CCC/`](../evidence/CCC/) · README: [`../evidence/CCC/README.md`](../evidence/CCC/README.md)  
**ตารางรวม:** [`../TEST_CASE_TRACKER.md`](../TEST_CASE_TRACKER.md) · แผนที่รหัส: [`_id-map.md`](./_id-map.md)

อัปเดต: 2026-11-03 · แยกตามผู้รับผิดชอบจากโฟลเดอร์ evidence ใน tracker

| TC (flow) | ชื่อเคส | ผล | หลักฐาน |
|-----------|---------|----|---------|
| TC-AUTH-01 | Login บุคลากรภายใน (internal) | ✅ | `evidence/CCC/TC-U-01.png` |
| TC-AUTH-02 | Login `@lamduan.mfu.ac.th` | ✅ | `evidence/CCC/TC-U-02.png` |
| TC-AUTH-03 | Login โดเมนอื่น (เช่น Gmail) | ✅ | `evidence/CCC/TC-U-03.png` |
| TC-AUTH-05 | เปิดหน้า protected โดยไม่ login | ✅ | `evidence/CCC/TC-U-05.png` |
| TC-ROOM-01 | หน้ารายการห้อง | ✅ | `evidence/CCC/TC-U-07.png` |
| TC-ROOM-02 | กรองประเภทพื้นที่ | ✅ | `evidence/CCC/TC-U-08.png` |
| TC-ROOM-03 | ค้นหาภาษาไทย | ✅ | `evidence/CCC/TC-U-09.png` |
| TC-ROOM-04 | ค้นหาภาษาอังกฤษ | ✅ | `evidence/CCC/TC-U-10.png` |
| TC-ROOM-05 | หน้ารายละเอียดห้อง | ✅ | `evidence/CCC/TC-U-11.png` |
| TC-BOOK-01 | เลือกวันและช่วงเวลา | ✅ | `evidence/CCC/TC-U-13.png` |
| TC-BOOK-02 | เลือก Add-on | ✅ | `evidence/CCC/TC-U-14.png` |
| TC-BOOK-05 | ส่งฟอร์มว่าง | ✅ | `evidence/CCC/TC-E-04.png` |
| TC-BOOK-06 | ไม่แนบ PDF | ✅ | `evidence/CCC/TC-U-17.png` |
| TC-UDASH-01 | ดูรายการจองของตัวเอง | ✅ | `evidence/CCC/TC-U-20.png` |
| TC-UDASH-02 | กรองตามสถานะ | ✅ | `evidence/CCC/TC-U-21.png` |
| TC-UDASH-03 | ค้นหาเลขที่จอง | ✅ | `evidence/CCC/TC-U-22.png` |
| TC-UDASH-04 | ยกเลิกคำขอ (pending) | ✅ | `evidence/CCC/TC-U-25.png` |
| TC-UDASH-05 | ส่งรีวิวความพึงพอใจ | ✅ | `evidence/CCC/TC-U-26.png` |
| TC-UDASH-06 | ดูข้อมูลส่วนตัว | ✅ | `evidence/CCC/TC-U-27.png` |
| TC-UDASH-07 | แก้ไขเบอร์โทร | ✅ | `evidence/CCC/TC-U-28.png` |
| TC-I18N-01 | TH → EN | ✅ | `evidence/CCC/TC-I-01.png` |
| TC-I18N-02 | EN → TH | ✅ | `evidence/CCC/TC-I-02.png` |
| TC-I18N-03 | หน้า Login สลับภาษา | ✅ | `evidence/CCC/TC-I-03.png` |
| TC-I18N-04 | Modal สลับภาษา | ✅ | `evidence/CCC/TC-I-04.png` |
| TC-I18N-05 | ชื่อห้องแปลอัตโนมัติ | ✅ | `evidence/CCC/TC-I-05.png` |
| TC-I18N-06 | สถานะจองแปลอัตโนมัติ | ✅ | `evidence/CCC/TC-I-06.png` |
| TC-I18N-07 | Footer สลับภาษา | ✅ | `evidence/CCC/TC-I-07.png` |
| TC-EDGE-01 | URL ไม่มีอยู่ → 404 | ✅ | `evidence/CCC/TC-E-01.png` |

**รวม 28 เคส**
