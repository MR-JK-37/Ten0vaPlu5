"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/rbac/roles";

export async function confirmInvoice(invoiceId: string) {
  await requireRole(["staff", "admin"]);
  const supabase = await createClient();
  const { error } = await supabase.rpc("invoice_confirm", { p_invoice_id: invoiceId });
  revalidatePath("/admin/invoices");
  revalidatePath("/staff/invoices");
  return error ? { error: error.message } : {};
}

export async function cancelInvoice(invoiceId: string) {
  await requireRole(["staff", "admin"]);
  const supabase = await createClient();
  const { error } = await supabase.rpc("invoice_cancel", { p_invoice_id: invoiceId });
  revalidatePath("/admin/invoices");
  revalidatePath("/staff/invoices");
  return error ? { error: error.message } : {};
}

// No real SMTP is configured (see docs/BLOCKERS.md) -- per AGENTS.md rule 4, this logs to
// the server console instead of stopping, and still records sent_at so "sent" is real
// state, not a no-op button.
export async function sendInvoice(invoiceId: string) {
  await requireRole(["staff", "admin"]);
  const supabase = await createClient();
  const { data: invoice } = await supabase
    .from("invoices")
    .select("number, customer_id, customers(email), total")
    .eq("id", invoiceId)
    .single();

  if (invoice) {
    console.log(
      `[dev email] Invoice ${invoice.number} sent to ${invoice.customers?.email} — total ${invoice.total}`
    );
  }

  const { error } = await supabase
    .from("invoices")
    .update({ sent_at: new Date().toISOString() })
    .eq("id", invoiceId);
  revalidatePath("/admin/invoices");
  revalidatePath("/staff/invoices");
  return error ? { error: error.message } : {};
}
