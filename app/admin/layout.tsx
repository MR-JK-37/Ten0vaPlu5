import { requireRole } from "@/lib/rbac/roles";
import { adminNav } from "@/lib/rbac/nav";
import { DashboardShell } from "@/components/dashboard/shell";

export const instant = false;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["admin"]);
  return (
    <DashboardShell nav={adminNav} user={user}>
      {children}
    </DashboardShell>
  );
}
