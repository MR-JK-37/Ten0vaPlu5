import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// Service-role client. Server-only: bypasses RLS entirely. Used only for admin-created
// staff accounts and the YouPI webhook handler (which has no user session to act as).
// Never import this from a Client Component or anything that ships to the browser.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
