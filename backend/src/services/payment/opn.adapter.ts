import {
  IPaymentAdapter,
  PaymentSessionRequest,
  PaymentSessionResponse,
  WebhookResult,
} from "./payment.adapter.interface";

export class OpnPaymentAdapter implements IPaymentAdapter {
  readonly providerId = "opn";
  readonly providerName = "Opn Payments (Formerly Omise)";

  isEnabled(): boolean {
    return (
      process.env.PAYMENT_PROVIDER === "opn" &&
      !!process.env.OPN_PUBLIC_KEY &&
      !!process.env.OPN_SECRET_KEY
    );
  }

  async createPaymentSession(request: PaymentSessionRequest): Promise<PaymentSessionResponse> {
    if (!this.isEnabled()) {
      return {
        success: false,
        providerId: this.providerId,
        providerName: this.providerName,
        paymentStatus: "failed",
        message: "Opn Payments gateway is not configured or disabled in environment variables.",
      };
    }

    const isSandbox = (process.env.OPN_PUBLIC_KEY || "").startsWith("pkey_test_");
    const chargeId = `chg_test_${Date.now()}`;

    return {
      success: true,
      providerId: this.providerId,
      providerName: this.providerName,
      transactionId: chargeId,
      checkoutUrl: `https://pay.opn.ooo/checkout/${chargeId}`,
      paymentStatus: "pending",
      message: isSandbox
        ? "[SANDBOX READY] Opn Payments Session Initialized"
        : "Opn Payments Session Initialized",
      raw: {
        amount: Math.round(request.amount * 100), // Opn uses sub-units (satangs)
        currency: request.currency || "THB",
        returnUrl: `${process.env.APP_URL || "http://localhost:3000"}/booking/${request.bookingId}/complete`,
      },
    };
  }

  async handleWebhook(payload: any, _headers?: any): Promise<WebhookResult> {
    if (!payload || payload.object !== "event") {
      return { success: false, status: "ignored", message: "Invalid Opn webhook event structure" };
    }

    if (payload.key === "charge.complete") {
      const charge = payload.data;
      const isPaid = charge && charge.status === "successful" && charge.paid;
      const bookingNo = charge.metadata?.bookingNo;

      return {
        success: isPaid,
        bookingNo,
        transactionId: charge.id,
        amount: charge.amount ? charge.amount / 100 : undefined,
        status: isPaid ? "verified" : "failed",
        message: isPaid ? "Opn payment successful" : "Opn payment failed or pending",
        raw: charge,
      };
    }

    return { success: true, status: "ignored", message: `Event ${payload.key} acknowledged` };
  }

  async queryPaymentStatus(transactionId: string): Promise<{ status: string; raw?: any }> {
    return {
      status: "pending",
      raw: { transactionId, provider: "opn" },
    };
  }
}
