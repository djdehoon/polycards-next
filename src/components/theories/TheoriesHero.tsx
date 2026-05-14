"use client";

import { motion, useReducedMotion } from "framer-motion";

export function TheoriesHero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] p-8 text-center shadow-2xl shadow-black/50 backdrop-blur-md sm:p-12">
      <div
        className="theories-hero-shimmer pointer-events-none absolute inset-0 rounded-3xl opacity-40"
        aria-hidden
      />
      <div className="relative z-[1]">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <p className="text-5xl sm:text-6xl" aria-hidden>
            🧠
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            <span className="bg-gradient-to-r from-[#4a9eff] to-[#ffd700] bg-clip-text text-transparent">
              Why PolyCards Works
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#b0b0b0] sm:text-lg">
            Discover the 5 scientific theories behind effective language learning—and
            how PolyCards weaves them into every review.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
