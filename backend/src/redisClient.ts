import Redis from "ioredis";

// ==========================================
// Redis Client (Singleton with graceful fallback)
// ==========================================
// ใช้ REDIS_URL จาก env เมื่อรันใน Docker
// fallback ไป localhost สำหรับ dev
// ถ้าไม่มี REDIS_URL หรือ NODE_ENV=test → ไม่ connect
const REDIS_URL = process.env.REDIS_URL;
const IS_TEST = process.env.NODE_ENV === "test" || process.env.VITEST === "true";

// ถ้าไม่มี REDIS_URL หรือเป็น test environment → ใช้ disconnected client
// เพื่อไม่ให้ vitest/jest hang เพราะ open connection
const redisClient = new Redis(REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: IS_TEST ? 0 : 3,
  enableOfflineQueue: !IS_TEST,
  lazyConnect: IS_TEST || !REDIS_URL,
  retryStrategy(times) {
    if (IS_TEST || times > 3) {
      return null; // หยุด retry ใน test หรือหลัง 3 ครั้ง
    }
    return Math.min(times * 200, 1000);
  },
});

redisClient.on("connect", () => {
  if (!IS_TEST) console.log("✅ Redis เชื่อมต่อสำเร็จ");
});

redisClient.on("error", (err) => {
  // Log เป็น warning เท่านั้น ไม่ crash app
  if (!IS_TEST) console.warn("⚠️ Redis error:", err.message);
});

// เชื่อมต่อเฉพาะตอนที่มี REDIS_URL และไม่ใช่ test environment
if (REDIS_URL && !IS_TEST) {
  redisClient.connect().catch(() => {
    console.warn("⚠️ ไม่พบ Redis server — ระบบจะรันต่อโดยไม่ใช้ Redis (dev mode)");
  });
} else if (!IS_TEST && !REDIS_URL) {
  // Dev mode without Redis — try localhost
  redisClient.connect().catch(() => {
    console.warn("⚠️ ไม่พบ Redis server — ระบบจะรันต่อโดยไม่ใช้ Redis (dev mode)");
  });
}

export default redisClient;
