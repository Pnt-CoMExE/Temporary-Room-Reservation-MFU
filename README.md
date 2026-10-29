# MFU Temporary Space Reservation System

[![CI — Typecheck & Build](https://github.com/Pnt-CoMExE/Temporary-Room-Reservation-MFU/actions/workflows/ci.yml/badge.svg)](https://github.com/Pnt-CoMExE/Temporary-Room-Reservation-MFU/actions/workflows/ci.yml)
[![Node Version](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)
[![Vue 3](https://img.shields.io/badge/Vue.js-3.5-4FC08D?logo=vue.js)](https://vuejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)

Web system for searching, booking, approving, and paying for temporary rental spaces at Mae Fah Luang University — with an admin dashboard for asset management.

**Full docs map:** [`docs/README.md`](docs/README.md)  
**This README** is the handover guide: set up env, seed data, run locally/Docker, and ship a usable site.

---

## Contents

1. [Prerequisites](#1-prerequisites)
2. [Clone and install](#2-clone-and-install)
3. [Configure `.env` (required)](#3-configure-env-required)
4. [Database + seed / import rooms](#4-database--seed--import-rooms)
5. [Run development](#5-run-development)
6. [Run with Docker (near-production)](#6-run-with-docker-near-production)
7. [Roles / Admin / payments](#7-roles--admin--payments)
8. [Handover checklist (site ready to use)](#8-handover-checklist-site-ready-to-use)
9. [Tests and build](#9-tests-and-build)
10. [Project layout (short)](#10-project-layout-short)
11. [Reference docs](#11-reference-docs)
12. [Troubleshooting](#12-troubleshooting)

---

## 1) Prerequisites

| Item | Notes |
|------|--------|
| **Node.js 22.x** | Same LTS as CI |
| **npm** | Bundled with Node |
| **PostgreSQL 16** | Local or Docker |
| **Git** | Clone from GitHub |
| **Google Cloud account** | OAuth 2.0 client for login |
| **Docker Desktop** (recommended) | Full UAT stack |
| **Stripe test keys** (if not using mock) | See [`docs/payment/STRIPE.md`](docs/payment/STRIPE.md) |

---

## 2) Clone and install

```bash
git clone https://github.com/Pnt-CoMExE/Temporary-Room-Reservation-MFU.git
cd Temporary-Room-Reservation-MFU

cd backend
npm install

cd ../frontend
npm install
```

---

## 3) Configure `.env` (required)

### 3.1 Backend (required for `npm run dev`)

```bash
cd backend
cp .env.example .env
# Windows PowerShell:
# Copy-Item .env.example .env
```

Edit `backend/.env` — **never commit a real `.env` file**.

| Variable | Required? | Meaning / suggested value |
|----------|-----------|---------------------------|
| `PORT` | Yes | API port (default `3000`) |
| `JWT_SECRET` | Yes | Long random string — do not use the example value in production |
| `FRONTEND_URL` | Yes | Vue origin, e.g. `http://localhost:5173` |
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD` | Yes | Running PostgreSQL |
| `GOOGLE_CLIENT_ID` | Yes | Google Cloud Console → OAuth client |
| `GOOGLE_CLIENT_SECRET` | Yes | Google Cloud Console |
| `GOOGLE_CALLBACK_URL` | Yes | Must match Authorized redirect URI, e.g. `http://localhost:3000/api/auth/google/callback` |
| `PAYMENT_PROVIDER` | Yes | Fast UAT: `mock_sandbox` · Stripe test: `stripe` |
| `STRIPE_SECRET_KEY` | If Stripe | `sk_test_…` |
| `STRIPE_PUBLISHABLE_KEY` | If Stripe | `pk_test_…` |
| `STRIPE_WEBHOOK_SECRET` | Recommended with webhooks | `whsec_…` |
| `DEV_ADMIN_EMAILS` | UAT | Google emails that become Admin on login (comma-separated) |
| `DEV_INTERNAL_EMAILS` | UAT | Force `internal` when you lack `@mfu.ac.th` |
| `SMTP_*` / `EMAIL_FROM` | Optional | If unset → email logs to console |
| `REDIS_URL` | Optional | If unset → memory store for session / rate-limit |

Detailed walkthrough: [`docs/ops/SETUP_FROM_ENV_EXAMPLE.md`](docs/ops/SETUP_FROM_ENV_EXAMPLE.md)

### 3.2 Google OAuth (short steps)

1. Open [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials  
2. Create an **OAuth 2.0 Client ID** (Web application)  
3. Authorized JavaScript origins: `http://localhost:5173` (plus real domain when deploying)  
4. Authorized redirect URIs: same value as `GOOGLE_CALLBACK_URL`  
5. Put Client ID / Secret into `backend/.env`

### 3.3 Production / Docker env

```bash
cp .env.production.example .env.production
```

At minimum set: `POSTGRES_PASSWORD`, `JWT_SECRET`, `SESSION_SECRET`, Google OAuth, `FRONTEND_URL`, `GOOGLE_CALLBACK_URL`, `PAYMENT_PROVIDER`  

Deploy guides: [`docs/ops/CITS_RUNBOOK.md`](docs/ops/CITS_RUNBOOK.md) · [`docs/ops/GO_LIVE_CHECKLIST.md`](docs/ops/GO_LIVE_CHECKLIST.md)

---

## 4) Database + seed / import rooms

### 4.1 Create the database

Create an empty PostgreSQL database matching `DB_NAME` in `.env` (e.g. `room_booking_db`).  
On first backend start, the app creates/updates required tables from `backend/scripts/init-schema.sql` and migrations in `app.ts`.

To apply SQL manually:

```bash
psql -U postgres -d room_booking_db -f backend/scripts/init-schema.sql
```

(If needed for add-on images: `backend/scripts/migrate-addons-image-url.sql`)

### 4.2 Import real rooms (recommended for demo / handover)

```bash
cd backend
npm run import:rooms
```

- Reads `data/room-pricing-rates.xlsx` (~**96 rooms**)  
- Excel is source of truth (upsert + prune rooms not in the file)  
- Custom file: `npm run import:rooms -- ../data/custom.xlsx`

### 4.3 Demo data (UAT)

```bash
cd backend
npm run seed:demo
```

Creates sample users / add-ons / promos (skips creating demo rooms if ≥ 50 rooms already exist, to avoid clashing with Excel).

Other seeds:

```bash
npm run seed:production        # production-like starter set
npm run seed:revenue-history   # historical bookings for revenue charts
```

---

## 5) Run development

```bash
# Terminal 1 — API
cd backend
npm run dev

# Terminal 2 — Vue
cd frontend
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000/api |

Open the site → sign in with a Google account listed in `DEV_ADMIN_EMAILS` if you need Admin immediately.

---

## 6) Run with Docker (near-production)

```bash
cp .env.production.example .env.production
# Set Google OAuth + secrets

# Start Docker Desktop first
docker compose -f docker-compose.prod.yml -f docker-compose.local.yml --env-file .env.production up -d --build
```

| Service | URL |
|---------|-----|
| Web (Nginx) | http://localhost:8080 |
| API via proxy | http://localhost:8080/api |

Import rooms into the Docker DB (local compose often uses port `5433`):

```bash
cd backend
# PowerShell example
$env:DB_HOST="localhost"; $env:DB_PORT="5433"; $env:DB_NAME="mfu_reservation"; $env:DB_USER="mfu_admin"; $env:DB_PASSWORD="mfu_local_docker_2026"; npm run import:rooms
npm run seed:demo
```

Docker UAT checklist: [`docs/testing/UAT_DOCKER_CHECKLIST.md`](docs/testing/UAT_DOCKER_CHECKLIST.md)

---

## 7) Roles / Admin / payments

### Role from email

| Domain / rule | Role |
|---------------|------|
| Exact `@mfu.ac.th` | `internal` |
| `@lamduan.mfu.ac.th` and other domains | `external` |
| Promote in Admin → Users | `admin` (**`@mfu.ac.th` only**) |
| `DEV_ADMIN_EMAILS` | Bootstrap Admin for UAT |
| `DEV_INTERNAL_EMAILS` | Force `internal` |

### Payments (UAT → production-ready)

| Mode | Setting | When to use |
|------|---------|-------------|
| **Mock** | `PAYMENT_PROVIDER=mock_sandbox` | Demo / UAT without real money |
| **Stripe Test** | `PAYMENT_PROVIDER=stripe` + `sk_test_` / `pk_test_` | Real gateway testing |
| **Stripe Live** | `sk_live_` + HTTPS + webhook | Real production — see [`docs/payment/STRIPE.md`](docs/payment/STRIPE.md) |

### Sample promo codes (after seed)

Depends on DB contents — check Admin → Promo Codes.  
(Seed may include codes such as `MFUWELCOME` / `STUDENT10` — discounts are **percent** in the current system.)

---

## 8) Handover checklist (site ready to use)

Use when handing the project to another team / unit, or before going live.

### A. Code and repo

- [ ] Clone from GitHub succeeds · `npm install` in both `backend` and `frontend`
- [ ] `backend/.env` created from `.env.example` (or `.env.production` for Docker)
- [ ] **No** real `.env` / secrets / `uploads/` committed

### B. External services

- [ ] Google OAuth works (login succeeds)
- [ ] Callback URL matches the domain you will open
- [ ] Payment mode chosen: mock or Stripe test/live per policy
- [ ] (If available) MFU SMTP for notification email

### C. Data

- [ ] Rooms imported from Excel (`npm run import:rooms`)
- [ ] Prices / room types look correct on the site
- [ ] At least one Admin (`DEV_ADMIN_EMAILS` or promote `@mfu.ac.th`)
- [ ] Promos / add-ons configured as needed

### D. Quality gates before handover

```bash
cd backend && npm test && npm run typecheck
cd ../frontend && npm run typecheck && npm run build
```

- [ ] Main flow: Login → find room → book + attach PDF → Admin approve + pick rate → pay → status updates
- [ ] Test evidence: [`docs/testing/TEST_CASE_TRACKER.md`](docs/testing/TEST_CASE_TRACKER.md)

### E. Production / server

- [ ] Follow [`docs/ops/GO_LIVE_CHECKLIST.md`](docs/ops/GO_LIVE_CHECKLIST.md)
- [ ] Schedule DB backup: [`docs/ops/BACKUP_RESTORE.md`](docs/ops/BACKUP_RESTORE.md)
- [ ] Daily booking-status job: `cd backend && npm run jobs:booking-status`
- [ ] Security checklist: [`docs/ops/SECURITY_CHECKLIST.md`](docs/ops/SECURITY_CHECKLIST.md)
- [ ] **Disable** `DEV_ADMIN_EMAILS` / `DEV_INTERNAL_EMAILS` / `RATE_LIMIT_DISABLED` in real production

### F. Suggested handover package

| Item | Location |
|------|----------|
| Code + this README | GitHub repo |
| Docs map | `docs/README.md` |
| Room pricing Excel | `data/room-pricing-rates.xlsx` |
| Env templates | `backend/.env.example`, `.env.production.example` |
| Stripe guide | `docs/payment/STRIPE.md` |
| Server runbook | `docs/ops/CITS_RUNBOOK.md` |

---

## 9) Tests and build

```bash
# Unit / integration
cd backend
npm test

# Typecheck
cd backend && npm run typecheck
cd ../frontend && npm run typecheck

# Production frontend build
cd frontend && npm run build
```

E2E (Playwright): see [`docs/testing/QA_AUTOMATION_GUIDE.md`](docs/testing/QA_AUTOMATION_GUIDE.md)

---

## 10) Project layout (short)

```
Temporary-Room-Reservation-MFU/
├── backend/                 # Express API (TypeScript)
│   ├── .env.example
│   ├── scripts/             # seed, import rooms, jobs, migrations
│   └── src/                 # routes, services, middleware
├── frontend/                # Vue 3 + Vite + i18n TH/EN
├── data/                    # room pricing Excel + import test files
├── docs/                    # start at docs/README.md
├── docker-compose.prod.yml
├── docker-compose.local.yml
├── .env.production.example
└── README.md                # this file
```

---

## 11) Reference docs

| Topic | Link |
|-------|------|
| Docs map | [`docs/README.md`](docs/README.md) |
| Setup from `.env.example` | [`docs/ops/SETUP_FROM_ENV_EXAMPLE.md`](docs/ops/SETUP_FROM_ENV_EXAMPLE.md) |
| Go-Live | [`docs/ops/GO_LIVE_CHECKLIST.md`](docs/ops/GO_LIVE_CHECKLIST.md) |
| CITS / Docker deploy | [`docs/ops/CITS_RUNBOOK.md`](docs/ops/CITS_RUNBOOK.md) |
| Stripe | [`docs/payment/STRIPE.md`](docs/payment/STRIPE.md) |
| DB schema | [`docs/product/schema.md`](docs/product/schema.md) |
| Features | [`docs/product/features.md`](docs/product/features.md) |
| Test Case Tracker | [`docs/testing/TEST_CASE_TRACKER.md`](docs/testing/TEST_CASE_TRACKER.md) |
| Team / AI rules | [`RULES.md`](RULES.md) |

---

## 12) Troubleshooting

| Symptom | Check |
|---------|--------|
| Google login fails | `GOOGLE_*` · callback URL · `FRONTEND_URL` · cookie / HTTPS |
| Cannot open Admin | Put email in `DEV_ADMIN_EMAILS` or promote an `@mfu.ac.th` account |
| DB connection fails | Is Postgres running? · `DB_*` · port 5432 vs 5433 (Docker) |
| No rooms in the app | `npm run import:rooms` |
| Payment UI broken | `PAYMENT_PROVIDER` · Stripe keys · see `STRIPE.md` |
| PDF attach / preview broken | `backend/uploads` folder · same origin via Vite proxy or Docker |
| Email not delivered | SMTP unset → check backend console logs |

---

## Tech stack (summary)

| Layer | Stack |
|-------|--------|
| Frontend | Vue 3, Vite, TypeScript, Tailwind, Vue-i18n, Chart.js |
| Backend | Node.js, Express 5, TypeScript, PostgreSQL, Redis (optional) |
| Auth | Google OAuth 2.0, JWT (HttpOnly cookie) |
| Payment | Stripe (+ `mock_sandbox` for UAT) |
| Deploy | Docker Compose, Nginx, GitHub Actions CI |

---

© Temporary Space Reservation System — Mae Fah Luang University
