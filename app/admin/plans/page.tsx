import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/money/money";
import { CreatePlanDialog } from "@/components/catalog/create-plan-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const instant = false;

export default async function PlansPage() {
  const supabase = await createClient();
  const [{ data: plans }, { data: products }] = await Promise.all([
    supabase
      .from("plans")
      .select("id, name, price, billing_period, min_quantity, available_from, available_to, allow_pause, allow_early_close, allow_renew, auto_close_on_end, is_active, products(name)")
      .order("created_at", { ascending: false }),
    supabase.from("products").select("id, name").eq("is_active", true),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Plans</h1>
        <CreatePlanDialog products={products ?? []} />
      </div>
      <div className="mt-6 overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead>Rules</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans?.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell className="font-medium">{plan.name}</TableCell>
                <TableCell>{plan.products?.name}</TableCell>
                <TableCell>{formatMoney(plan.price)}</TableCell>
                <TableCell className="capitalize">{plan.billing_period}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {plan.available_from} → {plan.available_to ?? "∞"}
                </TableCell>
                <TableCell className="space-x-1">
                  {plan.allow_pause && <Badge variant="outline">pause</Badge>}
                  {plan.allow_early_close && <Badge variant="outline">early-close</Badge>}
                  {plan.allow_renew && <Badge variant="outline">renew</Badge>}
                  {plan.auto_close_on_end && <Badge variant="outline">auto-close</Badge>}
                </TableCell>
                <TableCell>
                  <Badge variant={plan.is_active ? "secondary" : "destructive"}>
                    {plan.is_active ? "active" : "inactive"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!plans?.length && <p className="p-4 text-sm text-muted-foreground">No plans yet.</p>}
      </div>
    </div>
  );
}
