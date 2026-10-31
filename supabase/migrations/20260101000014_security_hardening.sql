-- Fixes for authorization gaps found by automated review of the initial schema commit:
--
-- 1. record_payment/invoice_confirm/invoice_cancel/run_billing were SECURITY DEFINER with no
--    internal authorization check, so any authenticated (or even anon) user could call them
--    directly as an RPC and record arbitrary payments, confirm/cancel invoices, or trigger a
--    billing run. Fix: gate each on is_staff_or_admin() OR auth.role() = 'service_role' (the
--    latter is what the YouPI webhook handler and the pg_cron/GitHub Actions billing trigger
--    use — they have no end-user session, but they do carry the service-role JWT, which only
--    the server ever holds).
-- 2. transition_subscription had the same gap, but customers legitimately drive some
--    transitions themselves (accept a quote, pause/close/renew, where the plan allows), so
--    the gate also allows the owning customer.
-- 3. subscriptions_update RLS let a customer UPDATE any column on their own subscription row
--    directly via PostgREST, bypassing the state machine entirely. Fix: customers can no
--    longer UPDATE the table directly at all; every customer-initiated change must go
--    through transition_subscription(), which is SECURITY DEFINER and enforces the legal
--    transition graph.
-- 4. subscription_events_insert, audit_log_insert, and notifications_write all had a
--    `with check (... or true)` / `with check (true)`, which let any authenticated client
--    forge timeline events, audit log entries, or notifications (including impersonating
--    another user/role). The actual writers are all SECURITY DEFINER functions/triggers
--    owned by postgres, which bypass RLS entirely — so these policies only ever needed to
--    block direct client writes, never to allow them.

create or replace function public.transition_subscription(p_subscription_id uuid, p_to public.subscription_status, p_reason text default null)
returns public.subscriptions language plpgsql security definer set search_path = public as $$
declare
  v_sub public.subscriptions;
  v_plan public.plans;
  v_from public.subscription_status;
  v_is_owner boolean;
begin
  select * into v_sub from public.subscriptions where id = p_subscription_id for update;
  if v_sub is null then
    raise exception 'subscription not found';
  end if;

  select exists (
    select 1 from public.customers c where c.id = v_sub.customer_id and c.profile_id = auth.uid()
  ) into v_is_owner;

  if not (public.is_staff_or_admin() or v_is_owner or auth.role() = 'service_role') then
    raise exception 'forbidden';
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

drop policy if exists subscriptions_update on public.subscriptions;
create policy subscriptions_update on public.subscriptions
  for update using (public.is_staff_or_admin()) with check (public.is_staff_or_admin());

drop policy if exists subscription_events_insert on public.subscription_events;
create policy subscription_events_insert on public.subscription_events
  for insert with check (public.is_staff_or_admin());

create or replace function public.invoice_confirm(p_invoice_id uuid)
returns public.invoices language plpgsql security definer set search_path = public as $$
declare
  v_invoice public.invoices;
begin
  if not (public.is_staff_or_admin() or auth.role() = 'service_role') then
    raise exception 'forbidden';
  end if;

  update public.invoices set status = 'confirmed' where id = p_invoice_id and status = 'draft'
    returning * into v_invoice;
  return v_invoice;
end;
$$;

create or replace function public.invoice_cancel(p_invoice_id uuid)
returns public.invoices language plpgsql security definer set search_path = public as $$
declare
  v_invoice public.invoices;
  v_discount_id uuid;
begin
  if not (public.is_staff_or_admin() or auth.role() = 'service_role') then
    raise exception 'forbidden';
  end if;

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
  if not (public.is_staff_or_admin() or auth.role() = 'service_role') then
    raise exception 'forbidden';
  end if;

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

create or replace function public.run_billing(p_as_of date default current_date, p_dry_run boolean default false)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_run_id uuid;
  v_sub record;
  v_plan record;
  v_cursor date;
  v_period_end date;
  v_due_date date;
  v_invoice_id uuid;
  v_totals record;
  v_created_count int := 0;
  v_skipped_count int := 0;
  v_due_count int := 0;
begin
  if not (public.is_staff_or_admin() or auth.role() = 'service_role') then
    raise exception 'forbidden';
  end if;

  insert into public.billing_runs (as_of, dry_run, started_by)
  values (p_as_of, p_dry_run, auth.uid())
  returning id into v_run_id;

  for v_sub in
    select * from public.subscriptions
    where status = 'active' and next_billing_date is not null and next_billing_date <= p_as_of
    order by id
    for update skip locked
  loop
    v_due_count := v_due_count + 1;
    select * into v_plan from public.plans where id = v_sub.plan_id;
    v_cursor := v_sub.next_billing_date;

    while v_cursor <= p_as_of and (v_sub.expiry_date is null or v_cursor <= v_sub.expiry_date) loop
      v_period_end := public.advance_period(v_cursor, v_plan.billing_period) - 1;
      v_due_date := v_cursor + v_sub.payment_terms;

      if p_dry_run then
        insert into public.billing_run_items (billing_run_id, subscription_id, outcome, detail)
        values (v_run_id, v_sub.id, 'would_create', 'period ' || v_cursor || ' to ' || v_period_end);
        v_created_count := v_created_count + 1;
      else
        select * into v_totals from public.compute_invoice_totals(v_sub.id);

        insert into public.invoices (
          number, subscription_id, customer_id, period_start, period_end, issue_date, due_date,
          subtotal, discount_total, tax_total, total, applied_discount_id
        ) values (
          public.next_number('INV'), v_sub.id, v_sub.customer_id, v_cursor, v_period_end, p_as_of, v_due_date,
          v_totals.subtotal, v_totals.discount_total, v_totals.tax_total, v_totals.total, v_totals.applied_discount_id
        )
        on conflict (subscription_id, period_start) do nothing
        returning id into v_invoice_id;

        if v_invoice_id is not null then
          insert into public.invoice_lines (invoice_id, product_id, description, quantity, unit_price, amount, tax_amount)
          select v_invoice_id, sl.product_id, p.name, sl.quantity, sl.unit_price, sl.amount, 0
          from public.subscription_lines sl join public.products p on p.id = sl.product_id
          where sl.subscription_id = v_sub.id;

          if v_totals.applied_discount_id is not null then
            update public.discounts set times_used = times_used + 1 where id = v_totals.applied_discount_id;
          end if;

          insert into public.billing_run_items (billing_run_id, subscription_id, invoice_id, outcome)
          values (v_run_id, v_sub.id, v_invoice_id, 'created');
          v_created_count := v_created_count + 1;
        else
          insert into public.billing_run_items (billing_run_id, subscription_id, outcome, detail)
          values (v_run_id, v_sub.id, 'skipped_duplicate', 'period ' || v_cursor);
          v_skipped_count := v_skipped_count + 1;
        end if;
      end if;

      v_cursor := public.advance_period(v_cursor, v_plan.billing_period);
    end loop;

    if not p_dry_run then
      if v_sub.expiry_date is not null and v_cursor > v_sub.expiry_date then
        perform public.transition_subscription(v_sub.id, 'closed', 'expired');
      else
        update public.subscriptions set next_billing_date = v_cursor where id = v_sub.id;
      end if;
    end if;
  end loop;

  update public.billing_runs
    set finished_at = now(), status = 'completed', due_count = v_due_count,
        created_count = v_created_count, skipped_count = v_skipped_count
    where id = v_run_id;

  return v_run_id;
end;
$$;

drop policy if exists audit_log_insert on public.audit_log;
create policy audit_log_insert on public.audit_log for insert with check (false);

drop policy if exists notifications_write on public.notifications;
create policy notifications_write on public.notifications
  for insert with check (public.is_staff_or_admin());
