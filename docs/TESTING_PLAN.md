# แผนการทดสอบ (Testing Plan) — แยกตามโมดูล / Sprint

**โครงการ:** MFU Space Reservation  
**อัปเดต:** 2026-09-11  
**ที่มา:** ข้อเสนอแนะอาจารย์ (Recording 1 + Recording 3) — แผน testing แยกโมดูล + AuthZ ข้าม Role + Manual/Postman  
**หลักการ:** ทำฟังก์ชันหลัก → ทดสอบให้มั่นใจ → ค่อยขยายฟังก์ชันเสริม (เช่น Payment gateway จริง)

เอกสารประกอบ: [`FRIDAY_DEMO_PREP.md`](./FRIDAY_DEMO_PREP.md) · [`DEMO_SECURITY.md`](./DEMO_SECURITY.md) · [`RECORDING3_ACTION_PLAN.md`](./RECORDING3_ACTION_PLAN.md)

---

## 1. ภาพรวมชั้นการทดสอบ

| ชั้น | เครื่องมือ | โฟกัส | คำสั่ง |
|------|------------|--------|--------|
| **Unit / API** | Vitest (backend) | Auth, validate, routes, services, AuthZ | `cd backend && npm test` |
| **Integration / Health** | Vitest + DB | API ทำงานร่วมกัน | รวมใน `npm test` |
| **E2E** | Playwright (frontend) | โฟลว์หน้าจอหลัก | `cd frontend && npm run test:e2e` |
| **Load** | k6 | ความทนทานเมื่อมีผู้ใช้พร้อมกัน | `backend/scripts` (k6) |
| **Manual / Demo** | Browser | โชว์อาจารย์: Login → จอง → อนุมัติ | ตามสคริปต์ Demo |
| **UAT** | ผู้ใช้จริง | ยังไม่เน้นรอบนี้ (ตามอาจารย์) | `docs/UAT_*` เก็บไว้ภายหลัง |

**ลำดับที่อาจารย์เน้น:** ฟังก์ชันหลักให้ถูกก่อน → มี test รองรับ → ค่อยทำของเสริม (Payment จริง, รายละเอียดเพิ่ม)

---

## 2. แผน Testing แยกตามโมดูลหลัก

สถานะ: ✅ มีเทสอัตโนมัติแล้ว · 🔄 มีบางส่วน · ⏳ ยังบาง / แผนต่อไป

### M1 — Authentication (ยืนยันตัวตน)

| สิ่งที่ต้องพิสูจน์ | ประเภท | หลักฐาน / ไฟล์ | สถานะ |
|-------------------|--------|----------------|--------|
| ไม่มี token → 401 | Unit | `middleware/__tests__/auth.test.ts` | ✅ |
| Cookie `mfu_token` / Bearer ใช้ได้ | Unit | `auth.test.ts` | ✅ |
| Token หมดอายุ / ปลอม → 401 | Unit | `auth.test.ts` | ✅ |
| OAuth → ออก JWT + cookie | Manual Demo + โค้ด | `auth.routes.ts` | 🔄 (โชว์ Demo) |
| Logout เคลียร์ cookie | Manual / route | `auth.routes.ts` | 🔄 |

**เกณฑ์ผ่านโมดูล:** login ได้, API ปฏิเสธเมื่อไม่มี/เสีย token, อธิบาย FE↔BE ได้

---

### M2 — Authorization (สิทธิ์)

| สิ่งที่ต้องพิสูจน์ | ประเภท | หลักฐาน / ไฟล์ | สถานะ |
|-------------------|--------|----------------|--------|
| Role จากอีเมล (`resolveUserType`) | Unit | `utils/__tests__/resolveUserType.test.ts` | ✅ |
| ไม่ใช่ admin → 403 ที่ Admin API | Unit / Integration | `auth.test.ts`, integration | ✅ |
| Frontend กันหน้า `/admin/*` | E2E / Manual | `router/index.ts`, Playwright | ✅/🔄 |
| กัน IDOR (ดูจองคนอื่น / จ่ายแทนคนอื่น) | Unit | `authz_idor.test.ts`, `coverage_authz_a.test.ts` | ✅ |
| จองบังคับ `userId` จาก JWT | Unit / Integration | `bookings.test.ts`, routes | ✅ |

**เกณฑ์ผ่านโมดูล:** user ทั่วไปยิง Admin API ไม่ได้ + เข้าถึงข้อมูลคนอื่นไม่ได้

---

### M3 — โฟลว์หลักจองพื้นที่ (Core booking)

| สิ่งที่ต้องพิสูจน์ | ประเภท | หลักฐาน / ไฟล์ | สถานะ |
|-------------------|--------|----------------|--------|
| Validation ฟอร์มจอง | Unit | `validate.test.ts`, `bookings.test.ts` | ✅ |
| สร้างจอง / กฎสถานะ | API tests | `bookings.test.ts` | ✅ |
| ป้องกันจองชนกัน (advisory lock) | โค้ด + integration | `booking.routes.ts` | 🔄 |
| E2E: public / auth / admin guard | E2E | `frontend/e2e/booking-flow.spec.ts` | ✅ |
| Manual: Login → จอง → Admin อนุมัติ | Demo | สคริปต์ Demo | 🔄 โชว์สด |

**เกณฑ์ผ่านโมดูล:** โฟลว์หลักจบได้บนระบบที่รันอยู่ + automated ที่เกี่ยวข้องเขียว

---

### M4 — ห้อง / ค้นหา / ข้อมูลสาธารณะ

| สิ่งที่ต้องพิสูจน์ | ประเภท | หลักฐาน | สถานะ |
|-------------------|--------|---------|--------|
| API rooms / health | Integration | `api-healthcheck.test.ts`, `integration.test.ts` | ✅ |
| หน้า list/detail ใช้งานได้ | Manual / E2E | Playwright + Demo | 🔄 |

---

### M5 — Admin (อนุมัติ, จัดการ)

| สิ่งที่ต้องพิสูจน์ | ประเภท | หลักฐาน | สถานะ |
|-------------------|--------|---------|--------|
| Admin-only endpoints | AuthZ tests | `verifyAdmin`, integration | ✅ |
| Audit log | Unit | `auditLog.service.test.ts` | ✅ |
| อนุมัติจองบน UI | Manual Demo | Admin bookings | 🔄 |

---

### M6 — Payment (เสริม — หลัง core นิ่ง)

| สิ่งที่ต้องพิสูจน์ | ประเภท | หลักฐาน | สถานะ |
|-------------------|--------|---------|--------|
| PromptPay payload / adapters | Unit | `payment.test.ts`, `payment_adapter.test.ts` | ✅ |
| Ownership ตอน checkout/slip | Unit | `coverage_authz_a.test.ts` | ✅ |
| Mock sandbox flow | Manual Demo | `PAYMENT_PROVIDER=mock_sandbox` | 🔄 |
| Gateway จริง (ฟรี/sandbox ภายนอก) | แผนถัดไป | ตามอาจารย์ | ⏳ |

**หมายเหตุตามอาจารย์:** Payment เป็นฟังก์ชันเสริม — ทำหลังฟังก์ชันหลักถูกและมี test รองรับ

---

### M7 — Infra / Deploy readiness

| สิ่งที่ต้องพิสูจน์ | ประเภท | หลักฐาน | สถานะ |
|-------------------|--------|---------|--------|
| CI typecheck + test + docker | CI | `.github/workflows/ci.yml` | ✅ |
| Load browse / booking | k6 | scripts k6 | ✅ มีสคริปต์ |
| Go-live บน CITS | Manual | `GO_LIVE_CHECKLIST.md` | ⏳ รอหน่วยงาน |

---

## 3. Mapping กับ Sprint (มุม “แยก testing ให้ดู”)

แนวที่เสนอให้อาจารย์เห็น: **แต่ละช่วงพัฒนามีชุดทดสอบคู่กัน** ไม่ใช่เทสทีเดียวตอนท้าย

| Sprint (อ้างอิง planning) | โมดูลที่เน้น | Testing ที่คู่กัน | สถานะภาพรวม |
|---------------------------|--------------|-------------------|--------------|
| Sprint 1–2 | ฟีเจอร์หลัก + integration | Unit ขยาย + API health | ✅ มีแล้ว |
| Sprint 3–4 | UAT / regression | Manual scenarios (`UAT_*`) | 📄 เอกสารพร้อม — ยังไม่เน้นรอบ Demo นี้ |
| Sprint 5 | Security + mock payment | `auth*`, `authz_*`, payment ownership | ✅ แน่นขึ้น |
| Sprint 6 | E2E + Load | Playwright, k6 | ✅ มีชุดแล้ว |
| Sprint 7–8 | CI/CD + deploy | CI pipeline, checklists | ✅ / ⏳ deploy จริง |
| **Sprint Testing (แยกให้ดู)** | รวมแผนนี้ | ตาราง M1–M7 + ช่องผ่าน/ไม่ผ่าน | 📄 เอกสารนี้ |

> สิ่งที่อาจารย์อยากเห็น: ไม่ใช่แค่ว่า “เขียนเทสไปแล้วกี่ตัว” แต่เป็น **แผนว่าแต่ละโมดูลจะพิสูจน์อะไร ผ่านยังไง ยังขาดอะไร**

---

## 4. ช่อง “ผ่าน / ไม่ผ่าน” สำหรับอัปเดตหลังรัน (ใช้ตอนนำเสนอได้)

รันล่าสุดแล้วใส่วันที่:

| โมดูล | คำสั่ง / วิธี | ผ่าน? | หมายเหตุ |
|-------|----------------|-------|----------|
| M1 Auth middleware | `npm test` (backend) กรอง auth | ☐ | |
| M2 AuthZ / IDOR | `authz_idor` + `coverage_authz_a` | ☐ | |
| M3 Booking API | `bookings` + integration | ☐ | |
| M4 Rooms / health | `api-healthcheck` | ☐ | |
| M5 Admin guards | integration admin 403/200 | ☐ | |
| M6 Payment unit | `payment*` | ☐ | Mock เท่านั้น |
| Full backend suite | `cd backend && npm test` | ☐ | นับจำนวนเทสตอนรัน |
| E2E Playwright | `cd frontend && npm run test:e2e` | ☐ | |
| Manual main flow | Demo checklist | ☐ | |

**ครั้งล่าสุดที่อัปเดตตารางนี้:** _ยังไม่กรอก — กรอกก่อนวัน Demo_

---

## 5. แผน Testing ขั้นต่อไป (ตามทิศ QA / Automated)

ลำดับที่สอดคล้องคำแนะนำอาจารย์:

1. **คงคุณภาพโฟลว์หลัก** — ทุกครั้งก่อน Demo รัน `backend npm test` ให้เขียว  
2. **ขยาย automated บนโฟลว์หลัก** — Playwright ให้ครอบคลุมจอง→อนุมัติมากขึ้น (ไม่ต้องรอ UAT หน่วยงาน)  
3. **Payment** — เมื่อ core นิ่ง ค่อยต่อ free/sandbox gateway + เพิ่มเทส adapter  
4. **Deployment** — ใช้ CI + checklist ที่มี แล้วค่อยขึ้น CITS  
5. **ทักษะ QA** — ฝึกเขียนเคสแบบ Given/When/Then + แปลงเป็น automated ทีละโมดูล

---

## 6. ประโยคพูดสั้น ๆ ตอนโชว์แผนนี้แก่อาจารย์

> “ทีมแยกแผนทดสอบตามโมดูลหลักแล้วครับ/ค่ะ — Auth, AuthZ, โฟลว์จอง, Admin, Payment  
> ตอนนี้มี automated ฝั่ง backend (Vitest) และ E2E (Playwright) รวมถึง CI  
> ตามที่อาจารย์แนะนำ เราทำฟังก์ชันหลักและทดสอบให้ผ่านก่อน ส่วน Payment gateway จริงจัดเป็นขั้นถัดไป  
> UAT กับผู้ใช้จริงยังไม่เน้นในรอบนี้ แต่มีเอกสาร scenario เก็บไว้แล้ว”

---

## 7. ไฟล์เทสอ้างอิงเร็ว

| กลุ่ม | พาธ |
|------|------|
| Auth middleware | `backend/src/middleware/__tests__/auth.test.ts` |
| AuthZ / IDOR | `backend/src/__tests__/authz_idor.test.ts`, `coverage_authz_a.test.ts` |
| Booking | `backend/src/__tests__/bookings.test.ts` |
| Integration / health | `integration.test.ts`, `api-healthcheck.test.ts` |
| Payment | `payment.test.ts`, `payment_adapter.test.ts` |
| E2E | `frontend/e2e/booking-flow.spec.ts` |
| CI | `.github/workflows/ci.yml` |

---

## 8. Manual + Postman (Recording 3)

แบ่งงานทีม: คนหนึ่ง Manual UI · คนหนึ่งยิง API

### Postman / API checklist (Bearer หรือ cookie `mfu_token`)

| # | Request | ผู้ใช้ | คาดหวัง |
|---|---------|--------|---------|
| 1 | `GET /api/user/profile` | ไม่มี token | 401 |
| 2 | `GET /api/admin/bookings` | internal JWT | 403 |
| 3 | `GET /api/admin/bookings` | admin JWT | 200 |
| 4 | `GET /api/user/bookings/{otherId}` | user A | 403 |
| 5 | `POST /api/payment/checkout` `{bookingId ของคนอื่น}` | user A | 403 |
| 6 | `PUT /api/admin/users/:id/active` `{isActive:false}` | admin | 200 แล้ว login บัญชีนั้นไม่ได้ |
| 7 | `GET /api/admin/stats?from=YYYY-MM-DD&to=YYYY-MM-DD` | admin | 200 + pending/approved/paid |
| 8 | `GET /api/admin/logs?bookingId=` | admin | 200 เฉพาะรายการนั้น |

### Frontend Manual

| # | เคส | ผ่าน? |
|---|-----|-------|
| F1 | User ไม่สามารถเปิด `/admin` ได้ | ☐ |
| F2 | Badge สถานะ User/Admin ตรงกัน (ชำระแล้ว ≠ มีรีวิว) | ☐ |
| F3 | ตาราง Admin zebra + hover | ☐ |
| F4 | Dashboard กรองช่วงวันแล้วตัวเลขเปลี่ยน | ☐ |
| F5 | ปุ่มดูประวัติบนรายการจอง | ☐ |
| F6 | โปรไฟล์บังคับเบอร์โทร | ☐ |
