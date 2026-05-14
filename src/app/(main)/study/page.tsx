"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Suspense, useCallback, useEffect, useState, startTransition } from "react";
import { useSearchParams } from "next/navigation";
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
  const [flipped, setFlipped] = useState(false);
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
      setFlipped(false);
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

  const goNext = useCallback(() => {
    setFlipped(false);
    setIndex((i) => i + 1);
  }, []);

  const toggleFlip = useCallback(() => {
    if (!hasCards) return;
    setFlipped((f) => !f);
  }, [hasCards]);

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

      <div className="[perspective:1200px]">
        <button
          type="button"
          onClick={toggleFlip}
          disabled={saving}
          className="relative h-56 w-full cursor-pointer border-0 bg-transparent p-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 disabled:opacity-50"
          aria-label={flipped ? "Toon voorkant" : "Toon achterkant"}
        >
          <div
            className={`relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] ${
              flipped ? "[transform:rotateY(180deg)]" : "[transform:rotateY(0deg)]"
            }`}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-800 px-6 shadow-xl [backface-visibility:hidden]">
              <span className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                Oekraïens
              </span>
              <p className="text-center text-2xl font-semibold text-zinc-50">
                {current!.word.term}
              </p>
              <span className="mt-4 text-xs text-zinc-500">Klik om te draaien</span>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-800 px-6 shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <span className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                Nederlands
              </span>
              <p className="text-center text-2xl font-semibold text-zinc-50">
                {current!.word.translation}
              </p>
              <span className="mt-4 text-xs text-zinc-500">Klik om te draaien</span>
            </div>
          </div>
        </button>
      </div>

      {saveError ? (
        <p className="mt-4 text-center text-sm text-red-400" role="alert">
          {saveError}
        </p>
      ) : null}

      {flipped ? (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <button
            type="button"
            disabled={saving}
            onClick={(e) => {
              e.stopPropagation();
              void onRate(1);
            }}
            className="rounded-xl border border-zinc-700 bg-zinc-800 py-3 text-sm font-medium text-zinc-200 transition hover:bg-zinc-700 disabled:opacity-50"
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
            className="rounded-xl border border-zinc-700 bg-zinc-800 py-3 text-sm font-medium text-zinc-200 transition hover:bg-zinc-700 disabled:opacity-50"
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
            className="rounded-xl border border-zinc-700 bg-zinc-800 py-3 text-sm font-medium text-zinc-200 transition hover:bg-zinc-700 disabled:opacity-50"
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
            className="rounded-xl border border-zinc-700 bg-zinc-800 py-3 text-sm font-medium text-zinc-200 transition hover:bg-zinc-700 disabled:opacity-50"
          >
            🎉 Easy
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
