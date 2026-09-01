# ผลการทดสอบ UAT — Docker Local (รอบ E2E)

**โครงการ:** ระบบจองพื้นที่ MFU Space Booking  
**วันที่ทดสอบ:** 2026-09-02  
**สภาพแวดล้อม:** Docker (`localhost:8080`), `PAYMENT_PROVIDER=mock_sandbox`  
**อ้างอิง:** [UAT_DOCKER_CHECKLIST.md](UAT_DOCKER_CHECKLIST.md)

---

## สรุปผล

| หมวด | ผ่าน | ไม่ผ่าน | ข้าม | รวม |
|------|------|---------|------|-----|
| E2E Flow หลัก (ขั้น 1–8) | 8 | 0 | 0 | 8 |
| ทดสอบเพิ่มเติม (ขั้น 9–10) | 0 | 0 | 2 | 2 |

**สรุป:** Flow จอง → อนุมัติ → ชำระเงิน → ยืนยันรับเงิน **ผ่านครบวงจร**

---

## รายละเอียดตามขั้นตอน

| # | Test Case | ผล | หมายเหตุ |
|---|-----------|-----|----------|
| 1 | หน้า Login แสดงผล | ✅ | แก้ Vite 6 build |
| 2 | Google OAuth Login | ✅ | `DEV_ADMIN_EMAILS`, `COOKIE_SECURE=false` |
| 3 | ดูรายการห้อง / หน้าจอง | ✅ | นำเข้า 96 ห้องจาก Excel |
| 4 | ส่งคำขอจอง + PDF | ✅ | แก้ FormData upload ใน `api.ts` |
| 5 | Admin เห็นรายการ pending | ✅ | |
| 6 | Admin อนุมัติ + แนบใบอนุมัติ | ✅ | แก้คอลัมน์ `approval_document_url` |
| 7 | Mock ชำระเงิน (User) | ✅ | `mock_sandbox` |
| 8 | Admin ยืนยันรับชำระเงิน | ✅ | สถานะ `approved_paid` |
| 9 | Logout / Login ใหม่ | ⬜ | ยังไม่ได้ทดสอบในรอบนี้ |
| 10 | สลับภาษา TH/EN | ⬜ | ยังไม่ได้ทดสอบในรอบนี้ |

---

## Bug ที่พบระหว่าง UAT (แก้แล้ว)

| Bug ID | ความรุนแรง | อาการ | สถานะ |
|--------|------------|-------|-------|
| UAT-D01 | P1 | หน้า blank หลัง build Docker | ✅ แก้แล้ว |
| UAT-D02 | P1 | Login error หลัง OAuth | ✅ แก้แล้ว |
| UAT-D03 | P2 | HTTP 429 ตอนจอง/login | ✅ แก้แล้ว (local env) |
| UAT-D04 | P1 | จองไม่ได้ — server ไม่ได้รับ PDF | ✅ แก้แล้ว |
| UAT-D05 | P1 | อนุมัติ 500 — คอลัมน์ DB ขาด | ✅ แก้แล้ว |
| UAT-D06 | P1 | POST /api/bookings 500 — advisory lock | ✅ แก้แล้ว |

---

## ข้อเสนอแนะก่อน Production

1. ปิด `RATE_LIMIT_DISABLED` บน production
2. เปิด HTTPS + `COOKIE_SECURE=true`
3. ลบหรือจำกัด `DEV_ADMIN_EMAILS`
4. ทดสอบ regression ตาม [UAT_TEST_SCENARIOS.md](UAT_TEST_SCENARIOS.md) บน staging HTTPS

---

## การอนุมัติ

| บทบาท | ชื่อ | ลายเซ็น | วันที่ |
|--------|------|---------|--------|
| ผู้ทดสอบ UAT | | | 2026-09-02 |
| หัวหน้าทีมพัฒนา | | | |

**หมายเหตุ:** รอบนี้เป็นการทดสอบ Docker local — ยังไม่ใช่ sign-off production สมบูรณ์ (ดู [UAT_SIGNOFF.md](UAT_SIGNOFF.md))
