"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

export function TheoriesCTA() {
  const reduce = useReducedMotion();

  return (
    <section className="rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-violet-500/15 to-emerald-500/15 p-8 text-center backdrop-blur-md sm:p-10">
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          Ready to start learning?
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-zinc-300">
          Open your dashboard and pick a deck—PolyCards will handle the science in
          the background.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-xl bg-zinc-100 px-8 py-3 text-sm font-semibold text-zinc-950 shadow-lg transition hover:bg-white"
        >
          Go to dashboard
        </Link>
      </motion.div>
    </section>
  );
}
