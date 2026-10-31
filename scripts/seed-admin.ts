// pnpm seed:admin — creates (or re-activates) the one seed admin account from env vars.
// Uses the service-role key because this is the one place an admin profile is allowed to be
// created outside the UI's "only an existing admin can create staff/admin" rule.

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!url || !serviceKey || !email || !password) {
    console.error(
      "Missing env vars. Need NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD."
    );
    process.exit(1);
  }

  const supabase = createClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const normalizedEmail = email.trim().toLowerCase();

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();

  let userId: string;

  if (existing) {
    userId = existing.id;
    console.log(`Admin ${normalizedEmail} already exists (${userId}), ensuring role=admin.`);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: { full_name: "Brightloop Admin" },
    });
    if (error || !data.user) {
      console.error("Failed to create admin user:", error?.message);
      process.exit(1);
    }
    userId = data.user.id;
    console.log(`Created admin user ${normalizedEmail} (${userId}).`);
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ role: "admin", is_active: true })
    .eq("id", userId);

  if (updateError) {
    console.error("Failed to set admin role:", updateError.message);
    process.exit(1);
  }

  console.log("Seed admin ready:", normalizedEmail);
}

main();
