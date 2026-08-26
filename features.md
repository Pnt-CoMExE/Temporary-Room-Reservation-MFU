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
- **Automated Refund Processing:** Integrate refund logic with Opn Payments. If a user cancels within the allowed policy timeframe, trigger partial or full refunds automatically without manual accounting work.

## 3. Communication & Support
- **In-App Chatbot / FAQ Assistant:** Implement a simple chatbot or a floating widget to instantly answer common user questions about pricing, policies, or space capacities.
- **LINE Notify Integration:** In addition to email notifications, send instant alerts to the Admin's LINE group when a new booking needs approval, and send LINE reminders to users 24 hours before their event.

## 4. Recently Implemented Advanced Features
- **Automated Email Notifications:** System automatically dispatches confirmation emails upon booking creation and status update emails (Approved / Disapproved with remarks) upon administrator review.
- **Dynamic PromptPay EMVCo QR Code Payment:** Integrated client-side PromptPay EMVCo QR payload generator with `qrcode` library to display dynamic QR codes with exact booking amounts in user `DashboardView.vue`.
- **Batch PDF Memorandum ZIP Export for Admin:** Built high-performance ZIP archive streaming endpoint (`POST /api/admin/bookings/export-zip`) using `archiver` allowing admins to download selected PDF memorandum documents in one click.
- **API Rate Limiting Protection:** Integrated `express-rate-limit` middleware across general endpoints, authentication routes (`/api/auth`), and booking creation (`/api/bookings`) to prevent spam and brute-force attempts.
- **Database Query Indexing & Performance:** Configured PostgreSQL index migration scripts for key search columns (`bookings`, `users`, `room_pricing`) to optimize response times under heavy concurrent loads.
- **Enhanced UI Feedback & Loading States:** Added submitting spinners, disabled button states during API requests, and user feedback popups across Vue components.
- **Full-Site Multi-Language Support (i18n TH/EN):** Implemented seamless Thai/English toggle with `vue-i18n` across all user-facing views, navbar, footers, modals, forms, and user dashboard.
- **Universal Dynamic Data Translator Engine (`translator.ts`):** Built automated regex & dictionary translation engine converting 100% of all 100 backend database room names, room types, locations, time slots, and booking statuses dynamically with zero Thai remaining.
- **8 Space Type Filter & Bilingual Search:** Expanded search filter dropdowns across `RoomListView.vue` and `HomeView.vue` to all 8 database space categories with instant bilingual search matching.

