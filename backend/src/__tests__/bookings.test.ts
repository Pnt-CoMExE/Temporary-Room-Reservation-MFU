import { describe, it, expect, beforeAll, vi } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../app";

let token: string;
let adminToken: string;

beforeAll(() => {
  // สร้าง JWT token สำหรับผู้ใช้ทั่วไป (role = internal)
  token = jwt.sign(
    { userId: 1, email: "test@mfu.ac.th", role: "internal", name: "Test" },
    process.env.JWT_SECRET || "my_super_secret_key"
  );

  // สร้าง JWT token สำหรับ admin
  adminToken = jwt.sign(
    { userId: 2, email: "admin@lamduan.mfu.ac.th", role: "admin", name: "Admin" },
    process.env.JWT_SECRET || "my_super_secret_key"
  );
});

describe("POST /api/bookings — การตรวจสอบไฟล์แนบ memoDocument", () => {
  it("ควรคืน 400 เมื่อไม่มีไฟล์แนบ (ไม่มีฟิลด์ memoDocument)", async () => {
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${token}`)
      .field("userId", "1")
      .field("roomId", "1")
      .field("userType", "internal")
      .field("partnerName", "ทดสอบ")
      .field("bookingDate", "2026-06-01")
      .field("timeSlot", "full")
      .field("objective", "ประชุม")
      .field("roomPrice", "1000")
      .field("addonsPrice", "0")
      .field("totalPrice", "1000");

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toContain("หนังสือบันทึกข้อความ");
  });

  it("ควรคืน 400 เมื่อแนบไฟล์ที่ไม่ใช่ PDF (นามสกุล .txt)", async () => {
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${token}`)
      .field("userId", "1")
      .field("roomId", "1")
      .field("userType", "internal")
      .field("partnerName", "ทดสอบ")
      .field("bookingDate", "2026-06-01")
      .field("timeSlot", "full")
      .field("objective", "ประชุม")
      .field("roomPrice", "1000")
      .field("addonsPrice", "0")
      .field("totalPrice", "1000")
      .attach("memoDocument", Buffer.from("this is not a pdf file"), "document.txt");

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toContain("PDF");
  });

  it("ควรคืน 400 เมื่อไฟล์มีขนาดเกิน 10 MB", { timeout: 30000 }, async () => {
    // 11MB buffer เพื่อให้เกิน limits.fileSize (10MB)
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024);

    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${token}`)
      .field("userId", "1")
      .field("roomId", "1")
      .field("userType", "internal")
      .field("partnerName", "ทดสอบ")
      .field("bookingDate", "2026-06-01")
      .field("timeSlot", "full")
      .field("objective", "ประชุม")
      .field("roomPrice", "1000")
      .field("addonsPrice", "0")
      .field("totalPrice", "1000")
      .attach("memoDocument", largeBuffer, "large.pdf");

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toContain("ใหญ่เกินไป");
  });
});

describe("POST /api/admin/bookings/export-zip — การดาวน์โหลด ZIP", () => {
  it("ควรคืน 403 เมื่อผู้ใช้ไม่มีสิทธิ์ admin", async () => {
    const res = await request(app)
      .post("/api/admin/bookings/export-zip")
      .set("Authorization", `Bearer ${token}`)
      .send({ ids: [1] });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toContain("ไม่มีสิทธิ์");
  });

  it("ควรคืน 400 เมื่อไม่ส่ง ids", async () => {
    const res = await request(app)
      .post("/api/admin/bookings/export-zip")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toContain("กรุณาระบุ");
  });

  it("ควรคืน 400 เมื่อ ids ไม่ใช่ array", async () => {
    const res = await request(app)
      .post("/api/admin/bookings/export-zip")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ ids: "not-an-array" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toContain("กรุณาระบุ");
  });

  it("ควรคืน 400 เมื่อ ids เป็น array ว่าง", async () => {
    const res = await request(app)
      .post("/api/admin/bookings/export-zip")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ ids: [] });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toContain("กรุณาระบุ");
  });
});
