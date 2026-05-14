"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Theory } from "@/lib/theories-content";

type Props = {
  theories: Theory[];
};

export function TheoryIconNav({ theories }: Props) {
  const reduce = useReducedMotion();

  function scrollTo(id: string) {
    document.getElementById(`theory-${id}`)?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
  }

  return (
    <nav
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
      aria-label="Jump to a theory"
    >
      {theories.map((t, i) => (
        <motion.button
          key={t.id}
          type="button"
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduce ? 0 : i * 0.05, duration: 0.35 }}
          whileHover={reduce ? undefined : { scale: 1.02 }}
          whileTap={reduce ? undefined : { scale: 0.98 }}
          onClick={() => scrollTo(t.id)}
          className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-zinc-900/45 px-3 py-4 text-center shadow-lg backdrop-blur-md transition hover:border-violet-400/40 hover:bg-zinc-800/50"
        >
          <span className="text-2xl" aria-hidden>
            {t.navEmoji}
          </span>
          <span className="text-xs font-medium leading-snug text-zinc-100 sm:text-sm">
            {t.navLabel}
          </span>
        </motion.button>
      ))}
    </nav>
  );
}
