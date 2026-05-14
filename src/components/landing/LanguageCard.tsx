"use client";

import type { ChooseLanguageDisplay, ChooseLanguageLink } from "@/lib/languages";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { LanguageFlagSvg } from "./LanguageFlagSvgs";

const blueGlow =
  "0 0 0 1px rgba(74,158,255,0.35), 0 10px 30px rgba(74,158,255,0.18), 0 16px 40px rgba(0,0,0,0.45)";
const cardRest =
  "0 0 0 1px rgba(51,51,51,1), 0 8px 24px rgba(0,0,0,0.4)";

const staticCardInner =
  "relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-[14px] py-[18px] text-center sm:px-6 sm:py-8";

const linkClassName = `${staticCardInner} text-inherit no-underline outline-none focus-visible:ring-2 focus-visible:ring-[#4a9eff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1a]`;

const ctaLiveClassName =
  "mt-5 inline-flex w-full max-w-[280px] items-center justify-center rounded-lg bg-[#4a9eff] py-3 text-base font-bold text-white shadow-md shadow-black/25 transition group-hover:bg-[#3a7ecc] sm:mt-6";

const ctaSoonClassName =
  "mt-5 inline-flex w-full max-w-[280px] cursor-not-allowed items-center justify-center rounded-lg border border-[#444] bg-[#2a2a2a] py-3 text-base font-bold text-[#888] sm:mt-6";

type Props = {
  id: string;
  label: string;
  index: number;
  display: ChooseLanguageDisplay;
  chooseLink?: ChooseLanguageLink;
};

export function LanguageCard({ id, label, index, display, chooseLink }: Props) {
  const reduce = useReducedMotion();
  const isLive = display.status === "live";

  const badge = (
    <div
      className={`mt-3 inline-flex items-center justify-center rounded-md px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide sm:text-[0.8rem] ${
        isLive
          ? "bg-[#4caf50]/20 text-[#4caf50]"
          : "bg-[#ff9800]/20 text-[#ff9800]"
      }`}
    >
      {isLive ? "✅ LIVE" : "⏳ COMING SOON"}
    </div>
  );

  if (!isLive) {
    return (
      <motion.div
        className="relative flex min-h-[200px] cursor-not-allowed flex-col overflow-hidden rounded-xl border border-[#333] bg-[#1a1a1a]/85 text-center shadow-lg backdrop-blur-md sm:min-h-[260px] lg:min-h-[280px]"
        initial={reduce ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 0.6, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{
          delay: reduce ? 0 : index * 0.1,
          duration: 0.4,
          ease: "easeOut",
        }}
        style={{ boxShadow: cardRest }}
        aria-disabled
      >
        <div className={staticCardInner}>
          <div className="flex justify-center">
            <LanguageFlagSvg id={id} />
          </div>
          <h3 className="mt-4 text-xl font-bold leading-tight text-[#f0f0f0] sm:text-2xl md:text-[1.8rem]">
            {label}
          </h3>
          <p className="mt-2 max-w-[260px] text-sm leading-snug text-[#a0a0a0] sm:text-[0.95rem]">
            {display.subtitle}
          </p>
          {badge}
          <p className="mt-2 text-xs text-[#a0a0a0] sm:text-sm">{display.statsLine}</p>
          <button type="button" disabled className={ctaSoonClassName}>
            {display.comingSoonLabel}
          </button>
        </div>
      </motion.div>
    );
  }

  if (!chooseLink) {
    return null;
  }

  const { href, target, buttonText, useNextLink } = chooseLink;

  const body = (
    <>
      <div className="flex justify-center">
        <LanguageFlagSvg id={id} />
      </div>
      <h3 className="mt-4 text-xl font-bold leading-tight text-[#f0f0f0] sm:text-2xl md:text-[1.8rem]">
        {label}
      </h3>
      <p className="mt-2 max-w-[260px] text-sm leading-snug text-[#a0a0a0] sm:text-[0.95rem]">
        {display.subtitle}
      </p>
      {badge}
      <p className="mt-2 text-xs text-[#a0a0a0] sm:text-sm">{display.statsLine}</p>
      <span className={ctaLiveClassName}>
        {buttonText}
        <span aria-hidden className="ml-1">
          →
        </span>
      </span>
    </>
  );

  return (
    <motion.div
      className="group relative flex min-h-[200px] flex-col overflow-hidden rounded-xl border border-[#333] bg-[#1a1a1a]/85 text-center shadow-lg backdrop-blur-md sm:min-h-[260px] lg:min-h-[280px]"
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
          : {
              scale: 1.05,
              y: -8,
              boxShadow: blueGlow,
              transition: { duration: 0.25, ease: "easeOut" },
            }
      }
      style={{ boxShadow: cardRest }}
    >
      {!reduce ? (
        <div
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-xl"
          aria-hidden
        >
          <div className="absolute inset-y-0 -left-1/2 w-[70%] -translate-x-full skew-x-[-14deg] bg-gradient-to-r from-transparent via-[#4a9eff]/18 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[280%]" />
        </div>
      ) : null}
      {useNextLink ? (
        <Link href={href} className={linkClassName}>
          {body}
        </Link>
      ) : (
        <a href={href} target={target} rel="noopener noreferrer" className={linkClassName}>
          {body}
        </a>
      )}
    </motion.div>
  );
}
