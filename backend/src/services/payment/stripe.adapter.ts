import {
  IPaymentAdapter,
  PaymentSessionRequest,
  PaymentSessionResponse,
  WebhookResult,
} from "./payment.adapter.interface";

/**
 * Stripe adapter — test/demo mode for Recording 4.
 * - With STRIPE_SECRET_KEY (sk_test_...): creates real Checkout Session via Stripe API
 * - Without key: local demo checkout URL that posts webhook callback + Transaction ID
 */
export class StripePaymentAdapter implements IPaymentAdapter {
  readonly providerId = "stripe";
  readonly providerName = "Stripe (Test / Demo)";

  isEnabled(): boolean {
    return process.env.PAYMENT_PROVIDER === "stripe";
  }

  private hasLiveTestKey(): boolean {
    const key = process.env.STRIPE_SECRET_KEY || "";
    return key.startsWith("sk_test_") || key.startsWith("sk_live_");
  }

  private appBase(): string {
    return (
      process.env.APP_URL ||
      process.env.BACKEND_URL ||
      `http://localhost:${process.env.PORT || 3000}`
    ).replace(/\/$/, "");
  }

  private frontendBase(): string {
    return (process.env.FRONTEND_URL || "http://localhost:5173").split(",")[0].trim().replace(/\/$/, "");
  }

  async createPaymentSession(request: PaymentSessionRequest): Promise<PaymentSessionResponse> {
    if (!this.isEnabled()) {
      return {
        success: false,
        providerId: this.providerId,
        providerName: this.providerName,
        paymentStatus: "failed",
        message: "Stripe gateway is not active (set PAYMENT_PROVIDER=stripe).",
      };
    }

    if (this.hasLiveTestKey()) {
      return this.createStripeCheckoutSession(request);
    }

    const transactionId = `stripe_demo_${Date.now()}`;
    const params = new URLSearchParams({
      tx: transactionId,
      bookingId: String(request.bookingId),
      bookingNo: request.bookingNo,
      amount: String(request.amount),
    });

    return {
      success: true,
      providerId: this.providerId,
      providerName: this.providerName,
      transactionId,
      checkoutUrl: `${this.appBase()}/api/payment/stripe/demo-checkout?${params.toString()}`,
      paymentStatus: "pending",
      message:
        "[STRIPE DEMO] No STRIPE_SECRET_KEY — using local demo checkout. Set sk_test_... for real Stripe test mode.",
      raw: { mode: "demo", bookingId: request.bookingId, amount: request.amount },
    };
  }

  private async createStripeCheckoutSession(
    request: PaymentSessionRequest
  ): Promise<PaymentSessionResponse> {
    const secret = process.env.STRIPE_SECRET_KEY as string;
    const amountSatang = Math.round(Number(request.amount) * 100);
    const successUrl = `${this.frontendBase()}/dashboard?stripe=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${this.frontendBase()}/dashboard?stripe=cancel`;

    const body = new URLSearchParams();
    body.set("mode", "payment");
    body.set("success_url", successUrl);
    body.set("cancel_url", cancelUrl);
    body.set("client_reference_id", request.bookingNo);
    body.set("metadata[bookingId]", String(request.bookingId));
    body.set("metadata[bookingNo]", request.bookingNo);
    body.set("line_items[0][price_data][currency]", (request.currency || "thb").toLowerCase());
    body.set("line_items[0][price_data][product_data][name]", `MFU Booking ${request.bookingNo}`);
    body.set("line_items[0][price_data][unit_amount]", String(amountSatang));
    body.set("line_items[0][quantity]", "1");
    if (request.customerEmail) body.set("customer_email", request.customerEmail);

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const data: any = await res.json();
    if (!res.ok) {
      return {
        success: false,
        providerId: this.providerId,
        providerName: this.providerName,
        paymentStatus: "failed",
        message: data?.error?.message || "Stripe Checkout Session failed",
        raw: data,
      };
    }

    return {
      success: true,
      providerId: this.providerId,
      providerName: this.providerName,
      transactionId: data.id,
      checkoutUrl: data.url,
      paymentStatus: "pending",
      message: "[STRIPE TEST] Checkout Session created",
      raw: data,
    };
  }

  async handleWebhook(payload: any, headers?: any): Promise<WebhookResult> {
    // Demo / internal confirm payload
    if (payload?.source === "stripe_demo" || payload?.simulateStatus) {
      const ok = payload.simulateStatus !== "failed";
      return {
        success: ok,
        bookingId: payload.bookingId ? Number(payload.bookingId) : undefined,
        bookingNo: payload.bookingNo,
        transactionId: payload.transactionId || `stripe_demo_${Date.now()}`,
        amount: payload.amount != null ? Number(payload.amount) : undefined,
        status: ok ? "verified" : "failed",
        message: ok ? "[STRIPE DEMO] Payment confirmed via callback" : "[STRIPE DEMO] Payment failed",
        raw: payload,
      };
    }

    // Stripe event shape (checkout.session.completed)
    const type = payload?.type || payload?.event;
    if (type === "checkout.session.completed") {
      const session = payload.data?.object || payload.object || {};
      const bookingNo =
        session.client_reference_id ||
        session.metadata?.bookingNo ||
        payload.bookingNo;
      const bookingId = session.metadata?.bookingId
        ? Number(session.metadata.bookingId)
        : payload.bookingId
          ? Number(payload.bookingId)
          : undefined;
      const paid =
        session.payment_status === "paid" ||
        session.status === "complete" ||
        payload.forcePaid === true;

      return {
        success: paid,
        bookingId,
        bookingNo,
        transactionId: session.payment_intent || session.id || payload.transactionId,
        amount: session.amount_total != null ? Number(session.amount_total) / 100 : undefined,
        status: paid ? "verified" : "failed",
        message: paid ? "Stripe checkout.session.completed" : "Stripe session not paid",
        raw: { headers, session },
      };
    }

    return {
      success: true,
      status: "ignored",
      message: `Stripe event ignored: ${type || "unknown"}`,
      raw: payload,
    };
  }

  async queryPaymentStatus(transactionId: string): Promise<{ status: string; raw?: any }> {
    if (!this.hasLiveTestKey()) {
      return { status: "pending", raw: { transactionId, mode: "demo" } };
    }
    return { status: "pending", raw: { transactionId, provider: "stripe" } };
  }
}
