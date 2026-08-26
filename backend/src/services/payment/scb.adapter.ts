import {
  IPaymentAdapter,
  PaymentSessionRequest,
  PaymentSessionResponse,
  WebhookResult,
} from "./payment.adapter.interface";

export class SCBPaymentAdapter implements IPaymentAdapter {
  readonly providerId = "scb";
  readonly providerName = "SCB Mae Manee / Open API";

  isEnabled(): boolean {
    return (
      process.env.PAYMENT_PROVIDER === "scb" &&
      !!process.env.SCB_API_KEY &&
      !!process.env.SCB_API_SECRET &&
      !!process.env.SCB_MERCHANT_ID
    );
  }

  async createPaymentSession(request: PaymentSessionRequest): Promise<PaymentSessionResponse> {
    if (!this.isEnabled()) {
      return {
        success: false,
        providerId: this.providerId,
        providerName: this.providerName,
        paymentStatus: "failed",
        message: "SCB payment gateway is not configured or disabled in environment variables.",
      };
    }

    const transactionId = `scb_tx_${Date.now()}`;

    return {
      success: true,
      providerId: this.providerId,
      providerName: this.providerName,
      transactionId,
      qrPayload: `00020101021230480016A00000067701011215${process.env.SCB_MERCHANT_ID || "000000000"}5303764540${request.amount.toFixed(2)}`,
      paymentStatus: "pending",
      message: "SCB QR Code payment session created successfully.",
      raw: {
        merchantId: process.env.SCB_MERCHANT_ID,
        amount: request.amount,
      },
    };
  }

  async handleWebhook(payload: any, _headers?: any): Promise<WebhookResult> {
    if (!payload || !payload.transactionId) {
      return { success: false, status: "ignored", message: "Invalid SCB webhook payload" };
    }

    const isSuccess = payload.status === "SUCCESS" || payload.paymentCode === "00";

    return {
      success: isSuccess,
      bookingNo: payload.billPaymentRef1 || payload.reference1,
      transactionId: payload.transactionId,
      amount: payload.amount ? Number(payload.amount) : undefined,
      status: isSuccess ? "verified" : "failed",
      message: isSuccess ? "SCB payment confirmed" : "SCB payment failed",
      raw: payload,
    };
  }

  async queryPaymentStatus(transactionId: string): Promise<{ status: string; raw?: any }> {
    return {
      status: "pending",
      raw: { transactionId, provider: "scb" },
    };
  }
}
