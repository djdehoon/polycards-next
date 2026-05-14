"use client";

import type { LandingLanguage } from "@/lib/languages";

type Props = {
  languages: LandingLanguage[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function LanguageSelector({ languages, selectedId, onSelect }: Props) {
  return (
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
      role="listbox"
      aria-label="Choose a language"
    >
      {languages.map((lang) => {
        const selected = selectedId === lang.id;
        return (
          <button
            key={lang.id}
            type="button"
            role="option"
            aria-selected={selected}
            onClick={() => onSelect(lang.id)}
            className={`flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 text-center transition ${
              selected
                ? "border-emerald-500/50 bg-emerald-500/12 shadow-lg shadow-emerald-950/20 ring-2 ring-emerald-500/45"
                : "border-zinc-700/80 bg-zinc-900/40 hover:border-zinc-500 hover:bg-zinc-800/50"
            }`}
          >
            <span className="text-3xl leading-none" aria-hidden>
              {lang.flag}
            </span>
            <span className="text-sm font-medium text-zinc-100">{lang.label}</span>
          </button>
        );
      })}
    </div>
  );
}
