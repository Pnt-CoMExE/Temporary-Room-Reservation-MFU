# Checklist เอกสารโครงงาน (บทที่ 3–5) — Recording 5

ใช้คู่กับ [`../ops/SETUP_FROM_ENV_EXAMPLE.md`](../ops/SETUP_FROM_ENV_EXAMPLE.md) และ [`../testing/TEST_CASE_TRACKER.md`](../testing/TEST_CASE_TRACKER.md)

---

## บทที่ 3 — การวิเคราะห์และออกแบบ / ติดตั้งระบบ

| หัวข้อ | สถานะใน repo | ชี้ไปที่ |
|--------|--------------|----------|
| Scope / requirements | มี | [`requirements.md`](./requirements.md) · [`features.md`](./features.md) |
| Schema DB | มี | [`schema.md`](./schema.md) |
| แผน sprint | มี | [`planning.md`](./planning.md) |
| คู่มือติดตั้งจาก GitHub | มี | [`../ops/SETUP_FROM_ENV_EXAMPLE.md`](../ops/SETUP_FROM_ENV_EXAMPLE.md) · [`../../README.md`](../../README.md) |
| API Key (JWT / Google / Stripe) | มี | `.env.example` + [`../payment/STRIPE.md`](../payment/STRIPE.md) |

**ตัวอย่างข้อความใส่รายงาน:** คัดลอก `backend/.env.example` เป็น `.env` แล้วใส่ค่าทดสอบ — ไม่ใช้ production secret และไม่ commit `.env`

---

## บทที่ 4 — การทดสอบ

| หัวข้อ | สิ่งที่ใส่ในรายงาน |
|--------|-------------------|
| Checklist ตาม Scope | อ้างตาราง TC ใน tracker · ครบ User / Admin / i18n / Error / Payment / AuthZ |
| ตัวอย่าง Test Case | คัดลอก 3–5 แถวจาก tracker (เช่น TC-U-12, TC-A-05, TC-P-R4-01, TC-Z-01, TC-A-23) |
| ลิงก์ฉบับเต็ม | `docs/testing/TEST_CASE_TRACKER.md` + โฟลเดอร์ `docs/testing/evidence/` |
| Import Excel | เคส TC-A-23 … TC-A-26 (เทมเพลต / ผิดรูปแบบ / จำนวน / ราคา) |

---

## บทที่ 5 — สรุป / อภิปราย / ข้อเสนอแนะ

| หัวข้อ | โน้ตจาก Recording 5 |
|--------|---------------------|
| สิ่งที่ทำได้ | จองห้อง · อนุมัติ · Stripe/mock · Promo toggle · Admin แก้ราคา add-on · Import Excel |
| ข้อจำกัด UAT | บางเคสใช้ `DEV_*_EMAILS` · ไม่มีเมล `@mfu.ac.th` จริง · SMTP อาจเป็น console |
| ข้อเสนอแนะ | ต่อยอดรูป add-on จากอัปโหลดจริง · รายงานแยกบิลในแดชบอร์ดผู้ใช้ · production Stripe webhook |

---

อัปเดตเมื่อปิดงาน Recording 5 · อย่าใส่ secret จริงในไฟล์นี้
