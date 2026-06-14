# Agile Sprint Plan (3 Months)

**Project Phase:** Senior Project 2 (System Development and Deployment)
**Duration:** 3 Months (12 Sprints / Weeks)
**Goal:** Full implementation, third-party integrations, testing, and deployment of the Temporary Rental Space Management System.

## Month 1: Core System & Foundation (Sprints 1 - 4)
**Focus:** Infrastructure, Authentication, and Basic CRUD operations.

* **Sprint 1 (Week 1): Setup & Foundation**
  - Set up PostgreSQL database with `pgAdmin4`.
  - Initialize Node.js backend and Vue.js (Tailwind CSS) frontend repositories.
  - Create database schemas (`users`, `rooms`, `room_pricing`, `addons`).

* **Sprint 2 (Week 2): Authentication & Role Management**
  - Implement Google OAuth 2.0 Single Sign-On (SSO).
  - Develop automated role assignment based on email domains (`@mfu.ac.th`, `@lamduan.mfu.ac.th` for internal, else external).
  - Build the Login UI and secure routing.

* **Sprint 3 (Week 3): Facility Management (Admin)**
  - Implement Admin APIs to add, edit, disable rooms and add-ons.
  - Develop Admin UI for managing room records and pricing tiers.
  - Implement bulk import functionality via Excel for room data.

* **Sprint 4 (Week 4): User Browsing Experience**
  - Develop user home page, all-room list, and room details views.
  - Implement real-time room availability search and filtering.

## Month 2: Advanced Workflows & Third-Party Integrations (Sprints 5 - 8)
**Focus:** Booking workflows, Admin approvals, and Payment Integration.

* **Sprint 5 (Week 5): Booking Engine**
  - Implement advanced booking request submission.
  - Develop add-on selection and automated cost calculation logic.
  - Handle document uploads (e.g., proof of organization).

* **Sprint 6 (Week 6): Admin Approval Workflow**
  - Develop admin request management dashboard (Approve/Reject).
  - Implement official approval document export/import.
  - Set up automated email notifications for booking status updates.

* **Sprint 7 (Week 7): Payment Gateway Integration**
  - Integrate Opn Payments API for generating dynamic PromptPay QR Codes.
  - Develop payment UI for scanning QR codes during checkout.
  - Implement Webhook listener to automatically update booking status to "Paid".

* **Sprint 8 (Week 8): User Dashboard & Management**
  - Develop User Dashboard to track bookings, statuses, and history.
  - Implement booking cancellation logic according to system policies.
  - Create Post-Service Feedback and review forms.

## Month 3: Polish, Testing, and Deployment (Sprints 9 - 12)
**Focus:** Analytics, Quality Assurance, and Final Release.

* **Sprint 9 (Week 9): Data Visualization & Promotions**
  - Develop centralized Admin Analytics Dashboard (interactive charts for revenue, utilization).
  - Implement Promotion Management (Promo codes) and Broadcast announcements.
  - Implement Activity Logs for system administrators.

* **Sprint 10 (Week 10): System Testing & QA**
  - Conduct End-to-End (E2E) testing and resolve critical bugs.
  - Validate role-based access control and scheduling conflict prevention.
  - Perform User Acceptance Testing (UAT) with internal stakeholders.

* **Sprint 11 (Week 11): Refinement & Optimization**
  - UI/UX polish (transitions, responsiveness, empty states).
  - Database indexing and query optimization for performance.
  - Security review (API rate limiting, data validation).

* **Sprint 12 (Week 12): Final Deployment & Documentation**
  - Deploy frontend and backend to production servers.
  - Finalize Senior Project 2 documentation and user manuals.
  - Prepare presentation and system demonstration for the final examination committee defense.
