"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Authentication Disabled</CardTitle>
        <CardDescription>All routes are publicly accessible without signing in.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Link href="/admin" className={buttonVariants({ className: "w-full" })}>
          Go to Admin Dashboard
        </Link>
        <Link href="/staff" className={buttonVariants({ variant: "outline", className: "w-full" })}>
          Go to Staff Portal
        </Link>
        <Link href="/portal" className={buttonVariants({ variant: "outline", className: "w-full" })}>
          Go to Customer Portal
        </Link>
      </CardContent>
    </Card>
  );
}
