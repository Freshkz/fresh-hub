-- BUG REAL encontrado: la tabla activity_log nunca tuvo las columnas
-- actor_color y actor_avatar_url, pero services/activityLog.js las inserta en
-- CADA llamada a logActivity(). Eso hacía fallar el insert completo (columna
-- inexistente) desde que se agregó el sistema de colaboradores — por eso
-- ninguna acción quedaba registrada en el log, nunca, para nadie.

alter table public.activity_log add column if not exists actor_color text;
alter table public.activity_log add column if not exists actor_avatar_url text;
