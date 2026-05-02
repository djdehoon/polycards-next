import Link from "next/link";

export default function BrowsePage() {
  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold text-zinc-900">Browse</h1>
      <p className="text-sm text-zinc-600">
        Deck and word browsing will live here. This is a placeholder page.
      </p>
      <Link
        href="/dashboard"
        className="text-sm font-medium text-zinc-900 underline underline-offset-2"
      >
        ← Back to dashboard
      </Link>
    </main>
  );
}
