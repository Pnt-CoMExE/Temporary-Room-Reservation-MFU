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
const RATE_LIMIT_DISABLED = process.env.RATE_LIMIT_DISABLED === "true";

function shouldSkipRateLimit(): boolean {
  return IS_TEST || RATE_LIMIT_DISABLED;
}

function isOAuthRoute(req: { path: string; originalUrl?: string }): boolean {
  const path = req.path || "";
  const url = req.originalUrl || "";
  return path.includes("/google") || url.includes("/api/auth/google");
}

function isBookingRoute(req: { path: string; originalUrl?: string }): boolean {
  const path = req.path || "";
  const url = req.originalUrl || "";
  return path.startsWith("/bookings") || url.includes("/api/bookings");
}

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
  skip: (req) => shouldSkipRateLimit() || isOAuthRoute(req) || isBookingRoute(req),
  ...createStoreOptions(),
  message: {
    message: "ขออภัย คุณส่งคำขอมากเกินไป กรุณาลองใหม่อีกครั้งในอีก 15 นาที",
  },
});

// Sensitive Auth Rate Limiter — OAuth callback excluded (Google handles abuse)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => shouldSkipRateLimit() || req.path.includes("/google/callback"),
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
  skip: () => shouldSkipRateLimit(),
  ...createStoreOptions(),
  message: {
    message: "คุณทำรายการจองถี่เกินไป กรุณารอซักครู่ก่อนทำรายการใหม่",
  },
});
