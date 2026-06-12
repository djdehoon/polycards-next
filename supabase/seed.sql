-- Seed catalog from legacy/general.js (WORDS). Idempotent on slug + (deck_id, word).

insert into public.decks (slug, title, description, sort_order)
values ('general', 'General', 'Starter vocabulary', 0)
on conflict (slug) do nothing;

insert into public.words (deck_id, word, translation, sort_order)
select d.id, v.word, v.translation, v.sort_order
from public.decks d
cross join (
  values
    ('hello', 'bonjour', 0),
    ('goodbye', 'au revoir', 1),
    ('please', 's''il vous plaît', 2),
    ('thank you', 'merci', 3),
    ('yes', 'oui', 4),
    ('no', 'non', 5),
    ('water', 'eau', 6),
    ('bread', 'pain', 7),
    ('friend', 'ami / amie', 8),
    ('today', 'aujourd''hui', 9)
) as v(word, translation, sort_order)
where d.slug = 'general'
on conflict (deck_id, word) do nothing;
