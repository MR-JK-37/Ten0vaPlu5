import { createClient } from "@/lib/supabase/server";
import { CreateTaxDialog } from "@/components/catalog/create-tax-dialog";
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

export default async function TaxesPage() {
  const supabase = await createClient();
  const { data: taxes } = await supabase
    .from("taxes")
    .select("id, name, type, rate, valid_from, valid_to, is_active")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Taxes</h1>
        <CreateTaxDialog />
      </div>
      <div className="mt-6 overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Validity</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {taxes?.map((tax) => (
              <TableRow key={tax.id}>
                <TableCell className="font-medium">{tax.name}</TableCell>
                <TableCell className="capitalize">{tax.type}</TableCell>
                <TableCell>{tax.type === "percent" ? `${tax.rate}%` : tax.rate}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {tax.valid_from} → {tax.valid_to ?? "∞"}
                </TableCell>
                <TableCell>
                  <Badge variant={tax.is_active ? "secondary" : "destructive"}>
                    {tax.is_active ? "active" : "inactive"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!taxes?.length && <p className="p-4 text-sm text-muted-foreground">No tax rules yet.</p>}
      </div>
    </div>
  );
}
