import type { Metadata } from "next";
import Link from "next/link";
import { TheoriesCTA } from "@/components/theories/TheoriesCTA";
import { TheoriesHero } from "@/components/theories/TheoriesHero";
import { TheoryCard } from "@/components/theories/TheoryCard";
import { TheoryIconNav } from "@/components/theories/TheoryIconNav";
import { TheorySummary } from "@/components/theories/TheorySummary";
import { THEORIES } from "@/lib/theories-content";

export const metadata: Metadata = {
  title: "Why PolyCards Works | PolyCards",
  description:
    "Five learning theories—spaced repetition, comprehensible input, active recall, frequency-based learning, and sentence-based practice—and how PolyCards applies them.",
};

export default function TheoriesPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.22),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_0%_50%,rgba(14,165,233,0.12),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_100%_80%,rgba(245,158,11,0.1),transparent)]"
        aria-hidden
      />

      <header className="sticky top-0 z-20 border-b border-white/5 bg-zinc-950/75 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-white transition hover:text-violet-200"
          >
            🇺🇦 PolyCards
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <p className="hidden text-sm text-zinc-400 sm:block">
              Why PolyCards Works
            </p>
            <Link
              href="/"
              className="rounded-lg border border-zinc-600 px-3 py-1.5 text-sm text-zinc-200 transition hover:border-zinc-400 hover:bg-zinc-800/80"
            >
              ← Home
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl space-y-12 px-4 py-10 sm:px-6 sm:py-14">
        <TheoriesHero />
        <TheoryIconNav theories={THEORIES} />
        <div className="space-y-10">
          {THEORIES.map((t) => (
            <TheoryCard key={t.id} theory={t} />
          ))}
        </div>
        <TheorySummary />
        <TheoriesCTA />
      </main>
    </div>
  );
}
