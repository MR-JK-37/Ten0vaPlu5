import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/money/money";
import { CreateTemplateDialog } from "@/components/catalog/create-template-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const instant = false;

export default async function AdminTemplatesPage() {
  const supabase = await createClient();
  const [{ data: templates }, { data: plans }, { data: products }] = await Promise.all([
    supabase
      .from("quotation_templates")
      .select(`
        id, name, validity_days, notes,
        plans(name, price, billing_period),
        quotation_template_lines(quantity, products(name))
      `)
      .order("created_at", { ascending: false }),
    supabase.from("plans").select("id, name, billing_period").eq("is_active", true),
    supabase.from("products").select("id, name").eq("is_active", true),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Quotation Templates</h1>
          <p className="text-sm text-muted-foreground">
            Reusable offers preconfigured with plans and product lines for sales reps.
          </p>
        </div>
        <CreateTemplateDialog
          plans={plans ?? []}
          products={products ?? []}
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Template Name</TableHead>
              <TableHead>Base Plan</TableHead>
              <TableHead>Validity</TableHead>
              <TableHead>Included Products</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates?.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell>
                  {t.plans?.name} ({t.plans ? formatMoney(t.plans.price) : ""} / {t.plans?.billing_period})
                </TableCell>
                <TableCell>{t.validity_days} days</TableCell>
                <TableCell>
                  {t.quotation_template_lines && t.quotation_template_lines.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {t.quotation_template_lines.map((line, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted"
                        >
                          {line.products?.name ?? "Product"} (×{line.quantity})
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">{t.notes ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!templates?.length && (
          <p className="p-4 text-sm text-muted-foreground">No quotation templates created yet.</p>
        )}
      </div>
    </div>
  );
}
