"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { confirmInvoice, cancelInvoice, sendInvoice } from "@/lib/invoices/actions";
import { Button } from "@/components/ui/button";

export function InvoiceActions({ invoiceId, status }: { invoiceId: string; status: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(name: string, fn: () => Promise<{ error?: string }>) {
    setPending(name);
    setError(null);
    const result = await fn();
    setPending(null);
    if (result.error) setError(result.error);
    else router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      {status === "draft" && (
        <Button size="sm" variant="outline" disabled={!!pending} onClick={() => act("confirm", () => confirmInvoice(invoiceId))}>
          Confirm
        </Button>
      )}
      {(status === "draft" || status === "confirmed") && (
        <Button size="sm" variant="destructive" disabled={!!pending} onClick={() => act("cancel", () => cancelInvoice(invoiceId))}>
          Cancel
        </Button>
      )}
      {(status === "confirmed" || status === "paid") && (
        <Button size="sm" variant="outline" disabled={!!pending} onClick={() => act("send", () => sendInvoice(invoiceId))}>
          Send
        </Button>
      )}
      <Button size="sm" variant="outline" onClick={() => window.open(`/invoices/${invoiceId}/print`, "_blank")}>
        Print
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
