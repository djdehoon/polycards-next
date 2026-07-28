import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { DictionaryEntry } from "@/lib/chineseSegmenter";

type DictionaryRow = {
  word: string;
  phonetic: string | null;
  meaning_nl: string | null;
  word_type: string | null;
  proficiency_level: string | null;
};

const PAGE_SIZE = 1000;

function normalizeEntry(row: DictionaryRow): DictionaryEntry | null {
  const word = row.word?.trim();
  if (!word) return null;
  return {
    word,
    phonetic: row.phonetic?.trim() || "?",
    meaning_nl: row.meaning_nl?.trim() || "Onbekend",
    word_type: row.word_type?.trim() || "Onbekend",
    proficiency_level: row.proficiency_level?.trim() || "",
  };
}

/** Loads all dictionary rows (Supabase defaults to max 1000 without pagination). */
export async function fetchDictionaryEntries(
  languagePairCode: string,
): Promise<DictionaryEntry[]> {
  const supabase = createBrowserSupabaseClient();
  const entries: DictionaryEntry[] = [];
  let from = 0;

  for (;;) {
    const { data, error } = await supabase
      .from("dictionary")
      .select("word, phonetic, meaning_nl, word_type, proficiency_level")
      .eq("language_pair_code", languagePairCode)
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    for (const row of data as DictionaryRow[]) {
      const entry = normalizeEntry(row);
      if (entry) entries.push(entry);
    }

    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return entries;
}
