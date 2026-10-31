-- Critical fix found by the RLS test matrix (tests/rls/matrix.ts): tg_op is the uppercase
-- string 'UPDATE', not 'update'. The guard's `if tg_op = 'update'` was therefore always
-- false, so the entire role-change check never ran and ANY authenticated user — including
-- a customer — could UPDATE their own profiles.role to 'admin' with no error. Verified the
-- bug directly in psql before this fix (is_admin()=false, auth.role()='authenticated', yet
-- the UPDATE still silently succeeded), and verified the fix closes it (same scenario now
-- raises and the matrix check passes).
create or replace function public.prevent_role_self_escalation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE' and new.role <> old.role then
    if not (public.is_admin() or auth.role() = 'service_role') then
      raise exception 'only an admin may change a profile role';
    end if;
  end if;
  new.updated_at = now();
  return new;
end;
$$;
