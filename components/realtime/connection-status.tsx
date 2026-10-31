"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";

// One shared channel per dashboard mount, subscribed to every table whose change should be
// visible without a page refresh (AGENTS.md section 8). Supabase Realtime is RLS-aware, so
// a customer only ever receives events for rows they could already SELECT -- the same
// guarantee enforced everywhere else in this app, not a separate filter we maintain here.
const WATCHED_TABLES = [
  "subscriptions",
  "subscription_events",
  "invoices",
  "payments",
  "billing_runs",
  "billing_run_items",
  "discounts",
  "notifications",
] as const;

export function ConnectionStatus() {
  const router = useRouter();
  const [status, setStatus] = useState<"connecting" | "live" | "reconnecting">("connecting");
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    function scheduleRefresh() {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      // Coalesce bursts (e.g. a billing run inserting many rows) into one refresh.
      refreshTimer.current = setTimeout(() => router.refresh(), 300);
    }

    // Realtime's websocket auth is set from the session the main client holds. Awaiting
    // getSession() first ensures that token is attached before we open the channel --
    // subscribing before the session hydrates from storage would connect as anon, which
    // RLS would then silently filter every row out of (no events delivered at all, but no
    // error either -- a quiet failure that's easy to miss without this ordering).
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data.session) {
        supabase.realtime.setAuth(data.session.access_token);
      }

      let ch = supabase.channel("db-changes");
      for (const table of WATCHED_TABLES) {
        ch = ch.on(
          "postgres_changes" as never,
          { event: "*", schema: "public", table } as never,
          scheduleRefresh
        );
      }
      channel = ch;

      ch.subscribe((subStatus: string) => {
        if (subStatus === "SUBSCRIBED") setStatus("live");
        else if (subStatus === "CLOSED" || subStatus === "CHANNEL_ERROR" || subStatus === "TIMED_OUT") {
          setStatus("reconnecting");
        }
      });
    });

    return () => {
      cancelled = true;
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      if (channel) supabase.removeChannel(channel);
    };
  }, [router]);

  return (
    <Badge variant={status === "live" ? "secondary" : "outline"} className="gap-1.5">
      <span
        className={
          "size-1.5 rounded-full " +
          (status === "live" ? "bg-green-500" : status === "reconnecting" ? "bg-amber-500" : "bg-muted-foreground")
        }
      />
      {status === "live" ? "Live" : status === "reconnecting" ? "Reconnecting…" : "Connecting…"}
    </Badge>
  );
}
