import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types";

const JWT_SECRET = process.env.JWT_SECRET || "my_super_secret_key";

export const verifyToken = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const tokenFromHeader =
    authHeader && typeof authHeader === "string" && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;
  const tokenFromCookie = req.cookies ? req.cookies["mfu_token"] : null;
  const token = tokenFromHeader || tokenFromCookie;

  if (!token) {
    return res.status(401).json({ message: "ไม่มีสิทธิ์เข้าถึง: กรุณาเข้าสู่ระบบ" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Token หมดอายุหรือไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่" });
  }
};

export const verifyAdmin = (req: any, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "ไม่มีสิทธิ์: เฉพาะผู้ดูแลระบบเท่านั้น" });
};
