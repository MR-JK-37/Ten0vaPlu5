"use server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/rbac/roles";
import { toMajorUnits } from "@/lib/money/money";

function csvEscape(value: string | number | null): string {
  if (value === null) return "";
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function exportInvoicesCsv() {
  await requireRole(["staff", "admin"]);
  const supabase = await createClient();
  const { data: invoices } = await supabase
    .from("invoices")
    .select("number, status, issue_date, due_date, subtotal, discount_total, tax_total, total, amount_paid, amount_due, customers(name)")
    .order("created_at", { ascending: false })
    .limit(5000);

  const header = [
    "number",
    "customer",
    "status",
    "issue_date",
    "due_date",
    "subtotal",
    "discount_total",
    "tax_total",
    "total",
    "amount_paid",
    "amount_due",
  ];

  const rows = (invoices ?? []).map((inv) =>
    [
      inv.number,
      inv.customers?.name ?? "",
      inv.status,
      inv.issue_date,
      inv.due_date,
      toMajorUnits(inv.subtotal).toFixed(2),
      toMajorUnits(inv.discount_total).toFixed(2),
      toMajorUnits(inv.tax_total).toFixed(2),
      toMajorUnits(inv.total).toFixed(2),
      toMajorUnits(inv.amount_paid).toFixed(2),
      toMajorUnits(inv.amount_due ?? 0).toFixed(2),
    ]
      .map(csvEscape)
      .join(",")
  );

  return [header.join(","), ...rows].join("\n");
}
