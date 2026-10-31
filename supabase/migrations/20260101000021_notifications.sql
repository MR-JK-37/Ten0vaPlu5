-- Wires the notifications table (which existed from the original schema but nothing wrote
-- to it) to the two events AGENTS.md section 8.6 calls out: payment received (staff) /
-- payment confirmed (customer), and quote accepted (staff). Both are triggers, so they
-- fire regardless of whether the write came from the app, a script, or a webhook.

create or replace function public.notify_on_payment()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_invoice public.invoices;
  v_customer public.customers;
begin
  if new.status = 'confirmed' and (old is null or old.status is distinct from 'confirmed') then
    select * into v_invoice from public.invoices where id = new.invoice_id;
    select * into v_customer from public.customers where id = v_invoice.customer_id;

    insert into public.notifications (role, type, title, body, link)
    values ('staff', 'payment_received', 'Payment received',
            v_customer.name || ' paid ' || v_invoice.number, '/staff/payments');

    if v_customer.profile_id is not null then
      insert into public.notifications (user_id, type, title, body, link)
      values (v_customer.profile_id, 'payment_confirmed', 'Payment confirmed',
              'Your payment for ' || v_invoice.number || ' was confirmed.', '/portal/invoices');
    end if;
  end if;
  return new;
end;
$$;

create trigger payments_notify after insert or update on public.payments
  for each row execute function public.notify_on_payment();

create or replace function public.notify_on_subscription_event()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_sub public.subscriptions;
  v_customer public.customers;
begin
  if new.from_status = 'quotation' and new.to_status = 'confirmed' then
    select * into v_sub from public.subscriptions where id = new.subscription_id;
    select * into v_customer from public.customers where id = v_sub.customer_id;

    insert into public.notifications (role, type, title, body, link)
    values ('staff', 'quote_accepted', 'Quote accepted',
            v_customer.name || ' accepted the quote for ' || v_sub.number, '/staff/subscriptions');
  end if;
  return new;
end;
$$;

create trigger subscription_events_notify after insert on public.subscription_events
  for each row execute function public.notify_on_subscription_event();
