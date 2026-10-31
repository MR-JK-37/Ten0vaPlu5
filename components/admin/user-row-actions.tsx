"use client";

import { useRouter } from "next/navigation";
import { setUserActive } from "@/lib/admin/user-actions";
import { Button } from "@/components/ui/button";

export function UserRowActions({ userId, isActive }: { userId: string; isActive: boolean }) {
  const router = useRouter();
  return (
    <Button
      size="sm"
      variant={isActive ? "outline" : "secondary"}
      onClick={async () => {
        await setUserActive(userId, !isActive);
        router.refresh();
      }}
    >
      {isActive ? "Deactivate" : "Reactivate"}
    </Button>
  );
}
