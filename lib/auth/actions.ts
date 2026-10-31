"use server";

import { headers, cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { roleHome } from "@/lib/rbac/roles";
import { checkRateLimit, resetRateLimit } from "@/lib/auth/rate-limit";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@/lib/auth/password";

export interface ActionResult {
  error?: string;
  redirectTo?: string;
}

export async function signUp(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  if (parsed.data.password !== "Pass@123") {
    return { error: "Password must be Pass@123" };
  }

  const mockUser = {
    id: `mock-customer-${Date.now()}`,
    email: parsed.data.email,
    fullName: parsed.data.fullName || "Customer User",
    role: "customer" as const,
    isActive: true,
  };

  const cookieStore = await cookies();
  cookieStore.set("mock_session", JSON.stringify(mockUser), {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  return { redirectTo: "/portal" };
}

export async function signIn(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Enter a valid User ID / email and password." };
  }

  // Check password is Pass@123
  if (parsed.data.password !== "Pass@123") {
    return { error: "Invalid password. Default password is Pass@123" };
  }

  const email = parsed.data.email.toLowerCase();

  // Role detection from User ID / email
  let role: "admin" | "staff" | "customer" = "customer";
  if (email.includes("admin")) {
    role = "admin";
  } else if (email.includes("staff")) {
    role = "staff";
  }

  const mockUser = {
    id: `mock-${role}-${Date.now()}`,
    email: parsed.data.email,
    fullName: email.includes("admin")
      ? "Admin User"
      : email.includes("staff")
      ? "Staff Member"
      : "Customer User",
    role,
    isActive: true,
  };

  const cookieStore = await cookies();
  cookieStore.set("mock_session", JSON.stringify(mockUser), {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  return { redirectTo: roleHome(role) };
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete("mock_session");
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {}
}

export async function requestPasswordReset(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: "Enter a valid email." };
  }

  return { error: "Mock reset link: password is Pass@123" };
}

export async function updatePassword(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse({ password: formData.get("password") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid password" };
  }

  return { redirectTo: "/login" };
}
