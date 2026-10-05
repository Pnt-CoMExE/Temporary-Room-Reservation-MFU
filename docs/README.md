# Documentation — MFU Space Reservation

**โครงการ:** ระบบบริหารจัดการพื้นที่เช่าชั่วคราว มหาวิทยาลัยแม่ฟ้าหลวง  
**อัปเดตโครงสร้าง:** 2026-10-05

เริ่มจากตารางนี้ — เปิดเฉพาะหมวดที่ต้องการ

---

## แผนที่เอกสาร

| หมวด | โฟลเดอร์ | ใช้เมื่อ |
|------|----------|----------|
| **ผลิตภัณฑ์ / ขอบเขต** | [`product/`](./product/) | requirements, ฟีเจอร์, แผน sprint, schema |
| **ชำระเงิน** | [`payment/`](./payment/) | **Stripe เท่านั้น** (ตัดสินใจแล้ว) |
| **ทดสอบ** | [`testing/`](./testing/) | Test Case, แผนเทส, UAT, E2E, หลักฐาน |
| **ประชุม / Demo** | [`meetings/`](./meetings/) | Recording 3–4, สคริปต์นำเสนอ, demo security |
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

---

## 2) Payment — Stripe

| ไฟล์ | คำอธิบาย |
|------|----------|
| [`payment/STRIPE.md`](./payment/STRIPE.md) | คู่มือ Stripe demo/test + Transaction ID / webhook |

UAT ชั่วคราวยังใช้ `PAYMENT_PROVIDER=mock_sandbox` ได้ · Production = Stripe ตามนโยบายทีม

---

## 3) Testing — ทดสอบ (ใช้บ่อย)

| ไฟล์ | คำอธิบาย |
|------|----------|
| [`testing/TEST_CASE_TRACKER.md`](./testing/TEST_CASE_TRACKER.md) | **ตาราง Test Case ทั้งหมด** |
| [`testing/test-cases/`](./testing/test-cases/) | แยกรายบุคคล: คอม / ซี / พาร์ท / เจ |
| [`testing/evidence/`](./testing/evidence/) | Screenshot หลักฐาน |
| [`testing/TESTING_PLAN.md`](./testing/TESTING_PLAN.md) | แผน Unit / Integration / E2E |
| [`testing/QA_AUTOMATION_GUIDE.md`](./testing/QA_AUTOMATION_GUIDE.md) | Playwright E2E |
| [`testing/UAT_DOCKER_CHECKLIST.md`](./testing/UAT_DOCKER_CHECKLIST.md) | เทสบน Docker |
| [`testing/UAT_BUG_REPORT_TEMPLATE.md`](./testing/UAT_BUG_REPORT_TEMPLATE.md) | แบบฟอร์มบั๊ก |
| [`testing/UAT_SIGNOFF.md`](./testing/UAT_SIGNOFF.md) | ลงนามรับ UAT |
| [`testing/UAT_ROUND1_RESULTS.md`](./testing/UAT_ROUND1_RESULTS.md) | ผลรอบ 1 |
| [`testing/UAT_DOCKER_ROUND_RESULTS.md`](./testing/UAT_DOCKER_ROUND_RESULTS.md) | ผลรอบ Docker |

---

## 4) Meetings — ประชุม / Demo

| ไฟล์ | คำอธิบาย |
|------|----------|
| [`meetings/RECORDING4_ACTION_PLAN.md`](./meetings/RECORDING4_ACTION_PLAN.md) | แผน Recording 4 (Test Case / Coop / Stripe) |
| [`meetings/RECORDING3_ACTION_PLAN.md`](./meetings/RECORDING3_ACTION_PLAN.md) | แผน Recording 3 |
| [`meetings/PRESENTATION_SCRIPT_POST_FRIDAY.md`](./meetings/PRESENTATION_SCRIPT_POST_FRIDAY.md) | สคริปต์นำเสนอ 4 คน |
| [`meetings/FRIDAY_DEMO_PREP.md`](./meetings/FRIDAY_DEMO_PREP.md) | เตรียม Demo |
| [`meetings/DEMO_SECURITY.md`](./meetings/DEMO_SECURITY.md) | อธิบาย AuthN / AuthZ |

---

## 5) Ops — Deploy / Security

| ไฟล์ | คำอธิบาย |
|------|----------|
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
