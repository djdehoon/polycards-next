"use client";

import { useEffect, useState, type MouseEvent } from "react";
import {
  buildDictionaryMap,
  getAnalysisStats,
  segmentChinese,
  type SegmentResult,
} from "@/lib/chineseSegmenter";
import { fetchDictionaryEntries } from "@/lib/fetchDictionary";
import { hasWordAnalysis } from "@/config/features";
import { isSpeakAbortError, speakWord } from "@/lib/audio";

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

function segmentUnderlineClass(segment: SegmentResult): string {
  if (!segment.isKnown) {
    return "border-b-2 border-red-500 text-zinc-400";
  }
  if (Array.from(segment.text).length >= 2) {
    return "border-b-2 border-amber-400 text-amber-100";
  }
  return "border-b-2 border-emerald-500 text-zinc-100";
}

function segmentWordClass(segment: SegmentResult): string {
  if (!segment.isKnown) return "text-red-400";
  if (Array.from(segment.text).length >= 2) return "text-amber-200";
  return "text-zinc-100";
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

        const entries = await fetchDictionaryEntries(languagePairCode);
        if (cancelled) return;

        if (entries.length === 0) {
          setLoadError(
            "Dictionary-tabel geeft 0 rijen terug (leeg of geen SELECT-rechten). Vul public.dictionary voor nl-zh en zet een SELECT-policy voor anon/authenticated.",
          );
          setSegments([]);
          setStats(null);
          setAnalyzedSentence(chineseSentence);
          return;
        }

        const dictMap = buildDictionaryMap(entries);
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
        <div className="analysis-panel-enter mt-2 max-h-80 overflow-y-auto rounded-lg border border-zinc-600 bg-zinc-800 p-2.5 sm:max-h-96">
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
                        className={`zh-sentence text-lg ${segmentUnderlineClass(segment)}`}
                      >
                        {segment.text}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {segments.map((segment, index) => {
                      const word = segmentDisplay(segment);
                      const showBreakdown =
                        Boolean(segment.characters) &&
                        (segment.characters?.length ?? 0) >= 2;

                      return (
                        <div
                          key={`${word.word}-${index}`}
                          className="rounded-md bg-zinc-900 px-2.5 py-1.5 transition-colors hover:bg-zinc-800"
                        >
                          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
                            <div className="flex min-w-[4.5rem] items-baseline gap-1.5">
                              <span
                                className={`zh-sentence text-xl font-semibold leading-none ${segmentWordClass(segment)}`}
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

                          {showBreakdown ? (
                            <>
                              <hr className="my-2 border-zinc-700" />
                              <p className="mb-1.5 text-xs font-semibold text-zinc-300">
                                📖 Karakters:
                              </p>
                              <ul className="flex flex-col gap-1 text-xs text-zinc-400">
                                {segment.characters!.map((item, i) => (
                                  <li
                                    key={`${item.char}-${i}`}
                                    className="flex flex-wrap items-baseline gap-x-1.5"
                                  >
                                    <span className="zh-sentence text-sm font-semibold text-zinc-200">
                                      {item.char}
                                    </span>
                                    <span className="italic">
                                      {item.entry?.phonetic || "?"}
                                    </span>
                                    <span className="text-zinc-600">·</span>
                                    <span>
                                      {item.entry?.meaning_nl || "Onbekend"}
                                    </span>
                                    <span className="text-zinc-600">·</span>
                                    <span>
                                      {item.entry?.proficiency_level || "—"}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </>
                          ) : null}
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
