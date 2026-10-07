# Test Case Tracker (รวม UAT + Recording 4)

**อัปเดต:** 2026-10-05  
**เอกสารหลักทดสอบของโปรเจกต์นี้** — รวมสถานการณ์ UAT เดิม + เคส Recording 4 + Owner + หลักฐาน  
**อ้างอิง:** [`RECORDING4_ACTION_PLAN.md`](../meetings/RECORDING4_ACTION_PLAN.md) · [`STRIPE.md`](../payment/STRIPE.md) · [`QA_AUTOMATION_GUIDE.md`](./QA_AUTOMATION_GUIDE.md)

---

## วิธีใช้

1. เปิดไฟล์ของตัวเองใน [`test-cases/`](./test-cases/) (หรือหาแถว **Owner** ในตารางรวมด้านล่าง)
2. ทำตามคอลัมน์ **Scenario**
3. เทียบ **Expected**
4. Screenshot → `docs/evidence/<TC#>.png`
5. เปลี่ยน **ผล** เป็น ✅ / ❌ / ⏭️

| สัญลักษณ์ | ความหมาย |
|-----------|----------|
| ⬜ | ยังไม่ทดสอบ |
| ✅ | ผ่าน |
| ❌ | ไม่ผ่าน |
| ⏭️ | ข้าม (ระบุเหตุผลในหมายเหตุ) |

---

## สภาพแวดล้อมทดสอบ

### Development (`npm run dev`)

| รายการ | รายละเอียด |
|--------|-----------|
| Frontend | `http://localhost:5173` |
| Backend | `http://localhost:3000` |
| DB | PostgreSQL (`backend/.env`) |
| Payment UAT | `PAYMENT_PROVIDER=mock_sandbox` |
| Stripe demo | `PAYMENT_PROVIDER=stripe` |
| Admin bootstrap | `DEV_ADMIN_EMAILS=...` |

### Docker Local UAT

| รายการ | รายละเอียด |
|--------|-----------|
| Frontend | `http://localhost:8080` |
| API | `http://localhost:8080/api` |
| คู่มือ | [`UAT_DOCKER_CHECKLIST.md`](./UAT_DOCKER_CHECKLIST.md) |

**บัญชี seed (อ้างอิง):** `admin.demo@mfu.ac.th` · `wichai.staff@mfu.ac.th` · `piya.student@lamduan.mfu.ac.th` · `john.external@company.com`  
Login จริงใช้ Google OAuth — `@mfu.ac.th` → internal, อื่นๆ → external, admin = promote / `DEV_ADMIN_EMAILS`  
**โปรโม:** `MFUWELCOME` / `PROMO2026` / `STUDENT10`

**บัญชีทีม (UAT จริง — เพิ่มทีละคน):**  
| คน | อีเมล | Role UAT |
|----|--------|----------|
| คอม (bootstrap) | `comza962@gmail.com` | admin (`DEV_ADMIN_EMAILS`) |
| พาร์ท | `6631501081@lamduan.mfu.ac.th` | admin (`DEV_ADMIN_EMAILS`) |
| เจ | `6631501164@lamduan.mfu.ac.th` | admin (`DEV_ADMIN_EMAILS`) |
| ซี | `6631501073@lamduan.mfu.ac.th` | internal (`DEV_INTERNAL_EMAILS`) |
| ซี | `prattanakorn22127@gmail.com` | external |
| ซี | `frewgametv@gmail.com` | external |

---

## รหัส TC ย่อมาจากอะไร

| ส่วน | ความหมาย |
|------|----------|
| **TC** | Test Case |
| **U** | User |
| **A** | Admin |
| **I** | i18n |
| **E** | Edge / error |
| **P** | Payment |
| **Z** | AuthZ |
| **R4** | เพิ่มจาก Recording 4 |
| คอลัมน์ **เดิม** | เลขเก่า เช่น `U-03` — ถ้า `— (R4)` คือสร้างใหม่ ไม่ต้องเปิดไฟล์อื่น |

ตัวอย่าง: **TC-U-03** = เคส User ลำดับ 03 (เดิม U-03) · **TC-P-R4-01** = Payment ชิ้นที่ 1 ของ Recording 4

---

## แบ่ง Owner

| Owner | รับผิดชอบหลัก | ไฟล์ของตัวเอง |
|-------|----------------|----------------|
| **คอม** | จองซับซ้อน, promo, อนุมัติ+เรท+log, Stripe, AuthZ | [`test-cases/kom.md`](./test-cases/kom.md) |
| **พาร์ท** | Admin จอง/เอกสาร/สลิป, PromptPay/Mock, promote admin | [`test-cases/part.md`](./test-cases/part.md) |
| **ซี** | Login, ห้อง, dashboard ผู้ใช้, i18n | [`test-cases/cee.md`](./test-cases/cee.md) |
| **เจ** | เปิดดู Admin หลายแท็บ, logout, Featured, ไม่มีปุ่ม Co-op | [`test-cases/jay.md`](./test-cases/jay.md) |

ดัชนี: [`test-cases/README.md`](./test-cases/README.md)

> แต่ละคนเปิดไฟล์ของตัวเองได้เลย ไม่ต้องเลื่อนหา Owner ในตารางรวม

---

## ตาราง Test Cases ทั้งหมด

| TC# | เดิม | Owner | ชื่อเคส | หน้า | Scenario | Expected | ผล | หลักฐาน | หมายเหตุ |
|-----|------|-------|---------|------|----------|----------|----|---------|----------|
| TC-U-01 | U-01 | ซี | เข้าสู่ระบบ Google OAuth (@mfu.ac.th) | `/` | 1. เปิดหน้าหลัก 2. Sign in with Google 3. เลือก @mfu.ac.th | Login สำเร็จ, Role=internal, ไป /home | ⬜ | |  |
| TC-U-02 | U-02 | ซี | เข้าสู่ระบบ Google OAuth (@lamduan.mfu.ac.th) | `/` | 1. เปิดหน้าหลัก 2. Sign in with Google 3. เลือก @lamduan.mfu.ac.th | Login สำเร็จ, Role=external, ไป /home | ⬜ | |  |
| TC-U-02b | U-02b | พาร์ท | Admin promote ผู้ใช้เป็น admin | `Admin Users` | 1. Login Admin 2. Users 3. ตั้ง Role=admin | ผู้ใช้นั้น login แล้วได้ Role=admin | ⬜ | |  |
| TC-U-03 | U-03 | ซี | เข้าสู่ระบบ Google OAuth (โดเมนอื่น) | `/` | 1. เปิดหน้าหลัก 2. Sign in with Google 3. เลือก @gmail.com | Login สำเร็จ, Role=external, ไป /home | ⬜ | |  |
| TC-U-04 | U-04 | เจ | ออกจากระบบ | `Navbar` | 1. เมนู Navbar 2. ออกจากระบบ 3. ยืนยัน | Redirect Login, ลบ session/cookie | ⬜ | |  |
| TC-U-05 | U-05 | ซี | เข้าหน้าที่ต้อง login โดยไม่ login | `/home` | 1. เปิด /home โดยตรงโดยไม่ login | Redirect ไป Login | ⬜ | |  |
| TC-U-06 | U-06 | เจ | หน้าหลัก — Featured Rooms | `/home` | 1. Login 2. เข้า /home | Banner + Featured Rooms | ⬜ | |  |
| TC-U-07 | U-07 | ซี | หน้ารายการห้อง | `/rooms` | 1. เมนูห้องทั้งหมด 2. ดูรายการ | แสดงห้องพร้อมรูป+ราคา | ⬜ | |  |
| TC-U-08 | U-08 | ซี | กรองตามประเภทพื้นที่ | `/rooms` | 1. เปิด /rooms 2. เลือก Meeting Room | แสดงเฉพาะห้องประชุม | ⬜ | |  |
| TC-U-09 | U-09 | ซี | ค้นหาห้องภาษาไทย | `/rooms` | 1. พิมพ์ ห้องประชุม | แสดงห้องที่ชื่อตรง | ⬜ | |  |
| TC-U-10 | U-10 | ซี | ค้นหาห้องภาษาอังกฤษ | `/rooms` | 1. พิมพ์ Meeting Room | ผลเดียวกับค้นหาไทย | ⬜ | |  |
| TC-U-11 | U-11 | ซี | หน้ารายละเอียดห้อง | `/rooms/:id` | 1. คลิกการ์ดห้อง | รูป ความจุ สถานที่ ราคา 3-tier ปฏิทิน | ⬜ | |  |
| TC-U-12 | U-12 | คอม | ส่งคำขอจอง — กรอกครบ | `/booking/:id` | 1. กรอกฟอร์มครบ 2. แนบ PDF 3. ส่ง | สำเร็จ + redirect /dashboard + สถานะรออนุมัติ | ⬜ | |  |
| TC-U-13 | U-13 | ซี | เลือกวันที่และช่วงเวลา | `/booking/:id` | 1. เลือกวัน 2. เลือกเช้า/บ่าย/เต็มวัน | ราคาเปลี่ยนตามช่วง | ⬜ | |  |
| TC-U-14 | U-14 | ซี | เลือกอุปกรณ์เสริม | `/booking/:id` | 1. เลือก Add-on | ราคารวมอัปเดตถูกต้อง | ⬜ | |  |
| TC-U-15 | U-15 | คอม | ใช้รหัสส่วนลด | `/booking/:id` | 1. พิมพ์ MFUWELCOME 2. ตรวจสอบ | ลด 100 บาท + รวมลดลง | ⬜ | |  |
| TC-U-16 | U-16 | คอม | ใช้รหัสส่วนลดที่ไม่มี | `/booking/:id` | 1. พิมพ์ INVALID123 2. ตรวจสอบ | error รหัสไม่ถูกต้อง | ⬜ | |  |
| TC-U-17 | U-17 | ซี | ไม่แนบไฟล์ PDF | `/booking/:id` | 1. กรอกครบไม่แนบไฟล์ 2. ส่ง | error ขอแนบหนังสือบันทึกข้อความ | ⬜ | |  |
| TC-U-18 | U-18 | คอม | แนบไฟล์ที่ไม่ใช่ PDF | `/booking/:id` | 1. แนบ .txt 2. ส่ง | error เฉพาะ PDF | ⬜ | |  |
| TC-U-19 | U-19 | คอม | จองซ้ำ slot เดียวกัน | `/booking/:id` | 1. มีจองเต็มวันแล้ว 2. จองครึ่งวันเช้าวันเดียวกัน | error จองช่วงเวลานั้นไม่ได้ | ⬜ | |  |
| TC-U-20 | U-20 | ซี | ดูรายการจองของตัวเอง | `/dashboard` | 1. เข้า /dashboard | เห็นจองของตัวเอง + badge สถานะ | ⬜ | |  |
| TC-U-21 | U-21 | ซี | กรองรายการตามสถานะ | `/dashboard` | 1. filter สถานะ | แสดงเฉพาะสถานะนั้น | ⬜ | |  |
| TC-U-22 | U-22 | ซี | ค้นหาตาม booking number | `/dashboard` | 1. พิมพ์ BK-DEMO | แสดงรายการตรงเลข | ⬜ | |  |
| TC-U-23 | U-23 | พาร์ท | ดู QR Code PromptPay | `/dashboard` | 1. PAYMENT_PROVIDER=promptpay_manual 2. สแกนชำระเงิน | Modal QR + ยอด + อัปโหลดสลิป | ⬜ | |  |
| TC-U-24 | U-24 | พาร์ท | อัปโหลดสลิปการโอน | `/dashboard` | 1. ใน Modal แนบสลิป jpg 2. ส่ง | รอตรวจสอบการชำระเงิน | ⬜ | |  |
| TC-U-24b | U-24b | พาร์ท | จำลองชำระเงิน Mock Sandbox | `/dashboard` | 1. PAYMENT_PROVIDER=mock_sandbox 2. จำลองชำระ 3. ยืนยัน | pending_verification โดยไม่โอนจริง | ⬜ | |  |
| TC-U-25 | U-25 | ซี | ยกเลิกคำขอจอง | `/dashboard` | 1. ยกเลิกบนรายการ pending 2. ยืนยัน | สถานะยกเลิกแล้ว | ⬜ | |  |
| TC-U-26 | U-26 | ซี | ส่งรีวิวความพึงพอใจ | `/dashboard` | 1. รีวิว 2. ดาว+คอมเมนต์ 3. ส่ง | ส่งรีวิวสำเร็จ + เห็นดาว | ⬜ | |  |
| TC-U-27 | U-27 | ซี | ดูข้อมูลส่วนตัว | `/dashboard โปรไฟล์` | 1. แท็บโปรไฟล์ | ชื่อ อีเมล Role เบอร์ | ⬜ | |  |
| TC-U-28 | U-28 | ซี | แก้ไขเบอร์โทรศัพท์ | `/dashboard โปรไฟล์` | 1. แก้เบอร์ 2. บันทึก | บันทึกสำเร็จ | ⬜ | |  |
| TC-A-01 | A-01 | เจ | แสดง Dashboard สถิติ | `/admin/dashboard` | 1. Login admin 2. เปิด dashboard | กราฟ/สถิติจอง | ⬜ | |  |
| TC-A-02 | A-02 | เจ | แท็บ Sidebar ครบ | `/admin/*` | 1. ตรวจ Sidebar | มีแท็บหลักครบ | ⬜ | |  |
| TC-A-03 | A-03 | พาร์ท | ดูรายการคำขอจอง | `Admin คำขอจอง` | 1. เปิดแท็บคำขอจอง | ตารางเลขที่ ผู้จอง ห้อง วัน สถานะ เอกสาร | ⬜ | |  |
| TC-A-04 | A-04 | พาร์ท | กรองคำขอตามสถานะ | `Admin คำขอจอง` | 1. filter รออนุมัติ | เฉพาะ pending | ⬜ | |  |
| TC-A-05 | A-05 | คอม | อนุมัติคำขอจอง (แนบใบ+confirm) | `Admin คำขอจอง` | 1. แนบใบอนุมัติ 2. อนุมัติ 3. ยืนยัน confirm | สถานะรอชำระเงิน (approved_pending_payment) | ⬜ | |  |
| TC-A-06 | A-06 | พาร์ท | ปฏิเสธคำขอจอง | `Admin คำขอจอง` | 1. ปฏิเสธ 2. ใส่เหตุผล 3. ยืนยัน | disapproved + ผู้ใช้เห็นเหตุผล | ⬜ | |  |
| TC-A-07 | A-07 | พาร์ท | ดาวน์โหลดเอกสาร Memo | `Admin คำขอจอง` | 1. คลิกลิงก์เอกสารแนบ | เปิด/ดาวน์โหลด PDF ได้ | ⬜ | |  |
| TC-A-08 | A-08 | พาร์ท | ส่งออกเอกสาร ZIP | `Admin คำขอจอง` | 1. ติ๊กหลายรายการ 2. ดาวน์โหลด ZIP | ZIP แยกตาม booking_no | ⬜ | |  |
| TC-A-09 | A-09 | พาร์ท | ดูสลิปการชำระเงิน | `Admin คำขอจอง` | 1. เปิดรายการ pending_verification | เห็นรูปสลิป | ⬜ | |  |
| TC-A-10 | A-10 | พาร์ท | ยืนยันการชำระเงิน | `Admin คำขอจอง` | 1. กดยืนยันการชำระเงิน | verified / ชำระแล้ว | ⬜ | |  |
| TC-A-11 | A-11 | เจ | ดูรายการห้องทั้งหมด | `Admin ห้อง` | 1. แท็บจัดการห้อง | ตารางห้อง + active/inactive | ⬜ | |  |
| TC-A-12 | A-12 | พาร์ท | เปิด/ปิดการใช้งานห้อง | `Admin ห้อง` | 1. Toggle ห้อง 2. ดู /rooms | ห้องที่ปิดไม่โชว์ฝั่งผู้ใช้ | ⬜ | |  |
| TC-A-13 | A-13 | เจ | ดูรายการแบนเนอร์ | `Admin แบนเนอร์` | 1. แท็บบันเนอร์ | รายการ+preview | ⬜ | |  |
| TC-A-14 | A-14 | เจ | เพิ่มแบนเนอร์ใหม่ | `Admin แบนเนอร์` | 1. กรอก+อัปโหลด 2. บันทึก | โชว์ใน admin และ /home | ⬜ | |  |
| TC-A-15 | A-15 | เจ | เปิด/ปิดแบนเนอร์ | `Admin แบนเนอร์` | 1. Toggle | ที่ปิดไม่โชว์ /home | ⬜ | |  |
| TC-A-15b | A-15b | เจ | ลบแบนเนอร์ | `Admin แบนเนอร์` | 1. ลบ 2. ยืนยัน | หายจาก admin และ /home | ⬜ | |  |
| TC-A-15c | A-15c | เจ | ส่งประกาศ Broadcast | `Admin` | 1. ส่งประกาศ | ผู้ใช้เห็นในกระดิ่ง Navbar | ⬜ | |  |
| TC-A-16 | A-16 | เจ | ดูรายการ Promo Codes | `Admin โปรโม` | 1. แท็บรหัสส่วนลด | เห็นรหัส+สถิติ | ⬜ | |  |
| TC-A-17 | A-17 | เจ | สร้าง Promo Code ใหม่ | `Admin โปรโม` | 1. กรอกฟอร์ม 2. สร้าง | ใช้ได้ตอนจอง | ⬜ | |  |
| TC-A-18 | A-18 | เจ | เปิด/ปิด Promo Code | `Admin โปรโม` | 1. Toggle | รหัสที่ปิดใช้ไม่ได้ | ⬜ | |  |
| TC-A-19 | A-19 | เจ | ดูรายการผู้ใช้ | `Admin Users` | 1. แท็บผู้ใช้ | ตารางชื่อ อีเมล Role สถิติ | ⬜ | |  |
| TC-A-20 | A-20 | เจ | ค้นหาผู้ใช้ | `Admin Users` | 1. พิมพ์ชื่อ/อีเมล | กรองตรง | ⬜ | |  |
| TC-A-21 | A-21 | พาร์ท | เปลี่ยน Role / Promote Admin | `Admin Users` | 1. ตั้ง/ถอด Admin | Role อัปเดตสำเร็จ | ⬜ | |  |
| TC-A-22 | A-22 | เจ | ดูบันทึกกิจกรรม | `Admin Logs` | 1. แท็บบันทึกกิจกรรม | เห็น admin การกระทำ รายละเอียด เวลา | ⬜ | |  |
| TC-I-01 | I-01 | ซี | สลับภาษา TH → EN | `Navbar` | 1. คลิกเปลี่ยนภาษา | ข้อความเป็นอังกฤษ | ⬜ | |  |
| TC-I-02 | I-02 | ซี | สลับภาษา EN → TH | `Navbar` | 1. สลับกลับ | ข้อความเป็นไทย | ⬜ | |  |
| TC-I-03 | I-03 | ซี | หน้า Login สลับภาษา | `Login` | 1. สลับภาษาบน Login | ข้อความเปลี่ยนถูกต้อง | ⬜ | |  |
| TC-I-04 | I-04 | ซี | Modal Dialogs สลับภาษา | `Modal` | 1. เปิด Modal 2. สลับภาษา | ข้อความใน Modal ถูก | ⬜ | |  |
| TC-I-05 | I-05 | ซี | ชื่อห้องแปลอัตโนมัติ | `/rooms` | 1. สลับ EN 2. ดูชื่อห้อง | ชื่อแปลตาม translator | ⬜ | |  |
| TC-I-06 | I-06 | ซี | สถานะการจองแปลอัตโนมัติ | `/dashboard` | 1. สลับ EN 2. ดูสถานะ | สถานะเป็น EN | ⬜ | |  |
| TC-I-07 | I-07 | ซี | Footer สลับภาษา | `Footer` | 1. สลับภาษา | Footer เปลี่ยนภาษา | ⬜ | |  |
| TC-E-01 | E-01 | ซี | เปิด URL ที่ไม่มีอยู่ | `/nonexistent` | 1. เปิด URL มั่ว | หน้า 404 | ⬜ | |  |
| TC-E-02 | E-02 | คอม | Session หมดอายุ / ไม่ login | `API/หน้า protected` | 1. ลบ session 2. เรียกหน้าที่ต้อง auth | Redirect Login | ⬜ | |  |
| TC-E-03 | E-03 | คอม | Non-admin เข้า Admin | `/admin/dashboard` | 1. Login user ธรรมดา 2. เปิด /admin | กันเข้า / redirect | ⬜ | |  |
| TC-E-04 | E-04 | ซี | ส่งฟอร์มจองว่าง | `/booking/:id` | 1. กดส่งโดยไม่กรอก | validation error | ⬜ | |  |
| TC-E-05 | E-05 | คอม | อัปโหลดไฟล์เกิน 10MB | `/booking/:id` | 1. แนบ PDF ~15MB 2. ส่ง | error ไฟล์ใหญ่เกินไป | ⬜ | |  |
| TC-E-06 | E-06 | เจ | Responsive Mobile | `ทั้งระบบ` | 1. DevTools iPhone/Pixel | ไม่มีเลื่อนแนวนอนผิดปกติ | ⬜ | |  |
| TC-E-07 | E-07 | พาร์ท | อีเมลยืนยันหลังจอง | `อีเมล` | 1. ส่งจอง 2. ดู inbox | ได้อีเมลยืนยัน (หรือ console ถ้ายังไม่มี SMTP) | ⬜ | |  |
| TC-E-08 | E-08 | พาร์ท | อีเมลแจ้งผลอนุมัติ | `อีเมล` | 1. Admin อนุมัติ 2. ดู inbox ผู้ใช้ | ได้อีเมลแจ้งผล | ⬜ | |  |
| TC-P-R4-01 | — (R4) | คอม | Stripe demo checkout | `/dashboard` | 1. PAYMENT_PROVIDER=stripe 2. กดชำระ Stripe 3. demo checkout 4. Callback | สถานะ approved_paid | ⬜ | | ดู ../payment/STRIPE.md |
| TC-P-R4-02 | — (R4) | คอม | Stripe callback / Transaction ID | `/dashboard?stripe=success` | 1. ต่อจาก P-R4-01 2. อ่าน Tx ID 3. ตรวจ payments.transaction_id | มี Transaction ID + จ่ายแล้ว | ⬜ | |  |
| TC-A-R4-01 | — (R4) | คอม | เลือกเรทตอนอนุมัติ | `Admin confirm` | 1. อนุมัติ 2. เลือกเรท 3. ยืนยัน | เรท+ราคาตรงที่เลือก | ⬜ | |  |
| TC-A-R4-02 | — (R4) | พาร์ท | Preview เอกสารก่อนอนุมัติ | `Admin confirm` | 1. เปิด confirm 2. ดู Preview | เห็น preview PDF/รูป | ⬜ | |  |
| TC-A-R4-03 | — (R4) | คอม | Log เปลี่ยนเรท | `Admin ประวัติจอง` | 1. อนุมัติพร้อมเปลี่ยนเรท 2. ดูประวัติ | มี log เรท/ราคาเก่า→ใหม่ | ⬜ | |  |
| TC-A-R4-04 | — (R4) | เจ | ไม่มีปุ่มตั้ง Co-op ที่ Users | `Admin Users` | 1. เปิด Users 2. ดูปุ่มจัดการ | ไม่มีปุ่มตั้งเป็น Co-op | ⬜ | |  |
| TC-Z-01 | — (≈E-03) | คอม | AuthZ กันหน้า Admin | `/admin/dashboard` | 1. Login non-admin 2. เปิด /admin | กันเข้าได้ | ⬜ | |  |
| TC-Z-02 | — (Unit) | คอม | รัน npm test AuthZ | `backend` | 1. cd backend 2. npm test | เทส AuthZ/เขียว | ⬜ | |  |

---

## Checklist ส่งงาน (อย่างน้อย)

| คน | TC ที่ควรส่งก่อน |
|----|-------------------|
| คอม | TC-P-R4-01, TC-P-R4-02, TC-A-R4-01, TC-A-R4-03, TC-U-12, TC-Z-01 |
| พาร์ท | TC-A-R4-02, TC-A-06, TC-A-08, TC-U-24b |
| ซี | TC-U-01, TC-U-07, TC-U-17, TC-U-20, TC-U-25 |
| เจ | TC-A-01, TC-A-02, TC-A-R4-04, TC-U-04 |

---

## สรุปจำนวน

| | |
|--|--|
| **รวมในตารางนี้** | **77** เคส |

ก่อนเทส: `cd backend && npm run seed:demo` เมื่อต้องการข้อมูลตัวอย่างใหม่  
หลักฐาน: [`evidence/`](./evidence/)
