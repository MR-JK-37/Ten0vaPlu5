"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { transitionSubscription, renewSubscription } from "@/lib/subscriptions/actions";
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
  audience = "staff",
}: {
  subscriptionId: string;
  status: string;
  plan: PlanRules;
  // Customers may only accept a quote, pause/resume, close early, or renew -- never
  // send a quotation or activate, which are staff-side operations even though the
  // database's ownership check would technically allow a customer to call them too.
  audience?: "staff" | "customer";
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

  async function doRenew() {
    setPending(true);
    setError(null);
    const result = await renewSubscription(subscriptionId);
    setPending(false);
    if (result.error) setError(result.error);
    else router.refresh();
  }

  const actions: { label: string; to: string; variant?: "outline" | "destructive" }[] = [];
  if (audience === "staff" && status === "draft") actions.push({ label: "Send quotation", to: "quotation" });
  if (status === "quotation" || (audience === "staff" && status === "draft")) {
    actions.push({ label: audience === "customer" ? "Accept quote" : "Confirm", to: "confirmed" });
  }
  if (audience === "staff" && status === "confirmed") actions.push({ label: "Activate", to: "active" });
  if (status === "active" && plan.allow_pause) actions.push({ label: "Pause", to: "paused" });
  if (status === "paused" && plan.allow_pause) actions.push({ label: "Resume", to: "active" });
  if (status === "active" && plan.allow_early_close)
    actions.push({ label: "Close early", to: "closed", variant: "destructive" });
  const canRenew = (status === "active" || status === "paused") && plan.allow_renew;

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
      {canRenew && (
        <Button size="sm" variant="outline" disabled={pending} onClick={doRenew}>
          Renew
        </Button>
      )}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
