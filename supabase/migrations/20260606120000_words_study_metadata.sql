-- Optional study UI metadata (translit, examples, category).
alter table public.words
  add column if not exists translit text,
  add column if not exists example_uk text,
  add column if not exists example_nl text,
  add column if not exists category text,
  add column if not exists emoji text;
