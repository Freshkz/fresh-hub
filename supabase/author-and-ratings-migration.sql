-- Script de migración para Autoría, Estrellas y PIN Privado en Supabase (FreshKZ Hub)

-- 1. Añadir columnas de autoría a proyectos, descargas, novedades y guías
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS author_email text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS author_role text;

ALTER TABLE public.downloads ADD COLUMN IF NOT EXISTS author_email text;
ALTER TABLE public.downloads ADD COLUMN IF NOT EXISTS author_role text;
ALTER TABLE public.downloads ADD COLUMN IF NOT EXISTS rating_sum integer DEFAULT 0;
ALTER TABLE public.downloads ADD COLUMN IF NOT EXISTS rating_count integer DEFAULT 0;

ALTER TABLE public.news ADD COLUMN IF NOT EXISTS author_email text;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS author_role text;

ALTER TABLE public.guides ADD COLUMN IF NOT EXISTS author_email text;
ALTER TABLE public.guides ADD COLUMN IF NOT EXISTS author_role text;

-- 2. Añadir columna de PIN para aplicaciones privadas (Cupons / AI Stylist) en settings
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS private_apps_pin text DEFAULT '1234';
