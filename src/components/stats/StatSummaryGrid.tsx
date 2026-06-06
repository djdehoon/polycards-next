import { GradientStatCard } from "./GradientStatCard";

type StatSummaryGridProps = {
  cardsStudiedToday: number;
  totalLearned: number;
  totalWords?: number;
  streak: number;
  avgRating: number | null;
  compact?: boolean;
};

export function StatSummaryGrid({
  cardsStudiedToday,
  totalLearned,
  totalWords,
  streak,
  avgRating,
  compact = false,
}: StatSummaryGridProps) {
  const learnedValue =
    totalWords != null && totalWords > 0 ? (
      <>
        {totalLearned}
        <span className="text-sm font-normal text-white/70">
          {" "}
          / {totalWords} woorden
        </span>
      </>
    ) : (
      totalLearned
    );

  return (
    <div
      className={`mb-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3 ${
        compact ? "" : "lg:gap-4"
      }`}
    >
      <GradientStatCard
        index={0}
        label="Vandaag geoefend"
        value={cardsStudiedToday}
        icon="✨"
        variant="blue"
        compact={compact}
        hint={compact ? undefined : "ratings vandaag"}
      />
      <GradientStatCard
        index={1}
        label="Totaal geleerd"
        value={learnedValue}
        icon="📚"
        variant="orange"
        compact={compact}
        hint={compact ? undefined : "woorden met reps > 0"}
      />
      <GradientStatCard
        index={2}
        label="Streak"
        value={`${streak} dagen`}
        icon="🔥"
        variant="purple"
        compact={compact}
      />
      <GradientStatCard
        index={3}
        label="Gem. rating"
        value={avgRating != null ? avgRating.toFixed(2) : "—"}
        icon="⭐"
        variant="yellow"
        compact={compact}
        hint={
          compact
            ? "Laatste knop (1–4), gemiddeld over kaarten"
            : undefined
        }
      />
    </div>
  );
}
