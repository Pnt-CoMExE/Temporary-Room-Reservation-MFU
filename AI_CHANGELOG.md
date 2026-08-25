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

