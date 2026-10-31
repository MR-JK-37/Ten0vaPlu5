-- Server-side KPI aggregation. "Never client-side sums over big lists" (AGENTS.md section
-- 10): all five dashboard numbers come from one SQL aggregate call, not from fetching rows
-- and summing them in JS.
create or replace function public.dashboard_kpis()
returns table (
  active_subscriptions bigint,
  mrr bigint,
  arr bigint,
  revenue_collected bigint,
  outstanding bigint,
  overdue_count bigint
) language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_staff_or_admin() then
    raise exception 'forbidden';
  end if;

  return query
  select
    (select count(*) from public.subscriptions where status = 'active'),
    coalesce((
      select sum(
        case p.billing_period
          when 'daily' then p.price * 365 / 12
          when 'weekly' then p.price * 52 / 12
          when 'monthly' then p.price
          when 'yearly' then p.price / 12
        end
      )
      from public.subscriptions s join public.plans p on p.id = s.plan_id
      where s.status = 'active'
    ), 0)::bigint,
    coalesce((
      select sum(
        case p.billing_period
          when 'daily' then p.price * 365
          when 'weekly' then p.price * 52
          when 'monthly' then p.price * 12
          when 'yearly' then p.price
        end
      )
      from public.subscriptions s join public.plans p on p.id = s.plan_id
      where s.status = 'active'
    ), 0)::bigint,
    coalesce((select sum(amount) from public.payments where status = 'confirmed'), 0)::bigint,
    coalesce((select sum(amount_due) from public.invoices where status in ('confirmed')), 0)::bigint,
    (select count(*) from public.invoices where status = 'confirmed' and due_date < current_date and amount_due > 0);
end;
$$;

revoke execute on function public.dashboard_kpis() from anon;
