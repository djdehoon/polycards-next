"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Suspense, useCallback, useEffect, useState, startTransition } from "react";
import { useSearchParams } from "next/navigation";
import { FlipCard } from "@/components/study/FlipCard";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import {
  type ProgressRow,
  cardToProgressPayload,
  progressToCard,
  ratingFromScore,
  scheduleReview,
} from "@/lib/srs";

type WordRow = {
  id: string;
  term: string;
  translation: string;
  sort_order?: number;
  deck_id: string;
};

type DueItem = {
  word: WordRow;
  progress: ProgressRow | null;
};

async function fetchWordsForDeck(
  supabase: ReturnType<typeof createBrowserSupabaseClient>,
  deckId: string,
) {
  const primary = await supabase
    .from("words")
    .select("*")
    .eq("deck_id", deckId)
    .order("sort_order", { ascending: true });

  if (!primary.error) {
    return { data: (primary.data ?? []) as WordRow[], error: null };
  }

  const fallback = await supabase
    .from("words")
    .select("*")
    .eq("deck_id", deckId)
    .order("id", { ascending: true });

  return {
    data: (fallback.data ?? []) as WordRow[],
    error: fallback.error,
  };
}

async function loadDueItems(
  deckId: string,
): Promise<{
  items: DueItem[];
  userId: string | null;
  error: string | null;
  unauthenticated: boolean;
}> {
  const supabase = createBrowserSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { items: [], userId: null, error: null, unauthenticated: true };
  }

  const { data: words, error: wordError } = await fetchWordsForDeck(
    supabase,
    deckId,
  );
  if (wordError) {
    return {
      items: [],
      userId: user.id,
      error: wordError.message,
      unauthenticated: false,
    };
  }
  if (!words.length) {
    return { items: [], userId: user.id, error: null, unauthenticated: false };
  }

  const wordIds = words.map((w) => w.id);
  const { data: progressRows, error: progressError } = await supabase
    .from("user_progress")
    .select(
      "id, user_id, word_id, stability, difficulty, state, reps, lapses, due_date, last_reviewed_at, last_rating, updated_at",
    )
    .eq("user_id", user.id)
    .in("word_id", wordIds);

  if (progressError) {
    return {
      items: [],
      userId: user.id,
      error: progressError.message,
      unauthenticated: false,
    };
  }

  const byWord = new Map(
    (progressRows ?? []).map((r) => [r.word_id, r as ProgressRow]),
  );
  const now = new Date();

  const dueWords = words.filter((w) => {
    const p = byWord.get(w.id);
    if (!p) return true;
    return new Date(p.due_date) <= now;
  });

  dueWords.sort((a, b) => {
    const pa = byWord.get(a.id);
    const pb = byWord.get(b.id);
    if (!pa && !pb) {
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    }
    if (!pa) return -1;
    if (!pb) return 1;
    return new Date(pa.due_date).getTime() - new Date(pb.due_date).getTime();
  });

  const items: DueItem[] = dueWords.map((w) => ({
    word: w,
    progress: byWord.get(w.id) ?? null,
  }));

  return { items, userId: user.id, error: null, unauthenticated: false };
}

function StudyLoading() {
  return (
    <div className="flex flex-1 items-center justify-center py-24 text-zinc-400">
      Laden…
    </div>
  );
}

function StudySession() {
  const searchParams = useSearchParams();
  const deckId = searchParams.get("deck");

  const [items, setItems] = useState<DueItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [unauthenticated, setUnauthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!deckId) {
      startTransition(() => {
        setLoading(false);
        setItems([]);
      });
      return;
    }

    let cancelled = false;
    startTransition(() => {
      setLoading(true);
      setLoadError(null);
      setUnauthenticated(false);
    });

    void (async () => {
      const result = await loadDueItems(deckId);
      if (cancelled) return;
      if (result.unauthenticated) {
        setUnauthenticated(true);
        setItems([]);
        setUserId(null);
        setLoading(false);
        return;
      }
      if (result.error) {
        setLoadError(result.error);
        setItems([]);
        setUserId(result.userId);
        setLoading(false);
        return;
      }
      setItems(result.items);
      setUserId(result.userId);
      setIndex(0);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [deckId]);

  const current = items[index];
  const done =
    !loading &&
    !loadError &&
    !unauthenticated &&
    items.length > 0 &&
    index >= items.length;
  const hasCards = items.length > 0 && index < items.length;

  const canGoPrevious = index > 0;
  const canGoNext = index < items.length - 1;

  const goNext = useCallback(() => {
    setIndex((i) => i + 1);
  }, []);

  const goPrevious = useCallback(() => {
    if (!hasCards || saving || index <= 0) return;
    setIndex((i) => i - 1);
  }, [hasCards, saving, index]);

  const handleNext = useCallback(() => {
    if (!hasCards || saving || index >= items.length - 1) return;
    goNext();
  }, [hasCards, saving, index, items.length, goNext]);

  const onRate = useCallback(
    async (score: 1 | 2 | 3 | 4) => {
      if (!current || !userId || saving) return;
      setSaveError(null);
      setSaving(true);
      const now = new Date();
      const supabase = createBrowserSupabaseClient();
      const card = progressToCard(current.progress, now);
      const grade = ratingFromScore(score);
      const { card: nextCard } = scheduleReview(card, grade, now);
      const payload = cardToProgressPayload(
        userId,
        current.word.id,
        nextCard,
        now,
        score,
      );

      const { error } = await supabase.from("user_progress").upsert(payload, {
        onConflict: "user_id,word_id",
      });

      if (error) {
        setSaving(false);
        setSaveError(error.message);
        return;
      }

      await supabase.rpc("record_study_session");

      setSaving(false);
      goNext();
    },
    [current, userId, saving, goNext],
  );

  const shell = (inner: ReactNode) => (
    <div className="flex flex-1 flex-col px-4 py-8 text-zinc-100">{inner}</div>
  );

  if (!deckId) {
    return shell(
      <div className="mx-auto max-w-lg flex-1 text-center">
        <p className="text-zinc-400">Geen deck geselecteerd.</p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-white"
        >
          Naar dashboard
        </Link>
      </div>,
    );
  }

  if (unauthenticated) {
    return shell(
      <div className="mx-auto max-w-lg flex-1 text-center">
        <p className="text-zinc-400">Log in om te studeren.</p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-white"
        >
          Naar login
        </Link>
      </div>,
    );
  }

  if (loading) {
    return <StudyLoading />;
  }

  if (loadError) {
    return shell(
      <div className="mx-auto max-w-lg flex-1 text-center">
        <p className="text-red-400" role="alert">
          Kon sessie niet laden: {loadError}
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block text-sm text-zinc-400 underline"
        >
          Naar dashboard
        </Link>
      </div>,
    );
  }

  if (items.length === 0) {
    return shell(
      <div className="mx-auto max-w-lg flex-1 text-center">
        <p className="text-zinc-400">
          Geen kaarten om nu te herhalen (of dit deck is leeg).
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-white"
        >
          Naar dashboard
        </Link>
      </div>,
    );
  }

  if (done) {
    return shell(
      <div className="mx-auto flex max-w-lg flex-1 flex-col items-center text-center">
        <p className="text-xl font-semibold text-zinc-50">Sessie klaar! 🎉</p>
        <Link
          href="/dashboard"
          className="mt-8 inline-flex rounded-lg bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-950 hover:bg-white"
        >
          Back to Dashboard
        </Link>
      </div>,
    );
  }

  return shell(
    <div className="mx-auto w-full max-w-lg flex-1">
      <div className="mb-6 flex items-center justify-between text-sm text-zinc-500">
        <span>
          Kaart {index + 1} / {items.length}
        </span>
        <Link href="/dashboard" className="text-zinc-400 hover:text-zinc-200">
          Dashboard
        </Link>
      </div>

      <FlipCard
        key={current!.word.id}
        word={current!.word.term}
        translation={current!.word.translation}
        disabled={saving}
      />

      {saveError ? (
        <p className="mt-4 text-center text-sm text-red-400" role="alert">
          {saveError}
        </p>
      ) : null}

      {hasCards ? (
        <div className="mt-8 flex w-full flex-wrap items-stretch justify-center gap-2 sm:gap-3">
          <button
            type="button"
            disabled={saving || !canGoPrevious}
            onClick={(e) => {
              e.stopPropagation();
              goPrevious();
            }}
            className="shrink-0 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-3 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800 disabled:opacity-50"
            aria-label="Previous"
          >
            <span className="sm:hidden" aria-hidden>
              ←
            </span>
            <span className="hidden sm:inline">← Previous</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={(e) => {
              e.stopPropagation();
              void onRate(1);
            }}
            className="min-w-[4.5rem] flex-1 rounded-xl border border-zinc-700 bg-zinc-800 py-3 text-sm font-medium text-zinc-200 transition hover:bg-zinc-700 disabled:opacity-50 sm:flex-none"
          >
            ❌ Again
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={(e) => {
              e.stopPropagation();
              void onRate(2);
            }}
            className="min-w-[4.5rem] flex-1 rounded-xl border border-zinc-700 bg-zinc-800 py-3 text-sm font-medium text-zinc-200 transition hover:bg-zinc-700 disabled:opacity-50 sm:flex-none"
          >
            😓 Hard
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={(e) => {
              e.stopPropagation();
              void onRate(3);
            }}
            className="min-w-[4.5rem] flex-1 rounded-xl border border-zinc-700 bg-zinc-800 py-3 text-sm font-medium text-zinc-200 transition hover:bg-zinc-700 disabled:opacity-50 sm:flex-none"
          >
            👍 Good
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={(e) => {
              e.stopPropagation();
              void onRate(4);
            }}
            className="min-w-[4.5rem] flex-1 rounded-xl border border-zinc-700 bg-zinc-800 py-3 text-sm font-medium text-zinc-200 transition hover:bg-zinc-700 disabled:opacity-50 sm:flex-none"
          >
            🎉 Easy
          </button>

          <button
            type="button"
            disabled={saving || !canGoNext}
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="shrink-0 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-3 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800 disabled:opacity-50"
            aria-label="Next"
          >
            <span className="sm:hidden" aria-hidden>
              →
            </span>
            <span className="hidden sm:inline">Next →</span>
          </button>
        </div>
      ) : null}
    </div>,
  );
}

export default function StudyPage() {
  return (
    <Suspense fallback={<StudyLoading />}>
      <StudySession />
    </Suspense>
  );
}
