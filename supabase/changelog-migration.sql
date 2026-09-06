-- FreshKZ Hub: Changelog editable desde el Admin + integración con commits de GitHub
--
-- Hoy el changelog vive hardcodeado en src/services/changelog.js. Esto lo mueve a
-- una tabla real en Supabase para poder editarlo desde /admin/changelog, y guarda
-- de dónde salió cada línea (a mano, o auto-generada desde un commit) para que el
-- historial de "de dónde salió esto" quede trazado.

create table if not exists public.changelog_entries (
  id uuid primary key default gen_random_uuid(),
  version text not null unique,
  entry_date date not null,
  title text not null,
  summary text not null default '',
  added text[] not null default '{}',
  fixed text[] not null default '{}',
  changed text[] not null default '{}',
  -- 'manual' = escrito a mano en el Admin. 'github' = generado con el asistente de
  -- commits (igual pasa por edición humana antes de guardar, no se publica solo).
  source text not null default 'manual',
  -- Guardamos hasta qué commit SHA de GitHub ya se revisó, para que la próxima vez
  -- que se abra el asistente solo traiga los commits nuevos desde acá.
  last_commit_sha text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.changelog_entries enable row level security;

-- Lectura pública: la página /changelog la ve cualquier visitante, sin login.
grant select on public.changelog_entries to anon;
grant select, insert, update, delete on public.changelog_entries to authenticated;

drop policy if exists "Public can read changelog" on public.changelog_entries;
create policy "Public can read changelog"
  on public.changelog_entries for select
  using (true);

-- Solo Admin escribe el changelog público (no cualquier colaborador).
drop policy if exists "Admin can manage changelog" on public.changelog_entries;
create policy "Admin can manage changelog"
  on public.changelog_entries for all
  to authenticated
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Seed: migra las 7 entradas que ya tenías hardcodeadas en changelog.js, tal cual,
-- para no perder el historial existente. "on conflict do nothing" -> si corrés esto
-- dos veces no duplica nada.
insert into public.changelog_entries (version, entry_date, title, summary, added, fixed, changed, source)
values ('v1.6.1', '2026-09-06', 'Privacidad selectiva por publicación', 'El contenido privado ya no lo ve ''cualquier logueado'' — ahora se elige exactamente quién puede verlo, publicación por publicación.', ARRAY['Selector ''Quién más puede ver esto'' en los 4 formularios (Descargas, Proyectos, Novedades, Guías), con chips de cada colaborador'], ARRAY['El contenido privado se mostraba sin blur a CUALQUIER persona logueada, sin importar quién lo creó ni si tenía permiso; ahora solo lo ven el Admin, el autor, y los colaboradores elegidos explícitamente'], ARRAY['''Privado'' pasó de ser una regla global (logueado = ve todo) a una regla por publicación (autor + Admin + elegidos)'], 'manual')
on conflict (version) do nothing;

insert into public.changelog_entries (version, entry_date, title, summary, added, fixed, changed, source)
values ('v1.6.0', '2026-09-06', 'Sistema de colaboradores con permisos', 'Cada persona ahora tiene su propio nombre, color y foto/GIF en las cards, permisos individuales para marcar contenido como privado, y solo puede editar o borrar lo que ella misma creó.', ARRAY['Panel nuevo ''Colaboradores'' en el Admin: nombre, color, imagen/GIF y permiso de ''marcar como privado'' por persona', 'Las cards de Descargas, Proyectos y Guías ahora muestran el nombre, color y foto/GIF real de quien creó el contenido', 'Guías ahora trackea quién la creó (antes no mostraba autor)'], ARRAY['El Dashboard mostraba siempre ''Editor / Amigo'' en verde sin importar el colaborador logueado; ahora muestra su nombre y color reales', 'El checkbox ''🔒 Privado'' ahora solo aparece si esa persona tiene el permiso habilitado, en vez de estar disponible para cualquier logueado'], ARRAY['Cada colaborador (no-admin) ahora solo puede editar o eliminar el contenido que él mismo creó; el Admin sigue con acceso total', 'Texto del checkbox de Privado en Guías simplificado a ''🔒 Privado'''], 'manual')
on conflict (version) do nothing;

insert into public.changelog_entries (version, entry_date, title, summary, added, fixed, changed, source)
values ('v1.5.0', '2026-09-05', 'App instalable (PWA) y mejoras de mobile', 'El hub ahora se puede instalar como app en el celular, se agregó navegación mobile completa, y se extendió la vista previa del Admin a Proyectos y Descargas.', ARRAY['Soporte PWA: el sitio se puede instalar en el celular o la compu como una app, con ícono propio y funcionamiento offline básico', 'Menú de navegación mobile (antes los links de Descargas, Proyectos, Novedades, etc. no se podían abrir en celular)', 'Vista previa (miniatura y página completa) agregada a Projects Admin y Downloads Admin, igual que ya tenía Guides'], ARRAY['Bug de PWA en iOS que impedía tocar el navbar (Dashboard/Admin) al quedar tapado por la barra de estado del sistema', 'Columna de vista previa en Guides Admin ocupaba demasiado espacio; se redujo su tamaño'], ARRAY['Botones y miniaturas de la vista previa en Admin ahora son más compactos en todas las secciones'], 'manual')
on conflict (version) do nothing;

insert into public.changelog_entries (version, entry_date, title, summary, added, fixed, changed, source)
values ('v1.4.3', '2026-09-04', 'Subida de archivos grandes a R2 y fixes de Admin', 'Migración completa a subida directa a Cloudflare R2 con URLs prefirmadas, sin límite de tamaño del proxy, más varias correcciones en el panel de Admin.', ARRAY['Subida de archivos a R2 vía URLs prefirmadas (sin límite de 100/200 MB del proxy de Cloudflare)', 'Worker de Cloudflare con endpoint /presign para firmar subidas directas a R2', 'Modal de confirmación estilizado para eliminar descargas, reemplazando el cartel nativo del navegador'], ARRAY['Eliminación de archivos en R2 ya no falla en silencio: ahora muestra el motivo exacto si algo sale mal', 'Se corrigió un conflicto de nombres que hacía que /admin/dashboard mostrara el panel de Downloads', 'El botón de crear descarga ya no se puede tocar mientras el archivo todavía se está subiendo'], ARRAY['CORS configurado en el bucket de R2 para permitir subidas directas desde el navegador'], 'manual')
on conflict (version) do nothing;

insert into public.changelog_entries (version, entry_date, title, summary, added, fixed, changed, source)
values ('v1.4.2', '2026-08-31', 'FreshKZ Hub visual refresh', 'Nueva capa visual premium, cards más interactivas y mejor jerarquía de contenido.', ARRAY['Hero con entrada premium y glow', 'Cards reutilizables para proyectos, descargas y novedades', 'Soporte para motion reducido en equipos con accesibilidad', 'Mejor experiencia de hover y feedback visual'], ARRAY['Ajuste de contrast y bordes en cards', 'Corrección de estados vacíos y mensajes de carga'], ARRAY['Estilo visual modernizado para la home', 'Diseño más consistente en la navegación y widgets'], 'manual')
on conflict (version) do nothing;

insert into public.changelog_entries (version, entry_date, title, summary, added, fixed, changed, source)
values ('v1.4.1', '2026-08-30', 'Admin settings and routing cleanup', 'Se corrigió la capa de configuración del sitio y la navegación pública bajo GitHub Pages.', ARRAY['Detalle de proyectos, descargas y noticias', 'Búsqueda y filtros para listados públicos', 'Dashboard con métricas básicas'], ARRAY['Routing de GitHub Pages corregido', 'Links de descarga/proyectos navegables', 'Problemas del admin al abrir rutas principales'], ARRAY['Se reorganizó la experiencia del panel admin', 'Contenido de home conectado a datos reales'], 'manual')
on conflict (version) do nothing;

insert into public.changelog_entries (version, entry_date, title, summary, added, fixed, changed, source)
values ('v1.4.0', '2026-08-28', 'Public Hub MVP', 'Primera versión pública del hub con contenido gestionable desde Supabase.', ARRAY['Home pública con proyectos y descargas', 'CMS básico para proyectos, noticias y redes sociales', 'Autenticación del admin con Supabase'], ARRAY['Corrección del deploy de GitHub Pages', 'Ajuste de rutas y publicación bajo /fresh-hub'], ARRAY['Estructura del proyecto preparada para seguir creciendo', 'Contenido migrado a un modelo más reutilizable'], 'manual')
on conflict (version) do nothing;

