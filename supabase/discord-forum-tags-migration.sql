-- FreshKZ Hub: IDs de etiqueta de foro de Discord (applied_tags), uno por
-- tipo de contenido, para los webhooks que apuntan a un canal de tipo Foro.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'settings' AND column_name = 'discord_forum_tag_general'
  ) = false THEN
    ALTER TABLE public.settings ADD COLUMN discord_forum_tag_general text;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'settings' AND column_name = 'discord_forum_tag_guides'
  ) = false THEN
    ALTER TABLE public.settings ADD COLUMN discord_forum_tag_guides text;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'settings' AND column_name = 'discord_forum_tag_downloads'
  ) = false THEN
    ALTER TABLE public.settings ADD COLUMN discord_forum_tag_downloads text;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'settings' AND column_name = 'discord_forum_tag_projects'
  ) = false THEN
    ALTER TABLE public.settings ADD COLUMN discord_forum_tag_projects text;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'settings' AND column_name = 'discord_forum_tag_news'
  ) = false THEN
    ALTER TABLE public.settings ADD COLUMN discord_forum_tag_news text;
  END IF;
END $$;
