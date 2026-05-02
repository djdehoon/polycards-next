import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { logoutAction } from "./actions";

type Deck = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  sort_order: number;
};

function deckEmoji(slug: string): string {
  const map: Record<string, string> = { general: "🗂️" };
  return map[slug] ?? "📚";
}

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  const { data: rows, error } = await supabase
    .from("decks")
    .select("id, slug, title, description, sort_order")
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true })
    .returns<Deck[]>();

  const decks = !error && rows ? rows : [];
  const showEmpty = !error && decks.length === 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <main className="mx-auto max-w-3xl px-4 py-10">
        <header className="mb-10 flex flex-col gap-6 border-b border-zinc-800 pb-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              PolyCards
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              <span className="text-zinc-500">E-mail</span>{" "}
              <span className="font-medium text-zinc-200">{user.email}</span>
            </p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-800"
            >
              Log uit
            </button>
          </form>
        </header>

        {error ? (
          <p className="text-sm text-red-400" role="alert">
            Kon decks niet laden.
          </p>
        ) : null}

        {showEmpty ? (
          <p className="text-sm text-zinc-400">Geen decks gevonden.</p>
        ) : null}

        {!error && decks.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2">
            {decks.map((deck) => (
              <li key={deck.id}>
                <article className="flex h-full flex-col rounded-xl border border-zinc-800 bg-zinc-900 p-5 ring-1 ring-white/5">
                  <div className="flex flex-1 items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <span className="text-3xl leading-none" aria-hidden>
                        {deckEmoji(deck.slug)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h2 className="font-semibold text-zinc-50">{deck.title}</h2>
                        {deck.description ? (
                          <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
                            {deck.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <Link
                      href={`/study?deck=${deck.id}`}
                      className="shrink-0 rounded-md bg-zinc-600 px-3 py-1.5 text-xs font-medium text-zinc-100 transition hover:bg-zinc-500"
                    >
                      Studeren →
                    </Link>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        ) : null}
      </main>
    </div>
  );
}

