-- "Renew (new term, new expiry, continues billing) only if plan.allow_renew" (AGENTS.md
-- section 6) is a distinct operation from the status state machine -- it extends
-- expiry_date rather than changing status. Choice: one renewal extends expiry_date by one
-- year from its current value (or from today if there was no expiry_date yet). Documented
-- in docs/DECISIONS.md since the spec doesn't pin down the exact term length.
create or replace function public.renew_subscription(p_subscription_id uuid)
returns public.subscriptions language plpgsql security definer set search_path = public as $$
declare
  v_sub public.subscriptions;
  v_plan public.plans;
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

  select * into v_plan from public.plans where id = v_sub.plan_id;
  if not v_plan.allow_renew then
    raise exception 'plan does not allow renewal';
  end if;
  if v_sub.status not in ('active', 'paused') then
    raise exception 'only an active or paused subscription can be renewed';
  end if;

  update public.subscriptions
    set expiry_date = (coalesce(expiry_date, current_date) + interval '1 year')::date
    where id = p_subscription_id
    returning * into v_sub;

  insert into public.subscription_events (subscription_id, from_status, to_status, actor, reason)
  values (p_subscription_id, v_sub.status, v_sub.status, auth.uid(), 'renewed');

  return v_sub;
end;
$$;
