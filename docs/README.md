# Documentation — MFU Space Reservation

**โครงการ:** ระบบบริหารจัดการพื้นที่เช่าชั่วคราว มหาวิทยาลัยแม่ฟ้าหลวง  
**อัปเดตโครงสร้าง:** 2026-11-03

เริ่มจากตารางนี้ — เปิดเฉพาะหมวดที่ต้องการ

**Project handover / get a usable site running:** start with [`../README.md`](../README.md) (clone → `.env` → seed → run / Docker → handover checklist)

---

## แผนที่เอกสาร

| หมวด | โฟลเดอร์ | ใช้เมื่อ |
|------|----------|----------|
| **ผลิตภัณฑ์ / ขอบเขต** | [`product/`](./product/) | requirements, ฟีเจอร์, แผน sprint, schema |
| **ชำระเงิน** | [`payment/`](./payment/) | **Stripe เท่านั้น** (ตัดสินใจแล้ว) |
| **ทดสอบ** | [`testing/`](./testing/) | Test Case, แผนเทส, UAT, E2E, หลักฐาน |
| **ประชุม / Demo** | [`meetings/`](./meetings/) | Recording 3–5, สคริปต์นำเสนอ, demo security |
| **ปฏิบัติการ / Deploy** | [`ops/`](./ops/) | CITS, go-live, backup, security checklist |

กฎ AI / ทีม: [`../RULES.md`](../RULES.md) · Changelog: [`../AI_CHANGELOG.md`](../AI_CHANGELOG.md)

---

## 1) Product — ผลิตภัณฑ์

| ไฟล์ | คำอธิบาย |
|------|----------|
| [`product/requirements.md`](./product/requirements.md) | วัตถุประสงค์ / role / scope |
| [`product/features.md`](./product/features.md) | รายการฟีเจอร์ |
| [`product/planning.md`](./product/planning.md) | แผน 8 sprints |
| [`product/schema.md`](./product/schema.md) | โครง DB |
| [`product/THESIS_CHAPTERS_CHECKLIST.md`](./product/THESIS_CHAPTERS_CHECKLIST.md) | Checklist บท 3–5 (สอบ) |
| [`product/CHAPTER_4_AND_5.md`](./product/CHAPTER_4_AND_5.md) | ร่างภาษาอังกฤษ Chapter 4 Experiment and Result และ Chapter 5 Conclusion and Discussion สำหรับวางในเล่ม |
| [`product/ADVISOR_REPORT_FIX_CHECKLIST.md`](./product/ADVISOR_REPORT_FIX_CHECKLIST.md) | Checklist แก้เล่มตามข้อติอาจารย์ 19 พ.ย. 2026 (References, Figure 3.1, อธิบายรูป Ch.3) |
| [`product/FINAL_PRESENT_FEEDBACK_CHECKLIST.md`](./product/FINAL_PRESENT_FEEDBACK_CHECKLIST.md) | Checklist ข้อติ Final Present (อ.แพท / อ.ต้อง / อ.โก) — เล่ม + ฟีเจอร์ + UX |
| [`product/REPORT_FORMAT_AUDIT.md`](./product/REPORT_FORMAT_AUDIT.md) | ตรวจฟอร์แมตเล่มภาษาอังกฤษทั้งฉบับ (จัดย่อหน้า, เลขหัวข้อ, ภาษานำรูป, GitHub) |
| [`product/REPORT_PDF_AUDIT.md`](./product/REPORT_PDF_AUDIT.md) | ตรวจ `final project.pdf` ละเอียด (เลขหน้า, สารบัญ, รูป 4.1–4.15, จุดค้างแก้) |

---

## 2) Payment — Stripe

| ไฟล์ | คำอธิบาย |
|------|----------|
| [`payment/STRIPE.md`](./payment/STRIPE.md) | คู่มือ Stripe demo/test + Transaction ID / webhook |

Payment path ปัจจุบัน = **Stripe** (`docs/payment/STRIPE.md`)

---

## 3) Testing — ทดสอบ (ใช้บ่อย)

| ไฟล์ | คำอธิบาย |
|------|----------|
| [`testing/TEST_CASE_TRACKER.md`](./testing/TEST_CASE_TRACKER.md) | **เอกสารหลัก** — ตาราง Test Case ทั้งหมด (**80/80 ผ่าน**) |
| [`testing/test-cases/`](./testing/test-cases/) | โฟลว์ `01`…`12` · รวม 80 · SMTP สั้นใน [`test-cases/README.md`](./testing/test-cases/README.md) · Email EN/TH + เธรด |
| [Root README §3.4 SMTP](../README.md#34-smtp-email-notifications-recommended-for-uat) | คู่มือเต็ม Gmail App Password / พอร์ต 465 · MFU SMTP สำหรับ UAT เมลจริง |
| [`testing/evidence/`](./testing/evidence/) | Screenshot หลักฐาน |
| [`testing/TESTING_PLAN.md`](./testing/TESTING_PLAN.md) | แผน Unit / Integration / E2E |
| [`testing/QA_AUTOMATION_GUIDE.md`](./testing/QA_AUTOMATION_GUIDE.md) | Playwright E2E |
| [`testing/UAT_BUG_REPORT_TEMPLATE.md`](./testing/UAT_BUG_REPORT_TEMPLATE.md) | แบบฟอร์มบั๊ก |
| [`testing/UAT_SIGNOFF.md`](./testing/UAT_SIGNOFF.md) | ลงนามรับ UAT |

---

## 4) Meetings — ประชุม / Demo

| ไฟล์ | คำอธิบาย |
|------|----------|
| [`meetings/RECORDING5_ACTION_PLAN.md`](./meetings/RECORDING5_ACTION_PLAN.md) | แผน Recording 5 (UI / Promo / Excel TC / เอกสารสอบ) |
| [`meetings/RECORDING4_ACTION_PLAN.md`](./meetings/RECORDING4_ACTION_PLAN.md) | แผน Recording 4 (Test Case / Coop / Stripe) |
| [`meetings/RECORDING3_ACTION_PLAN.md`](./meetings/RECORDING3_ACTION_PLAN.md) | แผน Recording 3 |
| [`meetings/PRESENTATION_SCRIPT_POST_FRIDAY.md`](./meetings/PRESENTATION_SCRIPT_POST_FRIDAY.md) | สคริปต์นำเสนอ 4 คน |
| [`meetings/FRIDAY_DEMO_PREP.md`](./meetings/FRIDAY_DEMO_PREP.md) | เตรียม Demo |
| [`meetings/DEMO_SECURITY.md`](./meetings/DEMO_SECURITY.md) | อธิบาย AuthN / AuthZ |

---

## 5) Ops — Deploy / Security

| ไฟล์ | คำอธิบาย |
|------|----------|
| [`ops/SETUP_FROM_ENV_EXAMPLE.md`](./ops/SETUP_FROM_ENV_EXAMPLE.md) | Clone GitHub → คัดลอก `.env.example` → ใส่ API Key |
| [`ops/CITS_RUNBOOK.md`](./ops/CITS_RUNBOOK.md) | รันบนเซิร์ฟเวอร์ CITS |
| [`ops/GO_LIVE_CHECKLIST.md`](./ops/GO_LIVE_CHECKLIST.md) | ก่อนขึ้นจริง |
| [`ops/BACKUP_RESTORE.md`](./ops/BACKUP_RESTORE.md) | สำรอง / กู้คืน DB |
| [`ops/SECURITY_CHECKLIST.md`](./ops/SECURITY_CHECKLIST.md) | checklist ความปลอดภัย |

---

## ลบ / ไม่ใช้แล้ว

| รายการ | เหตุผล |
|--------|--------|
| `payment_gateway.md` | ตัดแล้ว — ทีมเลือก **Stripe** ไม่เก็บคู่มือ Opn/SCB/KBank/KTB |
| `UAT_TEST_SCENARIOS.md` | รวมเข้า `testing/TEST_CASE_TRACKER.md` แล้ว |
| `testing/UAT_DOCKER_CHECKLIST.md` | stub — อิง `TEST_CASE_TRACKER.md` แทน (รายการค้างเก่าไม่ใช้) |
| `testing/UAT_DOCKER_ROUND_RESULTS.md` | stub — อิง tracker ล่าสุด |
| `testing/UAT_ROUND1_RESULTS.md` | stub — อิง tracker ล่าสุด |
