import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-8">
      <Link href="/" className="mb-6 flex items-center justify-center">
        <Image
          src="/logo.png"
          alt="Ten0vaPlus"
          width={200}
          height={40}
          className="h-10 w-auto object-contain"
          priority
        />
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
