-- Advance a billing anchor date by one period, clamping month/year overflow to the last
-- valid day of the target month (e.g. Jan 31 monthly -> Feb 28/29, not Mar 2/3).
create or replace function public.advance_period(p_date date, p_period public.billing_period)
returns date language plpgsql as $$
declare
  v_target_month_first date;
  v_last_day_of_target date;
  v_day int;
  v_year int;
  v_month int;
  v_last_day int;
begin
  case p_period
    when 'daily' then return p_date + 1;
    when 'weekly' then return p_date + 7;
    when 'monthly' then
      v_target_month_first := (date_trunc('month', p_date) + interval '1 month')::date;
      v_last_day_of_target := (v_target_month_first + interval '1 month - 1 day')::date;
      v_day := extract(day from p_date);
      return least(v_target_month_first + (v_day - 1), v_last_day_of_target);
    when 'yearly' then
      v_year := extract(year from p_date) + 1;
      v_month := extract(month from p_date);
      v_last_day := extract(day from ((make_date(v_year, v_month, 1) + interval '1 month - 1 day')::date));
      v_day := least(extract(day from p_date)::int, v_last_day);
      return make_date(v_year, v_month, v_day);
  end case;
end;
$$;

-- Computes totals for one invoice from a snapshot of subscription lines, applying the
-- single best-saving eligible discount (non-stackable) before tax.
create or replace function public.compute_invoice_totals(p_subscription_id uuid)
returns table (
  subtotal bigint,
  discount_total bigint,
  tax_total bigint,
  total bigint,
  applied_discount_id uuid
) language plpgsql security definer set search_path = public as $$
declare
  v_subtotal bigint := 0;
  v_quantity int := 0;
  v_best_discount record;
  v_discount_total bigint := 0;
  v_tax_total bigint := 0;
  v_rec record;
  v_line_discount bigint;
  v_taxable bigint;
  v_line_tax bigint;
  v_rate record;
begin
  select coalesce(sum(sl.amount), 0), coalesce(sum(sl.quantity), 0)
    into v_subtotal, v_quantity
    from public.subscription_lines sl where sl.subscription_id = p_subscription_id;

  -- Best single discount: highest absolute saving among eligible, applicable discounts.
  select d.id,
         case when d.kind = 'percent' then (v_subtotal * d.value / 100)::bigint else least(d.value::bigint, v_subtotal) end as saving
    into v_best_discount
    from public.discounts d
    where public.discount_is_eligible(d.id, current_date)
      and (
        (d.applies_to = 'subscriptions' and p_subscription_id = any(d.subscription_ids))
        or (d.applies_to = 'products' and exists (
          select 1 from public.subscription_lines sl
          where sl.subscription_id = p_subscription_id and sl.product_id = any(d.product_ids)
        ))
      )
      and (d.min_purchase is null or v_subtotal >= d.min_purchase)
      and (d.min_quantity is null or v_quantity >= d.min_quantity)
    order by saving desc
    limit 1;

  if v_best_discount.id is not null then
    v_discount_total := v_best_discount.saving;
  end if;

  v_taxable := v_subtotal - v_discount_total;

  -- Tax is computed per-line proportionally against each line's own tax_ids; approximate
  -- by applying each line's taxes to its own (discount-prorated) taxable amount.
  for v_rec in
    select sl.*, (sl.amount - (sl.amount::numeric / greatest(v_subtotal,1) * v_discount_total))::bigint as line_taxable
    from public.subscription_lines sl where sl.subscription_id = p_subscription_id
  loop
    v_line_tax := 0;
    for v_rate in select * from public.taxes where id = any(v_rec.tax_ids) and is_active loop
      if v_rate.type = 'percent' then
        v_line_tax := v_line_tax + round(v_rec.line_taxable * v_rate.rate / 100);
      else
        v_line_tax := v_line_tax + v_rate.rate::bigint;
      end if;
    end loop;
    v_tax_total := v_tax_total + v_line_tax;
  end loop;

  return query select v_subtotal, v_discount_total, v_tax_total, (v_taxable + v_tax_total), v_best_discount.id;
end;
$$;

-- The billing engine. Catches up every missed period for every active, due subscription in
-- one transaction per subscription, never billing the same (subscription_id, period_start)
-- twice thanks to the unique constraint + ON CONFLICT DO NOTHING.
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
