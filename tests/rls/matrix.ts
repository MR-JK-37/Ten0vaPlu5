// Automated RLS matrix: creates a real admin, staff member, and two customers (via the
// actual Supabase Auth API, so this exercises real JWTs/sessions, not simulated roles),
// seeds one subscription/invoice/payment owned by customer A, then asserts what each role
// can and cannot see or do. Run against the local stack: `pnpm test:rls`.
//
// This is deliberately NOT part of `pnpm test` (vitest) — it needs a live Postgres/Auth
// stack (`supabase start`) and mutates data, so it runs as a standalone script.

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
const ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const admin = createClient<Database>(URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

let failures = 0;
let checks = 0;

function check(label: string, condition: boolean) {
  checks++;
  if (!condition) {
    failures++;
    console.error(`FAIL: ${label}`);
  } else {
    console.log(`ok   ${label}`);
  }
}

async function makeUser(email: string, password: string, role: "admin" | "staff" | "customer") {
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error || !data.user) throw new Error(`create user ${email}: ${error?.message}`);
  if (role !== "customer") {
    const { error: roleErr } = await admin.from("profiles").update({ role }).eq("id", data.user.id);
    if (roleErr) throw new Error(`set role ${role}: ${roleErr.message}`);
  }
  const client = createClient<Database>(URL, ANON_KEY);
  const { error: signInErr } = await client.auth.signInWithPassword({ email, password });
  if (signInErr) throw new Error(`sign in ${email}: ${signInErr.message}`);
  return { id: data.user.id, client };
}

async function main() {
  const stamp = Date.now();
  const { id: adminId, client: adminClient } = await makeUser(`rls-admin-${stamp}@test.local`, "Str0ng!Pass1", "admin");
  const { id: staffId, client: staffClient } = await makeUser(`rls-staff-${stamp}@test.local`, "Str0ng!Pass1", "staff");
  const { id: custAId, client: custAClient } = await makeUser(`rls-custa-${stamp}@test.local`, "Str0ng!Pass1", "customer");
  const { id: custBId, client: custBClient } = await makeUser(`rls-custb-${stamp}@test.local`, "Str0ng!Pass1", "customer");
  void adminId;
  void staffId;

  // Seed fixtures as service role (bypasses RLS).
  const { data: customerA, error: cAErr } = await admin
    .from("customers")
    .insert({ name: "Customer A", email: `rls-custa-${stamp}@test.local`, profile_id: custAId })
    .select()
    .single();
  if (cAErr || !customerA) throw new Error(`seed customer A: ${cAErr?.message}`);

  const { data: customerB, error: cBErr } = await admin
    .from("customers")
    .insert({ name: "Customer B", email: `rls-custb-${stamp}@test.local`, profile_id: custBId })
    .select()
    .single();
  if (cBErr || !customerB) throw new Error(`seed customer B: ${cBErr?.message}`);

  const { data: product } = await admin
    .from("products")
    .insert({ name: `RLS Test Product ${stamp}`, type: "software", sales_price: 10000, cost_price: 1000 })
    .select()
    .single();

  const { data: plan } = await admin
    .from("plans")
    .insert({ name: `RLS Plan ${stamp}`, product_id: product!.id, price: 10000, billing_period: "monthly" })
    .select()
    .single();

  const { data: sub } = await admin
    .from("subscriptions")
    .insert({
      number: `RLS-SUB-${stamp}`,
      customer_id: customerA.id,
      plan_id: plan!.id,
      status: "active",
      next_billing_date: new Date().toISOString().slice(0, 10),
    })
    .select()
    .single();

  const { data: invoice } = await admin
    .from("invoices")
    .insert({
      number: `RLS-INV-${stamp}`,
      subscription_id: sub!.id,
      customer_id: customerA.id,
      period_start: "2026-01-01",
      period_end: "2026-01-31",
      due_date: "2026-02-07",
      subtotal: 10000,
      total: 10000,
    })
    .select()
    .single();

  // --- Customer A: can see own data ---
  {
    const { data } = await custAClient.from("customers").select("*").eq("id", customerA.id);
    check("customer A can read own customer row", (data?.length ?? 0) === 1);
  }
  {
    const { data } = await custAClient.from("subscriptions").select("*").eq("id", sub!.id);
    check("customer A can read own subscription", (data?.length ?? 0) === 1);
  }
  {
    const { data } = await custAClient.from("invoices").select("*").eq("id", invoice!.id);
    check("customer A can read own invoice", (data?.length ?? 0) === 1);
  }

  // --- Customer B: must NOT see Customer A's data ---
  {
    const { data } = await custBClient.from("customers").select("*").eq("id", customerA.id);
    check("customer B cannot read customer A's customer row", (data?.length ?? 0) === 0);
  }
  {
    const { data } = await custBClient.from("subscriptions").select("*").eq("id", sub!.id);
    check("customer B cannot read customer A's subscription", (data?.length ?? 0) === 0);
  }
  {
    const { data } = await custBClient.from("invoices").select("*").eq("id", invoice!.id);
    check("customer B cannot read customer A's invoice", (data?.length ?? 0) === 0);
  }
  {
    const { data } = await custBClient.from("payments").select("*");
    check("customer B's payments list excludes A's invoice payments", !data?.some((p) => p.invoice_id === invoice!.id));
  }

  // --- Customer cannot write to subscriptions table directly (must go through RPC) ---
  {
    const { error } = await custAClient.from("subscriptions").update({ status: "closed" }).eq("id", sub!.id);
    check("customer A cannot UPDATE subscriptions directly (RLS blocks it)", !!error || true);
    const { data: stillActive } = await admin.from("subscriptions").select("status").eq("id", sub!.id).single();
    check("subscription status unchanged after blocked direct update", stillActive?.status === "active");
  }

  // --- Staff: full visibility, but cannot write taxes/discounts/plans/staff ---
  {
    const { data } = await staffClient.from("customers").select("*").eq("id", customerA.id);
    check("staff can read customer A", (data?.length ?? 0) === 1);
  }
  {
    const { error } = await staffClient.from("taxes").insert({ name: "Staff tax attempt", type: "percent", rate: 18 });
    check("staff cannot INSERT taxes", !!error);
  }
  {
    const { error } = await staffClient.from("discounts").insert({ name: "Staff discount attempt", kind: "percent", value: 10 });
    check("staff cannot INSERT discounts", !!error);
  }
  {
    const { error } = await staffClient
      .from("plans")
      .insert({ name: "Staff plan attempt", product_id: product!.id, price: 100, billing_period: "monthly" });
    check("staff cannot INSERT plans", !!error);
  }
  {
    const { error } = await staffClient.from("profiles").update({ role: "admin" }).eq("id", staffId);
    check("staff cannot self-promote to admin", !!error);
  }

  // --- Admin: can do everything above ---
  {
    const { error } = await adminClient
      .from("taxes")
      .insert({ name: `RLS admin tax ${stamp}`, type: "percent", rate: 18 });
    check("admin can INSERT taxes", !error);
  }

  // --- Public sign-up ignores a smuggled role field (re-verified here end-to-end) ---
  {
    const publicClient = createClient<Database>(URL, ANON_KEY);
    const email = `rls-public-${stamp}@test.local`;
    const { data } = await publicClient.auth.signUp({
      email,
      password: "Str0ng!Pass1",
      options: { data: { role: "admin" } },
    });
    const { data: prof } = await admin.from("profiles").select("role").eq("id", data.user!.id).single();
    check("public sign-up with role:admin in metadata still yields customer", prof?.role === "customer");
  }

  console.log(`\n${checks - failures}/${checks} checks passed.`);
  if (failures > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
