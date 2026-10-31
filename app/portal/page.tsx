import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/money/money";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const instant = false;

export default async function PortalSubscriptionsPage() {
  const supabase = await createClient();
  const { data: subs } = await supabase
    .from("subscriptions")
    .select("id, number, status, next_billing_date, expiry_date, plans(name, price, billing_period)")
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
                <Badge variant="secondary" className="capitalize">
                  {sub.status}
                </Badge>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>
                  {sub.plans ? formatMoney(sub.plans.price) : ""} / {sub.plans?.billing_period}
                </p>
                {sub.next_billing_date && <p>Next billing: {sub.next_billing_date}</p>}
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
