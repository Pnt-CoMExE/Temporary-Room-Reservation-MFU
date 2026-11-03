# Recommended Additional Features

Here are several proposed features to elevate the Temporary Rental Space Management System of MFU beyond its core requirements, improving user experience, administrative efficiency, and modernity.

## 1. User Experience Enhancements
- **Multi-Language Support (i18n):** Provide seamless switching between Thai and English to support international students, staff, and foreign external companies.
- **Interactive 360° Virtual Tours / Galleries:** Allow users to view high-quality 360° photos or virtual tours of the rooms before making a booking decision.
- **Smart Room Recommendations:** If a requested room is already booked for a specific time slot, the system automatically suggests alternative available rooms with similar capacity and equipment.
- **Calendar Integration (Google Calendar & .ics):** Upon approval, users receive a calendar invite link to instantly add the event to their Google Calendar, Outlook, or Apple Calendar.

## 2. Operational & Administrative Efficiency
- **Automated PDF Invoice/Receipt Generation:** Automatically generate and email official PDF tax invoices or receipts to users upon successful payment.
- **Digital QR Code Check-in/Check-out:** Issue a digital QR code pass to the user upon approval. They can scan this at the venue or with campus security to confirm their arrival and departure.
- **Real-Time Inventory Tracking for Add-ons:** Automatically track the exact inventory of equipment (e.g., projectors, microphones). For example, if MFU only has 10 microphones, the system prevents booking an 11th one across overlapping room reservations.
- **Automated Refund Processing:** Integrate refund logic with the active payment provider. If a user cancels within the allowed policy timeframe, trigger partial or full refunds automatically without manual accounting work.

## 3. Communication & Support
- **In-App Chatbot / FAQ Assistant:** Implement a simple chatbot or a floating widget to instantly answer common user questions about pricing, policies, or space capacities.
- **LINE Notify Integration:** In addition to email notifications, send instant alerts to the Admin's LINE group when a new booking needs approval, and send LINE reminders to users 24 hours before their event.

## 4. Recently Implemented Advanced Features
- **Automated Email Notifications:** Confirmation and status emails (approved / disapproved with remarks); after Stripe payment, English Space Permit PDF by email (TC-PAY-03/04).
- **Stripe checkout (acceptance path):** Primary online payment is Stripe test/live via `PAYMENT_PROVIDER=stripe`. Booking returns to paid status with a stored transaction id. See `docs/payment/STRIPE.md`.
- **Optional PromptPay / slip path:** Code for PromptPay QR + slip upload remains for an alternate provider setting; it is **not** the documented UAT acceptance path (80-case suite uses Stripe).
- **Mock payment removed from product UI:** `POST /api/payment/mock/simulate` returns **HTTP 410** — do not document mock sandbox as an active UAT UI.
- **Batch PDF Memorandum ZIP Export for Admin:** `POST /api/admin/bookings/export-zip` streams selected memo PDFs.
- **API Rate Limiting Protection:** `express-rate-limit` on general, auth, and booking routes.
- **Database Query Indexing & Performance:** PostgreSQL indexes on key booking/user/pricing columns.
- **Enhanced UI Feedback & Loading States:** Spinners, disabled buttons, and SweetAlert feedback across Vue views.
- **Shared MFU design system (`frontend/src/assets/main.css`):** Tokens `mfu-red` / `mfu-gold` / `canvas` plus reusable `ui-btn-*`, `ui-input`, `ui-card*`, `ui-chip*`, skip-link / focus-visible across user + admin views.
- **UX depth (dev):** Home brand-first hero · booking step groups · dashboard card hierarchy · sticky admin tables · `withSwalTheme` · promo=gold / add-ons=red · dates as DD/MM/YYYY.
- **Full-Site Multi-Language Support (i18n TH/EN):** Toggle across user-facing views; admin screens bilingual via `admin.*` keys.
- **Universal Dynamic Data Translator Engine (`translator.ts`):** Room names, types, locations, slots, and statuses for EN display.
- **8 Space Type Filter & Bilingual Search:** Filters on `RoomListView` / `HomeView` for all space categories.
- **Role mapping (`resolveUserType.ts`):** Exact `@mfu.ac.th` → internal; `@lamduan.mfu.ac.th` / others → external; admin via promote (DB, **only `@mfu.ac.th`**) or `DEV_ADMIN_EMAILS` for UAT bootstrap.
