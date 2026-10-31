export interface NavItem {
  href: string;
  label: string;
}

export const adminNav: NavItem[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/plans", label: "Plans" },
  { href: "/admin/quotations", label: "Quotations" },
  { href: "/admin/subscriptions", label: "Subscriptions" },
  { href: "/admin/invoices", label: "Invoices" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/discounts", label: "Discounts" },
  { href: "/admin/taxes", label: "Taxes" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/users", label: "Users" },
];

export const staffNav: NavItem[] = [
  { href: "/staff", label: "Dashboard" },
  { href: "/staff/tasks", label: "My Tasks" },
  { href: "/staff/customers", label: "Customers" },
  { href: "/staff/products", label: "Products" },
  { href: "/staff/plans", label: "Plans" },
  { href: "/staff/quotations", label: "Quotations" },
  { href: "/staff/subscriptions", label: "Subscriptions" },
  { href: "/staff/invoices", label: "Invoices" },
  { href: "/staff/payments", label: "Payments" },
  { href: "/staff/discounts", label: "Discounts" },
  { href: "/staff/taxes", label: "Taxes" },
  { href: "/staff/reports", label: "Reports" },
];

export const portalNav: NavItem[] = [
  { href: "/portal", label: "Dashboard" },
  { href: "/portal/profile", label: "My Profile" },
  { href: "/portal/products", label: "Products" },
  { href: "/portal/plans", label: "Plans" },
  { href: "/portal/quotations", label: "Quotations" },
  { href: "/portal/subscriptions", label: "My Subscriptions" },
  { href: "/portal/invoices", label: "My Invoices" },
  { href: "/portal/payments", label: "My Payments" },
  { href: "/portal/discounts", label: "Discounts" },
  { href: "/portal/taxes", label: "Taxes" },
  { href: "/portal/reports", label: "Reports" },
];
