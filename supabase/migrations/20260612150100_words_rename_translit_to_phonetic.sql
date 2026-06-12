-- Align words table with Supabase naming: translit -> phonetic.
alter table public.words
  rename column translit to phonetic;
