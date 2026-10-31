create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Numbering: gaps allowed, duplicates never. One sequence per prefix per year.
create table public.sequences (
  prefix text not null,
  year int not null,
  last_value bigint not null default 0,
  primary key (prefix, year)
);

create or replace function public.next_number(p_prefix text, p_width int default 5)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_year int := extract(year from now());
  v_value bigint;
begin
  insert into public.sequences (prefix, year, last_value)
  values (p_prefix, v_year, 1)
  on conflict (prefix, year) do update set last_value = public.sequences.last_value + 1
  returning last_value into v_value;

  return p_prefix || '-' || v_year || '-' || lpad(v_value::text, p_width, '0');
end;
$$;
