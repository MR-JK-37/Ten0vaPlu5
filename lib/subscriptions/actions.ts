"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireRole, requireUser } from "@/lib/rbac/roles";
import type { Database } from "@/lib/supabase/types";

type SubscriptionStatus = Database["public"]["Enums"]["subscription_status"];

const createSubscriptionSchema = z.object({
  customerId: z.string().uuid(),
  sourceType: z.enum(["plan", "template"]).default("plan"),
  planId: z.string().uuid().optional(),
  templateId: z.string().uuid().optional(),
  quantity: z.coerce.number().int().min(1).default(1),
  paymentTerms: z.coerce.number().int().min(0).default(7),
});

// Builds a subscription:
// - From scratch (plan): validates availability window & min quantity, creates draft with line
// - From quotation template: copies plan, product lines, sets validity window, starts in 'quotation'
export async function createSubscription(
  _prev: { error?: string } | undefined,
  formData: FormData
) {
  await requireRole(["staff", "admin"]);
  const parsed = createSubscriptionSchema.safeParse({
    customerId: formData.get("customerId"),
    sourceType: formData.get("sourceType") || "plan",
    planId: formData.get("planId") || undefined,
    templateId: formData.get("templateId") || undefined,
    quantity: formData.get("quantity") || 1,
    paymentTerms: formData.get("paymentTerms") || 7,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const user = await requireUser();
  const today = new Date().toISOString().slice(0, 10);

  if (parsed.data.sourceType === "template") {
    if (!parsed.data.templateId) return { error: "Quotation template is required" };

    const { data: template, error: tmplError } = await supabase
      .from("quotation_templates")
      .select(`
        id, name, plan_id, validity_days,
        plans(id, price, min_quantity, product_id, available_from, available_to, is_active),
        quotation_template_lines(product_id, quantity, variant_value_ids)
      `)
      .eq("id", parsed.data.templateId)
      .single();

    if (tmplError || !template || !template.plans) {
      return { error: "Quotation template not found" };
    }

    const plan = template.plans;
    if (!plan.is_active || today < plan.available_from || (plan.available_to && today > plan.available_to)) {
      return { error: "The plan in this template is not currently available for sale." };
    }

    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + template.validity_days);
    const quoteValidUntil = validUntilDate.toISOString().slice(0, 10);

    const { data: numberResult } = await supabase.rpc("next_number", { p_prefix: "SUB", p_width: 5 });
    const number = numberResult as unknown as string;

    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .insert({
        number,
        customer_id: parsed.data.customerId,
        plan_id: template.plan_id,
        template_id: template.id,
        status: "quotation",
        quote_valid_until: quoteValidUntil,
        payment_terms: parsed.data.paymentTerms,
        created_by: user.id,
      })
      .select()
      .single();

    if (subError || !subscription) {
      return { error: subError?.message ?? "Could not create subscription" };
    }

    if (template.quotation_template_lines && template.quotation_template_lines.length > 0) {
      for (const line of template.quotation_template_lines) {
        const { data: prod } = await supabase
          .from("products")
          .select("sales_price")
          .eq("id", line.product_id)
          .single();
        const unitPrice = prod?.sales_price ?? plan.price;
        const lineQty = line.quantity * parsed.data.quantity;
        await supabase.from("subscription_lines").insert({
          subscription_id: subscription.id,
          product_id: line.product_id,
          variant_value_ids: line.variant_value_ids ?? [],
          quantity: lineQty,
          unit_price: unitPrice,
          amount: unitPrice * lineQty,
        });
      }
    } else if (plan.product_id) {
      const amount = plan.price * parsed.data.quantity;
      await supabase.from("subscription_lines").insert({
        subscription_id: subscription.id,
        product_id: plan.product_id,
        quantity: parsed.data.quantity,
        unit_price: plan.price,
        amount,
      });
    }

    revalidatePath("/staff/subscriptions");
    revalidatePath("/admin/subscriptions");
    return { subscriptionId: subscription.id };
  }

  // Otherwise, create directly from a plan (scratch)
  if (!parsed.data.planId) return { error: "Plan is required" };
  const { data: plan, error: planError } = await supabase
    .from("plans")
    .select("id, price, min_quantity, product_id, available_from, available_to, is_active")
    .eq("id", parsed.data.planId)
    .single();
  if (planError || !plan) return { error: "Plan not found" };
  if (!plan.product_id) return { error: "Plan has no associated product" };

  if (!plan.is_active || today < plan.available_from || (plan.available_to && today > plan.available_to)) {
    return { error: "This plan is not currently available for sale." };
  }
  if (parsed.data.quantity < plan.min_quantity) {
    return { error: `Minimum quantity for this plan is ${plan.min_quantity}.` };
  }

  const { data: numberResult } = await supabase.rpc("next_number", { p_prefix: "SUB", p_width: 5 });
  const number = numberResult as unknown as string;

  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .insert({
      number,
      customer_id: parsed.data.customerId,
      plan_id: plan.id,
      status: "draft",
      payment_terms: parsed.data.paymentTerms,
      created_by: user.id,
    })
    .select()
    .single();
  if (error || !subscription) return { error: error?.message ?? "Could not create subscription" };

  const amount = plan.price * parsed.data.quantity;
  const { error: lineError } = await supabase.from("subscription_lines").insert({
    subscription_id: subscription.id,
    product_id: plan.product_id,
    quantity: parsed.data.quantity,
    unit_price: plan.price,
    amount,
  });
  if (lineError) return { error: lineError.message };

  revalidatePath("/staff/subscriptions");
  revalidatePath("/admin/subscriptions");
  return { subscriptionId: subscription.id };
}

export async function transitionSubscription(
  subscriptionId: string,
  to: SubscriptionStatus,
  reason?: string
) {
  await requireUser();
  const supabase = await createClient();

  // If attempting to confirm an expired quotation, reject
  if (to === "confirmed") {
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("status, quote_valid_until")
      .eq("id", subscriptionId)
      .single();
    if (sub && sub.status === "quotation" && sub.quote_valid_until) {
      const today = new Date().toISOString().slice(0, 10);
      if (today > sub.quote_valid_until) {
        return { error: `This quotation expired on ${sub.quote_valid_until} and cannot be confirmed.` };
      }
    }
  }

  const { error } = await supabase.rpc("transition_subscription", {
    p_subscription_id: subscriptionId,
    p_to: to,
    p_reason: reason ?? undefined,
  });
  revalidatePath("/staff/subscriptions");
  revalidatePath("/admin/subscriptions");
  revalidatePath("/portal");
  return error ? { error: error.message } : {};
}
