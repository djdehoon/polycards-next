"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

const CARDS = [
  {
    id: "spaced-repetition",
    icon: "🔄",
    title: "Spaced Repetition",
    blurb: "Learn at optimal intervals.",
  },
  {
    id: "comprehensible-input",
    icon: "🌍",
    title: "Comprehensible Input",
    blurb: "Learn through context.",
  },
  {
    id: "active-recall",
    icon: "🎯",
    title: "Active Recall",
    blurb: "Testing beats re-reading.",
  },
  {
    id: "frequency-based",
    icon: "📊",
    title: "Frequency-Based",
    blurb: "High-utility words first.",
  },
  {
    id: "sentence-based",
    icon: "📝",
    title: "Sentence-Based",
    blurb: "Words in full sentences.",
  },
] as const;

export function WhyPolyCardsWorks() {
  const reduce = useReducedMotion();

  return (
    <section className="mt-20 border-t border-white/10 pt-16">
      <div className="text-center sm:px-4">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-300/90">
          Science, not slogans
        </p>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Built on 5 scientific theories
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-400 sm:text-base">
          PolyCards combines ideas from cognitive science and language acquisition so
          every tap on a card does more than drill a list.
        </p>
        <Link
          href="/theories"
          className="mt-4 inline-block text-sm font-medium text-violet-300 underline-offset-4 transition hover:text-violet-200 hover:underline"
        >
          Read the full breakdown
        </Link>
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {CARDS.map((c, i) => (
          <motion.div
            key={c.id}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: reduce ? 0 : i * 0.06, duration: 0.35 }}
          >
            <Link
              href={`/theories#theory-${c.id}`}
              className="flex h-full flex-col rounded-2xl border border-white/10 bg-zinc-900/45 p-4 shadow-lg backdrop-blur-md transition hover:border-violet-400/40 hover:bg-zinc-800/50"
            >
              <span className="text-2xl" aria-hidden>
                {c.icon}
              </span>
              <span className="mt-2 text-sm font-semibold text-zinc-50">
                {c.title}
              </span>
              <span className="mt-1 flex-1 text-xs text-zinc-400">{c.blurb}</span>
              <span className="mt-3 text-xs font-medium text-violet-300">
                Learn more →
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
