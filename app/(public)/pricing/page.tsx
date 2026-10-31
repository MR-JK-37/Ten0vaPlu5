import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/money/money";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Plan prices change whenever an admin edits the catalog, so this page must never be
// statically cached at build time — Next 16's Cache Components otherwise require an
// explicit opt-out for any route that reads uncached/runtime data outside Suspense.
export const instant = false;

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: plans } = await supabase
    .from("plans")
    .select("id, name, price, billing_period, min_quantity, products(name)")
    .eq("is_active", true)
    .order("price");

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Pricing</h1>
      <p className="mt-2 text-muted-foreground">
        Live plans, pulled straight from the catalog — no hard-coded numbers.
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plans?.length ? (
          plans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {plan.name}
                  <Badge variant="secondary">{plan.billing_period}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{formatMoney(plan.price)}</p>
                <p className="text-sm text-muted-foreground">
                  per {plan.billing_period.replace("ly", "")}
                  {plan.min_quantity > 1 ? ` · min qty ${plan.min_quantity}` : ""}
                </p>
                {plan.products?.name && (
                  <p className="mt-2 text-sm text-muted-foreground">{plan.products.name}</p>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground">No plans published yet.</p>
        )}
      </div>
    </div>
  );
}
