import Link from "next/link";
import type { NavItem } from "@/lib/rbac/nav";
import type { CurrentUser } from "@/lib/rbac/roles";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { ConnectionStatus } from "@/components/realtime/connection-status";
import { NotificationBell } from "@/components/realtime/notification-bell";
import { Badge } from "@/components/ui/badge";

export function DashboardShell({
  nav,
  user,
  children,
}: {
  nav: NavItem[];
  user: CurrentUser;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r bg-muted/20 p-4">
        <div className="mb-6 font-semibold">Brightloop</div>
        <nav className="space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1">
        <header className="flex items-center justify-between border-b px-6 py-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="capitalize">
              {user.role}
            </Badge>
            <ConnectionStatus />
          </div>
          <div className="flex items-center gap-3 text-sm">
            <NotificationBell userId={user.id} />
            <span className="text-muted-foreground">{user.email}</span>
            <SignOutButton />
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
