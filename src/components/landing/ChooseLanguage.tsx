"use client";

import type { ChooseLanguageDisplay, LandingLanguage } from "@/lib/languages";
import { LANDING_LANGUAGES } from "@/lib/languages";
import { motion, useReducedMotion } from "framer-motion";
import { LanguageCard } from "./LanguageCard";

function hasChooseDisplay(
  lang: LandingLanguage,
): lang is LandingLanguage & { chooseLanguageDisplay: ChooseLanguageDisplay } {
  return lang.chooseLanguageDisplay != null;
}

export function ChooseLanguage() {
  const reduce = useReducedMotion();
  const languages = LANDING_LANGUAGES.filter(hasChooseDisplay);

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
        {languages.map((lang, i) => (
          <LanguageCard
            key={lang.id}
            id={lang.id}
            label={lang.label}
            index={i}
            chooseLink={lang.chooseLink}
            display={lang.chooseLanguageDisplay}
          />
        ))}
      </div>
    </motion.section>
  );
}
