-- Script de migración para Roles en Supabase Auth (FreshKZ Hub)
-- Roles soportados: 'admin' y 'editor' (amigos)

-- 1. Asignar rol a un usuario por email (Reemplazá 'amigo@email.com' por el email de tu amigo)
-- Para asignar rol de Editor (amigo):
UPDATE auth.users
SET raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || '{"role": "editor"}'::jsonb
WHERE email = 'amigo@email.com';

-- Para asegurar tu cuenta como Admin principal:
UPDATE auth.users
SET raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = 'tu_email@ejemplo.com';

-- 2. Asegurar políticas de seguridad (RLS) en Supabase:
-- Cualquier usuario autenticado (Admin o Editor) puede insertar/editar proyectos, descargas, novedades y guías.

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;
