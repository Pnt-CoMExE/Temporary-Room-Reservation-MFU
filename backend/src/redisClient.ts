import Redis from "ioredis";

// ==========================================
// Redis Client (Singleton with graceful fallback)
// ==========================================
// ใช้ REDIS_URL จาก env เมื่อรันใน Docker
// fallback ไป localhost สำหรับ dev
// ถ้าไม่มี REDIS_URL หรือ NODE_ENV=test → ไม่ connect
const REDIS_URL = process.env.REDIS_URL;
const IS_TEST = process.env.NODE_ENV === "test" || process.env.VITEST === "true";

function isRedisReady(): boolean {
  // Cast: after await connect(), TS narrows status away from "ready"
  return (redisClient.status as string) === "ready";
}

// Always lazyConnect so we never double-connect (auto + connect() → false "ไม่พบ Redis")
const redisClient = new Redis(REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: IS_TEST ? 0 : 3,
  enableOfflineQueue: !IS_TEST,
  lazyConnect: true,
  retryStrategy(times) {
    // Docker: Redis may still be starting; allow more attempts than bare local
    const max = REDIS_URL ? 10 : 3;
    if (IS_TEST || times > max) {
      return null;
    }
    return Math.min(times * 200, 2000);
  },
});

redisClient.on("connect", () => {
  if (!IS_TEST) console.log("✅ Redis เชื่อมต่อสำเร็จ");
});

redisClient.on("error", (err) => {
  // Suppress transient boot noise; final failure is logged in connectRedis()
  if (!IS_TEST && (redisClient.status as string) === "end") {
    console.warn("⚠️ Redis error:", err.message);
  }
});

async function connectRedis(): Promise<void> {
  if (IS_TEST) return;

  const maxAttempts = REDIS_URL ? 10 : 1;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (isRedisReady()) return;

      const status = redisClient.status;
      if (status === "wait" || status === "end") {
        await redisClient.connect();
      }

      if (isRedisReady()) return;

      // Still connecting — wait for ready / end
      await new Promise<void>((resolve, reject) => {
        if (isRedisReady()) {
          resolve();
          return;
        }
        const timer = setTimeout(() => reject(new Error("redis ready timeout")), 2500);
        const onReady = () => {
          clearTimeout(timer);
          cleanup();
          resolve();
        };
        const onEnd = () => {
          clearTimeout(timer);
          cleanup();
          reject(new Error("redis ended"));
        };
        const cleanup = () => {
          redisClient.off("ready", onReady);
          redisClient.off("end", onEnd);
        };
        redisClient.once("ready", onReady);
        redisClient.once("end", onEnd);
      });
      return;
    } catch {
      if (attempt === maxAttempts) {
        console.warn(
          "⚠️ ไม่พบ Redis server — ระบบจะรันต่อโดยไม่ใช้ Redis (dev mode)"
        );
        return;
      }
      await new Promise((r) => setTimeout(r, Math.min(attempt * 300, 2000)));
    }
  }
}

void connectRedis();

export default redisClient;
