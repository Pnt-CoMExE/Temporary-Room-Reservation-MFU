# ระบบบริหารจัดการพื้นที่เช่าชั่วคราว มหาวิทยาลัยแม่ฟ้าหลวง (MFU Space Reservation)

[![CI — Typecheck & Build](https://github.com/Pnt-CoMExE/Temporary-Room-Reservation-MFU/actions/workflows/ci.yml/badge.svg)](https://github.com/Pnt-CoMExE/Temporary-Room-Reservation-MFU/actions/workflows/ci.yml)
[![Node Version](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)
[![Vue 3](https://img.shields.io/badge/Vue.js-3.5-4FC08D?logo=vue.js)](https://vuejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)

ระบบบริหารจัดการและขอใช้พื้นที่เช่าชั่วคราว มหาวิทยาลัยแม่ฟ้าหลวง พัฒนาขึ้นเพื่ออำนวยความสะดวกแก่นักศึกษา บุคลากรภายใน และบุคคลภายนอก ในการค้นหา ตรวจสอบตารางเวลา ขออนุมัติใช้พื้นที่ และชำระเงิน พร้อมระบบแดชบอร์ดสำหรับผู้ดูแลระบบส่วนจัดการทรัพย์สิน

---

## 📂 โครงสร้างไดเรกทอรี (Project Structure)

```
MFU-Space-Reservation/
├── backend/                          # Express.js REST API (TypeScript)
│   ├── src/
│   │   ├── middleware/               # Auth, Rate Limiter, Validator, Error Handler
│   │   ├── routes/                   # Modular API endpoints (User, Room, Booking, Payment, Admin)
│   │   ├── services/                 # Email, PDF generation, PromptPay, Payment Gateway Adapters
│   │   ├── types/                    # TypeScript interfaces & types
│   │   ├── utils/                    # Shared utilities (resolveUserType, etc.)
│   │   └── __tests__/                # Vitest unit & integration test suites
│   ├── .env.example                  # ตัวอย่าง Environment variables สำหรับ Development/UAT
│   ├── scripts/                      # DB Migration, Seed scripts, Backup, k6 Load tests
│   ├── app.ts                        # Express App & Route registration
│   ├── server.ts                     # HTTP Server entry point
│   ├── db.ts                         # PostgreSQL Connection Pool
│   ├── Dockerfile                    # Production Backend Container
│   └── package.json
│
├── frontend/                         # Vue 3 Single Page Application (Vite + TypeScript)
│   ├── src/
│   │   ├── assets/                   # Static images & global CSS
│   │   ├── components/               # Reusable UI components (Navbar, RoomCard, Dialogs)
│   │   ├── composables/              # Vue Composables (Toast, etc.)
│   │   ├── i18n/                     # Bilingual dictionary (TH / EN)
│   │   ├── layouts/                  # UserLayout & AdminLayout
│   │   ├── router/                   # Vue Router with auth guards & dynamic metadata
│   │   ├── services/                 # Axios API service & PromptPay generator
│   │   ├── utils/                    # Universal data translator engine
│   │   └── views/                    # Pages: users/ (Home, Rooms, Booking, Dashboard) & admin/
│   ├── public/                       # Favicon & assets
│   ├── Dockerfile                    # Production Nginx Container
│   └── package.json
│
├── docs/                             # เอกสารข้อกำหนดและการออกแบบระบบ
│   ├── planning.md                   # แผนงานโครงการ 8 Sprints (Agile UAT-First Strategy)
│   ├── requirements.md               # ข้อกำหนดระบบและบทบาทผู้ใช้
│   ├── schema.md                     # Database Schema Design & Indexes
│   ├── features.md                   # รายการฟีเจอร์และฟังก์ชันการทำงาน
│   ├── payment_gateway.md            # คู่มือระบบ Modular Payment Gateway
│   ├── UAT_TEST_SCENARIOS.md         # เอกสารสถานการณ์ทดสอบ UAT 65 Test Cases
│   ├── proposals/                    # เอกสารข้อเสนอและรายงานโครงการ (.docx / .pdf)
│   ├── presentations/                # สคริปต์นำเสนอ (.docx / .pdf)
│   ├── diagrams/                     # ER Diagram & Data Dictionary
│   └── drafts/                       # เอกสารร่างประกอบการพัฒนา
│
├── data/                             # ชุดข้อมูลอ้างอิง
│   └── room-pricing-rates.xlsx       # ตารางอัตราค่าบริการพื้นที่ มฟล.
│
├── .github/workflows/ci.yml          # GitHub Actions CI/CD Pipeline
├── docker-compose.prod.yml           # Production Multi-container Setup (DB + Redis + Backend + Frontend + Nginx)
├── docker-compose.local.yml          # Override สำหรับทดสอบ localhost (HTTP พอร์ต 8080, init schema)
├── .env.production.example           # ตัวอย่าง Environment variables สำหรับ Production
└── README.md
```

---

## 🛠️ เทคโนโลยีที่ใช้งาน (Tech Stack)

| ส่วนของระบบ | เทคโนโลยีที่ใช้ |
|---|---|
| **Frontend** | Vue 3 (Composition API), Vite, TypeScript, TailwindCSS, FontAwesome, Chart.js, SweetAlert2, Vue-i18n |
| **Backend** | Node.js, Express 5, TypeScript, PostgreSQL (pg pool), Redis (ioredis), Multer, PDFKit, Archiver |
| **Authentication** | Google OAuth 2.0 (Passport.js), JWT, HttpOnly Cookies |
| **Payment Engine** | Modular Gateway (PromptPay EMVCo, Opn/Omise, SCB, KBank, KTB, Mock Sandbox) |
| **Testing** | Vitest, Supertest, Playwright E2E, k6 Load Testing |
| **DevOps & Deploy** | Docker, Docker Compose, Nginx (Reverse Proxy & SSL), Let's Encrypt Certbot, GitHub Actions |

---

## 🚀 การติดตั้งและรันระบบ (Quick Start)

### 1. ติดตั้ง Dependencies

```bash
# ติดตั้ง Backend dependencies
cd backend
npm install

# ติดตั้ง Frontend dependencies
cd ../frontend
npm install
```

### 2. ตั้งค่า Environment Variables

คัดลอก `backend/.env.example` เป็น `backend/.env` แล้วกรอกค่าจริง:

```bash
cp backend/.env.example backend/.env   # Windows: copy backend\.env.example backend\.env
```

ค่าสำคัญสำหรับ UAT:

```env
PAYMENT_PROVIDER=mock_sandbox          # จำลองชำระเงิน ไม่โอนเงินจริง
# DEV_ADMIN_EMAILS=your@gmail.com    # ใส่อีเมล Google ของคุณเพื่อทดสอบหน้า Admin
```

### 3. นำเข้าข้อมูลเริ่มต้น (Seed / Import)

```bash
cd backend

# นำเข้าห้องจริงจาก Excel ของหน่วยทรัพย์สิน (96 ห้อง จาก data/room-pricing-rates.xlsx)
npm run import:rooms

# หรือนำเข้าข้อมูลตัวอย่างครบวงจรสำหรับทดสอบ UAT (8 ห้อง, 5 ผู้ใช้, 5 การจอง, 3 รหัสส่วนลด)
npm run seed:demo
```

ไฟล์ Excel อยู่ที่ `data/room-pricing-rates.xlsx` — สามารถระบุ path อื่นได้: `npm run import:rooms -- ../data/custom.xlsx`

### 4. รันระบบสำหรับ Development

```bash
# รัน Backend (Terminal 1)
cd backend
npm run dev

# รัน Frontend (Terminal 2)
cd frontend
npm run dev
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:3000/api](http://localhost:3000/api)

### 5. ทดสอบด้วย Docker (Local)

```bash
# คัดลอก env สำหรับ Docker แล้วแก้ GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
cp .env.production.example .env.production

# เปิด Docker Desktop ก่อน แล้วรัน stack (HTTP ที่พอร์ต 8080)
docker compose -f docker-compose.prod.yml -f docker-compose.local.yml --env-file .env.production up -d --build

# นำเข้าห้องจาก Excel เข้า PostgreSQL ใน Docker (พอร์ต 5433)
cd backend
$env:DB_HOST="localhost"; $env:DB_PORT="5433"; $env:DB_NAME="mfu_reservation"; $env:DB_USER="mfu_admin"; $env:DB_PASSWORD="mfu_local_docker_2026"; npm run import:rooms

# (ถ้าต้องการ) seed demo users, addons, promo codes
npm run seed:demo
```

- **Frontend (Docker):** [http://localhost:8080](http://localhost:8080)
- **API:** [http://localhost:8080/api/rooms](http://localhost:8080/api/rooms)
- **UAT Checklist:** [docs/UAT_DOCKER_CHECKLIST.md](docs/UAT_DOCKER_CHECKLIST.md)

---

## 🧪 การทดสอบ (Testing)

```bash
# รัน Unit & Integration Tests (170/170 passed)
cd backend
npm test

# ตรวจสอบ TypeScript ทั้งระบบ
cd backend && npm run typecheck
cd ../frontend && npm run typecheck

# ทดสอบ Production Build
cd frontend && npm run build
```

---

## 🔑 บัญชีและรหัสส่วนลดสำหรับทดสอบ (Demo Credentials)

| บทบาท | อีเมล | สิทธิ์ในระบบ |
|---|---|---|
| **ผู้ดูแลระบบ (Admin)** | `admin.demo@property.mfu.ac.th` | เข้าถึง Admin Dashboard & จัดการคำขอ |
| **บุคลากรภายใน (Staff)** | `wichai.staff@mfu.ac.th` | จองพื้นที่ในอัตราบุคลากรภายใน |
| **นักศึกษา (Student)** | `piya.student@lamduan.mfu.ac.th` | จองพื้นที่ในอัตรานักศึกษา (external ในระบบจริง) |
| **บุคคลภายนอก (External)** | `john.external@company.com` | จองพื้นที่ในอัตราบุคคลภายนอก |

**การกำหนด Role จากอีเมลจริง:**
- `@property.mfu.ac.th` → Admin (ส่วนทรัพย์สิน)
- `@mfu.ac.th` → Internal (บุคลากรภายใน)
- อื่นๆ → External

**สำหรับ UAT โดยไม่มีอีเมลหน่วยงาน:** ตั้ง `DEV_ADMIN_EMAILS=your@gmail.com` ใน `backend/.env`

**รหัสโปรโมชั่นทดสอบ:**
- `MFUWELCOME` — ส่วนลด 100 บาท (ใช้ได้ 200 ครั้ง)
- `PROMO2026` — ส่วนลด 200 บาท (ใช้ได้ 100 ครั้ง)
- `STUDENT10` — ส่วนลด 50 บาท (ใช้ได้ 500 ครั้ง)

---

## 📚 เอกสารประกอบ (Documentation)

- [แผนการดำเนินงาน 8 Sprints (planning.md)](docs/planning.md)
- [ข้อกำหนดระบบ (requirements.md)](docs/requirements.md)
- [โครงสร้างฐานข้อมูล (schema.md)](docs/schema.md)
- [สถาปัตยกรรม Payment Gateway (payment_gateway.md)](docs/payment_gateway.md)
- [สถานการณ์ทดสอบ UAT 65 Test Cases (UAT_TEST_SCENARIOS.md)](docs/UAT_TEST_SCENARIOS.md)
- [UAT Docker Checklist — E2E local (UAT_DOCKER_CHECKLIST.md)](docs/UAT_DOCKER_CHECKLIST.md)
- [ผลทดสอบ UAT Docker รอบล่าสุด (UAT_DOCKER_ROUND_RESULTS.md)](docs/UAT_DOCKER_ROUND_RESULTS.md)
- [CITS Runbook & Docker Deploy (CITS_RUNBOOK.md)](docs/CITS_RUNBOOK.md)
- [Go-Live Checklist (GO_LIVE_CHECKLIST.md)](docs/GO_LIVE_CHECKLIST.md)
- [Security Checklist (SECURITY_CHECKLIST.md)](docs/SECURITY_CHECKLIST.md)
