"use client";

import { motion, useReducedMotion } from "framer-motion";

const shadowRest =
  "0 0 0 1px rgba(255,255,255,0.06), 0 12px 40px rgba(0,0,0,0.55)";
const shadowHover =
  "0 0 0 1px rgba(16,185,129,0.22), 0 0 20px rgba(16,185,129,0.1), 0 16px 48px rgba(0,0,0,0.6)";

type Props = {
  flag: string;
  label: string;
  index: number;
};

export function LanguageCard({ flag, label, index }: Props) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="flex flex-col rounded-2xl border border-white/10 bg-[#080808] px-5 pb-5 pt-6 text-center shadow-xl backdrop-blur-sm"
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        delay: reduce ? 0 : index * 0.1,
        duration: 0.4,
        ease: "easeOut",
      }}
      whileHover={
        reduce
          ? undefined
          : { scale: 1.03, boxShadow: shadowHover, transition: { duration: 0.2 } }
      }
      style={{ boxShadow: shadowRest }}
    >
      <span className="text-5xl leading-none" aria-hidden>
        {flag}
      </span>
      <h3 className="mt-4 text-xl font-bold leading-tight text-white">{label}</h3>
      <button
        type="button"
        onClick={() => {}}
        className="mt-6 w-full rounded-xl bg-emerald-600 py-3 text-base font-bold text-white shadow-md shadow-emerald-950/40 transition hover:bg-emerald-500"
      >
        Explore
      </button>
    </motion.div>
  );
}
