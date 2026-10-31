create type public.billing_period as enum ('daily', 'weekly', 'monthly', 'yearly');

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  product_id uuid references public.products(id) on delete set null,
  price bigint not null check (price >= 0),
  billing_period public.billing_period not null,
  min_quantity int not null default 1 check (min_quantity >= 1),
  available_from date not null default current_date,
  available_to date,
  auto_close_on_end boolean not null default true,
  allow_early_close boolean not null default false,
  allow_pause boolean not null default false,
  allow_renew boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint plans_availability_window check (available_to is null or available_to >= available_from)
);

create index plans_active_idx on public.plans (is_active, available_from, available_to);

create trigger plans_set_updated_at before update on public.plans
  for each row execute function public.set_updated_at();

alter table public.plans enable row level security;

create policy plans_select on public.plans
  for select using (public.is_staff_or_admin() or (is_active and current_date >= available_from and (available_to is null or current_date <= available_to)));

create policy plans_write on public.plans
  for all using (public.is_admin()) with check (public.is_admin());

-- Closes plans whose availability window has ended and auto_close_on_end is set.
create or replace function public.close_expired_plans()
returns void language sql security definer set search_path = public as $$
  update public.plans
    set is_active = false
    where is_active and auto_close_on_end and available_to is not null and available_to < current_date;
$$;
