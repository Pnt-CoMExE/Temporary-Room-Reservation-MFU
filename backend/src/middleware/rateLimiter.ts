import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redisClient from "../redisClient";

// ==========================================
// Redis-backed Rate Limiters
// ==========================================
// ใช้ Redis store เพื่อให้ rate limit ทำงานได้
// แม้ restart container หรือ scale หลาย instance
// ถ้า Redis ไม่พร้อม (dev/test mode) จะ fallback เป็น memory store อัตโนมัติ

const IS_TEST = process.env.NODE_ENV === "test" || process.env.VITEST === "true";

function createStoreOptions() {
  // ใน test environment หรือถ้าไม่มี REDIS_URL → ใช้ default memory store
  if (IS_TEST || !process.env.REDIS_URL) {
    return {}; // ไม่กำหนด store → express-rate-limit ใช้ memory store
  }

  return {
    store: new RedisStore({
      // @ts-expect-error — ioredis compatible with rate-limit-redis via sendCommand
      sendCommand: (...args: string[]) => redisClient.call(...args),
      prefix: "mfu_rl:",
    }),
  };
}

// General API Rate Limiter (100 requests per 15 minutes)
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  ...createStoreOptions(),
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
  ...createStoreOptions(),
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
  ...createStoreOptions(),
  message: {
    message: "คุณทำรายการจองถี่เกินไป กรุณารอซักครู่ก่อนทำรายการใหม่",
  },
});
