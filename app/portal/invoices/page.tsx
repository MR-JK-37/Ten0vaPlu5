import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/money/money";
import { PayInvoiceButton } from "@/components/portal/pay-invoice-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const instant = false;

export default async function PortalInvoicesPage() {
  const supabase = await createClient();
  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, number, status, due_date, total, amount_due")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-semibold">My invoices</h1>
      <div className="mt-6 space-y-3">
        {invoices?.length ? (
          invoices.map((inv) => (
            <Card key={inv.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">
                  <Link href={`/invoices/${inv.id}/print`} target="_blank" className="hover:underline">
                    {inv.number}
                  </Link>
                </CardTitle>
                <Badge variant="secondary" className="capitalize">
                  {inv.status}
                </Badge>
              </CardHeader>
              <CardContent className="flex items-center justify-between text-sm">
                <div className="text-muted-foreground">
                  Due {inv.due_date} · Total {formatMoney(inv.total)} · Owed{" "}
                  {formatMoney(inv.amount_due ?? 0)}
                </div>
                {inv.status === "confirmed" && (inv.amount_due ?? 0) > 0 && (
                  <PayInvoiceButton invoiceId={inv.id} />
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No invoices yet.</p>
        )}
      </div>
    </div>
  );
}
