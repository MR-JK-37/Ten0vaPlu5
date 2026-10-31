import type { PaymentProvider } from "@/lib/payments/types";
import { mockProvider } from "@/lib/payments/providers/mock";
import { youpiProvider } from "@/lib/payments/providers/youpi";

// Selected by env; the UI only ever offers "manual" (recorded by staff) plus whichever one
// of these is active. PAYMENT_PROVIDER defaults to "mock" since no YouPI server is running
// in this environment (see docs/BLOCKERS.md).
export function getOnlinePaymentProvider(): PaymentProvider {
  const name = process.env.PAYMENT_PROVIDER ?? "mock";
  if (name === "youpi") return youpiProvider;
  return mockProvider;
}
