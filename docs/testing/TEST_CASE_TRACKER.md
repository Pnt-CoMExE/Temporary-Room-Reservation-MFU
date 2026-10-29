# Test Case Tracker

**อัปเดต:** 2026-10-30  ·  **รวม:** 79 เคส (ผ่านครบ)

ดัชนีไฟล์: [`test-cases/README.md`](./test-cases/README.md)  ·  แผนที่รหัส: [`test-cases/_id-map.md`](./test-cases/_id-map.md)

---

## วิธีใช้ (สั้น)

1. เปิดไฟล์โฟลว์ตามลำดับในดัชนี
2. ทำตาม **ขั้นตอน** → เทียบ **คาดหวัง**
3. เก็บ screenshot ตามคอลัมน์ **หลักฐาน** (ชื่อไฟล์ = รหัสเก่า)
4. อัปเดต **ผล** ในไฟล์โฟลว์และตารางด้านล่าง

| ผล | ความหมาย |
|----|----------|
| ✅ | ผ่าน |
| ❌ | ไม่ผ่าน |
| ⬜ | ยังไม่ทดสอบ |

---

## สภาพแวดล้อม

| | Dev | Docker UAT |
|--|------|------------|
| Frontend | `http://localhost:5173` | `http://localhost:8080` |
| API | `http://localhost:3000` | `http://localhost:8080/api` |
| Payment | `stripe` หรือ `mock_sandbox` | ตั้งใน `.env` |
| Admin bootstrap | `DEV_ADMIN_EMAILS` | เหมือนกัน |

Role จากอีเมล: `@mfu.ac.th` → internal · อื่นๆ → external · admin = promote / `DEV_ADMIN_EMAILS`

---

## สารบัญโฟลว์

- [1. Auth — เข้าสู่ระบบ / สิทธิ์](./test-cases/01-auth.md) (9)
- [2. Home / Rooms — ค้นหาห้อง](./test-cases/02-home-rooms.md) (6)
- [3. Booking — ส่งคำขอจอง](./test-cases/03-booking.md) (10)
- [4. User Dashboard — ติดตามคำขอ](./test-cases/04-user-dashboard.md) (7)
- [5. Payment — ชำระเงิน](./test-cases/05-payment.md) (3)
- [6. Admin Dashboard](./test-cases/06-admin-dashboard.md) (2)
- [7. Admin Bookings — พิจารณาคำขอ](./test-cases/07-admin-bookings.md) (9)
- [8. Admin Rooms / Add-ons](./test-cases/08-admin-rooms-addons.md) (7)
- [9. Admin Content — Banner / Promo / ประกาศ](./test-cases/09-admin-content.md) (9)
- [10. Admin Users / Logs](./test-cases/10-admin-users-logs.md) (6)
- [11. i18n — ภาษาไทย / อังกฤษ](./test-cases/11-i18n.md) (7)
- [12. Edge / Email / Responsive](./test-cases/12-edge-email.md) (4)

---

## 1. Auth — เข้าสู่ระบบ / สิทธิ์

*ผู้ใช้* — Login ตามโดเมน · Logout · กันหน้าที่ต้อง auth · กัน Admin

รายละเอียดเต็ม: [`test-cases/01-auth.md`](./test-cases/01-auth.md)

### Login ตามประเภทผู้ใช้

| TC# | ชื่อเคส | หน้า | ขั้นตอน | คาดหวัง | ผล | หลักฐาน |
|-----|---------|------|---------|---------|----|---------|
| TC-AUTH-01 | Login บุคลากรภายใน (internal) | `/` | Sign in with Google → บัญชี internal | เข้าได้ · Role=internal · ไป `/home` | ✅ | `evidence/CCC/TC-U-01.png` |
| TC-AUTH-02 | Login `@lamduan.mfu.ac.th` | `/` | Sign in → เมล lamduan | Role=external · ไป `/home` | ✅ | `evidence/CCC/TC-U-02.png` |
| TC-AUTH-03 | Login โดเมนอื่น (เช่น Gmail) | `/` | Sign in → `@gmail.com` | Role=external · ไป `/home` | ✅ | `evidence/CCC/TC-U-03.png` |

### Session / Logout / Guard

| TC# | ชื่อเคส | หน้า | ขั้นตอน | คาดหวัง | ผล | หลักฐาน |
|-----|---------|------|---------|---------|----|---------|
| TC-AUTH-04 | ออกจากระบบ | Navbar | เมนู → ออกจากระบบ → ยืนยัน | กลับ Login · ลบ session | ✅ | `evidence/JJ/TC-U-04.png` |
| TC-AUTH-05 | เปิดหน้า protected โดยไม่ login | `/home` | เปิด `/home` โดยตรง | Redirect Login | ✅ | `evidence/CCC/TC-U-05.png` |
| TC-AUTH-06 | Session หมด / ไม่มี token | `/dashboard` | ลบ cookie/session → เปิดหน้า auth | Redirect Login | ✅ | `evidence/CoM/TC-E-02.png` |

### AuthZ — กันหน้า Admin

| TC# | ชื่อเคส | หน้า | ขั้นตอน | คาดหวัง | ผล | หลักฐาน |
|-----|---------|------|---------|---------|----|---------|
| TC-AUTH-07 | User ทั่วไปเปิด `/admin` | `/admin/dashboard` | Login user → เปิด Admin | กันเข้า / ส่งกลับ `/home` | ✅ | `evidence/CoM/TC-E-03.png` |
| TC-AUTH-08 | ยืนยัน AuthZ หน้า Admin | `/admin/dashboard` | Login non-admin → `/admin` | กันเข้าได้ | ✅ | `evidence/CoM/TC-Z-01.png` |
| TC-AUTH-09 | Unit test AuthZ | backend | `cd backend && npm test` | ชุดเทส AuthZ ผ่าน | ✅ | `evidence/CoM/README.md` |

---

## 2. Home / Rooms — ค้นหาห้อง

*ผู้ใช้* — หน้าหลัก Featured → รายการห้อง → กรอง/ค้นหา → รายละเอียด

รายละเอียดเต็ม: [`test-cases/02-home-rooms.md`](./test-cases/02-home-rooms.md)

### หน้าหลัก

| TC# | ชื่อเคส | หน้า | ขั้นตอน | คาดหวัง | ผล | หลักฐาน |
|-----|---------|------|---------|---------|----|---------|
| TC-HOME-01 | Banner + Featured Rooms | `/home` | Login → `/home` | เห็นแบนเนอร์และห้องแนะนำ | ✅ | `evidence/JJ/TC-U-06.png` |

### รายการและค้นหา

| TC# | ชื่อเคส | หน้า | ขั้นตอน | คาดหวัง | ผล | หลักฐาน |
|-----|---------|------|---------|---------|----|---------|
| TC-ROOM-01 | หน้ารายการห้อง | `/rooms` | เปิดเมนูห้องทั้งหมด | การ์ดมีรูป ชื่อ ราคา | ✅ | `evidence/CCC/TC-U-07.png` |
| TC-ROOM-02 | กรองประเภทพื้นที่ | `/rooms` | เลือกประเภท เช่น Meeting Room | เหลือเฉพาะประเภทนั้น | ✅ | `evidence/CCC/TC-U-08.png` |
| TC-ROOM-03 | ค้นหาภาษาไทย | `/rooms` | พิมพ์คำค้นไทย | ผลตรงชื่อ | ✅ | `evidence/CCC/TC-U-09.png` |
| TC-ROOM-04 | ค้นหาภาษาอังกฤษ | `/rooms` | พิมพ์คำค้น EN | ผลสอดคล้องกับค้นไทย | ✅ | `evidence/CCC/TC-U-10.png` |

### รายละเอียดห้อง

| TC# | ชื่อเคส | หน้า | ขั้นตอน | คาดหวัง | ผล | หลักฐาน |
|-----|---------|------|---------|---------|----|---------|
| TC-ROOM-05 | หน้ารายละเอียดห้อง | `/rooms/:id` | คลิกการ์ดห้อง | รูป ความจุ ที่ตั้ง ราคาตามเรทผู้ใช้ ปฏิทิน | ✅ | `evidence/CCC/TC-U-11.png` |

---

## 3. Booking — ส่งคำขอจอง

*ผู้ใช้* — เลือกวัน/ช่วง → Add-on/โปรโม → แนบ PDF → ส่ง · ตามด้วยเคส error

รายละเอียดเต็ม: [`test-cases/03-booking.md`](./test-cases/03-booking.md)

### Happy path

| TC# | ชื่อเคส | หน้า | ขั้นตอน | คาดหวัง | ผล | หลักฐาน |
|-----|---------|------|---------|---------|----|---------|
| TC-BOOK-01 | เลือกวันและช่วงเวลา | `/booking/:id` | เลือกวัน → เช้า/บ่าย/เต็มวัน | ราคาเปลี่ยนตามช่วง | ✅ | `evidence/CCC/TC-U-13.png` |
| TC-BOOK-02 | เลือก Add-on | `/booking/:id` | เลือกอุปกรณ์เสริม | ราคารวมอัปเดตถูกต้อง | ✅ | `evidence/CCC/TC-U-14.png` |
| TC-BOOK-03 | ใช้รหัสส่วนลดที่ถูกต้อง | `/booking/:id` | ใส่โปรโมที่ใช้ได้ → ตรวจสอบ | ลดราคาตามเงื่อนไข | ✅ | `evidence/CoM/TC-U-15.png` |
| TC-BOOK-04 | ส่งคำขอจองครบถ้วน | `/booking/:id` | กรอกครบ → แนบ PDF → ส่ง | สำเร็จ · ไป `/dashboard` · รออนุมัติ | ✅ | `evidence/CoM/TC-U-12.png` |

### Validation / Error

| TC# | ชื่อเคส | หน้า | ขั้นตอน | คาดหวัง | ผล | หลักฐาน |
|-----|---------|------|---------|---------|----|---------|
| TC-BOOK-05 | ส่งฟอร์มว่าง | `/booking/:id` | กดส่งโดยไม่กรอก | validation error | ✅ | `evidence/CCC/TC-E-04.png` |
| TC-BOOK-06 | ไม่แนบ PDF | `/booking/:id` | กรอกครบแต่ไม่แนบ → ส่ง | ขอแนบเอกสาร · ไม่สร้างจอง | ✅ | `evidence/CCC/TC-U-17.png` |
| TC-BOOK-07 | แนบไฟล์ไม่ใช่ PDF | `/booking/:id` | แนบ `.txt` → ส่ง | รับเฉพาะ PDF | ✅ | `evidence/CoM/TC-U-18.png` |
| TC-BOOK-08 | ไฟล์เกินขนาด | `/booking/:id` | แนบ PDF ~15MB → ส่ง | error ไฟล์ใหญ่เกินไป | ✅ | `evidence/CoM/TC-E-05.png` |
| TC-BOOK-09 | รหัสส่วนลดไม่มีจริง | `/booking/:id` | ใส่รหัสผิด → ตรวจสอบ | error รหัสไม่ถูกต้อง | ✅ | `evidence/CoM/TC-U-16.png` |
| TC-BOOK-10 | จองซ้ำช่วงเวลาเดียวกัน | `/booking/:id` | มีจองทับช่วงแล้ว → จองซ้ำ | ช่วงไม่ว่าง / error | ✅ | `evidence/CoM/TC-U-19.png` |

---

## 4. User Dashboard — ติดตามคำขอ

*ผู้ใช้* — ดู/กรอง/ค้นหาจอง · ยกเลิก · รีวิว · โปรไฟล์

รายละเอียดเต็ม: [`test-cases/04-user-dashboard.md`](./test-cases/04-user-dashboard.md)

### รายการจอง

| TC# | ชื่อเคส | หน้า | ขั้นตอน | คาดหวัง | ผล | หลักฐาน |
|-----|---------|------|---------|---------|----|---------|
| TC-UDASH-01 | ดูรายการจองของตัวเอง | `/dashboard` | เข้า `/dashboard` | เห็นจอง + badge สถานะ | ✅ | `evidence/CCC/TC-U-20.png` |
| TC-UDASH-02 | กรองตามสถานะ | `/dashboard` | เลือก filter สถานะ | เหลือเฉพาะสถานะนั้น | ✅ | `evidence/CCC/TC-U-21.png` |
| TC-UDASH-03 | ค้นหาเลขที่จอง | `/dashboard` | พิมพ์เลข booking | เจอรายการตรงเลข | ✅ | `evidence/CCC/TC-U-22.png` |
| TC-UDASH-04 | ยกเลิกคำขอ (pending) | `/dashboard` | ยกเลิก → ยืนยัน | สถานะยกเลิกแล้ว | ✅ | `evidence/CCC/TC-U-25.png` |
| TC-UDASH-05 | ส่งรีวิวความพึงพอใจ | `/dashboard` | ให้ดาว + คอมเมนต์ → ส่ง | บันทึกรีวิวสำเร็จ | ✅ | `evidence/CCC/TC-U-26.png` |

### โปรไฟล์

| TC# | ชื่อเคส | หน้า | ขั้นตอน | คาดหวัง | ผล | หลักฐาน |
|-----|---------|------|---------|---------|----|---------|
| TC-UDASH-06 | ดูข้อมูลส่วนตัว | `/dashboard` โปรไฟล์ | เปิดแท็บโปรไฟล์ | ชื่อ อีเมล Role เบอร์ | ✅ | `evidence/CCC/TC-U-27.png` |
| TC-UDASH-07 | แก้ไขเบอร์โทร | `/dashboard` โปรไฟล์ | แก้เบอร์ → บันทึก | ค่าคงหลังรีโหลด | ✅ | `evidence/CCC/TC-U-28.png` |

---

## 5. Payment — ชำระเงิน

*ผู้ใช้* — Stripe checkout + Transaction ID · Mock Sandbox

รายละเอียดเต็ม: [`test-cases/05-payment.md`](./test-cases/05-payment.md)

### Stripe

| TC# | ชื่อเคส | หน้า | ขั้นตอน | คาดหวัง | ผล | หลักฐาน |
|-----|---------|------|---------|---------|----|---------|
| TC-PAY-01 | ชำระผ่าน Stripe checkout | `/dashboard` | `PAYMENT_PROVIDER=stripe` → ชำระ → checkout → callback | สถานะชำระแล้ว (`approved_paid`) | ✅ | `evidence/CoM/TC-P-R4-01.png` |
| TC-PAY-02 | อ่าน Transaction ID หลัง callback | `/dashboard` | ต่อจาก TC-PAY-01 | มี Tx ID + สถานะจ่ายแล้ว | ✅ | `evidence/CoM/TC-P-R4-02.png` |

### Mock (UAT ไม่ตัดบัตร)

| TC# | ชื่อเคส | หน้า | ขั้นตอน | คาดหวัง | ผล | หลักฐาน |
|-----|---------|------|---------|---------|----|---------|
| TC-PAY-03 | จำลองชำระ Mock Sandbox | `/dashboard` | `PAYMENT_PROVIDER=mock_sandbox` → จำลองชำระ | อัปเดตสถานะโดยไม่โอนจริง | ✅ | `evidence/Parttime/TC-U-24b.png` |

---

## 6. Admin Dashboard

*แอดมิน* — สถิติและเมนูแอดมิน

รายละเอียดเต็ม: [`test-cases/06-admin-dashboard.md`](./test-cases/06-admin-dashboard.md)

### ภาพรวม

| TC# | ชื่อเคส | หน้า | ขั้นตอน | คาดหวัง | ผล | หลักฐาน |
|-----|---------|------|---------|---------|----|---------|
| TC-ADM-DASH-01 | Dashboard สถิติ | `/admin/dashboard` | Login admin → เปิด dashboard | กราฟ/สถิติจอง | ✅ | `evidence/JJ/TC-A-01.png` |
| TC-ADM-DASH-02 | Sidebar ครบ | `/admin/*` | ตรวจเมนูด้านข้าง | แท็บหลักครบ | ✅ | `evidence/JJ/TC-A-02.png` |

---

## 7. Admin Bookings — พิจารณาคำขอ

*แอดมิน* — รายการ → กรอง → พรีวิว → อนุมัติ/เรท → ปฏิเสธ → เอกสาร

รายละเอียดเต็ม: [`test-cases/07-admin-bookings.md`](./test-cases/07-admin-bookings.md)

### รายการและกรอง

| TC# | ชื่อเคส | หน้า | ขั้นตอน | คาดหวัง | ผล | หลักฐาน |
|-----|---------|------|---------|---------|----|---------|
| TC-ADM-BOOK-01 | ดูรายการคำขอจอง | Admin คำขอจอง | เปิดแท็บคำขอจอง | ตารางเลขที่ ผู้จอง ห้อง วัน สถานะ เอกสาร | ✅ | `evidence/Parttime/TC-A-03.png` |
| TC-ADM-BOOK-02 | กรองตามสถานะ | Admin คำขอจอง | filter รออนุมัติ | เฉพาะ pending | ✅ | `evidence/Parttime/TC-A-04.png` |

### อนุมัติ / เรท / พรีวิว

| TC# | ชื่อเคส | หน้า | ขั้นตอน | คาดหวัง | ผล | หลักฐาน |
|-----|---------|------|---------|---------|----|---------|
| TC-ADM-BOOK-03 | Preview เอกสารก่อนอนุมัติ | Admin confirm | เปิด confirm → ดู preview | เห็น PDF/รูป | ✅ | `evidence/Parttime/TC-A-R4-02.png` |
| TC-ADM-BOOK-04 | อนุมัติคำขอ (แนบใบ+confirm) | Admin คำขอจอง | แนบใบอนุมัติ → อนุมัติ → ยืนยัน | สถานะรอชำระเงิน | ✅ | `evidence/CoM/TC-A-05.png` |
| TC-ADM-BOOK-05 | เลือกเรทตอนอนุมัติ | Admin confirm | อนุมัติ → เลือกเรท → ยืนยัน | เรทและราคาตรงที่เลือก | ✅ | `evidence/CoM/TC-A-R4-01.png` |
| TC-ADM-BOOK-06 | Log เปลี่ยนเรท | Admin กิจกรรม | อนุมัติพร้อมเปลี่ยนเรท → ดู log | มีเรท/ราคาเก่า→ใหม่ | ✅ | `evidence/CoM/TC-A-R4-03.png` |

### ปฏิเสธและเอกสาร

| TC# | ชื่อเคส | หน้า | ขั้นตอน | คาดหวัง | ผล | หลักฐาน |
|-----|---------|------|---------|---------|----|---------|
| TC-ADM-BOOK-07 | ปฏิเสธคำขอจอง | Admin คำขอจอง | ปฏิเสธ → ใส่เหตุผล → ยืนยัน | disapproved · ผู้ใช้เห็นเหตุผล | ✅ | `evidence/Parttime/TC-A-06-admin.png` + `TC-A-06-user.png` |
| TC-ADM-BOOK-08 | ดาวน์โหลด Memo | Admin คำขอจอง | คลิกลิงก์เอกสาร | เปิด/ดาวน์โหลด PDF ได้ | ✅ | `evidence/Parttime/TC-A-07.png` |
| TC-ADM-BOOK-09 | ส่งออก ZIP | Admin คำขอจอง | ติ๊กหลายรายการ → ดาวน์โหลด ZIP | ZIP แยกตาม booking_no | ✅ | `evidence/Parttime/TC-A-08.png` |

---

## 8. Admin Rooms / Add-ons

*แอดมิน* — จัดการห้อง · Import Excel · ราคา Add-on

รายละเอียดเต็ม: [`test-cases/08-admin-rooms-addons.md`](./test-cases/08-admin-rooms-addons.md)

### ห้อง

| TC# | ชื่อเคส | หน้า | ขั้นตอน | คาดหวัง | ผล | หลักฐาน |
|-----|---------|------|---------|---------|----|---------|
| TC-ADM-ROOM-01 | ดูรายการห้อง | Admin ห้อง | เปิดแท็บจัดการห้อง | ตาราง + active/inactive | ✅ | `evidence/JJ/TC-A-11.png` |
| TC-ADM-ROOM-02 | เปิด/ปิดห้อง | Admin ห้อง | Toggle → ตรวจ `/rooms` | ห้องปิดไม่โชว์ฝั่งผู้ใช้ | ✅ | `evidence/Parttime/TC-A-12-admin.png` + `TC-A-12-user.png` |

### Import Excel

| TC# | ชื่อเคส | หน้า | ขั้นตอน | คาดหวัง | ผล | หลักฐาน |
|-----|---------|------|---------|---------|----|---------|
| TC-ADM-ROOM-03 | Import เทมเพลตถูกต้อง | Admin ห้อง | ใช้ `room-pricing-rates.xlsx` → Import | สำเร็จ + นับรายการ | ✅ | `evidence/CoM/TC-A-23.png` |
| TC-ADM-ROOM-04 | Import ไฟล์ผิดรูปแบบ | Admin ห้อง | อัปโหลดไฟล์ว่าง/คอลัมน์ผิด | error ไม่พบข้อมูลห้อง | ✅ | `evidence/CoM/TC-A-24.png` |
| TC-ADM-ROOM-05 | จำนวนห้องสมเหตุสมผล | Admin ห้อง | Import → นับแถว | ไม่เป็น 0 / ใกล้เคียงไฟล์ | ✅ | `evidence/CoM/TC-A-25.png` |
| TC-ADM-ROOM-06 | ราคาครึ่ง/เต็มวันถูกต้อง | Admin ห้อง | เทียบราคากับ Excel | half/full 3 เรทตรง | ✅ | `evidence/CoM/TC-A-26.png` |

### Add-on

| TC# | ชื่อเคส | หน้า | ขั้นตอน | คาดหวัง | ผล | หลักฐาน |
|-----|---------|------|---------|---------|----|---------|
| TC-ADM-ADDON-01 | แก้ราคา Add-on | Admin อุปกรณ์เสริม | แก้ราคา → บันทึก → เปิดหน้าจอง | ราคาตาม DB | ✅ | `evidence/CoM/TC-A-27.png` |

---

## 9. Admin Content — Banner / Promo / ประกาศ

*แอดมิน* — แบนเนอร์หน้าแรก · ประกาศ · รหัสส่วนลด

รายละเอียดเต็ม: [`test-cases/09-admin-content.md`](./test-cases/09-admin-content.md)

### Banner / Broadcast

| TC# | ชื่อเคส | หน้า | ขั้นตอน | คาดหวัง | ผล | หลักฐาน |
|-----|---------|------|---------|---------|----|---------|
| TC-ADM-BAN-01 | ดูรายการแบนเนอร์ | Admin แบนเนอร์ | เปิดแท็บบันเนอร์ | รายการ + preview | ✅ | `evidence/JJ/TC-A-13.png` |
| TC-ADM-BAN-02 | เพิ่มแบนเนอร์ | Admin แบนเนอร์ | กรอก + อัปโหลด → บันทึก | โชว์ใน admin และ `/home` | ✅ | `evidence/JJ/TC-A-14.png` |
| TC-ADM-BAN-03 | เปิด/ปิดแบนเนอร์ | Admin แบนเนอร์ | Toggle | ที่ปิดไม่โชว์ `/home` | ✅ | `evidence/JJ/TC-A-15(admin).png` |
| TC-ADM-BAN-04 | ลบแบนเนอร์ | Admin แบนเนอร์ | ลบ → ยืนยัน | หายจาก admin และ `/home` | ✅ | `evidence/JJ/TC-A-15b(admin).png` |
| TC-ADM-BAN-05 | ส่งประกาศ Broadcast | Admin | ส่งประกาศ | ผู้ใช้เห็นในกระดิ่ง Navbar | ✅ | `evidence/JJ/TC-A-15c.png` |

### Promo codes

| TC# | ชื่อเคส | หน้า | ขั้นตอน | คาดหวัง | ผล | หลักฐาน |
|-----|---------|------|---------|---------|----|---------|
| TC-ADM-PROMO-01 | ดูรายการ Promo | Admin โปรโม | เปิดแท็บรหัสส่วนลด | เห็นรหัส + สถิติ | ✅ | `evidence/JJ/TC-A-16.png` |
| TC-ADM-PROMO-02 | สร้าง Promo ใหม่ | Admin โปรโม | กรอกฟอร์ม → สร้าง | ใช้ได้ตอนจอง | ✅ | `evidence/JJ/TC-A-17.png` |
| TC-ADM-PROMO-03 | เปิด/ปิด Promo | Admin โปรโม | Toggle | รหัสที่ปิดใช้ไม่ได้ | ✅ | `evidence/JJ/TC-A-18.png` |
| TC-ADM-PROMO-04 | ไม่มีปุ่มลบ Promo (เหลือ toggle) | Admin โปรโม | ตรวจ UI · ลอง DELETE API | มีเปิด/ปิด ไม่มีลบ · DELETE → 403 | ✅ | `evidence/JJ/TC-A-28.png` |

---

## 10. Admin Users / Logs

*แอดมิน* — ผู้ใช้ · Promote Admin · บันทึกกิจกรรม

รายละเอียดเต็ม: [`test-cases/10-admin-users-logs.md`](./test-cases/10-admin-users-logs.md)

### Users

| TC# | ชื่อเคส | หน้า | ขั้นตอน | คาดหวัง | ผล | หลักฐาน |
|-----|---------|------|---------|---------|----|---------|
| TC-ADM-USER-01 | ดูรายการผู้ใช้ | Admin Users | เปิดแท็บผู้ใช้ | ชื่อ อีเมล Role สถิติ | ✅ | `evidence/JJ/TC-A-19.png` |
| TC-ADM-USER-02 | ค้นหาผู้ใช้ | Admin Users | พิมพ์ชื่อ/อีเมล | กรองตรง | ✅ | `evidence/JJ/TC-A-20.png` |
| TC-ADM-USER-03 | Promote เป็น admin | Admin Users | ตั้ง Role=admin | ได้สิทธิ์ admin หลัง login | ✅ | `evidence/Parttime/TC-U-02b.png` |
| TC-ADM-USER-04 | เปลี่ยน Role / Demote | Admin Users | ตั้ง/ถอด Admin | Role อัปเดตสำเร็จ | ✅ | `evidence/Parttime/TC-A-21.png` |
| TC-ADM-USER-05 | ไม่มีปุ่มตั้ง Co-op | Admin Users | ดูปุ่มจัดการ Role | ไม่มีปุ่มตั้ง Co-op | ✅ | `evidence/JJ/TC-A-R4-04.png` |

### Activity log

| TC# | ชื่อเคส | หน้า | ขั้นตอน | คาดหวัง | ผล | หลักฐาน |
|-----|---------|------|---------|---------|----|---------|
| TC-ADM-LOG-01 | ดูบันทึกกิจกรรม | Admin Logs | เปิดแท็บบันทึกกิจกรรม | เห็นการกระทำ รายละเอียด เวลา | ✅ | `evidence/JJ/TC-A-22.png` |

---

## 11. i18n — ภาษาไทย / อังกฤษ

*ข้ามระบบ* — สลับภาษาทั้ง Navbar, Login, Modal, ชื่อห้อง, สถานะ, Footer

รายละเอียดเต็ม: [`test-cases/11-i18n.md`](./test-cases/11-i18n.md)

### สลับภาษา

| TC# | ชื่อเคส | หน้า | ขั้นตอน | คาดหวัง | ผล | หลักฐาน |
|-----|---------|------|---------|---------|----|---------|
| TC-I18N-01 | TH → EN | Navbar | กดเปลี่ยนภาษา | ข้อความเป็นอังกฤษ | ✅ | `evidence/CCC/TC-I-01.png` |
| TC-I18N-02 | EN → TH | Navbar | สลับกลับ | ข้อความเป็นไทย | ✅ | `evidence/CCC/TC-I-02.png` |
| TC-I18N-03 | หน้า Login สลับภาษา | Login | สลับภาษาบน Login | หัวข้อ/ปุ่มเปลี่ยนถูก | ✅ | `evidence/CCC/TC-I-03.png` |
| TC-I18N-04 | Modal สลับภาษา | Modal | เปิด Modal → สลับภาษา | ข้อความใน Modal ถูก | ✅ | `evidence/CCC/TC-I-04.png` |
| TC-I18N-05 | ชื่อห้องแปลอัตโนมัติ | `/rooms` | สลับ EN → ดูชื่อห้อง | ชื่อตาม translator | ✅ | `evidence/CCC/TC-I-05.png` |
| TC-I18N-06 | สถานะจองแปลอัตโนมัติ | `/dashboard` | สลับ EN → ดูสถานะ | สถานะเป็น EN | ✅ | `evidence/CCC/TC-I-06.png` |
| TC-I18N-07 | Footer สลับภาษา | Footer | สลับภาษา | Footer เปลี่ยนภาษา | ✅ | `evidence/CCC/TC-I-07.png` |

---

## 12. Edge / Email / Responsive

*ข้ามระบบ* — 404 · Mobile · อีเมลแจ้งเตือน

รายละเอียดเต็ม: [`test-cases/12-edge-email.md`](./test-cases/12-edge-email.md)

### Edge / UI

| TC# | ชื่อเคส | หน้า | ขั้นตอน | คาดหวัง | ผล | หลักฐาน |
|-----|---------|------|---------|---------|----|---------|
| TC-EDGE-01 | URL ไม่มีอยู่ → 404 | `/nonexistent` | เปิด URL มั่ว | หน้า 404 | ✅ | `evidence/CCC/TC-E-01.png` |
| TC-EDGE-02 | Responsive mobile | ทั้งระบบ | DevTools iPhone/Pixel | ไม่มีเลื่อนแนวนอนผิดปกติ | ✅ | `evidence/JJ/TC-E-06.png` |

### อีเมล

| TC# | ชื่อเคส | หน้า | ขั้นตอน | คาดหวัง | ผล | หลักฐาน |
|-----|---------|------|---------|---------|----|---------|
| TC-EMAIL-01 | อีเมลยืนยันหลังจอง | อีเมล / console | ส่งจอง → ดู inbox หรือ backend log | มีอีเมลยืนยัน (หรือ log ถ้ายังไม่มี SMTP) | ✅ | `evidence/Parttime/TC-E-07.png` |
| TC-EMAIL-02 | อีเมลแจ้งผลอนุมัติ/ปฏิเสธ | อีเมล / console | Admin อนุมัติหรือปฏิเสธ → ดู inbox | มีอีเมลแจ้งผล (หรือ log) | ✅ | `evidence/Parttime/TC-E-08.png` |

---

## สรุป

| รวม | **79** |
| ผ่าน | **79** |

ก่อนเทส (ถ้าต้องการข้อมูลตัวอย่าง): `cd backend && npm run seed:demo`

หลักฐาน: [`evidence/`](./evidence/)
