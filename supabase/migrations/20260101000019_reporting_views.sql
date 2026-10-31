-- Reporting aggregates, all computed in SQL per AGENTS.md section 10 ("All numbers come
-- from SQL aggregates/views -- never client-side sums over big lists").

create or replace function public.invoice_ageing_buckets()
returns table (bucket text, invoice_count bigint, total_due bigint)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_staff_or_admin() then
    raise exception 'forbidden';
  end if;

  return query
  select
    case
      when current_date - due_date between 0 and 30 then '1-30'
      when current_date - due_date between 31 and 60 then '31-60'
      when current_date - due_date between 61 and 90 then '61-90'
      else '90+'
    end as bucket,
    count(*)::bigint,
    sum(amount_due)::bigint
  from public.invoices
  where status = 'confirmed' and due_date < current_date and amount_due > 0
  group by 1
  order by 1;
end;
$$;

create or replace function public.revenue_by_month(p_months int default 6)
returns table (month date, revenue bigint)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_staff_or_admin() then
    raise exception 'forbidden';
  end if;

  return query
  select date_trunc('month', paid_on)::date as month, sum(amount)::bigint
  from public.payments
  where status = 'confirmed' and paid_on >= (current_date - (p_months || ' months')::interval)
  group by 1
  order by 1;
end;
$$;
