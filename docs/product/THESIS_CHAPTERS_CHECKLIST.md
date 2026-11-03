# Checklist เอกสารโครงงาน (บทที่ 3–5) — Recording 5

ใช้คู่กับ [`../ops/SETUP_FROM_ENV_EXAMPLE.md`](../ops/SETUP_FROM_ENV_EXAMPLE.md) และ [`../testing/TEST_CASE_TRACKER.md`](../testing/TEST_CASE_TRACKER.md)

**ฉบับภาษาอังกฤษสำหรับวางในเล่ม (Chapter 4 Experiment and Result + Chapter 5 Conclusion and Discussion):** [`CHAPTER_4_AND_5.md`](./CHAPTER_4_AND_5.md)  
ตัวเลขในฉบับนั้น: manual **80** เคส = ผ่าน 80 / ไม่ผ่าน 0 (จัดตามโฟลว์) · รวม TC-PAY-03/04 (เมล+PDF ใบอนุญาตอังกฤษหลัง Stripe) · backend `npm test` อ้างอิงรอบล่าสุดใน CI / TC-AUTH-09

---

## บทที่ 3 — การวิเคราะห์และออกแบบ / ติดตั้งระบบ

| หัวข้อ | สถานะใน repo | ชี้ไปที่ |
|--------|--------------|----------|
| Scope / requirements | มี | [`requirements.md`](./requirements.md) · [`features.md`](./features.md) |
| Schema DB | มี | [`schema.md`](./schema.md) |
| แผน sprint | มี | [`planning.md`](./planning.md) |
| คู่มือติดตั้งจาก GitHub | มี | [`../ops/SETUP_FROM_ENV_EXAMPLE.md`](../ops/SETUP_FROM_ENV_EXAMPLE.md) · [`../../README.md`](../../README.md) |
| API Key (JWT / Google / Stripe) | มี | `.env.example` + [`../payment/STRIPE.md`](../payment/STRIPE.md) |
| SMTP (แจ้งเตือนเมล) | มี | README §3.4 · `.env.example` (`SMTP_*` / Gmail App Password สำหรับ UAT) |

**ตัวอย่างข้อความใส่รายงาน:** คัดลอก `backend/.env.example` เป็น `.env` แล้วใส่ค่าทดสอบ — ไม่ใช้ production secret และไม่ commit `.env`

---

## บทที่ 4 — การทดสอบ

| หัวข้อ | สิ่งที่ใส่ในรายงาน |
|--------|-------------------|
| Checklist ตาม Scope | อ้างตาราง TC ใน tracker · ครบ User / Admin / i18n / Error / Payment / AuthZ |
| ตัวอย่าง Test Case | คัดลอก 3–5 แถวจาก tracker (เช่น TC-BOOK-04, TC-ADM-BOOK-04, TC-PAY-01, TC-PAY-04, TC-AUTH-08) |
| ลิงก์ฉบับเต็ม | `docs/testing/TEST_CASE_TRACKER.md` + โฟลเดอร์ `docs/testing/evidence/` |
| Import Excel | เคส TC-ADM-ROOM-03 … TC-ADM-ROOM-06 (เทมเพลต / ผิดรูปแบบ / จำนวน / ราคา) |
| เมล + PDF ใบอนุญาต | TC-EMAIL-01/02 · TC-PAY-03/04 (SMTP จริงใน UAT · PDF อังกฤษ) |

---

## บทที่ 5 — สรุป / อภิปราย / ข้อเสนอแนะ

| หัวข้อ | โน้ตจากระบบล่าสุด |
|--------|-------------------|
| สิ่งที่ทำได้ | จองห้อง · อนุมัติ · **Stripe** (ไม่มี mock ใน UI) · เมลสถานะ + เมลหลังจ่ายพร้อม PDF ใบอนุญาตอังกฤษ · Promo toggle · Admin แก้ราคา add-on · Import Excel |
| ข้อจำกัด UAT | บางเคสใช้ `DEV_*_EMAILS` · ไม่มีเมล `@mfu.ac.th` จากหน่วยงานจริง · SMTP UAT ใช้ **Gmail App Password** (ยังไม่ใช่เมลเซิร์ฟเวอร์ มฟล.) · Stripe webhook บน localhost ใช้ confirm หลัง redirect |
| ข้อเสนอแนะ | ติดตั้ง CITS + HTTPS + SMTP มฟล. · webhook Stripe สาธารณะ · รูป add-on จากอัปโหลดจริง · รายงานแยกบิลในแดชบอร์ดผู้ใช้ · ลงนาม UAT จากหน่วยงาน |

---

อัปเดต 2026-11-03 · อย่าใส่ secret จริงในไฟล์นี้
