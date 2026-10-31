import { requireRole } from "@/lib/rbac/roles";
import { adminNav } from "@/lib/rbac/nav";
import { DashboardShell } from "@/components/dashboard/shell";

// Every route under here reads the caller's session via cookies (requireRole), so it can
// never be statically prerendered — the underlying auth client also touches the current
// time internally, which Next 16's Cache Components otherwise flags at build time.
export const instant = false;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["admin"]);
  return (
    <DashboardShell nav={adminNav} user={user}>
      {children}
    </DashboardShell>
  );
}
