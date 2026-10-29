# แผนที่รหัส TC (ใหม่ → เดิม)

ใช้จับคู่ไฟล์หลักฐานใน `docs/testing/evidence/` ที่ยังตั้งชื่อตามรหัสเก่า

| ใหม่ | เดิม | ชื่อเคส |
|------|------|---------|
| TC-AUTH-01 | TC-U-01 | Login บุคลากรภายใน (internal) |
| TC-AUTH-02 | TC-U-02 | Login `@lamduan.mfu.ac.th` |
| TC-AUTH-03 | TC-U-03 | Login โดเมนอื่น (เช่น Gmail) |
| TC-AUTH-04 | TC-U-04 | ออกจากระบบ |
| TC-AUTH-05 | TC-U-05 | เปิดหน้า protected โดยไม่ login |
| TC-AUTH-06 | TC-E-02 | Session หมด / ไม่มี token |
| TC-AUTH-07 | TC-E-03 | User ทั่วไปเปิด `/admin` |
| TC-AUTH-08 | TC-Z-01 | ยืนยัน AuthZ หน้า Admin |
| TC-AUTH-09 | TC-Z-02 | Unit test AuthZ |
| TC-HOME-01 | TC-U-06 | Banner + Featured Rooms |
| TC-ROOM-01 | TC-U-07 | หน้ารายการห้อง |
| TC-ROOM-02 | TC-U-08 | กรองประเภทพื้นที่ |
| TC-ROOM-03 | TC-U-09 | ค้นหาภาษาไทย |
| TC-ROOM-04 | TC-U-10 | ค้นหาภาษาอังกฤษ |
| TC-ROOM-05 | TC-U-11 | หน้ารายละเอียดห้อง |
| TC-BOOK-01 | TC-U-13 | เลือกวันและช่วงเวลา |
| TC-BOOK-02 | TC-U-14 | เลือก Add-on |
| TC-BOOK-03 | TC-U-15 | ใช้รหัสส่วนลดที่ถูกต้อง |
| TC-BOOK-04 | TC-U-12 | ส่งคำขอจองครบถ้วน |
| TC-BOOK-05 | TC-E-04 | ส่งฟอร์มว่าง |
| TC-BOOK-06 | TC-U-17 | ไม่แนบ PDF |
| TC-BOOK-07 | TC-U-18 | แนบไฟล์ไม่ใช่ PDF |
| TC-BOOK-08 | TC-E-05 | ไฟล์เกินขนาด |
| TC-BOOK-09 | TC-U-16 | รหัสส่วนลดไม่มีจริง |
| TC-BOOK-10 | TC-U-19 | จองซ้ำช่วงเวลาเดียวกัน |
| TC-UDASH-01 | TC-U-20 | ดูรายการจองของตัวเอง |
| TC-UDASH-02 | TC-U-21 | กรองตามสถานะ |
| TC-UDASH-03 | TC-U-22 | ค้นหาเลขที่จอง |
| TC-UDASH-04 | TC-U-25 | ยกเลิกคำขอ (pending) |
| TC-UDASH-05 | TC-U-26 | ส่งรีวิวความพึงพอใจ |
| TC-UDASH-06 | TC-U-27 | ดูข้อมูลส่วนตัว |
| TC-UDASH-07 | TC-U-28 | แก้ไขเบอร์โทร |
| TC-PAY-01 | TC-P-R4-01 | ชำระผ่าน Stripe checkout |
| TC-PAY-02 | TC-P-R4-02 | อ่าน Transaction ID หลัง callback |
| TC-PAY-03 | TC-U-24b | จำลองชำระ Mock Sandbox |
| TC-ADM-DASH-01 | TC-A-01 | Dashboard สถิติ |
| TC-ADM-DASH-02 | TC-A-02 | Sidebar ครบ |
| TC-ADM-BOOK-01 | TC-A-03 | ดูรายการคำขอจอง |
| TC-ADM-BOOK-02 | TC-A-04 | กรองตามสถานะ |
| TC-ADM-BOOK-03 | TC-A-R4-02 | Preview เอกสารก่อนอนุมัติ |
| TC-ADM-BOOK-04 | TC-A-05 | อนุมัติคำขอ (แนบใบ+confirm) |
| TC-ADM-BOOK-05 | TC-A-R4-01 | เลือกเรทตอนอนุมัติ |
| TC-ADM-BOOK-06 | TC-A-R4-03 | Log เปลี่ยนเรท |
| TC-ADM-BOOK-07 | TC-A-06 | ปฏิเสธคำขอจอง |
| TC-ADM-BOOK-08 | TC-A-07 | ดาวน์โหลด Memo |
| TC-ADM-BOOK-09 | TC-A-08 | ส่งออก ZIP |
| TC-ADM-ROOM-01 | TC-A-11 | ดูรายการห้อง |
| TC-ADM-ROOM-02 | TC-A-12 | เปิด/ปิดห้อง |
| TC-ADM-ROOM-03 | TC-A-23 | Import เทมเพลตถูกต้อง |
| TC-ADM-ROOM-04 | TC-A-24 | Import ไฟล์ผิดรูปแบบ |
| TC-ADM-ROOM-05 | TC-A-25 | จำนวนห้องสมเหตุสมผล |
| TC-ADM-ROOM-06 | TC-A-26 | ราคาครึ่ง/เต็มวันถูกต้อง |
| TC-ADM-ADDON-01 | TC-A-27 | แก้ราคา Add-on |
| TC-ADM-BAN-01 | TC-A-13 | ดูรายการแบนเนอร์ |
| TC-ADM-BAN-02 | TC-A-14 | เพิ่มแบนเนอร์ |
| TC-ADM-BAN-03 | TC-A-15 | เปิด/ปิดแบนเนอร์ |
| TC-ADM-BAN-04 | TC-A-15b | ลบแบนเนอร์ |
| TC-ADM-BAN-05 | TC-A-15c | ส่งประกาศ Broadcast |
| TC-ADM-PROMO-01 | TC-A-16 | ดูรายการ Promo |
| TC-ADM-PROMO-02 | TC-A-17 | สร้าง Promo ใหม่ |
| TC-ADM-PROMO-03 | TC-A-18 | เปิด/ปิด Promo |
| TC-ADM-PROMO-04 | TC-A-28 | ไม่มีปุ่มลบ Promo (เหลือ toggle) |
| TC-ADM-USER-01 | TC-A-19 | ดูรายการผู้ใช้ |
| TC-ADM-USER-02 | TC-A-20 | ค้นหาผู้ใช้ |
| TC-ADM-USER-03 | TC-U-02b | Promote เป็น admin |
| TC-ADM-USER-04 | TC-A-21 | เปลี่ยน Role / Demote |
| TC-ADM-USER-05 | TC-A-R4-04 | ไม่มีปุ่มตั้ง Co-op |
| TC-ADM-LOG-01 | TC-A-22 | ดูบันทึกกิจกรรม |
| TC-I18N-01 | TC-I-01 | TH → EN |
| TC-I18N-02 | TC-I-02 | EN → TH |
| TC-I18N-03 | TC-I-03 | หน้า Login สลับภาษา |
| TC-I18N-04 | TC-I-04 | Modal สลับภาษา |
| TC-I18N-05 | TC-I-05 | ชื่อห้องแปลอัตโนมัติ |
| TC-I18N-06 | TC-I-06 | สถานะจองแปลอัตโนมัติ |
| TC-I18N-07 | TC-I-07 | Footer สลับภาษา |
| TC-EDGE-01 | TC-E-01 | URL ไม่มีอยู่ → 404 |
| TC-EDGE-02 | TC-E-06 | Responsive mobile |
| TC-EMAIL-01 | TC-E-07 | อีเมลยืนยันหลังจอง |
| TC-EMAIL-02 | TC-E-08 | อีเมลแจ้งผลอนุมัติ/ปฏิเสธ |
