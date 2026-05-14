"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useId, useState } from "react";
import type { Theory } from "@/lib/theories-content";

type Props = {
  theory: Theory;
};

export function TheoryCard({ theory }: Props) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const panelId = useId();

  return (
    <section
      id={`theory-${theory.id}`}
      className="scroll-mt-28 rounded-3xl border border-white/10 bg-zinc-900/40 p-6 shadow-xl backdrop-blur-md sm:p-8"
      aria-labelledby={`${theory.id}-heading`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <span className="text-5xl leading-none" aria-hidden>
          {theory.navEmoji}
        </span>
        <div className="min-w-0 flex-1">
          <h2
            id={`${theory.id}-heading`}
            className="text-2xl font-bold tracking-tight text-white sm:text-3xl"
          >
            {theory.title}
          </h2>
          <p className="mt-1 text-sm text-violet-300/90">{theory.authorYear}</p>
          <p className="mt-4 text-zinc-300">{theory.intro}</p>

          <h3 className="mt-6 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Key principles
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-300">
            {theory.principles.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>

          <h3 className="mt-6 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Scientific evidence
          </h3>
          <p className="mt-2 text-sm text-zinc-300">{theory.evidence}</p>

          <h3 className="mt-6 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            In PolyCards
          </h3>
          <p className="mt-2 text-sm text-zinc-200">{theory.polycardsApplication}</p>

          <button
            type="button"
            aria-expanded={open}
            aria-controls={open ? panelId : undefined}
            onClick={() => setOpen((v) => !v)}
            className="mt-6 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-100 transition hover:bg-amber-500/20"
          >
            {open ? "Show less" : "Learn more"}
          </button>

          <AnimatePresence initial={false}>
            {open ? (
              <motion.div
                id={panelId}
                key="detail"
                initial={reduce ? false : { opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
                className="mt-4 space-y-3 border-t border-white/10 pt-4 text-sm leading-relaxed text-zinc-400"
              >
                {theory.detailParagraphs.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
