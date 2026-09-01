import redisClient from "./src/redisClient";

const PORT = process.env.PORT || 3000;

async function start() {
  if (process.env.REDIS_URL && process.env.NODE_ENV !== "test") {
    try {
      if (redisClient.status === "wait") {
        await redisClient.connect();
      }
      await redisClient.ping();
    } catch {
      console.warn("⚠️ ไม่พบ Redis server — rate limit จะใช้ memory store ชั่วคราว");
    }
  }

  const { default: app } = await import("./app");
  app.listen(PORT, () => {
    console.log(`🚀 Server รันอยู่บน http://localhost:${PORT}`);
  });
}

start();
