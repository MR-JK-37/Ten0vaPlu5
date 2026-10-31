import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/money/money";
import { RecordPaymentDialog } from "@/components/payments/record-payment-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export async function PaymentsTable() {
  const supabase = await createClient();
  const [{ data: payments }, { data: outstanding }] = await Promise.all([
    supabase
      .from("payments")
      .select("id, method, amount, paid_on, status, reference, invoices(number, customers(name))")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("invoices")
      .select("id, number, amount_due")
      .in("status", ["confirmed"])
      .gt("amount_due", 0)
      .limit(200),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Payments</h1>
        <RecordPaymentDialog
          invoices={(outstanding ?? []).map((inv) => ({ ...inv, amount_due: inv.amount_due ?? 0 }))}
        />
      </div>
      <div className="mt-6 overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Paid on</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments?.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.invoices?.number}</TableCell>
                <TableCell>{p.invoices?.customers?.name}</TableCell>
                <TableCell className="capitalize">{p.method.replace("_", " ")}</TableCell>
                <TableCell>{formatMoney(p.amount)}</TableCell>
                <TableCell>{p.paid_on}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{p.reference ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={p.status === "confirmed" ? "secondary" : "outline"}>{p.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!payments?.length && <p className="p-4 text-sm text-muted-foreground">No payments yet.</p>}
      </div>
    </div>
  );
}
