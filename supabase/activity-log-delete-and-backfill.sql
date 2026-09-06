-- 1) Permitir que el Admin borre entradas del log de actividad.
--    La tabla ya tenía RLS con policies de SELECT/INSERT, pero faltaba DELETE
--    (por eso el botón de borrar del panel fallaría con "permission denied").
grant delete on public.activity_log to authenticated;

drop policy if exists "Admin can delete activity log" on public.activity_log;
create policy "Admin can delete activity log"
  on public.activity_log for delete
  to authenticated
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- 2) Backfill: los items ya publicados guardan el nombre/color/foto del autor
--    "congelados" al momento de crearlos (a propósito, ver collaborators-migration.sql).
--    Por eso cambiar el perfil de un colaborador en /admin/collaborators no actualiza
--    retroactivamente lo que ya se había publicado antes. Corré esto UNA VEZ para
--    igualar los items viejos de dragon2_online@hotmail.com con su perfil actual:

update public.downloads d
set author_name = c.display_name, author_color = c.color, author_avatar_url = c.avatar_url
from public.collaborators c
where c.email = 'dragon2_online@hotmail.com' and d.author_email = c.email;

update public.projects p
set author_name = c.display_name, author_color = c.color, author_avatar_url = c.avatar_url
from public.collaborators c
where c.email = 'dragon2_online@hotmail.com' and p.author_email = c.email;

update public.news n
set author_name = c.display_name, author_color = c.color, author_avatar_url = c.avatar_url
from public.collaborators c
where c.email = 'dragon2_online@hotmail.com' and n.author_email = c.email;

update public.guides g
set author_name = c.display_name, author_color = c.color, author_avatar_url = c.avatar_url
from public.collaborators c
where c.email = 'dragon2_online@hotmail.com' and g.author_email = c.email;
