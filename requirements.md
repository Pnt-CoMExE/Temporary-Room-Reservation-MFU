# Temporary Rental Space Management System of MFU - Requirements

## 1. Project Objectives
- Develop a fully functional web-based temporary rental space management system for Mae Fah Luang University (MFU).
- Implement a full-stack system architecture demonstrating seamless integration between frontend (Vue.js, Tailwind CSS) and backend (Node.js, PostgreSQL).
- Enable users to process secure online bookings and provide administrators with a centralized dashboard for efficient facility management.

## 2. System Users and Roles
The system categorizes users into distinct authorization levels with different pricing tiers:
- **Internal Users:** Individuals or entities operating within the MFU organization. They are charged the "Internal Rate".
- **Collaborative Users (Co-op):** Users involved in cross-organizational partnerships or activities co-hosted with the university. They are charged the "Collaborative Rate".
- **External Users:** Individuals or private companies outside the MFU organization. They are charged the standard "External Rate".
- **System Administrator:** Personnel responsible for overseeing facility data, managing reservation requests, and handling workflows.

## 3. User Functional Scope
- **Availability Search & Advanced Booking:** Check real-time room availability and submit advance reservation requests.
- **Service Customization (Add-ons):** Select supplementary services or equipment (e.g., tables, chairs) with automated cost calculation.
- **Secure Authentication:** Log in securely via Google OAuth. Roles are automatically assigned based on email domains (e.g., `@mfu.ac.th`, `@lamduan.mfu.ac.th`).
- **Secure Payment Integration:** Process instant online payments securely via a third-party gateway using dynamic PromptPay QR Codes (Opn Payments).
- **Promotions and Incentives:** Apply promotional discounts or special offers during booking.
- **Reservation Management & History:** Access booking logs, track statuses, and cancel existing bookings.
- **Status and Event Notifications:** Receive automated alerts for booking confirmations, status updates, and promotions.
- **Post-Service Feedback:** Submit reviews and satisfaction ratings after completion.

## 4. Administrator Functional Scope
- **Facility & Rate Management:** Add, edit, or disable rooms and manage pricing. Supports bulk importing room details/rates from Excel files.
- **Administrative Dashboard & Data Visualization:** Centralized analytics dashboard with interactive charts for monitoring real-time booking statistics, revenue, and utilization.
- **Approval Workflow and Documentation:** Approve or disapprove requests. Includes importing executive authorization files and exporting official documents as verified digital evidence.
- **Promotion Management:** Create, configure, and manage promotional campaigns to encourage utilization.
- **System Notifications & Broadcasts:** Manage automated system alerts and broadcast promotional information to users.

## 5. System Architecture & Technologies
- **Frontend:** Vue.js, Tailwind CSS
- **Backend:** Node.js
- **Database:** PostgreSQL, pgAdmin4
- **SSO:** Google OAuth 2.0
- **Payment Gateway:** Opn Payments (PromptPay QR)
