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
    <motion.section
      id={`theory-${theory.id}`}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12%" }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="scroll-mt-28 text-center"
      aria-labelledby={`${theory.id}-heading`}
    >
      <div className="mx-auto max-w-[700px] rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-xl backdrop-blur-md sm:p-10">
        <span className="block text-[4rem] leading-none" aria-hidden>
          {theory.navEmoji}
        </span>
        <h2
          id={`${theory.id}-heading`}
          className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl"
        >
          {theory.title}
        </h2>
        <div
          className="mx-auto mt-3 h-0.5 w-20 rounded-full bg-gradient-to-r from-[#4a9eff] to-[#ffd700]"
          aria-hidden
        />
        <p className="mt-2 text-sm text-[#4a9eff]">{theory.authorYear}</p>
        <p className="mt-6 text-base leading-relaxed text-[#b0b0b0]">{theory.intro}</p>

        <h3 className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-[#b0b0b0]">
          Key principles
        </h3>
        <ul className="mt-4 list-none space-y-3">
          {theory.principles.map((p) => (
            <li key={p}>
              <span className="inline-block rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-relaxed text-[#b0b0b0]">
                {p}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.06] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-white">
            Scientific evidence
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[#b0b0b0]">{theory.evidence}</p>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.06] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-transparent bg-gradient-to-r from-[#4a9eff] to-[#ffd700] bg-clip-text">
            PolyCards application
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white">
            {theory.polycardsApplication}
          </p>
        </div>

        <button
          type="button"
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          onClick={() => setOpen((v) => !v)}
          className="mx-auto mt-8 flex w-full max-w-md items-center justify-center rounded-2xl bg-gradient-to-r from-[#4a9eff] to-[#ffd700] px-6 py-3.5 text-sm font-semibold text-[#080808] shadow-lg shadow-[#4a9eff]/25 transition hover:brightness-110"
        >
          {open ? "Show less" : "Learn more"}
        </button>

        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              id={panelId}
              key="detail"
              initial={reduce ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="mt-6 space-y-4 border-t border-white/10 pt-6 text-sm leading-relaxed text-[#b0b0b0]"
            >
              {theory.detailParagraphs.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
