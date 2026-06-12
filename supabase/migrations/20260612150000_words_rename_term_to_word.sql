-- Align words table with Supabase naming: term -> word (Dutch vocabulary item).
alter table public.words
  drop constraint if exists words_deck_id_term_key;

alter table public.words
  rename column term to word;

alter table public.words
  add constraint words_deck_id_word_key unique (deck_id, word);
