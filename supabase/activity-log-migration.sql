create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_email text not null,
  actor_name text,
  action text not null, -- 'created' | 'updated' | 'deleted' | 'published' | 'unpublished'
  entity_type text not null, -- 'guide' | 'project' | 'download' | 'news'
  entity_id text,
  entity_title text,
  created_at timestamptz not null default now()
);

alter table public.activity_log enable row level security;

grant select, insert on public.activity_log to authenticated;

drop policy if exists "Admin can read activity log" on public.activity_log;
create policy "Admin can read activity log"
  on public.activity_log for select
  to authenticated
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

drop policy if exists "Authenticated users can log their own activity" on public.activity_log;
create policy "Authenticated users can log their own activity"
  on public.activity_log for insert
  to authenticated
  with check (actor_email = (auth.jwt() ->> 'email'));
