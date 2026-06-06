"use client";

import { useCallback, useEffect, useState } from "react";
import {
  isSpeechSupported,
  speakWord,
  stopSpeech,
  type SpeechLanguage,
} from "@/lib/audio";
import type { StudyDirection, StudyWord } from "@/lib/study-words";
import {
  StudyCategoryBadge,
  StudyWordBody,
} from "@/components/study/StudyCardFace";

export type FlipCardProps = {
  word: StudyWord;
  direction: StudyDirection;
  isFlipped?: boolean;
  onFlip?: (flipped: boolean) => void;
  disabled?: boolean;
};

type SpeakingSide = "front" | "back";

const faceBase =
  "absolute inset-0 flex-col items-center justify-center overflow-y-auto rounded-2xl border border-zinc-700 bg-zinc-800 px-5 py-6 shadow-xl";

function faceContent(
  word: StudyWord,
  direction: StudyDirection,
  side: "front" | "back",
) {
  const isUkFront = direction === "ua-nl";
  const showUk = side === "front" ? isUkFront : !isUkFront;
  const mainText = showUk ? word.term : word.translation;
  const langLabel = showUk ? "Oekraïens" : "Nederlands";
  const speechLang: SpeechLanguage = showUk ? "uk-UA" : "nl-NL";

  return {
    mainText,
    langLabel,
    speechLang,
    showTranslit: showUk,
  };
}

export function FlipCard({
  word,
  direction,
  isFlipped: isFlippedProp,
  onFlip,
  disabled = false,
}: FlipCardProps) {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const isControlled = isFlippedProp !== undefined;
  const isFlipped = isControlled ? isFlippedProp : internalFlipped;

  const [isSpeaking, setIsSpeaking] = useState<SpeakingSide | null>(null);
  const [speechAvailable, setSpeechAvailable] = useState(false);

  useEffect(() => {
    setSpeechAvailable(isSpeechSupported());
  }, []);

  useEffect(() => {
    if (!isControlled) {
      setInternalFlipped(false);
    }
    setIsSpeaking(null);
    stopSpeech();
    return () => {
      stopSpeech();
    };
  }, [word.id, isControlled]);

  const setFlipped = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setInternalFlipped(next);
      }
      onFlip?.(next);
    },
    [isControlled, onFlip],
  );

  const handleFlip = useCallback(() => {
    if (disabled) return;
    setFlipped(!isFlipped);
  }, [disabled, isFlipped, setFlipped]);

  const handleFlipKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setFlipped(!isFlipped);
      }
    },
    [disabled, isFlipped, setFlipped],
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

  const front = faceContent(word, direction, "front");
  const back = faceContent(word, direction, "back");

  function renderFace(
    side: "front" | "back",
    content: ReturnType<typeof faceContent>,
    hidden: boolean,
  ) {
    const rotate = side === "back" ? "[transform:rotateY(180deg)]" : "";
    const speakingSide: SpeakingSide = side;

    return (
      <div
        className={`card-${side} ${faceBase} relative ${rotate} ${
          hidden ? "hidden" : "flex"
        }`}
      >
        <StudyCategoryBadge category={word.category} />
        <button
          type="button"
          disabled={disabled || isSpeaking !== null || !speechAvailable}
          onClick={(e) =>
            void handleSpeak(
              e,
              content.mainText,
              content.speechLang,
              speakingSide,
            )
          }
          className="absolute right-3 top-3 z-10 rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-zinc-600 disabled:opacity-60"
          aria-label="Uitspraak"
          title={
            speechAvailable
              ? "Uitspraak"
              : "Spraak wordt niet ondersteund in deze browser"
          }
        >
          {isSpeaking === speakingSide ? "…" : "🔊 Uitspraak"}
        </button>

        <StudyWordBody
          word={word}
          langLabel={content.langLabel}
          mainText={content.mainText}
          showTranslit={content.showTranslit}
        />

        {side === "front" && !isFlipped ? (
          <p className="mt-4 text-xs text-zinc-500">👆 Tik om te omdraaien</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="[perspective:1200px]">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={handleFlip}
        onKeyDown={handleFlipKeyDown}
        aria-disabled={disabled}
        aria-label={isFlipped ? "Toon voorkant" : "Toon achterkant"}
        className={`relative min-h-64 w-full cursor-pointer rounded-2xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
          disabled ? "cursor-not-allowed opacity-50" : ""
        }`}
      >
        <div
          className={`card-inner relative h-full min-h-64 w-full transition-transform duration-[600ms] [transform-style:preserve-3d] ${
            isFlipped
              ? "[transform:rotateY(180deg)]"
              : "[transform:rotateY(0deg)]"
          }`}
        >
          {renderFace("front", front, isFlipped)}
          {renderFace("back", back, !isFlipped)}
        </div>
      </div>
    </div>
  );
}
