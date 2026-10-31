import { staffNav } from "@/lib/rbac/nav";
import { DashboardShell } from "@/components/dashboard/shell";

export const instant = false;

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const user = { id: "2", email: "priya@brightloop.test", fullName: "Priya Sharma", role: "staff" as const, isActive: true };
  return (
    <DashboardShell nav={staffNav} user={user}>
      {children}
    </DashboardShell>
  );
}
