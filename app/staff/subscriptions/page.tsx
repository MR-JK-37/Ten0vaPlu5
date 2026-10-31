import { SubscriptionsTable } from "@/components/subscriptions/subscriptions-table";

export const instant = false;

export default function StaffSubscriptionsPage() {
  return <SubscriptionsTable basePath="/staff/subscriptions" />;
}
