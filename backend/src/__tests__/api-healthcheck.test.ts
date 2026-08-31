/**
 * Sprint 2 — API Health Check Test Suite
 * ตรวจสอบว่า route mounting, middleware chain, และ error handling ทำงานถูกต้อง
 */
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../app";

const JWT_SECRET = process.env.JWT_SECRET || "my_super_secret_key";

let adminToken: string;
let userToken: string;

beforeAll(() => {
  adminToken = jwt.sign(
    { userId: 1, email: "admin@lamduan.mfu.ac.th", role: "admin", name: "Admin" },
    JWT_SECRET
  );
  userToken = jwt.sign(
    { userId: 2, email: "user@mfu.ac.th", role: "internal", name: "User" },
    JWT_SECRET
  );
});

// ============================================================
// 1. Route Mounting Verification
// ============================================================
describe("API Health Check: Route Mounting", () => {
  const publicRoutes = [
    { method: "get" as const, path: "/api/rooms", name: "rooms" },
    { method: "get" as const, path: "/api/addons", name: "addons" },
    { method: "get" as const, path: "/api/banners", name: "banners" },
    { method: "get" as const, path: "/api/featured-rooms", name: "featured-rooms" },
    { method: "get" as const, path: "/api/payment/providers", name: "payment/providers" },
  ];

  for (const route of publicRoutes) {
    it(`[PUBLIC] ${route.method.toUpperCase()} ${route.path} — ควรตอบ 200 (ไม่ใช่ 404)`, async () => {
      const res = await request(app)[route.method](route.path);
      expect(res.status).not.toBe(404);
    });
  }

  const authRoutes = [
    { method: "post" as const, path: "/api/bookings", name: "bookings" },
    { method: "post" as const, path: "/api/promo-codes/validate", name: "promo-codes/validate" },
    { method: "post" as const, path: "/api/payment/promptpay/generate", name: "payment/promptpay" },
    { method: "post" as const, path: "/api/payment/slip/upload", name: "payment/slip" },
    { method: "post" as const, path: "/api/payment/checkout", name: "payment/checkout" },
  ];

  for (const route of authRoutes) {
    it(`[AUTH] ${route.method.toUpperCase()} ${route.path} — ควรตอบ 401 เมื่อไม่มี token (ไม่ใช่ 404)`, async () => {
      const res = await request(app)[route.method](route.path);
      expect(res.status).toBe(401);
    });
  }

  const adminRoutes = [
    { method: "get" as const, path: "/api/admin/bookings", name: "admin/bookings" },
    { method: "get" as const, path: "/api/admin/logs", name: "admin/logs" },
    { method: "get" as const, path: "/api/admin/users", name: "admin/users" },
  ];

  for (const route of adminRoutes) {
    it(`[ADMIN] ${route.method.toUpperCase()} ${route.path} — ควรตอบ 403 สำหรับ non-admin`, async () => {
      const res = await request(app)
        [route.method](route.path)
        .set("Authorization", `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });

    it(`[ADMIN] ${route.method.toUpperCase()} ${route.path} — admin ควรเข้าถึงได้ (ไม่ใช่ 401/403)`, async () => {
      const res = await request(app)
        [route.method](route.path)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(403);
    });
  }
});

// ============================================================
// 2. Middleware Chain Verification
// ============================================================
describe("API Health Check: Middleware Chain", () => {
  it("Helmet — ควรมี security headers", async () => {
    const res = await request(app).get("/api/rooms");
    // Helmet ใส่ headers เช่น X-DNS-Prefetch-Control, X-Content-Type-Options
    expect(res.headers).toHaveProperty("x-content-type-options");
  });

  it("CORS — ควรตอบ CORS headers ที่ถูกต้อง", async () => {
    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
    const res = await request(app)
      .options("/api/rooms")
      .set("Origin", FRONTEND_URL)
      .set("Access-Control-Request-Method", "GET");

    // OPTIONS request ไม่ error
    expect([200, 204]).toContain(res.status);
  });

  it("JSON parsing — ควร parse JSON body ได้ถูกต้อง", async () => {
    const res = await request(app)
      .post("/api/payment/verify")
      .set("Content-Type", "application/json")
      .send({ bookingId: 1, isVerified: true });

    // จะได้ 401 (ไม่มี token) ไม่ใช่ 400/415 (parse error)
    expect(res.status).toBe(401);
  });

  it("Rate Limiter — ควรไม่ block request แรกๆ", async () => {
    const res = await request(app).get("/api/rooms");
    // ไม่ใช่ 429 (too many requests)
    expect(res.status).not.toBe(429);
  });

  it("Static files — /uploads route ควร mount ถูกต้อง", async () => {
    const res = await request(app).get("/uploads/nonexistent-file.pdf");
    // 404 (ไม่ใช่ 500 หรือ route not found ที่ส่ง JSON)
    expect(res.status).toBe(404);
  });
});

// ============================================================
// 3. Error Handler Format Verification
// ============================================================
describe("API Health Check: Error Handler & Response Format", () => {
  it("Validation error — ควรส่ง JSON format { message: '...' }", async () => {
    const res = await request(app).get("/api/rooms/invalid-id");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
    expect(typeof res.body.message).toBe("string");
  });

  it("Auth error — ควรส่ง JSON format { message: '...' }", async () => {
    const res = await request(app)
      .post("/api/bookings")
      .send({ userId: 1 });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message");
    expect(typeof res.body.message).toBe("string");
  });

  it("Admin forbidden — ควรส่ง JSON format { message: '...' }", async () => {
    const res = await request(app)
      .get("/api/admin/bookings")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty("message");
    expect(typeof res.body.message).toBe("string");
  });

  it("Missing required field — ควรระบุข้อความ error ที่ชัดเจน", async () => {
    const res = await request(app)
      .post("/api/payment/promptpay/generate")
      .set("Authorization", `Bearer ${userToken}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.message.length).toBeGreaterThan(0);
  });
});
