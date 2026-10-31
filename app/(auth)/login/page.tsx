"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { signIn, type ActionResult } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const initialState: ActionResult = {};

export default function LoginPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(signIn, initialState);

  useEffect(() => {
    if (state.redirectTo) router.push(state.redirectTo);
  }, [state.redirectTo, router]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Ten0vaPlus subscription management</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="rounded-md bg-muted/60 p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Mock Authentication Active</p>
            <p>Password for all users: <span className="font-mono font-medium text-foreground">Pass@123</span></p>
            <p>Use <span className="font-mono text-foreground">admin</span> for Admin, <span className="font-mono text-foreground">staff</span> for Staff, or any other for Customer.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">User ID or Email</Label>
            <Input
              id="email"
              name="email"
              type="text"
              required
              defaultValue="admin"
              placeholder="e.g. admin, staff, or customer@example.com"
              autoComplete="username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              defaultValue="Pass@123"
              placeholder="Pass@123"
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
          <div className="flex justify-between text-sm text-muted-foreground">
            <Link href="/forgot-password" className="hover:underline">
              Forgot password?
            </Link>
            <Link href="/signup" className="hover:underline">
              Create an account
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
