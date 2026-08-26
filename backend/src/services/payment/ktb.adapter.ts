import {
  IPaymentAdapter,
  PaymentSessionRequest,
  PaymentSessionResponse,
  WebhookResult,
} from "./payment.adapter.interface";

export class KTBPaymentAdapter implements IPaymentAdapter {
  readonly providerId = "ktb";
  readonly providerName = "Krungthai Bank (KTB) Corporate Payment";

  isEnabled(): boolean {
    return (
      process.env.PAYMENT_PROVIDER === "ktb" &&
      !!process.env.KTB_MERCHANT_ID &&
      !!process.env.KTB_SECRET_KEY
    );
  }

  async createPaymentSession(request: PaymentSessionRequest): Promise<PaymentSessionResponse> {
    if (!this.isEnabled()) {
      return {
        success: false,
        providerId: this.providerId,
        providerName: this.providerName,
        paymentStatus: "failed",
        message: "KTB payment gateway is not configured or disabled in environment variables.",
      };
    }

    const transactionId = `ktb_tx_${Date.now()}`;

    return {
      success: true,
      providerId: this.providerId,
      providerName: this.providerName,
      transactionId,
      checkoutUrl: `https://corporate.krungthai.com/pay/${transactionId}`,
      paymentStatus: "pending",
      message: "KTB Corporate Payment session created successfully.",
      raw: {
        merchantId: process.env.KTB_MERCHANT_ID,
        amount: request.amount,
      },
    };
  }

  async handleWebhook(payload: any, _headers?: any): Promise<WebhookResult> {
    if (!payload || !payload.refCode) {
      return { success: false, status: "ignored", message: "Invalid KTB webhook payload" };
    }

    const isSuccess = payload.responseCode === "0000" || payload.status === "PAID";

    return {
      success: isSuccess,
      bookingNo: payload.ref1 || payload.bookingNo,
      transactionId: payload.refCode,
      amount: payload.amount ? Number(payload.amount) : undefined,
      status: isSuccess ? "verified" : "failed",
      message: isSuccess ? "KTB payment confirmed" : "KTB payment failed",
      raw: payload,
    };
  }

  async queryPaymentStatus(transactionId: string): Promise<{ status: string; raw?: any }> {
    return {
      status: "pending",
      raw: { transactionId, provider: "ktb" },
    };
  }
}
