import { createClient } from "@/lib/supabase/server";
import { CreateDiscountDialog } from "@/components/catalog/create-discount-dialog";
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

export default async function DiscountsPage() {
  const supabase = await createClient();
  const [{ data: discounts }, { data: products }] = await Promise.all([
    supabase
      .from("discounts")
      .select("id, name, kind, value, usage_limit, times_used, valid_from, valid_to, is_active")
      .order("created_at", { ascending: false }),
    supabase.from("products").select("id, name").eq("is_active", true),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Discounts</h1>
        <CreateDiscountDialog products={products ?? []} />
      </div>
      <div className="mt-6 overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Kind</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Validity</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {discounts?.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">{d.name}</TableCell>
                <TableCell className="capitalize">{d.kind}</TableCell>
                <TableCell>{d.kind === "percent" ? `${d.value}%` : d.value}</TableCell>
                <TableCell>
                  {d.times_used} / {d.usage_limit ?? "∞"}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {d.valid_from} → {d.valid_to ?? "∞"}
                </TableCell>
                <TableCell>
                  <Badge variant={d.is_active ? "secondary" : "destructive"}>
                    {d.is_active ? "active" : "inactive"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!discounts?.length && (
          <p className="p-4 text-sm text-muted-foreground">No discounts yet.</p>
        )}
      </div>
    </div>
  );
}
