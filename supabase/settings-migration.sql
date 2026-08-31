DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'settings'
      AND column_name = 'site_name'
  ) = false THEN
    ALTER TABLE public.settings ADD COLUMN site_name text DEFAULT 'Fresh';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'settings'
      AND column_name = 'site_tagline'
  ) = false THEN
    ALTER TABLE public.settings ADD COLUMN site_tagline text DEFAULT 'Todo lo que hago, en un solo lugar';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'settings'
      AND column_name = 'meta_title'
  ) = false THEN
    ALTER TABLE public.settings ADD COLUMN meta_title text DEFAULT 'Fresh Hub';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'settings'
      AND column_name = 'meta_description'
  ) = false THEN
    ALTER TABLE public.settings ADD COLUMN meta_description text DEFAULT 'Proyectos, descargas y novedades de Fresh.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'settings'
      AND column_name = 'avatar_url'
  ) = false THEN
    ALTER TABLE public.settings ADD COLUMN avatar_url text;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'settings'
      AND column_name = 'primary_color'
  ) = false THEN
    ALTER TABLE public.settings ADD COLUMN primary_color text DEFAULT '#7C5CFF';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'settings'
      AND column_name = 'secondary_color'
  ) = false THEN
    ALTER TABLE public.settings ADD COLUMN secondary_color text DEFAULT '#33E6B0';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'settings'
      AND column_name = 'favicon_url'
  ) = false THEN
    ALTER TABLE public.settings ADD COLUMN favicon_url text;
  END IF;
END $$;

UPDATE public.settings
SET
  site_name = COALESCE(site_name, 'Fresh'),
  site_tagline = COALESCE(site_tagline, 'Todo lo que hago, en un solo lugar'),
  meta_title = COALESCE(meta_title, 'Fresh Hub'),
  meta_description = COALESCE(meta_description, 'Proyectos, descargas y novedades de Fresh.');
