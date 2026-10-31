-- Supabase Realtime's postgres_changes only delivers changes for tables explicitly added
-- to the supabase_realtime publication. Add every table the UI subscribes to
-- (components/realtime/connection-status.tsx, components/realtime/notification-bell.tsx).
alter publication supabase_realtime add table
  public.subscriptions,
  public.subscription_events,
  public.invoices,
  public.payments,
  public.billing_runs,
  public.billing_run_items,
  public.discounts,
  public.notifications;
