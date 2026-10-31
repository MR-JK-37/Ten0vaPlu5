import { requireRole } from "@/lib/rbac/roles";
import { portalNav } from "@/lib/rbac/nav";
import { DashboardShell } from "@/components/dashboard/shell";

export const instant = false;

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["customer"]);
  return (
    <DashboardShell nav={portalNav} user={user}>
      {children}
    </DashboardShell>
  );
}
