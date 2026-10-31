import type { Database } from "@/lib/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string | null;
  role: AppRole;
  isActive: boolean;
}

const DEFAULT_USER: CurrentUser = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "admin@brightloop.test",
  fullName: "Admin",
  role: "admin",
  isActive: true,
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  return DEFAULT_USER;
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

// Authentication removed: allow all users through with the appropriate role
export async function requireRole(allowed: AppRole[]): Promise<CurrentUser> {
  const role = allowed.includes("admin") ? "admin" : allowed[0] || "admin";
  return {
    ...DEFAULT_USER,
    role,
  };
}

export async function requireUser(): Promise<CurrentUser> {
  return DEFAULT_USER;
}
