// Common interface every payment provider implements, per AGENTS.md section 9: never
// hard-wire a single gateway into the app.

export interface CheckoutResult {
  checkoutUrl: string | null;
  providerPaymentId: string;
  status: "INITIATED" | "ACTIVE" | "SUCCESS" | "FAILED";
}

export interface PaymentProvider {
  name: string;
  createCheckout(params: {
    invoiceId: string;
    amount: number; // minor units
    customerName: string;
    customerEmail: string;
    returnUrl: string;
  }): Promise<CheckoutResult>;
  getStatus(providerPaymentId: string): Promise<CheckoutResult["status"]>;
}
