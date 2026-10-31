import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="font-semibold">
            Brightloop Software
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Link href="/portal" className="text-muted-foreground hover:text-foreground">
              Customer Portal
            </Link>
            <Link href="/staff" className="text-muted-foreground hover:text-foreground">
              Staff Portal
            </Link>
            <Link href="/admin" className={buttonVariants({ size: "sm" })}>
              Admin Dashboard
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
