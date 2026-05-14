"use client";

import type { LandingDeck } from "@/lib/languages";

type Props = {
  decks: LandingDeck[];
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
  disabled?: boolean;
};

export function DeckSelector({
  decks,
  selectedSlug,
  onSelect,
  disabled,
}: Props) {
  if (disabled || decks.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 px-4 py-8 text-center text-sm text-zinc-500">
        Pick a language to see available decks.
      </p>
    );
  }

  return (
    <div
      className="grid gap-3 sm:grid-cols-3"
      role="listbox"
      aria-label="Choose a deck"
    >
      {decks.map((deck) => {
        const selected = selectedSlug === deck.slug;
        return (
          <button
            key={deck.slug}
            type="button"
            role="option"
            aria-selected={selected}
            onClick={() => onSelect(deck.slug)}
            className={`rounded-xl border px-4 py-4 text-left transition ${
              selected
                ? "border-emerald-400/70 bg-emerald-500/10 ring-2 ring-emerald-400/40"
                : "border-zinc-700/80 bg-zinc-900/40 hover:border-zinc-500 hover:bg-zinc-800/50"
            }`}
          >
            <span className="block text-sm font-semibold text-zinc-50">
              {deck.title}
            </span>
            <span className="mt-1 block text-xs text-zinc-500">{deck.slug}</span>
          </button>
        );
      })}
    </div>
  );
}
