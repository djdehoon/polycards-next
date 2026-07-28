"use client";

import { useEffect, useState, type MouseEvent } from "react";
import {
  buildDictionaryMap,
  getAnalysisStats,
  segmentChinese,
  type DictionaryEntry,
  type SegmentResult,
} from "@/lib/chineseSegmenter";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { hasWordAnalysis } from "@/config/features";
import { isSpeakAbortError, speakWord } from "@/lib/audio";

type DictionaryRow = {
  word: string;
  phonetic: string | null;
  meaning_nl: string | null;
  word_type: string | null;
  proficiency_level: string | null;
};

type SentenceAnalysisProps = {
  chineseSentence: string;
  pinyinSentence?: string;
  languagePairCode: string;
  isExpanded: boolean;
  onExpandedChange: (open: boolean) => void;
};

function hasHanzi(text: string): boolean {
  return /[\u4e00-\u9fff]/u.test(text);
}

function normalizeRow(row: DictionaryRow): DictionaryEntry {
  return {
    word: row.word,
    phonetic: row.phonetic?.trim() || "?",
    meaning_nl: row.meaning_nl?.trim() || "Onbekend",
    word_type: row.word_type?.trim() || "Onbekend",
    proficiency_level: row.proficiency_level?.trim() || "",
  };
}

function segmentDisplay(segment: SegmentResult) {
  if (segment.isKnown && segment.entry) {
    return segment.entry;
  }
  return {
    word: segment.text,
    phonetic: "?",
    meaning_nl: "Onbekend",
    word_type: "Onbekend",
    proficiency_level: "",
  };
}

export function SentenceAnalysis({
  chineseSentence,
  languagePairCode,
  isExpanded,
  onExpandedChange,
}: SentenceAnalysisProps) {
  const [segments, setSegments] = useState<SegmentResult[]>([]);
  const [stats, setStats] = useState<ReturnType<typeof getAnalysisStats> | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [analyzedSentence, setAnalyzedSentence] = useState<string | null>(null);
  const enabled = hasWordAnalysis(languagePairCode);

  useEffect(() => {
    if (!enabled || !isExpanded) return;
    if (analyzedSentence === chineseSentence) return;

    let cancelled = false;

    async function analyzeSentence() {
      setIsLoading(true);
      setLoadError(null);
      setSegments([]);
      setStats(null);
      try {
        if (!hasHanzi(chineseSentence)) {
          if (!cancelled) {
            setSegments([]);
            setStats(null);
            setAnalyzedSentence(chineseSentence);
            setIsLoading(false);
          }
          return;
        }

        const supabase = createBrowserSupabaseClient();
        const { data, error } = await supabase
          .from("dictionary")
          .select("word, phonetic, meaning_nl, word_type, proficiency_level")
          .eq("language_pair_code", languagePairCode);

        if (error) throw error;
        if (cancelled) return;

        if (!data || data.length === 0) {
          setLoadError(
            "Dictionary-tabel geeft 0 rijen terug (leeg of geen SELECT-rechten). Vul public.dictionary voor nl-zh en zet een SELECT-policy voor anon/authenticated.",
          );
          setSegments([]);
          setStats(null);
          setAnalyzedSentence(chineseSentence);
          return;
        }

        const dictMap = buildDictionaryMap(
          (data as DictionaryRow[]).map(normalizeRow),
        );
        const result = segmentChinese(chineseSentence, dictMap);
        setSegments(result);
        setStats(getAnalysisStats(result));
        setAnalyzedSentence(chineseSentence);
      } catch (error) {
        console.error("Error analyzing sentence:", error);
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Kon dictionary niet laden.",
          );
          setSegments([]);
          setStats(null);
          setAnalyzedSentence(chineseSentence);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void analyzeSentence();
    return () => {
      cancelled = true;
    };
  }, [
    enabled,
    isExpanded,
    analyzedSentence,
    chineseSentence,
    languagePairCode,
  ]);

  if (!enabled) return null;

  function handleToggle(e: MouseEvent) {
    e.stopPropagation();
    onExpandedChange(!isExpanded);
  }

  function handleAudioClick(e: MouseEvent, text: string) {
    e.stopPropagation();
    void speakWord(text, "zh-CN").catch((err) => {
      if (!isSpeakAbortError(err)) {
        console.error("[audio] speak failed:", err);
      }
    });
  }

  return (
    <div
      className="mt-4 w-full"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={handleToggle}
        className="w-full rounded-lg border-2 border-zinc-600 bg-zinc-800 px-4 py-2 font-semibold text-zinc-100 transition-all hover:border-emerald-500 hover:bg-zinc-700"
      >
        📖 Uitleg {isExpanded ? "▲" : "▼"}
      </button>

      {isExpanded ? (
        <div className="analysis-panel-enter mt-2 rounded-lg border border-zinc-600 bg-zinc-800 p-2.5">
          {isLoading ? (
            <p className="text-center text-sm italic text-zinc-400">
              Analyseren...
            </p>
          ) : (
            <>
              {loadError ? (
                <p className="mb-2 text-center text-xs text-emerald-400/90">
                  {loadError}
                </p>
              ) : null}
              {segments.length === 0 ? (
                <p className="text-center text-sm text-zinc-400">
                  Geen Chinese karakters gevonden.
                </p>
              ) : (
                <>
                  <div className="mb-3 flex flex-wrap gap-x-1 gap-y-1">
                    {segments.map((segment, index) => (
                      <span
                        key={`${segment.text}-${index}`}
                        className={`zh-sentence text-lg ${
                          segment.isKnown
                            ? "border-b-2 border-emerald-500 text-zinc-100"
                            : "border-b-2 border-red-500 text-zinc-400"
                        }`}
                      >
                        {segment.text}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {segments.map((segment, index) => {
                      const word = segmentDisplay(segment);
                      return (
                        <div
                          key={`${word.word}-${index}`}
                          className="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-md bg-zinc-900 px-2.5 py-1.5 transition-colors hover:bg-zinc-800"
                        >
                          <div className="flex min-w-[4.5rem] items-baseline gap-1.5">
                            <span
                              className={`zh-sentence text-xl font-semibold leading-none ${
                                segment.isKnown ? "text-zinc-100" : "text-red-400"
                              }`}
                            >
                              {word.word}
                            </span>
                            <span className="text-xs italic text-zinc-400">
                              ({word.phonetic || "?"})
                            </span>
                          </div>

                          <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5">
                            <span className="text-sm font-medium text-zinc-200">
                              {word.meaning_nl}
                            </span>
                            <span className="text-zinc-600">·</span>
                            <span className="text-xs text-emerald-400/90">
                              {word.word_type}
                            </span>
                            {word.proficiency_level ? (
                              <>
                                <span className="text-zinc-600">·</span>
                                <span className="text-xs text-zinc-400">
                                  {word.proficiency_level}
                                </span>
                              </>
                            ) : null}
                          </div>

                          <button
                            type="button"
                            onClick={(e) => handleAudioClick(e, word.word)}
                            className="flex h-8 w-8 items-center justify-center rounded border border-zinc-600 bg-zinc-800 text-sm transition-all hover:border-emerald-500 hover:bg-emerald-600"
                            title="Luister uitspraak"
                          >
                            🔊
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  {stats ? (
                    <div className="mt-3 border-t border-zinc-700 pt-3 text-xs text-zinc-400">
                      <p>
                        Coverage:{" "}
                        <span className="font-semibold text-emerald-400">
                          {stats.coverage}%
                        </span>{" "}
                        · HSK 1: {stats.hskBreakdown.hsk1} · HSK 2:{" "}
                        {stats.hskBreakdown.hsk2} · HSK 3:{" "}
                        {stats.hskBreakdown.hsk3}
                      </p>
                      {stats.unknownWords.length > 0 ? (
                        <p className="mt-1">
                          Onbekend:{" "}
                          <span className="zh-sentence text-red-400">
                            {stats.unknownWords.join(", ")}
                          </span>
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </>
              )}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
