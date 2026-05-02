"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type WordRow = {
  id: string;
  term: string;
  translation: string;
  sort_order?: number;
};

async function fetchWordsForDeck(deckId: string) {
  const supabase = createBrowserSupabaseClient();

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

function StudyLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
      Laden…
    </div>
  );
}

function StudySession() {
  const searchParams = useSearchParams();
  const deckId = searchParams.get("deck");

  const [words, setWords] = useState<WordRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (!deckId) {
      setLoading(false);
      setWords([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    const run = async () => {
      const { data, error } = await fetchWordsForDeck(deckId);

      if (cancelled) return;

      if (error) {
        setLoadError(error.message);
        setWords([]);
      } else {
        setWords(data ?? []);
      }
      setLoading(false);
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [deckId]);

  const current = words[index];
  const done = !loading && !loadError && words.length > 0 && index >= words.length;
  const hasCards = words.length > 0 && index < words.length;

  const goNext = useCallback(() => {
    setFlipped(false);
    setIndex((i) => i + 1);
  }, []);

  const toggleFlip = useCallback(() => {
    if (!hasCards) return;
    setFlipped((f) => !f);
  }, [hasCards]);

  if (!deckId) {
    return (
      <div className="min-h-screen bg-zinc-950 px-4 py-12 text-zinc-100">
        <div className="mx-auto max-w-lg text-center">
          <p className="text-zinc-400">Geen deck geselecteerd.</p>
          <Link
            href="/dashboard"
            className="mt-6 inline-block rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-white"
          >
            Naar dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <StudyLoading />;
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-zinc-950 px-4 py-12 text-zinc-100">
        <div className="mx-auto max-w-lg text-center">
          <p className="text-red-400" role="alert">
            Kon woorden niet laden: {loadError}
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-block text-sm text-zinc-400 underline"
          >
            Naar dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 px-4 py-12 text-zinc-100">
        <div className="mx-auto max-w-lg text-center">
          <p className="text-zinc-400">Geen woorden in dit deck.</p>
          <Link
            href="/dashboard"
            className="mt-6 inline-block rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-white"
          >
            Naar dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-zinc-950 px-4 py-12 text-zinc-100">
        <div className="mx-auto flex max-w-lg flex-col items-center text-center">
          <p className="text-xl font-semibold text-zinc-50">
            Sessie klaar! 🎉
          </p>
          <Link
            href="/dashboard"
            className="mt-8 inline-flex rounded-lg bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-950 hover:bg-white"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-center justify-between text-sm text-zinc-500">
          <span>
            Kaart {index + 1} / {words.length}
          </span>
          <Link href="/dashboard" className="text-zinc-400 hover:text-zinc-200">
            Dashboard
          </Link>
        </div>

        <div className="[perspective:1200px]">
          <button
            type="button"
            onClick={toggleFlip}
            className="relative h-56 w-full cursor-pointer border-0 bg-transparent p-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
            aria-label={flipped ? "Toon voorkant" : "Toon achterkant"}
          >
            <div
              className={`relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] ${
                flipped ? "[transform:rotateY(180deg)]" : "[transform:rotateY(0deg)]"
              }`}
            >
              <div
                className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-800 px-6 shadow-xl [backface-visibility:hidden]"
              >
                <span className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Oekraïens
                </span>
                <p className="text-center text-2xl font-semibold text-zinc-50">
                  {current.term}
                </p>
                <span className="mt-4 text-xs text-zinc-500">Klik om te draaien</span>
              </div>
              <div
                className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-800 px-6 shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)]"
              >
                <span className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Nederlands
                </span>
                <p className="text-center text-2xl font-semibold text-zinc-50">
                  {current.translation}
                </p>
                <span className="mt-4 text-xs text-zinc-500">Klik om te draaien</span>
              </div>
            </div>
          </button>
        </div>

        {flipped ? (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="rounded-xl border border-zinc-700 bg-zinc-800 py-3 text-sm font-medium text-zinc-200 transition hover:bg-zinc-700"
            >
              ❌ Again
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="rounded-xl border border-zinc-700 bg-zinc-800 py-3 text-sm font-medium text-zinc-200 transition hover:bg-zinc-700"
            >
              😓 Hard
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="rounded-xl border border-zinc-700 bg-zinc-800 py-3 text-sm font-medium text-zinc-200 transition hover:bg-zinc-700"
            >
              👍 Good
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="rounded-xl border border-zinc-700 bg-zinc-800 py-3 text-sm font-medium text-zinc-200 transition hover:bg-zinc-700"
            >
              🎉 Easy
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function StudyPage() {
  return (
    <Suspense fallback={<StudyLoading />}>
      <StudySession />
    </Suspense>
  );
}
