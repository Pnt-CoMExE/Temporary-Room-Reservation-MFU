# 5. Payment — ชำระเงิน

**เฟส:** ผู้ใช้  ·  **จำนวน:** 4 เคส

> Stripe checkout · Transaction ID · เมล+PDF ใบอนุญาตหลังจ่าย (ไม่มี mock) · PDF อังกฤษอ่านได้

ตารางรวมทุกโฟลว์: [`../TEST_CASE_TRACKER.md`](../TEST_CASE_TRACKER.md)  ·  แผนที่รหัสเก่า: [`_id-map.md`](./_id-map.md)  
**SMTP (ต้องมีสำหรับ TC-PAY-03):** [README §3.4](../../../README.md#34-smtp-email-notifications-recommended-for-uat) · Stripe: [`../../payment/STRIPE.md`](../../payment/STRIPE.md)

| ผล | ความหมาย |
|----|----------|
| ✅ | ผ่าน |
| ❌ | ไม่ผ่าน |
| ⬜ | ยังไม่ทดสอบ |

## Stripe

| TC# | ชื่อเคส | หน้า | ขั้นตอน | คาดหวัง | ผล | หลักฐาน | หมายเหตุ |
|-----|---------|------|---------|---------|----|---------|----------|
| TC-PAY-01 | ชำระผ่าน Stripe checkout | `/dashboard` | `PAYMENT_PROVIDER=stripe` → ชำระ → checkout → callback | สถานะชำระแล้ว (`approved_paid`) | ✅ | `evidence/CoM/TC-P-R4-01.png` |  |
| TC-PAY-02 | อ่าน Transaction ID หลัง callback | `/dashboard` | ต่อจาก TC-PAY-01 | มี Tx ID + สถานะจ่ายแล้ว | ✅ | `evidence/CoM/TC-P-R4-02.png` |  |
| TC-PAY-03 | เมล+PDF ใบอนุญาตหลัง Stripe จ่ายสำเร็จ | อีเมล | ชำระ Stripe สำเร็จ → เปิด inbox ผู้จอง | ได้เมลยืนยันชำระเงิน + แนบ PDF ใบอนุญาต/ใบเสร็จ | ✅ |  | SMTP จริง · ยืนยันครบ 2026-11-03 (`BK-20261103-3TSY`) |
| TC-PAY-04 | PDF ใบอนุญาตเป็นอังกฤษ อ่านได้ครบ | PDF ในเมล | ต่อจาก TC-PAY-03 → เปิดไฟล์แนบ | ดูเช็กลิสต์ด้านล่าง | ✅ | `evidence/CoM/TC-PAY-04.webp` | ตรวจผ่าน smoke PDF จาก `generateBookingPDFReceipt` (input ไทย) · 2026-11-03 |

### TC-PAY-04 — รายละเอียดตรวจ PDF

**เงื่อนไขก่อนเริ่ม:** จองห้องที่มีชื่อ/สถานที่ภาษาไทย (หรือมีรหัสห้อง เช่น `E2`) → แอดมินอนุมัติ → ชำระ Stripe test สำเร็จ → ได้เมลแนบ PDF

**เปิด PDF แล้วตรวจ:**

| # | จุดตรวจ | คาดหวัง |
|---|---------|---------|
| 1 | หัวเอกสาร | มี `SPACE PERMIT & OFFICIAL RECEIPT` / MFU |
| 2 | Booking Reference | ตรงรหัสจองในระบบ |
| 3 | Reservation Date | รูปแบบอังกฤษอ่านง่าย เช่น `Wed, 4 Nov 2026` — **ห้าม** เป็น `Wed Nov 04 2026 00:00:00 GMT…` |
| 4 | Time Slot | `Morning Half Day (08:00 - 12:00)` / `Afternoon Half Day (13:00 - 17:00)` / `Full Day (08:00 - 17:00)` ตามที่จอง — **ห้าม** เป็น `HALF_AFTERNOON` / `FULL` ดิบ |
| 5 | Reserved Space / Location | อังกฤษหรือรหัสห้อง/อาคาร (เช่น `A`, `E2`, `C3-101`) — **ห้าม** อักษรกล่อง □ หรือ mojibake (`â¾…`) |
| 6 | Applicant Name | อังกฤษ หรือ local-part อีเมลถ้าชื่อเป็นไทยล้วน — **ห้าม** ตัวเพี้ยน |
| 7 | Payment Summary | `Room Rental Fee (…)` อ่านได้ · ยอดห้อง / add-on / total ตรง Dashboard |
| 8 | Status | `PAYMENT VERIFIED & SPACE PERMIT GRANTED` |

**หลักฐานแนะนำ:** screenshot หน้า Reservation details + Payment summary ของ PDF → เก็บเป็น `evidence/CoM/TC-PAY-04.png` (หรือโฟลเดอร์ทีมที่ใช้อยู่)

---

← [ดัชนีโฟลว์](./README.md)
