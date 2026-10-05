# QA Automation Guide — MFU Space Reservation

**สำหรับ:** คนที่อยากฝึกเป็น QA บนโปรเจกต์นี้  
**อัปเดต:** 2026-09-16  
**คู่กับ:** [`TESTING_PLAN.md`](./TESTING_PLAN.md)

---

## 1. ชั้นการทดสอบ (จำให้ได้)

| ชั้น | เครื่องมือ | ถามอะไร |
|------|------------|---------|
| Unit / API | Vitest (`backend`) | ฟังก์ชัน/API ถูกไหม โดยไม่เปิดเบราว์เซอร์ |
| E2E | Playwright (`frontend/e2e`) | ผู้ใช้คลิกจริงแล้วระบบทำงานครบโฟลว์ไหม |
| Manual / Demo | มือ + เบราว์เซอร์ | โชว์อาจารย์ / สำรวจ UX |
| UAT | ผู้ใช้จริง | รับงานก่อนขึ้น production |

กฎสั้น ๆ: **อย่าใช้ E2E แทน unit ทุกอย่าง** — E2E แพงและเปราะ ใช้กับโฟลว์สำคัญ

---

## 2. เขียน Test Case แบบ Given / When / Then

ตัวอย่าง (จองพื้นที่):

- **Given** ผู้ใช้ล็อกอินแล้ว และห้องว่างในวันที่เลือก  
- **When** กรอกฟอร์มครบ แนบ PDF ยอมรับเงื่อนไข แล้วส่ง  
- **Then** เห็นสถานะ **รออนุมัติ** บน Dashboard และ Admin เห็นรายการเดียวกัน

จัดลำดับความสำคัญ: **Smoke → Happy path → Negative**

---

## 3. E2E ในโปรเจกต์นี้

### สเปกหลัก

| ไฟล์ | ครอบคลุม |
|------|----------|
| `frontend/e2e/public-smoke.spec.ts` | หน้าแรก / รายการห้อง / 404 |
| `frontend/e2e/user-booking.spec.ts` | auth guard + ส่งจอง → dashboard |
| `frontend/e2e/admin-approve.spec.ts` | แนบใบอนุมัติ → อนุมัติ → รอชำระเงิน |
| `frontend/e2e/fixtures/auth.ts` | mint JWT → cookie `mfu_token` + localStorage |

**ไม่ใช้ Google OAuth ใน E2E** — สร้าง JWT ด้วย secret เดียวกับ backend

### Env ที่ต้องตั้ง (อย่า commit ค่าจริง)

```bash
# PowerShell ตัวอย่าง (ปรับ id ให้ตรง users ใน DB)
$env:E2E_USER_ID="2"
$env:E2E_ADMIN_ID="1"
$env:E2E_USER_EMAIL="6631501071@lamduan.mfu.ac.th"
$env:E2E_ADMIN_EMAIL="comza962@gmail.com"
$env:FRONTEND_URL="http://localhost:5173"
```

ค่าเริ่มต้นใน fixture: user id `2` + email นักศึกษาใน seed, admin id `1` — ปรับให้ตรง DB ของคุณ  
อีเมลใน JWT ต้องมีในตาราง `users` (profile หาจาก email)  
JWT ของ admin ต้องมี `role: "admin"` (fixture จัดการให้)  
`E2E_JWT_SECRET` ถ้าไม่ตั้ง จะใช้ `my_super_secret_key` (ต้องตรง `backend/.env`) — อย่าพึ่งค่า `JWT_SECRET` จาก shell  
Auth E2E: cookie + `localStorage.e2e_bearer` (axios อ่านใน `api.ts`)

### รันเทส

```bash
# เทอร์มินัล 1
cd backend && npm run dev

# เทอร์มินัล 2
cd frontend && npm run dev

# เทอร์มินัล 3
cd frontend
npx playwright install chromium   # ครั้งแรก
npm run test:e2e
```

ค่าเริ่มต้นรันเฉพาะ **Chromium desktop**  
อยากรันมือถือด้วย: `E2E_FULL=1 npm run test:e2e`

เปิดรายงาน: `npx playwright show-report`

---

## 4. เมื่อเทสแดง — อ่านยังไง

1. ดูชื่อเทสที่ fail  
2. เปิด screenshot ใน report (ตั้ง `screenshot: only-on-failure`)  
3. ถ้ายังงง: `npx playwright test --trace on` แล้วเปิด trace  
4. แยกให้ชัด: **บัคผลิตภัณฑ์** vs **เทสเปราะ (flake)** vs **env/seed ไม่ครบ**

---

## 5. รายงานบัคสั้น ๆ

ใช้ [`UAT_BUG_REPORT_TEMPLATE.md`](./UAT_BUG_REPORT_TEMPLATE.md)  
อย่างน้อยใส่: ขั้นตอนทำซ้ำ / ผลที่คาด / ผลจริง / หลักฐาน (screenshot)

---

## 6. เส้นทางฝึก QA บนโปรเจกต์นี้

1. รัน `public-smoke` ให้ผ่าน → เข้าใจ smoke  
2. อ่าน `user-booking.spec.ts` ทีละขั้น → map กับ UI จริง  
3. รัน `admin-approve` → เข้าใจ dependency แนบเอกสารก่อนอนุมัติ  
4. เพิ่มเคส negative เอง เช่น ไม่ติ๊ก terms แล้วปุ่มส่งต้อง disable  
5. อ่าน Vitest AuthZ ใน backend เพื่อเข้าใจว่า E2E ไม่ต้องซ้ำทุกเคสสิทธิ์

---

## 7. ขยายถัดไป (ยังไม่ทำในรอบนี้)

- Mock payment / ยืนยันสลิป  
- CI รัน Playwright ทุก PR  
- Negative cases (วันเต็ม, ไฟล์ไม่ใช่ PDF)
