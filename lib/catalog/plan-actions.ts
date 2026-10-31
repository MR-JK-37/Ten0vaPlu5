"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/rbac/roles";
import { toMinorUnits } from "@/lib/money/money";

const planSchema = z.object({
  name: z.string().min(1),
  productId: z.string().uuid(),
  price: z.coerce.number().min(0),
  billingPeriod: z.enum(["daily", "weekly", "monthly", "yearly"]),
  minQuantity: z.coerce.number().int().min(1).default(1),
  availableFrom: z.string().min(1),
  availableTo: z.string().optional(),
  autoCloseOnEnd: z.coerce.boolean().default(false),
  allowEarlyClose: z.coerce.boolean().default(false),
  allowPause: z.coerce.boolean().default(false),
  allowRenew: z.coerce.boolean().default(true),
});

export async function createPlan(_prev: { error?: string } | undefined, formData: FormData) {
  await requireRole(["admin"]);
  const parsed = planSchema.safeParse({
    name: formData.get("name"),
    productId: formData.get("productId"),
    price: formData.get("price"),
    billingPeriod: formData.get("billingPeriod"),
    minQuantity: formData.get("minQuantity") || 1,
    availableFrom: formData.get("availableFrom"),
    availableTo: formData.get("availableTo") || undefined,
    autoCloseOnEnd: formData.get("autoCloseOnEnd") === "on",
    allowEarlyClose: formData.get("allowEarlyClose") === "on",
    allowPause: formData.get("allowPause") === "on",
    allowRenew: formData.get("allowRenew") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase.from("plans").insert({
    name: parsed.data.name,
    product_id: parsed.data.productId,
    price: toMinorUnits(parsed.data.price),
    billing_period: parsed.data.billingPeriod,
    min_quantity: parsed.data.minQuantity,
    available_from: parsed.data.availableFrom,
    available_to: parsed.data.availableTo || null,
    auto_close_on_end: parsed.data.autoCloseOnEnd,
    allow_early_close: parsed.data.allowEarlyClose,
    allow_pause: parsed.data.allowPause,
    allow_renew: parsed.data.allowRenew,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/plans");
  return {};
}

export async function deactivatePlan(planId: string) {
  await requireRole(["admin"]);
  const supabase = await createClient();
  await supabase.from("plans").update({ is_active: false }).eq("id", planId);
  revalidatePath("/admin/plans");
}
