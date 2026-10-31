import { createClient } from "@/lib/supabase/server";
import { RunBillingPanel } from "@/components/billing/run-billing-panel";
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

export default async function BillingRunsPage() {
  const supabase = await createClient();
  const { data: runs } = await supabase
    .from("billing_runs")
    .select("id, started_at, finished_at, as_of, dry_run, status, due_count, created_count, skipped_count, error_count")
    .order("started_at", { ascending: false })
    .limit(20);

  const latestDryRun = runs?.find((r) => r.dry_run);
  const { data: latestDryRunItems } = latestDryRun
    ? await supabase
        .from("billing_run_items")
        .select("subscription_id, outcome, detail, subscriptions(number)")
        .eq("billing_run_id", latestDryRun.id)
        .limit(50)
    : { data: null };

  return (
    <div>
      <h1 className="text-2xl font-semibold">Billing runs</h1>
      <div className="mt-6">
        <RunBillingPanel />
      </div>

      {latestDryRun && latestDryRunItems?.length ? (
        <div className="mt-6">
          <h2 className="text-lg font-medium">Latest dry-run preview</h2>
          <div className="mt-2 overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Detail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {latestDryRunItems.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>{item.subscriptions?.number}</TableCell>
                    <TableCell>{item.outcome}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{item.detail}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : null}

      <div className="mt-6">
        <h2 className="text-lg font-medium">History</h2>
        <div className="mt-2 overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Started</TableHead>
                <TableHead>As of</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Skipped</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs?.map((run) => (
                <TableRow key={run.id}>
                  <TableCell className="text-xs">{new Date(run.started_at).toLocaleString()}</TableCell>
                  <TableCell>{run.as_of}</TableCell>
                  <TableCell>
                    <Badge variant={run.dry_run ? "outline" : "secondary"}>
                      {run.dry_run ? "dry-run" : "real"}
                    </Badge>
                  </TableCell>
                  <TableCell>{run.status}</TableCell>
                  <TableCell>{run.due_count}</TableCell>
                  <TableCell>{run.created_count}</TableCell>
                  <TableCell>{run.skipped_count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!runs?.length && (
            <p className="p-4 text-sm text-muted-foreground">No billing runs yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
