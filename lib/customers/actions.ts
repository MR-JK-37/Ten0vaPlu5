"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/rbac/roles";

const customerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  billingAddress: z.string().optional(),
  taxId: z.string().optional(),
  notes: z.string().optional(),
});

export async function createCustomer(_prev: { error?: string } | undefined, formData: FormData) {
  await requireRole(["staff", "admin"]);
  const parsed = customerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    company: formData.get("company") || undefined,
    billingAddress: formData.get("billingAddress") || undefined,
    taxId: formData.get("taxId") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase.from("customers").insert({
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    phone: parsed.data.phone ?? null,
    company: parsed.data.company ?? null,
    billing_address: parsed.data.billingAddress ?? null,
    tax_id: parsed.data.taxId ?? null,
    notes: parsed.data.notes ?? null,
  });

  if (error) return { error: error.message };
  revalidatePath("/staff/customers");
  revalidatePath("/admin/customers");
  return {};
}
