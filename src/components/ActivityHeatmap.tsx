import type { HeatmapDay } from "@/lib/queries";

type ActivityHeatmapProps = {
  days: HeatmapDay[];
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

export function ActivityHeatmap({ days }: ActivityHeatmapProps) {
  return (
    <div>
      <div className="flex flex-wrap gap-1">
        {days.map((day) => (
          <div
            key={day.date}
            title={tooltipLabel(day)}
            aria-label={tooltipLabel(day)}
            className={`h-8 w-8 rounded-sm border sm:h-9 sm:w-9 ${
              day.active
                ? "border-emerald-700 bg-emerald-600/90"
                : "border-zinc-800 bg-zinc-900"
            }`}
          />
        ))}
      </div>
      <p className="mt-2 text-xs text-zinc-500">
        Groen = minstens één rating die dag (UTC).
      </p>
    </div>
  );
}
