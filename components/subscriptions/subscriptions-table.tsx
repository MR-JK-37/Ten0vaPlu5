import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/money/money";
import { StageActions } from "@/components/subscriptions/stage-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export async function SubscriptionsTable({ basePath }: { basePath: string }) {
  const supabase = await createClient();
  const { data: subs } = await supabase
    .from("subscriptions")
    .select(`
      id, number, status, next_billing_date, quote_valid_until,
      customers(id, name, email, company),
      plans(name, price, billing_period, allow_pause, allow_early_close, allow_renew)
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  const customerBase = basePath.startsWith("/admin") ? "/admin/customers" : "/staff/customers";

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Subscriptions</h1>
          <p className="text-sm text-muted-foreground">
            Manage customer subscriptions, quotations, and stage transitions.
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Next Billing / Expiry</TableHead>
              <TableHead>Stage Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subs?.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell className="font-medium">
                  {sub.customers ? (
                    <Link
                      href={`${customerBase}/${sub.customers.id}`}
                      className="hover:underline text-primary"
                    >
                      {sub.number}
                    </Link>
                  ) : (
                    sub.number
                  )}
                </TableCell>
                <TableCell>
                  {sub.customers ? (
                    <div>
                      <p className="font-medium">{sub.customers.name}</p>
                      <p className="text-xs text-muted-foreground">{sub.customers.email}</p>
                    </div>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  {sub.plans ? (
                    <div>
                      <p className="font-medium">{sub.plans.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatMoney(sub.plans.price)} / {sub.plans.billing_period}
                      </p>
                    </div>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  {sub.quote_valid_until ? (
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      Quote valid until {sub.quote_valid_until}
                    </span>
                  ) : sub.next_billing_date ? (
                    <span>Next: {sub.next_billing_date}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {sub.plans && (
                    <StageActions
                      subscriptionId={sub.id}
                      status={sub.status}
                      plan={sub.plans}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!subs?.length && (
          <p className="p-4 text-sm text-muted-foreground">No subscriptions or quotations found.</p>
        )}
      </div>
    </div>
  );
}
