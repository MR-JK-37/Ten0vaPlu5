import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/money/money";
import { CreateSubscriptionDialog } from "@/components/subscriptions/create-subscription-dialog";
import { StageActions } from "@/components/subscriptions/stage-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function CustomerDetail({ customerId }: { customerId: string }) {
  const supabase = await createClient();
  const [{ data: customer }, { data: plans }, { data: templates }, { data: subscriptions }] = await Promise.all([
    supabase.from("customers").select("*").eq("id", customerId).single(),
    supabase.from("plans").select("id, name, billing_period").eq("is_active", true),
    supabase.from("quotation_templates").select("id, name, validity_days").order("created_at", { ascending: false }),
    supabase
      .from("subscriptions")
      .select("id, number, status, next_billing_date, quote_valid_until, plans(name, price, billing_period, allow_pause, allow_early_close, allow_renew)")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false }),
  ]);

  if (!customer) return <p className="text-muted-foreground">Customer not found.</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold">{customer.name}</h1>
      <p className="text-sm text-muted-foreground">
        {customer.email} {customer.company ? `· ${customer.company}` : ""}
      </p>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-lg font-medium">Subscriptions</h2>
        <CreateSubscriptionDialog
          customerId={customerId}
          plans={plans ?? []}
          templates={templates ?? []}
        />
      </div>

      <div className="mt-3 space-y-3">
        {subscriptions?.length ? (
          subscriptions.map((sub) => (
            <Card key={sub.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">
                  {sub.number} — {sub.plans?.name}
                </CardTitle>
                {sub.plans && (
                  <StageActions
                    subscriptionId={sub.id}
                    status={sub.status}
                    plan={sub.plans}
                  />
                )}
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {sub.plans ? formatMoney(sub.plans.price) : ""} / {sub.plans?.billing_period}
                {sub.next_billing_date && ` · next billing ${sub.next_billing_date}`}
                {sub.quote_valid_until && ` · quote valid until ${sub.quote_valid_until}`}
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No subscriptions yet.</p>
        )}
      </div>
    </div>
  );
}
