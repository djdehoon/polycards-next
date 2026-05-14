"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  HOW_THEORIES_WORK_TOGETHER,
  KIT_EXAMPLE,
  SUMMARY_ROWS,
} from "@/lib/theories-content";

export function TheorySummary() {
  const reduce = useReducedMotion();

  return (
    <section className="mx-auto max-w-[800px] rounded-3xl border border-white/10 bg-white/[0.05] p-6 text-center backdrop-blur-md sm:p-8">
      <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
        How All 5 Theories Work Together
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
        How the five theories compare—and how PolyCards uses them in one study loop.
      </p>

      <div className="mx-auto mt-10 hidden max-w-[800px] overflow-hidden rounded-2xl border border-white/10 md:block">
        <table className="w-full text-center text-sm">
          <thead className="bg-white/[0.04] text-xs uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-semibold text-zinc-200">Theory</th>
              <th className="px-4 py-3 font-semibold text-zinc-200">Core idea</th>
              <th className="px-4 py-3 font-semibold text-zinc-200">In PolyCards</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-zinc-400">
            {SUMMARY_ROWS.map((row) => (
              <tr key={row.theory} className="bg-white/[0.02]">
                <td className="px-4 py-3 font-medium text-zinc-100">{row.theory}</td>
                <td className="px-4 py-3">{row.coreIdea}</td>
                <td className="px-4 py-3 text-zinc-400">{row.inPolyCards}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="mt-8 space-y-4 md:hidden">
        {SUMMARY_ROWS.map((row) => (
          <li
            key={row.theory}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm"
          >
            <p className="font-semibold text-zinc-100">{row.theory}</p>
            <p className="mt-2 text-sm text-zinc-400">{row.coreIdea}</p>
            <p className="mt-2 text-xs text-emerald-400/90">{row.inPolyCards}</p>
          </li>
        ))}
      </ul>

      <h3 className="mt-12 text-lg font-semibold text-white">How they stack</h3>
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
        {HOW_THEORIES_WORK_TOGETHER}
      </p>

      <h3 className="mt-12 text-lg font-semibold text-white">{KIT_EXAMPLE.title}</h3>
      <div className="mx-auto mt-6 flex max-w-[700px] flex-col gap-4">
        {KIT_EXAMPLE.steps.map((s, i) => (
          <motion.div
            key={s.label}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-8%" }}
            transition={{ delay: reduce ? 0 : i * 0.06, duration: 0.35 }}
            className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 text-center shadow-lg backdrop-blur-md transition hover:border-emerald-500/30"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400/95">
              {s.label}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{s.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
