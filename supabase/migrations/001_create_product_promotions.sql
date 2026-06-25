create extension if not exists pgcrypto;

create table if not exists public.product_promotions (
  id uuid primary key default gen_random_uuid(),
  store_id text not null,
  marketplace text not null default 'Mercado Livre',
  product_name text not null,
  sku text not null,
  promotion boolean default true,
  ending_date date not null,
  promo_code text,
  image_url text,
  phone_number text not null,
  renewal_value numeric(10,2) not null,
  status text default 'active',
  created_at timestamp default now(),
  updated_at timestamp default now(),
  constraint product_promotions_status_check
    check (status in ('active', 'expired', 'renewed', 'inactive')),
  constraint product_promotions_store_sku_unique unique (store_id, sku)
);

create table if not exists public.sent_messages (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.product_promotions(id) on delete set null,
  store_id text,
  marketplace text,
  phone_number text not null,
  message text not null,
  provider text,
  provider_message_id text,
  status text,
  sent_at timestamp default now()
);

create index if not exists product_promotions_store_id_idx
  on public.product_promotions (store_id);

create index if not exists product_promotions_status_idx
  on public.product_promotions (status);

create index if not exists product_promotions_ending_date_idx
  on public.product_promotions (ending_date);

create index if not exists sent_messages_product_sent_at_idx
  on public.sent_messages (product_id, sent_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_product_promotions_updated_at on public.product_promotions;

create trigger set_product_promotions_updated_at
before update on public.product_promotions
for each row
execute function public.set_updated_at();

alter table public.product_promotions enable row level security;
alter table public.sent_messages enable row level security;

grant select, insert, update, delete on table public.product_promotions to service_role;
grant select, insert, update, delete on table public.sent_messages to service_role;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Product images are publicly readable" on storage.objects;
create policy "Product images are publicly readable"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'product-images');

drop policy if exists "Product images can be uploaded" on storage.objects;
create policy "Product images can be uploaded"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'product-images');

drop policy if exists "Product images can be replaced" on storage.objects;
create policy "Product images can be replaced"
on storage.objects
for update
to anon, authenticated
using (bucket_id = 'product-images')
with check (bucket_id = 'product-images');
