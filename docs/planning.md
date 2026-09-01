# แผนการดำเนินงานปรับปรุงใหม่: เน้น UAT ก่อน Deploy (8 Sprints)

**เฟสโครงการ:** ระบบบริหารจัดการพื้นที่เช่าชั่วคราว มหาวิทยาลัยแม่ฟ้าหลวง — การทดสอบ UAT และการติดตั้งใช้งานจริง (Production Deployment)  
**ระยะเวลา:** 2 เดือน (8 สัปดาห์ / 8 Sprints)  
**เป้าหมายที่ปรับใหม่:** ทำให้ระบบผ่านการทดสอบ UAT ครบทุกโมดูลก่อนในเดือนแรก แล้วจึงยกระดับความปลอดภัย ระบบชำระเงิน และ Deploy จริงบนเซิร์ฟเวอร์ CITS ในเดือนที่สอง  
**วันที่ปรับแผน:** 2026-08-27 (ปรับปรุงตามคำแนะนำอาจารย์ที่ปรึกษา)

---

## 💡 กลยุทธ์การดำเนินงานที่ปรับปรุงใหม่

> **เหตุผลที่ปรับแผน:** อาจารย์ที่ปรึกษาแนะนำให้ดำเนินการทดสอบ UAT ให้ครอบคลุมทุกโมดูลก่อน เพื่อค้นหาและแก้ไขข้อผิดพลาดจากผู้ใช้งานจริงก่อนการติดตั้งจริง ซึ่งช่วยลดความเสี่ยงและการแก้ไขงานซ้ำซ้อนหลังขึ้น Production

**เดือนที่ 1 — ทำให้ระบบพร้อมสำหรับ UAT ครบทุกโมดูล (UAT-Ready):**
- **Sprint 1:** ตรวจสอบฟีเจอร์ เติมเต็มส่วนที่ขาด แก้ไข Unit Tests และปรับปรุงระบบภาษา [✅ เสร็จสมบูรณ์]
- **Sprint 2:** ทดสอบการทำงานร่วมกัน (Integration Testing) และจัดเตรียมสภาพแวดล้อมสำหรับ UAT Demo
- **Sprint 3:** การทดสอบ UAT รอบที่ 1 — ทดสอบทุกโมดูลกับผู้ใช้งานจริง (User & Admin)
- **Sprint 4:** การทดสอบ UAT รอบที่ 2 — แก้ไขข้อผิดพลาด ทดสอบซ้ำ (Regression) และรับการอนุมัติจากอาจารย์ที่ปรึกษา

**เดือนที่ 2 — ความปลอดภัย ระบบชำระเงิน CI/CD และการติดตั้งใช้งานจริง:**
- **Sprint 5:** ยกระดับความปลอดภัย (Security Hardening), บังคับใช้สิทธิ์ OAuth และสรุประบบชำระเงิน
- **Sprint 6:** การทดสอบแบบอัตโนมัติ (E2E Automation Testing) และการทดสอบรองรับการใช้งานพร้อมกัน (Load Testing)
- **Sprint 7:** ติดตั้งระบบ CI/CD Pipeline และจัดทำชุดเอกสารส่งมอบงานสำหรับ CITS
- **Sprint 8:** ติดตั้งระบบบนเซิร์ฟเวอร์ CITS, การชี้ Domain DNS และเปิดใช้งานจริง (Go-Live)

---

## 🗓️ เดือนที่ 1: การพัฒนาฟีเจอร์ให้ครบถ้วนและการทดสอบ UAT ทุกโมดูล (Sprints 1–4)

---

### 🔹 Sprint 1 (สัปดาห์ที่ 1): ตรวจสอบฟีเจอร์ เติมเต็มส่วนที่ขาด และแก้ไข Unit Tests [✅ เสร็จสมบูรณ์]

**ฝั่ง Backend — การเติมเต็มและแก้ไขระบบ:**
- เชื่อมต่อ Redis จริงสำหรับ Rate Limiter (`ioredis` + `rate-limit-redis`) เพื่อให้ทำงานต่อเนื่องแม้ Server Restart ✅ เสร็จแล้ว
- สคริปต์สำรองข้อมูล PostgreSQL อัตโนมัติ (`backend/scripts/backup.sh` พร้อม `pg_dump`, บีบอัด gzip และลบไฟล์ย้อนหลังเกิน 30 วันอัตโนมัติ) ✅ เสร็จแล้ว
- ปรับปรุง Production Build Pipeline: Compile TypeScript ลงโฟลเดอร์ `dist/` และรันด้วย `node dist/server.js` แทน `tsx` ✅ เสร็จแล้ว
- ชุดการทดสอบ Unit Tests: ผ่านครบ **105/105 Tests** (เพิ่มขึ้นจาก 93 Tests) ✅ เสร็จแล้ว
- พัฒนา API จัดการผู้ใช้งานสำหรับ Admin (`/api/admin/users`) สำหรับดึงรายชื่อ สถิติการจอง และปรับเปลี่ยนสิทธิ์ (Role) ✅ เสร็จแล้ว

**ฝั่ง Frontend — หน้าจอ UI, ระบบภาษา และการจัดการสถานะ:**
- สร้างหน้าจอจัดการผู้ใช้งาน `AdminUsers.vue` (ตารางรายชื่อ, ค้นหา, กรองตาม Role, เปลี่ยนสิทธิ์ผู้ใช้, สถิติการจอง) ✅ เสร็จแล้ว
- แยกหน้าจอจัดการรหัสส่วนลด `AdminPromoCodes.vue` ออกมาเป็นสัดส่วน (การแสดงสถิติ, กรองสถานะ, ฟอร์มสร้างรหัส, แถบแสดงการใช้งาน) ✅ เสร็จแล้ว
- อัปเดตเมนู Sidebar ใน `AdminDashboardView.vue` ให้รองรับแท็บจัดการผู้ใช้งานและรหัสส่วนลดครบถ้วน ✅ เสร็จแล้ว
- เพิ่ม Loading Skeleton, Error Boundary และ Empty State ในหน้าจอฝั่งผู้ใช้ (`HomeView`, `RoomListView`, `RoomDetailView`) ✅ เสร็จแล้ว
- ตรวจสอบและแก้ไขระบบสลับภาษา (i18n) ครอบคลุม Modal Dialogs ทั้งหมด (QR Code ชำระเงิน, ยกเลิกคำขอจอง, ฟอร์มรีวิวความพึงพอใจ, การแจ้งเตือนต่างๆ) ✅ เสร็จแล้ว
- ตรวจสอบและแก้ไข TypeScript Errors ทั้งระบบในฝั่ง Frontend (`npx vue-tsc --noEmit` ผ่าน 0 errors) ✅ เสร็จแล้ว

---

### 🔹 Sprint 2 (สัปดาห์ที่ 2): ทดสอบการทำงานร่วมกัน และจัดเตรียมสภาพแวดล้อมสำหรับ UAT [✅ เสร็จสมบูรณ์]

- ทดสอบขั้นตอนการทำงานทั้งหมดตั้งแต่ต้นจนจบ (End-to-End Walkthrough): เข้าสู่ระบบ → ค้นหาและเลือกห้อง → ส่งคำขอจอง → อัปโหลดหนังสือบันทึกข้อความ (Memo PDF) → เจ้าหน้าที่ตรวจสอบและอนุมัติ → แสดง PromptPay QR Code → อัปโหลดสลิปโอนเงิน → เจ้าหน้าที่ตรวจสอบและยืนยันการชำระเงิน ✅ เสร็จแล้ว
- จัดเตรียมสภาพแวดล้อม UAT Demo: ติดตั้งระบบบนเครื่อง localhost เพื่อให้อาจารย์ที่ปรึกษาและผู้มีส่วนเกี่ยวข้องสามารถเข้าทดสอบได้ ✅ เสร็จแล้ว
- นำเข้าข้อมูลตัวอย่างที่สมจริง (Seed Realistic Demo Data): ข้อมูลห้องและพื้นที่ 8 ประเภท, อัตราค่าบริการตามประเภทผู้ใช้ 3 ระดับ, รหัสส่วนลด, อุปกรณ์เสริม, ตัวอย่างการจอง 5 รายการ และบัญชี Admin สำหรับทดสอบ (`npm run seed:demo`) ✅ เสร็จแล้ว
- จัดทำเอกสารสถานการณ์การทดสอบ (UAT Test Scenarios) และรายการตรวจสอบ (Checklist) แยกตามบทบาทผู้ใช้งาน 4 กลุ่ม รวม 65 Test Cases (`docs/UAT_TEST_SCENARIOS.md`) ✅ เสร็จแล้ว
- ชุดทดสอบ Integration Tests + API Health Check: ผ่านครบ **163/163 Tests** (เพิ่มขึ้นจาก 105 Tests) ✅ เสร็จแล้ว

---

### 🔹 Sprint 3 (สัปดาห์ที่ 3): การทดสอบ UAT รอบที่ 1 [✅ เตรียมพร้อม — รอผู้ทดสอบจริง]

**งานเตรียมความพร้อม UAT (เสร็จแล้ว):**
- ปรับนโยบาย Role จากอีเมล: `@property.mfu.ac.th` → admin, `@mfu.ac.th` → internal, อื่นๆ → external (`resolveUserType.ts`) ✅
- เพิ่ม `DEV_ADMIN_EMAILS` ใน `.env` สำหรับทดสอบ Admin ด้วย Gmail ส่วนตัว ✅
- สร้าง `backend/.env.example` เป็นตัวอย่างค่า config สำหรับ Development/UAT ✅
- เพิ่ม Mock Payment Sandbox: `POST /api/payment/mock/simulate` + UI จำลองชำระเงินใน Dashboard (`PAYMENT_PROVIDER=mock_sandbox`) ✅
- ปรับปรุงหน้า User Dashboard: รองรับทั้ง PromptPay QR + อัปโหลดสลิปใน Modal เดียว และโหมด Mock Sandbox อัตโนมัติ ✅
- อัปเดต Seed Demo Data: แก้ไขอีเมล Admin เป็น `admin.demo@property.mfu.ac.th` ✅
- ชุดทดสอบ Unit Tests: ผ่านครบ **169/169 Tests** (เพิ่ม `resolveUserType.test.ts` 6 tests) ✅
- ลบสคริปต์ seed เก่าที่ซ้ำซ้อน (`seed-banners.ts`, `seed-promos.ts`, `seed-logs.ts`) — ใช้ `seed:demo` แทน ✅
- จัดทำเอกสาร UAT: `UAT_ROUND1_RESULTS.md`, `UAT_BUG_REPORT_TEMPLATE.md`, `UAT_SIGNOFF.md` ✅

**รอดำเนินการ (ต้องมีผู้ทดสอบจริง):**
- ทดสอบการเข้าสู่ระบบด้วย Google OAuth — การจำแนก Role อัตโนมัติตามโดเมนอีเมล (`@property.mfu.ac.th` → admin, `@mfu.ac.th` → internal, โดเมนอื่น → external)
- ทดสอบการค้นหาห้อง, ระบบกรอง (8 ประเภทพื้นที่), การค้นหาสองภาษา (TH/EN) และการแสดงหน้ารายละเอียดห้อง
- ทดสอบฟอร์มการส่งคำขอจอง: การเลือกวันที่, ช่วงเวลา, อุปกรณ์เสริม, รหัสส่วนลด และการอัปโหลดไฟล์ Memo PDF
- ทดสอบหน้ารายการของฉัน (User Dashboard): ประวัติการจอง, การติดตามสถานะ, PromptPay QR + อัปโหลดสลิป หรือ Mock Sandbox (ตาม `PAYMENT_PROVIDER`), และการส่งรีวิว
- ทดสอบการสลับภาษา (i18n): ข้อความบนหน้าจอและ Modal ทั้งหมดเปลี่ยนระหว่างภาษาไทยและภาษาอังกฤษได้อย่างถูกต้อง

**โมดูลฝั่งผู้ดูแลระบบ (เจ้าหน้าที่ส่วนจัดการทรัพย์สิน):**
- ทดสอบแดชบอร์ดผู้ดูแลระบบ: กราฟสรุปรายได้, สถิติการจอง และประวัติการทำงาน (Activity Logs)
- ทดสอบระบบจัดการคำขอจอง: ตรวจสอบรายการรออนุมัติ, อนุมัติ/ปฏิเสธพร้อมระบุหมายเหตุ, ตรวจสอบสลิปการโอนเงิน และดาวน์โหลดเอกสารรวมเป็นไฟล์ ZIP
- ทดสอบระบบจัดการข้อมูลห้อง: เพิ่ม/แก้ไขข้อมูลห้อง และการเลือกห้องแนะนำ (Featured Rooms)
- ทดสอบระบบจัดการประกาศและแบนเนอร์: อัปโหลดและจัดการแบนเนอร์บนหน้าแรก
- ทดสอบระบบจัดการรหัสส่วนลด: สร้าง, แก้ไข และเปิด/ปิดการใช้งาน Promo Code
- ทดสอบระบบจัดการผู้ใช้งาน: ตรวจสอบรายชื่อ, สถิติการจอง และการปรับเปลี่ยนสิทธิ์ (Role)
- ทดสอบระบบการแจ้งเตือนทางอีเมล: อีเมลยืนยันการส่งคำขอ และอีเมลแจ้งผลการอนุมัติ/ปฏิเสธ

---

### 🔹 Sprint 4 (สัปดาห์ที่ 4): UAT รอบที่ 2 — แก้ไขข้อผิดพลาด และ Regression [🔄 รอผล UAT รอบ 1]

**เตรียมพร้อมแล้ว:**
- แบบฟอร์ม Bug Report และ Sign-Off (`docs/UAT_BUG_REPORT_TEMPLATE.md`, `docs/UAT_SIGNOFF.md`) ✅
- Regression test suite (Vitest 169+ tests) ✅

**รอดำเนินการ:**
- รวบรวมและจัดลำดับความสำคัญของรายงานข้อผิดพลาด (Bug Reports) และข้อเสนอแนะทั้งหมดจาก UAT รอบที่ 1
- ดำเนินการแก้ไขข้อผิดพลาดระดับวิกฤต (P1) และระดับสำคัญ (P2) ทั้งหมดที่พบ
- ดำเนินการทดสอบซ้ำ (Regression Testing) ในทุกส่วนที่ได้รับการแก้ไข เพื่อยืนยันว่าไม่กระทบต่อการทำงานเดิม
- รับการตรวจรับ UAT (Sign-Off): นำเสนอระบบตัวอย่างขั้นสุดท้ายให้อาจารย์ที่ปรึกษา และรับการอนุมัติอย่างเป็นทางการก่อนเข้าสู่เฟสการ Deploy

---

## 🗓️ เดือนที่ 2: ความปลอดภัย ระบบชำระเงิน CI/CD และการเปิดใช้งานจริง (Sprints 5–8)

---

### 🔹 Sprint 5 (สัปดาห์ที่ 5): Security Hardening & Payment [✅ เสร็จสมบูรณ์ (โค้ด)]

**ด้านความปลอดภัย (Security):**
- `backend/src/config/env.ts` — บังคับ JWT_SECRET ใน production ✅
- Secure cookies (`httpOnly`, `secure`), session hardening ✅
- Frontend admin route guard (`requiresAdmin`) ✅
- Server-side audit logs (`auditLog.service.ts`) ✅
- Double-booking prevention (`pg_advisory_xact_lock` + `FOR UPDATE`) ✅
- เอกสาร `docs/SECURITY_CHECKLIST.md` ✅

**ด้านระบบการชำระเงิน:**
- SMTP email service (พร้อมใช้เมื่อได้เมล มฟล.; fallback console) ✅
- Mock Sandbox UAT mode (`PAYMENT_PROVIDER=mock_sandbox`) ✅
- PDF generation on payment verify ✅

**รอหน่วยงาน:**
- SMTP credentials จากเมล มฟล.
- ตัดสินใจ Payment provider สำหรับ production

---

### 🔹 Sprint 6 (สัปดาห์ที่ 6): E2E & Load Testing [✅ เสร็จสมบูรณ์ (โค้ด)]

- ขยาย Playwright E2E (`frontend/e2e/booking-flow.spec.ts`) — public, auth, admin guard ✅
- อัปเดต k6 load test — browse 300 VUs + concurrent booking scenario ✅
- E2E fixtures (`frontend/e2e/fixtures/auth.ts`) ✅

---

### 🔹 Sprint 7 (สัปดาห์ที่ 7): CI/CD & CITS Docs [✅ เสร็จสมบูรณ์]

- GitHub Actions: Docker build job เพิ่มใน `ci.yml` ✅
- `docker-compose.prod.yml` — env vars ครบ (OAuth, Payment, SMTP) ✅
- `docs/CITS_RUNBOOK.md`, `docs/BACKUP_RESTORE.md` ✅
- `backend/scripts/pre-deploy-check.js` ✅
- `.env.production.example` อัปเดตสำหรับ localhost/UAT ✅

---

### 🔹 Sprint 8 (สัปดาห์ที่ 8): Deploy & Go-Live [🔄 พร้อม Docker — รอ CITS/Domain]

**เสร็จแล้ว:**
- `backend/scripts/seed-production.ts` (`npm run seed:production`) ✅
- `docs/GO_LIVE_CHECKLIST.md` ✅
- Docker stack พร้อมรัน localhost ✅

**รอดำเนินการ (ต้องมี CITS):**
- ติดตั้งบนเซิร์ฟเวอร์ CITS จริง
- DNS + SSL certificate
- มอบหมายระบบให้ส่วนทรัพย์สิน
