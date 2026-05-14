"use client";

import Link from "next/link";
import { ChooseLanguage } from "./ChooseLanguage";
import { WhyPolyCardsWorks } from "./WhyPolyCardsWorks";

export function LandingPage() {
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
            Short sessions on a steady schedule—built for retention, not cramming.
            Choose a language below to practice, or read Why it works in the header.
          </p>
        </section>

        <WhyPolyCardsWorks />

        <ChooseLanguage />
      </main>
    </div>
  );
}
