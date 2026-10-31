import { CustomersTable } from "@/components/customers/customers-table";

export const instant = false;

export default function AdminCustomersPage() {
  return <CustomersTable basePath="/admin/customers" />;
}
