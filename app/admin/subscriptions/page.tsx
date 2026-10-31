import { SubscriptionsTable } from "@/components/subscriptions/subscriptions-table";

export const instant = false;

export default function AdminSubscriptionsPage() {
  return <SubscriptionsTable basePath="/admin/subscriptions" />;
}
