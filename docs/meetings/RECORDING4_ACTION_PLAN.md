# Recording 4 — Action Plan (Advisor Feedback)

**อัปเดต:** 2026-10-05  
**ที่มา:** Standard recording 4 (2026-09-23 11:06–11:31) — Test Case / Coop rate / Approve UX / Payment / Preproject scope

เอกสารประกอบ:
- [`TESTING_PLAN.md`](../testing/TESTING_PLAN.md)
- [`TEST_CASE_TRACKER.md`](../testing/TEST_CASE_TRACKER.md) ← **เอกสารหลักทดสอบ (รวม UAT + R4)**
- [`STRIPE.md`](../payment/STRIPE.md)
- [`requirements.md`](../product/requirements.md) · [`planning.md`](../product/planning.md)
- [`RECORDING3_ACTION_PLAN.md`](./RECORDING3_ACTION_PLAN.md)

---

## สรุปเทียบ meeting ↔ สถานะ

| # | หัวข้อใน meeting | Verdict | รายละเอียดสั้น |
|---|------------------|---------|----------------|
| 1 | Test Case ละเอียด + แบ่งทีม + หลักฐานหน้าจอ | **Done** | Template ตามตารางอาจารย์ + แบ่ง คอม/ซี/พาร์ท/เจ (ด้านล่าง) |
| 2 | Unit vs Integration | **Done** | ดู [`TESTING_PLAN.md`](../testing/TESTING_PLAN.md) |
| 3 | Coop = admin เลือกเรทตอนอนุมัติ (ตามหนังสือ) | **Done** | หน้า confirm อนุมัติเลือก internal / co_op / external + คำนวณราคาใหม่ |
| 4 | Confirm รายละเอียด + Preview ไฟล์แนบก่อนอนุมัติ | **Done** | Modal สรุปจอง + preview memo/ใบอนุมัติ |
| 5 | Log เมื่อเปลี่ยนเรท | **Done** | `auditLog` บันทึก org type + ราคาเก่า→ใหม่ |
| 6 | เอาการตั้ง Co-op ที่ Users ออก (ตัดสินตอนอนุมัติ) | **Done** | ลบปุ่มตั้ง Co-op ใน AdminUsers |
| 7 | ตรวจ Scope จาก Preproject | **Done** | ตารางด้านล่าง |
| 8 | Payment ง่าย ๆ + Stripe callback / Transaction ID | **Done** | `PAYMENT_PROVIDER=stripe` (demo หรือ test key) |

---

## Template Test Case (ตามอาจารย์)

| องค์ประกอบ | รายละเอียด |
|-----------|------------|
| Test Case Number | เช่น `TC-U-012`, `TC-A-005` |
| Test หน้าไหน | ชื่อหน้า UI (TH/EN) |
| Page / Route | เช่น `/dashboard`, `/admin/bookings` |
| ฟังก์ชันอะไร | ฟังก์ชันที่ทดสอบ |
| Input | ค่าที่ใส่ / ไฟล์แนบ / Role |
| Use Case / Scenario | ขั้นตอนสั้น ๆ |
| Expected Result | ผลลัพธ์ที่คาดหวัง |
| ผลลัพธ์ | ผ่าน / ไม่ผ่าน |
| หลักฐาน | รูปหน้าจอ / ลิงก์ Playwright / ชื่อไฟล์ใน `docs/evidence/` |
| Owner | คอม / ซี / พาร์ท / เจ |
| ประเภท | Unit · Integration · E2E · Manual |

> การเขียนละเอียดแบบนี้ช่วยอัปเกรดเป็น Automated Case ได้ — อ้างอิง E2E ใน [`QA_AUTOMATION_GUIDE.md`](../testing/QA_AUTOMATION_GUIDE.md)

รายการทดสอบทั้งหมด (UAT เดิม + Recording 4): [`TEST_CASE_TRACKER.md`](../testing/TEST_CASE_TRACKER.md)  
ไฟล์เก่า [`TEST_CASE_TRACKER.md`](../testing/TEST_CASE_TRACKER.md) ชี้มาที่ tracker แล้ว

**Tracker พร้อมแบ่งทีม (ว่างให้ติ๊ก):** [`TEST_CASE_TRACKER.md`](../testing/TEST_CASE_TRACKER.md)  
**โฟลเดอร์หลักฐาน:** [`evidence/`](../testing/evidence/)

---

## แบ่งความรับผิดชอบทดสอบ (4 คน)

| Owner | โฟกัส | ตัวอย่าง TC |
|-------|--------|-------------|
| **คอม** | Stripe, เรท+log, จองเต็ม/ชน slot, AuthZ, E2E | TC-P-R4-01/02, TC-A-R4-01/03, TC-U-12/19, TC-Z-01/02 |
| **พาร์ท** | Admin เอกสาร + จ่าย PromptPay/Mock | TC-A-R4-02, A-06/08/10, U-23/24b |
| **ซี** | User UI ตามสคริปต์ | Login, rooms, dashboard, ยกเลิก/รีวิว |
| **เจ** | เปิดดูหน้า Admin / ตรวจ UI | A-01/02, ไม่มีปุ่ม Co-op, logout, Featured |

รายละเอียดและไฟล์แยกรายบุคคล: [`TEST_CASE_TRACKER.md`](../testing/TEST_CASE_TRACKER.md) · [`test-cases/`](../testing/test-cases/)

**กำหนดส่ง:** ภายในสัปดาห์ — แต่ละคนติ๊กผล + แนบหลักฐานใน `docs/evidence/`

---

## Preproject scope (requirements) — Done / Gap

| Scope จาก Preproject / requirements | สถานะ | หมายเหตุ |
|-------------------------------------|--------|----------|
| 3 pricing tiers (internal / co-op / external) | ✅ | เลือกเรทตอนอนุมัติได้แล้ว (Recording 4) |
| Google OAuth + role | ✅ | admin = promote / `DEV_ADMIN_EMAILS` |
| ค้นหาห้อง + จองล่วงหน้า | ✅ | |
| Add-ons + คำนวณราคา | ✅ | |
| Promo codes | ✅ | |
| Payment gateway | ✅ Partial→Stripe demo | PromptPay + mock + **Stripe test/demo**; production รอหน่วยงาน |
| ประวัติจอง / ยกเลิก | ✅ | |
| แจ้งเตือน | ✅ | email + in-app |
| Feedback / รีวิว | ✅ | |
| Admin ห้อง + อัตราราคา + Excel import | ✅ | |
| Admin dashboard / charts | ✅ | |
| Approve workflow + เอกสาร | ✅ | + confirm/preview/rate (R4) |
| Broadcast / notifications | ✅ | |
| Deploy CITS / Domain | 🔄 | Docker พร้อม — รอ CITS |

---

## เฟสงาน Recording 4

| เฟส | งาน | สถานะ |
|-----|-----|--------|
| **A** | เอกสารแผน + Test Case template + แบ่งทีม | **Done** |
| **B** | Confirm อนุมัติ + เลือกเรท + preview + audit log | **Done** |
| **C** | ลบปุ่มตั้ง Co-op ที่ Users | **Done** |
| **D** | ตาราง Preproject scope | **Done** |
| **E** | Stripe demo/test + webhook + Transaction ID | **Done** |

---

## วิธีทดสอบ Payment Stripe (สั้น)

1. ตั้ง `PAYMENT_PROVIDER=stripe` ใน `backend/.env`
2. **โหมด demo (ไม่มี key):** กดชำระเงินใน Dashboard → หน้า demo checkout → Confirm → ได้ Transaction ID + สถานะชำระแล้ว
3. **โหมด Stripe test key:** ใส่ `STRIPE_SECRET_KEY=sk_test_...` (+ optional `STRIPE_WEBHOOK_SECRET`) → Checkout Session จริงใน test mode
4. ดูรายละเอียด: [`STRIPE.md`](../payment/STRIPE.md)
