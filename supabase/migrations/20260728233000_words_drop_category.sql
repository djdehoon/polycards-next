-- Study headers use decks.title via words.deck_id; category is unused by the app.
alter table public.words drop column if exists category;
