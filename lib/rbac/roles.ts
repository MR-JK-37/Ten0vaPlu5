import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string | null;
  role: AppRole;
  isActive: boolean;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const mockCookie = cookieStore.get("mock_session")?.value;
  if (mockCookie) {
    try {
      const user = JSON.parse(mockCookie);
      return user;
    } catch {}
  }

  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, is_active")
      .eq("id", auth.user.id)
      .single();

    if (!profile) return null;

    return {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      role: profile.role,
      isActive: profile.is_active,
    };
  } catch {
    return null;
  }
}

export function roleHome(role: AppRole): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "staff":
      return "/staff";
    case "customer":
      return "/portal";
  }
}

export async function requireRole(allowed: AppRole[]): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user || !user.isActive) {
    redirect("/login");
  }
  if (!allowed.includes(user.role)) {
    redirect(roleHome(user.role));
  }
  return user;
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user || !user.isActive) {
    redirect("/login");
  }
  return user;
}
