export interface NavItem {
  href: string;
  label: string;
}

// Grows as each page actually lands — a nav link to a route that doesn't exist yet is
// worse than no link (the "no dead UI" rule applies to navigation too).
export const adminNav: NavItem[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/plans", label: "Plans" },
  { href: "/admin/templates", label: "Templates" },
  { href: "/admin/taxes", label: "Taxes" },
  { href: "/admin/discounts", label: "Discounts" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/subscriptions", label: "Subscriptions" },
  { href: "/admin/users", label: "Users" },
];

export const staffNav: NavItem[] = [
  { href: "/staff", label: "Dashboard" },
  { href: "/staff/customers", label: "Customers" },
  { href: "/staff/subscriptions", label: "Subscriptions" },
];

export const portalNav: NavItem[] = [{ href: "/portal", label: "My subscriptions" }];
