import { CustomerDetail } from "@/components/customers/customer-detail";

export const instant = false;

export default async function StaffCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CustomerDetail customerId={id} />;
}
