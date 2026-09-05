-- FreshKZ Hub: separa "categorías de contenido" (Tutorial, Guía, Utilidad, etc.)
-- de "juegos/tags" (Minecraft, CS2, etc.), que ya vivían en la columna `tags`.
alter table public.guides add column if not exists categories jsonb not null default '[]'::jsonb;
