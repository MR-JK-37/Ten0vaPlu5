"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/rbac/roles";
import { toMinorUnits } from "@/lib/money/money";

const taxSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["percent", "fixed"]),
  rate: z.coerce.number().min(0),
  validFrom: z.string().min(1),
  validTo: z.string().optional(),
});

export async function createTax(_prev: { error?: string } | undefined, formData: FormData) {
  await requireRole(["admin"]);
  const parsed = taxSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    rate: formData.get("rate"),
    validFrom: formData.get("validFrom"),
    validTo: formData.get("validTo") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  // Fixed-amount taxes are stored in minor units; percent rates are stored as-is (e.g. 18).
  const rate = parsed.data.type === "fixed" ? toMinorUnits(parsed.data.rate) : parsed.data.rate;
  const { error } = await supabase.from("taxes").insert({
    name: parsed.data.name,
    type: parsed.data.type,
    rate,
    valid_from: parsed.data.validFrom,
    valid_to: parsed.data.validTo || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/taxes");
  return {};
}

export async function deactivateTax(taxId: string) {
  await requireRole(["admin"]);
  const supabase = await createClient();
  await supabase.from("taxes").update({ is_active: false }).eq("id", taxId);
  revalidatePath("/admin/taxes");
}

const discountSchema = z.object({
  name: z.string().min(1),
  kind: z.enum(["fixed", "percent"]),
  value: z.coerce.number().min(0),
  minPurchase: z.coerce.number().optional(),
  minQuantity: z.coerce.number().int().optional(),
  validFrom: z.string().min(1),
  validTo: z.string().optional(),
  usageLimit: z.coerce.number().int().optional(),
  productIds: z.array(z.string().uuid()).min(1, "Pick at least one product"),
});

// Only "products" discounts are offered in the UI for now: "subscriptions" targeting
// needs a subscription picker, which doesn't exist until subscriptions do (a discount an
// admin can select but that can never actually match anything would be dead UI).
export async function createDiscount(_prev: { error?: string } | undefined, formData: FormData) {
  await requireRole(["admin"]);
  const parsed = discountSchema.safeParse({
    name: formData.get("name"),
    kind: formData.get("kind"),
    value: formData.get("value"),
    minPurchase: formData.get("minPurchase") || undefined,
    minQuantity: formData.get("minQuantity") || undefined,
    validFrom: formData.get("validFrom"),
    validTo: formData.get("validTo") || undefined,
    usageLimit: formData.get("usageLimit") || undefined,
    productIds: formData.getAll("productIds"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const value = parsed.data.kind === "fixed" ? toMinorUnits(parsed.data.value) : parsed.data.value;
  const { error } = await supabase.from("discounts").insert({
    name: parsed.data.name,
    kind: parsed.data.kind,
    value,
    min_purchase: parsed.data.minPurchase ? toMinorUnits(parsed.data.minPurchase) : null,
    min_quantity: parsed.data.minQuantity ?? null,
    valid_from: parsed.data.validFrom,
    valid_to: parsed.data.validTo || null,
    usage_limit: parsed.data.usageLimit ?? null,
    applies_to: "products",
    product_ids: parsed.data.productIds,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/discounts");
  return {};
}

export async function deactivateDiscount(discountId: string) {
  await requireRole(["admin"]);
  const supabase = await createClient();
  await supabase.from("discounts").update({ is_active: false }).eq("id", discountId);
  revalidatePath("/admin/discounts");
}
