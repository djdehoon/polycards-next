"use client";

import { useState } from "react";
import { useChineseSegmenter } from "@/hooks/useChineseSegmenter";
import type { SegmentResult } from "@/lib/chineseSegmenter";

function segmentColorClass(segment: SegmentResult): string {
  if (!segment.isKnown) {
    return "border-b-2 border-red-500 text-zinc-300";
  }
  const charCount = Array.from(segment.text).length;
  if (charCount >= 2) {
    return "border-b-2 border-amber-400 text-amber-100";
  }
  return "border-b-2 border-emerald-500 text-zinc-100";
}

export function ChineseAnalyzer() {
  const [text, setText] = useState("");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { segments, stats, loading, error, analyze } = useChineseSegmenter();

  const activeSegment =
    activeIndex !== null ? (segments[activeIndex] ?? null) : null;

  function handleAnalyze() {
    setActiveIndex(null);
    void analyze(text);
  }

  function handleSegmentClick(index: number) {
    setActiveIndex((current) => (current === index ? null : index));
  }

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-lg">
      <h2 className="text-lg font-semibold text-zinc-100">
        Chinese zin analyseren
      </h2>
      <p className="mt-1 text-sm text-zinc-400">
        Greedy longest-match (max 4) — groen = 1 teken, geel = phrase, rood =
        onbekend. Tap voor details + karakter-breakdown.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Voer Chinese tekst in..."
        rows={4}
        className="zh-sentence mt-4 w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-lg text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      />

      <button
        type="button"
        onClick={handleAnalyze}
        disabled={loading || !text.trim()}
        className="mt-4 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Analyseren..." : "Analyseer"}
      </button>

      {error ? (
        <p className="mt-4 text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="mt-4 text-sm italic text-zinc-400">Analyseren...</p>
      ) : null}

      {!loading && segments.length > 0 ? (
        <>
          <div className="mt-6 flex flex-wrap gap-x-1 gap-y-2">
            {segments.map((segment, index) => (
              <button
                key={`${segment.text}-${index}`}
                type="button"
                onClick={() => handleSegmentClick(index)}
                className={`zh-sentence cursor-pointer rounded px-0.5 text-xl transition-colors hover:bg-zinc-800 ${segmentColorClass(segment)} ${
                  activeIndex === index ? "bg-zinc-800" : ""
                }`}
              >
                {segment.text}
              </button>
            ))}
          </div>

          {activeSegment ? (
            <div className="mt-4 max-h-72 overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-950 p-4 sm:max-h-96">
              {activeSegment.isKnown && activeSegment.entry ? (
                <>
                  <dl className="grid gap-2 text-sm">
                    <div>
                      <dt className="text-zinc-500">Karakters</dt>
                      <dd className="zh-sentence text-lg font-semibold text-zinc-100">
                        {activeSegment.text}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-zinc-500">Pinyin</dt>
                      <dd className="text-zinc-200">
                        {activeSegment.entry.phonetic}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-zinc-500">Betekenis</dt>
                      <dd className="text-zinc-200">
                        {activeSegment.entry.meaning_nl}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-zinc-500">HSK level</dt>
                      <dd className="text-zinc-200">
                        {activeSegment.entry.proficiency_level || "—"}
                      </dd>
                    </div>
                  </dl>

                  {activeSegment.characters &&
                  activeSegment.characters.length >= 2 ? (
                    <>
                      <hr className="my-4 border-zinc-700" />
                      <p className="mb-2 text-sm font-semibold text-zinc-200">
                        📖 Karakters:
                      </p>
                      <ul className="flex flex-col gap-1.5 text-sm text-zinc-300">
                        {activeSegment.characters.map((item, i) => (
                          <li
                            key={`${item.char}-${i}`}
                            className="flex flex-wrap items-baseline gap-x-1.5"
                          >
                            <span className="zh-sentence text-base font-semibold text-zinc-100">
                              {item.char}
                            </span>
                            <span className="italic text-zinc-400">
                              {item.entry?.phonetic || "?"}
                            </span>
                            <span className="text-zinc-600">·</span>
                            <span>
                              {item.entry?.meaning_nl || "Onbekend"}
                            </span>
                            <span className="text-zinc-600">·</span>
                            <span className="text-zinc-400">
                              {item.entry?.proficiency_level || "—"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                </>
              ) : (
                <p className="text-sm text-zinc-300">
                  <span className="zh-sentence font-semibold">
                    {activeSegment.text}
                  </span>{" "}
                  — Onbekend woord
                </p>
              )}
            </div>
          ) : null}

          {stats ? (
            <div className="mt-6 rounded-lg border border-zinc-700 bg-zinc-950 p-4">
              <h3 className="text-sm font-semibold text-zinc-200">
                Statistieken
              </h3>
              <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-zinc-500">Coverage</dt>
                  <dd className="text-lg font-semibold text-emerald-400">
                    {stats.coverage}%
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Segmenten</dt>
                  <dd className="text-zinc-200">
                    {stats.known} bekend / {stats.unknown} onbekend (
                    {stats.total} totaal)
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500">HSK breakdown</dt>
                  <dd className="text-zinc-200">
                    HSK 1: {stats.hskBreakdown.hsk1} · HSK 2:{" "}
                    {stats.hskBreakdown.hsk2} · HSK 3:{" "}
                    {stats.hskBreakdown.hsk3}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-zinc-500">Onbekende woorden</dt>
                  <dd className="mt-1">
                    {stats.unknownWords.length > 0 ? (
                      <span className="flex flex-wrap gap-2">
                        {stats.unknownWords.map((word, i) => (
                          <span
                            key={`${word}-${i}`}
                            className="zh-sentence rounded-md border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-zinc-200"
                          >
                            {word}
                          </span>
                        ))}
                      </span>
                    ) : (
                      <span className="text-zinc-400">Geen</span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
