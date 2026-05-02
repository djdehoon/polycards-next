/**
 * Legacy static catalog used before Supabase.
 * Seeded into Postgres via `supabase/seed.sql` — keep rows aligned when editing.
 *
 * @typedef {{ deckSlug: string, term: string, translation: string, sortOrder?: number }} LegacyWord
 */

/** @type {LegacyWord[]} */
const WORDS = [
  { deckSlug: "general", term: "hello", translation: "bonjour", sortOrder: 0 },
  { deckSlug: "general", term: "goodbye", translation: "au revoir", sortOrder: 1 },
  { deckSlug: "general", term: "please", translation: "s'il vous plaît", sortOrder: 2 },
  { deckSlug: "general", term: "thank you", translation: "merci", sortOrder: 3 },
  { deckSlug: "general", term: "yes", translation: "oui", sortOrder: 4 },
  { deckSlug: "general", term: "no", translation: "non", sortOrder: 5 },
  { deckSlug: "general", term: "water", translation: "eau", sortOrder: 6 },
  { deckSlug: "general", term: "bread", translation: "pain", sortOrder: 7 },
  { deckSlug: "general", term: "friend", translation: "ami / amie", sortOrder: 8 },
  { deckSlug: "general", term: "today", translation: "aujourd'hui", sortOrder: 9 },
];

module.exports = { WORDS };
