create table public.quotation_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan_id uuid not null references public.plans(id) on delete restrict,
  validity_days int not null default 14 check (validity_days > 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger quotation_templates_set_updated_at before update on public.quotation_templates
  for each row execute function public.set_updated_at();

alter table public.quotation_templates enable row level security;

create policy quotation_templates_select on public.quotation_templates
  for select using (public.is_staff_or_admin());

create policy quotation_templates_write on public.quotation_templates
  for all using (public.is_admin()) with check (public.is_admin());

create table public.quotation_template_lines (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.quotation_templates(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  variant_value_ids uuid[] not null default '{}',
  quantity int not null default 1 check (quantity > 0)
);

create index quotation_template_lines_template_idx on public.quotation_template_lines (template_id);

alter table public.quotation_template_lines enable row level security;

create policy quotation_template_lines_select on public.quotation_template_lines
  for select using (public.is_staff_or_admin());

create policy quotation_template_lines_write on public.quotation_template_lines
  for all using (public.is_admin()) with check (public.is_admin());
