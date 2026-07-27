import type { SpeechLanguage } from "@/lib/audio";

export const LANGUAGE_PAIR_CODES = ["nl-uk", "nl-zh", "en-es"] as const;
export type LanguagePairCode = (typeof LANGUAGE_PAIR_CODES)[number];

export const DEFAULT_LANGUAGE_PAIR: LanguagePairCode = "nl-uk";

export const LANGUAGE_PAIR_COOKIE = "polycards-language-pair";
export const LANGUAGE_PAIR_STORAGE_KEY = "polycards:languagePair";

export type LanguagePair = {
  code: LanguagePairCode;
  source_language: string;
  target_language: string;
  flag_emoji: string;
  sort_order: number;
};

export const FALLBACK_LANGUAGE_PAIRS: LanguagePair[] = [
  {
    code: "nl-uk",
    source_language: "Nederlands",
    target_language: "Oekraïens",
    flag_emoji: "🇺🇦",
    sort_order: 0,
  },
  {
    code: "nl-zh",
    source_language: "Nederlands",
    target_language: "Chinees",
    flag_emoji: "🇨🇳",
    sort_order: 1,
  },
  {
    code: "en-es",
    source_language: "English",
    target_language: "Spanish",
    flag_emoji: "🇪🇸",
    sort_order: 2,
  },
];

export type LanguagePairMeta = {
  targetSpeechLang: SpeechLanguage;
  targetShort: string;
  targetLabel: string;
  directionToNl: string;
  directionFromNl: string;
};

const PAIR_META: Record<LanguagePairCode, LanguagePairMeta> = {
  "nl-uk": {
    targetSpeechLang: "uk-UA",
    targetShort: "UA",
    targetLabel: "Oekraïens",
    directionToNl: "UA → NL",
    directionFromNl: "NL → UA",
  },
  "nl-zh": {
    targetSpeechLang: "zh-CN",
    targetShort: "ZH",
    targetLabel: "Chinees",
    directionToNl: "ZH → NL",
    directionFromNl: "NL → ZH",
  },
  "en-es": {
    targetSpeechLang: "es-ES",
    targetShort: "ES",
    targetLabel: "Spanish",
    directionToNl: "ES → EN",
    directionFromNl: "EN → ES",
  },
};

export function parseLanguagePairCode(
  value: string | null | undefined,
): LanguagePairCode | null {
  if (value === "nl-uk" || value === "nl-zh" || value === "en-es") return value;
  return null;
}

export function getLanguagePairMeta(code: LanguagePairCode): LanguagePairMeta {
  return PAIR_META[code];
}

export function languagePairLabel(pair: LanguagePair): string {
  return `${pair.flag_emoji} ${pair.source_language} → ${pair.target_language}`;
}

export function languagePairFilterOr(pairCode: LanguagePairCode): string {
  if (pairCode === "nl-uk") {
    return "language_pair_code.eq.nl-uk,language_pair_code.is.null";
  }
  return `language_pair_code.eq.${pairCode}`;
}

type FilterableQuery = {
  or: (filters: string) => FilterableQuery;
  eq: (column: string, value: string) => FilterableQuery;
};

export function applyLanguagePairWordFilter<T extends FilterableQuery>(
  query: T,
  pairCode: LanguagePairCode,
): T {
  if (pairCode === "nl-uk") {
    return query.or(languagePairFilterOr(pairCode)) as T;
  }
  return query.eq("language_pair_code", pairCode) as T;
}

export function getStudyDirectionStorageKey(pairCode: LanguagePairCode): string {
  return `polycards:studyDirection:${pairCode}`;
}

export async function getLanguagePairFromCookie(): Promise<LanguagePairCode> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const value = cookieStore.get(LANGUAGE_PAIR_COOKIE)?.value;
  return parseLanguagePairCode(value) ?? DEFAULT_LANGUAGE_PAIR;
}

export function findLanguagePair(
  pairs: LanguagePair[],
  code: LanguagePairCode,
): LanguagePair {
  return pairs.find((p) => p.code === code) ?? FALLBACK_LANGUAGE_PAIRS[0];
}
