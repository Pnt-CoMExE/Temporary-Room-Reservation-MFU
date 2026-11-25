# Checklist แก้เล่มรายงาน — ข้อติอาจารย์ (19 พ.ย. 2026)

**แหล่ง:** คลิปสอบ/คอมเมนต์ `2026-11-19 15-06-53.mp4`  
**ไฟล์เล่ม:** [`../final project/final project.docx`](../final%20project/final%20project.docx)  
**ขอบเขต:** แก้ในเล่ม Word — **ไม่เกี่ยวกับ** สไลด์ Canva / สคริปต์เดโม

**สถานะ 2026-11-23:** ใส่ใน `final project.docx` แล้ว (สำรอง `final project.backup-before-advisor-fixes.docx`)  
สคริปต์ที่ใช้: [`../final project/_apply_advisor_fixes.py`](../final%20project/_apply_advisor_fixes.py)  
ยังต้อง: เปิด Word ตรวจ layout แล้ว **Export PDF ใหม่** ทับ `final project.pdf`

---

## สรุปสั้น — ต้องทำอะไร

| # | หัวข้อ | สถานะ | ทำอะไร |
|---|--------|--------|--------|
| A | Citation / References ทั้งเล่ม | **ทำแล้วใน docx** | ใส่ `(1)`–`(9)` + หัวข้อ **REFERENCES** ท้ายเล่ม |
| B | ชื่อ Figure 3.1 | **ทำแล้ว** | proposed system (ตัด existing) |
| C | คำอธิบายใต้รูป Ch.3 | **ทำแล้ว** | อธิบาย actors / swim lane / site map / UI |
| D | UI Ch.3 vs Ch.4 | **ทำแล้ว** | โน้ต §3.4 + §4.1 |
| E | Data Dictionary | **ทำแล้ว** | ขยายรูปใน §3.6 (~1.18×) |
| F | รูปแบบหัวข้อ Ch.5 | **ทำแล้ว** | ตัวหนา 5.1–5.3 + ข้อเสนอแนะ 5.3.1–5.3.6 |
| G | บทที่ 4 ผลทดสอบ | ไม่ต้องแก้ | — |

---

## A. Chapter 2 + 3.7 — References

### A1. ในเนื้อหา ใส่หมายเลขอ้างอิงหลังชื่อเทคโนโลยี / แพลตฟอร์ม

ตัวอย่างแก้ข้อความ (วางแทนหรือต่อท้ายประโยคเดิม):

**§2.2.1**  

> Vue.js (1) and Tailwind CSS (2) were selected for the frontend… Node.js (3) and PostgreSQL (4) were chosen for the backend…

**§2.2.2**  

> Google OAuth (5) is utilized to handle user authentication securely (SSO)…

**§2.2.3**  

> Stripe (6) was selected as the acceptance path… Opn Payments / PromptPay (7) remain optional…

**§2.3**  

> commercial platforms such as Peerspace (8) and Skedda (9) were reviewed…

**§3.7** ใส่หมายเลขเดียวกันเมื่อกล่าวถึง Google OAuth / Stripe อีกครั้ง

### A2. ท้ายเล่ม เพิ่มหัวข้อ REFERENCES (ก่อนหรือหลัง Appendix ตามฟอร์แมตภาควิชา)

```
REFERENCES

(1) Vue.js. Official documentation. https://vuejs.org/
(2) Tailwind CSS. Official documentation. https://tailwindcss.com/
(3) OpenJS Foundation. Node.js. https://nodejs.org/
(4) The PostgreSQL Global Development Group. PostgreSQL. https://www.postgresql.org/
(5) Google. Google Identity / OAuth 2.0. https://developers.google.com/identity
(6) Stripe. Stripe Checkout / Payments. https://stripe.com/docs
(7) Opn Payments. Documentation. https://docs.opn.ooo/ (or current Opn URL used by the team)
(8) Peerspace. https://www.peerspace.com/
(9) Skedda. https://www.skedda.com/
```

หมายเหตุจากอาจารย์: จะแคปหน้าจอ Peerspace/Skedda ใส่ก็ได้ แต่ต้องมี Reference — อย่าเขียนเหมือนคิดขึ้นเอง

### A3. Checklist

- [x] §2.2 มี `(1)`–`(7)` ในเนื้อหา
- [x] §2.3 มี `(8)` `(9)`
- [x] §3.7 มี citation Google / Stripe
- [x] มีหัวข้อ **REFERENCES** ท้ายเล่ม เลขตรงกับในเนื้อหา
- [x] รูปแบบอ้างอิงทั้งเล่มชุดเดียว (วงเล็บเลข)

---

## B. Figure 3.1 — ตัดคำว่า Existing

**ตอนนี้ (ผิดตามข้อติ):**  
`Figure 3.1 Use case diagram for existing website`

**แก้เป็น:**  
`Figure 3.1 Use case diagram of the proposed Temporary Rental Space Management System`

และใน List of Figures + ประโยคนำหน้าใน §3.1 ให้ตรงกัน

ข้อความแนะนำใต้รูป (วางแทนประโยคสั้นเดิม):

> Figure 3.1 shows the use cases of the **proposed** system designed in Senior Project 1. Actors are the signed-in user (internal or external) and the administrator. The user can search rooms, submit a booking with a PDF memorandum, pay after approval, cancel, and review. The administrator can approve or reject requests, manage rooms and rates, and send announcements. This diagram is **not** a diagram of a previous production website.

- [x] แก้ caption + List of Figures
- [x] แก้ประโยคนำใน §3.1 (ลบ Existing)
- [x] เพิ่มคำอธิบาย actors / use cases ตามกล่องด้านบน

---

## C. Chapter 3 — อธิบายใต้รูป (อย่ามีแต่ชื่อรูป)

สำหรับแต่ละหัวข้อ ใส่ 2–4 ประโยคก่อนหรือหลัง caption

### C1. Swim lanes (§3.2)

**Figure 3.2 Login**  

> The swim lane shows Google sign-in. The browser redirects to Google, the backend receives the profile, classifies the user as internal or external from the email domain, issues a session, and returns the user to the home page. Admin access is not taken from the email domain alone.

**Figure 3.3 Booking**  

> The user selects a room and time slot, attaches a PDF memorandum, and submits. The system stores the request as waiting for approval and blocks an overlapping slot for the same room.

**Figure 3.4 Payment**  

> After approval, the user opens Stripe Checkout (test mode for UAT). On return, the booking becomes paid and the payment identifier is stored. An English Space Permit PDF may be emailed after a successful payment.

### C2. Site map (§3.3)

**Figure 3.5**  

> The site map groups public or user pages (login, home, rooms, booking, dashboard) and administrator pages (dashboard, bookings, rooms, content, users, logs). Only an administrator role can open the admin branch.

### C3. Proposed UI (§3.4) — เปลี่ยนคำนำ

แทนประโยคแบบ “The login page could be demonstrated by a user interface in Figure 3.6” ด้วยรูปแบบนี้ครั้งแรกของหมวด แล้วรูปถัดไปสั้นลงได้:

> Figures 3.6–3.28 are **proposed user interfaces** designed in Senior Project 1. They are wireframes or mock screens used before full implementation. They are **not** screenshots of an existing MFU production site. Screenshots of the running system after testing appear in Chapter 4 (Figures 4.1–4.15).

จากนั้นแต่ละกลุ่มหน้า ระบุหน้าที่สั้นๆ เช่น  

> Figure 3.6 is the proposed Google login screen.  
> Figures 3.7–3.10 show the proposed user home layout…

### C4. ER + Data Dictionary (§3.5–3.6)

> Figure 3.29 is the entity-relationship design for the proposed database (users, rooms, bookings, payments, add-ons, logs, and related tables).  
> Figures 3.30–3.38 list field names and data types for each table so the schema can be read without opening the database tool.

### C5. Checklist

- [x] §3.2 login / booking / payment มีคำอธิบาย
- [x] §3.3 site map มีคำอธิบาย
- [x] §3.4 มีย่อหน้าแยก proposed UI vs Ch.4 screenshots
- [x] §3.5–3.6 มีคำอธิบายสั้น
- [x] ไม่เหลือแต่ประโยค “could be demonstrated…” อย่างเดียวทั้งหมวด Ch.3

---

## D. แยก Chapter 3 UI กับ Chapter 4

เพิ่มกล่องสั้นต้น §3.4 และ/หรือต้น §4.1:

> **Design vs result.** Chapter 3 presents the analysis and the proposed interface from Senior Project 1. Chapter 4 presents the implemented system and the October–November test evidence. Where a Chapter 3 figure looks similar to a Chapter 4 screenshot, Chapter 3 is the design intent and Chapter 4 is the verified product screen.

- [x] มีประโยคแยก design / result ในเล่ม
- [x] ชื่อ UI ใน Ch.3 ใช้คำว่า **proposed** ไม่ใช้ **existing**

---

## E. Data Dictionary อ่านง่าย

- [x] ขยายรูป Figure 3.30–3.38 ใน docx (scale ~1.18×, cap ความกว้าง)
- [x] เปิด Word ดูว่าตัวอักษรในรูปอ่านชัดพอ — ถ้ายังเล็กให้แคปใหม่แล้ววางทับ
- [x] ตรวจว่าไม่มีภาพเบลอจากการย่อเกิน

---

## F. Format ทั้งเล่ม + Chapter 5

- [x] หัวข้อบทที่ 5 เป็นตัวหนา `5.1` / `5.2` / `5.3` และข้อเสนอแนะ `5.3.1`–`5.3.6`
- [x] เปิด Word ไล่ระยะห่าง/ฟอนต์ caption ทั้งเล่มด้วยตา
- [x] ถ้ายังมี field code โผล่ ให้ Update Fields ใน Word

---

## G. ไม่ต้องแก้จากคลิปนี้

- Chapter 4 ผลทดสอบ 80 เคส / Stripe / Docker — อาจารย์รับว่ามีการทดสอบระบบจริงแล้ว
- สไลด์นำเสนอ / สคริปต์เดโม — อยู่นอกคลิปนี้

---

## ลำดับงานแนะนำ (1–2 วัน)

1. แก้ชื่อ Figure 3.1 + List of Figures (**B**)
2. เขียนย่อหน้าแยก Ch.3 / Ch.4 (**D**) + คำอธิบายรูปหลัก (**C**)
3. ใส่ citation ใน Ch.2 / 3.7 + สร้าง REFERENCES (**A**)
4. ขยาย Data Dictionary (**E**)
5. ไล่ format หัวข้อ/caption ทั้งเล่ม โดยเฉพาะ Ch.5 (**F**)
6. Export PDF แล้วเช็คว่าไม่มี Existing website / ไม่มี REF field โผล่ / Reference ครบ

---

อัปเดต 2026-11-23 · จากถอดเสียงคลิปอาจารย์ + สแกน `final project.docx`
