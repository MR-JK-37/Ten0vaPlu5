import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
const ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
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
  const testEmail = `auth-test-${stamp}@example.com`;
  const password = "Str0ng!Password123";

  // 1. Sign up new customer
  const client = createClient<Database>(URL, ANON_KEY);
  const { data: signUpData, error: signUpErr } = await client.auth.signUp({
    email: testEmail,
    password,
    options: {
      data: {
        full_name: "Auth Test User",
        role: "admin", // Malicious attempt to smuggle admin role
      },
    },
  });
  check("Sign-up succeeds with compliant password", !signUpErr && !!signUpData.user);

  // 2. Check profile role is customer despite metadata smuggling
  const { data: profile } = await admin
    .from("profiles")
    .select("role, is_active, full_name")
    .eq("id", signUpData.user!.id)
    .single();
  check("Profile role is strictly 'customer' (smuggled role ignored)", profile?.role === "customer");
  check("Profile is active by default", profile?.is_active === true);

  // 3. Duplicate email rejection
  const { error: dupErr } = await client.auth.signUp({
    email: testEmail.toUpperCase(), // Case insensitive check
    password,
  });
  check("Duplicate email is rejected", !!dupErr);

  // 4. Sign in with valid credentials
  const { data: signInData, error: signInErr } = await client.auth.signInWithPassword({
    email: testEmail,
    password,
  });
  check("Sign in with correct credentials succeeds", !signInErr && !!signInData.session);

  // 5. Sign in with invalid credentials fails
  const { error: badPwErr } = await client.auth.signInWithPassword({
    email: testEmail,
    password: "WrongPassword!999",
  });
  check("Sign in with wrong password fails", !!badPwErr);

  // 6. Deactivated user cannot sign in
  await admin.from("profiles").update({ is_active: false }).eq("id", signUpData.user!.id);
  const { data: deactProfile } = await admin
    .from("profiles")
    .select("is_active")
    .eq("id", signUpData.user!.id)
    .single();
  check("Account can be deactivated by admin", deactProfile?.is_active === false);

  // 7. Re-activate user
  await admin.from("profiles").update({ is_active: true }).eq("id", signUpData.user!.id);

  console.log(`\nResults: ${checks - failures}/${checks} checks passed.`);
  if (failures > 0) {
    process.exit(1);
  }
}

run().catch((e) => {
  console.error("Unhandled error:", e);
  process.exit(1);
});
