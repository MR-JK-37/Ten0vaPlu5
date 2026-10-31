import { CustomersTable } from "@/components/customers/customers-table";

export const instant = false;

export default function StaffCustomersPage() {
  return <CustomersTable basePath="/staff/customers" />;
}
