export interface DictionaryEntry {
  word: string;
  phonetic: string;
  meaning_nl: string;
  word_type_nl: string;
  proficiency_level: string;
}

export interface SegmentCharacter {
  char: string;
  entry: DictionaryEntry | null;
}

export interface SegmentResult {
  text: string;
  entry: DictionaryEntry | null;
  isKnown: boolean;
  /** Per-character lookups for multi-char phrases (2+). */
  characters?: SegmentCharacter[];
}

/** Max characters for a single dictionary phrase match (greedy). */
export const MAX_PHRASE_LENGTH = 4;

const HANZI_RE = /[\u3400-\u9fff]/u;
const PUNCTUATION =
  /[\u3000-\u303F\uFF00-\uFFEF.,;:!?(){}[\]<>""''、。，；：！？（）【】《》「」『』]/u;

function isHanziChar(ch: string): boolean {
  return HANZI_RE.test(ch);
}

function isPunctuation(ch: string): boolean {
  return PUNCTUATION.test(ch);
}

/** True when the whole segment is punctuation (no dictionary card needed). */
export function isPunctuationSegment(text: string): boolean {
  const chars = Array.from(text);
  return chars.length > 0 && chars.every((ch) => isPunctuation(ch));
}

/**
 * Normalize Chinese text for consistent dictionary lookups
 * - Unicode NFC normalization
 * - Remove zero-width/invisible chars
 * - Trim whitespace
 */
export function normalizeDictionaryWord(word: string): string {
  return word
    .normalize("NFC")
    .replace(/[\u200b-\u200f\ufeff]/g, "")
    .trim();
}

export function buildDictionaryMap(
  entries: DictionaryEntry[],
): Map<string, DictionaryEntry> {
  const map = new Map<string, DictionaryEntry>();
  for (const entry of entries) {
    const normalizedWord = normalizeDictionaryWord(entry.word);
    if (!normalizedWord) continue;
    map.set(normalizedWord, { ...entry, word: normalizedWord });
  }
  return map;
}

/** Lookup a word/phrase in the dictionary map (column `word`). */
export function dictionaryLookup(
  dictionaryMap: Map<string, DictionaryEntry>,
  word: string,
): DictionaryEntry | null {
  const substring = normalizeDictionaryWord(word);
  if (!substring) return null;
  return dictionaryMap.get(substring) ?? null;
}

function buildCharacterBreakdown(
  phrase: string,
  dictionaryMap: Map<string, DictionaryEntry>,
): SegmentCharacter[] | undefined {
  const chars = Array.from(phrase);
  if (chars.length < 2) return undefined;
  return chars.map((char) => ({
    char,
    entry: dictionaryLookup(dictionaryMap, char),
  }));
}

/**
 * Greedy longest-match-first segmentation.
 * Tries phrase length 4 → 3 → 2 → 1 before accepting an unknown character.
 */
export function segmentChinese(
  text: string,
  dictionaryMap: Map<string, DictionaryEntry>,
): SegmentResult[] {
  const chars = Array.from(normalizeDictionaryWord(text));
  const results: SegmentResult[] = [];
  let i = 0;

  while (i < chars.length) {
    const ch = chars[i];

    // Punctuation and other non-Hanzi as single unknown tokens.
    if (isPunctuation(ch) || !isHanziChar(ch)) {
      results.push({ text: ch, entry: null, isKnown: false });
      i += 1;
      continue;
    }

    let matched = false;
    const maxLen = Math.min(MAX_PHRASE_LENGTH, chars.length - i);

    for (let len = maxLen; len >= 1; len -= 1) {
      const slice = chars.slice(i, i + len);
      if (!slice.every(isHanziChar)) continue;

      const candidate = slice.join("");
      const entry = dictionaryLookup(dictionaryMap, candidate);
      if (entry) {
        results.push({
          text: candidate,
          entry,
          isKnown: true,
          characters: buildCharacterBreakdown(candidate, dictionaryMap),
        });
        i += len;
        matched = true;
        break;
      }
    }

    if (!matched) {
      results.push({ text: chars[i], entry: null, isKnown: false });
      i += 1;
    }
  }

  return results;
}

export function parseHskLevel(level: string | null | undefined): 1 | 2 | 3 | null {
  if (!level) return null;
  const match = level.trim().match(/hsk\s*([123])/i);
  if (!match) return null;
  return Number(match[1]) as 1 | 2 | 3;
}

export function getAnalysisStats(segments: SegmentResult[]) {
  const lexical = segments.filter((s) => !isPunctuationSegment(s.text));
  const known = lexical.filter((s) => s.isKnown);
  const unknown = lexical.filter((s) => !s.isKnown);

  let hsk1 = 0;
  let hsk2 = 0;
  let hsk3 = 0;
  for (const segment of known) {
    const level = parseHskLevel(segment.entry?.proficiency_level);
    if (level === 1) hsk1 += 1;
    else if (level === 2) hsk2 += 1;
    else if (level === 3) hsk3 += 1;
  }

  return {
    total: lexical.length,
    known: known.length,
    unknown: unknown.length,
    coverage:
      lexical.length > 0
        ? Math.round((known.length / lexical.length) * 100)
        : 0,
    unknownWords: unknown.map((s) => s.text),
    hskBreakdown: { hsk1, hsk2, hsk3 },
  };
}
