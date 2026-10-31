-- Public sign-up always lands as 'customer', regardless of any role field the client sends.
-- This trigger is the enforcement point: it reads only email/full_name from user metadata
-- and never reads a "role" key, so a crafted sign-up payload cannot self-promote.

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    lower(new.email),
    new.raw_user_meta_data ->> 'full_name',
    'customer'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
