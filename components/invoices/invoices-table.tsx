import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/money/money";
import { InvoiceActions } from "@/components/invoices/invoice-actions";
import { Badge } from "@/components/ui/badge";
import type { Database } from "@/lib/supabase/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type InvoiceStatus = Database["public"]["Enums"]["invoice_status"];

export async function InvoicesTable({ statusFilter }: { statusFilter?: string }) {
  const supabase = await createClient();
  let query = supabase
    .from("invoices")
    .select("id, number, status, due_date, total, amount_due, customers(name)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (statusFilter) query = query.eq("status", statusFilter as InvoiceStatus);

  const { data: invoices } = await query;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Number</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Due</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Due amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices?.map((inv) => {
            const overdue = inv.status === "confirmed" && inv.due_date < today && (inv.amount_due ?? 0) > 0;
            return (
              <TableRow key={inv.id}>
                <TableCell className="font-medium">
                  <Link href={`/invoices/${inv.id}/print`} className="hover:underline" target="_blank">
                    {inv.number}
                  </Link>
                </TableCell>
                <TableCell>{inv.customers?.name}</TableCell>
                <TableCell>{inv.due_date}</TableCell>
                <TableCell>{formatMoney(inv.total)}</TableCell>
                <TableCell>{formatMoney(inv.amount_due ?? 0)}</TableCell>
                <TableCell className="space-x-1">
                  <Badge variant="secondary" className="capitalize">
                    {inv.status}
                  </Badge>
                  {overdue && <Badge variant="destructive">overdue</Badge>}
                </TableCell>
                <TableCell>
                  <InvoiceActions invoiceId={inv.id} status={inv.status} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {!invoices?.length && <p className="p-4 text-sm text-muted-foreground">No invoices.</p>}
    </div>
  );
}
