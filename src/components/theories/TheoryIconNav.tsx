"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Theory } from "@/lib/theories-content";

type Props = {
  theories: Theory[];
};

const glowRest =
  "0 0 0 1px rgba(255,255,255,0.06), 0 12px 40px rgba(0,0,0,0.45)";
const glowHover =
  "0 0 0 1px rgba(74,158,255,0.35), 0 0 28px rgba(74,158,255,0.35), 0 0 48px rgba(255,215,0,0.15), 0 16px 48px rgba(0,0,0,0.5)";

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
      className="mx-auto grid w-full max-w-[800px] grid-cols-1 justify-items-center gap-6 sm:grid-cols-3 lg:grid-cols-5"
      aria-label="Jump to a theory"
    >
      {theories.map((t, i) => (
        <motion.div
          key={t.id}
          className="w-full rounded-2xl bg-gradient-to-br from-[#4a9eff] to-[#ffd700] p-px shadow-lg"
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
            className="flex w-full flex-col items-center gap-2 rounded-2xl bg-white/[0.05] px-4 py-5 text-center backdrop-blur-md transition-colors hover:bg-white/[0.08]"
          >
            <span className="text-3xl" aria-hidden>
              {t.navEmoji}
            </span>
            <span className="text-sm font-semibold leading-tight text-white">
              {t.navLabel}
            </span>
            <span className="text-xs leading-snug text-[#b0b0b0]">{t.navSubtitle}</span>
          </motion.button>
        </motion.div>
      ))}
    </nav>
  );
}
