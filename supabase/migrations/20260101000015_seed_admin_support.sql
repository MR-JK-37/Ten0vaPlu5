-- pnpm seed:admin promotes the seed account to 'admin' using the service-role key, which has
-- no end-user session (auth.uid() is null). The original guard only allowed an existing
-- admin (via auth.uid()) to change role, which would have blocked the seed script itself.
create or replace function public.prevent_role_self_escalation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'update' and new.role <> old.role then
    if not (public.is_admin() or auth.role() = 'service_role') then
      raise exception 'only an admin may change a profile role';
    end if;
  end if;
  new.updated_at = now();
  return new;
end;
$$;
