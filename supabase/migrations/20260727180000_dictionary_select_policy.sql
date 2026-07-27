-- Dictionary catalog: readable by anyone with the anon key (same as words/decks).
-- Without this, SELECT returns 0 rows and SentenceAnalysis falls back to "Onbekend".

alter table public.dictionary enable row level security;

drop policy if exists "dictionary selectable by anon" on public.dictionary;

create policy "dictionary selectable by anon"
on public.dictionary for select
to anon, authenticated
using (true);
