"use client";

import type { ChooseLanguageLink } from "@/lib/languages";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

const shadowRest =
  "0 0 0 1px rgba(255,255,255,0.06), 0 12px 40px rgba(0,0,0,0.55)";
const shadowHover =
  "0 0 0 1px rgba(16,185,129,0.22), 0 0 20px rgba(16,185,129,0.1), 0 16px 48px rgba(0,0,0,0.6)";

const linkClassName =
  "flex min-h-0 flex-1 flex-col text-center text-inherit no-underline outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808]";

const ctaClassName =
  "mt-6 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 py-3 text-base font-bold text-white shadow-md shadow-emerald-950/40 transition group-hover:bg-emerald-500";

type Props = {
  flag: string;
  label: string;
  index: number;
  chooseLink: ChooseLanguageLink;
};

export function LanguageCard({ flag, label, index, chooseLink }: Props) {
  const reduce = useReducedMotion();
  const { href, target, buttonText, useNextLink } = chooseLink;

  const body = (
    <>
      <span className="text-5xl leading-none" aria-hidden>
        {flag}
      </span>
      <h3 className="mt-4 text-xl font-bold leading-tight text-white">{label}</h3>
      <span className={ctaClassName}>{buttonText}</span>
    </>
  );

  return (
    <motion.div
      className="group flex flex-col rounded-2xl border border-white/10 bg-[#080808] px-5 pb-5 pt-6 text-center shadow-xl backdrop-blur-sm"
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
      {useNextLink ? (
        <Link href={href} className={linkClassName}>
          {body}
        </Link>
      ) : (
        <a
          href={href}
          target={target}
          rel="noopener noreferrer"
          className={linkClassName}
        >
          {body}
        </a>
      )}
    </motion.div>
  );
}
