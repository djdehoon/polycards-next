export default function DashboardLoading() {
  return (
    <div className="flex-1 animate-pulse px-4 py-4 sm:py-5">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[5.5rem] rounded-xl bg-zinc-800 sm:h-24" />
          ))}
        </div>
        <div className="h-20 rounded-lg bg-zinc-800" />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="h-32 rounded-lg bg-zinc-800" />
          <div className="h-32 rounded-lg bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}
