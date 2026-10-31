create type public.invoice_status as enum ('draft', 'confirmed', 'paid', 'cancelled');

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  subscription_id uuid not null references public.subscriptions(id) on delete restrict,
  customer_id uuid not null references public.customers(id) on delete restrict,
  period_start date not null,
  period_end date not null,
  issue_date date not null default current_date,
  due_date date not null,
  status public.invoice_status not null default 'draft',
  subtotal bigint not null default 0,
  discount_total bigint not null default 0,
  tax_total bigint not null default 0,
  total bigint not null default 0,
  amount_paid bigint not null default 0,
  amount_due bigint generated always as (total - amount_paid) stored,
  sent_at timestamptz,
  applied_discount_id uuid references public.discounts(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invoices_subscription_period_unique unique (subscription_id, period_start)
);

create index invoices_status_due_idx on public.invoices (status, due_date);
create index invoices_customer_created_idx on public.invoices (customer_id, created_at desc);

create trigger invoices_set_updated_at before update on public.invoices
  for each row execute function public.set_updated_at();

alter table public.invoices enable row level security;

create policy invoices_select on public.invoices
  for select using (
    public.is_staff_or_admin()
    or customer_id in (select id from public.customers where profile_id = auth.uid())
  );

create policy invoices_write on public.invoices
  for all using (public.is_staff_or_admin()) with check (public.is_staff_or_admin());

create table public.invoice_lines (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  description text not null,
  quantity int not null check (quantity > 0),
  unit_price bigint not null check (unit_price >= 0),
  discount_amount bigint not null default 0,
  tax_amount bigint not null default 0,
  amount bigint not null
);

create index invoice_lines_invoice_idx on public.invoice_lines (invoice_id);

alter table public.invoice_lines enable row level security;

create policy invoice_lines_select on public.invoice_lines
  for select using (
    public.is_staff_or_admin()
    or invoice_id in (
      select i.id from public.invoices i
      join public.customers c on c.id = i.customer_id
      where c.profile_id = auth.uid()
    )
  );

create policy invoice_lines_write on public.invoice_lines
  for all using (public.is_staff_or_admin()) with check (public.is_staff_or_admin());

-- "paid" is only ever set by the trigger below, never directly by the application.
create or replace function public.sync_invoice_paid_status()
returns trigger language plpgsql as $$
begin
  if new.status <> 'cancelled' then
    if new.amount_paid >= new.total and new.total > 0 then
      new.status := 'paid';
    elsif new.status = 'paid' and new.amount_paid < new.total then
      new.status := 'confirmed';
    end if;
  end if;
  return new;
end;
$$;

create trigger invoices_sync_paid before insert or update on public.invoices
  for each row execute function public.sync_invoice_paid_status();

create or replace function public.invoice_confirm(p_invoice_id uuid)
returns public.invoices language sql security definer set search_path = public as $$
  update public.invoices set status = 'confirmed' where id = p_invoice_id and status = 'draft'
  returning *;
$$;

create or replace function public.invoice_cancel(p_invoice_id uuid)
returns public.invoices language plpgsql security definer set search_path = public as $$
declare
  v_invoice public.invoices;
  v_discount_id uuid;
begin
  select * into v_invoice from public.invoices where id = p_invoice_id for update;
  if v_invoice is null then
    raise exception 'invoice not found';
  end if;
  if v_invoice.status not in ('draft', 'confirmed') or v_invoice.amount_paid > 0 then
    raise exception 'only an unpaid draft/confirmed invoice can be cancelled';
  end if;

  v_discount_id := v_invoice.applied_discount_id;

  update public.invoices set status = 'cancelled' where id = p_invoice_id returning * into v_invoice;

  if v_discount_id is not null then
    update public.discounts set times_used = greatest(times_used - 1, 0) where id = v_discount_id;
  end if;

  return v_invoice;
end;
$$;
