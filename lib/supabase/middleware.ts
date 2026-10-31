import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/types";

const ROLE_PREFIXES: Record<string, "admin" | "staff" | "customer"> = {
  "/admin": "admin",
  "/staff": "staff",
  "/portal": "customer",
};

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response;
  }

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: auth } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const protectedPrefix = Object.keys(ROLE_PREFIXES).find((prefix) => path.startsWith(prefix));

  if (protectedPrefix) {
    if (!auth.user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", path);
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", auth.user.id)
      .single();

    const requiredRole = ROLE_PREFIXES[protectedPrefix];
    const allowed =
      profile?.is_active &&
      (profile.role === requiredRole || (requiredRole === "staff" && profile.role === "admin"));

    if (!allowed) {
      const url = request.nextUrl.clone();
      url.pathname = profile?.role ? `/${profile.role === "customer" ? "portal" : profile.role}` : "/login";
      return NextResponse.redirect(url);
    }
  }

  return response;
}
