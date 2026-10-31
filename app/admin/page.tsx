import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/money/money";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const instant = false;

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("dashboard_kpis").single();

  const kpis = [
    { label: "Active subscriptions", value: data?.active_subscriptions?.toLocaleString() ?? "0" },
    { label: "MRR", value: formatMoney(data?.mrr ?? 0) },
    { label: "ARR", value: formatMoney(data?.arr ?? 0) },
    { label: "Revenue collected", value: formatMoney(data?.revenue_collected ?? 0) },
    { label: "Outstanding", value: formatMoney(data?.outstanding ?? 0) },
    { label: "Overdue invoices", value: data?.overdue_count?.toLocaleString() ?? "0" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-normal text-muted-foreground">{kpi.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
