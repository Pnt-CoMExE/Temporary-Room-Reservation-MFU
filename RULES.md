# RULES.md — กฎการทำงานสำหรับ AI / Cursor Agent
# Project Rules for AI Assistant (MFU Space Reservation)

> **โปรเจกต์:** ระบบบริหารจัดการพื้นที่เช่าชั่วคราว มหาวิทยาลัยแม่ฟ้าหลวง  
> **อ่านกฎนี้ก่อนเริ่มงานทุกครั้ง** — ไฟล์นี้เป็นข้อกำหนดสำหรับ AI Agent ที่ช่วยพัฒนาโปรเจกต์นี้

---

## 0. กฎสำคัญที่สุด (Must Follow First)
## 0. Critical Rules (Highest Priority)

### 0.1 ถามก่อนทำเมื่อไม่แน่ใจ
### 0.1 Ask Before Acting When Uncertain

- หากข้อมูลไม่ครบ มีหลายทางเลือก หรือกระทบ architecture / security / deploy → **ถามผู้ใช้ก่อน**
- If requirements are ambiguous, multiple valid approaches exist, or changes affect security/deploy → **ask the user first**
- อย่าเดา credentials, domain, payment provider, หรือนโยบายหน่วยงานเอง
- Never guess credentials, domains, payment providers, or institutional policies

### 0.2 เขียน Implementation Plan ก่อนลงมือ
### 0.2 Write an Implementation Plan Before Starting

ก่อนแก้โค้ดหรือเพิ่มฟีเจอร์ ต้องเสนอแผนสั้นๆ ให้ผู้ใช้ตรวจก่อน:

Before coding or adding features, present a short plan for user approval:

1. **เป้าหมาย / Goal** — ทำอะไร ทำไม
2. **ไฟล์ที่จะแก้ / Files to change** — รายการไฟล์หลัก
3. **แนวทาง / Approach** — สรุปวิธีทำ
4. **ความเสี่ยง / Risks** — สิ่งที่อาจกระทบ
5. **การทดสอบ / How to verify** — วิธีเช็คว่าสำเร็จ

➡️ **รอการอนุมัติจากผู้ใช้ก่อน proceed** (ยกเว้นงานเล็กมาก เช่น แก้ typo ชัดเจน หรือผู้ใช้บอกว่า "ทำเลย")

➡️ **Wait for user approval before proceeding** (except trivial fixes or when user says "go ahead")

### 0.3 อัปเดตเอกสาร `.md` ทุกครั้งที่ทำงาน
### 0.3 Always Update Markdown Documentation

หลังทำงานเสร็จแต่ละรอบ ต้องอัปเดตไฟล์ `.md` ที่เกี่ยวข้อง:

After each work session, update relevant `.md` files:

| เมื่อทำอะไร | อัปเดตไฟล์ |
|-------------|------------|
| แก้ฟีเจอร์ / bug | `AI_CHANGELOG.md` |
| เปลี่ยนแผน sprint | `docs/planning.md` |
| เปลี่ยน API / schema | `docs/schema.md`, `README.md` (ถ้าจำเป็น) |
| เปลี่ยน payment / env | `docs/payment_gateway.md`, `backend/.env.example` |
| UAT / testing | `docs/UAT_TEST_SCENARIOS.md` หรือ `docs/UAT_ROUND1_RESULTS.md` |
| security / deploy | `docs/SECURITY_CHECKLIST.md`, `docs/CITS_RUNBOOK.md` |

- **อย่าสร้าง `.md` ใหม่โดยไม่จำเป็น** — อัปเดตไฟล์ที่มีอยู่ก่อน
- **Do not create new `.md` files unless necessary** — prefer updating existing docs

---

## 1. โครงสร้างโปรเจกต์
## 1. Project Structure

```
backend/     → Express 5 + TypeScript + PostgreSQL
frontend/    → Vue 3 + Vite + TypeScript + Tailwind
docs/        → เอกสารโครงการ (ห้ามลบ)
data/        → ข้อมูลอ้างอิง (ห้ามลบ)
```

### ห้ามทำ
### Do NOT

- สร้างโฟลเดอร์ `vue-test`, `documents/`, `Data Set/` (เปลี่ยนชื่อแล้ว)
- ลบไฟล์ใน `docs/` และ `data/` โดยไม่ได้รับอนุญาต
- Commit `.env`, secrets, หรือ `backend/uploads/`
- สร้าง README ซ้ำซ้อนใน subfolder ถ้า `README.md` หลักครอบคลุมแล้ว

### ใช้ scripts ตามนี้
### Use These Scripts

| คำสั่ง | ใช้เมื่อ |
|--------|---------|
| `npm run seed:demo` | UAT / demo ข้อมูลครบ |
| `npm run seed:production` | ข้อมูลเริ่มต้น production (ไม่มี demo bookings) |
| `npm run seed` | seed ห้องพื้นฐานเท่านั้น |
| `npm test` | รัน Vitest (backend) |
| `npm run typecheck` | ตรวจ TypeScript ทั้ง backend/frontend |

---

## 2. มาตรฐานเขียนโค้ด
## 2. Coding Standards

### ทั่วไป / General

- **Minimize scope** — แก้เฉพาะสิ่งที่ขอ ไม่ refactor เกินจำเป็น
- **Match existing conventions** — อ่านโค้ดรอบๆ ก่อนเขียน ใช้ pattern เดิม
- **TypeScript strict** — ห้ามใช้ `any` โดยไม่จำเป็น
- **Comments** — เฉพาะ logic ที่ไม่ชัดเจน ไม่ comment สิ่งที่โค้ดบอกเองได้

### Backend (`backend/`)

- Routes แยกตาม module ใน `src/routes/`
- Business logic อยู่ใน `src/services/`
- ใช้ parameterized queries (`$1, $2`) เสมอ — ห้าม string concat SQL
- Auth: `verifyToken` + `verifyAdmin` สำหรับ admin routes
- Role จากอีเมล: ใช้ `resolveUserType()` ใน `src/utils/resolveUserType.ts`
- Audit log ฝั่ง server: ใช้ `auditLog.service.ts` ไม่พึ่ง frontend `saveLog()` อย่างเดียว
- Env config: ใช้ `src/config/env.ts` ไม่ hardcode secrets

### Frontend (`frontend/`)

- Vue 3 Composition API + `<script setup lang="ts">`
- ข้อความ UI ต้องผ่าน i18n (`$t()` / `useI18n`) — ทั้ง `th.ts` และ `en.ts`
- ข้อมูลจาก DB (ชื่อห้อง, สถานะ): ใช้ `src/utils/translator.ts`
- Admin routes: ต้องมี `meta: { requiresAdmin: true }` + guard ใน `router/index.ts`
- API calls: ใช้ `src/services/api.ts` (axios + credentials)

### ตัวอย่าง Role Policy

```text
@property.mfu.ac.th  → admin
@mfu.ac.th           → internal
อื่นๆ                → external
UAT override         → DEV_ADMIN_EMAILS ใน .env
```

---

## 3. Git & Commit
## 3. Git Rules

- **อย่า commit เอง** เว้นแต่ผู้ใช้สั่งชัดเจน ("commit", "push")
- **อย่า push --force** ไป main/master
- **อย่า amend** commit ที่ push แล้ว
- Commit message แบบ conventional: `feat:`, `fix:`, `chore:`, `docs:`
- อย่า commit: `.env`, credentials, `node_modules/`, `dist/`, `uploads/`

---

## 4. เอกสาร
## 4. Documentation Rules

### โฟลเดอร์ `docs/`

| ไฟล์ | หน้าที่ |
|------|---------|
| `planning.md` | แผน 8 Sprints |
| `requirements.md` | ข้อกำหนดระบบ |
| `schema.md` | Database schema |
| `UAT_TEST_SCENARIOS.md` | 65 test cases |
| `payment_gateway.md` | Payment adapters |
| `CITS_RUNBOOK.md` | Deploy / Docker |
| `GO_LIVE_CHECKLIST.md` | Checklist ก่อน go-live |

### โฟลเดอร์ `data/`

- เก็บข้อมูลอ้างอิง เช่น `room-pricing-rates.xlsx`
- **ห้ามลบ** โดยไม่ได้รับอนุญาต

### `AI_CHANGELOG.md`

- บันทึกทุกการเปลี่ยนแปลงสำคัญที่ AI ทำ
- ระบุวันที่, ไฟล์ที่แก้, และผลการทดสอบ

---

## 5. ความปลอดภัย
## 5. Security Rules

- **ห้าม** hardcode API keys, JWT secret, OAuth secrets ในโค้ด
- ใช้ `backend/.env` (local) และ `.env.production.example` (template)
- Cookie: `httpOnly: true`, `secure` ใน production
- `JWT_SECRET` ต้องตั้งใน production (`env.ts` จะ throw ถ้าไม่มี)
- `DEV_ADMIN_EMAILS` — ใช้เฉพาะ UAT/dev ไม่ใช้ production จริง
- `PAYMENT_PROVIDER=mock_sandbox` — UAT only, ไม่โอนเงินจริง
- Upload: validate file type (PDF memo, image slip) + size limit 10MB

---

## 6. การทดสอบ
## 6. Testing Rules

### ก่อน commit / หลังแก้โค้ดสำคัญ

```bash
cd backend && npm test && npm run typecheck
cd frontend && npm run typecheck
```

### เป้าหมาย

- Backend Vitest: ต้องผ่านทั้งหมด (ปัจจุบัน 170+ tests)
- TypeScript: 0 errors ทั้ง backend และ frontend
- แก้ bug → เพิ่ม/อัปเดต test ถ้าเกี่ยวข้อง

### UAT

- อ้างอิง `docs/UAT_TEST_SCENARIOS.md`
- บันทึกผลใน `docs/UAT_ROUND1_RESULTS.md`
- Bug ใช้ `docs/UAT_BUG_REPORT_TEMPLATE.md`

### E2E / Load

- Playwright: `frontend/e2e/`
- k6: `backend/scripts/k6-load-test.js`

---

## 7. Workflow & Sprint
## 7. Development Workflow

### กลยุทธ์: UAT-First

1. **Sprint 1–2** — ฟีเจอร์ครบ + integration tests ✅
2. **Sprint 3–4** — UAT กับผู้ใช้จริง → แก้ bug → sign-off
3. **Sprint 5–8** — Security, E2E, CI/CD, Deploy

### Payment (ปัจจุบัน)

- UAT: `PAYMENT_PROVIDER=mock_sandbox`
- Production (เมื่อพร้อม): `promptpay_manual` หรือ gateway ที่หน่วยงานเลือก
- ดู `docs/payment_gateway.md` ก่อนเปลี่ยน provider

### Deploy

- Local/Docker: `docs/CITS_RUNBOOK.md`
- ก่อน go-live: `docs/GO_LIVE_CHECKLIST.md`
- Seed production: `npm run seed:production` (ไม่ใช่ `seed:demo`)

---

## 8. UI / UX & i18n
## 8. UI/UX Rules

### ภาษา

- รองรับ **ไทย + อังกฤษ** เสมอ
- เพิ่ม key ใหม่ใน **ทั้ง** `frontend/src/i18n/locales/th.ts` และ `en.ts`
- Modal / SweetAlert ต้องใช้ `$t()` ไม่ hardcode ภาษาไทยใน template

### Branding MFU

- สีหลัก: `#ba0b2f` (MFU red)
- Logo: `frontend/public/images/mfu-logo.svg`
- อย่าเปลี่ยน branding โดยไม่ได้รับอนุญาต

### UX

- Loading state / skeleton ขณะโหลด API
- Empty state เมื่อไม่มีข้อมูล
- Error message จาก API แสดงให้ผู้ใช้เข้าใจ (ภาษาไทย)

---

## 9. Checklist ก่อนจบงานแต่ละรอบ
## 9. Session Completion Checklist

AI Agent ต้องตรวจก่อนสรุปงาน:

- [ ] Implementation plan ได้รับการอนุมัติ (ถ้างานใหญ่)
- [ ] โค้ดผ่าน `npm test` และ `npm run typecheck`
- [ ] อัปเดต `AI_CHANGELOG.md`
- [ ] อัปเดต `docs/*.md` ที่เกี่ยวข้อง
- [ ] ไม่ commit secrets หรือไฟล์ที่ไม่ควร commit
- [ ] สรุปให้ผู้ใช้ทราบว่าทำอะไรไป อะไรรอผู้ใช้/หน่วยงาน

---

## 10. อ้างอิงด่วน
## 10. Quick Reference

| หัวข้อ | ไฟล์ |
|--------|------|
| Quick start | `README.md` |
| Env ตัวอย่าง | `backend/.env.example` |
| Production env | `.env.production.example` |
| ประวัติการแก้ | `AI_CHANGELOG.md` |
| UAT test cases | `docs/UAT_TEST_SCENARIOS.md` |
| Security | `docs/SECURITY_CHECKLIST.md` |
| กฎ AI (ฉบับเต็ม) | `RULES.md` |
| Cursor auto-apply | `.cursor/rules/project-rules.mdc` |

---

*อัปเดตล่าสุด: 2026-09-01 — สร้างโดยทีมพัฒนา + AI Assistant*

## การเชื่อมกับ Cursor

ไฟล์ `.cursor/rules/project-rules.mdc` (`alwaysApply: true`) ชี้มาที่ `RULES.md` นี้ — Cursor Agent จะโหลดกฎอัตโนมัติทุก session
