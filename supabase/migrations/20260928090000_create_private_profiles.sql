create table public.private_profiles (
  id uuid primary key not null default auth.uid()
    references auth.users (id) on delete cascade,
  display_name text not null
    check (
      char_length(display_name) between 2 and 32
      and display_name = btrim(display_name)
      and display_name !~ '[[:cntrl:]]'
    ),
  favourite_game_id text
    check (
      favourite_game_id is null
      or favourite_game_id in (
        'solitaire', 'sudoku', 'pairs', 'word-search',
        'noughts-crosses', 'fifteen', 'mahjong'
      )
    ),
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now()
);

alter table public.private_profiles enable row level security;

revoke all on table public.private_profiles from public, anon, authenticated;
grant select on table public.private_profiles to authenticated;
grant insert (display_name, favourite_game_id)
  on table public.private_profiles to authenticated;
grant update (display_name, favourite_game_id)
  on table public.private_profiles to authenticated;

create policy "Users can read their own private profile"
  on public.private_profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can create their own private profile"
  on public.private_profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Users can update their own private profile"
  on public.private_profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create function public.set_private_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

revoke all on function public.set_private_profile_updated_at() from public, anon, authenticated;

create trigger set_private_profile_updated_at
  before update on public.private_profiles
  for each row
  execute function public.set_private_profile_updated_at();
