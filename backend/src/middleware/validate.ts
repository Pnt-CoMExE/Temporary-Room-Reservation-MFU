import { body, param, query, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return res.status(400).json({ message: messages.join("; ") });
  }
  next();
};

// ---- Booking validation ----

export const validateCreateBooking = [
  body("userId").isInt({ min: 1 }).withMessage("กรุณาระบุ ID ผู้ใช้"),
  body("roomId").isInt({ min: 1 }).withMessage("กรุณาระบุ ID ห้อง"),
  body("userType")
    .isIn(["internal", "external", "co_op", "co_organizer"])
    .withMessage("ประเภทผู้ใช้ไม่ถูกต้อง"),
  body("bookingDate")
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("รูปแบบวันที่ไม่ถูกต้อง (YYYY-MM-DD)"),
  body("timeSlot")
    .isIn(["full", "half_morning", "half_afternoon"])
    .withMessage("ช่วงเวลาไม่ถูกต้อง"),
  body("roomPrice").isFloat({ min: 0 }).withMessage("ราคาห้องไม่ถูกต้อง"),
  body("totalPrice").isFloat({ min: 0 }).withMessage("ราคารวมไม่ถูกต้อง"),
  handleValidationErrors,
];

// ---- Promo code validation ----

export const validatePromoCode = [
  body("code").trim().notEmpty().withMessage("กรุณาระบุรหัสโปรโมชั่น"),
  handleValidationErrors,
];

// ---- Room ID param validation ----

export const validateRoomId = [
  param("id").isInt({ min: 1 }).withMessage("ID ห้องไม่ถูกต้อง"),
  handleValidationErrors,
];

// ---- Booking ID param validation ----

export const validateBookingId = [
  param("id").isInt({ min: 1 }).withMessage("ID การจองไม่ถูกต้อง"),
  handleValidationErrors,
];

// ---- Admin promo code validation ----

export const validateCreatePromoCode = [
  body("code").trim().notEmpty().withMessage("กรุณาระบุรหัสโปรโมชั่น"),
  body("discount").isFloat({ min: 1 }).withMessage("ส่วนลดต้องมากกว่า 0"),
  body("limit_count")
    .optional()
    .isInt({ min: 1 })
    .withMessage("จำนวนจำกัดต้องมากกว่า 0"),
  handleValidationErrors,
];

// ---- User profile validation ----

export const validateUpdateProfile = [
  body("email").isEmail().withMessage("อีเมลไม่ถูกต้อง"),
  body("firstname").trim().notEmpty().withMessage("กรุณากรอกชื่อ"),
  body("lastname").trim().notEmpty().withMessage("กรุณากรอกนามสกุล"),
  body("phone_number")
    .optional({ values: "falsy" })
    .matches(/^[0-9\- ]{9,10}$/)
    .withMessage("เบอร์โทรศัพท์ไม่ถูกต้อง"),
  handleValidationErrors,
];

// ---- Feedback validation ----

export const validateFeedback = [
  body("bookingId").isInt({ min: 1 }).withMessage("ID การจองไม่ถูกต้อง"),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("คะแนนต้องอยู่ระหว่าง 1-5"),
  handleValidationErrors,
];

// ---- Room status validation ----

export const validateRoomStatus = [
  param("id").isInt({ min: 1 }).withMessage("ID ห้องไม่ถูกต้อง"),
  body("isActive").isBoolean().withMessage("สถานะไม่ถูกต้อง"),
  handleValidationErrors,
];

// ---- Booking status validation ----

export const validateBookingStatus = [
  param("id").isInt({ min: 1 }).withMessage("ID การจองไม่ถูกต้อง"),
  body("status")
    .isIn(["approved", "approved_paid", "disapproved", "pending"])
    .withMessage("สถานะไม่ถูกต้อง"),
  handleValidationErrors,
];
