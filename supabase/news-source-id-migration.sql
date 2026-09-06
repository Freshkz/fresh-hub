-- FreshKZ Hub: agrega la columna que faltaba en `news` (el admin ya la
-- usaba para evitar duplicados con las novedades automáticas de GitHub,
-- pero la columna nunca se había creado en la base de datos).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'news' AND column_name = 'source_id'
  ) = false THEN
    ALTER TABLE public.news ADD COLUMN source_id text;
  END IF;
END $$;
