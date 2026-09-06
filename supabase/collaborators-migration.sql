-- FreshKZ Hub: colaboradores con nombre/color custom y permiso de "marcar como privado"

-- 1. Tabla nueva de colaboradores
create table if not exists public.collaborators (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  display_name text not null,
  color text not null default '#33E6B0',
  avatar_url text,
  can_mark_private boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.collaborators enable row level security;

-- Lectura pública: necesaria para que las cards muestren nombre/color a cualquier visitante
drop policy if exists "Public can read collaborators" on public.collaborators;
create policy "Public can read collaborators"
  on public.collaborators for select
  using (true);

-- Solo el Admin puede crear/editar/borrar colaboradores (no cualquier autenticado)
drop policy if exists "Admin can manage collaborators" on public.collaborators;
create policy "Admin can manage collaborators"
  on public.collaborators for all
  to authenticated
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- 1.b Avatar (imagen/gif) opcional para el colaborador
alter table public.collaborators add column if not exists avatar_url text;

-- 2. Columnas para "congelar" nombre/color/avatar del autor en el momento de crear el contenido
-- (así las cards no dependen de un join, y si después cambiás el nombre de alguien,
-- lo viejo no se reescribe solo — mismo criterio que ya usás con author_email/author_role)
alter table public.downloads add column if not exists author_name text;
alter table public.downloads add column if not exists author_color text;
alter table public.downloads add column if not exists author_avatar_url text;

alter table public.projects add column if not exists author_name text;
alter table public.projects add column if not exists author_color text;
alter table public.projects add column if not exists author_avatar_url text;

alter table public.news add column if not exists author_name text;
alter table public.news add column if not exists author_color text;
alter table public.news add column if not exists author_avatar_url text;

-- 3. Guías nunca trackeó autor: se agrega completo ahora
alter table public.guides add column if not exists author_email text;
alter table public.guides add column if not exists author_role text;
alter table public.guides add column if not exists author_name text;
alter table public.guides add column if not exists author_color text;
alter table public.guides add column if not exists author_avatar_url text;

-- 4. Permisos base (sin esto, Postgres corta con "permission denied" antes
-- de mirar las políticas RLS — mismo fix que ya tuviste que aplicar en guides)
grant select on public.collaborators to anon;
grant select, insert, update, delete on public.collaborators to authenticated;
