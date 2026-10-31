create type public.payment_method as enum ('cash', 'bank_transfer', 'cheque', 'card', 'upi', 'youpi', 'other');
create type public.payment_status as enum ('pending', 'confirmed', 'failed', 'refunded');

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete restrict,
  method public.payment_method not null,
  amount bigint not null check (amount > 0),
  paid_on date not null default current_date,
  note text,
  reference text,
  provider text,
  provider_payment_id text,
  status public.payment_status not null default 'pending',
  verification_level int not null default 0,
  recorded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index payments_invoice_idx on public.payments (invoice_id);
create index payments_paid_on_idx on public.payments (paid_on);
create unique index payments_provider_payment_id_idx on public.payments (provider, provider_payment_id) where provider_payment_id is not null;

create trigger payments_set_updated_at before update on public.payments
  for each row execute function public.set_updated_at();

alter table public.payments enable row level security;

create policy payments_select on public.payments
  for select using (
    public.is_staff_or_admin()
    or invoice_id in (
      select i.id from public.invoices i
      join public.customers c on c.id = i.customer_id
      where c.profile_id = auth.uid()
    )
  );

create policy payments_write on public.payments
  for all using (public.is_staff_or_admin()) with check (public.is_staff_or_admin());

create table public.payment_attempts (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  provider text not null,
  order_id text not null,
  attempt_number int not null default 1,
  amount bigint not null,
  checkout_url text,
  provider_payment_id text,
  status text not null default 'INITIATED',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index payment_attempts_order_id_idx on public.payment_attempts (provider, order_id);
create index payment_attempts_invoice_idx on public.payment_attempts (invoice_id);

alter table public.payment_attempts enable row level security;

create policy payment_attempts_select on public.payment_attempts
  for select using (
    public.is_staff_or_admin()
    or invoice_id in (
      select i.id from public.invoices i
      join public.customers c on c.id = i.customer_id
      where c.profile_id = auth.uid()
    )
  );

create policy payment_attempts_write on public.payment_attempts
  for all using (public.is_staff_or_admin()) with check (public.is_staff_or_admin());

create table public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  delivery_id text not null,
  provider text not null,
  payload jsonb not null,
  signature_ok boolean not null,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index webhook_events_delivery_idx on public.webhook_events (provider, delivery_id);

alter table public.webhook_events enable row level security;
-- No client policies: this table is written only by the server (service role) via the webhook handler.

-- Idempotent payment recording, used by both manual entry and the webhook handler.
-- Idempotency on provider_payment_id for online payments: a retried webhook with the same
-- provider_payment_id is a no-op the second time.
create or replace function public.record_payment(
  p_invoice_id uuid,
  p_method public.payment_method,
  p_amount bigint,
  p_status public.payment_status,
  p_provider text default null,
  p_provider_payment_id text default null,
  p_reference text default null,
  p_note text default null,
  p_verification_level int default 0,
  p_recorded_by uuid default null
)
returns public.payments language plpgsql security definer set search_path = public as $$
declare
  v_existing public.payments;
  v_payment public.payments;
begin
  if p_provider_payment_id is not null then
    select * into v_existing from public.payments
      where provider = p_provider and provider_payment_id = p_provider_payment_id;
    if v_existing is not null then
      return v_existing; -- already recorded, idempotent no-op
    end if;
  end if;

  insert into public.payments (invoice_id, method, amount, status, provider, provider_payment_id, reference, note, verification_level, recorded_by)
  values (p_invoice_id, p_method, p_amount, p_status, p_provider, p_provider_payment_id, p_reference, p_note, p_verification_level, p_recorded_by)
  returning * into v_payment;

  if p_status = 'confirmed' then
    update public.invoices
      set amount_paid = amount_paid + p_amount
      where id = p_invoice_id;
  end if;

  return v_payment;
end;
$$;
