import type { PaymentProvider } from "@/lib/payments/types";
import { toYoupiAmount } from "@/lib/money/money";

// Online UPI checkout via a self-hosted YouPI-PG instance. See docs/BLOCKERS.md: no YouPI
// server is running in this environment, so this provider is implemented per the
// documented API shape (AGENTS.md section 9) but has not been exercised against a live
// gateway. The `mock` provider is the complete substitute for the demo.
const BASE_URL = process.env.YOUPI_BASE_URL;
const API_KEY = process.env.YOUPI_API_KEY;
const MERCHANT_ID = process.env.YOUPI_MERCHANT_ID;

export const youpiProvider: PaymentProvider = {
  name: "youpi",
  async createCheckout({ invoiceId, amount, customerName, customerEmail, returnUrl }) {
    if (!BASE_URL) throw new Error("YOUPI_BASE_URL is not configured");

    const orderId = `${invoiceId}-${Date.now()}`;
    const res = await fetch(`${BASE_URL}/api/v1/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": orderId,
        ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
        ...(MERCHANT_ID ? { "X-Merchant-Id": MERCHANT_ID } : {}),
      },
      body: JSON.stringify({
        orderId,
        amount: toYoupiAmount(amount),
        currency: "INR",
        customer: { name: customerName, email: customerEmail },
        description: `Invoice ${invoiceId}`,
        returnUrl,
        metadata: { invoiceId },
      }),
    });

    if (!res.ok) {
      throw new Error(`YouPI checkout failed: ${res.status}`);
    }

    const data = await res.json();
    return {
      checkoutUrl: data.checkoutUrl ?? null,
      providerPaymentId: data.paymentId,
      status: data.status === "SUCCESS" ? "SUCCESS" : "INITIATED",
    };
  },

  async getStatus(providerPaymentId) {
    if (!BASE_URL) throw new Error("YOUPI_BASE_URL is not configured");
    const res = await fetch(`${BASE_URL}/api/v1/payments/${providerPaymentId}`, {
      headers: API_KEY ? { Authorization: `Bearer ${API_KEY}` } : undefined,
    });
    if (!res.ok) return "FAILED";
    const data = await res.json();
    return data.status === "SUCCESS" ? "SUCCESS" : data.status === "FAILED" ? "FAILED" : "ACTIVE";
  },
};
