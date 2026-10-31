create table public.customers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  company text,
  billing_address text,
  tax_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index customers_profile_id_idx on public.customers (profile_id) where profile_id is not null;
create index customers_email_idx on public.customers (lower(email));

alter table public.customers enable row level security;

create trigger customers_set_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

create policy customers_select on public.customers
  for select using (public.is_staff_or_admin() or profile_id = auth.uid());

create policy customers_insert on public.customers
  for insert with check (public.is_staff_or_admin());

create policy customers_update on public.customers
  for update using (public.is_staff_or_admin() or profile_id = auth.uid());

create policy customers_delete on public.customers
  for delete using (public.is_admin());
