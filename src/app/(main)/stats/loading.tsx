export default function StatsLoading() {
  return (
    <div className="flex-1 animate-pulse px-4 py-4 sm:py-5">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="h-4 w-72 max-w-full rounded bg-zinc-800" />
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-zinc-800" />
          ))}
        </div>
        <div className="rounded-xl border border-zinc-800 p-4 sm:p-5">
          <div className="h-6 w-48 rounded bg-zinc-800" />
          <div className="mt-4 flex flex-wrap gap-1.5">
            {Array.from({ length: 30 }, (_, i) => (
              <div
                key={i}
                className="h-9 w-9 rounded-md bg-zinc-800 sm:h-10 sm:w-10"
              />
            ))}
          </div>
        </div>
        <div className="h-48 rounded-xl bg-zinc-800" />
      </div>
    </div>
  );
}
