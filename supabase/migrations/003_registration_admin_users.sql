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

create index if not exists admin_users_email_idx
  on public.admin_users (email);
