# AI Assistant Log

This file tracks the actions, modifications, and updates performed by the AI Assistant on this project.

## [2026-06-06]
- Read the project proposal document: `Temporary Rental Space Management System of MFU.pdf`.
- Extracted requirements and created `requirements.md` detailing system objectives, user roles, and functional scope.
- Created `schema.md` detailing the PostgreSQL database tables, fields, and relationships based on the provided ER diagram and Data Dictionary.
- Generated `planning.md` containing a 3-month Agile sprint plan for Senior Project 2 (System Development and Deployment).
- Deleted outdated files: `AI_GUIDELINE.md` and `SUMMARY.md`.
- Initialized this `AI_CHANGELOG.md` file to keep a persistent record of AI actions moving forward.
## [2026-08-25]
- Developed Express.js TypeScript backend architecture with modular routes (`auth`, `room`, `booking`, `promo`, `addon`, `user`, `banner`, `admin`).
- Integrated Google OAuth 2.0 authentication and session/JWT verification middleware.
- Built database migration and initialization scripts for `banners`, `promo_codes`, and `admin_activity_logs`.
- Implemented Excel import service using `ExcelJS` to parse and insert room records and multi-tier pricing structures automatically.
- Developed Admin Analytics Dashboard endpoints (monthly revenue calculation, booking stats, promo code management, activity logs).
- Added comprehensive unit testing suite using `Vitest` for routes, services, and middleware.
- Conducted full project audit of all `.md` files against codebase implementation and updated `schema.md`, `AI_CHANGELOG.md`, and `vue-test/README.md`.
- Fixed `BookingView.vue` TypeScript type declarations, template null checks (`room?.image`), and refactored file upload template refs.
- Synchronized `userType` validation rules in `backend/src/middleware/validate.ts` to accept both `co_op` and `co_organizer` values seamlessly.
- Built Email Notification Service (`email.service.ts`) and integrated automatic submission and approval/disapproval status emails.
- Implemented PromptPay EMVCo QR code payload generator service (`promptpay.service.ts` / `promptpay.ts`) and integrated dynamic PromptPay QR code payment modal in user `DashboardView.vue`.
- Implemented Admin PDF Memorandum ZIP Export endpoint `POST /api/admin/bookings/export-zip` using `archiver` and batch download button in `AdminBookings.vue`.
- Expanded Vitest unit test suite to 93 passing tests across 6 test files.
- Fixed `archiver` v8 module import signature issue in `backend/src/routes/admin/booking.routes.ts` (`ZipArchive`).

## [2026-08-26]
- Installed `express-rate-limit` and created `rateLimiter.ts` middleware (`generalLimiter`, `authLimiter`, `bookingLimiter`) to protect backend APIs.
- Configured PostgreSQL index migration statements in `backend/app.ts` (`idx_bookings_date_slot`, `idx_bookings_user_id`, `idx_bookings_status`, `idx_users_email`, `idx_room_pricing_room_id`).
- Enhanced Vue frontend submit loading UX and button states in `BookingView.vue`.
- Developed 2-Month Production Deployment Plan (`implementation_plan.md` artifact and updated `planning.md`) addressing CITS Server & Payment provider constraints.
- Created Production Docker Infrastructure: `backend/Dockerfile`, `backend/.dockerignore`, `vue-test/Dockerfile`, `vue-test/nginx.conf`, `vue-test/.dockerignore`, `docker-compose.prod.yml`, and `.env.production.example`.
- Implemented Payment API Engine (`backend/src/routes/payment.routes.ts`) for PromptPay EMVCo QR code payload generation, Slip Upload middleware, and Admin Verification routes.
- Implemented Modular Payment Gateway Adapter Architecture (`payment.adapter.interface.ts`, `payment.manager.ts`).
- Created Payment Provider Adapters: `PromptPayAdapter`, `OpnPaymentAdapter` (Omise), `SCBPaymentAdapter`, `KBankPaymentAdapter`, `KTBPaymentAdapter`, and `MockPaymentAdapter` (Mock Sandbox for UAT).
- Updated Payment API Routes (`backend/src/routes/payment.routes.ts`) with `GET /api/payment/providers`, `POST /api/payment/checkout`, and `POST /api/payment/webhook/:provider`.
- Created comprehensive `payment_gateway.md` developer & admin configuration guide.
- Updated `.env.production.example`, `schema.md`, and `planning.md` with modular payment provider settings.
- Added unit test suite `backend/src/__tests__/payment_adapter.test.ts` covering provider resolution, standby fallback, and mock webhook verification.

## [2026-08-26 - Full-Site i18n & Dynamic Data Translation]
- **Official MFU Royal Crown Emblem Seal**: Updated logo images in `Navbar.vue`, `HomeView.vue`, and `LoginView.vue` to use the official high-resolution Royal Emblem Seal (`public/images/mfu-logo.png`).
- **Universal Data Translator Utility (`src/utils/translator.ts`)**: Built a robust dynamic translation engine with regex replacement rules covering 100% of all 100 database rooms, types, and locations (`translateRoomName`, `translateRoomType`, `translateLocation`, `translateDuration`, `translateStatus`).
- **User Dashboard & Logout Modal i18n (`DashboardView.vue` & `Navbar.vue`)**:
  - Converted Dashboard header, filter inputs (`Search Bookings`, `Start Date`, `End Date`), status badges, and booking card text to `$t(...)` and `translator.ts`.
  - Replaced static Thai strings in Logout SweetAlert modal dialog (`"ออกจากระบบ?"`, `"คุณต้องการออกจากระบบการจัดการพื้นที่ใช่หรือไม่?"`) with `$t('nav.logout_confirm_title')` and `$t('nav.logout_confirm_text')`.
- **Profile Tab Form i18n (`DashboardView.vue`)**: Converted all form headers (`Personal Profile`), read-only reference boxes, user role descriptions, input labels (`Full Name`, `Phone Number`), placeholders, and `Save Profile` submit button to `$t(...)` strings in `th.ts` and `en.ts`.
- **All Rooms & Spaces 8 Space Type Filter (`RoomListView.vue` & `HomeView.vue`)**: Expanded the Space Type search dropdown from 3 options to all 8 distinct database types (`Meeting Rooms`, `Lecture Halls`, `Seminar Rooms`, `Auditoriums & Grand Halls`, `Laboratories & Computer Labs`, `Sports Centers & Fields`, `Outdoor & Event Plazas`, `Buildings & Facilities`).
- **Bilingual Room Search**: Integrated bilingual search filtering in `RoomListView.vue` allowing users to search room names in both Thai and English.



## [2026-08-27 — Sprint 1 Completion & Plan Revision]

### Sprint 1 Gap Fixes (Infrastructure)
- **Redis Integration**: Installed `ioredis` + `rate-limit-redis`; created `backend/src/redisClient.ts` singleton with graceful fallback (memory store when Redis unavailable in dev/test). Updated `rateLimiter.ts` to use Redis store in production (when `REDIS_URL` is set) and memory store in test/dev.
- **Automated Backup Script**: Created `backend/scripts/backup.sh` — runs `pg_dump`, compresses with gzip, and auto-deletes backups older than 30 days.
- **TypeScript Production Build**: Added `npm run build` script (`tsc` → `dist/`); updated `backend/Dockerfile` to compile TypeScript and run `node dist/server.js` instead of `tsx` in production.
- **Nginx HTTPS**: Updated `vue-test/nginx.conf` — added HTTP→HTTPS redirect server block, full HTTPS server block with TLS 1.2/1.3, HTTP/2, Let's Encrypt certbot ACME path, and `/uploads/` proxy.
- **Backend `.gitignore`**: Added `dist/`, `.env`, `backups/`, `uploads/` to prevent committing compiled JS and secrets.
- **Vitest Config**: Updated `vitest.config.ts` to set `NODE_ENV=test` and `VITEST=true` env vars + `pool: 'forks'` for test isolation.
- **Unit Tests**: Fixed test hang caused by Redis connection in test environment. All **105/105 tests now pass** (up from 93).

### Plan Revision (Per Advisor Recommendation)
- Revised `planning.md` from "Deploy-First" to **"UAT-First" strategy**:
  - **Month 1** now focuses on Feature Completion + Full UAT (all modules) across 4 sprints.
  - **Month 2** covers Security Hardening, Payment Finalization, CI/CD Pipeline, and Go-Live Deployment.
  - Rationale: complete UAT first catches user-reported bugs before production deployment, avoiding costly rework.

## [2026-08-30 — Sprint 1 Frontend Completion]

### Backend (New)
- **`backend/src/routes/admin/user.routes.ts` [NEW]**: Admin User Management API (`GET /api/admin/users`, `PUT /api/admin/users/:id/role`)
- **`backend/app.ts`**: mount `adminUserRoutes` ที่ `/api/admin/users`

### Frontend — Admin (New Files)
- **`AdminUsers.vue` [NEW]**: หน้าจัดการผู้ใช้ — ตาราง users, Avatar, Role Badge, สถิติการจอง, Search/Filter by role, เปลี่ยน Role, Loading skeleton, Empty state
- **`AdminPromoCodes.vue` [NEW]**: แยก Promo Code management ออกจาก AdminBanners — Stats cards, Search/Filter, Table + progress bar, Toggle สถานะ, Loading skeleton, Empty state

### Frontend — Admin (Modified)
- **`AdminDashboardView.vue`**: เพิ่ม tabs "จัดการผู้ใช้" และ "รหัสส่วนลด" ใน sidebar; จัดลำดับ tabs ใหม่ทั้งหมด

### Frontend — User Views (Enhanced)
- **`HomeView.vue`**: Skeleton cards ขณะโหลด Featured Rooms + Empty state
- **`RoomDetailView.vue`**: Error boundary/Not found state ถ้า room ไม่พบหรือ API ล้มเหลว

### Verification
- Frontend TypeScript: **0 errors** (`npx vue-tsc --noEmit`)
- Backend TypeScript: **0 errors** (`npx tsc --noEmit`)

## [2026-08-30 — Full-Site i18n Audit, Modal Translation Fixes & Planning Document Update]

### i18n System & Modal Dialogs (Enhanced)
- **Locale Dictionary Expansion (`th.ts` & `en.ts`)**:
  - เพิ่ม Keys ภาษาไทยและภาษาอังกฤษสำหรับ Modal Dialogs ทั้งหมด
  - `dashboard`: `scan_to_pay`, `net_total`, `scan_instruction`, `close_window`, `cancel_booking_*`, `review_*` (คะแนน 1-5 ดาว, คำอธิบาย, placeholder)
  - `booking`: `submit_success_title`, `submit_success_desc`, `go_to_dashboard`, `submit_error_title`
  - `room`: `no_featured_rooms`, `room_not_found_title`, `room_not_found_desc`, `back_to_all_rooms`
- **Dynamic Translation Integration (`useI18n`)**:
  - **`DashboardView.vue`**: แปลง SweetAlert Modal ทั้งหมด (PromptPay QR Payment, ยกเลิกการจอง, รีวิวความพึงพอใจ 5 ดาว) ให้ใช้ dynamic translation `t(...)`
  - **`BookingView.vue`**: แปลง SweetAlert Submit Success & Error Modals ให้ใช้ `t(...)`
  - **`AdminDashboardView.vue`**: แปลง SweetAlert Logout Confirmation Modal ให้ใช้ `t(...)`
  - **`HomeView.vue` & `RoomDetailView.vue`**: แปลง Empty State และ Error Boundary ให้ใช้ `$t(...)`

### Documentation Update
- **`planning.md`**: ปรับปรุงเอกสารแผนงาน 2 เดือน (8 Sprints) ให้เป็น**ภาษาไทย 100%** ทั้งหมดตามคำแนะนำ พร้อมอัปเดตสถานะของ Sprint 1 เป็น **เสร็จสมบูรณ์ (Completed)**
- **Verification**: `npx vue-tsc --noEmit` ผ่าน 0 errors

## [2026-08-31 — Sprint 2 Completion: Integration Testing & UAT Demo Preparation]

### Backend — Integration Test Suite (New Test Files)
- **`backend/src/__tests__/integration.test.ts` [NEW]**: ชุดทดสอบ Integration 33 tests ครอบคลุม:
  - Health Check Flow: ทดสอบ public endpoints 6 routes (rooms, addons, banners, featured-rooms, payment/providers)
  - Authentication & Authorization: ทดสอบ JWT token validation, 401/403 rejection, admin route protection
  - Booking Creation: ทดสอบ validation (memoDocument required, userType, timeSlot, bookingDate format, non-PDF rejection)
  - Admin Booking Management: ทดสอบ GET/PUT admin bookings, export-zip validation
  - Payment Flow: ทดสอบ PromptPay QR generation, slip upload, payment verify (auth + input validation)
  - Promo Code Validation, Room Detail, Webhook endpoint

- **`backend/src/__tests__/api-healthcheck.test.ts` [NEW]**: ชุดทดสอบ API Health Check 25 tests:
  - Route Mounting: ตรวจสอบ public (5), auth (5), admin (6) routes mount ถูกต้อง
  - Middleware Chain: ตรวจสอบ Helmet security headers, CORS, JSON parsing, Rate Limiter, Static file serving
  - Error Handler Format: ตรวจสอบ response format `{ message: '...' }` สำหรับ 400/401/403

### Backend — Unified Demo Seed Script
- **`backend/seed-demo.ts` [NEW]**: สคริปต์ seed ข้อมูล UAT Demo ครบทุกตาราง:
  - Users (5 คน): Admin, Internal Staff ×2, Student, External — พร้อม avatar และ phone number
  - Rooms (8 ห้อง): ครอบคลุมทุก 8 ประเภท (Meeting Room, Lecture Hall, Seminar, Auditorium, Lab, Sports, Event Plaza, Building)
  - Room Pricing: 3-tier (internal/co-organizer/external) คำนวณตาม capacity
  - Addons (5 รายการ), Promo Codes (3 รหัส), Banners (3 แบนเนอร์)
  - Sample Bookings (5 รายการ): pending, approved, disapproved, pending_verification
  - Activity Logs (4 รายการ), Feedbacks (1 รีวิว 5 ดาว)
  - แสดงสรุปข้อมูลและบัญชี demo login ทุกครั้งที่รัน
- **`backend/package.json`**: เพิ่ม `"seed:demo": "tsx seed-demo.ts"`

### Documents — UAT Test Scenarios
- **`documents/UAT_TEST_SCENARIOS.md` [NEW]**: เอกสารสถานการณ์ทดสอบ UAT **65 Test Cases** แบ่ง 4 ส่วน:
  - ส่วนที่ 1 — ผู้ใช้ทั่วไป: 28 test cases (Authentication, Room Browsing, Booking, Dashboard, Profile)
  - ส่วนที่ 2 — ผู้ดูแลระบบ: 22 test cases (Dashboard, Booking Management, Rooms, Banners, Promo Codes, Users, Logs)
  - ส่วนที่ 3 — ระบบภาษา i18n: 7 test cases (TH/EN switching, Modal translation, Dynamic data translation)
  - ส่วนที่ 4 — Edge Cases: 8 test cases (404, Token expiry, File validation, Responsive, Email)

### Documentation Update
- **`planning.md`**: อัปเดตสถานะ Sprint 2 เป็น **เสร็จสมบูรณ์ (Completed)**

### Verification
- Backend TypeScript: **0 errors** (`npx tsc --noEmit`)
- Frontend TypeScript: **0 errors** (`npx vue-tsc --noEmit`)
- Unit + Integration Tests: **163/163 Tests ผ่านทั้งหมด** (เพิ่มจาก 105 → 163, +58 tests ใหม่)

## [2026-08-31 — Project Reorganization & Enterprise Structure Standardization]

### Architecture & Folder Reorganization
- **`frontend/` [RENAMED from `vue-test`]**: เปลี่ยนชื่อโฟลเดอร์ให้เป็นมาตรฐานอุตสาหกรรม พร้อมอัปเดต paths ใน `docker-compose.prod.yml`, `.github/workflows/ci.yml`, และ `frontend/package.json`.
- **`docs/` [NEW CENTRALIZED DOCS]**: รวบรวมเอกสารทั้งหมดเข้ามาไว้ในโฟลเดอร์เดียวและจัดหมวดหมู่ชัดเจน:
  - `docs/planning.md`, `docs/requirements.md`, `docs/schema.md`, `docs/features.md`, `docs/payment_gateway.md`, `docs/UAT_TEST_SCENARIOS.md`
  - `docs/proposals/`: เอกสารข้อเสนอโครงการและแบบประเมิน (`project-proposal.pdf`, `project-with-com.docx`, etc.)
  - `docs/presentations/`: สคริปต์นำเสนอ (`online-presentation-script.pdf`, `presentation-script.docx`)
  - `docs/diagrams/`: ER Diagram และ Data Dictionary (`er-diagram.pgerd`, `data-dictionary.xlsx`, `screenshots/`)
  - `docs/drafts/`: เอกสารร่างประกอบการพัฒนา (`not-finish.docx`, `workbook-draft.xlsx`)
- **`data/` [RENAMED from `Data Set`]**: เปลี่ยนชื่อโฟลเดอร์ชุดข้อมูลอัตราค่าบริการ (`room-pricing-rates.xlsx`).
- **`backend/scripts/` [CONSOLIDATED]**: รวมสคริปต์ seed data, clear database, backup, และ k6 load test ไว้ในโฟลเดอร์ scripts พร้อมปรับปรุง import paths และ npm commands (`seed:demo`, `seed`, `clear:db`).

### Code Fixes & Optimization
- **`BookingView.vue`**: แก้ไขข้อผิดพลาด duplicate import ของ `useI18n` ทำให้ Vite Production Build ผ่านสมบูรณ์ (`npm run build`).
- **`payment.routes.ts`**: แก้ไข path uploadsDir จาก 3 levels (`../../../uploads`) ให้เป็น 2 levels (`../../uploads`) เพื่อจัดเก็บไฟล์สลิปไว้ใน `backend/uploads/` อย่างถูกต้อง และลบโฟลเดอร์ `uploads/` ซ้ำซ้อนที่ root.
- **`README.md` [NEW]**: สร้างเอกสาร README หลักของโปรเจกต์อย่างละเอียด พร้อม Tech Stack Badges, โครงสร้างโปรเจกต์, Quickstart, Demo Credentials, และลิงก์เอกสาร.
- **`.gitignore`**: อัปเดตรายการ ignore ให้ตรงกับโครงสร้างใหม่.

### Verification
- Backend Unit & Integration Tests: **163/163 passed**
- Backend TypeScript Check: **0 errors**
- Frontend TypeScript Check: **0 errors**
- Frontend Production Build: **Success (0 errors)**

