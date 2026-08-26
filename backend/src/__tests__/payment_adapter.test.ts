import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { paymentGateway } from "../services/payment/payment.manager";
import { PromptPayAdapter } from "../services/payment/promptpay.adapter";
import { OpnPaymentAdapter } from "../services/payment/opn.adapter";
import { SCBPaymentAdapter } from "../services/payment/scb.adapter";
import { MockPaymentAdapter } from "../services/payment/mock.adapter";

describe("Modular Payment Gateway System", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("PaymentGatewayManager Defaults & Adapter Resolution", () => {
    it("should default to promptpay_manual adapter when process.env.PAYMENT_PROVIDER is not set", () => {
      delete process.env.PAYMENT_PROVIDER;
      const activeAdapter = paymentGateway.getActiveAdapter();
      expect(activeAdapter.providerId).toBe("promptpay_manual");
      expect(activeAdapter.isEnabled()).toBe(true);
    });

    it("should list all registered payment providers with state", () => {
      const providers = paymentGateway.listAvailableProviders();
      expect(providers.length).toBeGreaterThanOrEqual(6);

      const providerIds = providers.map((p) => p.id);
      expect(providerIds).toContain("promptpay_manual");
      expect(providerIds).toContain("opn");
      expect(providerIds).toContain("scb");
      expect(providerIds).toContain("kbank");
      expect(providerIds).toContain("ktb");
      expect(providerIds).toContain("mock_sandbox");
    });
  });

  describe("PromptPayAdapter", () => {
    it("should generate dynamic EMVCo QR code payload for valid booking", async () => {
      const adapter = new PromptPayAdapter();
      const session = await adapter.createPaymentSession({
        bookingId: 101,
        bookingNo: "BK-2026-101",
        amount: 1500.0,
      });

      expect(session.success).toBe(true);
      expect(session.providerId).toBe("promptpay_manual");
      expect(session.qrPayload).toBeDefined();
      expect(session.qrPayload).toContain("000201"); // EMVCo payload format
    });
  });

  describe("Standby Adapters (Disabled by default without credentials)", () => {
    it("OpnAdapter should be disabled when OPN keys are missing", async () => {
      process.env.PAYMENT_PROVIDER = "opn";
      delete process.env.OPN_PUBLIC_KEY;
      delete process.env.OPN_SECRET_KEY;

      const adapter = new OpnPaymentAdapter();
      expect(adapter.isEnabled()).toBe(false);

      const session = await adapter.createPaymentSession({
        bookingId: 102,
        bookingNo: "BK-2026-102",
        amount: 2000.0,
      });
      expect(session.success).toBe(false);

      // Manager should fallback to default promptpay_manual
      const managerActive = paymentGateway.getActiveAdapter();
      expect(managerActive.providerId).toBe("promptpay_manual");
    });

    it("SCBAdapter should be enabled when all required credentials are set", async () => {
      process.env.PAYMENT_PROVIDER = "scb";
      process.env.SCB_API_KEY = "dummy_key";
      process.env.SCB_API_SECRET = "dummy_secret";
      process.env.SCB_MERCHANT_ID = "123456789";

      const adapter = new SCBPaymentAdapter();
      expect(adapter.isEnabled()).toBe(true);

      const session = await adapter.createPaymentSession({
        bookingId: 103,
        bookingNo: "BK-2026-103",
        amount: 500.0,
      });

      expect(session.success).toBe(true);
      expect(session.providerId).toBe("scb");
      expect(session.qrPayload).toBeDefined();
    });
  });

  describe("Mock Sandbox Adapter", () => {
    it("should handle mock checkout and simulate successful webhook verification", async () => {
      process.env.PAYMENT_PROVIDER = "mock_sandbox";
      const adapter = new MockPaymentAdapter();
      expect(adapter.isEnabled()).toBe(true);

      const webhookRes = await adapter.handleWebhook({
        bookingId: 201,
        bookingNo: "BK-MOCK-201",
        amount: 750,
        simulateStatus: "success",
      });

      expect(webhookRes.success).toBe(true);
      expect(webhookRes.status).toBe("verified");
      expect(webhookRes.bookingNo).toBe("BK-MOCK-201");
    });
  });
});
