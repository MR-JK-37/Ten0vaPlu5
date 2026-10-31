"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { markNotificationRead } from "@/lib/notifications/actions";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

export function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const { data } = await supabase
        .from("notifications")
        .select("id, title, body, link, read_at, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      setNotifications(data ?? []);
    }

    load();

    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    // See components/realtime/connection-status.tsx for why getSession() comes first.
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data.session) supabase.realtime.setAuth(data.session.access_token);

      channel = supabase
        .channel(`notifications-${userId}`)
        .on(
          "postgres_changes" as never,
          { event: "INSERT", schema: "public", table: "notifications" } as never,
          () => load()
        )
        .subscribe();
    });

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [userId]);

  const unread = notifications.filter((n) => !n.read_at).length;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon-sm" className="relative">
            <Bell className="size-4" />
            {unread > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 size-4 justify-center p-0 text-[10px]"
              >
                {unread}
              </Badge>
            )}
          </Button>
        }
      />
      <PopoverContent className="w-80 p-0" align="end">
        <div className="max-h-80 overflow-y-auto">
          {notifications.length ? (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`block w-full border-b p-3 text-left text-sm last:border-0 hover:bg-muted ${
                  n.read_at ? "opacity-60" : ""
                }`}
              >
                <p className="font-medium">{n.title}</p>
                {n.body && <p className="text-xs text-muted-foreground">{n.body}</p>}
              </button>
            ))
          ) : (
            <p className="p-4 text-sm text-muted-foreground">No notifications yet.</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
