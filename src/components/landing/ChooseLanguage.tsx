"use client";

import {
  CHOOSE_LANGUAGE_GRID_IDS,
  LANDING_LANGUAGES,
  type ChooseLanguageDisplay,
  type LandingLanguage,
} from "@/lib/languages";
import { motion, useReducedMotion } from "framer-motion";
import { LanguageCard } from "./LanguageCard";

function languageForGrid(
  id: (typeof CHOOSE_LANGUAGE_GRID_IDS)[number],
): LandingLanguage & { chooseLanguageDisplay: ChooseLanguageDisplay } {
  const lang = LANDING_LANGUAGES.find((l) => l.id === id);
  if (!lang?.chooseLanguageDisplay) {
    throw new Error(`ChooseLanguage grid: missing language or display for id "${id}"`);
  }
  return lang as LandingLanguage & { chooseLanguageDisplay: ChooseLanguageDisplay };
}

export function ChooseLanguage() {
  const reduce = useReducedMotion();

  return (
    <motion.section
      className="mx-auto mt-16 max-w-[800px] rounded-3xl border border-[#333] bg-[#0f0f0f]/95 px-6 py-10 text-center shadow-2xl shadow-black/60 backdrop-blur-md sm:px-10 sm:py-12"
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      aria-labelledby="choose-language-heading"
    >
      <h2
        id="choose-language-heading"
        className="text-3xl font-bold leading-tight tracking-tight text-[#f0f0f0] max-[480px]:text-[1.75rem] sm:text-4xl md:text-[3.5rem]"
      >
        Choose Your Language
      </h2>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-[#a0a0a0] max-[480px]:text-[0.8rem] sm:text-base md:text-lg">
        Select a language to get started
      </p>

      <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {CHOOSE_LANGUAGE_GRID_IDS.map((id, i) => {
          const lang = languageForGrid(id);
          const display = lang.chooseLanguageDisplay;
          const chooseLink = display.status === "live" ? lang.chooseLink : undefined;
          return (
            <LanguageCard
              key={id}
              id={id}
              label={lang.label}
              index={i}
              display={display}
              chooseLink={chooseLink}
            />
          );
        })}
      </div>
    </motion.section>
  );
}
