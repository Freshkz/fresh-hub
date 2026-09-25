-- FreshKZ Hub: votos reales para descargas + tipo de proyecto (sitios web).
--
-- Requiere security-roles-migration.sql y private-data-migration.sql.
-- Es idempotente: se puede volver a correr sin romper nada.

-- ─── 1. Proyectos: tipo + link al sitio ────────────────────────────────────
-- "Sitios web" no es una sección aparte: es un tipo de proyecto con su link.
-- Los valores válidos están también en src/constants/projectOptions.js.
alter table public.projects add column if not exists project_type text not null default 'app';
alter table public.projects drop constraint if exists projects_project_type_check;
alter table public.projects add constraint projects_project_type_check
  check (project_type in ('app', 'web', 'game', 'tool', 'other'));

alter table public.projects add column if not exists website_url text;
-- Solo http/https: bloquea links tipo "javascript:" guardados en la base.
alter table public.projects drop constraint if exists projects_website_url_check;
alter table public.projects add constraint projects_website_url_check
  check (website_url is null or website_url = '' or website_url ~* '^https?://');

-- ─── 2. Votos de descargas ─────────────────────────────────────────────────
-- ANTES: el voto sumaba directo en downloads.rating_sum desde el navegador.
-- La RLS solo deja editar la descarga a su dueño, así que los visitantes no
-- podían votar (fallaba en silencio) y el dueño podía votar infinitas veces.
-- AHORA: un voto por usuario y descarga (se puede cambiar), y la base mantiene
-- rating_sum/rating_count con un trigger.
create table if not exists public.download_ratings (
  download_id uuid not null references public.downloads(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  score smallint not null check (score between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (download_id, user_id)
);

alter table public.download_ratings enable row level security;
revoke all on public.download_ratings from anon;
grant select, insert, update on public.download_ratings to authenticated;

-- Cada uno ve solo su propio voto (para mostrar "Tu voto"); el promedio vive en downloads.
drop policy if exists "Users read own ratings" on public.download_ratings;
create policy "Users read own ratings"
  on public.download_ratings for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Solo se puede votar una descarga que uno puede ver (el exists respeta la RLS de downloads).
drop policy if exists "Users rate visible downloads" on public.download_ratings;
create policy "Users rate visible downloads"
  on public.download_ratings for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.downloads d where d.id = download_id)
  );

drop policy if exists "Users change own rating" on public.download_ratings;
create policy "Users change own rating"
  on public.download_ratings for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Suma/resta la diferencia (no recalcula desde cero) para conservar los votos
-- que ya existían antes de esta tabla.
create or replace function public.apply_download_rating()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.downloads
    set rating_sum = coalesce(rating_sum, 0) + new.score,
        rating_count = coalesce(rating_count, 0) + 1
    where id = new.download_id;
  elsif tg_op = 'UPDATE' then
    update public.downloads
    set rating_sum = coalesce(rating_sum, 0) + new.score - old.score
    where id = new.download_id;
  elsif tg_op = 'DELETE' then
    update public.downloads
    set rating_sum = greatest(coalesce(rating_sum, 0) - old.score, 0),
        rating_count = greatest(coalesce(rating_count, 0) - 1, 0)
    where id = old.download_id;
  end if;
  return null;
end;
$$;

drop trigger if exists apply_download_rating on public.download_ratings;
create trigger apply_download_rating
  after insert or update of score or delete on public.download_ratings
  for each row execute function public.apply_download_rating();
