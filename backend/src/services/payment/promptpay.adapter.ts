import {
  IPaymentAdapter,
  PaymentSessionRequest,
  PaymentSessionResponse,
  WebhookResult,
} from "./payment.adapter.interface";
import { generatePromptPayPayload } from "../promptpay.service";

export class PromptPayAdapter implements IPaymentAdapter {
  readonly providerId = "promptpay_manual";
  readonly providerName = "Dynamic PromptPay EMVCo (Manual Slip Upload)";

  isEnabled(): boolean {
    // Enabled by default unless explicitly disabled
    return process.env.ENABLE_PROMPTPAY_MANUAL !== "false";
  }

  async createPaymentSession(request: PaymentSessionRequest): Promise<PaymentSessionResponse> {
    const targetPromptPayId = process.env.PROMPTPAY_ID || "0575532000100"; // MFU Tax ID default
    const qrPayload = generatePromptPayPayload(targetPromptPayId, request.amount);

    return {
      success: true,
      providerId: this.providerId,
      providerName: this.providerName,
      transactionId: `PP-${request.bookingNo}-${Date.now()}`,
      qrPayload,
      paymentStatus: "pending_verification",
      message: "สร้าง QR Code สำหรับ PromptPay เรียบร้อยแล้ว กรุณาอัปโหลดสลิปหลังชำระเงิน",
      raw: {
        promptpayId: targetPromptPayId,
        amount: request.amount,
      },
    };
  }

  async handleWebhook(_payload: any, _headers?: any): Promise<WebhookResult> {
    // Manual PromptPay does not support bank webhook; verification is done via admin dashboard
    return {
      success: false,
      status: "ignored",
      message: "PromptPay Manual Slip mode relies on Admin verification dashboard, not automated webhook.",
    };
  }

  async queryPaymentStatus(transactionId: string): Promise<{ status: string; raw?: any }> {
    return {
      status: "pending_verification",
      raw: { transactionId, note: "Status managed via bookings table payment_status column" },
    };
  }
}
