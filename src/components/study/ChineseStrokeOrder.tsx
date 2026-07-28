"use client";

import { useEffect, useRef, useState } from "react";

type HanziWriterInstance = {
  animateCharacter: (options?: {
    onComplete?: (data: { canceled: boolean }) => void;
  }) => Promise<unknown>;
  hideCharacter: (options?: { duration?: number }) => Promise<unknown>;
};

function extractHanzi(text: string): string[] {
  return Array.from(text.matchAll(/[\u4e00-\u9fff]/gu)).map((m) => m[0]);
}

const SIZE = 320;
const DELAY_MS = 400;

export function ChineseStrokeOrder({ characters }: { characters: string }) {
  const chars = extractHanzi(characters);
  const [open, setOpen] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const containerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const writersRef = useRef<HanziWriterInstance[]>([]);

  useEffect(() => {
    if (!open || chars.length === 0) return;

    let cancelled = false;
    writersRef.current = [];

    async function run() {
      const { default: HanziWriter } = await import("hanzi-writer");
      if (cancelled) return;

      const writers: HanziWriterInstance[] = [];
      for (let i = 0; i < chars.length; i++) {
        const el = containerRefs.current[i];
        if (!el) continue;
        el.replaceChildren();
        const writer = HanziWriter.create(el, chars[i], {
          width: SIZE,
          height: SIZE,
          padding: 4,
          showOutline: true,
          strokeColor: "#34d399",
          outlineColor: "#3f3f46",
          strokeAnimationSpeed: 3,
          delayBetweenStrokes: 200,
          delayBetweenLoops: 500,
        }) as HanziWriterInstance;
        await writer.hideCharacter({ duration: 0 });
        writers.push(writer);
      }
      if (cancelled) return;
      writersRef.current = writers;

      setAnimating(true);
      for (let i = 0; i < writers.length; i++) {
        if (cancelled) break;
        await new Promise<void>((resolve) => {
          void writers[i].animateCharacter({
            onComplete: () => resolve(),
          });
        });
        if (cancelled || i >= writers.length - 1) break;
        await new Promise((r) => setTimeout(r, DELAY_MS));
      }
      if (!cancelled) setAnimating(false);
    }

    void run();

    return () => {
      cancelled = true;
      writersRef.current = [];
      for (const el of containerRefs.current) {
        el?.replaceChildren();
      }
    };
  }, [open, chars.join(""), replayKey]);

  if (chars.length === 0) return null;

  return (
    <div
      className="mt-2 flex w-full flex-col items-center gap-2"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="flex items-center gap-2 rounded-xl bg-zinc-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-600"
      >
        {open ? "Verberg Stroke Order" : "Toon Stroke Order"}
      </button>

      {open ? (
        <>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {chars.map((char, i) => (
              <div
                key={`${char}-${i}`}
                ref={(el) => {
                  containerRefs.current[i] = el;
                }}
                className="h-[320px] w-[320px] rounded-lg bg-zinc-900/80"
                aria-label={`Stroke order voor ${char}`}
              />
            ))}
          </div>
          <button
            type="button"
            disabled={animating}
            onClick={(e) => {
              e.stopPropagation();
              setReplayKey((k) => k + 1);
            }}
            className="rounded-xl bg-zinc-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Opnieuw
          </button>
        </>
      ) : null}
    </div>
  );
}
