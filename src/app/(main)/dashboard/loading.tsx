export default function DashboardLoading() {
  return (
    <div className="flex-1 animate-pulse px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="h-10 w-48 rounded bg-zinc-800" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-24 rounded-xl bg-zinc-800" />
          <div className="h-24 rounded-xl bg-zinc-800" />
        </div>
        <div className="h-32 rounded-xl bg-zinc-800" />
      </div>
    </div>
  );
}
