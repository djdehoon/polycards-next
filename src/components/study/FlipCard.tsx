"use client";

import { useCallback, useEffect, useState } from "react";

export type FlipCardProps = {
  word: string;
  translation: string;
  onFlippedChange?: (flipped: boolean) => void;
  disabled?: boolean;
};

const faceBase =
  "absolute inset-0 flex-col items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-800 px-6 shadow-xl";

export function FlipCard({
  word,
  translation,
  onFlippedChange,
  disabled = false,
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    setIsFlipped(false);
    onFlippedChange?.(false);
  }, [word, onFlippedChange]);

  const handleFlip = useCallback(() => {
    if (disabled) return;
    setIsFlipped((prev) => {
      const next = !prev;
      onFlippedChange?.(next);
      return next;
    });
  }, [disabled, onFlippedChange]);

  return (
    <div className="[perspective:1200px]">
      <button
        type="button"
        onClick={handleFlip}
        disabled={disabled}
        className="relative h-56 w-full cursor-pointer border-0 bg-transparent p-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 disabled:opacity-50"
        aria-label={isFlipped ? "Toon voorkant" : "Toon achterkant"}
      >
        <div
          className={`card-inner relative h-full w-full transition-transform duration-[600ms] [transform-style:preserve-3d] ${
            isFlipped
              ? "[transform:rotateY(180deg)]"
              : "[transform:rotateY(0deg)]"
          }`}
        >
          <div
            className={`card-front ${faceBase} ${
              isFlipped ? "hidden" : "flex"
            }`}
          >
            <span className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
              Oekraïens
            </span>
            <p className="text-center text-2xl font-semibold text-zinc-50">
              {word}
            </p>
            <span className="mt-4 text-xs text-zinc-500">Klik om te draaien</span>
          </div>
          <div
            className={`card-back ${faceBase} [transform:rotateY(180deg)] ${
              isFlipped ? "flex" : "hidden"
            }`}
          >
            <span className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
              Nederlands
            </span>
            <p className="text-center text-2xl font-semibold text-zinc-50">
              {translation}
            </p>
            <span className="mt-4 text-xs text-zinc-500">Klik om te draaien</span>
          </div>
        </div>
      </button>
    </div>
  );
}
