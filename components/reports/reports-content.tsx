import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/money/money";
import { RevenueChart } from "@/components/reports/revenue-chart";
import { ExportCsvButton } from "@/components/reports/export-csv-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export async function ReportsContent() {
  const supabase = await createClient();
  const [{ data: kpis }, { data: ageing }, { data: revenue }] = await Promise.all([
    supabase.rpc("dashboard_kpis").single(),
    supabase.rpc("invoice_ageing_buckets"),
    supabase.rpc("revenue_by_month", { p_months: 6 }),
  ]);

  const kpiCards = [
    { label: "Active subscriptions", value: kpis?.active_subscriptions?.toLocaleString() ?? "0" },
    { label: "MRR", value: formatMoney(kpis?.mrr ?? 0) },
    { label: "ARR", value: formatMoney(kpis?.arr ?? 0) },
    { label: "Revenue collected", value: formatMoney(kpis?.revenue_collected ?? 0) },
    { label: "Outstanding", value: formatMoney(kpis?.outstanding ?? 0) },
    { label: "Overdue invoices", value: kpis?.overdue_count?.toLocaleString() ?? "0" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Reports</h1>
        <ExportCsvButton />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {kpiCards.map((kpi) => (
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

      <div className="mt-8">
        <h2 className="text-lg font-medium">Revenue collected (last 6 months)</h2>
        <Card className="mt-2">
          <CardContent className="pt-6">
            <RevenueChart data={revenue ?? []} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-medium">Overdue ageing</h2>
        <div className="mt-2 overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bucket</TableHead>
                <TableHead>Invoices</TableHead>
                <TableHead>Total due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ageing?.map((row) => (
                <TableRow key={row.bucket}>
                  <TableCell>{row.bucket} days</TableCell>
                  <TableCell>{row.invoice_count}</TableCell>
                  <TableCell>{formatMoney(row.total_due)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!ageing?.length && (
            <p className="p-4 text-sm text-muted-foreground">No overdue invoices.</p>
          )}
        </div>
      </div>
    </div>
  );
}
