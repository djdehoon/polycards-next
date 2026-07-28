export interface DictionaryEntry {
  word: string;
  phonetic: string;
  meaning_nl: string;
  word_type: string;
  proficiency_level: string;
}

export interface SegmentResult {
  text: string;
  entry: DictionaryEntry | null;
  isKnown: boolean;
}

/** Max characters for a single dictionary phrase match (greedy). */
export const MAX_PHRASE_LENGTH = 4;

const HANZI_RE = /[\u3400-\u9fff]/u;

function isHanziChar(ch: string): boolean {
  return HANZI_RE.test(ch);
}

export function buildDictionaryMap(
  entries: DictionaryEntry[],
): Map<string, DictionaryEntry> {
  const map = new Map<string, DictionaryEntry>();
  for (const entry of entries) {
    const key = entry.word.trim();
    if (!key) continue;
    map.set(key, { ...entry, word: key });
  }
  return map;
}

/** Lookup a word/phrase in the dictionary map (column `word`). */
export function dictionaryLookup(
  dictionaryMap: Map<string, DictionaryEntry>,
  word: string,
): DictionaryEntry | null {
  return dictionaryMap.get(word) ?? null;
}

/**
 * Greedy longest-match-first segmentation.
 * Tries phrase length 4 → 3 → 2 → 1 before accepting an unknown character.
 */
export function segmentChinese(
  text: string,
  dictionaryMap: Map<string, DictionaryEntry>,
): SegmentResult[] {
  const chars = Array.from(text);
  const results: SegmentResult[] = [];
  let i = 0;

  while (i < chars.length) {
    const ch = chars[i];

    // Keep punctuation / latin / spaces as single unknown tokens.
    if (!isHanziChar(ch)) {
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

export function getAnalysisStats(segments: SegmentResult[]) {
  const known = segments.filter((s) => s.isKnown);
  const unknown = segments.filter((s) => !s.isKnown);
  return {
    total: segments.length,
    known: known.length,
    unknown: unknown.length,
    coverage:
      segments.length > 0
        ? Math.round((known.length / segments.length) * 100)
        : 0,
    unknownWords: unknown.map((s) => s.text),
    hskBreakdown: {
      hsk1: known.filter((s) => s.entry?.proficiency_level === "HSK 1").length,
      hsk2: known.filter((s) => s.entry?.proficiency_level === "HSK 2").length,
      hsk3: known.filter((s) => s.entry?.proficiency_level === "HSK 3").length,
    },
  };
}
