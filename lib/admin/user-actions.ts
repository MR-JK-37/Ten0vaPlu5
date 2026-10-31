"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/rbac/roles";
import { emailSchema, passwordSchema } from "@/lib/auth/password";

const createStaffSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z.string().min(1),
  role: z.enum(["staff", "admin"]),
});

// Only an admin may create staff/admin accounts — enforced here (requireRole) and again at
// the database layer (handle_new_user always sets 'customer'; this path updates the role
// afterward using the service-role key, which the role-change trigger allows).
export async function createStaffUser(_prev: { error?: string } | undefined, formData: FormData) {
  await requireRole(["admin"]);
  const parsed = createStaffSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { full_name: parsed.data.fullName },
  });
  if (error || !data.user) {
    return { error: error?.message ?? "Could not create user" };
  }

  const { error: roleError } = await admin
    .from("profiles")
    .update({ role: parsed.data.role })
    .eq("id", data.user.id);
  if (roleError) return { error: roleError.message };

  revalidatePath("/admin/users");
  return {};
}

export async function setUserActive(userId: string, isActive: boolean) {
  await requireRole(["admin"]);
  const supabase = await createClient();
  await supabase.from("profiles").update({ is_active: isActive }).eq("id", userId);
  revalidatePath("/admin/users");
}
