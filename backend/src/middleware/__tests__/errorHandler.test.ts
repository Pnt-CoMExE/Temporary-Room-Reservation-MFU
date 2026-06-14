import { describe, it, expect, vi, beforeEach } from "vitest";
import multer from "multer";
import { ApiError, errorHandler } from "../errorHandler";

// ─── Mock helpers ──────────────────────────────────────
function mockReq() {
  return {} as any;
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

// ─── ApiError Class ────────────────────────────────────
describe("ApiError class", () => {
  it("ควรสร้าง instance ด้วย statusCode และ message ที่กำหนด", () => {
    const err = new ApiError(404, "Not Found");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe("Not Found");
  });

  it("ควรเป็น instanceof Error จริง", () => {
    const err = new ApiError(500, "Server Error");
    expect(err instanceof Error).toBe(true);
  });

  it("ควรเก็บ statusCode 400 สำหรับ bad request", () => {
    const err = new ApiError(400, "Bad Input");
    expect(err.statusCode).toBe(400);
  });

  it("ควรเก็บ statusCode 403 สำหรับ forbidden", () => {
    const err = new ApiError(403, "Forbidden");
    expect(err.statusCode).toBe(403);
  });

  it("ควรเก็บ statusCode 401 สำหรับ unauthorized", () => {
    const err = new ApiError(401, "Unauthorized");
    expect(err.statusCode).toBe(401);
  });
});

// ─── errorHandler Middleware ───────────────────────────
describe("errorHandler middleware", () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    vi.clearAllMocks();
    req = mockReq();
    res = mockRes();
    next = mockNext();
  });

  it("ควรคืน 400 และ log error เมื่อเป็น MulterError LIMIT_FILE_SIZE", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const multerErr = new multer.MulterError("LIMIT_FILE_SIZE");

    errorHandler(multerErr, req, res, next);

    expect(consoleSpy).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 10 MB)",
    });
    consoleSpy.mockRestore();
  });

  it("ควรคืน 400 เมื่อเป็น MulterError ประเภทอื่น (เช่น LIMIT_UNEXPECTED_FILE)", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const multerErr = new multer.MulterError("LIMIT_UNEXPECTED_FILE");

    errorHandler(multerErr, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: expect.stringContaining("เกิดข้อผิดพลาดในการอัปโหลดไฟล์"),
    });
    consoleSpy.mockRestore();
  });

  it("ควรคืน 400 เมื่อ error message คือ 'เฉพาะไฟล์ PDF เท่านั้น'", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const pdfErr = new Error("เฉพาะไฟล์ PDF เท่านั้น");

    errorHandler(pdfErr, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "กรุณาเลือกไฟล์ PDF เท่านั้น",
    });
    consoleSpy.mockRestore();
  });

  it("ควรคืน statusCode ตามที่ ApiError กำหนด (404)", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const apiErr = new ApiError(404, "ไม่พบข้อมูลห้อง");

    errorHandler(apiErr, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "ไม่พบข้อมูลห้อง",
    });
    consoleSpy.mockRestore();
  });

  it("ควรคืน statusCode ตามที่ ApiError กำหนด (400)", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const apiErr = new ApiError(400, "ข้อมูลไม่ถูกต้อง");

    errorHandler(apiErr, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "ข้อมูลไม่ถูกต้อง",
    });
    consoleSpy.mockRestore();
  });

  it("ควรคืน 500 เมื่อเป็น Error ทั่วไปที่ไม่รู้จัก", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const genericErr = new Error("Something went wrong");

    errorHandler(genericErr, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์",
    });
    consoleSpy.mockRestore();
  });

  it("ควร log error ทุกครั้งที่ถูกเรียก (console.error)", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    errorHandler(new Error("test error"), req, res, next);

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy.mock.calls[0][0]).toContain("[ERROR]");
    consoleSpy.mockRestore();
  });

  it("ควร log error พร้อม stack trace", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const err = new Error("with stack");
    err.stack = "Error: with stack\n  at line 1\n  at line 2";

    errorHandler(err, req, res, next);

    expect(consoleSpy.mock.calls[0][0]).toContain("[ERROR]");
    expect(consoleSpy.mock.calls[0][1]).toBe(err.stack);
    consoleSpy.mockRestore();
  });

  it("ควรคืน 500 เมื่อ error ไม่มี stack (undefined)", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const err = new Error("no stack");
    err.stack = undefined;

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    consoleSpy.mockRestore();
  });

  it("ไม่ควรเรียก next()", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    errorHandler(new Error("test"), req, res, next);

    expect(next).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
