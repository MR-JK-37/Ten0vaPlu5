import { InvoicesTable } from "@/components/invoices/invoices-table";
import { InvoiceStatusFilter } from "@/components/invoices/invoice-status-filter";

export const instant = false;

export default async function StaffInvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Invoices</h1>
        <InvoiceStatusFilter basePath="/staff/invoices" />
      </div>
      <div className="mt-6">
        <InvoicesTable statusFilter={status} />
      </div>
    </div>
  );
}
