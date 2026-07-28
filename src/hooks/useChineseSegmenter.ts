"use client";

import { useCallback, useState } from "react";
import {
  buildDictionaryMap,
  getAnalysisStats,
  segmentChinese,
  type SegmentResult,
} from "@/lib/chineseSegmenter";
import { fetchDictionaryEntries } from "@/lib/fetchDictionary";

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
      const entries = await fetchDictionaryEntries("nl-zh");

      if (entries.length === 0) {
        setSegments([]);
        setStats(null);
        setError(
          "Dictionary-tabel geeft 0 rijen terug (leeg of geen SELECT-rechten).",
        );
        return;
      }

      const dictMap = buildDictionaryMap(entries);
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
