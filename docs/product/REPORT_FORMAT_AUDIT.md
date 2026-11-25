# Report Format Audit — English Senior Project

**ไฟล์ที่ตรวจ:** [`../final project/final project.docx`](../final%20project/final%20project.docx)  
**วันที่ตรวจ:** 2026-11-24  
**อัปเดตใน docx:** 2026-11-24 (สำรอง `final project.backup-before-format-remaining.docx`)  
**เกณฑ์:** รูปแบบเล่มโครงงานภาษาอังกฤษมาตรฐาน (หัวข้อ–เนื้อหา–รูป–คำบรรยาย–อ้างอิง)  
**ขอบเขต:** ฟอร์แมต + ความสอดคล้องการนำเสนอ ไม่ได้ตรวจเนื้อหาทดสอบบทที่ 4 ใหม่ทั้งก้อน

สถานะสัญลักษณ์: **ต้องแก้** · **ควรแก้** · **ผ่าน / รับได้** · **แก้ใน docx แล้ว**

---

## สรุปภาพรวม

เล่มมีโครงบทครบ 1–5 มี List of Tables / Figures และมี REFERENCES แล้ว แต่ยังไม่ผ่านฟอร์แมตมาตรฐานเต็มข้อ โดยเฉพาะ **การจัดย่อหน้า (เยอะมากที่จัดกลาง)**, **ช่องว่างเลขหัวข้อในบทที่ 1**, **ภาษานำเข้ารูปบทที่ 4**, และ **ยังไม่มีลิงก์ GitHub**

| ความสำคัญ | จำนวนประเด็นหลัก |
|-----------|------------------|
| ต้องแก้ | 6 |
| ควรแก้ | 7 |
| ผ่าน / รับได้ | 5 |

---

## 1) ต้องแก้

### 1.1 ย่อหน้าเนื้อหาถูกจัดกึ่งกลาง (Center)

ใน Word พบย่อหน้าแบบ Center จำนวนมาก (~230) ขณะที่เนื้อหาบทควรเป็น **Justify** หรืออย่างน้อยชิดซ้าย

ตัวอย่างที่ผิดชัด: คำอธิบาย Figure 3.2 / 3.3 ถูกจัดกลางเหนือรูป ทำให้ดูไม่ใช่เล่มวิชาการ

**มาตรฐาน:**  
- หัวบท / ชื่อรูป: center ได้  
- ย่อหน้าอธิบาย: justify / left  
- caption ใต้รูป: center ได้

**แก้:** เลือกย่อหน้าเนื้อหาทั้งหมดในบทที่ 1–5 แล้วตั้งเป็น Justify (ยกเว้น caption และชื่อ CHAPTER)

---

### 1.2 ลำดับเลขหัวข้อบทที่ 1 ขาดช่วง

ตอนนี้พบ:

- มี `1.4.1`, `1.4.2`, `1.4.2.1` แล้วกระโดดไป `1.4.4`, `1.4.5` — **ไม่มี 1.4.3**
- มี `1.4` แล้วกระโดดไป `1.6` — **ไม่มี 1.5** (ในสารบัญเคยมี Plan / Table 1.1)

**มาตรฐาน:** เลขหัวข้อต้องต่อเนื่อง ไม่ข้ามโดยไม่มีคำอธิบาย

**แก้ทางเลือก:**  
- ใส่ `1.5 Plan` กลับมา (คู่ Table 1.1) และใส่ `1.4.3` หรือ  
- รันเลขใหม่ให้ต่อเนื่อง (เช่น 1.4.3 = Testing, 1.4.4 = Documentation, แล้ว Expected Result เป็น 1.5)

---

### 1.3 บทที่ 4 ยังใช้ประโยคนำรูปแบบอ่อน

ยังเหลือประมาณ 15 จุดในรูปแบบ:

> … could be demonstrated by a user interface in Figure 4.x

**มาตรฐานภาษาอังกฤษในรายงาน:** ใช้ present / active ที่ชัด เช่น  
> Figure 4.1 shows …  
> The signed-in internal user is shown in Figure 4.1.

**แก้:** เปลี่ยนทุกประโยค “could be demonstrated…” ในบทที่ 4 ให้เป็น “Figure 4.x shows …”

---

### 1.4 ยังไม่มีลิงก์ GitHub ในเล่ม

การสแกนไม่พบ `github.com` ใน `.docx`

**มาตรฐาน / ตามที่อาจารย์ขอ:** ใส่ที่มาของซอร์สโค้ด

**ตำแหน่งแนะนำ:** §1.7 Place and Equipment → Software  
ข้อความตัวอย่าง:

> Source code repository: https://github.com/Pnt-CoMExE/Temporary-Room-Reservation-MFU

ทางเลือกเสริม: หัวข้อสั้น **SOURCE CODE** หลัง REFERENCES

---

### 1.5 เนื้อหา Figure 3.1 ไม่สอดคล้องข้อความในเล่ม

ข้อความบอก actor หลักเป็น signed-in user กับ administrator แต่ในรูปยังมี **Collaborative User** เป็น actor แยก ทั้งที่บทอื่นบอกว่า collaborative เป็นเรตที่แอดมินเลือกตอนอนุมัติ

**มาตรฐาน:** รูปกับคำบรรยายต้องสื่อความหมายเดียวกัน

**แก้:** แก้ไดอะแกรมให้เหลือ Internal / External / Admin หรือระบุในคำอธิบายว่า Collaborative ในรูปหมายถึง rate path ไม่ใช่บัญชีแยก (ถ้าเก็บ actor ไว้)

---

### 1.6 สารบัญ / List of Figures ยังอ่านยาก

- มีหัว **LIST OF FIGURES** ซ้ำสองครั้งในเอกสาร  
- บางบล็อกสารบัญรวมหลายบรรทัดในย่อหน้าเดียวด้วยแท็บ ทำให้จัดหน้าไม่นิ่ง

**มาตรฐาน:** สารบัญและรายการรูปเป็นรายการทีละบรรทัด หรือสร้างด้วย Table of Figures ของ Word แล้ว Update Field

**แก้:** สร้าง/อัปเดต TOC และ Table of Figures ใหม่ใน Word แทนการวางข้อความมือทั้งก้อนถ้าเป็นไปได้

---

## 2) ควรแก้

### 2.1 สไตล์หัวข้อเป็น Normal ทั้งเล่ม

หัวข้อ `CHAPTER 3`, `3.1`, `5.1` ใช้สไตล์ **Normal** ไม่ได้ใช้ Heading 1/2/3

**ผล:** สารบัญอัตโนมัติทำยาก ระดับหัวข้อดูไม่สม่ำเสมอ

**แก้:** กำหนด Heading 1 = CHAPTER, Heading 2 = 3.1 / 5.1, Heading 3 = 3.1.1 แล้วอัปเดต TOC

---

### 2.2 ลำดับ “คำอธิบาย → รูป → caption” บางจุดยังแน่นเกินไป

มาตรฐานที่อ่านง่าย:

1. ประโยคนำสั้น (1–3 ประโยค)  
2. รูป  
3. `Figure x.y …` ใต้รูป  
4. (ถ้าจำเป็น) อธิบายเพิ่มหลัง caption

ตอนนี้บางหมวดคำอธิบายยาวชิดขอบรูป และบางจุดจัดกลาง ทำให้ดูแน่น

---

### 2.3 คำนำหน้ารูปบทที่ 3 / 4 ยังคนละโทน

- บทที่ 3 หลังแก้แล้วใช้ “Figure 3.x shows …”  
- บทที่ 4 ยังเป็น “could be demonstrated …”

ควรใช้สูตรเดียวกันทั้งเล่ม

---

### 2.4 Keyword ควรเป็น Keywords

หน้า Abstract ใช้ `Keyword:` เอกพจน์

**มาตรฐาน:** `Keywords:`

---

### 2.5 CONTENTS กับ Abstract จัดกลางได้ แต่เนื้อหาสารบัญควรเป็นตาราง/แท็บคงที่

ชื่อหน้า `CONTENTS` รับได้ แต่รายการภายในควรชิดซ้าย + จุดนำ / แท็บ leader ให้เลขหน้าตรงคอลัมน์

---

### 2.6 §1.3.1 ยังเขียน Collaborative เป็นประเภทผู้ใช้แยก

ใน Scope ยังมี Collaborative Users เป็นหมวดผู้ใช้ ขณะที่ Discussion / Payment and rates บอกว่าไม่มีปุ่มตั้งคนเป็น collaborative

**ควรแก้:** เติมประโยคใน §1.3.1.2 ว่าในระบบที่ส่งมอบ collaborative เป็นอัตราที่แอดมินเลือกตอนอนุมัติ หรือปรับข้อความให้ตรงบทที่ 5

---

### 2.7 ตรวจ PDF หลังแก้

`final project.pdf` อาจยังเป็นฉบับเก่ากว่า `.docx`  
หลังจัด format แล้วต้อง Export PDF ใหม่ทุกครั้ง

---

## 3) ผ่าน / รับได้

| รายการ | โน้ต |
|--------|------|
| โครงบท 1–5 | ครบ Introduction → Literature → Analysis → Experiment → Conclusion |
| มี List of Tables / List of Figures | มี แม้ต้องจัดรูปแบบใหม่ |
| มี REFERENCES (1)–(9) | มีแล้วหลังแก้ตามอาจารย์ |
| Caption รูปขึ้นต้นด้วย Figure x.y | รูปแบบชื่อรับได้ |
| บทที่ 4 ผลทดสอบ 80 เคส | เนื้อหาผลทดสอบอาจารย์รับแล้วจากคลิปสอบ |
| Caption Figure 3.1 สั้นลงแล้ว | `… of the proposed system` อยู่บรรทัดเดียวได้ |

---

## 4) Checklist ทำใน Word (เรียงลำดับ)

- [x] ย่อหน้านำรูป/เนื้อหาที่เคย Center จำนวนมาก → **Justify** (caption สั้นยัง Center ได้)
- [x] หัวข้อ `Plan` → `1.5 Plan` (มี `1.4.3` อยู่แล้ว)
- [x] ใส่ GitHub ที่ §1.7 Software
- [x] เปลี่ยนประโยคนำรูปบทที่ 4 ทั้ง 15 จุดเป็น `Figure 4.x shows …`
- [x] ย่อประโยคนำ Figure 3.2–3.5 / 3.6–3.28 / 3.29 / 3.30–3.38
- [x] เติมประโยค collaborative rate ในคำอธิบาย Figure 3.1
- [x] แก้ `Keyword:` → `Keywords:`
- [ ] สร้าง/อัปเดต TOC + Table of Figures ลดรายการซ้ำ (ทำใน Word)
- [ ] (แนะนำ) ใส่ Heading styles ให้หัวข้อ
- [ ] Export PDF ใหม่ แล้วไล่ดูทีละบท
- [ ] ถ้า Figure 3.1 ในรูปยังมี Collaborative User เป็น actor แยก → แก้รูปในไดอะแกรม

---

## 5) ตัวอย่างประโยคมาตรฐาน (คัดลอกใช้ได้)

**นำเข้ารูป**

> The signed-in internal classification is shown in Figure 4.1.

**แทนประโยคเดิม**

> ~~The internal member login could be demonstrated by a user interface in Figure 4.1.~~

**GitHub ใน §1.7**

> Source code repository: https://github.com/Pnt-CoMExE/Temporary-Room-Reservation-MFU

**§3.1 ย่อหน้าสั้น (justify)**

> The use cases of the proposed system are shown in Figure 3.1. The actors are the signed-in user (internal or external) and the administrator. The user can search rooms, submit a booking with a PDF memorandum, pay after approval, cancel, and review. The administrator can approve or reject requests, manage rooms and rates, and send announcements.

---

## อ้างอิงภายในโปรเจกต์

- ข้อติอาจารย์รอบ 19 พ.ย.: [`ADVISOR_REPORT_FIX_CHECKLIST.md`](./ADVISOR_REPORT_FIX_CHECKLIST.md)
- Checklist บท 3–5: [`THESIS_CHAPTERS_CHECKLIST.md`](./THESIS_CHAPTERS_CHECKLIST.md)

อัปเดต 2026-11-24
