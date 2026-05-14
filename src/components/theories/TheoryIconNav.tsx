"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Theory } from "@/lib/theories-content";

type Props = {
  theories: Theory[];
};

const glowRest =
  "0 0 0 1px rgba(255,255,255,0.08), 0 10px 36px rgba(0,0,0,0.4)";
const glowHover =
  "0 0 0 1px rgba(16,185,129,0.45), 0 0 28px rgba(16,185,129,0.22), 0 14px 40px rgba(0,0,0,0.45)";

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
      className="mx-auto flex w-full max-w-[800px] flex-wrap justify-center gap-4"
      aria-label="Jump to a theory"
    >
      {theories.map((t, i) => (
        <motion.div
          key={t.id}
          className="w-[148px] shrink-0 sm:w-[156px]"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduce ? 0 : i * 0.1, duration: 0.4, ease: "easeOut" }}
        >
          <motion.button
            type="button"
            aria-controls={`theory-${t.id}`}
            aria-label={`Jump to ${t.navLabel}`}
            whileHover={
              reduce
                ? undefined
                : { scale: 1.05, boxShadow: glowHover, transition: { duration: 0.2 } }
            }
            whileTap={reduce ? undefined : { scale: 0.98 }}
            style={{ boxShadow: glowRest }}
            onClick={() => scrollTo(t.id)}
            className="flex w-full flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-5 text-center backdrop-blur-md transition-colors hover:border-emerald-500/35 hover:bg-white/[0.08]"
          >
            <span className="text-3xl" aria-hidden>
              {t.navEmoji}
            </span>
            <span className="text-sm font-semibold leading-tight text-white">
              {t.navLabel}
            </span>
            <span className="text-xs leading-snug text-zinc-400">{t.navSubtitle}</span>
          </motion.button>
        </motion.div>
      ))}
    </nav>
  );
}
