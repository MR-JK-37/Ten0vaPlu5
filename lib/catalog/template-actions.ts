"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/rbac/roles";

const templateSchema = z.object({
  name: z.string().min(1),
  planId: z.string().uuid(),
  validityDays: z.coerce.number().int().min(1).default(14),
  notes: z.string().optional(),
  productIds: z.array(z.string().uuid()).min(1, "Pick at least one product"),
});

export async function createQuotationTemplate(
  _prev: { error?: string } | undefined,
  formData: FormData
) {
  await requireRole(["admin"]);
  const parsed = templateSchema.safeParse({
    name: formData.get("name"),
    planId: formData.get("planId"),
    validityDays: formData.get("validityDays") || 14,
    notes: formData.get("notes") || undefined,
    productIds: formData.getAll("productIds"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { data: template, error } = await supabase
    .from("quotation_templates")
    .insert({
      name: parsed.data.name,
      plan_id: parsed.data.planId,
      validity_days: parsed.data.validityDays,
      notes: parsed.data.notes ?? null,
    })
    .select()
    .single();

  if (error || !template) return { error: error?.message ?? "Could not create quotation template" };

  const lines = parsed.data.productIds.map((productId) => ({
    template_id: template.id,
    product_id: productId,
    quantity: 1,
  }));

  const { error: linesError } = await supabase.from("quotation_template_lines").insert(lines);
  if (linesError) return { error: linesError.message };

  revalidatePath("/admin/templates");
  return {};
}

export async function deleteQuotationTemplate(templateId: string) {
  await requireRole(["admin"]);
  const supabase = await createClient();
  await supabase.from("quotation_templates").delete().eq("id", templateId);
  revalidatePath("/admin/templates");
}
