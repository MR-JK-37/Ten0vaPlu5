import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/money/money";
import { StageActions } from "@/components/subscriptions/stage-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const instant = false;

export default async function PortalSubscriptionsPage() {
  const supabase = await createClient();
  const { data: subs } = await supabase
    .from("subscriptions")
    .select(
      "id, number, status, next_billing_date, expiry_date, quote_valid_until, plans(name, price, billing_period, allow_pause, allow_early_close, allow_renew)"
    )
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-semibold">My subscriptions</h1>
      <div className="mt-6 space-y-4">
        {subs?.length ? (
          subs.map((sub) => (
            <Card key={sub.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{sub.plans?.name ?? sub.number}</CardTitle>
                {sub.plans && (
                  <StageActions subscriptionId={sub.id} status={sub.status} plan={sub.plans} audience="customer" />
                )}
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>
                  {sub.plans ? formatMoney(sub.plans.price) : ""} / {sub.plans?.billing_period}
                </p>
                {sub.status === "quotation" && sub.quote_valid_until && (
                  <p>Quote valid until {sub.quote_valid_until}</p>
                )}
                {sub.next_billing_date && <p>Next billing: {sub.next_billing_date}</p>}
                {sub.expiry_date && <p>Expires: {sub.expiry_date}</p>}
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground">No subscriptions yet.</p>
        )}
      </div>
    </div>
  );
}
