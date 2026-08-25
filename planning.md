# Production Ready Deployment Plan (2 Months / 8 Sprints)
# แผนการดำเนินงานและเตรียมความพร้อมสู่ Production Deployment (ระยะเวลา 2 เดือน / 8 สัปดาห์)

**Project Phase / เฟสโครงการ:** Temporary Rental Space Management System of MFU - Production Deployment  
**Duration / ระยะเวลา:** 2 Months (8 Weeks / Sprints) / 2 เดือน (8 สัปดาห์ / 8 Sprints)  
**Goal / เป้าหมาย:** Transition system to a hardened, fully tested, portable, and production-ready state, overcoming infrastructure and payment gateway constraints. (ยกระดับและปรับปรุงระบบให้มีความมั่นคงปลอดภัย ผ่านการทดสอบอย่างครอบคลุม รองรับการย้ายเครื่อง และพร้อมใช้งานจริงบน Production โดยก้าวข้ามข้อจำกัดด้านโครงสร้างพื้นฐานและช่องทางการชำระเงิน)

---

## 💡 Pragmatic Execution Strategy / กลยุทธ์การดำเนินงานแบบยืดหยุ่น

1. **Unconfirmed CITS Server / กรณีเครื่อง Server CITS ยังไม่แน่นอน:**  
   - 🇬🇧 100% **Docker & Docker Compose Portability**. Run on Staging/Cloud VM during UAT, then 1-click deploy (`docker-compose up -d`) when CITS Server is provisioned.
   - 🇹🇭 ใช้ระบบ **Docker & Docker Compose Portability 100%** รันบน Staging/Cloud VM ชั่วคราวช่วง UAT และเมื่อ CITS มอบ Server จะสั่ง Deploy ด้วยคำสั่งเดียว (`docker-compose up -d`) ได้ทันที
2. **Pending Payment Provider Selection / กรณีส่วนทรัพย์สินยังไม่ได้สรุปค่าย Payment เอกชน:**  
   - **Modular Payment Adapter Pattern / รูปแบบสถาปัตยกรรมแบบโมดูลาร์**
     - *Mode A (Immediate / พร้อมใช้ทันที):* Dynamic PromptPay EMVCo QR Code + Slip Upload Verification by Admin. (สแกนจ่าย PromptPay + อัปโหลด Slip + เจ้าหน้าที่ตรวจสอบ)
     - *Mode B (Plug-and-Play / พร้อมต่อ API):* Abstracted Payment Adapter ready to attach to Opn Payments, SCB, Krungthai, or KBank once Asset Management Dept decides. (พร้อมต่อ API กับค่ายเอกชนทันทีเมื่อมีข้อสรุป)

---

## 🗓️ Month 1: Portable Infrastructure, Modular Payment & Core Hardening (Sprints 1 - 4)
## เดือนที่ 1: โครงสร้างพื้นฐานย้ายง่าย, ระบบชำระเงินแบบโมดูลาร์ และยกระดับความปลอดภัย

* **Sprint 1 (Week 1 / สัปดาห์ที่ 1): Dockerization & Portable Environment Setup / การทำ Dockerization & จัดตั้งสภาพแวดล้อมที่ย้ายง่าย**
  - 🇬🇧 Multi-stage Dockerfiles for Express Backend and Vue 3 + Nginx Frontend.
  - 🇹🇭 สร้าง Multi-stage Dockerfiles สำหรับ Express Backend และ Vue 3 + Nginx Frontend
  - 🇬🇧 Portable `docker-compose.prod.yml` with PostgreSQL 16 & Redis.
  - 🇹🇭 กำหนดค่า `docker-compose.prod.yml` ที่รันร่วมกับ PostgreSQL 16 และ Redis
  - 🇬🇧 Automated Database Migration and Backup Scripts.
  - 🇹🇭 สร้างสคริปต์ Database Migration และระบบสำรองข้อมูล (Backup) อัตโนมัติ

* **Sprint 2 (Week 2 / สัปดาห์ที่ 2): Dynamic PromptPay EMVCo QR & Slip Verification Engine / ระบบชำระเงิน Dynamic PromptPay EMVCo QR & ตรวจสอบ Slip**
  - 🇬🇧 PromptPay EMVCo QR generator on UI.
  - 🇹🇭 ตัวสร้าง QR Code ชำระเงิน Dynamic PromptPay EMVCo บนหน้าจอผู้ใช้
  - 🇬🇧 Payment Slip Upload feature for users and Slip Verification Dashboard for Admins.
  - 🇹🇭 ฟังก์ชันอัปโหลด Slip หลักฐานการชำระเงินสำหรับผู้ใช้ และระบบตรวจสอบ Slip สำหรับผู้ดูแลระบบ (Admin)

* **Sprint 3 (Week 3 / สัปดาห์ที่ 3): Security Hardening, Audit Logging & OAuth Enforcement / การยกระดับความปลอดภัย, บันทึกการทำงาน & จัดสิทธิ์ OAuth**
  - 🇬🇧 Strict MFU Google OAuth domain separation (`@mfu.ac.th` vs `@lamduan.mfu.ac.th` vs external).
  - 🇹🇭 บังคับใช้ Google OAuth 2.0 แยกสิทธิ์ตามโดเมนอย่างเข้มงวด (`@mfu.ac.th` บุคลากร vs `@lamduan.mfu.ac.th` นักศึกษา vs บุคคลภายนอก)
  - 🇬🇧 Security hardening with `helmet`, CORS, API Rate Limiting, and Admin Audit Logs.
  - 🇹🇭 เพิ่มความปลอดภัยด้วย `helmet`, CORS Policy, การจำกัดอัตราเรียกใช้งาน API (Rate Limiting) และระบบ Admin Audit Logs

* **Sprint 4 (Week 4 / สัปดาห์ที่ 4): Modular Payment Adapter & Automated Receipt PDF Generation / Modular Payment Adapter & ระบบออกใบเสร็จ PDF อัตโนมัติ**
  - 🇬🇧 Modular Payment Provider Adapter Interface.
  - 🇹🇭 สร้างโครงสร้าง Interface กลางสำหรับเชื่อมต่อ Payment Provider ของเอกชน (Modular Payment Adapter)
  - 🇬🇧 Automated PDF invoice/receipt generation service.
  - 🇹🇭 ระบบสร้างเอกสาร PDF ใบเสร็จรับเงิน/ใบอนุญาตใช้งานพื้นที่อัตโนมัติ
  - 🇬🇧 Real-time Add-on equipment inventory lock logic.
  - 🇹🇭 Logic คำนวณคลังอุปกรณ์เสริมแบบ Real-time (Add-on Inventory Lock) เพื่อป้องกันการจองอุปกรณ์เกินจำนวนจริง

---

## 🗓️ Month 2: QA, UAT, CITS Readiness, CI/CD & Go-Live (Sprints 5 - 8)
## เดือนที่ 2: QA, UAT, ความพร้อมสำหรับ CITS, CI/CD & การเปิดใช้งานจริง

* **Sprint 5 (Week 5 / สัปดาห์ที่ 5): E2E Automation Testing & Concurrency Load Testing / การทดสอบ E2E อัตโนมัติ & ทดสอบโหลดรองรับผู้ใช้พร้อมกัน**
  - 🇬🇧 Playwright E2E automation tests covering full user booking journeys.
  - 🇹🇭 ชุดทดสอบ Playwright E2E Automation ครอบคลุมการทำงานตั้งแต่เริ่มจองจนถึงชำระเงิน
  - 🇬🇧 Concurrency load testing with k6 (300+ VUs) ensuring database row locks prevent double-booking.
  - 🇹🇭 การทดสอบโหลดและความพร้อมด้วย k6 (จำลองผู้ใช้ 300+ คนพร้อมกัน) เพื่อการันตีว่า PostgreSQL Transaction Lock ป้องกันการจองซ้ำซ้อน (Double-Booking) ได้ 100%

* **Sprint 6 (Week 6 / สัปดาห์ที่ 6): User Acceptance Testing (UAT) & Asset Dept Review / การทดสอบยอมรับจากผู้ใช้ (UAT) & สอบทานร่วมกับส่วนทรัพย์สิน**
  - 🇬🇧 UAT execution with MFU Admin, Faculty, Student Orgs, and Asset Management Dept.
  - 🇹🇭 เปิดรอบทดสอบ UAT ร่วมกับผู้ดูแลระบบ MFU, อาจารย์/บุคลากร, สโมสร/ชมรมนักศึกษา และเจ้าหน้าที่ส่วนทรัพย์สิน
  - 🇬🇧 Rapid feedback triage and bug fixing.
  - 🇹🇭 การรวบรวมข้อเสนอแนะ การจัดลำดับความสำคัญของปัญหา และการแก้ไขข้อผิดพลาดอย่างรวดเร็ว

* **Sprint 7 (Week 7 / สัปดาห์ที่ 7): CI/CD Automation Pipeline & CITS Readiness Package / ท่อส่งมอบงานอัตโนมัติ (CI/CD Pipeline) & แพ็กเกจพร้อมส่งมอบ CITS**
  - 🇬🇧 GitHub Actions CI/CD pipeline setup.
  - 🇹🇭 ติดตั้ง GitHub Actions CI/CD Pipeline (ทดสอบรัน Unit Test, Linting และ Build Docker Image อัตโนมัติ)
  - 🇬🇧 Preparation of "CITS Deployment Readiness Package" for smooth server handover.
  - 🇹🇭 จัดทำ "CITS Deployment Readiness Package" สำหรับการส่งมอบเซิร์ฟเวอร์แก่ทีมวิศวกร CITS

* **Sprint 8 (Week 8 / สัปดาห์ที่ 8): CITS Server Deployment, DNS Cutover & Go-Live / การนำขึ้น Server CITS, การชี้ DNS Domain & เปิดใช้งานจริง**
  - 🇬🇧 Deploy to CITS Production Server via Docker Compose.
  - 🇹🇭 Deploy ขึ้น Production Server ของ CITS ผ่าน Docker Compose
  - 🇬🇧 Seed initial room, pricing, and admin data.
  - 🇹🇭 นำเข้าข้อมูลเริ่มต้น (ข้อมูลห้องพัก, อัตราค่าเช่า, อุปกรณ์เสริม, บัญชีผู้ดูแลระบบ)
  - 🇬🇧 Domain DNS cutover, SSL activation, monitoring setup, and operational handover.
  - 🇹🇭 ชี้ Domain DNS ของมหาวิทยาลัย, เปิดใช้งาน SSL Certificate, ติดตั้งระบบ Monitoring และส่งมอบคู่มือการใช้งานระบบ
