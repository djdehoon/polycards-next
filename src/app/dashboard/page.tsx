import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { logoutAction } from "./actions";

const EMOJI_BY_SLUG: Record<string, string> = {
  general: "🗂️",
};

function deckEmoji(slug: string): string {
  return EMOJI_BY_SLUG[slug] ?? "📚";
}

type DeckRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  sort_order: number;
};

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  const { data: decks, error: decksError } = await supabase
    .from("decks")
    .select("id, slug, title, description, sort_order")
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true })
    .returns<DeckRow[]>();

  const list = decks ?? [];

  return (
    <main className="min-h-full bg-zinc-950 px-4 py-8 text-zinc-100">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Ingelogd als{" "}
              <span className="font-medium text-zinc-200">{user.email}</span>
            </p>
          </div>
          <form action={logoutAction} className="shrink-0">
            <button
              type="submit"
              className="rounded-lg border border-zinc-600 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:bg-zinc-800"
            >
              Log uit
            </button>
          </form>
        </header>

        {decksError ? (
          <p className="text-sm text-red-400" role="alert">
            Kon decks niet laden.
          </p>
        ) : null}

        {!decksError && list.length === 0 ? (
          <p className="text-sm text-zinc-400">Geen decks gevonden.</p>
        ) : null}

        {!decksError && list.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2">
            {list.map((deck) => (
              <li key={deck.id}>
                <article className="flex h-full flex-col rounded-xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-lg shadow-black/20 ring-1 ring-white/5">
                  <div className="mb-4 flex items-start gap-3">
                    <span
                      className="text-3xl leading-none"
                      aria-hidden
                    >
                      {deckEmoji(deck.slug)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-semibold text-zinc-50">
                        {deck.title}
                      </h2>
                      {deck.description ? (
                        <p className="mt-1 line-clamp-2 text-sm text-zinc-400">
                          {deck.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-auto pt-2">
                    <Link
                      href={`/study?deck=${encodeURIComponent(deck.id)}`}
                      className="inline-flex w-full items-center justify-center rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-white"
                    >
                      Study
                    </Link>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </main>
  );
}
