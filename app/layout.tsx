import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ten0vaPlus - Subscription Management System",
  description: "Ten0vaPlus Subscription Management System",
  icons: {
    icon: "/logo-symbol.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50 font-sans">{children}</body>
    </html>
  );
}
