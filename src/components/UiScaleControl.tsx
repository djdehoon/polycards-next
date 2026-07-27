"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "polycards:uiScale";
const STEPS = [1, 1.1, 1.2, 1.35, 1.5] as const;
const DEFAULT_SCALE = 1.2;

function applyScale(scale: number) {
  document.documentElement.style.fontSize = `${scale * 100}%`;
}

export function UiScaleControl() {
  const [scale, setScale] = useState(DEFAULT_SCALE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? Number(raw) : DEFAULT_SCALE;
    const next = (STEPS as readonly number[]).includes(parsed)
      ? parsed
      : DEFAULT_SCALE;
    setScale(next);
    applyScale(next);
    setReady(true);
  }, []);

  function change(delta: -1 | 1) {
    const index = STEPS.indexOf(scale as (typeof STEPS)[number]);
    const from = index >= 0 ? index : STEPS.indexOf(DEFAULT_SCALE);
    const next = STEPS[Math.min(STEPS.length - 1, Math.max(0, from + delta))];
    setScale(next);
    localStorage.setItem(STORAGE_KEY, String(next));
    applyScale(next);
  }

  if (!ready) return null;

  const atMin = scale <= STEPS[0];
  const atMax = scale >= STEPS[STEPS.length - 1];

  return (
    <div
      className="pointer-events-auto fixed bottom-3 left-4 z-50 flex items-center gap-1 rounded-md border border-zinc-700/60 bg-zinc-950/85 p-1 text-zinc-200 backdrop-blur-sm"
      role="group"
      aria-label="Tekstgrootte"
    >
      <button
        type="button"
        disabled={atMin}
        onClick={() => change(-1)}
        className="rounded px-2 py-1 text-sm font-semibold transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Tekst kleiner"
        title="Kleiner"
      >
        A−
      </button>
      <span className="min-w-[2.75rem] text-center text-[10px] tabular-nums text-zinc-400">
        {Math.round(scale * 100)}%
      </span>
      <button
        type="button"
        disabled={atMax}
        onClick={() => change(1)}
        className="rounded px-2 py-1 text-sm font-semibold transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Tekst groter"
        title="Groter"
      >
        A+
      </button>
    </div>
  );
}
