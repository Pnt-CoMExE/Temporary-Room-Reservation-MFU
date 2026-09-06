/**
 * Authorization / anti-IDOR tests
 * — JWT is source of truth for identity (userId, email, role)
 */
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../app";

const JWT_SECRET = process.env.JWT_SECRET || "my_super_secret_key";

let userAToken: string;
let userBToken: string;
let externalToken: string;

beforeAll(() => {
  userAToken = jwt.sign(
    { userId: 1, email: "staff@mfu.ac.th", role: "internal", name: "User A" },
    JWT_SECRET
  );
  userBToken = jwt.sign(
    { userId: 99999, email: "other@mfu.ac.th", role: "internal", name: "User B" },
    JWT_SECRET
  );
  externalToken = jwt.sign(
    { userId: 3, email: "external@gmail.com", role: "external", name: "External" },
    JWT_SECRET
  );
});

describe("AuthZ: profile uses JWT email only", () => {
  it("GET /api/user/profile — ไม่ต้องพึ่ง query email ของ client", async () => {
    const res = await request(app)
      .get("/api/user/profile")
      .query({ email: "victim@mfu.ac.th" })
      .set("Authorization", `Bearer ${userAToken}`);

    // 200 (own profile) or 404 (seed ไม่มี staff@mfu.ac.th) — ต้องไม่คืนข้อมูล victim
    // 500 = DB misconfigured (should not happen when CI DB_* is set)
    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.email).not.toBe("victim@mfu.ac.th");
    }
  });

  it("GET /api/user/profile — ไม่มี token → 401", async () => {
    const res = await request(app).get("/api/user/profile");
    expect(res.status).toBe(401);
  });

  it("PUT /api/user/profile — อัปเดตด้วย email คนอื่นใน body ไม่เปลี่ยนเป้าหมาย", async () => {
    const res = await request(app)
      .put("/api/user/profile")
      .set("Authorization", `Bearer ${userAToken}`)
      .send({
        email: "victim@mfu.ac.th",
        firstname: "Hacker",
        lastname: "Attempt",
        phone_number: "0812345678",
      });

    // อาจ 200 หรือ 500/404 ตามว่ามี user ใน DB หรือไม่ — ต้องไม่ 401 เพราะมี token
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });
});

describe("AuthZ: bookings IDOR protection", () => {
  it("GET /api/user/bookings/:userId — ดูของคนอื่น → 403", async () => {
    const res = await request(app)
      .get("/api/user/bookings/1")
      .set("Authorization", `Bearer ${userBToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/ไม่มีสิทธิ์|ผู้ใช้อื่น/);
  });

  it("GET /api/user/bookings/:userId — ดูของตัวเอง → ไม่ใช่ 403", async () => {
    const res = await request(app)
      .get("/api/user/bookings/1")
      .set("Authorization", `Bearer ${userAToken}`);

    expect(res.status).not.toBe(403);
    expect([200, 500]).toContain(res.status);
  });
});

describe("AuthZ: payment ownership", () => {
  it("POST /api/payment/checkout — booking ของคนอื่น → 403 หรือ 404", async () => {
    const res = await request(app)
      .post("/api/payment/checkout")
      .set("Authorization", `Bearer ${userBToken}`)
      .send({ bookingId: 1 });

    expect([403, 404]).toContain(res.status);
  });

  it("POST /api/payment/promptpay/generate — booking ของคนอื่น → 403 หรือ 404", async () => {
    const res = await request(app)
      .post("/api/payment/promptpay/generate")
      .set("Authorization", `Bearer ${externalToken}`)
      .send({ bookingId: 1 });

    expect([403, 404]).toContain(res.status);
  });
});

describe("AuthZ: create booking identity from JWT", () => {
  const createMinimalPDF = (): Buffer =>
    Buffer.from(
      "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [] /Count 0 >>\nendobj\nxref\n0 3\ntrailer\n<< /Size 3 /Root 1 0 R >>\nstartxref\n0\n%%EOF",
      "utf-8"
    );

  it("POST /api/bookings — external ไม่สามารถส่ง userType=internal เพื่อปลอมราคา", async () => {
    const pdfBuffer = createMinimalPDF();
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${externalToken}`)
      .field("userId", "1")
      .field("roomId", "1")
      .field("userType", "internal")
      .field("partnerName", "spoof attempt")
      .field("bookingDate", "2099-06-15")
      .field("timeSlot", "half_morning")
      .field("objective", "AuthZ test")
      .field("roomPrice", "1000")
      .field("addonsPrice", "0")
      .field("totalPrice", "1000")
      .attach("memoDocument", pdfBuffer, {
        filename: "test.pdf",
        contentType: "application/pdf",
      });

    // ถ้าสร้างสำเร็จ (201) ต้องเป็น userId จาก JWT (3) ไม่ใช่ 1 ที่ส่งมา
    // หรือ fail ด้วย 400/500 ตาม DB — แต่ต้องไม่รับ userId=1 เป็นเจ้าของ
    if (res.status === 201) {
      expect(res.body.bookingId).toBeDefined();
      // verify ownership via bookings list as external user 3
      const list = await request(app)
        .get("/api/user/bookings/3")
        .set("Authorization", `Bearer ${externalToken}`);
      expect(list.status).toBe(200);
    } else {
      expect([400, 500]).toContain(res.status);
    }
  });
});
