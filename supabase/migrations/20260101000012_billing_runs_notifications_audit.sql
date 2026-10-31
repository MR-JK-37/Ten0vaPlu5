create table public.billing_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  as_of date not null,
  dry_run boolean not null default false,
  status text not null default 'running',
  due_count int not null default 0,
  created_count int not null default 0,
  skipped_count int not null default 0,
  error_count int not null default 0,
  started_by uuid references public.profiles(id) on delete set null
);

alter table public.billing_runs enable row level security;

create policy billing_runs_select on public.billing_runs for select using (public.is_staff_or_admin());
create policy billing_runs_write on public.billing_runs for all using (public.is_staff_or_admin()) with check (public.is_staff_or_admin());

create table public.billing_run_items (
  id uuid primary key default gen_random_uuid(),
  billing_run_id uuid not null references public.billing_runs(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  invoice_id uuid references public.invoices(id) on delete set null,
  outcome text not null,
  detail text,
  created_at timestamptz not null default now()
);

create index billing_run_items_run_idx on public.billing_run_items (billing_run_id);

alter table public.billing_run_items enable row level security;

create policy billing_run_items_select on public.billing_run_items for select using (public.is_staff_or_admin());
create policy billing_run_items_write on public.billing_run_items for all using (public.is_staff_or_admin()) with check (public.is_staff_or_admin());

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  role public.app_role,
  type text not null,
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

create policy notifications_select on public.notifications
  for select using (user_id = auth.uid() or (role is not null and role = public.current_role_name()));

create policy notifications_update_own on public.notifications
  for update using (user_id = auth.uid());

create policy notifications_write on public.notifications
  for insert with check (public.is_staff_or_admin() or true);

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor uuid references public.profiles(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id uuid,
  before jsonb,
  after jsonb,
  at timestamptz not null default now()
);

create index audit_log_entity_idx on public.audit_log (entity, entity_id);

alter table public.audit_log enable row level security;

create policy audit_log_select on public.audit_log
  for select using (public.is_admin() or actor = auth.uid());

create policy audit_log_insert on public.audit_log
  for insert with check (true);

create or replace function public.write_audit_log()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.audit_log (actor, action, entity, entity_id, before, after)
  values (
    auth.uid(),
    tg_op,
    tg_table_name,
    coalesce((case when tg_op = 'DELETE' then old.id else new.id end), null),
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('UPDATE', 'INSERT') then to_jsonb(new) else null end
  );
  return coalesce(new, old);
end;
$$;

create trigger audit_subscriptions after insert or update or delete on public.subscriptions
  for each row execute function public.write_audit_log();
create trigger audit_invoices after insert or update or delete on public.invoices
  for each row execute function public.write_audit_log();
create trigger audit_payments after insert or update or delete on public.payments
  for each row execute function public.write_audit_log();
create trigger audit_plans after insert or update or delete on public.plans
  for each row execute function public.write_audit_log();
create trigger audit_taxes after insert or update or delete on public.taxes
  for each row execute function public.write_audit_log();
create trigger audit_discounts after insert or update or delete on public.discounts
  for each row execute function public.write_audit_log();
create trigger audit_profiles after update on public.profiles
  for each row execute function public.write_audit_log();
