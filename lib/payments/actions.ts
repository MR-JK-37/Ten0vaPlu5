"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole, requireUser } from "@/lib/rbac/roles";
import { toMinorUnits } from "@/lib/money/money";
import { getOnlinePaymentProvider } from "@/lib/payments";
import type { Database } from "@/lib/supabase/types";

type PaymentMethod = Database["public"]["Enums"]["payment_method"];

const manualPaymentSchema = z.object({
  invoiceId: z.string().uuid(),
  method: z.enum(["cash", "bank_transfer", "cheque", "card", "upi", "other"]),
  amount: z.coerce.number().positive(),
  paidOn: z.string().min(1),
  reference: z.string().optional(),
  note: z.string().optional(),
});

export async function recordManualPayment(
  _prev: { error?: string } | undefined,
  formData: FormData
) {
  const user = await requireRole(["staff", "admin"]);
  const parsed = manualPaymentSchema.safeParse({
    invoiceId: formData.get("invoiceId"),
    method: formData.get("method"),
    amount: formData.get("amount"),
    paidOn: formData.get("paidOn"),
    reference: formData.get("reference") || undefined,
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("record_payment", {
    p_invoice_id: parsed.data.invoiceId,
    p_method: parsed.data.method as PaymentMethod,
    p_amount: toMinorUnits(parsed.data.amount),
    p_status: "confirmed",
    p_reference: parsed.data.reference,
    p_note: parsed.data.note,
    p_recorded_by: user.id,
  });

  revalidatePath("/admin/invoices");
  revalidatePath("/staff/invoices");
  revalidatePath("/admin/payments");
  revalidatePath("/staff/payments");
  return error ? { error: error.message } : {};
}

// Customer-initiated online payment. The mock provider completes instantly; youpi would
// redirect to checkoutUrl and rely on the webhook, but is untested here (no live gateway).
export async function payInvoiceOnline(invoiceId: string) {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("amount_due, customers(name, email)")
    .eq("id", invoiceId)
    .single();
  if (!invoice || !invoice.amount_due || invoice.amount_due <= 0) {
    return { error: "Nothing due on this invoice." };
  }

  const provider = getOnlinePaymentProvider();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const result = await provider.createCheckout({
    invoiceId,
    amount: invoice.amount_due,
    customerName: invoice.customers?.name ?? "",
    customerEmail: invoice.customers?.email ?? "",
    returnUrl: `${appUrl}/portal/invoices`,
  });

  if (result.status === "SUCCESS") {
    // record_payment is gated to staff/admin/service-role; a confirmed online payment is
    // a server-validated fact, not a customer privilege, so this uses the admin client the
    // same way the (future) webhook handler would.
    const admin = createAdminClient();
    const { error } = await admin.rpc("record_payment", {
      p_invoice_id: invoiceId,
      p_method: "upi",
      p_amount: invoice.amount_due,
      p_status: "confirmed",
      p_provider: provider.name,
      p_provider_payment_id: result.providerPaymentId,
      p_recorded_by: user.id,
    });
    revalidatePath("/portal/invoices");
    revalidatePath("/admin/payments");
    revalidatePath("/staff/payments");
    return error ? { error: error.message } : { paid: true };
  }

  return { checkoutUrl: result.checkoutUrl };
}
