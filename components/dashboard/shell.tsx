"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, Package, CreditCard, FileText, RefreshCw,
  Receipt, Wallet, Tag, Percent, BarChart2, UserCog, CheckSquare,
  User, Bell, ChevronDown, Search, Home, ExternalLink
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { signOut } from "@/lib/auth/actions";
import type { NavItem } from "@/lib/rbac/nav";
import type { CurrentUser } from "@/lib/rbac/roles";

const ICON_MAP: Record<string, React.ReactNode> = {
  "Dashboard": <LayoutDashboard size={16} />,
  "Customers": <Users size={16} />,
  "Products": <Package size={16} />,
  "Plans": <CreditCard size={16} />,
  "Quotations": <FileText size={16} />,
  "Subscriptions": <RefreshCw size={16} />,
  "Invoices": <Receipt size={16} />,
  "Payments": <Wallet size={16} />,
  "Discounts": <Tag size={16} />,
  "Taxes": <Percent size={16} />,
  "Reports": <BarChart2 size={16} />,
  "Users": <UserCog size={16} />,
  "My Tasks": <CheckSquare size={16} />,
  "My Profile": <User size={16} />,
  "My Subscriptions": <RefreshCw size={16} />,
  "My Invoices": <Receipt size={16} />,
  "My Payments": <Wallet size={16} />,
  "Billing runs": <RefreshCw size={16} />,
  "Templates": <FileText size={16} />,
};

const PORTAL_CONFIG = {
  admin: { label: "Ten0vaPlus", sub: "Admin Portal", initials: "AU", name: "Admin User", roleBadge: "Admin" },
  staff: { label: "Ten0vaPlus", sub: "Staff Portal", initials: "PS", name: "Priya Sharma", roleBadge: "Staff" },
  customer: { label: "Ten0vaPlus", sub: "Customer Portal", initials: "RK", name: "Rahul Kumar", roleBadge: "Customer" },
};

function getPortalType(nav: NavItem[]): "admin" | "staff" | "customer" {
  if (nav[0]?.href?.startsWith("/portal")) return "customer";
  if (nav[0]?.href?.startsWith("/staff")) return "staff";
  return "admin";
}

export function DashboardShell({
  nav,
  user,
  children,
}: {
  nav: NavItem[];
  user: CurrentUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const portalType = getPortalType(nav);
  const config = PORTAL_CONFIG[portalType];

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notificationsList = [
    { id: 1, title: "New subscription created", desc: "Acme Corp activated Business Plan", time: "10m ago", read: false },
    { id: 2, title: "Invoice Paid", desc: "INV-01457 settled via UPI ₹1,180", time: "1h ago", read: false },
    { id: 3, title: "System Update", desc: "All subscription webhooks operational", time: "3h ago", read: true },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.info(`Searching for "${searchQuery}" across ${config.sub}...`);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F4F7FB] text-gray-900 antialiased">
      <Toaster richColors position="top-right" />

      {/* Sidebar */}
      <aside className="w-56 shrink-0 flex flex-col border-r border-blue-700/20 shadow-md" style={{ backgroundColor: "#2563EB" }}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm p-1.5 overflow-hidden">
            <Image src="/logo-symbol.png" alt="Ten0vaPlus" width={28} height={28} className="w-full h-full object-contain" priority />
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight tracking-wide">{config.label}</div>
            <div className="text-blue-200 text-[11px] leading-tight font-medium mt-0.5">{config.sub}</div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {nav.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && item.href !== "/admin" && item.href !== "/staff" && item.href !== "/portal" && pathname.startsWith(item.href));
            const exactActive = pathname === item.href;
            const active = item.href.split("/").length === 2 ? exactActive : isActive;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${active
                    ? "bg-white/20 text-white font-semibold shadow-xs"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <span className="flex-shrink-0">{ICON_MAP[item.label] ?? <Home size={16} />}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card at Bottom of Sidebar */}
        <div className="p-3 border-t border-white/10 bg-black/10">
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold shadow-xs">
              {config.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-white text-xs font-semibold truncate">{user.fullName ?? config.name}</div>
              <div className="text-blue-200 text-[10px] font-medium capitalize">{user.role}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-blue-100 flex items-center justify-between px-7 py-3 gap-4 sticky top-0 z-30 shadow-xs">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customers, invoices, subscriptions..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-blue-100 rounded-xl bg-blue-50/30 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all placeholder:text-gray-400"
              />
            </div>
          </form>

          <div className="flex items-center gap-3">
            {/* Notifications Popover */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 rounded-xl transition-all border ${showNotifications
                    ? "bg-blue-100 text-blue-700 border-blue-300"
                    : "hover:bg-blue-50 text-gray-600 border-gray-100"
                  }`}
                title="Notifications"
              >
                <Bell size={17} />
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  2
                </span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-xl border border-blue-200/80 p-4 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900">Notifications</span>
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">2 New</span>
                    </div>
                    <button
                      onClick={() => {
                        toast.success("All notifications marked as read");
                        setShowNotifications(false);
                      }}
                      className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Mark read
                    </button>
                  </div>
                  <div className="divide-y divide-gray-50 mt-2">
                    {notificationsList.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          toast.info(`${n.title}: ${n.desc}`);
                          setShowNotifications(false);
                        }}
                        className="py-2.5 px-2 hover:bg-blue-50/50 rounded-xl cursor-pointer transition flex items-start gap-2.5"
                      >
                        <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-900 truncate">{n.title}</p>
                          <p className="text-[11px] text-gray-500 line-clamp-1">{n.desc}</p>
                          <span className="text-[10px] text-gray-400 mt-0.5 block">{n.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu Popover */}
            <div className="relative" ref={profileRef}>
              <div
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={`flex items-center gap-2.5 cursor-pointer rounded-xl px-3 py-1.5 border transition-all ${showProfileMenu
                    ? "bg-blue-50 border-blue-300 ring-2 ring-blue-100"
                    : "hover:bg-blue-50/60 border-blue-100/80 bg-white"
                  }`}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-xs"
                  style={{ backgroundColor: "#2563EB" }}
                >
                  {config.initials}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-gray-900 leading-tight">{user.fullName ?? config.name}</div>
                  <div className="text-[10px] text-gray-500 font-medium capitalize">{config.roleBadge}</div>
                </div>
                <ChevronDown size={14} className="text-gray-400" />
              </div>

              {showProfileMenu && (
                <div className="absolute right-0 top-12 w-60 bg-white rounded-2xl shadow-xl border border-blue-200/80 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-gray-100 mb-1">
                    <p className="text-xs font-bold text-gray-900">{user.fullName ?? config.name}</p>
                    <p className="text-[11px] text-gray-400">{user.email}</p>
                  </div>

                  <div className="text-[10px] uppercase font-bold text-gray-400 px-3 pt-2 pb-1 tracking-wider">
                    Switch Portal View
                  </div>

                  <Link
                    href="/admin"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs hover:bg-blue-50 font-medium text-gray-700 hover:text-blue-700 transition"
                  >
                    <span>Admin Portal</span>
                    <ExternalLink size={12} className="text-gray-400" />
                  </Link>

                  <Link
                    href="/staff"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs hover:bg-blue-50 font-medium text-gray-700 hover:text-blue-700 transition"
                  >
                    <span>Staff Portal</span>
                    <ExternalLink size={12} className="text-gray-400" />
                  </Link>

                  <Link
                    href="/portal"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs hover:bg-blue-50 font-medium text-gray-700 hover:text-blue-700 transition"
                  >
                    <span>Customer Portal</span>
                    <ExternalLink size={12} className="text-gray-400" />
                  </Link>

                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={async () => {
                        await signOut();
                        toast.success("Signed out successfully");
                        setShowProfileMenu(false);
                        router.push("/login");
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content: wrapped in seamless padded area with no awkward gaps */}
        <main className="flex-1 p-7 bg-[#F4F7FB] overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
