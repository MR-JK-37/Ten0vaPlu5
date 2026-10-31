"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/rbac/roles";

export async function runBilling(asOf: string, dryRun: boolean) {
  await requireRole(["staff", "admin"]);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("run_billing", {
    p_as_of: asOf,
    p_dry_run: dryRun,
  });
  revalidatePath("/admin/billing-runs");
  revalidatePath("/admin/invoices");
  revalidatePath("/staff/invoices");
  if (error) return { error: error.message };
  return { runId: data as string };
}
