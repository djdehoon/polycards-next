/**
 * Feature flags per language pair.
 * Update this file to toggle features for specific languages — no API calls.
 */

export const LANGUAGE_FEATURES = {
  "nl-uk": {
    name: "Nederlands → Oekraïens",
    hasWordAnalysis: false,
    hasAudio: true,
    hasImages: true,
    hasPinyin: false,
  },
  "nl-zh": {
    name: "Nederlands → Chinees",
    hasWordAnalysis: true,
    hasAudio: true,
    hasImages: false,
    hasPinyin: true,
  },
  "nl-es": {
    name: "Nederlands → Spaans",
    hasWordAnalysis: false,
    hasAudio: true,
    hasImages: false,
    hasPinyin: false,
  },
  "en-es": {
    name: "Engels → Spaans",
    hasWordAnalysis: false,
    hasAudio: true,
    hasImages: false,
    hasPinyin: false,
  },
} as const;

export type LanguageFeatures = {
  name: string;
  hasWordAnalysis: boolean;
  hasAudio: boolean;
  hasImages: boolean;
  hasPinyin: boolean;
};

const DEFAULT_FEATURES: LanguageFeatures = {
  name: "Onbekend",
  hasWordAnalysis: false,
  hasAudio: true,
  hasImages: false,
  hasPinyin: false,
};

function lookupFeatures(code: string): LanguageFeatures | undefined {
  if (Object.prototype.hasOwnProperty.call(LANGUAGE_FEATURES, code)) {
    return LANGUAGE_FEATURES[code as keyof typeof LANGUAGE_FEATURES];
  }
  return undefined;
}

export function hasWordAnalysis(code: string): boolean {
  return lookupFeatures(code)?.hasWordAnalysis || false;
}

export function hasPinyin(code: string): boolean {
  return lookupFeatures(code)?.hasPinyin || false;
}

export function hasAudio(code: string): boolean {
  return lookupFeatures(code)?.hasAudio ?? true;
}

export function hasImages(code: string): boolean {
  return lookupFeatures(code)?.hasImages || false;
}

export function getFeatures(code: string): LanguageFeatures {
  return lookupFeatures(code) ?? DEFAULT_FEATURES;
}
