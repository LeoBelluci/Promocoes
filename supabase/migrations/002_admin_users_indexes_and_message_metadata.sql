create extension if not exists pgcrypto;
create extension if not exists citext;

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email citext not null unique,
  password_hash text not null,
  role text not null default 'admin',
  created_at timestamp default now(),
  updated_at timestamp default now(),
  constraint admin_users_role_check
    check (role in ('admin', 'manager', 'viewer'))
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_admin_users_updated_at on public.admin_users;

create trigger set_admin_users_updated_at
before update on public.admin_users
for each row
execute function public.set_updated_at();

alter table public.admin_users enable row level security;

grant select, insert, update, delete on table public.admin_users to service_role;

alter table public.sent_messages
  add column if not exists trigger_type text not null default 'manual';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'sent_messages_trigger_type_check'
  ) then
    alter table public.sent_messages
      add constraint sent_messages_trigger_type_check
      check (trigger_type in ('manual', 'automatic'));
  end if;
end;
$$;

create index if not exists admin_users_email_idx
  on public.admin_users (email);

create index if not exists product_promotions_sku_idx
  on public.product_promotions (sku);

create index if not exists product_promotions_promotion_idx
  on public.product_promotions (promotion);

create index if not exists product_promotions_promo_code_idx
  on public.product_promotions (promo_code);

create index if not exists product_promotions_created_at_idx
  on public.product_promotions (created_at);

create index if not exists product_promotions_store_status_ending_idx
  on public.product_promotions (store_id, status, ending_date);

create index if not exists sent_messages_product_sent_day_idx
  on public.sent_messages (product_id, ((sent_at at time zone 'America/Sao_Paulo')::date));

drop policy if exists "Product images can be uploaded" on storage.objects;
drop policy if exists "Product images can be replaced" on storage.objects;
