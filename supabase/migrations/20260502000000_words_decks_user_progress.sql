-- Decks: grouped vocabulary the app presents as a unit.
create table public.decks (
  id uuid primary key default gen_random_uuid (),
  slug text not null unique,
  title text not null,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Words: cards belonging to a deck (term shown / answer checked).
create table public.words (
  id uuid primary key default gen_random_uuid (),
  deck_id uuid not null references public.decks (id) on delete cascade,
  term text not null,
  translation text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now (),
  unique (deck_id, term)
);

create index words_deck_id_idx on public.words (deck_id);

-- Per-user SRS-style progress for each word.
create table public.user_progress (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  word_id uuid not null references public.words (id) on delete cascade,
  ease_factor real not null default 2.5,
  interval_days integer not null default 0,
  repetitions integer not null default 0,
  next_review_at timestamptz,
  last_reviewed_at timestamptz,
  updated_at timestamptz not null default now (),
  unique (user_id, word_id)
);

create index user_progress_user_id_idx on public.user_progress (user_id);
create index user_progress_next_review_idx on public.user_progress (next_review_at);

alter table public.decks enable row level security;
alter table public.words enable row level security;
alter table public.user_progress enable row level security;

-- Catalog content: readable by anyone with the anon key.
create policy "decks are selectable by anon"
on public.decks for select
to anon, authenticated
using (true);

create policy "words are selectable by anon"
on public.words for select
to anon, authenticated
using (true);

-- Progress is private to the signed-in user.
create policy "user_progress selectable by owner"
on public.user_progress for select
to authenticated
using (auth.uid () = user_id);

create policy "user_progress insertable by owner"
on public.user_progress for insert
to authenticated
with check (auth.uid () = user_id);

create policy "user_progress updatable by owner"
on public.user_progress for update
to authenticated
using (auth.uid () = user_id)
with check (auth.uid () = user_id);

create policy "user_progress deletable by owner"
on public.user_progress for delete
to authenticated
using (auth.uid () = user_id);
