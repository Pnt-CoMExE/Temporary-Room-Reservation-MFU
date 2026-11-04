# 1. Auth — เข้าสู่ระบบ / สิทธิ์

**เฟส:** ผู้ใช้  ·  **จำนวน:** 9 เคส

> Login ตามโดเมน · Logout · กันหน้าที่ต้อง auth · กัน Admin

ตารางรวมทุกโฟลว์: [`../TEST_CASE_TRACKER.md`](../TEST_CASE_TRACKER.md)  ·  แผนที่รหัสเก่า: [`_id-map.md`](./_id-map.md)

| ผล | ความหมาย |
|----|----------|
| ✅ | ผ่าน |
| ❌ | ไม่ผ่าน |
| ⬜ | ยังไม่ทดสอบ |

## Login ตามประเภทผู้ใช้

| TC# | ชื่อเคส | หน้า | ขั้นตอน | คาดหวัง | ผล | หลักฐาน | หมายเหตุ |
|-----|---------|------|---------|---------|----|---------|----------|
| TC-AUTH-01 | Login บุคลากรภายใน (internal) | `/` | Sign in with Google → บัญชี internal | เข้าได้ · Role=internal · ไป `/home` | ✅ | `evidence/CCC/TC-U-01.png` | UAT ใช้ `DEV_INTERNAL_EMAILS` ได้ถ้าไม่มี `@mfu.ac.th` |
| TC-AUTH-02 | Login `@lamduan.mfu.ac.th` | `/` | Sign in → เมล lamduan | Role=external · ไป `/home` | ✅ | `evidence/CCC/TC-U-02.png` | ถอดเมลออกจาก `DEV_INTERNAL_EMAILS` ชั่วคราวถ้าเคยบังคับ internal |
| TC-AUTH-03 | Login โดเมนอื่น (เช่น Gmail) | `/` | Sign in → `@gmail.com` | Role=external · ไป `/home` | ✅ | `evidence/CCC/TC-U-03.png` |  |

## Session / Logout / Guard

| TC# | ชื่อเคส | หน้า | ขั้นตอน | คาดหวัง | ผล | หลักฐาน | หมายเหตุ |
|-----|---------|------|---------|---------|----|---------|----------|
| TC-AUTH-04 | ออกจากระบบ | Navbar | เมนู → ออกจากระบบ → ยืนยัน | กลับ Login · ลบ session | ✅ | `evidence/JJ/TC-U-04.png` |  |
| TC-AUTH-05 | เปิดหน้า protected โดยไม่ login | `/home` | เปิด `/home` โดยตรง | Redirect Login | ✅ | `evidence/CCC/TC-U-05.png` |  |
| TC-AUTH-06 | Session หมด / ไม่มี token | `/dashboard` | ลบ cookie/session → เปิดหน้า auth | Redirect Login | ✅ | `evidence/CoM/TC-E-02.png` |  |

## AuthZ — กันหน้า Admin

| TC# | ชื่อเคส | หน้า | ขั้นตอน | คาดหวัง | ผล | หลักฐาน | หมายเหตุ |
|-----|---------|------|---------|---------|----|---------|----------|
| TC-AUTH-07 | User ทั่วไปเปิด `/admin` | `/admin/dashboard` | Login user → เปิด Admin | กันเข้า / ส่งกลับ `/home` | ✅ | `evidence/CoM/TC-E-03.png` |  |
| TC-AUTH-08 | ยืนยัน AuthZ หน้า Admin | `/admin/dashboard` | Login non-admin → `/admin` | กันเข้าได้ | ✅ | `evidence/CoM/TC-Z-01.png` | เคสยืนยันซ้ำของ AuthZ UI |
| TC-AUTH-09 | Unit test AuthZ | backend | `cd backend && npm test` | ชุดเทส AuthZ ผ่าน | ✅ | `evidence/CoM/README.md` |  |

---

← [ดัชนีโฟลว์](./README.md)
