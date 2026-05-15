"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

const CARD_CLASS =
  "flex h-full min-h-[160px] flex-col rounded-2xl border border-white/10 bg-zinc-900/45 p-4 text-left shadow-lg backdrop-blur-md sm:min-h-[168px] sm:p-5";

const INVOLVE_CARDS = [
  {
    id: "try",
    icon: "🚀",
    title: "Try now",
    description:
      "Some simple language tools to play with are free available to use. The more advanced language tool(s) will follow soon.",
    footer: "Explore below →",
    kind: "link" as const,
  },
  
  {
    id: "beta",
    icon: "🎯",
    title: "Beta tester",
    description:
      "Get exclusive access to the new Ukrainian learning tool before anyone else. Help shape the product with your feedback.",
    footer: "Coming soon",
    kind: "soon" as const,
  },
  {
    id: "updates",
    icon: "📬",
    title: "Stay updated",
    description:
      "Receive updates as we build. No commitment—just stay in the loop on what ships next.",
    footer: "Coming soon",
    kind: "soon" as const,
  },
] as const;

/** Phase 2: wire beta/updates cards to NEXT_PUBLIC_TALLY_* URLs. */
export function PrototypeSection() {
  const reduce = useReducedMotion();

  return (
    <section
      id="early-access"
      className="mt-20 scroll-mt-24 border-t border-white/10 pt-16"
      aria-labelledby="prototype-heading"
    >
      <div className="text-center sm:px-4">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-500/90">
          Building in the open
        </p>
        <h2
          id="prototype-heading"
          className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl"
        >
          PolyCards is in active development—we&apos;re building it in the open.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-left text-sm text-zinc-400 sm:text-center sm:text-base">
          <span className="font-medium text-zinc-300">What&apos;s happening:</span>{" "}
          We&apos;re creating a science-backed language learning tool that combines 5
          proven methods—spaced repetition, comprehensible input, active recall,
          frequency-based learning, and sentence-based learning.
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-sm font-medium text-zinc-300 sm:text-base">
          Three ways to get involved
        </p>
      </div>

      <div className="mx-auto mt-10 flex max-w-5xl flex-wrap justify-center gap-3">
        {INVOLVE_CARDS.map((c, i) => (
          <motion.div
            key={c.id}
            className="w-full max-w-[280px] shrink-0 sm:w-[260px]"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: reduce ? 0 : i * 0.06, duration: 0.35 }}
          >
            {c.kind === "link" ? (
              <Link href="#choose-language" className={`${CARD_CLASS} transition hover:border-emerald-500/35 hover:bg-zinc-800/50`}>
                <CardBody card={c} />
              </Link>
            ) : (
              <article className={CARD_CLASS} aria-disabled="true">
                <CardBody card={c} footerClassName="text-zinc-500" />
              </article>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function CardBody({
  card,
  footerClassName = "text-emerald-400/95",
}: {
  card: (typeof INVOLVE_CARDS)[number];
  footerClassName?: string;
}) {
  return (
    <>
      <span className="text-2xl" aria-hidden>
        {card.icon}
      </span>
      <span className="mt-2 text-sm font-semibold text-zinc-50">{card.title}</span>
      <span className="mt-2 flex-1 text-xs leading-relaxed text-zinc-400">
        {card.description}
      </span>
      <span className={`mt-3 text-xs font-medium ${footerClassName}`}>{card.footer}</span>
    </>
  );
}
