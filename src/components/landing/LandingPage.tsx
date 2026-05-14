"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { LANDING_LANGUAGES } from "@/lib/languages";
import { ChooseLanguage } from "./ChooseLanguage";
import { DeckSelector } from "./DeckSelector";
import { LanguageSelector } from "./LanguageSelector";
import { WhyPolyCardsWorks } from "./WhyPolyCardsWorks";

type Props = {
  isLoggedIn: boolean;
};

export function LandingPage({ isLoggedIn }: Props) {
  const router = useRouter();
  const [languageId, setLanguageId] = useState<string | null>(null);
  const [deckSlug, setDeckSlug] = useState<string | null>(null);

  const language = useMemo(
    () => LANDING_LANGUAGES.find((l) => l.id === languageId) ?? null,
    [languageId],
  );

  const decks = language?.decks ?? [];

  function selectLanguage(id: string) {
    setLanguageId(id);
    setDeckSlug(null);
  }

  function startLearning() {
    if (!deckSlug) return;
    const path = `/dashboard?deck=${encodeURIComponent(deckSlug)}`;
    if (isLoggedIn) {
      router.push(path);
      return;
    }
    const next = encodeURIComponent(path);
    router.push(`/login?next=${next}`);
  }

  const canStart = Boolean(languageId && deckSlug);

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 font-['-apple-system','BlinkMacSystemFont','Segoe_UI',Roboto,sans-serif] text-zinc-100">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.14),transparent)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_100%_50%,rgba(63,63,70,0.25),transparent)]" />

      <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-4 py-6 sm:px-6">
        <span className="text-lg font-semibold tracking-tight">PolyCards</span>
        <nav className="flex items-center gap-3 text-sm">
          <Link
            href="/theories"
            className="text-zinc-400 transition hover:text-emerald-400"
          >
            Why it works
          </Link>
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-zinc-300 transition hover:border-zinc-500 hover:text-white"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-zinc-400 transition hover:text-white"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-zinc-100 px-3 py-1.5 font-medium text-zinc-950 transition hover:bg-white"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-4 pb-24 pt-4 sm:px-6 sm:pt-8">
        <section className="text-center sm:px-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-500/90">
            Spaced repetition for real life
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            Learn languages{" "}
            <span className="bg-gradient-to-b from-white to-emerald-200/80 bg-clip-text text-transparent">
              that stick
            </span>
            .
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-400 sm:text-xl">
            Choose your language and deck, then jump into focused practice with
            PolyCards—built for steady progress, not cramming.
          </p>
        </section>

        <WhyPolyCardsWorks />

        <ChooseLanguage />

      </main>
    </div>
  );
}
