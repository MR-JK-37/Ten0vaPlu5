// pnpm seed:demo [--subs N] [--invoices-per-sub N] -- generates demo-scale data for
// performance testing (AGENTS.md section 13). Uses the service-role key directly against
// Postgres (not the app) since this needs to move fast at thousands of rows.

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

function parseArg(name: string, fallback: number): number {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1 || !process.argv[idx + 1]) return fallback;
  return parseInt(process.argv[idx + 1], 10);
}

async function main() {
  const subsCount = parseArg("subs", 5000);
  const invoicesPerSub = parseArg("invoices-per-sub", 6);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const admin = createClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log(`Seeding ${subsCount} subscriptions with ~${invoicesPerSub} invoices each...`);

  const { data: product, error: productError } = await admin
    .from("products")
    .insert({ name: "Demo Product", type: "software", sales_price: 99900, cost_price: 20000 })
    .select()
    .single();
  if (productError || !product) throw productError;

  const { data: plan, error: planError } = await admin
    .from("plans")
    .insert({
      name: "Demo Monthly",
      product_id: product.id,
      price: 99900,
      billing_period: "monthly",
      allow_pause: true,
      allow_renew: true,
    })
    .select()
    .single();
  if (planError || !plan) throw planError;

  const batchSize = 500;
  let created = 0;

  for (let batchStart = 0; batchStart < subsCount; batchStart += batchSize) {
    const batchCount = Math.min(batchSize, subsCount - batchStart);

    const customers = Array.from({ length: batchCount }, (_, i) => ({
      name: `Demo Customer ${batchStart + i}`,
      email: `demo-customer-${batchStart + i}@example.test`,
    }));
    const { data: insertedCustomers, error: custError } = await admin
      .from("customers")
      .insert(customers)
      .select("id");
    if (custError || !insertedCustomers) throw custError;

    const subscriptions = insertedCustomers.map((c, i) => ({
      number: `SUB-DEMO-${String(batchStart + i).padStart(6, "0")}`,
      customer_id: c.id,
      plan_id: plan.id,
      status: "active" as const,
      start_date: new Date(Date.now() - invoicesPerSub * 30 * 86400000).toISOString().slice(0, 10),
      next_billing_date: new Date(Date.now() - invoicesPerSub * 30 * 86400000)
        .toISOString()
        .slice(0, 10),
      expiry_date: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
      payment_terms: 7,
    }));
    const { data: insertedSubs, error: subError } = await admin
      .from("subscriptions")
      .insert(subscriptions)
      .select("id");
    if (subError || !insertedSubs) throw subError;

    const lines = insertedSubs.map((s) => ({
      subscription_id: s.id,
      product_id: product.id,
      quantity: 1,
      unit_price: 99900,
      amount: 99900,
    }));
    const { error: lineError } = await admin.from("subscription_lines").insert(lines);
    if (lineError) throw lineError;

    created += batchCount;
    console.log(`  ${created}/${subsCount} subscriptions seeded`);
  }

  console.log(
    `Running billing to generate invoices (this creates ~${invoicesPerSub * subsCount} invoices)...`
  );
  console.log(
    "NOTE: at this scale run_billing's single transaction exceeds PostgREST's statement " +
      "timeout. Run it directly against Postgres instead, with no timeout:\n\n" +
      "  PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -c " +
      `"set statement_timeout = 0; select public.run_billing(current_date, false);"\n`
  );

  const { count } = await admin.from("invoices").select("id", { count: "exact", head: true });
  console.log(`Done. Total invoices now: ${count}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
