import type { PaymentProvider } from "@/lib/payments/types";

// Instant simulated payment for demos/CI when no real gateway is available. Always
// succeeds immediately — used so the whole pay flow can be demoed end-to-end without
// YouPI running.
export const mockProvider: PaymentProvider = {
  name: "mock",
  async createCheckout({ invoiceId }) {
    return {
      checkoutUrl: null,
      providerPaymentId: `mock_${invoiceId}_${Date.now()}`,
      status: "SUCCESS",
    };
  },
  async getStatus() {
    return "SUCCESS";
  },
};
