-- FSRS-friendly user_progress columns (migrate legacy columns if present)

alter table public.user_progress
  add column if not exists stability real,
  add column if not exists difficulty real,
  add column if not exists state integer,
  add column if not exists reps integer,
  add column if not exists lapses integer,
  add column if not exists due_date timestamptz;

-- Defaults for new columns
update public.user_progress
set
  stability = coalesce(stability, 1),
  difficulty = coalesce(difficulty, 5),
  state = coalesce(state, 0),
  reps = coalesce(reps, repetitions, 0),
  lapses = coalesce(lapses, 0),
  due_date = coalesce(
    due_date,
    next_review_at,
    now()
  )
where true;

alter table public.user_progress
  alter column stability set default 1,
  alter column difficulty set default 5,
  alter column state set default 0,
  alter column reps set default 0,
  alter column lapses set default 0,
  alter column due_date set default now();

alter table public.user_progress
  alter column stability set not null,
  alter column difficulty set not null,
  alter column state set not null,
  alter column reps set not null,
  alter column lapses set not null,
  alter column due_date set not null;

drop index if exists public.user_progress_next_review_idx;

alter table public.user_progress drop column if exists ease_factor;
alter table public.user_progress drop column if exists interval_days;
alter table public.user_progress drop column if exists repetitions;
alter table public.user_progress drop column if exists next_review_at;

create index if not exists user_progress_due_date_idx on public.user_progress (due_date);
