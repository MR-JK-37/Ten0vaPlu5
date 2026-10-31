import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/rbac/roles";
import { formatMoney } from "@/lib/money/money";

export const instant = false;

export default async function InvoicePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const supabase = await createClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select(
      "number, status, issue_date, due_date, period_start, period_end, subtotal, discount_total, tax_total, total, amount_paid, amount_due, customers(name, email, billing_address, tax_id), invoice_lines(description, quantity, unit_price, discount_amount, tax_amount, amount)"
    )
    .eq("id", id)
    .single();

  if (!invoice) notFound();

  return (
    <div className="mx-auto max-w-2xl p-8 print:p-0">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-xl font-bold">Brightloop Software</h1>
          <p className="text-sm text-muted-foreground">Invoice {invoice.number}</p>
        </div>
        <div className="text-right text-sm">
          <p>Issue date: {invoice.issue_date}</p>
          <p>Due date: {invoice.due_date}</p>
          <p className="capitalize">Status: {invoice.status}</p>
        </div>
      </div>

      <div className="mt-6">
        <p className="font-medium">{invoice.customers?.name}</p>
        <p className="text-sm text-muted-foreground">{invoice.customers?.email}</p>
        {invoice.customers?.billing_address && (
          <p className="text-sm text-muted-foreground">{invoice.customers.billing_address}</p>
        )}
        {invoice.customers?.tax_id && (
          <p className="text-sm text-muted-foreground">Tax ID: {invoice.customers.tax_id}</p>
        )}
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        Billing period: {invoice.period_start} to {invoice.period_end}
      </p>

      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="py-2">Description</th>
            <th className="py-2 text-right">Qty</th>
            <th className="py-2 text-right">Unit price</th>
            <th className="py-2 text-right">Tax</th>
            <th className="py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.invoice_lines?.map((line, i) => (
            <tr key={i} className="border-b">
              <td className="py-2">{line.description}</td>
              <td className="py-2 text-right">{line.quantity}</td>
              <td className="py-2 text-right">{formatMoney(line.unit_price)}</td>
              <td className="py-2 text-right">{formatMoney(line.tax_amount)}</td>
              <td className="py-2 text-right">{formatMoney(line.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-end">
        <div className="w-56 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatMoney(invoice.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Discount</span>
            <span>-{formatMoney(invoice.discount_total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax</span>
            <span>{formatMoney(invoice.tax_total)}</span>
          </div>
          <div className="flex justify-between border-t pt-1 font-semibold">
            <span>Total</span>
            <span>{formatMoney(invoice.total)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Paid</span>
            <span>{formatMoney(invoice.amount_paid)}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Due</span>
            <span>{formatMoney(invoice.amount_due ?? 0)}</span>
          </div>
        </div>
      </div>

      <p className="mt-8 text-xs text-muted-foreground print:hidden">
        Use your browser&apos;s print dialog (Ctrl/Cmd+P) to print or save as PDF.
      </p>
    </div>
  );
}
