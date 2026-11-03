# เทสเคส — คอม (CoM)

**หลักฐาน:** [`../evidence/CoM/`](../evidence/CoM/) · README: [`../evidence/CoM/README.md`](../evidence/CoM/README.md)  
**ตารางรวม:** [`../TEST_CASE_TRACKER.md`](../TEST_CASE_TRACKER.md) · แผนที่รหัส: [`_id-map.md`](./_id-map.md)

อัปเดต: 2026-11-03 · แยกตามผู้รับผิดชอบจากโฟลเดอร์ evidence ใน tracker

| TC (flow) | ชื่อเคส | ผล | หลักฐาน |
|-----------|---------|----|---------|
| TC-AUTH-06 | Session หมด / ไม่มี token | ✅ | `evidence/CoM/TC-E-02.png` |
| TC-AUTH-07 | User ทั่วไปเปิด `/admin` | ✅ | `evidence/CoM/TC-E-03.png` |
| TC-AUTH-08 | ยืนยัน AuthZ หน้า Admin | ✅ | `evidence/CoM/TC-Z-01.png` |
| TC-AUTH-09 | Unit test AuthZ (`npm test`) | ✅ | `evidence/CoM/README.md` |
| TC-BOOK-03 | ใช้รหัสส่วนลดที่ถูกต้อง | ✅ | `evidence/CoM/TC-U-15.png` |
| TC-BOOK-04 | ส่งคำขอจองครบถ้วน | ✅ | `evidence/CoM/TC-U-12.png` (+ `TC-U-12-dashboard.png`) |
| TC-BOOK-07 | แนบไฟล์ไม่ใช่ PDF | ✅ | `evidence/CoM/TC-U-18.png` |
| TC-BOOK-08 | ไฟล์เกินขนาด | ✅ | `evidence/CoM/TC-E-05.png` |
| TC-BOOK-09 | รหัสส่วนลดไม่มีจริง | ✅ | `evidence/CoM/TC-U-16.png` |
| TC-BOOK-10 | จองซ้ำช่วงเวลาเดียวกัน | ✅ | `evidence/CoM/TC-U-19.png` |
| TC-PAY-01 | ชำระผ่าน Stripe checkout | ✅ | `evidence/CoM/TC-P-R4-01.png` |
| TC-PAY-02 | อ่าน Transaction ID หลัง callback | ✅ | `evidence/CoM/TC-P-R4-02.png` |
| TC-PAY-03 | เมล+PDF ใบอนุญาตหลัง Stripe | ✅ | (คู่กับ TC-PAY-04 / inbox) |
| TC-PAY-04 | PDF ใบอนุญาตอังกฤษ อ่านได้ครบ | ✅ | `evidence/CoM/TC-PAY-04.webp` |
| TC-ADM-BOOK-04 | อนุมัติคำขอ (แนบใบ+confirm) | ✅ | `evidence/CoM/TC-A-05.png` |
| TC-ADM-BOOK-05 | เลือกเรทตอนอนุมัติ | ✅ | `evidence/CoM/TC-A-R4-01.png` |
| TC-ADM-BOOK-06 | Log เปลี่ยนเรท | ✅ | `evidence/CoM/TC-A-R4-03.png` |
| TC-ADM-ROOM-03 | Import เทมเพลตถูกต้อง | ✅ | `evidence/CoM/TC-A-23.png` / `TC-A-23-success.png` |
| TC-ADM-ROOM-04 | Import ไฟล์ผิดรูปแบบ | ✅ | `evidence/CoM/TC-A-24.png` |
| TC-ADM-ROOM-05 | จำนวนห้องสมเหตุสมผล | ✅ | `evidence/CoM/TC-A-25.png` |
| TC-ADM-ROOM-06 | ราคาครึ่ง/เต็มวันถูกต้อง | ✅ | `evidence/CoM/TC-A-26.png` |
| TC-ADM-ADDON-01 | แก้ราคา Add-on | ✅ | `evidence/CoM/TC-A-27.png` |

**รวมประมาณ 22 เคส** (รวม PAY-03 ที่หลักฐานคู่กับ PAY-04)
