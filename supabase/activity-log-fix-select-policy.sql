-- El log de actividad estaba con RLS que solo dejaba LEER (select) al rol admin.
-- Por eso ningún colaborador/editor veía nada (0 filas siempre, aunque el frontend
-- se los mostrara) y solo el admin lo veía. Esto lo abre a admin + editor:
-- cualquiera que pueda entrar al panel de Admin puede ver el historial de
-- actividad, pero solo admin puede borrar entradas (esa policy no cambia).

drop policy if exists "Admin can read activity log" on public.activity_log;
create policy "Admin and editors can read activity log"
  on public.activity_log for select
  to authenticated
  using ((auth.jwt() -> 'user_metadata' ->> 'role') in ('admin', 'editor'));

-- Si ya habías corrido activity-log-delete-and-backfill.sql, la policy de DELETE
-- (solo admin) sigue como estaba — no hace falta tocarla, este archivo solo
-- reemplaza la de SELECT.

-- Nota: si después de correr esto seguís sin ver entradas como Admin, es porque
-- tu sesión ya estaba abierta ANTES de que el rol quedara bien seteado en
-- user_metadata — el JWT guarda el rol al momento del login y no se actualiza
-- solo. Solución: cerrar sesión y volver a entrar (eso emite un JWT nuevo con el
-- rol actual). Lo mismo aplica para cualquier colaborador al que le cambiaste el
-- rol después de que ya había iniciado sesión.
