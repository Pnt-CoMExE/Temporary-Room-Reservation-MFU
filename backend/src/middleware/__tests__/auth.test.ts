import { describe, it, expect, vi, beforeAll } from "vitest";
import jwt from "jsonwebtoken";
import { verifyToken, verifyAdmin } from "../auth";

// ─── Mock helpers ──────────────────────────────────────
function mockReq(overrides: Record<string, any> = {}) {
  return {
    headers: {},
    cookies: {},
    user: undefined,
    ...overrides,
  } as any;
}

function mockRes() {
  const res: Record<string, any> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as any;
}

// ─── Constants ─────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || "my_super_secret_key";
const VALID_PAYLOAD = {
  userId: 1,
  email: "test@mfu.ac.th",
  role: "internal",
  name: "Test User",
};
let validToken: string;

beforeAll(() => {
  validToken = jwt.sign(VALID_PAYLOAD, JWT_SECRET);
});

// ─── verifyToken ───────────────────────────────────────
describe("verifyToken", () => {
  it("ควรเรียก next() เมื่อมี token ที่ถูกต้องใน Authorization header", () => {
    const req = mockReq({
      headers: { authorization: `Bearer ${validToken}` },
    });
    const res = mockRes();
    const next = vi.fn();

    verifyToken(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.userId).toBe(1);
    expect(req.user.email).toBe("test@mfu.ac.th");
    expect(req.user.role).toBe("internal");
  });

  it("ควรเรียก next() เมื่อมี token ที่ถูกต้องใน cookie", () => {
    const req = mockReq({
      cookies: { mfu_token: validToken },
    });
    const res = mockRes();
    const next = vi.fn();

    verifyToken(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.email).toBe("test@mfu.ac.th");
  });

  it("ควรให้ความสำคัญกับ header token ก่อน cookie token", () => {
    const fakeCookieToken = jwt.sign(
      { ...VALID_PAYLOAD, userId: 99, email: "fake@test.com" },
      JWT_SECRET
    );
    const req = mockReq({
      headers: { authorization: `Bearer ${validToken}` },
      cookies: { mfu_token: fakeCookieToken },
    });
    const res = mockRes();
    const next = vi.fn();

    verifyToken(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user.userId).toBe(1);
    expect(req.user.email).toBe("test@mfu.ac.th");
  });

  it("ควรคืน 401 เมื่อไม่มี token ทั้ง header และ cookie", () => {
    const req = mockReq();
    const res = mockRes();
    const next = vi.fn();

    verifyToken(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("ไม่มีสิทธิ์") })
    );
  });

  it("ควรคืน 401 เมื่อ token หมดอายุ", () => {
    const expiredToken = jwt.sign(VALID_PAYLOAD, JWT_SECRET, {
      expiresIn: "0s",
    });
    // Wait a tick so the token actually expires
    const req = mockReq({
      headers: { authorization: `Bearer ${expiredToken}` },
    });
    const res = mockRes();
    const next = vi.fn();

    verifyToken(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("Token") })
    );
  });

  it("ควรคืน 401 เมื่อ token ถูกแก้ไข (invalid signature)", () => {
    const req = mockReq({
      headers: { authorization: `Bearer ${validToken}invalid` },
    });
    const res = mockRes();
    const next = vi.fn();

    verifyToken(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("ควร handle เมื่อ headers.authorization ไม่ใช่ string", () => {
    const req = mockReq({
      headers: { authorization: ["Bearer", validToken] },
    });
    const res = mockRes();
    const next = vi.fn();

    verifyToken(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("ควร handle เมื่อ authorization ไม่ได้ขึ้นต้นด้วย Bearer", () => {
    const req = mockReq({
      headers: { authorization: `Basic ${validToken}` },
    });
    const res = mockRes();
    const next = vi.fn();

    verifyToken(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("ควร handle เมื่อ cookies เป็น undefined", () => {
    const req = mockReq({
      headers: { authorization: `Bearer ${validToken}` },
      cookies: undefined,
    });
    const res = mockRes();
    const next = vi.fn();

    verifyToken(req, res, next);

    // Should still work because header takes precedence
    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toBeDefined();
  });
});

// ─── verifyAdmin ────────────────────────────────────────
describe("verifyAdmin", () => {
  it("ควรเรียก next() เมื่อ req.user.role เป็น admin", () => {
    const req = mockReq({
      user: { userId: 2, email: "admin@lamduan.mfu.ac.th", role: "admin" },
    });
    const res = mockRes();
    const next = vi.fn();

    verifyAdmin(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("ควรคืน 403 เมื่อ req.user.role ไม่ใช่ admin (internal)", () => {
    const req = mockReq({
      user: { userId: 1, email: "test@mfu.ac.th", role: "internal" },
    });
    const res = mockRes();
    const next = vi.fn();

    verifyAdmin(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("ไม่มีสิทธิ์") })
    );
  });

  it("ควรคืน 403 เมื่อ req.user.role ไม่ใช่ admin (external)", () => {
    const req = mockReq({
      user: { userId: 3, email: "external@gmail.com", role: "external" },
    });
    const res = mockRes();
    const next = vi.fn();

    verifyAdmin(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("ควรคืน 403 เมื่อไม่มี req.user", () => {
    const req = mockReq();
    const res = mockRes();
    const next = vi.fn();

    verifyAdmin(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("ควรคืน 403 เมื่อ req.user ไม่มี role property", () => {
    const req = mockReq({
      user: { userId: 1, email: "test@mfu.ac.th" },
    });
    const res = mockRes();
    const next = vi.fn();

    verifyAdmin(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
