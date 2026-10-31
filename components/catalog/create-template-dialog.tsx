"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createQuotationTemplate } from "@/lib/catalog/template-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

interface Product {
  id: string;
  name: string;
}

export function CreateTemplateDialog({
  plans,
  products,
}: {
  plans: Plan[];
  products: Product[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createQuotationTemplate, undefined);
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
      <DialogTrigger render={<Button>New template</Button>} />
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New quotation template</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Template Name</Label>
            <Input id="name" name="name" placeholder="e.g. Enterprise Annual Bundle" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="planId">Base Plan</Label>
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
          <div className="space-y-2">
            <Label htmlFor="validityDays">Validity period (days)</Label>
            <Input
              id="validityDays"
              name="validityDays"
              type="number"
              min="1"
              defaultValue="14"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Included Products / Add-ons</Label>
            <div className="max-h-36 overflow-y-auto rounded-md border p-2 space-y-1">
              {products.map((p) => (
                <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer p-1 rounded hover:bg-muted/50">
                  <input
                    type="checkbox"
                    name="productIds"
                    value={p.id}
                    className="rounded border-input text-primary"
                  />
                  <span>{p.name}</span>
                </label>
              ))}
              {!products.length && (
                <p className="text-xs text-muted-foreground">No products available.</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes / Terms</Label>
            <Textarea id="notes" name="notes" placeholder="Optional notes for this quote" />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Creating…" : "Create template"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
