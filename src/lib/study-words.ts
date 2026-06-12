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
};

export type StudyDirection = "ua-nl" | "nl-ua";
export type StudyDirectionMode = StudyDirection | "mix";
export type StudyMode = "flashcard" | "type";

export const STUDY_WORD_SELECT =
  "id, deck_id, sort_order, term, translation, word_uk, word_nl, translit, phonetic, example_uk, example_nl, example_word, example_translation, category, emoji";

function optionalString(value: unknown): string | null {
  if (value == null || value === "") return null;
  return String(value);
}

function coalesceString(...values: unknown[]): string {
  for (const value of values) {
    if (value == null) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return "";
}

export function normalizeStudyWord(row: Record<string, unknown>): StudyWord {
  const term = coalesceString(row.word_uk, row.term);
  const translation = coalesceString(row.word_nl, row.translation);

  return {
    id: String(row.id),
    deck_id: String(row.deck_id),
    term,
    translation,
    sort_order:
      typeof row.sort_order === "number" ? row.sort_order : undefined,
    translit: optionalString(row.translit ?? row.phonetic),
    example_uk: optionalString(row.example_uk ?? row.example_word),
    example_nl: optionalString(row.example_nl ?? row.example_translation),
    category: optionalString(row.category),
    emoji: optionalString(row.emoji),
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
