# Test Cases — เจ

**Owner:** เจ  
**โฟกัส:** เปิดดู Admin หลายแท็บ, logout, Featured, ไม่มีปุ่ม Co-op  
**จำนวน:** 18 เคส  
**ส่งก่อน:** TC-A-01, TC-A-02, TC-A-R4-04, TC-U-04

**เอกสารหลักรวมทุกคน:** [`../TEST_CASE_TRACKER.md`](../TEST_CASE_TRACKER.md)  
**หลักฐาน:** ใส่รูปใน [`../evidence/`](../evidence/) ชื่อไฟล์ตรง `TC-...`

### วิธีใช้
1. รันตาม **Scenario**
2. เทียบ **Expected**
3. Screenshot → `docs/evidence/<TC#>.png`
4. แก้ **ผล** เป็น ✅ / ❌ / ⏭️ ในไฟล์นี้ **และ** sync ในตารางรวมถ้าสะดวก

| สัญลักษณ์ | ความหมาย |
|-----------|----------|
| ⬜ | ยังไม่ทดสอบ |
| ✅ | ผ่าน |
| ❌ | ไม่ผ่าน |
| ⏭️ | ข้าม |

### สภาพแวดล้อมสั้น ๆ
- Dev: `http://localhost:5173` + backend `:3000`
- Docker: `http://localhost:8080`
- Payment UAT: `PAYMENT_PROVIDER=mock_sandbox` · Stripe: `PAYMENT_PROVIDER=stripe`

### บัญชี Admin (UAT)
- ของเจ: `6631501164@lamduan.mfu.ac.th` → **admin** (`DEV_ADMIN_EMAILS`)
- เคส Admin ใช้ **admin** · U-04 / U-06 / E-06 ใช้ **user** ได้

---

## ตารางของ เจ

| TC# | เดิม | ชื่อเคส | หน้า | Scenario | Expected | ผล | หลักฐาน | หมายเหตุ |
|-----|------|---------|------|----------|----------|----|---------|----------|
| TC-U-04 | U-04 | ออกจากระบบ | `Navbar` | 1. เมนู Navbar 2. ออกจากระบบ 3. ยืนยัน | Redirect Login, ลบ session/cookie | ✅ | `evidence/JJ/TC-U-04.png` |  |
| TC-U-06 | U-06 | หน้าหลัก — Featured Rooms | `/home` | 1. Login 2. เข้า /home | Banner + Featured Rooms | ✅ | `evidence/JJ/TC-U-06.png` |  |
| TC-A-01 | A-01 | แสดง Dashboard สถิติ | `/admin/dashboard` | 1. Login admin 2. เปิด dashboard | กราฟ/สถิติจอง | ✅ | `evidence/JJ/TC-A-01.png` |  |
| TC-A-02 | A-02 | แท็บ Sidebar ครบ | `/admin/*` | 1. ตรวจ Sidebar | มีแท็บหลักครบ | ✅ | `evidence/JJ/TC-A-02.png` |  |
| TC-A-11 | A-11 | ดูรายการห้องทั้งหมด | `Admin ห้อง` | 1. แท็บจัดการห้อง | ตารางห้อง + active/inactive | ✅ | `evidence/JJ/TC-A-11.png` |  |
| TC-A-13 | A-13 | ดูรายการแบนเนอร์ | `Admin แบนเนอร์` | 1. แท็บบันเนอร์ | รายการ+preview | ✅ | `evidence/JJ/TC-A-13.png` |  |
| TC-A-14 | A-14 | เพิ่มแบนเนอร์ใหม่ | `Admin แบนเนอร์` | 1. กรอก+อัปโหลด 2. บันทึก | โชว์ใน admin และ /home | ✅ | `evidence/JJ/TC-A-14.png` |  |
| TC-A-15 | A-15 | เปิด/ปิดแบนเนอร์ | `Admin แบนเนอร์` | 1. Toggle | ที่ปิดไม่โชว์ /home | ✅ | `evidence/JJ/TC-A-15.png` |  |
| TC-A-15b | A-15b | ลบแบนเนอร์ | `Admin แบนเนอร์` | 1. ลบ 2. ยืนยัน | หายจาก admin และ /home | ✅ | `evidence/JJ/TC-A-15b.png` |  |
| TC-A-15c | A-15c | ส่งประกาศ Broadcast | `Admin` | 1. ส่งประกาศ | ผู้ใช้เห็นในกระดิ่ง Navbar | ✅ | `evidence/JJ/TC-A-15c.png` |  |
| TC-A-16 | A-16 | ดูรายการ Promo Codes | `Admin โปรโม` | 1. แท็บรหัสส่วนลด | เห็นรหัส+สถิติ | ✅ | `evidence/JJ/TC-A-16.png` |  |
| TC-A-17 | A-17 | สร้าง Promo Code ใหม่ | `Admin โปรโม` | 1. กรอกฟอร์ม 2. สร้าง | ใช้ได้ตอนจอง | ✅ | `evidence/JJ/TC-A-17.png` |  |
| TC-A-18 | A-18 | เปิด/ปิด Promo Code | `Admin โปรโม` | 1. Toggle | รหัสที่ปิดใช้ไม่ได้ | ✅ | `evidence/JJ/TC-A-18.png` |  |
| TC-A-19 | A-19 | ดูรายการผู้ใช้ | `Admin Users` | 1. แท็บผู้ใช้ | ตารางชื่อ อีเมล Role สถิติ | ✅ | `evidence/JJ/TC-A-19.png` |  |
| TC-A-20 | A-20 | ค้นหาผู้ใช้ | `Admin Users` | 1. พิมพ์ชื่อ/อีเมล | กรองตรง | ✅ | `evidence/JJ/TC-A-20.png` |  |
| TC-A-22 | A-22 | ดูบันทึกกิจกรรม | `Admin Logs` | 1. แท็บบันทึกกิจกรรม | เห็น admin การกระทำ รายละเอียด เวลา | ✅ | `evidence/JJ/TC-A-22.png` |  |
| TC-E-06 | E-06 | Responsive Mobile | `ทั้งระบบ` | 1. DevTools iPhone/Pixel | ไม่มีเลื่อนแนวนอนผิดปกติ | ✅ | `evidence/JJ/TC-E-06.png` |  |
| TC-A-R4-04 | — (R4) | ไม่มีปุ่มตั้ง Co-op ที่ Users | `Admin Users` | 1. เปิด Users 2. ดูปุ่มจัดการ | ไม่มีปุ่มตั้งเป็น Co-op | ✅ | `evidence/JJ/TC-A-R4-04.png` |  |

---

## Checklist ส่งงาน

- [x] เคส priority: TC-A-01, TC-A-02, TC-A-R4-04, TC-U-04
- [x] เคสอื่นของเจ ในตารางด้านบน
- [x] รูปใน `docs/testing/evidence/JJ/`

ไฟล์อื่น: [คอม](./kom.md) · [ซี](./cee.md) · [พาร์ท](./part.md) · [เจ](./jay.md)
