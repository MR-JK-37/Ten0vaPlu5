"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSubscription } from "@/lib/subscriptions/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Plan {
  id: string;
  name: string;
  billing_period: string;
}

interface Template {
  id: string;
  name: string;
  validity_days: number;
}

export function CreateSubscriptionDialog({
  customerId,
  plans,
  templates = [],
}: {
  customerId: string;
  plans: Plan[];
  templates?: Template[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sourceType, setSourceType] = useState<"plan" | "template">(
    templates.length > 0 ? "template" : "plan"
  );
  const [state, formAction, pending] = useActionState(createSubscription, undefined);
  const [handledState, setHandledState] = useState(state);

  if (state !== handledState) {
    setHandledState(state);
    if (state && !state.error) setOpen(false);
  }

  useEffect(() => {
    if (state && !state.error) router.refresh();
  }, [state, router]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>New subscription / quote</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Subscription or Quote</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="customerId" value={customerId} />
          <input type="hidden" name="sourceType" value={sourceType} />

          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          {templates.length > 0 && (
            <div className="flex rounded-md border p-1 bg-muted/30">
              <button
                type="button"
                className={`flex-1 py-1.5 text-xs font-medium rounded ${
                  sourceType === "template"
                    ? "bg-background shadow-xs text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setSourceType("template")}
              >
                From Quotation Template
              </button>
              <button
                type="button"
                className={`flex-1 py-1.5 text-xs font-medium rounded ${
                  sourceType === "plan"
                    ? "bg-background shadow-xs text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setSourceType("plan")}
              >
                From Base Plan (Scratch)
              </button>
            </div>
          )}

          {sourceType === "template" && templates.length > 0 ? (
            <div className="space-y-2">
              <Label htmlFor="templateId">Quotation Template</Label>
              <Select name="templateId">
                <SelectTrigger id="templateId">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} (Valid {t.validity_days} days)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Copies plan, product lines and sets quote expiration automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="planId">Plan</Label>
              <Select name="planId">
                <SelectTrigger id="planId">
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.billing_period})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" name="quantity" type="number" min="1" defaultValue="1" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentTerms">Payment terms (days)</Label>
              <Input id="paymentTerms" name="paymentTerms" type="number" min="0" defaultValue="7" />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Creating…" : sourceType === "template" ? "Create quotation" : "Create subscription"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
