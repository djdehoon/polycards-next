import { redirect } from "next/navigation";
import { BrowseToolbar } from "@/components/BrowseToolbar";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ProgressRow } from "@/lib/srs";
import { fsrsStateLabel } from "@/lib/stats-helpers";

type Deck = {
  id: string;
  title: string;
  description: string | null;
  sort_order: number;
};

type WordRow = {
  id: string;
  deck_id: string;
  word: string;
  translation: string;
  sort_order: number;
};

function firstString(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  const { data: deckRows, error: deckErr } = await supabase
    .from("decks")
    .select("id, title, description, sort_order")
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true })
    .returns<Deck[]>();

  const decks = !deckErr && deckRows ? deckRows : [];
  if (deckErr) {
    return (
      <div className="flex-1 px-4 py-8">
        <p className="text-sm text-red-400" role="alert">
          Kon decks niet laden.
        </p>
      </div>
    );
  }

  if (decks.length === 0) {
    return (
      <div className="flex-1 px-4 py-8">
        <main className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-semibold text-zinc-50">Browse</h1>
          <p className="mt-2 text-sm text-zinc-400">Geen decks beschikbaar.</p>
        </main>
      </div>
    );
  }

  const deckParam = firstString(sp.deck);
  const deckId = deckParam && decks.some((d) => d.id === deckParam)
    ? deckParam
    : decks[0].id;

  const statusFilter = firstString(sp.status) ?? "all";
  const qRaw = (firstString(sp.q) ?? "").trim().toLowerCase();

  const { data: words, error: wErr } = await supabase
    .from("words")
    .select("id, deck_id, word, translation, sort_order")
    .eq("deck_id", deckId)
    .order("sort_order", { ascending: true })
    .returns<WordRow[]>();

  if (wErr || !words) {
    return (
      <div className="flex-1 px-4 py-8">
        <p className="text-sm text-red-400" role="alert">
          Kon woorden niet laden.
        </p>
      </div>
    );
  }

  const wordIds = words.map((w) => w.id);
  let progressByWord = new Map<string, ProgressRow>();
  if (wordIds.length > 0) {
    const { data: prog, error: pErr } = await supabase
      .from("user_progress")
      .select(
        "id, user_id, word_id, stability, difficulty, state, reps, lapses, due_date, last_reviewed_at, last_rating, updated_at",
      )
      .eq("user_id", user.id)
      .in("word_id", wordIds);

    if (!pErr && prog) {
      progressByWord = new Map(prog.map((r) => [r.word_id, r as ProgressRow]));
    }
  }

  const rows = words
    .map((w) => {
      const p = progressByWord.get(w.id);
      const status = p ? fsrsStateLabel(p.state) : "New";
      return { word: w, status, progress: p };
    })
    .filter(({ word, status }) => {
      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (!qRaw) return true;
      return (
        word.word.toLowerCase().includes(qRaw) ||
        word.translation.toLowerCase().includes(qRaw)
      );
    });

  const currentDeck = decks.find((d) => d.id === deckId) ?? decks[0];

  return (
    <div className="flex-1 px-4 py-8">
      <main className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold text-zinc-50">Browse</h1>
        {currentDeck.description ? (
          <p className="mt-1 text-sm text-zinc-500">{currentDeck.description}</p>
        ) : null}

        <div className="mt-6">
          <BrowseToolbar
            key={`${deckId}-${statusFilter}-${qRaw}`}
            decks={decks}
            initialQ={qRaw}
          />
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-800 ring-1 ring-white/5">
          <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900 text-xs uppercase tracking-wide text-zinc-500">
                <th className="px-4 py-3 font-medium">Woord</th>
                <th className="px-4 py-3 font-medium">Vertaling</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 bg-zinc-950">
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-zinc-500"
                  >
                    Geen woorden voor deze filters.
                  </td>
                </tr>
              ) : (
                rows.map(({ word, status, progress }) => (
                  <tr key={word.id} className="hover:bg-zinc-900/80">
                    <td className="px-4 py-3 font-medium text-zinc-100">
                      {word.word}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">
                      {word.translation}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{status}</td>
                    <td className="px-4 py-3 text-zinc-500">
                      {progress
                        ? new Date(progress.due_date).toLocaleString("nl-NL", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
