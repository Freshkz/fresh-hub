-- FreshKZ Hub: privacidad selectiva por publicación.
-- Antes: "privado" = lo ve cualquiera logueado (sin importar quién).
-- Ahora: "privado" = lo ve el Admin siempre + el autor siempre + los
-- colaboradores que el autor elija explícitamente al crear/editar.

alter table public.downloads add column if not exists visible_to jsonb not null default '[]'::jsonb;
alter table public.projects add column if not exists visible_to jsonb not null default '[]'::jsonb;
alter table public.news add column if not exists visible_to jsonb not null default '[]'::jsonb;
alter table public.guides add column if not exists visible_to jsonb not null default '[]'::jsonb;
