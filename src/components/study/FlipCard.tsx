"use client";

import { useCallback, useEffect, useState } from "react";
import {
  isSpeechSupported,
  speakWord,
  stopSpeech,
  type SpeechLanguage,
} from "@/lib/audio";

export type FlipCardProps = {
  word: string;
  translation: string;
  disabled?: boolean;
};

type SpeakingSide = "uk" | "nl";

const faceBase =
  "absolute inset-0 flex-col items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-800 px-6 shadow-xl";

const speakerBase =
  "absolute right-3 top-3 z-10 rounded-lg px-2.5 py-1.5 text-xs font-medium text-white transition disabled:cursor-not-allowed disabled:bg-zinc-600 disabled:opacity-60";

function SpeakerButton({
  isSpeaking,
  speakingSide,
  disabled,
  speechAvailable,
  className,
  ariaLabel,
  onSpeak,
}: {
  isSpeaking: SpeakingSide | null;
  speakingSide: SpeakingSide;
  disabled: boolean;
  speechAvailable: boolean;
  className: string;
  ariaLabel: string;
  onSpeak: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  const playing = isSpeaking === speakingSide;
  const speakerDisabled =
    disabled || isSpeaking !== null || !speechAvailable;

  return (
    <button
      type="button"
      disabled={speakerDisabled}
      onClick={onSpeak}
      className={`${speakerBase} ${className}`}
      aria-label={ariaLabel}
      title={
        speechAvailable
          ? ariaLabel
          : "Spraak wordt niet ondersteund in deze browser"
      }
    >
      {playing ? "Playing..." : "🔊"}
    </button>
  );
}

export function FlipCard({
  word,
  translation,
  disabled = false,
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<SpeakingSide | null>(null);
  const [speechAvailable, setSpeechAvailable] = useState(false);

  useEffect(() => {
    setSpeechAvailable(isSpeechSupported());
  }, []);

  useEffect(() => {
    setIsFlipped(false);
    setIsSpeaking(null);
    stopSpeech();
    return () => {
      stopSpeech();
    };
  }, [word]);

  const handleFlip = useCallback(() => {
    if (disabled) return;
    setIsFlipped((prev) => !prev);
  }, [disabled]);

  const handleFlipKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      }
    },
    [disabled],
  );

  const handleSpeak = useCallback(
    async (
      e: React.MouseEvent<HTMLButtonElement>,
      text: string,
      language: SpeechLanguage,
      side: SpeakingSide,
    ) => {
      e.stopPropagation();
      if (disabled || isSpeaking !== null || !speechAvailable) return;

      setIsSpeaking(side);
      try {
        await speakWord(text, language);
      } catch (err) {
        console.error("[audio] speak failed:", err);
      } finally {
        setIsSpeaking(null);
      }
    },
    [disabled, isSpeaking, speechAvailable],
  );

  return (
    <div className="[perspective:1200px]">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={handleFlip}
        onKeyDown={handleFlipKeyDown}
        aria-disabled={disabled}
        aria-label={isFlipped ? "Toon voorkant" : "Toon achterkant"}
        className={`relative h-56 w-full cursor-pointer rounded-2xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 ${
          disabled ? "cursor-not-allowed opacity-50" : ""
        }`}
      >
        <div
          className={`card-inner relative h-full w-full transition-transform duration-[600ms] [transform-style:preserve-3d] ${
            isFlipped
              ? "[transform:rotateY(180deg)]"
              : "[transform:rotateY(0deg)]"
          }`}
        >
          <div
            className={`card-front ${faceBase} relative ${
              isFlipped ? "hidden" : "flex"
            }`}
          >
            <SpeakerButton
              isSpeaking={isSpeaking}
              speakingSide="uk"
              disabled={disabled}
              speechAvailable={speechAvailable}
              className="bg-blue-600 hover:bg-blue-500"
              ariaLabel="Uitspraak Oekraïens"
              onSpeak={(e) => void handleSpeak(e, word, "uk-UA", "uk")}
            />
            <span className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
              Oekraïens
            </span>
            <p className="text-center text-2xl font-semibold text-zinc-50">
              {word}
            </p>
            <span className="mt-4 text-xs text-zinc-500">Klik om te draaien</span>
          </div>
          <div
            className={`card-back ${faceBase} relative [transform:rotateY(180deg)] ${
              isFlipped ? "flex" : "hidden"
            }`}
          >
            <SpeakerButton
              isSpeaking={isSpeaking}
              speakingSide="nl"
              disabled={disabled}
              speechAvailable={speechAvailable}
              className="bg-emerald-600 hover:bg-emerald-500"
              ariaLabel="Uitspraak Nederlands"
              onSpeak={(e) =>
                void handleSpeak(e, translation, "nl-NL", "nl")
              }
            />
            <span className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
              Nederlands
            </span>
            <p className="text-center text-2xl font-semibold text-zinc-50">
              {translation}
            </p>
            <span className="mt-4 text-xs text-zinc-500">Klik om te draaien</span>
          </div>
        </div>
      </div>
    </div>
  );
}
