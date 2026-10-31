create type public.subscription_status as enum ('draft', 'quotation', 'confirmed', 'active', 'paused', 'closed');

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  customer_id uuid not null references public.customers(id) on delete restrict,
  plan_id uuid not null references public.plans(id) on delete restrict,
  status public.subscription_status not null default 'draft',
  start_date date,
  expiry_date date,
  payment_terms int not null default 7 check (payment_terms >= 0),
  next_billing_date date,
  quote_valid_until date,
  template_id uuid references public.quotation_templates(id) on delete set null,
  closed_reason text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index subscriptions_status_next_billing_idx on public.subscriptions (status, next_billing_date);
create index subscriptions_customer_idx on public.subscriptions (customer_id);

create trigger subscriptions_set_updated_at before update on public.subscriptions
  for each row execute function public.set_updated_at();

alter table public.subscriptions enable row level security;

create policy subscriptions_select on public.subscriptions
  for select using (
    public.is_staff_or_admin()
    or customer_id in (select id from public.customers where profile_id = auth.uid())
  );

create policy subscriptions_write_staff on public.subscriptions
  for insert with check (public.is_staff_or_admin());

create policy subscriptions_update on public.subscriptions
  for update using (
    public.is_staff_or_admin()
    or customer_id in (select id from public.customers where profile_id = auth.uid())
  );

create table public.subscription_lines (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  variant_value_ids uuid[] not null default '{}',
  quantity int not null default 1 check (quantity > 0),
  unit_price bigint not null check (unit_price >= 0),
  tax_ids uuid[] not null default '{}',
  amount bigint not null check (amount >= 0)
);

create index subscription_lines_subscription_idx on public.subscription_lines (subscription_id);

alter table public.subscription_lines enable row level security;

create policy subscription_lines_select on public.subscription_lines
  for select using (
    public.is_staff_or_admin()
    or subscription_id in (
      select s.id from public.subscriptions s
      join public.customers c on c.id = s.customer_id
      where c.profile_id = auth.uid()
    )
  );

create policy subscription_lines_write on public.subscription_lines
  for all using (public.is_staff_or_admin()) with check (public.is_staff_or_admin());

create table public.subscription_events (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  from_status public.subscription_status,
  to_status public.subscription_status not null,
  actor uuid references public.profiles(id) on delete set null,
  reason text,
  created_at timestamptz not null default now()
);

create index subscription_events_subscription_idx on public.subscription_events (subscription_id, created_at desc);

alter table public.subscription_events enable row level security;

create policy subscription_events_select on public.subscription_events
  for select using (
    public.is_staff_or_admin()
    or subscription_id in (
      select s.id from public.subscriptions s
      join public.customers c on c.id = s.customer_id
      where c.profile_id = auth.uid()
    )
  );

create policy subscription_events_insert on public.subscription_events
  for insert with check (public.is_staff_or_admin() or true);

-- Legal transition graph for the subscription state machine.
create or replace function public.subscription_transition_allowed(p_from public.subscription_status, p_to public.subscription_status, p_plan_id uuid)
returns boolean language plpgsql stable security definer set search_path = public as $$
declare
  v_allow_pause boolean;
  v_allow_early_close boolean;
  v_allow_renew boolean;
begin
  select allow_pause, allow_early_close, allow_renew
    into v_allow_pause, v_allow_early_close, v_allow_renew
    from public.plans where id = p_plan_id;

  if p_from = p_to then
    return true;
  end if;

  return case
    when p_from = 'draft' and p_to = 'quotation' then true
    when p_from = 'draft' and p_to = 'confirmed' then true
    when p_from = 'quotation' and p_to = 'confirmed' then true
    when p_from = 'quotation' and p_to = 'closed' then true -- quote expired/declined
    when p_from = 'confirmed' and p_to = 'active' then true
    when p_from = 'confirmed' and p_to = 'closed' then true
    when p_from = 'active' and p_to = 'paused' then coalesce(v_allow_pause, false)
    when p_from = 'paused' and p_to = 'active' then coalesce(v_allow_pause, false)
    when p_from = 'active' and p_to = 'closed' then true -- early close gate enforced by caller via reason
    else false
  end;
end;
$$;

create or replace function public.transition_subscription(p_subscription_id uuid, p_to public.subscription_status, p_reason text default null)
returns public.subscriptions language plpgsql security definer set search_path = public as $$
declare
  v_sub public.subscriptions;
  v_plan public.plans;
  v_from public.subscription_status;
begin
  select * into v_sub from public.subscriptions where id = p_subscription_id for update;
  if v_sub is null then
    raise exception 'subscription not found';
  end if;
  v_from := v_sub.status;

  select * into v_plan from public.plans where id = v_sub.plan_id;

  if not public.subscription_transition_allowed(v_sub.status, p_to, v_sub.plan_id) then
    raise exception 'illegal transition from % to %', v_sub.status, p_to;
  end if;

  if v_sub.status = 'active' and p_to = 'closed' and p_reason is distinct from 'expired' and p_reason is distinct from 'quote_expired' then
    if not v_plan.allow_early_close then
      raise exception 'plan does not allow early close';
    end if;
  end if;

  update public.subscriptions
    set status = p_to,
        closed_reason = case when p_to = 'closed' then p_reason else closed_reason end,
        start_date = case when p_to = 'active' and start_date is null then current_date else start_date end,
        next_billing_date = case when p_to = 'active' and next_billing_date is null then current_date else next_billing_date end
    where id = p_subscription_id
    returning * into v_sub;

  insert into public.subscription_events (subscription_id, from_status, to_status, actor, reason)
  values (p_subscription_id, v_from, p_to, auth.uid(), p_reason);

  return v_sub;
end;
$$;
