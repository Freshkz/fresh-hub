-- FreshKZ Hub: datos privados protegidos por la base (no solo visualmente).
--
-- Requiere haber corrido antes security-roles-migration.sql (usa is_admin/is_editor).
-- Es idempotente: se puede volver a correr sin romper nada.
--
-- 1) Contenido privado: antes la API devolvía TODAS las filas (también las
--    privadas) y el blur era solo visual. Ahora una fila privada solo le llega
--    al admin, a su autor y a los emails de visible_to. El resto no la recibe.
--
-- 2) Secretos de settings: los webhooks de Discord y el PIN estaban en la tabla
--    pública `settings` (cualquier logueado los leía). Pasan a `private_settings`,
--    que solo lee/escribe el admin, y se usan a través de funciones:
--      - get_discord_webhook(section): solo editores/admin.
--      - check_private_apps_pin(pin): responde true/false, nunca devuelve el PIN.

-- ─── 1. Contenido privado ──────────────────────────────────────────────────
do $$
declare
  t text;
  can_see_private text := $e$(not is_private or (select public.is_admin()) or author_email = (select lower(auth.jwt() ->> 'email')) or coalesce(visible_to, '[]'::jsonb) ? (select lower(auth.jwt() ->> 'email')))$e$;
begin
  foreach t in array array['downloads', 'projects', 'news'] loop
    execute format('drop policy if exists "Public can read %s" on public.%I', t, t);
    execute format('drop policy if exists "Read %s respecting privacy" on public.%I', t, t);
    execute format(
      'create policy "Read %s respecting privacy" on public.%I for select using %s',
      t, t, can_see_private
    );
  end loop;

  -- Guías: además, el público solo ve las publicadas (los editores ven borradores).
  drop policy if exists "Public can read published guides" on public.guides;
  drop policy if exists "Editors can read all guides" on public.guides;
  drop policy if exists "Read guides respecting privacy" on public.guides;
  execute format(
    'create policy "Read guides respecting privacy" on public.guides for select using ((published = true or (select public.is_editor())) and %s)',
    can_see_private
  );
end $$;

-- ─── 2. Settings privados ──────────────────────────────────────────────────
create table if not exists public.private_settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.private_settings enable row level security;
revoke all on public.private_settings from anon;
grant select, insert, update, delete on public.private_settings to authenticated;

drop policy if exists "Admin manages private settings" on public.private_settings;
create policy "Admin manages private settings"
  on public.private_settings for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Mover los secretos de `settings` (pública) a `private_settings`.
-- trim de comillas: funciona tanto si settings.value es text como jsonb.
insert into public.private_settings (key, value)
select key, coalesce(trim(both '"' from value::text), '')
from public.settings
where key in (
  'discord_webhook_url',
  'discord_webhook_url_guides',
  'discord_webhook_url_downloads',
  'discord_webhook_url_projects',
  'discord_webhook_url_news',
  'private_apps_pin'
)
on conflict (key) do update set value = excluded.value, updated_at = now();

delete from public.settings
where key in (
  'discord_webhook_url',
  'discord_webhook_url_guides',
  'discord_webhook_url_downloads',
  'discord_webhook_url_projects',
  'discord_webhook_url_news',
  'private_apps_pin'
);

-- Webhook de Discord para una sección ('guides' | 'downloads' | 'projects' | 'news'),
-- con el webhook general como respaldo. Solo editores/admin (los que publican).
create or replace function public.get_discord_webhook(section text default null)
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  webhook text;
begin
  if not public.is_editor() then
    raise exception 'Solo editores pueden enviar avisos a Discord' using errcode = '42501';
  end if;

  if section is not null then
    select nullif(value, '') into webhook
    from public.private_settings
    where key = 'discord_webhook_url_' || section;
  end if;

  if webhook is null then
    select nullif(value, '') into webhook
    from public.private_settings
    where key = 'discord_webhook_url';
  end if;

  return webhook;
end;
$$;

-- Compara el PIN en la base: el navegador nunca recibe el PIN real.
create or replace function public.check_private_apps_pin(pin text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.private_settings
    where key = 'private_apps_pin'
      and value <> ''
      and value = trim(pin)
  );
$$;

revoke execute on function public.check_private_apps_pin(text) from public, anon;
grant execute on function public.check_private_apps_pin(text) to authenticated;
revoke execute on function public.get_discord_webhook(text) from public, anon;
grant execute on function public.get_discord_webhook(text) to authenticated;
