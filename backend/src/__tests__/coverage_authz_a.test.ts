/**
 * Option A — extra coverage for AuthZ / env without large refactors
 */
import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../app";
import * as db from "../../db";

vi.mock("../../db", () => ({
  // Default resolved value so app.ts startup migration `.then()` works
  query: vi.fn().mockResolvedValue({ rows: [] }),
  pool: {
    connect: vi.fn().mockResolvedValue({
      query: vi.fn().mockResolvedValue({ rows: [] }),
      release: vi.fn(),
    }),
  },
}));

const JWT_SECRET = process.env.JWT_SECRET || "my_super_secret_key";
const mockedQuery = db.query as unknown as ReturnType<typeof vi.fn>;

let ownerToken: string;
let otherToken: string;
let adminToken: string;

beforeAll(() => {
  ownerToken = jwt.sign(
    { userId: 10, email: "owner@mfu.ac.th", role: "internal", name: "Owner" },
    JWT_SECRET
  );
  otherToken = jwt.sign(
    { userId: 20, email: "other@mfu.ac.th", role: "internal", name: "Other" },
    JWT_SECRET
  );
  adminToken = jwt.sign(
    { userId: 1, email: "admin@property.mfu.ac.th", role: "admin", name: "Admin" },
    JWT_SECRET
  );
});

beforeEach(() => {
  vi.clearAllMocks();
});

const ownedBooking = {
  id: 42,
  booking_no: "BK-TEST-0042",
  total_price: "1500.00",
  status: "approved_pending_payment",
  user_id: 10,
};

describe("Coverage A: payment ownership (mocked DB)", () => {
  it("checkout — booking ไม่มีในระบบ → 404", async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post("/api/payment/checkout")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ bookingId: 999 });

    expect(res.status).toBe(404);
  });

  it("checkout — คนอื่นพยายามจ่าย → 403", async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [ownedBooking] });

    const res = await request(app)
      .post("/api/payment/checkout")
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ bookingId: 42 });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/ไม่มีสิทธิ์/);
  });

  it("promptpay/generate — คนอื่น → 403", async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [ownedBooking] });

    const res = await request(app)
      .post("/api/payment/promptpay/generate")
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ bookingId: 42 });

    expect(res.status).toBe(403);
  });

  it("promptpay/generate — เจ้าของ → 200 พร้อม qrPayload", async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [ownedBooking] });

    const res = await request(app)
      .post("/api/payment/promptpay/generate")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ bookingId: 42 });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("qrPayload");
    expect(res.body.bookingId).toBe(42);
  });

  it("slip/upload — คนอื่น → 403", async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [ownedBooking] });

    const res = await request(app)
      .post("/api/payment/slip/upload")
      .set("Authorization", `Bearer ${otherToken}`)
      .field("bookingId", "42")
      .attach("slipImage", Buffer.from("fake-image"), {
        filename: "slip.jpg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(403);
  });

  it("mock/simulate — คนอื่น → 403", async () => {
    // Active adapter may not be mock_sandbox in test env — still ownership checked after provider check
    mockedQuery.mockResolvedValueOnce({ rows: [ownedBooking] });

    const res = await request(app)
      .post("/api/payment/mock/simulate")
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ bookingId: 42 });

    // 400 if mock_sandbox off, else 403 ownership
    expect([400, 403]).toContain(res.status);
    if (res.status === 403) {
      expect(res.body.message).toMatch(/ไม่มีสิทธิ์/);
    }
  });
});

describe("Coverage A: user feedback / cancel ownership (mocked DB)", () => {
  it("POST /api/user/feedback — ไม่ใช่เจ้าของจอง → 403", async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [] }); // ownership check empty

    const res = await request(app)
      .post("/api/user/feedback")
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ bookingId: 42, rating: 5, comment: "nice" });

    expect(res.status).toBe(403);
  });

  it("PUT /api/user/bookings/:id/cancel — ไม่พบหรือไม่ใช่ของตน → 400", async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .put("/api/user/bookings/42/cancel")
      .set("Authorization", `Bearer ${otherToken}`);

    expect(res.status).toBe(400);
  });

  it("GET /api/user/profile — ใช้ email จาก JWT (mock มีข้อมูล)", async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [
        {
          firstname: "Owner",
          lastname: "User",
          phone_number: "0811111111",
          profile_picture: null,
          email: "owner@mfu.ac.th",
          user_type: "internal",
        },
      ],
    });

    const res = await request(app)
      .get("/api/user/profile")
      .query({ email: "victim@evil.com" })
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe("owner@mfu.ac.th");
    expect(mockedQuery.mock.calls[0][1]).toEqual(["owner@mfu.ac.th"]);
  });
});

describe("Coverage A: admin vs user on payment verify", () => {
  it("non-admin เรียก verify → 403", async () => {
    const res = await request(app)
      .post("/api/payment/verify")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ bookingId: 42, isVerified: true });

    expect(res.status).toBe(403);
  });

  it("admin ไม่ส่ง bookingId → 400", async () => {
    const res = await request(app)
      .post("/api/payment/verify")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ isVerified: true });

    expect(res.status).toBe(400);
  });
});
