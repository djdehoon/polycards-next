import type { Metadata } from "next";
import Link from "next/link";
import { TheoriesCTA } from "@/components/theories/TheoriesCTA";
import { TheoriesHero } from "@/components/theories/TheoriesHero";
import { TheoriesPageMotion } from "@/components/theories/TheoriesPageMotion";
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
    <div
      className="relative min-h-screen overflow-hidden bg-[#080808] text-white font-['-apple-system','BlinkMacSystemFont','Segoe_UI',Roboto,sans-serif]"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(74,158,255,0.18),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_0%_40%,rgba(74,158,255,0.12),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_100%_70%,rgba(255,215,0,0.12),transparent)]"
        aria-hidden
      />

      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#080808]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[800px] flex-wrap items-center justify-between gap-3 px-6 py-4">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-white transition hover:text-[#4a9eff]"
          >
            🇺🇦 PolyCards
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <p className="hidden text-sm text-[#b0b0b0] sm:block">
              Why PolyCards Works
            </p>
            <Link
              href="/"
              className="rounded-lg border border-white/15 bg-white/[0.05] px-3 py-1.5 text-sm text-white transition hover:border-[#4a9eff]/50 hover:bg-white/[0.08]"
            >
              ← Home
            </Link>
          </div>
        </div>
      </header>

      <TheoriesPageMotion>
        <TheoriesHero />
        <TheoryIconNav theories={THEORIES} />
        <div className="space-y-16">
          {THEORIES.map((t) => (
            <TheoryCard key={t.id} theory={t} />
          ))}
        </div>
        <TheorySummary />
        <TheoriesCTA />
      </TheoriesPageMotion>
    </div>
  );
}
