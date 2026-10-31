import { portalNav } from "@/lib/rbac/nav";
import { DashboardShell } from "@/components/dashboard/shell";

export const instant = false;

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = { id: "3", email: "rahul@acmecorp.in", fullName: "Rahul Kumar", role: "customer" as const, isActive: true };
  return (
    <DashboardShell nav={portalNav} user={user}>
      {children}
    </DashboardShell>
  );
}
