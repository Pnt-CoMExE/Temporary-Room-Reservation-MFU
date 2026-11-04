# Evidence — ซี (CCC)

อัปเดต: 2026-11-04 · เคสใน `docs/testing/test-cases/cee.md`  
สภาพแวดล้อม: Dev `http://localhost:5173` + backend `:3000`  
บัญชีที่ใช้รอบนี้: `6631501073@lamduan.mfu.ac.th` · PRATHANAKORN PITI · โปรไฟล์ขึ้น **บุคลากรภายใน (Internal)** ผ่าน `DEV_INTERNAL_EMAILS`  
บัญชี U-02: บัญชีเดียวกัน ถอดออกจาก list ชั่วคราวแล้วแคป **บุคคลทั่วไป (External)**  
บัญชี U-03: `frewgametv@gmail.com` · 05 Prattanakorn Piti · **บุคคลทั่วไป (External)**

รอบนี้แคปใหม่ทับชื่อไฟล์เดิมหลัง UX/UI เปลี่ยน — ทำเฉพาะโฟลเดอร์ `evidence/CCC/`  
**ไม่ได้แตะ** Jay / Parttime / CoM

## แผนที่รูป → TC

| TC# | รูป | ผล | หมายเหตุสั้น |
|-----|-----|----|----------------|
| TC-U-01 | `TC-U-01.png` | ✅ | lamduan `6631501073@lamduan.mfu.ac.th` ผ่าน `DEV_INTERNAL_EMAILS` · บุคลากรภายใน (Internal) |
| TC-U-02 | `TC-U-02.png` | ✅ | บัญชีเดียวกัน ถอดออกจาก list ชั่วคราว · บุคคลทั่วไป (External) |
| TC-U-03 | `TC-U-03.png` | ✅ | Gmail `frewgametv@gmail.com` · บุคคลทั่วไป (External) |
| TC-U-05 | `TC-U-05.png` | ✅ | Logout แล้วเปิด `/home` → กลับหน้า Login (ไทย) |
| TC-U-07 | `TC-U-07.png` | ✅ | รายการ 104 ห้อง การ์ดมีรูปและราคา |
| TC-U-08 | `TC-U-08.png` | ✅ | กรองประเภท «ห้องประชุม» เหลือ 58 ห้อง |
| TC-U-09 | `TC-U-09.png` | ✅ | ค้น «ห้องประชุม» พบ 48 ห้อง |
| TC-U-10 | `TC-U-10.png` | ✅ | ค้น Meeting Room ได้ 48 ห้อง เท่ากับค้นห้องประชุม |
| TC-U-11 | `TC-U-11.png` | ✅ | C3-101 Meeting Room · ครึ่งวัน ฿500 / เต็มวัน ฿1,000 · ปุ่ม Book Space |
| TC-U-13 | `TC-U-13.png` | ✅ | จอง 20/11/2026 เต็มวัน ฿1,000 |
| TC-U-14 | `TC-U-14.png` | ✅ | เพิ่ม Projector Set ×1 รวม ฿1,500 |
| TC-U-17 | `TC-U-17.png` | ✅ | ไม่แนบ PDF → Swal «กรุณาแนบเอกสาร» |
| TC-U-20 | `TC-U-20.png` | ✅ | แดชบอร์ดเห็นรายการจอง + badge (รอชำระเงิน / ชำระเงินแล้ว มีรีวิวแล้ว) |
| TC-U-21 | `TC-U-21.png` | ✅ | กรองสถานะ «รอชำระเงิน» เหลือเฉพาะ BK-20261020-CLZJ |
| TC-U-22 | `TC-U-22.png` | ✅ | ค้น CLZJ เจอ BK-20261020-CLZJ |
| TC-U-25 | `TC-U-25.png` | ✅ | ยกเลิก BK-20261104-5DWG (E3A-201) ที่รออนุมัติ → badge ยกเลิกแล้ว |
| TC-U-26 | `TC-U-26.png` | ✅ | BK-20261012-K9S3 เห็น badge Payment completed + Reviewed (รีวิวไปแล้ว ส่งใหม่ไม่ได้) |
| TC-U-27 | `TC-U-27.png` | ✅ | โปรไฟล์ EN: ชื่อ · `6631501073@lamduan.mfu.ac.th` · MFU Staff (Internal) · เบอร์ 0818831902 |
| TC-I-01 | `TC-I-01.png` | ✅ | หน้าแรก EN «Find & Reserve Spaces» |
| TC-I-02 | `TC-I-02.png` | ✅ | หน้าแรก TH «ค้นหาและจองพื้นที่» |
| TC-I-03 | `TC-I-03.png` | ✅ | หน้า Login มีปุ่ม TH/EN ข้อความอังกฤษเมื่อกด EN |
| TC-I-04 | `TC-I-04.png` | ✅ | หน้าจอง EN → Swal Document required |
| TC-I-05 | `TC-I-05.png` | ✅ | ชื่อห้องอังกฤษ (C3-101 Meeting Room, C3 Grand Hall, …) |
| TC-I-06 | `TC-I-06.png` | ✅ | แดชบอร์ด EN: dropdown All / Pending approval / Awaiting payment / … · badge Awaiting payment |
| TC-I-07 | `TC-I-07.png` | ✅ | Footer EN «© 2026 Mae Fah Luang University Property Management» |
| TC-E-01 | `TC-E-01.png` | ✅ | URL ที่ไม่มีอยู่ → หน้า 404 |
| TC-E-04 | `TC-E-04.png` | ✅ | เบอร์ไม่ถูกต้อง → Swal «กรุณากรอกเบอร์โทรศัพท์» |
| TC-U-28 | `TC-U-28.png` | ✅ | แก้เบอร์เป็น 0818831903 แล้วรีโหลดค่ายังอยู่ (คืนค่า 0818831902 หลังแคป) |

## ที่ยังไม่ได้ทำ / ติดปัญหา

แคปใหม่ UI แล้ว **28/28** ไฟล์ — ไม่ค้างรูปเดิม

**TC-U-26:** ไม่ได้ส่งรีวิวใหม่ (K9S3 มีรีวิวแล้ว) — แคปสถานะ Reviewed ที่มีอยู่
