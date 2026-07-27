"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { hasWordAnalysis } from "@/config/features";
import { isSpeakAbortError, speakWord } from "@/lib/audio";

type WordInfo = {
  word: string;
  phonetic: string;
  meaning_nl: string;
  word_type: string;
  proficiency_level: string;
};

type SentenceAnalysisProps = {
  chineseSentence: string;
  pinyinSentence?: string;
  languagePairCode: string;
};

function extractHanzi(text: string): string[] {
  return Array.from(text.matchAll(/[\u4e00-\u9fff]/gu)).map((m) => m[0]);
}

function normalizeRow(row: {
  word: string;
  phonetic: string | null;
  meaning_nl: string | null;
  word_type: string | null;
  proficiency_level: string | null;
}): WordInfo {
  return {
    word: row.word,
    phonetic: row.phonetic?.trim() || "?",
    meaning_nl: row.meaning_nl?.trim() || "Onbekend",
    word_type: row.word_type?.trim() || "Onbekend",
    proficiency_level: row.proficiency_level?.trim() || "",
  };
}

export function SentenceAnalysis({
  chineseSentence,
  languagePairCode,
}: SentenceAnalysisProps) {
  const [analysis, setAnalysis] = useState<WordInfo[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const enabled = hasWordAnalysis(languagePairCode);

  useEffect(() => {
    setAnalysis([]);
    setIsExpanded(false);
    setIsLoading(false);
    setLoadError(null);
  }, [chineseSentence, languagePairCode]);

  useEffect(() => {
    if (!enabled || !isExpanded || analysis.length > 0) return;

    let cancelled = false;

    async function analyzeSentence() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const characters = extractHanzi(chineseSentence);
        if (characters.length === 0) {
          if (!cancelled) {
            setAnalysis([]);
            setIsLoading(false);
          }
          return;
        }

        const supabase = createBrowserSupabaseClient();
        const { data, error } = await supabase
          .from("dictionary")
          .select("word, phonetic, meaning_nl, word_type, proficiency_level")
          .eq("language_pair_code", languagePairCode)
          .in("word", characters);

        if (error) throw error;
        if (cancelled) return;

        if (!data || data.length === 0) {
          setLoadError(
            "Dictionary-tabel geeft 0 rijen terug (leeg of geen SELECT-rechten). Vul public.dictionary voor nl-zh en zet een SELECT-policy voor anon/authenticated.",
          );
        }

        const byWord = new Map(
          (data ?? []).map((row) => [row.word, normalizeRow(row)]),
        );

        const analysisResult: WordInfo[] = characters.map(
          (char) =>
            byWord.get(char) ?? {
              word: char,
              phonetic: "?",
              meaning_nl: "Onbekend",
              word_type: "Onbekend",
              proficiency_level: "",
            },
        );

        setAnalysis(analysisResult);
      } catch (error) {
        console.error("Error analyzing sentence:", error);
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Kon dictionary niet laden.",
          );
          setAnalysis([]);
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
    analysis.length,
    chineseSentence,
    languagePairCode,
  ]);

  if (!enabled) return null;

  function handleToggle(e: MouseEvent) {
    e.stopPropagation();
    setIsExpanded((open) => !open);
  }

  function handleAudioClick(e: MouseEvent, character: string) {
    e.stopPropagation();
    void speakWord(character, "zh-CN").catch((err) => {
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
              {analysis.length === 0 ? (
                <p className="text-center text-sm text-zinc-400">
                  Geen Chinese karakters gevonden.
                </p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {analysis.map((word, index) => (
                    <div
                      key={`${word.word}-${index}`}
                      className="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-md bg-zinc-900 px-2.5 py-1.5 transition-colors hover:bg-zinc-800"
                    >
                      <div className="flex min-w-[4.5rem] items-baseline gap-1.5">
                        <span className="zh-sentence text-xl font-semibold leading-none text-zinc-100">
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
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
