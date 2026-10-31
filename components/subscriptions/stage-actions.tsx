"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { transitionSubscription } from "@/lib/subscriptions/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PlanRules {
  allow_pause: boolean;
  allow_early_close: boolean;
  allow_renew: boolean;
}

// The buttons offered are exactly the legal next transitions for the current status and
// plan rules -- mirroring subscription_transition_allowed() in the database, which is the
// actual enforcement (this is just so the UI doesn't offer a button that would fail).
export function StageActions({
  subscriptionId,
  status,
  plan,
}: {
  subscriptionId: string;
  status: string;
  plan: PlanRules;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function act(to: string, reason?: string) {
    setPending(true);
    setError(null);
    const result = await transitionSubscription(subscriptionId, to as never, reason);
    setPending(false);
    if (result.error) setError(result.error);
    else router.refresh();
  }

  const actions: { label: string; to: string; variant?: "outline" | "destructive" }[] = [];
  if (status === "draft") actions.push({ label: "Send quotation", to: "quotation" });
  if (status === "draft" || status === "quotation") actions.push({ label: "Confirm", to: "confirmed" });
  if (status === "confirmed") actions.push({ label: "Activate", to: "active" });
  if (status === "active" && plan.allow_pause) actions.push({ label: "Pause", to: "paused" });
  if (status === "paused" && plan.allow_pause) actions.push({ label: "Resume", to: "active" });
  if (status === "active" && plan.allow_early_close)
    actions.push({ label: "Close early", to: "closed", variant: "destructive" });

  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="capitalize">
        {status}
      </Badge>
      {actions.map((a) => (
        <Button
          key={a.to}
          size="sm"
          variant={a.variant ?? "outline"}
          disabled={pending}
          onClick={() => act(a.to, a.to === "closed" ? "early_close" : undefined)}
        >
          {a.label}
        </Button>
      ))}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
