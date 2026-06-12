export type StudyWord = {
  id: string;
  deck_id: string;
  term: string;
  translation: string;
  sort_order?: number;
  translit?: string | null;
  example_uk?: string | null;
  example_nl?: string | null;
  category?: string | null;
  emoji?: string | null;
  deckTitle?: string | null;
};

export type StudyDirection = "ua-nl" | "nl-ua";
export type StudyDirectionMode = StudyDirection | "mix";
export type StudyMode = "flashcard" | "type";

export const STUDY_WORD_SELECT =
  "id, deck_id, sort_order, term, translation, translit, phonetic, example_uk, example_nl, example_term, example_word, example_translation, category, emoji";

function optionalString(value: unknown): string | null {
  if (value == null || value === "") return null;
  return String(value);
}

function extractDeckTitle(row: Record<string, unknown>): string | null {
  const decks = row.decks;
  if (decks && typeof decks === "object" && decks !== null && "title" in decks) {
    return optionalString((decks as { title?: unknown }).title);
  }
  return null;
}

function coalesceString(...values: unknown[]): string {
  for (const value of values) {
    if (value == null) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return "";
}

const CYRILLIC_PATTERN = /[\u0400-\u04FF]/;

function hasCyrillic(text: string): boolean {
  return CYRILLIC_PATTERN.test(text);
}

function fixNlUkWordPair(term: string, translation: string): [string, string] {
  if (
    term &&
    translation &&
    !hasCyrillic(term) &&
    hasCyrillic(translation)
  ) {
    return [translation, term];
  }
  if (!term && translation && hasCyrillic(translation)) {
    return [translation, ""];
  }
  if (term && !translation && !hasCyrillic(term)) {
    return ["", term];
  }
  return [term, translation];
}

function fixNlUkExamplePair(
  exampleUk: string,
  exampleNl: string,
): [string, string] {
  if (
    exampleUk &&
    exampleNl &&
    !hasCyrillic(exampleUk) &&
    hasCyrillic(exampleNl)
  ) {
    return [exampleNl, exampleUk];
  }
  if (exampleUk && !hasCyrillic(exampleUk)) {
    return ["", exampleNl || exampleUk];
  }
  return [exampleUk, exampleNl];
}

export function normalizeStudyWord(row: Record<string, unknown>): StudyWord {
  const [term, translation] = fixNlUkWordPair(
    coalesceString(row.term, row.word_uk),
    coalesceString(row.translation, row.word_nl),
  );

  const [exampleUk, exampleNl] = fixNlUkExamplePair(
    coalesceString(row.example_term, row.example_uk, row.example_word),
    coalesceString(row.example_translation, row.example_nl),
  );

  return {
    id: String(row.id),
    deck_id: String(row.deck_id),
    term,
    translation,
    sort_order:
      typeof row.sort_order === "number" ? row.sort_order : undefined,
    translit: optionalString(row.translit ?? row.phonetic),
    example_uk: optionalString(exampleUk),
    example_nl: optionalString(exampleNl),
    category: optionalString(row.category),
    emoji: optionalString(row.emoji),
    deckTitle: extractDeckTitle(row) ?? optionalString(row.category),
  };
}

export function getTranslit(word: StudyWord): string | null {
  return word.translit ?? null;
}

export function getStudyExamples(word: StudyWord): string[] {
  return [word.example_uk, word.example_nl].filter(
    (ex): ex is string => Boolean(ex),
  );
}

export function resolveDirection(
  mode: StudyDirectionMode,
  wordId: string,
): StudyDirection {
  if (mode === "ua-nl" || mode === "nl-ua") return mode;
  let hash = 0;
  for (let i = 0; i < wordId.length; i += 1) {
    hash = (hash + wordId.charCodeAt(i)) % 2;
  }
  return hash === 0 ? "ua-nl" : "nl-ua";
}

export function compareAnswer(given: string, expected: string): boolean {
  return given.trim().toLowerCase() === expected.trim().toLowerCase();
}

export function isUkrainianPrompt(
  direction: StudyDirection,
): boolean {
  return direction === "ua-nl";
}
