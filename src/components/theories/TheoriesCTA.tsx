"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

export function TheoriesCTA() {
  const reduce = useReducedMotion();

  return (
    <section className="relative mx-auto max-w-[800px] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-xl shadow-black/30 backdrop-blur-md sm:p-12">
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10"
        aria-hidden
      />
      <motion.div
        className="relative"
        initial={reduce ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
      >
        <h2 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl">
          Ready to Start Learning?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-zinc-400 sm:text-base">
          Open your dashboard and pick a deck—PolyCards keeps the science running in
          the background.
        </p>
        <Link
          href="/dashboard"
          className="mt-8 inline-flex rounded-2xl bg-emerald-600 px-10 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-950/35 transition hover:bg-emerald-500"
        >
          Start Learning Today
        </Link>
      </motion.div>
    </section>
  );
}
