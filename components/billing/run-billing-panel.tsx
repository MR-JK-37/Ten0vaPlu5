"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { runBilling } from "@/lib/billing/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function RunBillingPanel() {
  const router = useRouter();
  const [asOf, setAsOf] = useState(new Date().toISOString().slice(0, 10));
  const [pending, setPending] = useState<"run" | "dry" | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function trigger(dryRun: boolean) {
    setPending(dryRun ? "dry" : "run");
    setError(null);
    setResult(null);
    const res = await runBilling(asOf, dryRun);
    setPending(null);
    if (res.error) setError(res.error);
    else {
      setResult(dryRun ? "Dry run complete — see preview below." : "Billing run complete.");
      router.refresh();
    }
  }

  return (
    <div className="space-y-3 rounded-md border p-4">
      <div className="flex items-end gap-3">
        <div className="space-y-2">
          <Label htmlFor="asOf">As of date</Label>
          <Input id="asOf" type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} className="w-44" />
        </div>
        <Button variant="outline" disabled={pending !== null} onClick={() => trigger(true)}>
          {pending === "dry" ? "Running dry-run…" : "Dry run"}
        </Button>
        <Button disabled={pending !== null} onClick={() => trigger(false)}>
          {pending === "run" ? "Running…" : "Run billing now"}
        </Button>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {result && <p className="text-sm text-muted-foreground">{result}</p>}
    </div>
  );
}
