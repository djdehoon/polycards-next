"use client";

import { motion, useReducedMotion } from "framer-motion";

export function TheoriesHero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-sky-500/15 via-violet-500/10 to-amber-500/15 p-8 text-center shadow-2xl shadow-black/40 backdrop-blur-md sm:p-12">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <p className="text-4xl sm:text-5xl" aria-hidden>
          🧠
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
          Why PolyCards Works
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-300 sm:text-lg">
          Discover the five scientific ideas behind effective vocabulary learning—and
          how PolyCards applies them in one simple loop.
        </p>
      </motion.div>
    </section>
  );
}
