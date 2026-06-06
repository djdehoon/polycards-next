"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { HeatmapDay } from "@/lib/queries";

type ActivityHeatmapProps = {
  days: HeatmapDay[];
};

type HeatLevel = 0 | 1 | 2 | 3 | 4;

const levelClasses: Record<HeatLevel, string> = {
  0: "border-zinc-800 bg-zinc-900",
  1: "border-emerald-800 bg-emerald-900/80",
  2: "border-emerald-600 bg-emerald-700/90",
  3: "border-emerald-500 bg-emerald-600",
  4: "border-emerald-400 bg-emerald-500",
};

function formatHeatmapDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00.000Z`);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function tooltipLabel(day: HeatmapDay): string {
  if (day.count === 0) {
    return `0 ratings on ${formatHeatmapDate(day.date)}`;
  }
  const label = day.count === 1 ? "rating" : "ratings";
  return `${day.count} ${label} on ${formatHeatmapDate(day.date)}`;
}

function heatLevel(count: number, max: number): HeatLevel {
  if (count === 0) return 0;
  if (max <= 1) return 4;
  const ratio = count / max;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

export function ActivityHeatmap({ days }: ActivityHeatmapProps) {
  const reduce = useReducedMotion();
  const maxCount = days.reduce((m, d) => Math.max(m, d.count), 0);

  return (
    <div>
      <div
        className="flex flex-wrap gap-1.5"
        role="img"
        aria-label="30-day study activity heatmap"
      >
        {days.map((day, index) => {
          const level = heatLevel(day.count, maxCount);
          const label = tooltipLabel(day);

          return (
            <motion.div
              key={day.date}
              title={label}
              aria-label={label}
              className={`h-9 w-9 rounded-md border sm:h-10 sm:w-10 ${levelClasses[level]} transition-shadow hover:ring-2 hover:ring-emerald-400/70 hover:ring-offset-1 hover:ring-offset-zinc-950`}
              initial={reduce ? false : { opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={
                reduce
                  ? { duration: 0 }
                  : {
                      type: "spring",
                      stiffness: 320,
                      damping: 24,
                      delay: index * 0.03,
                    }
              }
              whileHover={reduce ? undefined : { scale: 1.15 }}
            />
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs text-zinc-500">Less</span>
        <div className="flex gap-1">
          {([0, 1, 2, 3, 4] as const).map((level) => (
            <div
              key={level}
              className={`h-3 w-3 rounded-sm border ${levelClasses[level]}`}
              aria-hidden
            />
          ))}
        </div>
        <span className="text-xs text-zinc-500">More</span>
      </div>

      <p className="mt-2 text-xs text-zinc-500">Ratings per dag (UTC)</p>
    </div>
  );
}
