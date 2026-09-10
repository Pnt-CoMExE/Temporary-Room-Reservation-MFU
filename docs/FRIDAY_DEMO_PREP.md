# เตรียมตรวจงาน — Demo โฟลว์หลัก + Security + แผน Testing

**สำหรับ:** นำเสนอหน้าอาจารย์  
**อัปเดต:** 2026-09-10 (รวมข้อเสนอแนะจาก Standard recording 1)  
**โฟกัสรอบนี้:**
1. Demo **โฟลว์หลัก** ให้เห็นว่าระบบทำงานอย่างไร  
2. อธิบาย **Security** โดยเฉพาะ Authentication / Authorization และขั้นตอนหน้าบ้าน↔หลังบ้าน  
3. โชว์ **แผน Testing** แยกตามโมดูล/sprint ว่าจะพิสูจน์อะไร ผ่าน/ยังขาดอะไร  

**ไม่โฟกัสรอบนี้:** UAT กับผู้ใช้จริงยาว ๆ, Sign-Off หน่วยงาน, ฟังก์ชันเสริมลึก ๆ  

เอกสารคู่:
- Security ละเอียด: [`DEMO_SECURITY.md`](./DEMO_SECURITY.md)
- แผนทดสอบแยกโมดูล: [`TESTING_PLAN.md`](./TESTING_PLAN.md)

---

## สรุปสิ่งที่อาจารย์อยากได้ (Recording 1)

| หัวข้อ | สิ่งที่ต้องเตรียม |
|--------|-------------------|
| Demo | โชว์โฟลว์หลัก + อธิบายให้ดู |
| Security | อธิบาย Authentication ใช้อะไร เกิดอะไรระหว่าง FE กับ BE |
| Testing | มีแผน testing แยกให้ดู — แต่ละโมดูล/sprint ผ่านหรือยัง |
| ลำดับงาน | ฟังก์ชันหลัก → ทดสอบให้ถูก → ค่อยทำเสริม (เช่น Payment) |
| QA ในอนาคต | คิดวิธีทดสอบ โดยเฉพาะทางไป automated test |

### คำตอบสั้น: ต้องเตรียม “เว็บจริงตั้งแต่ต้น” หรือไม่?

> **ไม่จำเป็นต้องรื้อทำเว็บใหม่** — ใช้อินสแตนซ์ที่รันได้ของระบบปัจจุบัน (localhost / Docker)  
> สิ่งที่อาจารย์ต้องการคือ **Demo โฟลว์หลัก** และ **อธิบายขั้นตอน Auth หน้าบ้าน↔หลังบ้าน** ให้ชัด  
> ไม่ใช่การพรีเซนต์เอกสารอย่างเดียว และไม่ใช่การโชว์ทุกฟีเจอร์ย่อย

---

## 0. โครงนำเสนอที่แนะนำ (รวม ~25 นาที)

| ช่วง | เวลา | เนื้อหา |
|------|------|---------|
| เปิด | 1 นาที | วันนี้โชว์ 3 อย่าง: โฟลว์หลัก / Security / แผน Testing |
| **ส่วน 1: Demo โฟลว์หลัก** | 7–8 นาที | Login → หาห้อง → จอง → Admin อนุมัติ → (mock จ่ายสั้น ๆ ถ้ามีเวลา) |
| **ส่วน 2: Security** | 8–10 นาที | AuthN ทีละขั้น FE↔BE + AuthZ + Token (DevTools) |
| **ส่วน 3: แผน Testing** | 4–5 นาที | เปิด `TESTING_PLAN.md` — โมดูล / สถานะ / ขั้นถัดไป |
| ปิด | 1–2 นาที | ลำดับงานถัดไปตามอาจารย์: core แน่น → test → Payment → deploy |
| Q&A | ตามอาจารย์ | |

---

## 1. ก่อนเปิด Demo (Checklist 5 นาที)

- [ ] รันระบบพร้อมใช้ เช่น Docker ที่ `http://localhost:8080`  
  หรือ `npm run dev` (frontend :5173 / backend :3000)
- [ ] มีบัญชี Demo ตามตารางด้านล่าง (ตั้งใน `.env` แล้ว **login ใหม่** หลังเปลี่ยน env)
  - **Admin:** `comza962@gmail.com` (`DEV_ADMIN_EMAILS`)
  - **Internal:** `6631501071@lamduan.mfu.ac.th` (`DEV_INTERNAL_EMAILS`)
  - หรือ `@property.mfu.ac.th` / `@mfu.ac.th` ตามโดเมนจริง
- [ ] `PAYMENT_PROVIDER=mock_sandbox` (โชว์สั้นได้ ไม่ต้องเน้น)
- [ ] เปิด Chrome DevTools: **Application** (Cookies / localStorage) + **Network**
- [ ] เปิดแท็บ `docs/TESTING_PLAN.md` พร้อมโชว์
- [ ] (แนะนำ) รัน `cd backend && npm test` ล่วงหน้า แล้วกรอกช่องผ่าน/ไม่ผ่านใน TESTING_PLAN
- [ ] โฟกัสโฟลว์หลัก — อย่าเดิน UAT scenarios ทั้งเล่ม

คำสั่ง Docker (ถ้าใช้ชุด local):

```bash
docker compose -f docker-compose.prod.yml -f docker-compose.local.yml --env-file .env.production up -d
```

---

## 2. สคริปต์พูด — เปิดงาน (≈ 1 นาที)

> “สวัสดีครับ/ค่ะ วันนี้ทีมเตรียมตามที่อาจารย์แนะนำไว้ 3 ส่วน  
> **หนึ่ง** Demo โฟลว์หลักของระบบจองพื้นที่ ให้เห็นว่าทำงานอย่างไร  
> **สอง** อธิบาย Security โดยเฉพาะ Authentication และ Authorization ว่าหน้าบ้านกับหลังบ้านคุยกันยังไง  
> **สาม** แผน Testing แยกตามโมดูล ว่าตอนนี้ทดสอบอะไรไปแล้ว และขั้นถัดไปคืออะไร  
> จะไม่เน้น UAT กับผู้ใช้จริงยาว ๆ ในรอบนี้ครับ/ค่ะ”

---

## 3. ส่วนที่ 1 — Demo โฟลว์หลัก (≈ 7–8 นาที)

### เป้าหมายที่อาจารย์ควร “เห็น”

ระบบใช้งานได้ตามเส้นทางหลัก: **Login → ค้นหา/เลือกห้อง → ส่งจอง → Admin อนุมัติ**  
(Mock จ่ายเงินโชว์สั้นได้ แต่ไม่ต้องลงลึก — Payment เป็นขั้นเสริมตามที่อาจารย์บอก)

### Flow ที่แนะนำ

| ขั้น | ทำอะไรบนจอ | พูดสั้น ๆ |
|------|-------------|-----------|
| 1 | หน้า Home / รายการห้อง | “ผู้ใช้ค้นหาและดูรายละเอียดพื้นที่ได้” |
| 2 | Login ด้วย Google | “ยืนยันตัวตนผ่าน Google OAuth — เดี๋ยวจะขยายในส่วน Security” |
| 3 | เลือกห้อง → ส่งคำขอจอง | “สร้างคำขอ สถานะรออนุมัติ” |
| 4 | สลับ Admin → อนุมัติจอง | “เจ้าหน้าที่อนุมัติคำขอได้” |
| 5 | (ถ้ามีเวลา) Mock จ่ายสั้น ๆ | “Payment ตอนนี้เป็น mock — จัดเป็นขั้นถัดไปหลัง core + testing แน่น” |

### สคริปต์พูดระหว่าง Demo

**ตอนเข้า Home / ห้อง**

> “นี่คือหน้าสำหรับผู้ใช้ทั่วไป สามารถดูประเภทพื้นที่และรายละเอียดได้ครับ/ค่ะ”

**ตอน Login**

> “ระบบไม่เก็บรหัสผ่านเอง ใช้ Google OAuth เมื่อ Google ยืนยันแล้ว Backend จะออก JWT ให้ Browser ซึ่งจะอธิบายทีละขั้นในส่วน Security”

**ตอนส่งคำขอจอง**

> “ผู้ใช้เลือกวัน ช่วงเวลา แล้วส่งคำขอ สถานะรอเจ้าหน้าที่ตรวจ”

**ตอน Admin อนุมัติ**

> “ฝั่ง Admin เป็นของส่วนจัดการทรัพย์สิน เห็นรายการรออนุมัติแล้วกดอนุมัติหรือปฏิเสธได้”

**ปิดส่วน Demo**

> “สรุปโฟลว์หลักใช้งานได้ ต่อไปขออธิบาย Authentication / Authorization ระหว่างหน้าบ้านกับหลังบ้าน”

### สิ่งที่ควรเลี่ยง

- อย่าอ่าน UAT test case ทั้งเล่ม
- อย่าค้างกรอกฟอร์มทุกช่อง — เตรียมข้อมูลล่วงหน้า
- อย่าสัญญาว่า Payment production พร้อมแล้ว

---

## 4. ส่วนที่ 2 — อธิบาย Security (≈ 8–10 นาที)

พูดตามลำดับ: **Authentication (ทีละขั้น FE↔BE) → Authorization → Token**

### 4.1 Authentication — อธิบายเป็นขั้น (สำคัญตาม Recording 1)

**ประโยคเปิด**

> “Authentication คือการยืนยันว่าผู้ใช้คือใคร เราใช้ **Google OAuth 2.0** ขออธิบายทีละขั้นว่าหน้าบ้านกับหลังบ้านทำอะไร”

**ลำดับพูดขณะชี้จอ / เปิดโค้ด**

| ขั้น | ใครทำ | เกิดอะไร |
|------|--------|----------|
| 1 | Frontend | ผู้ใช้กด Sign in with Google → ไปที่ Backend `/api/auth/google` |
| 2 | Backend ↔ Google | Redirect ไป Google ให้ผู้ใช้ล็อกอิน/ยินยอม |
| 3 | Google → Backend | Callback `/api/auth/google/callback` พร้อมข้อมูลโปรไฟล์ |
| 4 | Backend | หา/สร้าง user ใน DB + `resolveUserType(email)` กำหนด role |
| 5 | Backend → Browser | `jwt.sign(...)` แล้วตั้ง cookie `mfu_token` (HttpOnly) |
| 6 | Frontend | รับ redirect สำเร็จ เติม localStorage สำหรับ UI เท่านั้น |
| 7 | ครั้งถัดไป | Browser ส่ง cookie กับคำขอ `/api/*` → `verifyToken` |

**โชว์บนจอ**

- DevTools → Application → Cookies → `mfu_token` (HttpOnly)
- Network → request หลัง login มี Cookie ติดไป
- (ถ้าอาจารย์ขอ) เปิด `backend/src/routes/auth.routes.ts`

---

### 4.2 Authorization (สิทธิ์การเข้าถึง)

**ประโยคเปิด**

> “Authorization คือคนที่ login แล้วทำอะไรได้บ้าง เรากันทั้งหน้าเว็บและ API”

**Role**

| อีเมล | Role |
|--------|------|
| `@property.mfu.ac.th` | admin |
| `@mfu.ac.th` | internal |
| อื่นๆ | external |
| `DEV_ADMIN_EMAILS` | admin (ทดสอบเท่านั้น) |
| `DEV_INTERNAL_EMAILS` | internal (ทดสอบเท่านั้น) |
| Demo รอบนี้ | `comza962@gmail.com` → admin · `6631501071@lamduan.mfu.ac.th` → internal |

**สองชั้น**

1. **Frontend route guard** — `router/index.ts` กันหน้า `/admin/*` (UI)
2. **Backend** — `verifyToken` (401) / `verifyAdmin` (403) + ownership จาก JWT (สิทธิ์จริง)

**Demo สั้น**

| การกระทำ | ผล | พูดว่า |
|----------|-----|--------|
| ไม่ login เรียก API ที่ต้อง auth | 401 | ยังไม่ผ่าน Authentication |
| User เปิด `/admin/...` | เด้ง | Route protection หน้าบ้าน |
| JWT user ยิง `/api/admin/...` | 403 | เลี่ยงหน้าเว็บไปยิง API ก็ยังโดนบล็อก |

---

### 4.3 Token (รับ–ส่ง–เก็บ)

1. **สร้าง:** Backend หลัง OAuth — payload `{ userId, email, role, name }`  
2. **เก็บ:** Cookie `mfu_token` (HttpOnly, SameSite=lax)  
3. **ส่งกลับ:** Browser แนบ cookie อัตโนมัติ (`withCredentials`)  
4. **localStorage:** UI เท่านั้น — API ไม่เชื่อ  
5. **Logout:** เคลียร์ cookie + localStorage  

**ประโยคสรุป (ท่องได้)**

> “ยืนยันตัวตนด้วย Google OAuth จากนั้น Backend ออก JWT เก็บใน HttpOnly cookie  
> ทุก API ที่ต้อง login ตรวจด้วย `verifyToken`  
> สิทธิ์ใช้ role ใน JWT และ `verifyAdmin` สำหรับงานเจ้าหน้าที่  
> หน้าเว็บมี route guard เป็นชั้นแรก แต่สิทธิ์จริงอยู่ที่ Backend”

---

## 5. ส่วนที่ 3 — แผน Testing (≈ 4–5 นาที) ★ ของใหม่จาก Recording 1

เปิดไฟล์ [`TESTING_PLAN.md`](./TESTING_PLAN.md) บนจอ

**สคริปต์**

> “นอกจาก Demo แล้ว อาจารย์อยากเห็นภาพแผนทดสอบ ทีมจึงแยกแผนตามโมดูลหลักไว้ครับ/ค่ะ  
> เช่น Authentication, Authorization, โฟลว์จอง, Admin, และ Payment  
> ตอนนี้มี automated ฝั่ง backend ด้วย Vitest, มี E2E ด้วย Playwright และมี CI  
> ตามที่อาจารย์แนะนำ เราถือว่าฟังก์ชันหลักต้องถูกและมี test รองรับก่อน ส่วน Payment gateway จริงเป็นขั้นเสริมถัดไป  
> UAT ผู้ใช้จริงยังไม่เน้นรอบนี้ แต่เก็บเอกสาร scenario ไว้แล้ว”

ชี้ตารางสั้น ๆ:
- โมดูลไหน ✅ แล้ว  
- โมดูลไหน 🔄 โชว์ด้วย Demo  
- ขั้นต่อไป: กรอกช่องผ่าน/ไม่ผ่านหลังรันเทส + ขยาย automated บนโฟลว์หลัก

---

## 6. ปิดงาน + ลำดับงานถัดไป (≈ 1–2 นาที)

> “สรุปลำดับตามคำแนะนำอาจารย์ครับ/ค่ะ  
> **1)** คงคุณภาพโฟลว์หลัก + Security  
> **2)** เดินตามแผน Testing / ขยาย automated  
> **3)** ค่อยต่อ Payment (free/sandbox gateway)  
> **4)** แล้วจึง Deployment  
> วันนี้ขอรับฟีดแบ็กเพิ่มในจุดที่ยังอยากให้ปรับครับ/ค่ะ”

---

## 7. ถ้าอาจารย์ถาม — คำตอบสั้น

| คำถาม | คำตอบสั้น |
|--------|-----------|
| ต้องมีเว็บจริงตั้งแต่ต้นไหม? | ใช้ระบบที่รันได้ของโปรเจกต์นี้ Demo โฟลว์หลัก + อธิบาย Auth ไม่ต้องรื้อทำใหม่ |
| ทำไมไม่เก็บ token ใน localStorage? | กัน XSS — ใช้ HttpOnly cookie |
| ทำไมมีทั้ง cookie กับ localStorage? | cookie = สิทธิ์จริง, localStorage = UI |
| แก้ role ใน localStorage เป็น admin ได้ไหม? | UI อาจหลอกได้ชั่วคราว แต่ API ยัง 403 |
| มี testing แล้วยัง? | มีแผนแยกโมดูล + Vitest/Playwright/CI — โชว์ใน TESTING_PLAN |
| Payment พร้อมยัง? | มี mock และเทส ownership แล้ว; gateway จริงทำหลัง core+test ตามลำดับที่อาจารย์แนะนำ |
| UAT ทำแล้วหรือยัง? | เอกสารพร้อม แต่รอบนี้ไม่เน้นผู้ใช้จริง ตามที่คุยไว้ |
| ใครเป็น admin? | `@property.mfu.ac.th` หรือ Demo: `comza962@gmail.com` ผ่าน `DEV_ADMIN_EMAILS` |
| ใครเป็น internal ตอน Demo? | `6631501071@lamduan.mfu.ac.th` ผ่าน `DEV_INTERNAL_EMAILS` (หรือ `@mfu.ac.th`) |
| โปรเจกต์นี้เป็น MVC ไหม? | ไม่ใช่ MVC เซิร์ฟเวอร์แบบตำรา 100% — เป็น **SPA (Vue) + REST API (Express)** แต่แยกชั้นแนว MVC ได้ (ดู §10) |

---

## 8. แบ่งหน้าที่ทีมวัน Demo

| คน | หน้าที่ |
|----|---------|
| คนที่ 1 | Demo โฟลว์หลัก + พูดจอ |
| คนที่ 2 | สลับ User/Admin + DevTools ตอน Security |
| คนที่ 3 | เปิดโค้ด Auth เมื่อถูกถาม + โชว์ `TESTING_PLAN.md` |
| คนที่ 4 (ถ้ามี) | จดคำถาม / งานที่อาจารย์มอบรอบถัดไป |

---

## 9. ไฟล์ที่ควรเปิดไว้

1. เอกสารนี้ — สคริปต์พูด  
2. [`TESTING_PLAN.md`](./TESTING_PLAN.md) — แผนทดสอบแยกโมดูล  
3. [`DEMO_SECURITY.md`](./DEMO_SECURITY.md) — ไดอะแกรม Token  
4. โค้ด: `auth.routes.ts`, `auth.ts`, `resolveUserType.ts`, `router/index.ts`  
5. ระบบที่รันอยู่: `http://localhost:8080` (หรือ dev ports)

---

## 10. MVC คืออะไร — กับโปรเจกต์นี้ (ถ้าอาจารย์ถาม)

### คำตอบตรง ๆ

> “โปรเจกต์นี้ **ไม่ได้ทำเป็น MVC แบบคลาสสิกบนเซิร์ฟเวอร์** ที่ View เรนเดอร์จาก Backend  
> แต่เป็นสถาปัตยกรรม **SPA + API**: หน้าบ้าน Vue แยกจากหลังบ้าน Express  
> ภายในยัง **แยกหน้าที่แนวเดียวกับ MVC** ได้ครับ/ค่ะ”

### Map แบบเปรียบเทียบ (พูดชี้โฟลเดอร์ได้)

| แนว MVC | ในระบบนี้ | ตัวอย่าง |
|---------|-----------|----------|
| **View** | Frontend Vue (หน้าจอ) | `frontend/src/views/...` |
| **Controller** | Express routes + middleware | `backend/src/routes/*.ts`, `verifyToken` |
| **Model** | ข้อมูล/ธุรกิจ + DB | PostgreSQL, `db.ts`, บางส่วนใน `services/` |

ฝั่ง Vue เองใกล้แนว **MVVM** (View + state/reactivity) มากกว่า MVC แท้ — ไม่จำเป็นต้องย้ำถ้าอาจารย์ไม่ได้ถามลึก

### สคริปต์พูด ~30–45 วินาที

> “MVC คือการแยก Model ข้อมูล, View หน้าจอ, และ Controller ตัวรับคำขอ  
> ระบบเราแยกหน้าบ้านกับหลังบ้านชัดเจน View อยู่ที่ Vue Controller หลักอยู่ที่ API routes  
> ส่วน Model คือฐานข้อมูลและการทำงานกับข้อมูล  
> ดังนั้นจึง **ใช้แนวคิดแยกชั้นแบบ MVC** แต่รูปแบบจริงคือ **Client–Server / SPA + REST API** ไม่ใช่ MVC ไฟล์เดียวแบบเฟรมเวิร์กเก่า  
> ข้อดีคือทดสอบและคุม Security ที่ Controller/Backend ได้ชัด เช่น ตรวจ JWT ที่ `verifyToken` ไม่ให้ View เป็นคนกำหนดสิทธิ์”

### อย่าพูดแบบนี้ (คลาดเคลื่อน)

- “โปรเจกต์เราเป็น MVC 100%” → อาจารย์ที่เคร่งสถาปัตยกรรมอาจแก้ทันที  
- “Vue คือ Controller” → หน้า Vue เป็น View เป็นหลัก; logic เรียก API เป็นชั้นประสาน ไม่ใช่ Controller ของทั้งระบบ

### ถ้าอาจารย์ถามลึก — ตอบทีละชั้น

#### Q1: MVC คลาสสิกต่างจากของเราอย่างไร?

| MVC คลาสสิก (เช่น Laravel Blade / ASP.NET MVC เก่า) | ระบบเรา |
|-----------------------------------------------------|---------|
| Browser ขอหน้า → Server รวม Model+View ส่ง HTML กลับ | Browser โหลด Vue ครั้งเดียว แล้วเรียก API เป็น JSON |
| Controller เลือกไฟล์ View บนเซิร์ฟเวอร์ | Express ส่งข้อมูลอย่างเดียว ไม่เรนเดอร์หน้าจอ |
| State อยู่เซิร์ฟเวอร์/เซสชันหน้าเต็ม ๆ | UI state อยู่ฝั่ง Vue; สิทธิ์จริงอยู่ JWT ฝั่ง API |

**พูด:**  
> “MVC แบบตำรา View ถูกสร้างที่เซิร์ฟเวอร์ ของเรา View อยู่ที่ client และคุยกับ Backend ผ่าน REST API จึงเรียกว่า SPA + API หรือ Client–Server ชัดกว่าคำว่า MVC ล้วน ๆ”

#### Q2: แล้วทำไมยังพูดถึง MVC ได้?

> “เพราะหลักการเดียวกันคือแยกหน้าที่ — ไม่ให้หน้าจอไปยุ่งกับ SQL โดยตรง และไม่ให้ชั้นข้อมูลไปวาด HTML  
> เรา map ได้ว่า View=Vue, Controller≈routes/middleware, Model≈DB+services  
> แต่โครงสร้างโฟลเดอร์และ runtime ไม่ได้เป็นเฟรมเวิร์ก MVC เดียว”

#### Q3: ฝั่ง Vue เป็นอะไร ถ้าไม่ใช่ MVC?

> “ฝั่ง frontend ใกล้ **MVVM** มากกว่าครับ/ค่ะ — Template คือ View, ข้อมูล reactive/`ref` ทำหน้าที่คล้าย ViewModel, ส่วน Model จริง ๆ ของธุรกิจอยู่หลังบ้าน  
> Router guard เป็นแค่ตัวช่วยนำทาง ไม่ใช่ Authorization จริง”

#### Q4: Backend แยกชั้นยังไง ถ้าไม่ใช่ MVC เป๊ะ?

พูดชี้โฟลเดอร์:

1. **`routes/`** — รับ HTTP คล้าย Controller  
2. **`middleware/`** — ตัดขวาง เช่น `verifyToken`, validate (ก่อนเข้า logic)  
3. **`services/`** — ตรรกะที่ซับซ้อนขึ้น (อีเมล, PDF, payment adapter)  
4. **`db.ts` + PostgreSQL** — ชั้นข้อมูล  

> “บางจุดยังมี SQL ใน route โดยตรง ซึ่งในอุดมคติอาจดึงเข้า service/repository ให้บางลง แต่ภาพรวมยังแยก API ออกจาก UI ชัด”

#### Q5: Security โยงกับ MVC/ชั้นอย่างไร? (มักถามต่อ)

> “ถ้า View เป็นคนกำหนดสิทธิ์จะอันตราย  
> เราให้ Controller/API เป็นคนตรวจ JWT (`verifyToken` / `verifyAdmin`)  
> View มี route guard แค่กันหลงเข้าหน้า Admin  
> นี่คือเหตุผลที่แยกชั้นสำคัญต่อ Security ไม่ใช่แค่จัดโค้ดสวย”

#### Q6: ทำไมไม่ทำ MVC เต็มรูปแบบบนเซิร์ฟเวอร์?

> “เพราะต้องการ UI โต้ตอบเร็ว สองภาษา และแยกทีมหน้าบ้าน–หลังบ้านได้  
> SPA + API เป็นแบบที่นิยมกับ Vue/React ปัจจุบัน และยังทดสอบ API แยกด้วย Vitest ได้”

#### Q7: ข้อเสีย / ข้อจำกัดที่ควรยอมรับตรง ๆ

- บาง business logic ยังปนใน `routes` หรือในหน้า Vue → ยัง refactor ต่อได้  
- มีทั้ง cookie (สิทธิ์จริง) กับ localStorage (UI) ต้องอธิบายให้ชัด  
- ไม่มีชั้น Domain/Repository แยกเป๊ะแบบ Clean Architecture  

> “เรายังปรับปรุงการแยกชั้นต่อได้ แต่ตอนนี้ขอบเขตชัดพอสำหรับโฟลว์หลักและ AuthZ”

### สคริปต์สำรองถ้าถูกถามต่อเนื่อง (~1 นาที)

> “ขยายนิดหนึ่งครับ/ค่ะ MVC แบบคลาสสิกเซิร์ฟเวอร์จะเรนเดอร์ HTML จาก Backend  
> ของเราเป็น Single Page Application หน้า Vue คุยกับ Express ผ่าน JSON  
> ดังนั้นชื่อที่ตรงที่สุดคือ Client–Server หรือ SPA + REST API  
> แต่เรายังยึดหลักแยก View / ตัวควบคุมคำขอ / ข้อมูล เหมือนแนว MVC  
> ฝั่ง Vue ใกล้ MVVM และฝั่ง Backend มี routes, middleware, services, database  
> จุดที่เกี่ยวกับ Security คือสิทธิ์อยู่ที่ API ไม่ใช่ที่หน้าจอ — login แล้วได้ JWT ใน HttpOnly cookie ทุกคำขอที่สำคัญถูก `verifyToken` ตรวจก่อนเข้าถึงข้อมูล”
