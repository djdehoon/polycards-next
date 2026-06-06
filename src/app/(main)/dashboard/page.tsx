import Link from "next/link";
import { redirect } from "next/navigation";
import { DailyGoalPanel } from "@/components/DailyGoalPanel";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ProgressRow } from "@/lib/srs";
import {
  deckWordStats,
  percentLearned,
  utcTodayString,
  addUtcDays,
} from "@/lib/stats-helpers";
import {
  computeSessionStats,
  fetchUserSessionsSince,
} from "@/lib/queries";
import { ScrollToDeck } from "./scroll-to-deck";

type Deck = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  sort_order: number;
};

type WordRow = { id: string; deck_id: string };

function deckEmoji(slug: string): string {
  const map: Record<string, string> = { general: "🗂️" };
  return map[slug] ?? "📚";
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ deck?: string }>;
}) {
  const sp = await searchParams;
  const focusSlug =
    typeof sp.deck === "string" && sp.deck.length > 0 ? sp.deck : null;

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
  const focusDeck =
    focusSlug != null
      ? (decks.find((d) => d.slug === focusSlug) ?? null)
      : null;
  const now = new Date();
  const todayUtc = utcTodayString(now);

  const deckIds = decks.map((d) => d.id);
  let wordsByDeck = new Map<string, string[]>();
  let progressByWord = new Map<string, ProgressRow>();

  if (deckIds.length > 0) {
    const { data: wordRows, error: wErr } = await supabase
      .from("words")
      .select("id, deck_id")
      .in("deck_id", deckIds)
      .returns<WordRow[]>();

    if (!wErr && wordRows?.length) {
      const byDeck = new Map<string, string[]>();
      for (const w of wordRows) {
        const list = byDeck.get(w.deck_id) ?? [];
        list.push(w.id);
        byDeck.set(w.deck_id, list);
      }
      wordsByDeck = byDeck;

      const allWordIds = wordRows.map((w) => w.id);
      const { data: prog, error: pErr } = await supabase
        .from("user_progress")
        .select(
          "id, user_id, word_id, stability, difficulty, state, reps, lapses, due_date, last_reviewed_at, last_rating, updated_at",
        )
        .eq("user_id", user.id)
        .in("word_id", allWordIds);

      if (!pErr && prog) {
        progressByWord = new Map(
          prog.map((r) => [r.word_id, r as ProgressRow]),
        );
      }
    }
  }

  const streakStartStr = addUtcDays(todayUtc, -400);

  const sessions = await fetchUserSessionsSince(
    supabase,
    user.id,
    streakStartStr,
  );
  const { cardsStudiedToday, streakDays: streak } = computeSessionStats(
    sessions,
    todayUtc,
  );

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
  let totalWordsAllDecks = 0;
  for (const ids of wordsByDeck.values()) {
    totalWordsAllDecks += ids.length;
  }

  return (
    <div className="flex-1 px-4 py-4 sm:py-5">
      <main className="mx-auto max-w-3xl">
        {focusDeck ? <ScrollToDeck slug={focusDeck.slug} /> : null}

        {error ? (
          <p className="text-sm text-red-400" role="alert">
            Kon decks niet laden.
          </p>
        ) : null}

        {!error && decks.length > 0 ? (
          <div className="mb-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 ring-1 ring-white/5 sm:p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Vandaag geoefend
              </p>
              <p className="mt-0.5 text-lg font-semibold text-zinc-50 sm:text-xl">
                {cardsStudiedToday}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 ring-1 ring-white/5 sm:p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Totaal geleerd
              </p>
              <p className="mt-0.5 text-lg font-semibold text-zinc-50 sm:text-xl">
                {totalLearned}
                {totalWordsAllDecks > 0 ? (
                  <span className="text-sm font-normal text-zinc-500">
                    {" "}
                    / {totalWordsAllDecks} woorden
                  </span>
                ) : null}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 ring-1 ring-white/5 sm:p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Streak
              </p>
              <p className="mt-0.5 text-lg font-semibold text-zinc-50 sm:text-xl">
                {streak} dagen
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 ring-1 ring-white/5 sm:p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Gem. rating
              </p>
              <p className="mt-0.5 text-lg font-semibold text-zinc-50 sm:text-xl">
                {avgRating != null ? avgRating.toFixed(2) : "—"}
              </p>
              <p className="mt-0.5 line-clamp-2 text-[10px] text-zinc-500 sm:text-[11px]">
                Laatste knop (1–4), gemiddeld over kaarten
              </p>
            </div>
          </div>
        ) : null}

        {!error && decks.length > 0 ? (
          <div className="mb-6">
            <DailyGoalPanel cardsStudiedToday={cardsStudiedToday} />
          </div>
        ) : null}

        {focusSlug != null && focusDeck == null && decks.length > 0 ? (
          <p className="mb-4 text-sm text-amber-400/90" role="status">
            Geen deck met slug &quot;{focusSlug}&quot; in je bibliotheek. Kies
            hieronder een deck.
          </p>
        ) : null}

        {showEmpty ? (
          <p className="text-sm text-zinc-400">Geen decks gevonden.</p>
        ) : null}

        {!error && decks.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {decks.map((deck) => {
              const wordIds = wordsByDeck.get(deck.id) ?? [];
              const progSlice = new Map<string, ProgressRow>();
              for (const wid of wordIds) {
                const p = progressByWord.get(wid);
                if (p) progSlice.set(wid, p);
              }
              const stats = deckWordStats(wordIds, progSlice, now);
              const pct = percentLearned(stats);

              return (
                <li key={deck.id}>
                  <article
                    id={`deck-${deck.slug}`}
                    className={`rounded-lg border bg-zinc-900 p-3 ring-1 ring-white/5 sm:p-4 ${
                      focusDeck?.id === deck.id
                        ? "border-violet-500/60 ring-2 ring-violet-500/40"
                        : "border-zinc-800"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        className="shrink-0 text-xl leading-none sm:text-2xl"
                        aria-hidden
                      >
                        {deckEmoji(deck.slug)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h2 className="text-sm font-semibold text-zinc-50 sm:text-base">
                            {deck.title}
                          </h2>
                          <Link
                            href={`/study?deck=${deck.id}`}
                            className="shrink-0 rounded-md bg-zinc-600 px-2.5 py-1 text-[11px] font-medium text-zinc-100 transition hover:bg-zinc-500 sm:text-xs"
                          >
                            Studeren →
                          </Link>
                        </div>
                        {deck.description ? (
                          <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">
                            {deck.description}
                          </p>
                        ) : null}
                        <div className="mt-2">
                          <div className="mb-1 flex justify-between text-[11px] text-zinc-500">
                            <span>Voortgang</span>
                            <span>{pct}%</span>
                          </div>
                          <svg
                            className="h-1.5 w-full text-zinc-800"
                            preserveAspectRatio="none"
                            viewBox="0 0 100 2"
                            aria-hidden
                          >
                            <rect
                              width="100"
                              height="2"
                              className="fill-current"
                              rx="1"
                            />
                            <rect
                              width={pct}
                              height="2"
                              className="fill-zinc-500"
                              rx="1"
                            />
                          </svg>
                        </div>
                        <dl className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-zinc-400">
                          <div className="flex gap-1">
                            <dt className="text-zinc-600">New</dt>
                            <dd className="font-medium text-zinc-200">{stats.new}</dd>
                          </div>
                          <div className="flex gap-1">
                            <dt className="text-zinc-600">Learning</dt>
                            <dd className="font-medium text-zinc-200">
                              {stats.learning}
                            </dd>
                          </div>
                          <div className="flex gap-1">
                            <dt className="text-zinc-600">Review</dt>
                            <dd className="font-medium text-zinc-200">
                              {stats.review}
                            </dd>
                          </div>
                          <div className="flex gap-1">
                            <dt className="text-zinc-600">Due</dt>
                            <dd className="font-medium text-zinc-200">{stats.due}</dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        ) : null}
      </main>
    </div>
  );
}
