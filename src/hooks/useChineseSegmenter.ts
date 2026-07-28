"use client";

import { useCallback, useState } from "react";
import {
  buildDictionaryMap,
  getAnalysisStats,
  segmentChinese,
  type DictionaryEntry,
  type SegmentResult,
} from "@/lib/chineseSegmenter";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type DictionaryRow = {
  word: string;
  phonetic: string | null;
  meaning_nl: string | null;
  word_type: string | null;
  proficiency_level: string | null;
};

function normalizeEntry(row: DictionaryRow): DictionaryEntry {
  return {
    word: row.word,
    phonetic: row.phonetic?.trim() || "?",
    meaning_nl: row.meaning_nl?.trim() || "Onbekend",
    word_type: row.word_type?.trim() || "Onbekend",
    proficiency_level: row.proficiency_level?.trim() || "",
  };
}

export function useChineseSegmenter() {
  const [segments, setSegments] = useState<SegmentResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ReturnType<typeof getAnalysisStats> | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (text: string) => {
    if (!text.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const { data: entries, error: fetchError } = await supabase
        .from("dictionary")
        .select("word, phonetic, meaning_nl, word_type, proficiency_level")
        .eq("language_pair_code", "nl-zh");

      if (fetchError) throw fetchError;

      if (!entries || entries.length === 0) {
        setSegments([]);
        setStats(null);
        setError(
          "Dictionary-tabel geeft 0 rijen terug (leeg of geen SELECT-rechten).",
        );
        return;
      }

      const normalized = (entries as DictionaryRow[]).map(normalizeEntry);
      const dictMap = buildDictionaryMap(normalized);
      const result = segmentChinese(text, dictMap);
      setSegments(result);
      setStats(getAnalysisStats(result));
    } catch (err) {
      setSegments([]);
      setStats(null);
      setError(
        err instanceof Error ? err.message : "Kon dictionary niet laden.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return { segments, stats, loading, error, analyze };
}
