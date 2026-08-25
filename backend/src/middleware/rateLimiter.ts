import rateLimit from "express-rate-limit";

// General API Rate Limiter (100 requests per 15 minutes)
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "ขออภัย คุณส่งคำขอมากเกินไป กรุณาลองใหม่อีกครั้งในอีก 15 นาที",
  },
});

// Sensitive Auth Rate Limiter (15 requests per 15 minutes)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "มีการพยายามเข้าสู่ระบบมากเกินไป กรุณารอ 15 นาทีแล้วลองใหม่",
  },
});

// Booking Submission Rate Limiter (20 requests per 15 minutes)
export const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "คุณทำรายการจองถี่เกินไป กรุณารอซักครู่ก่อนทำรายการใหม่",
  },
});
