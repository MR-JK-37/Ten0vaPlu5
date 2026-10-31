import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <div className="mb-6 flex justify-center">
        <Image
          src="/logo.png"
          alt="Ten0vaPlus"
          width={280}
          height={56}
          className="h-14 w-auto object-contain"
          priority
        />
      </div>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-gray-900">
        Subscriptions, invoices, and revenue — one place, in real time.
      </h1>
      <p className="mt-6 text-lg text-muted-foreground">
        Ten0vaPlus runs the full life of a subscription business: products and
        plans, quotations, recurring billing, payments, and revenue reporting — no
        spreadsheets, no missed renewals.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Link href="/admin" className={buttonVariants({ size: "lg" })}>
          Open Dashboard
        </Link>
        <Link href="/pricing" className={buttonVariants({ size: "lg", variant: "outline" })}>
          See pricing
        </Link>
      </div>
    </div>
  );
}
