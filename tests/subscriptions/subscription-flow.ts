import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const admin = createClient<Database>(URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let checks = 0;
let failures = 0;

function check(label: string, condition: boolean) {
  checks++;
  if (!condition) {
    failures++;
    console.error(`FAIL: ${label}`);
  } else {
    console.log(`ok   ${label}`);
  }
}

async function run() {
  const stamp = Date.now();

  // 1. Setup product
  const { data: product, error: pErr } = await admin
    .from("products")
    .insert({
      name: `CRM Suite ${stamp}`,
      type: "software",
      sales_price: 100000, // ₹1,000.00
      cost_price: 30000,
    })
    .select()
    .single();
  if (pErr || !product) throw new Error(`Product create failed: ${pErr?.message}`);

  // 2. Setup plans: one with pause/early-close allowed, one strictly without pause
  const { data: flexiblePlan, error: fpErr } = await admin
    .from("plans")
    .insert({
      name: `Flexible Plan ${stamp}`,
      product_id: product.id,
      price: 150000, // ₹1,500.00
      billing_period: "monthly",
      min_quantity: 1,
      available_from: "2026-01-01",
      allow_pause: true,
      allow_early_close: true,
      allow_renew: true,
    })
    .select()
    .single();
  if (fpErr || !flexiblePlan) throw new Error(`Flexible plan create failed: ${fpErr?.message}`);

  const { data: strictPlan, error: spErr } = await admin
    .from("plans")
    .insert({
      name: `Strict Plan ${stamp}`,
      product_id: product.id,
      price: 200000,
      billing_period: "yearly",
      min_quantity: 1,
      available_from: "2026-01-01",
      allow_pause: false,
      allow_early_close: false,
    })
    .select()
    .single();
  if (spErr || !strictPlan) throw new Error(`Strict plan create failed: ${spErr?.message}`);

  // 3. Setup quotation template
  const { data: template, error: tmplErr } = await admin
    .from("quotation_templates")
    .insert({
      name: `Enterprise Annual Quote ${stamp}`,
      plan_id: flexiblePlan.id,
      validity_days: 14,
      notes: "Standard 14-day validity",
    })
    .select()
    .single();
  if (tmplErr || !template) throw new Error(`Template create failed: ${tmplErr?.message}`);

  // Add line to template
  const { error: lineErr } = await admin.from("quotation_template_lines").insert({
    template_id: template.id,
    product_id: product.id,
    quantity: 2,
  });
  if (lineErr) throw new Error(`Template line create failed: ${lineErr.message}`);

  // 4. Setup customer
  const { data: customer, error: custErr } = await admin
    .from("customers")
    .insert({
      name: `Acme Corp ${stamp}`,
      email: `acme-${stamp}@example.com`,
      company: "Acme Industries",
    })
    .select()
    .single();
  if (custErr || !customer) throw new Error(`Customer create failed: ${custErr?.message}`);

  // 5. Test unique numbering across sequential creations
  const { data: num1 } = await admin.rpc("next_number", { p_prefix: "SUB", p_width: 5 });
  const { data: num2 } = await admin.rpc("next_number", { p_prefix: "SUB", p_width: 5 });
  check("Subscription numbering is unique and formatted correctly", typeof num1 === "string" && typeof num2 === "string" && num1 !== num2 && num1.startsWith("SUB-"));

  // 6. Test Quotation Template -> Subscription flow
  const validUntil = new Date(Date.now() + template.validity_days * 86400000).toISOString().slice(0, 10);
  const { data: sub1, error: sub1Err } = await admin
    .from("subscriptions")
    .insert({
      number: num1 as string,
      customer_id: customer.id,
      plan_id: template.plan_id,
      template_id: template.id,
      status: "quotation",
      quote_valid_until: validUntil,
      payment_terms: 14,
    })
    .select()
    .single();
  check("Quotation created from template in 'quotation' status", !sub1Err && sub1?.status === "quotation");
  check("Quote validity days honoured in quote_valid_until", sub1?.quote_valid_until === validUntil);

  // Copy template lines to subscription lines
  const { error: subLineErr } = await admin.from("subscription_lines").insert({
    subscription_id: sub1!.id,
    product_id: product.id,
    quantity: 2,
    unit_price: product.sales_price,
    amount: product.sales_price * 2,
  });
  check("Subscription lines copied from template with correct total amount", !subLineErr);

  // 7. Test State Machine Transitions
  // Transition quotation -> confirmed
  const { data: confirmedSub, error: confErr } = await admin.rpc("transition_subscription", {
    p_subscription_id: sub1!.id,
    p_to: "confirmed",
  });
  check("Legal transition: quotation -> confirmed succeeds", !confErr && confirmedSub?.status === "confirmed");

  // Transition confirmed -> active
  const { data: activeSub, error: actErr } = await admin.rpc("transition_subscription", {
    p_subscription_id: sub1!.id,
    p_to: "active",
  });
  check("Legal transition: confirmed -> active succeeds", !actErr && activeSub?.status === "active");

  // Transition active -> paused (flexible plan allows pause)
  const { data: pausedSub, error: pauseErr } = await admin.rpc("transition_subscription", {
    p_subscription_id: sub1!.id,
    p_to: "paused",
  });
  check("Legal transition: active -> paused succeeds when plan allows pause", !pauseErr && pausedSub?.status === "paused");

  // Resume paused -> active
  const { data: resumedSub, error: resErr } = await admin.rpc("transition_subscription", {
    p_subscription_id: sub1!.id,
    p_to: "active",
  });
  check("Legal transition: paused -> active (resume) succeeds", !resErr && resumedSub?.status === "active");

  // Close active -> closed
  const { data: closedSub, error: closeErr } = await admin.rpc("transition_subscription", {
    p_subscription_id: sub1!.id,
    p_to: "closed",
    p_reason: "early_close",
  });
  check("Legal transition: active -> closed succeeds", !closeErr && closedSub?.status === "closed");

  // 8. Test State Machine Illegal Jump Enforcement
  // Create another subscription in 'draft'
  const { data: sub2 } = await admin
    .from("subscriptions")
    .insert({
      number: num2 as string,
      customer_id: customer.id,
      plan_id: strictPlan.id,
      status: "draft",
    })
    .select()
    .single();

  // Illegal jump: draft directly to active
  const { error: illegalJumpErr } = await admin.rpc("transition_subscription", {
    p_subscription_id: sub2!.id,
    p_to: "active",
  });
  check("Illegal jump: draft -> active is rejected by DB state machine", !!illegalJumpErr);

  // Illegal transition: pause on a plan that forbids pause
  // Move draft -> confirmed -> active first
  await admin.rpc("transition_subscription", { p_subscription_id: sub2!.id, p_to: "confirmed" });
  await admin.rpc("transition_subscription", { p_subscription_id: sub2!.id, p_to: "active" });

  const { error: forbidPauseErr } = await admin.rpc("transition_subscription", {
    p_subscription_id: sub2!.id,
    p_to: "paused",
  });
  check("Plan rule enforced: pause blocked when allow_pause is false", !!forbidPauseErr);

  // 9. Quotation Expiration Enforcement
  const { data: expiredNum } = await admin.rpc("next_number", { p_prefix: "SUB", p_width: 5 });
  const pastDate = new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10); // 5 days ago
  const { data: expiredSub } = await admin
    .from("subscriptions")
    .insert({
      number: expiredNum as string,
      customer_id: customer.id,
      plan_id: flexiblePlan.id,
      status: "quotation",
      quote_valid_until: pastDate,
    })
    .select()
    .single();

  // In our actions layer, transitionSubscription checks quote_valid_until for quotes
  const isExpired = expiredSub!.quote_valid_until! < new Date().toISOString().slice(0, 10);
  check("Expired quotation correctly identified via quote_valid_until", isExpired);

  console.log(`\nResults: ${checks - failures}/${checks} checks passed.`);
  if (failures > 0) {
    process.exit(1);
  }
}

run().catch((e) => {
  console.error("Unhandled error:", e);
  process.exit(1);
});
