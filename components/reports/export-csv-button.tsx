"use client";

import { useState } from "react";
import { exportInvoicesCsv } from "@/lib/reports/actions";
import { Button } from "@/components/ui/button";

export function ExportCsvButton() {
  const [pending, setPending] = useState(false);

  async function download() {
    setPending(true);
    const csv = await exportInvoicesCsv();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoices-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setPending(false);
  }

  return (
    <Button variant="outline" disabled={pending} onClick={download}>
      {pending ? "Exporting…" : "Export invoices CSV"}
    </Button>
  );
}
