-- FreshKZ Hub: "cards tapadas" para contenido exclusivo.
--
-- Requiere private-data-migration.sql (la RLS ya no devuelve filas privadas a
-- quien no tiene acceso). Esta función devuelve, para esas filas que el usuario
-- NO puede ver, solo lo mínimo para dibujar la card borrosa con candado:
-- id, título, imagen, destacado, categoría y fecha. Nunca descripción, links
-- de descarga, contenido ni autoría.
--
-- Es idempotente: se puede volver a correr sin romper nada.

create or replace function public.private_teasers(content_type text)
returns table (
  id text,
  slug text,
  title text,
  image text,
  featured boolean,
  category text,
  sort_date timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  me text := lower(auth.jwt() ->> 'email');
  is_admin boolean := public.is_admin();
begin
  -- "Puede verla" = misma regla que la RLS. coalesce: sin sesión, email es null.
  if content_type = 'downloads' then
    return query
      select d.id::text, null::text, d.name::text, d.image::text, coalesce(d.featured, false),
             d.category::text, d.release_date::timestamptz
      from public.downloads d
      where d.is_private
        and coalesce(d.status, 'published') = 'published'
        and not coalesce(is_admin or d.author_email = me or d.visible_to ? me, false);

  elsif content_type = 'projects' then
    return query
      select p.id::text, null::text, p.name::text, p.image::text, coalesce(p.featured, false),
             p.status::text, p.created_at::timestamptz
      from public.projects p
      where p.is_private
        and not coalesce(is_admin or p.author_email = me or p.visible_to ? me, false);

  elsif content_type = 'news' then
    return query
      select n.id::text, null::text, n.title::text, n.image::text, coalesce(n.featured, false),
             n.type::text, n.date::timestamptz
      from public.news n
      where n.is_private
        and coalesce(n.published, true)
        and not coalesce(is_admin or n.author_email = me or n.visible_to ? me, false);

  elsif content_type = 'guides' then
    return query
      select g.id::text, g.slug::text, g.title::text, g.image_url::text, coalesce(g.featured, false),
             null::text, g.created_at::timestamptz
      from public.guides g
      where g.is_private
        and g.published
        and not coalesce(is_admin or g.author_email = me or g.visible_to ? me, false);

  else
    raise exception 'Tipo de contenido inválido: %', content_type using errcode = '22023';
  end if;
end;
$$;

grant execute on function public.private_teasers(text) to anon, authenticated;
