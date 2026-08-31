# Temporary Rental Space Management System - Frontend (`vue-test`)

This is the Single Page Application (SPA) frontend for the **Temporary Rental Space Management System of MFU**, built with **Vue 3**, **Vite**, **Tailwind CSS**, and **FontAwesome**.

## Tech Stack
- **Framework:** Vue 3 (Composition API)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS, FontAwesome Icons
- **Routing:** Vue Router
- **HTTP Client:** Axios (configured with credentials for backend session/JWT authentication)
- **UI Utilities:** SweetAlert2, Vue Toastification, Chart.js / Vue-ChartJS, QRCode

## Main Feature Views
- **User Portal:**
  - `HomeView.vue`: Room recommendations, promotional banners, search filters.
  - `RoomView.vue`: Complete room catalog and availability filters.
  - `RoomDetailView.vue`: Room specifications, multi-tier pricing table, gallery.
  - `BookingView.vue`: Booking request form, add-on equipment picker, PDF memo document attachment, promo code validation.
  - `DashboardView.vue`: User booking history, QR code payment modal, status tracking, cancellation, and review submission.
  - `ProfileView.vue`: User account details.
- **Admin Portal:**
  - `AdminDashboard.vue`: Facility statistics, utilization metrics, monthly revenue chart.
  - `AdminRooms.vue`: Room CRUD management, pricing tier controls, bulk Excel import (`ExcelJS`).
  - `AdminBookings.vue`: Approval workflow (Approve/Reject), memorandum document viewer.
  - `AdminPromos.vue`: Promotional discount code creation and limit management.
  - `AdminLogs.vue`: Audit trail log of administrator activities.

## Project Setup & Running

### 1. Install Dependencies
```sh
npm install
```

### 2. Run Development Server
```sh
npm run dev
```
Runs the app locally at `http://localhost:5173`. Make sure the backend server (`backend`) is running at `http://localhost:5000`.

### 3. Build for Production
```sh
npm run build
```

