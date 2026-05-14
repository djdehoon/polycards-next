export default function BrowseLoading() {
  return (
    <div className="flex-1 animate-pulse px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="h-8 w-40 rounded bg-zinc-800" />
        <div className="h-24 rounded-xl bg-zinc-800" />
        <div className="h-64 rounded-xl bg-zinc-800" />
      </div>
    </div>
  );
}
