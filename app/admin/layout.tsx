import { adminNav } from "@/lib/rbac/nav";
import { DashboardShell } from "@/components/dashboard/shell";

export const instant = false;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = { id: "1", email: "admin@brightloop.test", fullName: "Admin User", role: "admin" as const, isActive: true };
  return (
    <DashboardShell nav={adminNav} user={user}>
      {children}
    </DashboardShell>
  );
}
