import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { resolveUserType } from "../resolveUserType";

describe("resolveUserType", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.DEV_ADMIN_EMAILS;
    delete process.env.DEV_INTERNAL_EMAILS;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("ไม่ใช้ @property.mfu.ac.th เป็น admin อัตโนมัติ", () => {
    expect(resolveUserType("staff@property.mfu.ac.th")).toBe("external");
  });

  it("กำหนด internal สำหรับโดเมนตรงๆ @mfu.ac.th", () => {
    expect(resolveUserType("wichai.staff@mfu.ac.th")).toBe("internal");
  });

  it("กำหนด external สำหรับอีเมลภายนอก", () => {
    expect(resolveUserType("john@company.com")).toBe("external");
  });

  it("คงค่า admin ที่ถูก promote แล้ว (ทุกโดเมน)", () => {
    expect(resolveUserType("john@company.com", "admin")).toBe("admin");
    expect(resolveUserType("staff@mfu.ac.th", "admin")).toBe("admin");
    expect(resolveUserType("piya.student@lamduan.mfu.ac.th", "admin")).toBe("admin");
  });

  it("บุคลากร @mfu.ac.th ที่ยังไม่ใช่ admin → internal (ไม่ทับด้วย existing อื่น)", () => {
    expect(resolveUserType("staff@mfu.ac.th", "external")).toBe("internal");
  });

  it("รองรับ DEV_ADMIN_EMAILS สำหรับ UAT / bootstrap", () => {
    process.env.DEV_ADMIN_EMAILS = "student@gmail.com, tester@outlook.com";
    expect(resolveUserType("student@gmail.com")).toBe("admin");
    expect(resolveUserType("tester@outlook.com")).toBe("admin");
  });

  it("@lamduan.mfu.ac.th เป็นนักศึกษา → external", () => {
    expect(resolveUserType("piya.student@lamduan.mfu.ac.th")).toBe("external");
    expect(resolveUserType("6631501071@lamduan.mfu.ac.th")).toBe("external");
  });

  it("trim + lowercase อีเมลก่อนเทียบโดเมน", () => {
    expect(resolveUserType("  Wichai.Staff@MFU.ac.th  ")).toBe("internal");
  });

  it("DEV_ADMIN_EMAILS ว่างหรือมีช่องว่างเกิน → ไม่ promote", () => {
    process.env.DEV_ADMIN_EMAILS = " ,  , ";
    expect(resolveUserType("nobody@gmail.com")).toBe("external");
  });

  it("อีเมลภายนอกไม่มี existingType → external", () => {
    expect(resolveUserType("guest@yahoo.com", undefined)).toBe("external");
  });

  it("รองรับ DEV_INTERNAL_EMAILS สำหรับ Demo/UAT", () => {
    process.env.DEV_INTERNAL_EMAILS = "6631501071@lamduan.mfu.ac.th";
    expect(resolveUserType("6631501071@lamduan.mfu.ac.th")).toBe("internal");
    expect(resolveUserType("other@lamduan.mfu.ac.th")).toBe("external");
  });

  it("DEV_ADMIN_EMAILS มีลำดับสูงกว่า DEV_INTERNAL_EMAILS", () => {
    process.env.DEV_ADMIN_EMAILS = "both@gmail.com";
    process.env.DEV_INTERNAL_EMAILS = "both@gmail.com";
    expect(resolveUserType("both@gmail.com")).toBe("admin");
  });

  it("คง internal ที่ถูกตั้งไว้สำหรับเมลนอก @mfu.ac.th", () => {
    expect(resolveUserType("guest@gmail.com", "internal")).toBe("internal");
  });
});
