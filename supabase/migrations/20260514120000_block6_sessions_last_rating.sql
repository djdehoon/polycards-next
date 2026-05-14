-- Block 6: study sessions (streaks / daily counts) + last SRS button rating

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  cards_studied integer not null default 0,
  created_at timestamptz not null default now (),
  unique (user_id, date)
);

create index if not exists idx_sessions_user_date on public.sessions (user_id, date);

alter table public.sessions enable row level security;

create policy "sessions selectable by owner"
on public.sessions for select
to authenticated
using (auth.uid () = user_id);

create policy "sessions insertable by owner"
on public.sessions for insert
to authenticated
with check (auth.uid () = user_id);

create policy "sessions updatable by owner"
on public.sessions for update
to authenticated
using (auth.uid () = user_id)
with check (auth.uid () = user_id);

alter table public.user_progress
  add column if not exists last_rating smallint;

alter table public.user_progress
  drop constraint if exists user_progress_last_rating_range;

alter table public.user_progress
  add constraint user_progress_last_rating_range check (
    last_rating is null or (last_rating >= 1 and last_rating <= 4)
  );

-- Atomically increment today's session counter (server uses UTC date)
create or replace function public.record_study_session ()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid ();
  d date := (timezone ('utc', now ()))::date;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.sessions (user_id, date, cards_studied)
  values (uid, d, 1)
  on conflict (user_id, date)
  do update set cards_studied = public.sessions.cards_studied + 1;
end;
$$;

revoke all on function public.record_study_session () from public;
grant execute on function public.record_study_session () to authenticated;
