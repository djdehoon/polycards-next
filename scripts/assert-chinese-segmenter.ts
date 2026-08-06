/**
 * Smoke assert for greedy Chinese segmentation.
 * Run: npx tsx scripts/assert-chinese-segmenter.ts
 *
 * Test case: "地铁很快" with dict containing 地铁/很/快
 * Should segment as: ["地铁", "很", "快"]
 * NOT: ["地", "铁很快"]
 */
import {
  buildDictionaryMap,
  segmentChinese,
  type DictionaryEntry,
} from "../src/lib/chineseSegmenter";

function entry(
  word: string,
  meaning_nl = word,
): DictionaryEntry {
  return {
    word,
    phonetic: "",
    meaning_nl,
    word_type_nl: "",
    proficiency_level: "",
  };
}

function assertEqual(actual: string[], expected: string[], label: string) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    console.error(`FAIL ${label}\n  expected: ${e}\n  actual:   ${a}`);
    process.exitCode = 1;
    return;
  }
  console.log(`OK   ${label} → ${a}`);
}

const withMetro = buildDictionaryMap([
  entry("地铁", "metro"),
  entry("地", "grond"),
  entry("铁", "ijzer"),
  entry("很", "heel"),
  entry("快", "snel"),
  // Spurious phrase that must NOT win when 地铁 is present
  entry("铁很快", "bogus"),
]);

assertEqual(
  segmentChinese("地铁很快", withMetro).map((s) => s.text),
  ["地铁", "很", "快"],
  "地铁很快 with 地铁 in dict",
);

const withoutMetro = buildDictionaryMap([
  entry("地", "grond"),
  entry("铁", "ijzer"),
  entry("很", "heel"),
  entry("快", "snel"),
  entry("铁很快", "bogus"),
]);

assertEqual(
  segmentChinese("地铁很快", withoutMetro).map((s) => s.text),
  ["地", "铁很快"],
  "地铁很快 without 地铁 (documents failure mode)",
);

if (process.exitCode) {
  process.exit(process.exitCode);
}
