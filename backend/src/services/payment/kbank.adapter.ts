import {
  IPaymentAdapter,
  PaymentSessionRequest,
  PaymentSessionResponse,
  WebhookResult,
} from "./payment.adapter.interface";

export class KBankPaymentAdapter implements IPaymentAdapter {
  readonly providerId = "kbank";
  readonly providerName = "KBank K-Payment Gateway";

  isEnabled(): boolean {
    return (
      process.env.PAYMENT_PROVIDER === "kbank" &&
      !!process.env.KBANK_SECRET_KEY &&
      !!process.env.KBANK_MERCHANT_ID
    );
  }

  async createPaymentSession(request: PaymentSessionRequest): Promise<PaymentSessionResponse> {
    if (!this.isEnabled()) {
      return {
        success: false,
        providerId: this.providerId,
        providerName: this.providerName,
        paymentStatus: "failed",
        message: "KBank payment gateway is not configured or disabled in environment variables.",
      };
    }

    const transactionId = `kbank_tx_${Date.now()}`;

    return {
      success: true,
      providerId: this.providerId,
      providerName: this.providerName,
      transactionId,
      checkoutUrl: `https://kpaymentgateway.kasikornbank.com/pay/${transactionId}`,
      paymentStatus: "pending",
      message: "KBank Payment session created successfully.",
      raw: {
        merchantId: process.env.KBANK_MERCHANT_ID,
        amount: request.amount,
      },
    };
  }

  async handleWebhook(payload: any, _headers?: any): Promise<WebhookResult> {
    if (!payload || !payload.id) {
      return { success: false, status: "ignored", message: "Invalid KBank webhook payload" };
    }

    const isSuccess = payload.status === "success" || payload.charge_status === "SUCCESS";

    return {
      success: isSuccess,
      bookingNo: payload.metadata?.bookingNo,
      transactionId: payload.id,
      amount: payload.amount ? Number(payload.amount) : undefined,
      status: isSuccess ? "verified" : "failed",
      message: isSuccess ? "KBank payment confirmed" : "KBank payment failed",
      raw: payload,
    };
  }

  async queryPaymentStatus(transactionId: string): Promise<{ status: string; raw?: any }> {
    return {
      status: "pending",
      raw: { transactionId, provider: "kbank" },
    };
  }
}
