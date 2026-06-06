import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ProgressRow } from "@/lib/srs";
import { ActivityHeatmap } from "@/components/ActivityHeatmap";
import {
  deckWordStats,
  percentLearned,
  utcTodayString,
  addUtcDays,
} from "@/lib/stats-helpers";
import {
  buildHeatmapDays,
  computeSessionStats,
  fetchUserSessionsSince,
} from "@/lib/queries";

type Deck = {
  id: string;
  title: string;
  sort_order: number;
};

type WordRow = { id: string; deck_id: string };

export default async function StatsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  const now = new Date();
  const todayUtc = utcTodayString(now);

  const { data: decks, error: deckErr } = await supabase
    .from("decks")
    .select("id, title, sort_order")
    .order("sort_order", { ascending: true })
    .returns<Deck[]>();

  if (deckErr || !decks?.length) {
    return (
      <div className="flex-1 px-4 py-8">
        <main className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-semibold text-zinc-50">Stats</h1>
          <p className="mt-2 text-sm text-zinc-400">
            {deckErr ? "Kon geen decks laden." : "Geen decks."}
          </p>
        </main>
      </div>
    );
  }

  const deckIds = decks.map((d) => d.id);
  const { data: wordRows } = await supabase
    .from("words")
    .select("id, deck_id")
    .in("deck_id", deckIds)
    .returns<WordRow[]>();

  const words = wordRows ?? [];
  const wordsByDeck = new Map<string, string[]>();
  for (const w of words) {
    const list = wordsByDeck.get(w.deck_id) ?? [];
    list.push(w.id);
    wordsByDeck.set(w.deck_id, list);
  }

  const allWordIds = words.map((w) => w.id);
  let progressByWord = new Map<string, ProgressRow>();
  if (allWordIds.length > 0) {
    const { data: prog } = await supabase
      .from("user_progress")
      .select(
        "id, user_id, word_id, stability, difficulty, state, reps, lapses, due_date, last_reviewed_at, last_rating, updated_at",
      )
      .eq("user_id", user.id)
      .in("word_id", allWordIds);

    if (prog) {
      progressByWord = new Map(prog.map((r) => [r.word_id, r as ProgressRow]));
    }
  }

  let totalLearned = 0;
  let ratingSum = 0;
  let ratingN = 0;
  for (const p of progressByWord.values()) {
    if (p.reps > 0) totalLearned += 1;
    if (p.last_rating != null && p.last_rating >= 1 && p.last_rating <= 4) {
      ratingSum += p.last_rating;
      ratingN += 1;
    }
  }
  const avgRating = ratingN > 0 ? ratingSum / ratingN : null;

  const sessionStart = addUtcDays(todayUtc, -400);
  const sessions = await fetchUserSessionsSince(
    supabase,
    user.id,
    sessionStart,
  );
  const { cardsStudiedToday, streakDays: streak } = computeSessionStats(
    sessions,
    todayUtc,
  );
  const heatmapDays = buildHeatmapDays(sessions, todayUtc, 30);

  const deckStats = decks.map((deck) => {
    const wordIds = wordsByDeck.get(deck.id) ?? [];
    const slice = new Map<string, ProgressRow>();
    for (const wid of wordIds) {
      const p = progressByWord.get(wid);
      if (p) slice.set(wid, p);
    }
    const s = deckWordStats(wordIds, slice, now);
    return {
      deck,
      stats: s,
      pct: percentLearned(s),
    };
  });

  return (
    <div className="flex-1 px-4 py-8">
      <main className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold text-zinc-50">Stats</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Overzicht op basis van je voortgang en study-sessies (UTC).
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 ring-1 ring-white/5">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Vandaag
            </p>
            <p className="mt-1 text-2xl font-semibold text-zinc-50">
              {cardsStudiedToday}
            </p>
            <p className="text-xs text-zinc-500">ratings vandaag</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 ring-1 ring-white/5">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Totaal geleerd
            </p>
            <p className="mt-1 text-2xl font-semibold text-zinc-50">
              {totalLearned}
            </p>
            <p className="text-xs text-zinc-500">woorden met reps &gt; 0</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 ring-1 ring-white/5">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Streak
            </p>
            <p className="mt-1 text-2xl font-semibold text-zinc-50">
              {streak} dagen
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 ring-1 ring-white/5">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Gem. rating
            </p>
            <p className="mt-1 text-2xl font-semibold text-zinc-50">
              {avgRating != null ? avgRating.toFixed(2) : "—"}
            </p>
          </div>
        </div>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-zinc-100">
            Activiteit (30 dagen)
          </h2>
          <div className="mt-3">
            <ActivityHeatmap days={heatmapDays} />
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-zinc-100">Per deck</h2>
          <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-800 ring-1 ring-white/5">
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900 text-xs uppercase tracking-wide text-zinc-500">
                  <th className="px-4 py-3 font-medium">Deck</th>
                  <th className="px-4 py-3 font-medium">New</th>
                  <th className="px-4 py-3 font-medium">Learning</th>
                  <th className="px-4 py-3 font-medium">Review</th>
                  <th className="px-4 py-3 font-medium">Relearning</th>
                  <th className="px-4 py-3 font-medium">% klaar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 bg-zinc-950">
                {deckStats.map(({ deck, stats, pct }) => (
                  <tr key={deck.id} className="hover:bg-zinc-900/80">
                    <td className="px-4 py-3 font-medium text-zinc-100">
                      {deck.title}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{stats.new}</td>
                    <td className="px-4 py-3 text-zinc-400">{stats.learning}</td>
                    <td className="px-4 py-3 text-zinc-400">{stats.review}</td>
                    <td className="px-4 py-3 text-zinc-400">
                      {stats.relearning}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
