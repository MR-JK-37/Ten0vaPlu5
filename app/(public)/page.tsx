import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Subscriptions, invoices, and revenue — one place, in real time.
      </h1>
      <p className="mt-6 text-lg text-muted-foreground">
        Brightloop Software runs the full life of a subscription business: products and
        plans, quotations, recurring billing, payments, and revenue reporting — no
        spreadsheets, no missed renewals.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Link href="/signup" className={buttonVariants({ size: "lg" })}>
          Get started
        </Link>
        <Link href="/pricing" className={buttonVariants({ size: "lg", variant: "outline" })}>
          See pricing
        </Link>
      </div>
    </div>
  );
}
