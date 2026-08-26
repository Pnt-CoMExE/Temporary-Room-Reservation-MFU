export interface PaymentSessionRequest {
  bookingId: number;
  bookingNo: string;
  amount: number;
  currency?: string;
  customerEmail?: string;
  customerName?: string;
  description?: string;
}

export interface PaymentSessionResponse {
  success: boolean;
  providerId: string;
  providerName: string;
  transactionId?: string;
  qrPayload?: string;
  qrImageUrl?: string;
  checkoutUrl?: string;
  paymentStatus: "pending" | "pending_verification" | "verified" | "failed";
  message?: string;
  raw?: any;
}

export interface WebhookResult {
  success: boolean;
  bookingId?: number;
  bookingNo?: string;
  transactionId?: string;
  amount?: number;
  status: "verified" | "failed" | "ignored";
  message?: string;
  raw?: any;
}

export interface IPaymentAdapter {
  readonly providerId: string;
  readonly providerName: string;

  isEnabled(): boolean;
  createPaymentSession(request: PaymentSessionRequest): Promise<PaymentSessionResponse>;
  handleWebhook(payload: any, headers?: any): Promise<WebhookResult>;
  queryPaymentStatus(transactionId: string): Promise<{ status: string; raw?: any }>;
}
