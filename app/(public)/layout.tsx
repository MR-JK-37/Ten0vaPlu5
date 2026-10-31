import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Ten0vaPlus"
              width={160}
              height={32}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground font-medium">
              Pricing
            </Link>
            <Link href="/login" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Sign in
            </Link>
            <Link href="/signup" className={buttonVariants({ size: "sm" })}>
              Get started
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
