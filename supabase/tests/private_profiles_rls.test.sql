begin;

select plan(10);

insert into auth.users (id, email)
values
  ('10000000-0000-4000-8000-000000000001', 'm13e-user-a@example.test'),
  ('10000000-0000-4000-8000-000000000002', 'm13e-user-b@example.test');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}', true);

insert into public.private_profiles (display_name, favourite_game_id)
values ('Player A', 'solitaire');

select is(
  (select id from public.private_profiles),
  '10000000-0000-4000-8000-000000000001'::uuid,
  'user A creates a profile owned by their auth ID'
);
select is((select count(*)::integer from public.private_profiles), 1, 'user A can read their own profile');
select lives_ok(
  $$update public.private_profiles set display_name = 'Player A updated'$$,
  'user A can update their own profile'
);
select is(
  (select display_name from public.private_profiles),
  'Player A updated',
  'user A sees their updated profile'
);
select throws_ok(
  $$insert into public.private_profiles (id, display_name) values ('10000000-0000-4000-8000-000000000002', 'Impersonated')$$,
  '42501',
  null,
  'user A cannot assign a profile to another account'
);
select throws_ok(
  $$delete from public.private_profiles$$,
  '42501',
  null,
  'remote profile deletion is unavailable until the lifecycle flow exists'
);

select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000002","role":"authenticated"}', true);
select is((select count(*)::integer from public.private_profiles), 0, 'user B cannot read user A profile');

-- RLS silently filters an unauthorized UPDATE; verify the row is unchanged as its owner.
update public.private_profiles set display_name = 'Changed by B';
select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}', true);
select is(
  (select display_name from public.private_profiles),
  'Player A updated',
  'user B cannot update user A profile'
);

reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
select throws_ok(
  $$select * from public.private_profiles$$,
  '42501',
  null,
  'anonymous role cannot read private profiles'
);

reset role;
delete from auth.users
where id = '10000000-0000-4000-8000-000000000001';
select is(
  (select count(*)::integer from public.private_profiles where id = '10000000-0000-4000-8000-000000000001'),
  0,
  'deleting the auth user cascades to the private profile'
);

select * from finish();
rollback;
