"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { payInvoiceOnline } from "@/lib/payments/actions";
import { Button } from "@/components/ui/button";

export function PayInvoiceButton({ invoiceId }: { invoiceId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setPending(true);
    setError(null);
    const result = await payInvoiceOnline(invoiceId);
    setPending(false);
    if (result.error) setError(result.error);
    else if (result.checkoutUrl) window.location.href = result.checkoutUrl;
    else router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" disabled={pending} onClick={pay}>
        {pending ? "Processing…" : "Pay now"}
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
