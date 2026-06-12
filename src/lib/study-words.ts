/** Study card fields mirror Supabase `words` columns: `word` = Dutch, `translation` = Ukrainian. */
export type StudyWord = {
  id: string;
  deck_id: string;
  word: string;
  translation: string;
  sort_order?: number;
  phonetic?: string | null;
  example_word?: string | null;
  example_translation?: string | null;
  category?: string | null;
  emoji?: string | null;
  deckTitle?: string | null;
};

export type StudyDirection = "ua-nl" | "nl-ua";
export type StudyDirectionMode = StudyDirection | "mix";
export type StudyMode = "flashcard" | "type";

export const STUDY_WORD_SELECT =
  "id, deck_id, sort_order, word, translation, phonetic, example_word, example_translation, category, emoji";

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

/** Returns [dutch, ukrainian] for StudyWord.word / StudyWord.translation */
function fixNlUkWordPair(dutch: string, ukrainian: string): [string, string] {
  if (dutch && ukrainian && hasCyrillic(dutch) && !hasCyrillic(ukrainian)) {
    return [ukrainian, dutch];
  }
  if (!dutch && ukrainian && hasCyrillic(ukrainian)) {
    return ["", ukrainian];
  }
  if (dutch && !ukrainian && !hasCyrillic(dutch)) {
    return [dutch, ""];
  }
  if (dutch && !ukrainian && hasCyrillic(dutch)) {
    return ["", dutch];
  }
  return [dutch, ukrainian];
}

/** Returns [ukrainian, dutch] for StudyWord.example_translation / example_word */
function fixNlUkExamplePair(
  ukrainian: string,
  dutch: string,
): [string, string] {
  if (
    ukrainian &&
    dutch &&
    !hasCyrillic(ukrainian) &&
    hasCyrillic(dutch)
  ) {
    return [dutch, ukrainian];
  }
  if (ukrainian && !hasCyrillic(ukrainian)) {
    return ["", dutch || ukrainian];
  }
  return [ukrainian, dutch];
}

export function normalizeStudyWord(row: Record<string, unknown>): StudyWord {
  const [word, translation] = fixNlUkWordPair(
    coalesceString(row.word, row.term),
    coalesceString(row.translation),
  );

  const [example_translation, example_word] = fixNlUkExamplePair(
    coalesceString(row.example_translation, row.example_uk, row.example_term),
    coalesceString(row.example_word, row.example_nl),
  );

  return {
    id: String(row.id),
    deck_id: String(row.deck_id),
    word,
    translation,
    sort_order:
      typeof row.sort_order === "number" ? row.sort_order : undefined,
    phonetic: optionalString(row.phonetic ?? row.translit),
    example_word: optionalString(example_word),
    example_translation: optionalString(example_translation),
    category: optionalString(row.category),
    emoji: optionalString(row.emoji),
    deckTitle: extractDeckTitle(row) ?? optionalString(row.category),
  };
}

export function getPhonetic(studyWord: StudyWord): string | null {
  return studyWord.phonetic ?? null;
}

export function getStudyExamples(studyWord: StudyWord): string[] {
  return [studyWord.example_translation, studyWord.example_word].filter(
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
