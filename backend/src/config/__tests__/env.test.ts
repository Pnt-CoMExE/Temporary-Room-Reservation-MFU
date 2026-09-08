import { describe, it, expect, afterEach, vi } from "vitest";

describe("env.cookieSecure / smtpEnabled", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  it("COOKIE_SECURE=false → cookieSecure เป็น false แม้ FRONTEND_URL เป็น https", async () => {
    process.env.COOKIE_SECURE = "false";
    process.env.FRONTEND_URL = "https://example.mfu.ac.th";
    process.env.JWT_SECRET = "test-secret";
    const { env } = await import("../env");
    expect(env.cookieSecure).toBe(false);
  });

  it("COOKIE_SECURE=true → cookieSecure เป็น true", async () => {
    process.env.COOKIE_SECURE = "true";
    process.env.FRONTEND_URL = "http://localhost:8080";
    process.env.JWT_SECRET = "test-secret";
    const { env } = await import("../env");
    expect(env.cookieSecure).toBe(true);
  });

  it("ไม่ตั้ง COOKIE_SECURE → ตาม FRONTEND_URL เป็น https หรือไม่", async () => {
    delete process.env.COOKIE_SECURE;
    process.env.FRONTEND_URL = "https://booking.mfu.ac.th";
    process.env.JWT_SECRET = "test-secret";
    const { env } = await import("../env");
    expect(env.cookieSecure).toBe(true);
  });

  it("smtpEnabled เป็น true เมื่อมี host/user/pass ครบ", async () => {
    process.env.JWT_SECRET = "test-secret";
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_USER = "user";
    process.env.SMTP_PASS = "pass";
    const { env } = await import("../env");
    expect(env.smtpEnabled()).toBe(true);
  });

  it("smtpEnabled เป็น false เมื่อขาด credentials", async () => {
    process.env.JWT_SECRET = "test-secret";
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    const { env } = await import("../env");
    expect(env.smtpEnabled()).toBe(false);
  });
});
