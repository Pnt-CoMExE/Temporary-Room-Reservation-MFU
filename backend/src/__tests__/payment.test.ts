import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../../app";
import * as db from "../../db";
import { generatePromptPayPayload, crc16 } from "../services/promptpay.service";

vi.mock("../../db", () => ({
  query: vi.fn().mockResolvedValue({ rows: [] }),
  pool: {
    connect: vi.fn().mockResolvedValue({
      query: vi.fn().mockResolvedValue({ rows: [] }),
      release: vi.fn(),
    }),
  },
}));

describe("PromptPay EMVCo Payload Generator", () => {
  it("should calculate valid CRC16-CCITT checksum", () => {
    const payload = "00020101021229370016A0000006770101110213057553200010053037645802TH5406150.006304";
    const checksum = crc16(payload);
    expect(checksum).toBeTypeOf("string");
    expect(checksum.length).toBe(4);
  });

  it("should generate valid EMVCo PromptPay QR string for Tax ID", () => {
    const payload = generatePromptPayPayload("0575532000100", 150.0);
    expect(payload).toContain("000201");
    expect(payload).toContain("5303764"); // THB
    expect(payload).toContain("5802TH");
    expect(payload).toContain("5406150.00");
  });

  it("should generate valid EMVCo PromptPay QR string for mobile number", () => {
    const payload = generatePromptPayPayload("0812345678", 500);
    expect(payload).toContain("0066812345678");
    expect(payload).toContain("5406500.00");
  });
});

describe("Payment API Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST /api/payment/promptpay/generate should require authentication", async () => {
    const res = await request(app)
      .post("/api/payment/promptpay/generate")
      .send({ bookingId: 1 });
    expect(res.status).toBe(401);
  });

  it("POST /api/payment/slip/upload should require authentication", async () => {
    const res = await request(app)
      .post("/api/payment/slip/upload")
      .field("bookingId", "1");
    expect(res.status).toBe(401);
  });

  it("POST /api/payment/verify should require admin authentication", async () => {
    const res = await request(app)
      .post("/api/payment/verify")
      .send({ bookingId: 1, isVerified: true });
    expect(res.status).toBe(401);
  });
});
