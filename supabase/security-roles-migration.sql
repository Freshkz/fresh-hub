-- FreshKZ Hub: roles seguros (reemplaza el rol en user_metadata).
--
-- PROBLEMA: todas las políticas leían el rol de auth.jwt() -> 'user_metadata',
-- que el PROPIO usuario puede editar desde el navegador con
-- supabase.auth.updateUser({ data: { role: "admin" } }). Cualquiera que se
-- registrara podía hacerse admin. Además settings/social_links dejaban
-- escribir a cualquier logueado, y cualquier logueado podía crear contenido
-- firmado con el nombre de otro.
--
-- SOLUCIÓN: el rol vive en public.collaborators.role. Las funciones de abajo
-- lo resuelven con auth.uid() (firmado por Supabase, no falsificable) + el
-- email VERIFICADO en auth.users. Quien no está en collaborators = 'visitor'.
--
-- Es idempotente: se puede volver a correr sin romper nada.
-- IMPORTANTE: después de correr esto, corré el seed de roles (no está en el
-- repo porque tiene emails reales) o nadie va a tener permisos de edición.

-- ─── 1. Columna de rol en collaborators ────────────────────────────────────
alter table public.collaborators add column if not exists role text not null default 'editor';
alter table public.collaborators drop constraint if exists collaborators_role_check;
alter table public.collaborators add constraint collaborators_role_check check (role in ('admin', 'editor'));

-- El join con auth.users compara emails en minúsculas.
update public.collaborators set email = lower(trim(email)) where email <> lower(trim(email));

-- ─── 2. Funciones de rol ───────────────────────────────────────────────────
-- security definer: necesita leer auth.users, que el usuario no puede leer.
create or replace function public.current_app_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select c.role
      from public.collaborators c
      join auth.users u on lower(u.email) = c.email
      where u.id = auth.uid()
        and u.email_confirmed_at is not null
      limit 1
    ),
    'visitor'
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$ select public.current_app_role() = 'admin' $$;

create or replace function public.is_editor()
returns boolean
language sql
stable
set search_path = ''
as $$ select public.current_app_role() in ('admin', 'editor') $$;

-- ─── 3. Autoría la pone la base, no el navegador ───────────────────────────
-- INSERT: author_* se completa desde collaborators (no se puede firmar como otro).
-- UPDATE: un editor no puede cambiar la autoría; el admin sí (para correcciones).
-- Sin usuario logueado (SQL Editor) no toca nada, así los backfills manuales funcionan.
create or replace function public.enforce_author_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_email text := lower(auth.jwt() ->> 'email');
  collab public.collaborators;
begin
  if auth.uid() is null then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if public.is_admin() then
      return new;
    end if;
    new.author_email := old.author_email;
    new.author_role := old.author_role;
    new.author_name := old.author_name;
    new.author_color := old.author_color;
    new.author_avatar_url := old.author_avatar_url;
    return new;
  end if;

  select * into collab from public.collaborators c where c.email = actor_email;
  new.author_email := actor_email;
  new.author_role := coalesce(collab.role, 'visitor');
  new.author_name := coalesce(collab.display_name, actor_email);
  new.author_color := collab.color;
  new.author_avatar_url := collab.avatar_url;
  return new;
end;
$$;

-- ─── 4. Políticas de contenido (downloads, projects, news, guides) ─────────
do $$
declare
  t text;
  owner_or_admin text := $e$(select public.is_admin()) or ((select public.is_editor()) and author_email = (select lower(auth.jwt() ->> 'email')))$e$;
begin
  foreach t in array array['downloads', 'projects', 'news', 'guides'] loop
    execute format('drop trigger if exists enforce_author_fields on public.%I', t);
    execute format('create trigger enforce_author_fields before insert or update on public.%I for each row execute function public.enforce_author_fields()', t);

    -- Políticas viejas (basadas en user_metadata) + la lectura duplicada "public read".
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('drop policy if exists "Authenticated users can insert %s" on public.%I', t, t);
    execute format('drop policy if exists "Owner or admin can update %s" on public.%I', t, t);
    execute format('drop policy if exists "Owner or admin can delete %s" on public.%I', t, t);
    execute format('drop policy if exists "Editors can insert %s" on public.%I', t, t);
    execute format('drop policy if exists "Owner editor or admin can update %s" on public.%I', t, t);
    execute format('drop policy if exists "Owner editor or admin can delete %s" on public.%I', t, t);

    execute format(
      'create policy "Editors can insert %s" on public.%I for insert to authenticated with check ((select public.is_editor()) and author_email = (select lower(auth.jwt() ->> %L)))',
      t, t, 'email'
    );
    execute format(
      'create policy "Owner editor or admin can update %s" on public.%I for update to authenticated using (%s) with check (%s)',
      t, t, owner_or_admin, owner_or_admin
    );
    execute format(
      'create policy "Owner editor or admin can delete %s" on public.%I for delete to authenticated using (%s)',
      t, t, owner_or_admin
    );
  end loop;
end $$;

-- Guías: el público ve solo las publicadas; los editores ven también los
-- borradores (antes el panel pedía borradores pero la RLS nunca los devolvía).
drop policy if exists "Editors can read all guides" on public.guides;
create policy "Editors can read all guides"
  on public.guides for select
  to authenticated
  using ((select public.is_editor()));

-- ─── 5. Activity log ───────────────────────────────────────────────────────
drop policy if exists "Admin and editors can read activity log" on public.activity_log;
create policy "Admin and editors can read activity log"
  on public.activity_log for select
  to authenticated
  using ((select public.is_editor()));

drop policy if exists "Authenticated users can log their own activity" on public.activity_log;
drop policy if exists "Editors can log their own activity" on public.activity_log;
create policy "Editors can log their own activity"
  on public.activity_log for insert
  to authenticated
  with check ((select public.is_editor()) and actor_email = (select auth.jwt() ->> 'email'));

drop policy if exists "Admin can delete activity log" on public.activity_log;
create policy "Admin can delete activity log"
  on public.activity_log for delete
  to authenticated
  using ((select public.is_admin()));

-- ─── 6. Tablas que solo toca el Admin ──────────────────────────────────────
drop policy if exists "Admin can manage changelog" on public.changelog_entries;
create policy "Admin can manage changelog"
  on public.changelog_entries for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admin can manage collaborators" on public.collaborators;
create policy "Admin can manage collaborators"
  on public.collaborators for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- settings y social_links tenían "auth write": CUALQUIER logueado podía cambiar
-- el Worker de R2, el webhook de Discord, el PIN o las redes sociales.
drop policy if exists "auth write" on public.settings;
drop policy if exists "Admin can write settings" on public.settings;
create policy "Admin can write settings"
  on public.settings for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "auth write" on public.social_links;
drop policy if exists "Admin can write social links" on public.social_links;
create policy "Admin can write social links"
  on public.social_links for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ─── 7. Storage: solo editores suben imágenes al bucket "media" ────────────
drop policy if exists "Authenticated users can upload media" on storage.objects;
drop policy if exists "Editors can upload media" on storage.objects;
create policy "Editors can upload media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media' and (select public.is_editor()));

-- ─── 8. Limpieza: el rol en user_metadata ya no se usa en ningún lado ──────
update auth.users
set raw_user_meta_data = raw_user_meta_data - 'role'
where raw_user_meta_data ? 'role';
