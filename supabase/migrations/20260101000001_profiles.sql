-- Roles, profiles, and the trigger that stops anyone but an admin from changing role.

create extension if not exists "pgcrypto";

create type public.app_role as enum ('admin', 'staff', 'customer');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role public.app_role not null default 'customer',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index profiles_email_lower_idx on public.profiles (lower(email));

alter table public.profiles enable row level security;

-- Helper: current user's role, stable within a statement.
create or replace function public.current_role_name()
returns public.app_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.is_staff_or_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role in ('admin','staff') from public.profiles where id = auth.uid()), false);
$$;

-- A profile row is created automatically when a user signs up (see handle_new_user trigger
-- in 0001a). Public sign-up never gets to set role directly through this table.
create or replace function public.prevent_role_self_escalation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'update' and new.role <> old.role then
    if not public.is_admin() then
      raise exception 'only an admin may change a profile role';
    end if;
  end if;
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_role_guard
  before update on public.profiles
  for each row execute function public.prevent_role_self_escalation();

create policy profiles_select_own on public.profiles
  for select using (id = auth.uid() or public.is_staff_or_admin());

create policy profiles_update_own on public.profiles
  for update using (id = auth.uid() or public.is_admin());

create policy profiles_admin_insert on public.profiles
  for insert with check (public.is_admin() or id = auth.uid());

create policy profiles_admin_delete on public.profiles
  for delete using (public.is_admin());
