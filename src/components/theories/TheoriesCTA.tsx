"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

export function TheoriesCTA() {
  const reduce = useReducedMotion();

  return (
    <section className="mx-auto max-w-[800px] rounded-3xl border border-white/15 bg-gradient-to-br from-[#4a9eff]/20 via-white/[0.06] to-[#ffd700]/20 p-8 text-center shadow-2xl shadow-[#4a9eff]/10 backdrop-blur-md sm:p-12">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
      >
        <h2 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl">
          Ready to Start Learning?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-[#b0b0b0] sm:text-base">
          Open your dashboard and pick a deck—PolyCards keeps the science running in
          the background.
        </p>
        <Link
          href="/dashboard"
          className="mt-8 inline-flex rounded-2xl bg-gradient-to-r from-[#4a9eff] to-[#ffd700] px-10 py-4 text-base font-semibold text-[#080808] shadow-[0_0_32px_rgba(74,158,255,0.35)] transition hover:brightness-110"
        >
          Start Learning Today
        </Link>
      </motion.div>
    </section>
  );
}
