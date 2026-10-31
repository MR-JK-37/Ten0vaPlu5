create type public.tax_type as enum ('percent', 'fixed');
create type public.discount_kind as enum ('fixed', 'percent');
create type public.applies_to as enum ('all', 'product');
create type public.discount_applies_to as enum ('products', 'subscriptions');

create table public.taxes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type public.tax_type not null,
  rate numeric(10, 4) not null check (rate >= 0),
  applies_to public.applies_to not null default 'all',
  product_ids uuid[] not null default '{}',
  is_active boolean not null default true,
  valid_from date not null default current_date,
  valid_to date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger taxes_set_updated_at before update on public.taxes
  for each row execute function public.set_updated_at();

alter table public.taxes enable row level security;

create policy taxes_select on public.taxes for select using (public.is_staff_or_admin());
create policy taxes_write on public.taxes for all using (public.is_admin()) with check (public.is_admin());

create table public.discounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind public.discount_kind not null,
  value numeric(12, 2) not null check (value >= 0),
  min_purchase bigint,
  min_quantity int,
  valid_from date not null default current_date,
  valid_to date,
  usage_limit int,
  times_used int not null default 0,
  applies_to public.discount_applies_to not null default 'products',
  product_ids uuid[] not null default '{}',
  subscription_ids uuid[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index discounts_active_idx on public.discounts (is_active, valid_from, valid_to);

create trigger discounts_set_updated_at before update on public.discounts
  for each row execute function public.set_updated_at();

alter table public.discounts enable row level security;

create policy discounts_select on public.discounts for select using (public.is_staff_or_admin());
create policy discounts_write on public.discounts for all using (public.is_admin()) with check (public.is_admin());

-- A discount is currently eligible to apply (date window + usage limit), independent of the
-- amount/qty thresholds which are checked per-line by the billing engine.
create or replace function public.discount_is_eligible(p_discount_id uuid, p_as_of date)
returns boolean language sql stable security definer set search_path = public as $$
  select is_active
    and p_as_of >= valid_from
    and (valid_to is null or p_as_of <= valid_to)
    and (usage_limit is null or times_used < usage_limit)
  from public.discounts where id = p_discount_id;
$$;
