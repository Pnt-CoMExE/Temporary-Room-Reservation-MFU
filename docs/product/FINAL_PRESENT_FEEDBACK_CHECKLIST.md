# Checklist — ข้อติ / ข้อเสนอแนะ Final Present (กรรมการ)

**แหล่ง:** สรุปคำถามและข้อเสนอแนะจากกรรมการหลัง Final Present  
**อัปเดต:** 2026-11-26 (implement waive A + UX + Excel export + report re-audit)  
**คู่กับ:** [`ADVISOR_REPORT_FIX_CHECKLIST.md`](./ADVISOR_REPORT_FIX_CHECKLIST.md) (รอบ 19 พ.ย. — เล่ม)

สถานะ: `[ ]` ยังไม่ทำ · `[~]` ทำบางส่วน · `[x]` เสร็จ

---

## สรุปสั้นตามอาจารย์

### อ.แพท — Flow / ข้อมูล / เล่ม

| # | ประเด็น | ประเภท | สถานะ |
|---|---------|--------|--------|
| P1 | External = Google SSO + แนบบันทึกข้อความ → แอดมิน/อธิการบดีตรวจก่อนอนุมัติ/ปฏิเสธ | ยืนยัน flow (มีแล้ว — ตรวจเอกสารให้ตรง) | [~] |
| P2 | Waive ค่าธรรมเนียม — เดิมขอใส่ Limitation; **ตอนนี้มีในระบบแล้ว** (`approved_waived`) → อัปเดตบท 5 Discussion | ฟีเจอร์ + เอกสาร | [x] |
| P3 | Dashboard: สถิติอัตราใช้งานห้อง + รายได้ · Filter ด้านบนอัปเดตข้อมูลทั้งหน้าให้สอดคล้อง | ฟีเจอร์ / บัค UX | [x] |
| P4 | Citation `(1)` → `[1]` ทั้งเนื้อหาและ REFERENCES | เอกสารเล่ม | [x] |
| P5 | Data Dictionary หน้า 22 = **ตารางจริง** ไม่ใช่แคปรูป | เอกสารเล่ม | [x] |

### อ.ต้อง — นำไปใช้จริง / รายงาน / ส่งมอบ

| # | ประเด็น | ประเภท | สถานะ |
|---|---------|--------|--------|
| T1 | Export รายงานสรุป **Excel** จากข้อมูลย้อนหลัง (ตาม filter) | ฟีเจอร์ | [x] |
| T2 | Stripe test (PromptPay + บัตร) → ชำระสำเร็จอัปเดตสถานะ + Gmail | ยืนยัน (มีแล้ว — เดโม/เอกสาร) | [~] |
| T3 | ส่งมอบให้ส่วนทรัพย์สิน + CITS ให้ครบตาม Requirement | ส่งมอบ / เอกสาร | [~] |

### อ.โก — UX/UI / ข้อมูล / เทคนิค

| # | ประเด็น | ประเภท | สถานะ |
|---|---------|--------|--------|
| G1 | ตอนแอดมินอนุมัติ: Radio **ยกเว้นค่าธรรมเนียม** → `approved_waived`, ยอด 0, อีเมล, ไม่ Stripe | ฟีเจอร์ | [x] |
| G2 | หน้า Activity Log: Pagination + Search/Filter | UX | [x] |
| G3 | ข้างปุ่ม Import ห้อง: ปุ่มดาวน์โหลด **Excel Template** (= `data/room-pricing-rates.xlsx`, อัปเดตหลัง import) | UX | [x] |
| G4 | แก้ราคา/รายละเอียดห้อง **ห้ามกระทบ booking เก่า** — snapshot ใน bookings + test | ข้อมูล / เทส | [x] |
| G5 | Admin Users: ปุ่มเปิด–ปิดเป็น **Switch** แบบหน้าห้อง + ยุบคอลัมน์ | UX | [x] |
| G6 | หน้า Profile ฝั่ง User: Responsive มือถือ | UX | [x] |

---

## ออกแบบที่ยืนยันแล้ว (A)

- **Waive:** สถานะ `approved_waived` · `room_price`/`addons_price`/`total_price` = 0 · เก็บ `organization_type` อ้างอิง · อีเมล bilingual · cron เลื่อนเป็น `completed` หลังวันใช้งานเหมือนชำระแล้ว · รีวิวได้  
- **Export:** Excel เท่านั้น (`GET /api/admin/stats/export.xlsx`)  
- **Snapshot:** import/แก้ `room_pricing` ไม่แตะ `bookings.*_price` (มี unit test)

---

อัปเดตหลัง implement ตามคำตอบ waive = A · 2026-11-26
