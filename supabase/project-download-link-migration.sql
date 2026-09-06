-- FreshKZ Hub: enlazar un Proyecto con su Descarga real (ej. "hice un programa
-- con instalador" -> el proyecto cuenta la historia, la descarga tiene el archivo).
alter table public.projects
  add column if not exists linked_download_id uuid references public.downloads(id) on delete set null;
