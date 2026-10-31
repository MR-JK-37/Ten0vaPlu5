import { requireRole } from "@/lib/rbac/roles";
import { staffNav } from "@/lib/rbac/nav";
import { DashboardShell } from "@/components/dashboard/shell";

export const instant = false;

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["staff", "admin"]);
  return (
    <DashboardShell nav={staffNav} user={user}>
      {children}
    </DashboardShell>
  );
}
