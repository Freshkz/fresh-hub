-- FreshKZ Hub: persistent guide content for the admin CRUD.
create table if not exists public.guides (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null default '',
  game text not null default 'General',
  image_url text not null default '',
  tags jsonb not null default '[]'::jsonb,
  links jsonb not null default '[]'::jsonb,
  parts jsonb not null default '[]'::jsonb,
  published boolean not null default true,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.guides enable row level security;

drop policy if exists "Public can read published guides" on public.guides;
create policy "Public can read published guides"
  on public.guides for select
  using (published = true);

drop policy if exists "Authenticated users can manage guides" on public.guides;
create policy "Authenticated users can manage guides"
  on public.guides for all
  to authenticated
  using (true)
  with check (true);

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can view media" on storage.objects;
create policy "Public can view media"
  on storage.objects for select
  using (bucket_id = 'media');

drop policy if exists "Authenticated users can upload media" on storage.objects;
create policy "Authenticated users can upload media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media');
