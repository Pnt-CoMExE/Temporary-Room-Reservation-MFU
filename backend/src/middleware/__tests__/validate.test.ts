import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  handleValidationErrors,
  validateCreateBooking,
  validatePromoCode,
  validateRoomId,
  validateBookingId,
  validateCreatePromoCode,
  validateUpdateProfile,
  validateFeedback,
  validateRoomStatus,
  validateBookingStatus,
} from "../validate";

// ─── Mock helpers ──────────────────────────────────────
function mockReq(body: any = {}, params: any = {}, query: any = {}) {
  return { body, params, query } as any;
}

function mockRes() {
  const res: Record<string, any> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as any;
}

function mockNext() {
  return vi.fn();
}

// Helper to run a validation chain and get the result
async function runValidation(
  chain: any[],
  req: any,
  res: any,
  next: any
) {
  for (const middleware of chain) {
    // Express-validator middleware: call with (req, res, next)
    // If it's a validation function (has .run), use it that way
    await middleware(req, res, () => {});
  }
  // Finally run the handleValidationErrors at the end
  handleValidationErrors(req, res, next);
  return { req, res, next };
}

// ─── handleValidationErrors ────────────────────────────
describe("handleValidationErrors", () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = mockReq();
    res = mockRes();
    next = mockNext();
  });

  it("ควรเรียก next() เมื่อไม่มี validation errors", () => {
    handleValidationErrors(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("ควรคืน 400 เมื่อมี validation errors และ join ข้อความด้วย semicolon", async () => {
    const req = {
      body: { userId: -1, roomId: "abc", userType: "invalid" },
      params: {},
      query: {},
    } as any;
    const res = mockRes();
    const next = mockNext();

    for (const mw of validateCreateBooking) {
      await mw(req, res, () => {});
    }
    handleValidationErrors(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].message).toContain("กรุณาระบุ ID ผู้ใช้");
    expect(res.json.mock.calls[0][0].message).toContain("กรุณาระบุ ID ห้อง");
    expect(res.json.mock.calls[0][0].message).toContain("ประเภทผู้ใช้ไม่ถูกต้อง");
    expect(next).not.toHaveBeenCalled();
  });
});

// ─── validateCreateBooking ─────────────────────────────
describe("validateCreateBooking", () => {
  async function testValidation(body: any): Promise<number> {
    const req = { body, params: {}, query: {} } as any;
    const res = mockRes();
    const next = mockNext();

    for (const mw of validateCreateBooking) {
      await mw(req, res, () => {});
    }
    handleValidationErrors(req, res, next);

    return res.status.mock.calls[0]?.[0] || 200;
  }

  it("ผ่านเมื่อส่งข้อมูลครบถ้วนและถูกต้อง", async () => {
    const req = {
      body: {
        userId: 1,
        roomId: 5,
        userType: "internal",
        bookingDate: "2026-06-15",
        timeSlot: "full",
        roomPrice: 1500,
        totalPrice: 2000,
      },
      params: {},
      query: {},
    } as any;
    const res = mockRes();
    const next = mockNext();

    for (const mw of validateCreateBooking) {
      await mw(req, res, () => {});
    }
    handleValidationErrors(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("userId ต้องเป็น integer ≥ 1", async () => {
    const status = await testValidation({
      userId: 0, roomId: 5, userType: "internal",
      bookingDate: "2026-06-15", timeSlot: "full",
      roomPrice: 1500, totalPrice: 2000,
    });
    expect(status).toBe(400);
  });

  it("userType ต้องเป็น internal/external/co_organizer เท่านั้น", async () => {
    const status = await testValidation({
      userId: 1, roomId: 5, userType: "invalid_role",
      bookingDate: "2026-06-15", timeSlot: "full",
      roomPrice: 1500, totalPrice: 2000,
    });
    expect(status).toBe(400);
  });

  it("bookingDate ต้องเป็นรูปแบบ YYYY-MM-DD", async () => {
    const status = await testValidation({
      userId: 1, roomId: 5, userType: "internal",
      bookingDate: "15/06/2026", timeSlot: "full",
      roomPrice: 1500, totalPrice: 2000,
    });
    expect(status).toBe(400);
  });

  it("timeSlot ต้องเป็น full/half_morning/half_afternoon", async () => {
    const status = await testValidation({
      userId: 1, roomId: 5, userType: "internal",
      bookingDate: "2026-06-15", timeSlot: "evening",
      roomPrice: 1500, totalPrice: 2000,
    });
    expect(status).toBe(400);
  });

  it("roomPrice และ totalPrice ต้องเป็น float ≥ 0", async () => {
    const status = await testValidation({
      userId: 1, roomId: 5, userType: "internal",
      bookingDate: "2026-06-15", timeSlot: "full",
      roomPrice: -100, totalPrice: 2000,
    });
    expect(status).toBe(400);
  });
});

// ─── validatePromoCode ─────────────────────────────────
describe("validatePromoCode", () => {
  async function test(body: any): Promise<number> {
    const req = { body, params: {}, query: {} } as any;
    const res = mockRes();
    const next = mockNext();
    for (const mw of validatePromoCode) {
      await mw(req, res, () => {});
    }
    handleValidationErrors(req, res, next);
    return res.status.mock.calls[0]?.[0] || 200;
  }

  it("ผ่านเมื่อมี code ที่ไม่ใช่ค่าว่าง", async () => {
    const status = await test({ code: "DISCOUNT20" });
    expect(status).toBe(200);
  });

  it("ไม่ผ่านเมื่อไม่มี code", async () => {
    const status = await test({});
    expect(status).toBe(400);
  });

  it("ไม่ผ่านเมื่อ code เป็น string ว่าง", async () => {
    const status = await test({ code: "" });
    expect(status).toBe(400);
  });

  it("ไม่ผ่านเมื่อ code เป็นช่องว่าง (trim แล้วว่าง)", async () => {
    const status = await test({ code: "   " });
    expect(status).toBe(400);
  });
});

// ─── validateRoomId ────────────────────────────────────
describe("validateRoomId", () => {
  async function test(params: any): Promise<number> {
    const req = { body: {}, params, query: {} } as any;
    const res = mockRes();
    const next = mockNext();
    for (const mw of validateRoomId) {
      await mw(req, res, () => {});
    }
    handleValidationErrors(req, res, next);
    return res.status.mock.calls[0]?.[0] || 200;
  }

  it("ผ่านเมื่อ id เป็น integer ≥ 1", async () => {
    expect(await test({ id: "1" })).toBe(200);
    expect(await test({ id: "99" })).toBe(200);
  });

  it("ไม่ผ่านเมื่อ id = 0", async () => {
    expect(await test({ id: "0" })).toBe(400);
  });

  it("ไม่ผ่านเมื่อ id ไม่ใช่ตัวเลข", async () => {
    expect(await test({ id: "abc" })).toBe(400);
  });

  it("ไม่ผ่านเมื่อไม่มี id param", async () => {
    expect(await test({})).toBe(400);
  });
});

// ─── validateBookingId ─────────────────────────────────
describe("validateBookingId", () => {
  async function test(params: any): Promise<number> {
    const req = { body: {}, params, query: {} } as any;
    const res = mockRes();
    const next = mockNext();
    for (const mw of validateBookingId) {
      await mw(req, res, () => {});
    }
    handleValidationErrors(req, res, next);
    return res.status.mock.calls[0]?.[0] || 200;
  }

  it("ผ่านเมื่อ id เป็น integer ≥ 1", async () => {
    expect(await test({ id: "5" })).toBe(200);
  });

  it("ไม่ผ่านเมื่อ id = 0", async () => {
    expect(await test({ id: "0" })).toBe(400);
  });

  it("ไม่ผ่านเมื่อ id เป็น string ที่ไม่ใช่ตัวเลข", async () => {
    expect(await test({ id: "abc" })).toBe(400);
  });
});

// ─── validateCreatePromoCode ───────────────────────────
describe("validateCreatePromoCode", () => {
  async function test(body: any): Promise<number> {
    const req = { body, params: {}, query: {} } as any;
    const res = mockRes();
    const next = mockNext();
    for (const mw of validateCreatePromoCode) {
      await mw(req, res, () => {});
    }
    handleValidationErrors(req, res, next);
    return res.status.mock.calls[0]?.[0] || 200;
  }

  it("ผ่านเมื่อส่ง code + discount ครบ", async () => {
    expect(await test({ code: "SALE50", discount: 50 })).toBe(200);
  });

  it("ผ่านเมื่อมี limit_count ด้วย", async () => {
    expect(await test({ code: "SALE50", discount: 50, limit_count: 100 })).toBe(200);
  });

  it("ไม่ผ่านเมื่อไม่มี code", async () => {
    expect(await test({ discount: 50 })).toBe(400);
  });

  it("ไม่ผ่านเมื่อ discount = 0", async () => {
    expect(await test({ code: "FREE", discount: 0 })).toBe(400);
  });

  it("ไม่ผ่านเมื่อ discount ติดลบ", async () => {
    expect(await test({ code: "NEG", discount: -10 })).toBe(400);
  });

  it("ไม่ผ่านเมื่อ limit_count = 0 (optional but if provided, must be ≥ 1)", async () => {
    expect(await test({ code: "LIMIT", discount: 20, limit_count: 0 })).toBe(400);
  });
});

// ─── validateUpdateProfile ─────────────────────────────
describe("validateUpdateProfile", () => {
  async function test(body: any): Promise<number> {
    const req = { body, params: {}, query: {} } as any;
    const res = mockRes();
    const next = mockNext();
    for (const mw of validateUpdateProfile) {
      await mw(req, res, () => {});
    }
    handleValidationErrors(req, res, next);
    return res.status.mock.calls[0]?.[0] || 200;
  }

  it("ผ่านเมื่อส่งข้อมูลครบถ้วน", async () => {
    expect(await test({
      email: "test@mfu.ac.th",
      firstname: "สมชาย",
      lastname: "ใจดี",
    })).toBe(200);
  });

  it("ผ่านเมื่อมี phone_number ด้วย", async () => {
    expect(await test({
      email: "test@mfu.ac.th",
      firstname: "สมชาย",
      lastname: "ใจดี",
      phone_number: "0812345678",
    })).toBe(200);
  });

  it("ไม่ผ่านเมื่อ email ไม่ถูกต้อง", async () => {
    expect(await test({
      email: "not-an-email",
      firstname: "สมชาย",
      lastname: "ใจดี",
    })).toBe(400);
  });

  it("ไม่ผ่านเมื่อไม่มี firstname", async () => {
    expect(await test({
      email: "test@mfu.ac.th",
      firstname: "",
      lastname: "ใจดี",
    })).toBe(400);
  });

  it("ไม่ผ่านเมื่อไม่มี lastname", async () => {
    expect(await test({
      email: "test@mfu.ac.th",
      firstname: "สมชาย",
      lastname: "",
    })).toBe(400);
  });

  it("ไม่ผ่านเมื่อ phone_number มีตัวอักษร", async () => {
    expect(await test({
      email: "test@mfu.ac.th",
      firstname: "สมชาย",
      lastname: "ใจดี",
      phone_number: "abc1234567",
    })).toBe(400);
  });

  it("ผ่านเมื่อไม่ส่ง phone_number (optional)", async () => {
    expect(await test({
      email: "test@mfu.ac.th",
      firstname: "สมชาย",
      lastname: "ใจดี",
    })).toBe(200);
  });
});

// ─── validateFeedback ──────────────────────────────────
describe("validateFeedback", () => {
  async function test(body: any): Promise<number> {
    const req = { body, params: {}, query: {} } as any;
    const res = mockRes();
    const next = mockNext();
    for (const mw of validateFeedback) {
      await mw(req, res, () => {});
    }
    handleValidationErrors(req, res, next);
    return res.status.mock.calls[0]?.[0] || 200;
  }

  it("ผ่านเมื่อส่ง bookingId + rating 1-5", async () => {
    expect(await test({ bookingId: 10, rating: 5 })).toBe(200);
    expect(await test({ bookingId: 10, rating: 1 })).toBe(200);
  });

  it("ไม่ผ่านเมื่อ rating = 0", async () => {
    expect(await test({ bookingId: 10, rating: 0 })).toBe(400);
  });

  it("ไม่ผ่านเมื่อ rating = 6", async () => {
    expect(await test({ bookingId: 10, rating: 6 })).toBe(400);
  });

  it("ไม่ผ่านเมื่อ bookingId = 0", async () => {
    expect(await test({ bookingId: 0, rating: 3 })).toBe(400);
  });
});

// ─── validateRoomStatus ────────────────────────────────
describe("validateRoomStatus", () => {
  async function test(params: any, body: any): Promise<number> {
    const req = { body, params, query: {} } as any;
    const res = mockRes();
    const next = mockNext();
    for (const mw of validateRoomStatus) {
      await mw(req, res, () => {});
    }
    handleValidationErrors(req, res, next);
    return res.status.mock.calls[0]?.[0] || 200;
  }

  it("ผ่านเมื่อ id + isActive เป็น boolean", async () => {
    expect(await test({ id: "1" }, { isActive: true })).toBe(200);
    expect(await test({ id: "5" }, { isActive: false })).toBe(200);
  });

  it("ไม่ผ่านเมื่อ isActive เป็น string ที่ไม่ใช่ boolean", async () => {
    expect(await test({ id: "1" }, { isActive: "abc" })).toBe(400);
  });

  it("ผ่านเมื่อ isActive เป็น string 'true' (express-validator รองรับ)", async () => {
    expect(await test({ id: "1" }, { isActive: "true" })).toBe(200);
  });

  it("ไม่ผ่านเมื่อ id = 0", async () => {
    expect(await test({ id: "0" }, { isActive: true })).toBe(400);
  });
});

// ─── validateBookingStatus ─────────────────────────────
describe("validateBookingStatus", () => {
  async function test(params: any, body: any): Promise<number> {
    const req = { body, params, query: {} } as any;
    const res = mockRes();
    const next = mockNext();
    for (const mw of validateBookingStatus) {
      await mw(req, res, () => {});
    }
    handleValidationErrors(req, res, next);
    return res.status.mock.calls[0]?.[0] || 200;
  }

  it("ผ่านเมื่อ status เป็นค่าที่ถูกต้อง", async () => {
    expect(await test({ id: "1" }, { status: "approved" })).toBe(200);
    expect(await test({ id: "1" }, { status: "approved_paid" })).toBe(200);
    expect(await test({ id: "1" }, { status: "disapproved" })).toBe(200);
    expect(await test({ id: "1" }, { status: "pending" })).toBe(200);
  });

  it("ไม่ผ่านเมื่อ status ไม่ถูกต้อง", async () => {
    expect(await test({ id: "1" }, { status: "cancelled" })).toBe(400);
    expect(await test({ id: "1" }, { status: "unknown" })).toBe(400);
  });

  it("ไม่ผ่านเมื่อไม่มี status", async () => {
    expect(await test({ id: "1" }, {})).toBe(400);
  });

  it("ไม่ผ่านเมื่อ id = 0", async () => {
    expect(await test({ id: "0" }, { status: "approved" })).toBe(400);
  });
});
