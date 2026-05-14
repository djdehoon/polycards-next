export default function StatsLoading() {
  return (
    <div className="flex-1 animate-pulse px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="h-8 w-32 rounded bg-zinc-800" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-zinc-800" />
          ))}
        </div>
        <div className="h-12 w-full max-w-md rounded bg-zinc-800" />
        <div className="h-48 rounded-xl bg-zinc-800" />
      </div>
    </div>
  );
}
