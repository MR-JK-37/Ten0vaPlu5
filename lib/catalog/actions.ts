"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/rbac/roles";
import { toMinorUnits } from "@/lib/money/money";

const productSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["service", "software", "addon", "physical"]),
  salesPrice: z.coerce.number().min(0),
  costPrice: z.coerce.number().min(0).default(0),
  notes: z.string().optional(),
});

export async function createProduct(_prev: { error?: string } | undefined, formData: FormData) {
  await requireRole(["admin"]);
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    salesPrice: formData.get("salesPrice"),
    costPrice: formData.get("costPrice") || 0,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("products").insert({
    name: parsed.data.name,
    type: parsed.data.type,
    sales_price: toMinorUnits(parsed.data.salesPrice),
    cost_price: toMinorUnits(parsed.data.costPrice),
    notes: parsed.data.notes ?? null,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/products");
  return {};
}

export async function deactivateProduct(productId: string) {
  await requireRole(["admin"]);
  const supabase = await createClient();
  await supabase.from("products").update({ is_active: false }).eq("id", productId);
  revalidatePath("/admin/products");
}

const attributeSchema = z.object({
  productId: z.string().uuid(),
  name: z.string().min(1),
});

export async function addAttribute(_prev: { error?: string } | undefined, formData: FormData) {
  await requireRole(["admin"]);
  const parsed = attributeSchema.safeParse({
    productId: formData.get("productId"),
    name: formData.get("name"),
  });
  if (!parsed.success) return { error: "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("product_attributes")
    .insert({ product_id: parsed.data.productId, name: parsed.data.name });
  if (error) return { error: error.message };
  revalidatePath("/admin/products");
  return {};
}

const variantValueSchema = z.object({
  attributeId: z.string().uuid(),
  value: z.string().min(1),
  extraPrice: z.coerce.number().default(0),
});

export async function addVariantValue(_prev: { error?: string } | undefined, formData: FormData) {
  await requireRole(["admin"]);
  const parsed = variantValueSchema.safeParse({
    attributeId: formData.get("attributeId"),
    value: formData.get("value"),
    extraPrice: formData.get("extraPrice") || 0,
  });
  if (!parsed.success) return { error: "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase.from("product_variant_values").insert({
    attribute_id: parsed.data.attributeId,
    value: parsed.data.value,
    extra_price: toMinorUnits(parsed.data.extraPrice),
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/products");
  return {};
}
