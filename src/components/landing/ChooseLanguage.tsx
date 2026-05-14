"use client";

import { motion, useReducedMotion } from "framer-motion";
import { LANDING_LANGUAGES } from "@/lib/languages";
import { LanguageCard } from "./LanguageCard";

export function ChooseLanguage() {
  const reduce = useReducedMotion();

  return (
    <motion.section
      className="mx-auto mt-16 max-w-[800px] rounded-3xl border border-white/10 bg-[#080808]/90 px-6 py-10 text-center shadow-2xl shadow-black/50 backdrop-blur-sm sm:px-8 sm:py-12"
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      aria-labelledby="choose-language-heading"
    >
      <h2
        id="choose-language-heading"
        className="text-3xl font-bold tracking-tight text-white sm:text-[2rem]"
      >
        Choose Your Language
      </h2>
      <p className="mx-auto mt-3 max-w-lg text-base leading-relaxed text-[#b0b0b0]">
        Select a language to get started
      </p>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {LANDING_LANGUAGES.map((lang, i) => (
          <LanguageCard
            key={lang.id}
            flag={lang.flag}
            label={lang.label}
            index={i}
          />
        ))}
      </div>
    </motion.section>
  );
}
