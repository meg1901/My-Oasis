
-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  preferred_name text,
  campus text,
  wellness_goals text[] not null default '{}',
  affirmation_categories text[] not null default '{}',
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile read" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- MOOD ENTRIES
create table public.mood_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  mood text not null check (mood in ('amazing','good','okay','low','overwhelmed')),
  contexts text[] not null default '{}',
  note text,
  created_at timestamptz not null default now()
);
create index on public.mood_entries(user_id, created_at desc);
grant select, insert, update, delete on public.mood_entries to authenticated;
grant all on public.mood_entries to service_role;
alter table public.mood_entries enable row level security;
create policy "own moods" on public.mood_entries for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- JOURNAL
create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  prompt text,
  body text not null,
  is_small_win boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.journal_entries(user_id, created_at desc);
grant select, insert, update, delete on public.journal_entries to authenticated;
grant all on public.journal_entries to service_role;
alter table public.journal_entries enable row level security;
create policy "own journal" on public.journal_entries for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- QUOTES (curated, verified)
create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  author text not null,
  source text not null,
  year text,
  license text not null
);
grant select on public.quotes to anon, authenticated;
grant all on public.quotes to service_role;
alter table public.quotes enable row level security;
create policy "quotes public" on public.quotes for select to anon, authenticated using (true);

-- AFFIRMATIONS (curated originals)
create table public.affirmations (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  text text not null
);
grant select on public.affirmations to anon, authenticated;
grant all on public.affirmations to service_role;
alter table public.affirmations enable row level security;
create policy "affirmations public" on public.affirmations for select to anon, authenticated using (true);

-- SAVED AFFIRMATIONS
create table public.saved_affirmations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  text text not null,
  category text,
  source text not null default 'curated',
  created_at timestamptz not null default now(),
  unique (user_id, text)
);
grant select, insert, delete on public.saved_affirmations to authenticated;
grant all on public.saved_affirmations to service_role;
alter table public.saved_affirmations enable row level security;
create policy "own saved" on public.saved_affirmations for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- POSITIVITY POSTS (anonymous: author_id never exposed to clients)
create table public.positivity_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null,
  body text not null check (char_length(body) between 3 and 280),
  status text not null default 'pending' check (status in ('approved','pending','hidden')),
  moderation_note text,
  heart_count int not null default 0,
  cheer_count int not null default 0,
  report_count int not null default 0,
  is_pass_forward boolean not null default false,
  created_at timestamptz not null default now()
);
grant select (id, body, status, heart_count, cheer_count, is_pass_forward, created_at) on public.positivity_posts to authenticated;
grant all on public.positivity_posts to service_role;
alter table public.positivity_posts enable row level security;
create policy "approved posts visible" on public.positivity_posts for select to authenticated using (status = 'approved');

-- REACTIONS
create table public.reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.positivity_posts(id) on delete cascade,
  user_id uuid not null default auth.uid(),
  kind text not null check (kind in ('heart','cheer')),
  created_at timestamptz not null default now(),
  unique (post_id, user_id, kind)
);
grant select, insert, delete on public.reactions to authenticated;
grant all on public.reactions to service_role;
alter table public.reactions enable row level security;
create policy "own reactions" on public.reactions for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.sync_reaction_counts() returns trigger
language plpgsql security definer set search_path = public as $$
declare pid uuid := coalesce(new.post_id, old.post_id);
begin
  update public.positivity_posts set
    heart_count = (select count(*) from public.reactions where post_id = pid and kind = 'heart'),
    cheer_count = (select count(*) from public.reactions where post_id = pid and kind = 'cheer')
  where id = pid;
  return null;
end; $$;
create trigger reactions_sync after insert or delete on public.reactions
  for each row execute function public.sync_reaction_counts();

-- REPORTS
create table public.post_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.positivity_posts(id) on delete cascade,
  user_id uuid not null default auth.uid(),
  reason text,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);
grant insert on public.post_reports to authenticated;
grant all on public.post_reports to service_role;
alter table public.post_reports enable row level security;
create policy "insert own report" on public.post_reports for insert to authenticated with check (auth.uid() = user_id);

create or replace function public.apply_report() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.positivity_posts
    set report_count = report_count + 1,
        status = case when report_count + 1 >= 3 then 'hidden' else status end
  where id = new.post_id;
  return null;
end; $$;
create trigger reports_apply after insert on public.post_reports
  for each row execute function public.apply_report();

-- Pass the Positivity: random approved message not written by caller
create or replace function public.random_positivity()
returns table (id uuid, body text)
language sql security definer set search_path = public stable as $$
  select p.id, p.body from public.positivity_posts p
  where p.status = 'approved' and p.author_id <> auth.uid()
  order by random() limit 1;
$$;
revoke execute on function public.random_positivity() from public, anon;
grant execute on function public.random_positivity() to authenticated;

-- MONTHLY RECAPS
create table public.monthly_recaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  month date not null,
  stats jsonb not null default '{}',
  narrative text,
  narrative_source text,
  created_at timestamptz not null default now(),
  unique (user_id, month)
);
grant select, insert, update, delete on public.monthly_recaps to authenticated;
grant all on public.monthly_recaps to service_role;
alter table public.monthly_recaps enable row level security;
create policy "own recaps" on public.monthly_recaps for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- SEED: verified public-domain quotes
insert into public.quotes (text, author, source, year, license) values
('The best way out is always through.', 'Robert Frost', '"A Servant to Servants," North of Boston', '1914', 'Public domain'),
('I am not afraid of storms, for I am learning how to sail my ship.', 'Louisa May Alcott', 'Little Women, Chapter 44', '1868', 'Public domain'),
('We know what we are, but know not what we may be.', 'William Shakespeare', 'Hamlet, Act 4, Scene 5', '1603', 'Public domain'),
('Though she be but little, she is fierce.', 'William Shakespeare', 'A Midsummer Night''s Dream, Act 3, Scene 2', '1600', 'Public domain'),
('If you have built castles in the air, your work need not be lost; that is where they should be. Now put the foundations under them.', 'Henry David Thoreau', 'Walden, "Conclusion"', '1854', 'Public domain'),
('Rest is not idleness, and to lie sometimes on the grass under trees on a summer''s day, listening to the murmur of the water, or watching the clouds float across the sky, is by no means a waste of time.', 'John Lubbock', 'The Use of Life, Chapter 4', '1894', 'Public domain'),
('I dwell in Possibility –', 'Emily Dickinson', 'Poem 466 (Franklin numbering)', 'c. 1862', 'Public domain'),
('"Hope" is the thing with feathers – That perches in the soul –', 'Emily Dickinson', 'Poem 314 (Franklin numbering)', 'c. 1861', 'Public domain'),
('Afoot and light-hearted I take to the open road, Healthy, free, the world before me.', 'Walt Whitman', '"Song of the Open Road," Leaves of Grass', '1856', 'Public domain'),
('The woods are lovely, dark and deep, But I have promises to keep, And miles to go before I sleep.', 'Robert Frost', '"Stopping by Woods on a Snowy Evening," New Hampshire', '1923', 'Public domain');

-- SEED: OASIS original affirmations
insert into public.affirmations (category, text) values
('academic','I am capable of learning hard things, one step at a time.'),
('academic','My worth is not measured by a single grade.'),
('academic','I showed up today, and that counts.'),
('self-worth','I deserve kindness, especially from myself.'),
('self-worth','I am enough exactly as I am right now.'),
('self-worth','My presence makes a difference to the people around me.'),
('stress','I can pause. The world will wait for one breath.'),
('stress','I only have to handle this moment, not the whole semester.'),
('stress','It is okay to slow down and take things one at a time.'),
('career','My path does not have to look like anyone else''s.'),
('career','Not knowing yet is part of figuring it out.'),
('career','Every experience is teaching me something useful.'),
('homesick','Missing home means I am connected to people who love me.'),
('homesick','I can build a sense of home here, little by little.'),
('homesick','It is okay to feel far away and still belong here.'),
('gratitude','There is something good in today, even if it is small.'),
('gratitude','I am grateful for the people who make me feel seen.'),
('gratitude','I notice the sunshine, the sky, and the small joys.'),
('compassion','I can treat myself like I would treat a good friend.'),
('compassion','Mistakes are part of growing, not proof of failure.'),
('compassion','I am allowed to rest without earning it.'),
('motivation','Small steps still move me forward.'),
('motivation','I can begin again at any moment.'),
('motivation','I have done hard things before, and I can do this too.');

-- SEED: a few starter wall messages (system-authored)
insert into public.positivity_posts (author_id, body, status) values
('00000000-0000-0000-0000-000000000000','To whoever is studying at Hayden at 2am: you''re doing amazing. Drink some water!','approved'),
('00000000-0000-0000-0000-000000000000','First semester away from home and it''s hard. If that''s you too, you''re not alone. 💛','approved'),
('00000000-0000-0000-0000-000000000000','Bombed a midterm last week, did better on the quiz today. Progress is progress, Sun Devils.','approved'),
('00000000-0000-0000-0000-000000000000','The sunset over Tempe tonight was unreal. Go look up!','approved'),
('00000000-0000-0000-0000-000000000000','Reminder: asking for help is a strength, not a weakness.','approved');
