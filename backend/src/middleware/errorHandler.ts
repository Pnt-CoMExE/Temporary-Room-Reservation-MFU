import { Request, Response, NextFunction } from "express";
import multer from "multer";

export class ApiError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(`[ERROR] ${err.message}`, err.stack || "");

  // Multer-specific errors
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 10 MB)" });
    }
    return res.status(400).json({ message: `เกิดข้อผิดพลาดในการอัปโหลดไฟล์: ${err.message}` });
  }

  if (err.message === "เฉพาะไฟล์ PDF เท่านั้น") {
    return res.status(400).json({ message: "กรุณาเลือกไฟล์ PDF เท่านั้น" });
  }

  // Custom API errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  // Generic fallback
  res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
};
