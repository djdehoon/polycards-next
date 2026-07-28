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

const MAX_PHRASE_LENGTH = 4;

export function buildDictionaryMap(
  entries: DictionaryEntry[],
): Map<string, DictionaryEntry> {
  const map = new Map<string, DictionaryEntry>();
  for (const entry of entries) {
    map.set(entry.word, entry);
  }
  return map;
}

export function segmentChinese(
  text: string,
  dictionaryMap: Map<string, DictionaryEntry>,
): SegmentResult[] {
  const results: SegmentResult[] = [];
  let i = 0;

  while (i < text.length) {
    let matched = false;

    for (let len = MAX_PHRASE_LENGTH; len >= 1; len--) {
      const candidate = text.slice(i, i + len);
      if (dictionaryMap.has(candidate)) {
        results.push({
          text: candidate,
          entry: dictionaryMap.get(candidate)!,
          isKnown: true,
        });
        i += len;
        matched = true;
        break;
      }
    }

    if (!matched) {
      results.push({ text: text[i], entry: null, isKnown: false });
      i++;
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
