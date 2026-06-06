"use client";

import { useEffect, useState, startTransition } from "react";

const STORAGE_KEY = "polycards:dailyGoal";
const OPTIONS = [5, 10, 20] as const;

const sectionClass =
  "rounded-lg border border-zinc-800 bg-zinc-900 p-3 ring-1 ring-white/5 sm:p-4";

export function DailyGoalPanel({
  cardsStudiedToday,
}: {
  cardsStudiedToday: number;
}) {
  const [goal, setGoal] = useState<number>(10);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    startTransition(() => {
      setMounted(true);
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? Number.parseInt(raw, 10) : NaN;
      if (parsed === 5 || parsed === 10 || parsed === 20) {
        setGoal(parsed);
      }
    });
  }, []);

  function persist(next: (typeof OPTIONS)[number]) {
    setGoal(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  }

  if (!mounted) {
    return (
      <section className={sectionClass}>
        <h2 className="text-sm font-semibold text-zinc-200">Dagdoel</h2>
        <p className="mt-1 text-xs text-zinc-500">Laden…</p>
      </section>
    );
  }

  const met = cardsStudiedToday >= goal;

  return (
    <section className={sectionClass}>
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-zinc-200">Dagdoel</h2>
          <p className="mt-0.5 text-[11px] text-zinc-500 sm:mt-0 sm:text-xs">
            Kaarten met een rating vandaag (UTC):{" "}
            <span className="font-medium text-zinc-200">{cardsStudiedToday}</span>{" "}
            / <span className="font-medium text-zinc-200">{goal}</span>
            {met ? (
              <span className="ml-2 text-emerald-400">— gehaald</span>
            ) : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => persist(n)}
              className={`rounded-md border px-2.5 py-1 text-xs font-medium transition sm:text-sm ${
                goal === n
                  ? "border-zinc-500 bg-zinc-800 text-zinc-50"
                  : "border-zinc-700 bg-zinc-950 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
              }`}
            >
              {n} / dag
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
