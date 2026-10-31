create type public.product_type as enum ('service', 'software', 'addon', 'physical');

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type public.product_type not null,
  sales_price bigint not null check (sales_price >= 0),
  cost_price bigint not null default 0 check (cost_price >= 0),
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger products_set_updated_at before update on public.products
  for each row execute function public.set_updated_at();

alter table public.products enable row level security;

create policy products_select on public.products
  for select using (public.is_staff_or_admin() or is_active);

create policy products_write on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- Product attributes, e.g. "Brand", and their selectable values with a price delta.
create table public.product_attributes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create index product_attributes_product_idx on public.product_attributes (product_id);

alter table public.product_attributes enable row level security;

create policy product_attributes_select on public.product_attributes
  for select using (true);

create policy product_attributes_write on public.product_attributes
  for all using (public.is_admin()) with check (public.is_admin());

create table public.product_variant_values (
  id uuid primary key default gen_random_uuid(),
  attribute_id uuid not null references public.product_attributes(id) on delete cascade,
  value text not null,
  extra_price bigint not null default 0,
  created_at timestamptz not null default now()
);

create index product_variant_values_attribute_idx on public.product_variant_values (attribute_id);

alter table public.product_variant_values enable row level security;

create policy product_variant_values_select on public.product_variant_values
  for select using (true);

create policy product_variant_values_write on public.product_variant_values
  for all using (public.is_admin()) with check (public.is_admin());

-- Effective unit price for a product given a set of chosen variant value ids.
create or replace function public.product_effective_price(p_product_id uuid, p_variant_value_ids uuid[])
returns bigint language sql stable security definer set search_path = public as $$
  select (select sales_price from public.products where id = p_product_id)
       + coalesce((
           select sum(extra_price) from public.product_variant_values
           where id = any(p_variant_value_ids)
         ), 0);
$$;
