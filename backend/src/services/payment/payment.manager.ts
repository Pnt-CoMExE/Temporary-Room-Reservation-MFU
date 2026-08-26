import {
  IPaymentAdapter,
  PaymentSessionRequest,
  PaymentSessionResponse,
  WebhookResult,
} from "./payment.adapter.interface";
import { PromptPayAdapter } from "./promptpay.adapter";
import { OpnPaymentAdapter } from "./opn.adapter";
import { SCBPaymentAdapter } from "./scb.adapter";
import { KBankPaymentAdapter } from "./kbank.adapter";
import { KTBPaymentAdapter } from "./ktb.adapter";
import { MockPaymentAdapter } from "./mock.adapter";

export class PaymentGatewayManager {
  private static instance: PaymentGatewayManager;
  private adapters: Map<string, IPaymentAdapter> = new Map();
  private defaultAdapterId = "promptpay_manual";

  private constructor() {
    this.registerAdapter(new PromptPayAdapter());
    this.registerAdapter(new OpnPaymentAdapter());
    this.registerAdapter(new SCBPaymentAdapter());
    this.registerAdapter(new KBankPaymentAdapter());
    this.registerAdapter(new KTBPaymentAdapter());
    this.registerAdapter(new MockPaymentAdapter());
  }

  public static getInstance(): PaymentGatewayManager {
    if (!PaymentGatewayManager.instance) {
      PaymentGatewayManager.instance = new PaymentGatewayManager();
    }
    return PaymentGatewayManager.instance;
  }

  public registerAdapter(adapter: IPaymentAdapter): void {
    this.adapters.set(adapter.providerId, adapter);
  }

  public getActiveAdapter(): IPaymentAdapter {
    const selectedProvider = process.env.PAYMENT_PROVIDER || this.defaultAdapterId;
    const adapter = this.adapters.get(selectedProvider);

    if (adapter && adapter.isEnabled()) {
      return adapter;
    }

    // Fallback to default PromptPay Manual adapter
    const defaultAdapter = this.adapters.get(this.defaultAdapterId);
    return defaultAdapter || new PromptPayAdapter();
  }

  public getAdapter(providerId: string): IPaymentAdapter | undefined {
    return this.adapters.get(providerId);
  }

  public listAvailableProviders(): Array<{
    id: string;
    name: string;
    isEnabled: boolean;
    isActive: boolean;
  }> {
    const activeAdapter = this.getActiveAdapter();
    const list: Array<{
      id: string;
      name: string;
      isEnabled: boolean;
      isActive: boolean;
    }> = [];

    this.adapters.forEach((adapter) => {
      list.push({
        id: adapter.providerId,
        name: adapter.providerName,
        isEnabled: adapter.isEnabled(),
        isActive: adapter.providerId === activeAdapter.providerId,
      });
    });

    return list;
  }

  public async createPaymentSession(
    request: PaymentSessionRequest
  ): Promise<PaymentSessionResponse> {
    const adapter = this.getActiveAdapter();
    return adapter.createPaymentSession(request);
  }

  public async handleWebhook(
    providerId: string,
    payload: any,
    headers?: any
  ): Promise<WebhookResult> {
    const adapter = this.getAdapter(providerId);
    if (!adapter) {
      return {
        success: false,
        status: "ignored",
        message: `Unknown payment provider: ${providerId}`,
      };
    }
    return adapter.handleWebhook(payload, headers);
  }
}

export const paymentGateway = PaymentGatewayManager.getInstance();
