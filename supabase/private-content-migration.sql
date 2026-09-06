-- FreshKZ Hub: contenido privado (solo vos y tu pareja logueados lo ven)
-- + asegura que Descargas, Proyectos y Novedades tengan las mismas
--   políticas de seguridad que ya tiene Guías (antes no tenían ninguna).

-- 1. Columna "is_private" en las 4 tablas
alter table public.guides add column if not exists is_private boolean not null default false;
alter table public.downloads add column if not exists is_private boolean not null default false;
alter table public.projects add column if not exists is_private boolean not null default false;
alter table public.news add column if not exists is_private boolean not null default false;

-- 2. Guías: la política pública ya filtraba por "published"; se deja igual
-- (lo privado se tapa a nivel visual, mismo criterio que el resto — ver nota abajo)
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

-- 3. Descargas: nunca tuvo políticas propias, se agregan ahora.
-- OJO: el público puede LEER todas las filas (incluidas las privadas) para
-- poder mostrar la card "tapada" en el listado — lo privado se oculta a
-- nivel visual en la web, no a nivel de base de datos (mismo criterio que
-- ya usás con el candado de Cupons/AI Stylist). Lo que SÍ queda blindado
-- de verdad es la escritura: nadie puede crear/editar/borrar sin login.
alter table public.downloads enable row level security;
drop policy if exists "Public can read downloads" on public.downloads;
create policy "Public can read downloads"
  on public.downloads for select
  using (true);

drop policy if exists "Authenticated users can manage downloads" on public.downloads;
create policy "Authenticated users can manage downloads"
  on public.downloads for all
  to authenticated
  using (true)
  with check (true);

-- 4. Proyectos: mismo caso
alter table public.projects enable row level security;
drop policy if exists "Public can read projects" on public.projects;
create policy "Public can read projects"
  on public.projects for select
  using (true);

drop policy if exists "Authenticated users can manage projects" on public.projects;
create policy "Authenticated users can manage projects"
  on public.projects for all
  to authenticated
  using (true)
  with check (true);

-- 5. Novedades: mismo caso
alter table public.news enable row level security;
drop policy if exists "Public can read news" on public.news;
create policy "Public can read news"
  on public.news for select
  using (true);

drop policy if exists "Authenticated users can manage news" on public.news;
create policy "Authenticated users can manage news"
  on public.news for all
  to authenticated
  using (true)
  with check (true);

-- 6. Columnas para los íconos personalizados del candado de "privado" (Settings)
alter table public.settings add column if not exists private_lock_guides text;
alter table public.settings add column if not exists private_lock_downloads text;
alter table public.settings add column if not exists private_lock_projects text;
alter table public.settings add column if not exists private_lock_news text;
