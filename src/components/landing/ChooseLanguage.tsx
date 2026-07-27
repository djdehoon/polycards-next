"use client";

import {
  CHOOSE_LANGUAGE_GRID_ROWS,
  CHOOSE_LANGUAGE_V2_GRID_ROWS,
  LANDING_LANGUAGES,
  type ChooseLanguageDisplay,
  type ChooseLanguageGridRow,
  type LandingLanguage,
} from "@/lib/languages";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { LanguageCard } from "./LanguageCard";

const kaderClassName =
  "mx-auto mt-16 scroll-mt-24 max-w-[800px] rounded-3xl border border-[#333] bg-[#0f0f0f]/95 px-6 py-10 text-center shadow-2xl shadow-black/60 backdrop-blur-md sm:px-10 sm:py-12";

const headingClassName =
  "text-3xl font-bold leading-tight tracking-tight text-[#f0f0f0] max-[480px]:text-[1.75rem] sm:text-4xl md:text-[3.5rem]";

const subClassName =
  "mx-auto mt-3 max-w-lg text-sm leading-relaxed text-[#a0a0a0] max-[480px]:text-[0.8rem] sm:text-base md:text-lg";

function languageForGridRow(
  row: ChooseLanguageGridRow,
): LandingLanguage & { chooseLanguageDisplay: ChooseLanguageDisplay } {
  const lang = LANDING_LANGUAGES.find((l) => l.id === row.languageId);
  const display = row.displayOverride ?? lang?.chooseLanguageDisplay;
  if (!lang || !display) {
    throw new Error(
      `ChooseLanguage grid: missing language or display for languageId "${row.languageId}" (row "${row.rowKey}")`,
    );
  }
  return {
    ...lang,
    chooseLanguageDisplay: display,
  };
}

function LanguageGrid({ rows }: { rows: ChooseLanguageGridRow[] }) {
  return (
    <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {rows.map((row, i) => {
        const lang = languageForGridRow(row);
        const display = lang.chooseLanguageDisplay;
        const chooseLink =
          display.status === "live"
            ? (row.linkOverride ?? lang.chooseLink)
            : undefined;
        return (
          <LanguageCard
            key={row.rowKey}
            id={row.languageId}
            label={lang.label}
            index={i}
            display={display}
            chooseLink={chooseLink}
          />
        );
      })}
    </div>
  );
}

function LanguageKader({
  id,
  headingId,
  title,
  eyebrow,
  children,
  reduce,
}: {
  id?: string;
  headingId: string;
  title: string;
  eyebrow?: string;
  children: ReactNode;
  reduce: boolean | null;
}) {
  return (
    <motion.section
      id={id}
      className={kaderClassName}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      aria-labelledby={headingId}
    >
      <h2 id={headingId} className={headingClassName}>
        {title}
      </h2>
      {eyebrow ? (
        <p className="mt-3 text-lg font-semibold text-[#f0f0f0] sm:text-xl">
          {eyebrow}
        </p>
      ) : null}
      {children}
    </motion.section>
  );
}

export function ChooseLanguage() {
  const reduce = useReducedMotion();

  return (
    <>
      <LanguageKader
        id="choose-language"
        headingId="choose-language-heading"
        title="Choose Your Language"
        eyebrow="New V2 Apps"
        reduce={reduce}
      >
        <p className={subClassName}>Select a language to get started</p>
        <LanguageGrid rows={CHOOSE_LANGUAGE_V2_GRID_ROWS} />
      </LanguageKader>

      <LanguageKader
        id="choose-language-v1"
        headingId="choose-language-v1-heading"
        title="Choose Your Language"
        eyebrow="Former V1 Apps"
        reduce={reduce}
      >
        <p className={subClassName}>Select a language to get started</p>
        <LanguageGrid rows={CHOOSE_LANGUAGE_GRID_ROWS} />
      </LanguageKader>
    </>
  );
}
