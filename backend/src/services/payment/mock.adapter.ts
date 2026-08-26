import {
  IPaymentAdapter,
  PaymentSessionRequest,
  PaymentSessionResponse,
  WebhookResult,
} from "./payment.adapter.interface";

export class MockPaymentAdapter implements IPaymentAdapter {
  readonly providerId = "mock_sandbox";
  readonly providerName = "Mock Sandbox Payment Gateway (UAT Testing)";

  isEnabled(): boolean {
    return process.env.PAYMENT_PROVIDER === "mock_sandbox" || process.env.NODE_ENV === "test";
  }

  async createPaymentSession(request: PaymentSessionRequest): Promise<PaymentSessionResponse> {
    const transactionId = `mock_tx_${Date.now()}`;

    return {
      success: true,
      providerId: this.providerId,
      providerName: this.providerName,
      transactionId,
      qrPayload: `MOCK_QR_${request.bookingNo}_${request.amount}`,
      checkoutUrl: `/api/payment/mock/checkout-ui?tx=${transactionId}&amount=${request.amount}`,
      paymentStatus: "pending",
      message: "[MOCK SANDBOX] Payment session created successfully for testing.",
      raw: {
        bookingId: request.bookingId,
        amount: request.amount,
      },
    };
  }

  async handleWebhook(payload: any, _headers?: any): Promise<WebhookResult> {
    const isVerified = payload.simulateStatus !== "failed";

    return {
      success: isVerified,
      bookingId: payload.bookingId,
      bookingNo: payload.bookingNo,
      transactionId: payload.transactionId || `mock_tx_${Date.now()}`,
      amount: payload.amount,
      status: isVerified ? "verified" : "failed",
      message: isVerified
        ? "[MOCK SANDBOX] Instant payment simulation verified"
        : "[MOCK SANDBOX] Payment simulation failed",
      raw: payload,
    };
  }

  async queryPaymentStatus(transactionId: string): Promise<{ status: string; raw?: any }> {
    return {
      status: "verified",
      raw: { transactionId, note: "Mock sandbox always auto-approves status query" },
    };
  }
}
