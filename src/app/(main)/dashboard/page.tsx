import Link from "next/link";
import { redirect } from "next/navigation";
import { DailyGoalPanel } from "@/components/DailyGoalPanel";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ProgressRow } from "@/lib/srs";
import {
  deckWordStats,
  percentLearned,
  studyStreakDays,
  utcTodayString,
} from "@/lib/stats-helpers";
import { logoutAction } from "./actions";
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

  const streakStart = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() - 400,
  ));
  const streakStartStr = utcTodayString(streakStart);

  const { data: sessionRows } = await supabase
    .from("sessions")
    .select("date, cards_studied")
    .eq("user_id", user.id)
    .gte("date", streakStartStr)
    .returns<{ date: string; cards_studied: number }[]>();

  const sessions = sessionRows ?? [];
  const streak = studyStreakDays(sessions, todayUtc);
  const todayRow = sessions.find((s) => s.date === todayUtc);
  const cardsStudiedToday = todayRow?.cards_studied ?? 0;

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
    <div className="flex-1 px-4 py-8">
      <main className="mx-auto max-w-3xl">
        {focusDeck ? <ScrollToDeck slug={focusDeck.slug} /> : null}
        <header className="mb-8 flex flex-col gap-6 border-b border-zinc-800 pb-8 sm:flex-row sm:items-start sm:justify-between">
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

        {!error && decks.length > 0 ? (
          <div className="mb-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 ring-1 ring-white/5">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Vandaag geoefend
              </p>
              <p className="mt-1 text-2xl font-semibold text-zinc-50">
                {cardsStudiedToday}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 ring-1 ring-white/5">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Totaal geleerd
              </p>
              <p className="mt-1 text-2xl font-semibold text-zinc-50">
                {totalLearned}
                {totalWordsAllDecks > 0 ? (
                  <span className="text-sm font-normal text-zinc-500">
                    {" "}
                    / {totalWordsAllDecks} woorden
                  </span>
                ) : null}
              </p>
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
              <p className="mt-1 text-xs text-zinc-500">
                Laatste knop (1–4), gemiddeld over kaarten
              </p>
            </div>
          </div>
        ) : null}

        {!error && decks.length > 0 ? (
          <div className="mb-10">
            <DailyGoalPanel cardsStudiedToday={cardsStudiedToday} />
          </div>
        ) : null}

        {focusSlug != null && focusDeck == null && decks.length > 0 ? (
          <p className="mb-4 text-sm text-amber-400/90" role="status">
            Geen deck met slug &quot;{focusSlug}&quot; in je bibliotheek. Kies
            hieronder een deck.
          </p>
        ) : null}

        {!error && decks.length > 0 ? (
          <div className="mb-10">
            <Link
              href={focusDeck ? `/study?deck=${focusDeck.id}` : "/study"}
              className="inline-flex rounded-lg bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-white"
            >
              Start studeren
            </Link>
            <p className="mt-2 text-xs text-zinc-500">
              Kies een deck op de study-pagina of via een deck hieronder.
            </p>
          </div>
        ) : null}

        {showEmpty ? (
          <p className="text-sm text-zinc-400">Geen decks gevonden.</p>
        ) : null}

        {!error && decks.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2">
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
                    className={`flex h-full flex-col rounded-xl border bg-zinc-900 p-5 ring-1 ring-white/5 ${
                      focusDeck?.id === deck.id
                        ? "border-violet-500/60 ring-2 ring-violet-500/40"
                        : "border-zinc-800"
                    }`}
                  >
                    <div className="flex flex-1 items-start gap-3">
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
                        <div className="mt-3">
                          <div className="mb-1 flex justify-between text-xs text-zinc-500">
                            <span>Voortgang</span>
                            <span>{pct}%</span>
                          </div>
                          <svg
                            className="h-2 w-full text-zinc-800"
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
                        <dl className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-zinc-400 sm:grid-cols-4">
                          <div>
                            <dt className="text-zinc-600">New</dt>
                            <dd className="font-medium text-zinc-200">{stats.new}</dd>
                          </div>
                          <div>
                            <dt className="text-zinc-600">Learning</dt>
                            <dd className="font-medium text-zinc-200">
                              {stats.learning}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-zinc-600">Review</dt>
                            <dd className="font-medium text-zinc-200">
                              {stats.review}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-zinc-600">Due</dt>
                            <dd className="font-medium text-zinc-200">{stats.due}</dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end border-t border-zinc-800 pt-4">
                      <Link
                        href={`/study?deck=${deck.id}`}
                        className="rounded-md bg-zinc-600 px-3 py-1.5 text-xs font-medium text-zinc-100 transition hover:bg-zinc-500"
                      >
                        Studeren →
                      </Link>
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
