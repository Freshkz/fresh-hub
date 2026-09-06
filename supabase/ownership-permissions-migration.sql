-- FreshKZ Hub: cada colaborador solo puede editar/borrar SU propio contenido.
-- El Admin sigue pudiendo tocar todo, sin restricciones.
-- La lectura pública (SELECT) no cambia — sigue siendo abierta para todos.
-- Crear contenido nuevo (INSERT) tampoco cambia — cualquier logueado puede crear.

-- Downloads
drop policy if exists "Authenticated users can manage downloads" on public.downloads;

drop policy if exists "Authenticated users can insert downloads" on public.downloads;
create policy "Authenticated users can insert downloads"
  on public.downloads for insert
  to authenticated
  with check (true);

drop policy if exists "Owner or admin can update downloads" on public.downloads;
create policy "Owner or admin can update downloads"
  on public.downloads for update
  to authenticated
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' or author_email = (auth.jwt() ->> 'email'))
  with check ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' or author_email = (auth.jwt() ->> 'email'));

drop policy if exists "Owner or admin can delete downloads" on public.downloads;
create policy "Owner or admin can delete downloads"
  on public.downloads for delete
  to authenticated
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' or author_email = (auth.jwt() ->> 'email'));

-- Projects
drop policy if exists "Authenticated users can manage projects" on public.projects;

drop policy if exists "Authenticated users can insert projects" on public.projects;
create policy "Authenticated users can insert projects"
  on public.projects for insert
  to authenticated
  with check (true);

drop policy if exists "Owner or admin can update projects" on public.projects;
create policy "Owner or admin can update projects"
  on public.projects for update
  to authenticated
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' or author_email = (auth.jwt() ->> 'email'))
  with check ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' or author_email = (auth.jwt() ->> 'email'));

drop policy if exists "Owner or admin can delete projects" on public.projects;
create policy "Owner or admin can delete projects"
  on public.projects for delete
  to authenticated
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' or author_email = (auth.jwt() ->> 'email'));

-- News
drop policy if exists "Authenticated users can manage news" on public.news;

drop policy if exists "Authenticated users can insert news" on public.news;
create policy "Authenticated users can insert news"
  on public.news for insert
  to authenticated
  with check (true);

drop policy if exists "Owner or admin can update news" on public.news;
create policy "Owner or admin can update news"
  on public.news for update
  to authenticated
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' or author_email = (auth.jwt() ->> 'email'))
  with check ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' or author_email = (auth.jwt() ->> 'email'));

drop policy if exists "Owner or admin can delete news" on public.news;
create policy "Owner or admin can delete news"
  on public.news for delete
  to authenticated
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' or author_email = (auth.jwt() ->> 'email'));

-- Guides
drop policy if exists "Authenticated users can manage guides" on public.guides;

drop policy if exists "Authenticated users can insert guides" on public.guides;
create policy "Authenticated users can insert guides"
  on public.guides for insert
  to authenticated
  with check (true);

drop policy if exists "Owner or admin can update guides" on public.guides;
create policy "Owner or admin can update guides"
  on public.guides for update
  to authenticated
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' or author_email = (auth.jwt() ->> 'email'))
  with check ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' or author_email = (auth.jwt() ->> 'email'));

drop policy if exists "Owner or admin can delete guides" on public.guides;
create policy "Owner or admin can delete guides"
  on public.guides for delete
  to authenticated
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' or author_email = (auth.jwt() ->> 'email'));
