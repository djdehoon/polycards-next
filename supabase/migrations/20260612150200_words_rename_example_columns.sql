-- Align words table with Supabase naming for example sentences.
alter table public.words
  rename column example_nl to example_word;

alter table public.words
  rename column example_uk to example_translation;
