"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  isSpeechSupported,
  speakWord,
  stopSpeech,
  type SpeechLanguage,
} from "@/lib/audio";
import type { StudyDirection } from "@/lib/study-words";

export type FlipCardProps = {
  word: string;
  translation: string;
  phonetic: string;
  example_word: string;
  example_translation: string;
  category: string;
  emoji: string;
  direction: StudyDirection;
  isFlipped?: boolean;
  onFlip?: (flipped: boolean) => void;
  disabled?: boolean;
};

type SpeakingSide = "front" | "back";

const faceBase =
  "absolute inset-0 flex flex-col items-center overflow-y-auto rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-6 shadow-xl sm:px-5 sm:py-8";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatPhonetic(phonetic: string): string | null {
  const trimmed = phonetic.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) return trimmed;
  return `[${trimmed}]`;
}

function swapWordInSentence(
  sentence: string,
  from: string,
  to: string,
): string {
  if (!sentence.trim() || !from.trim() || !to.trim()) return sentence;
  const pattern = new RegExp(escapeRegExp(from), "i");
  return sentence.replace(pattern, to);
}

function boldWordInSentence(sentence: string, target: string): ReactNode {
  if (!sentence.trim()) return null;
  if (!target.trim()) return sentence;

  const pattern = new RegExp(escapeRegExp(target), "i");
  const match = sentence.match(pattern);
  if (!match || match.index === undefined) return sentence;

  const start = match.index;
  const end = start + match[0].length;
  return (
    <>
      {sentence.slice(0, start)}
      <strong className="font-bold text-white">{sentence.slice(start, end)}</strong>
      {sentence.slice(end)}
    </>
  );
}

function SpeakButton({
  side,
  isSpeaking,
  disabled,
  speechAvailable,
  onSpeak,
}: {
  side: SpeakingSide;
  isSpeaking: SpeakingSide | null;
  disabled: boolean;
  speechAvailable: boolean;
  onSpeak: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled || isSpeaking !== null || !speechAvailable}
      onClick={onSpeak}
      className="mt-4 flex items-center gap-2 rounded-xl bg-zinc-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-60"
      aria-label="Uitspraak"
      title={
        speechAvailable
          ? "Uitspraak"
          : "Spraak wordt niet ondersteund in deze browser"
      }
    >
      <span className="text-blue-400" aria-hidden>
        🔊
      </span>
      {isSpeaking === side ? "Playing..." : "Uitspraak"}
    </button>
  );
}

function ExampleBar({ children }: { children: ReactNode }) {
  return (
    <div className="mt-5 w-full rounded-lg bg-zinc-800/80 px-4 py-3 text-center text-sm text-zinc-300 sm:text-base">
      {children}
    </div>
  );
}

export function FlipCard({
  word,
  translation,
  phonetic,
  example_word,
  example_translation,
  category,
  emoji,
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

  const isUaNl = direction === "ua-nl";
  const formattedPhonetic = formatPhonetic(phonetic);

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
  }, [word, translation, example_word, example_translation, isControlled]);

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
      if (disabled || isSpeaking !== null || !speechAvailable || !text.trim())
        return;

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

  // word = Dutch, translation = Ukrainian
  const frontMainText = isUaNl ? translation : word;
  const frontSecondaryText = isUaNl ? word : translation;
  const frontExampleSentence = isUaNl
    ? swapWordInSentence(example_word, word, translation) ||
      example_word ||
      example_translation
    : swapWordInSentence(example_translation, translation, word) ||
      example_translation ||
      example_word;
  const frontBoldTarget = isUaNl ? translation : word;
  const frontSpeechText = isUaNl
    ? example_translation || translation
    : example_word || word;
  const frontSpeechLang: SpeechLanguage = isUaNl ? "uk-UA" : "nl-NL";

  const backLabel = isUaNl ? "NL VERTALING" : "UA VERTALING";
  const backAnswerWord = isUaNl ? word : translation;
  const backExampleSentence = isUaNl ? example_word : example_translation;
  const backBoldTarget = isUaNl ? word : translation;
  const backSpeechText = isUaNl ? example_word : example_translation;
  const backSpeechLang: SpeechLanguage = isUaNl ? "nl-NL" : "uk-UA";
  const displayEmoji = emoji.trim() || "📝";

  function CategoryHeader({ className = "" }: { className?: string }) {
    if (!category) return null;
    return (
      <p
        className={`text-center text-xs font-bold uppercase tracking-widest text-blue-400 ${className}`}
      >
        {category}
        {` ${displayEmoji}`}
      </p>
    );
  }

  function renderFrontFace(hidden: boolean) {
    const rotate = "";
    const showExample =
      frontExampleSentence.trim() || example_translation.trim() || example_word.trim();

    return (
      <div
        className={`card-front ${faceBase} relative ${rotate} ${
          hidden ? "hidden" : "flex"
        }`}
      >
        <div className="flex w-full flex-1 flex-col items-center justify-center">
          <CategoryHeader className={category ? "mt-0" : ""} />

          {frontMainText ? (
            <p className="mt-4 text-center text-2xl font-bold text-white sm:text-3xl">
              {frontMainText}
            </p>
          ) : null}

          {formattedPhonetic ? (
            <p className="mt-2 text-center text-sm italic text-zinc-500">
              {formattedPhonetic}
            </p>
          ) : null}

          {frontSecondaryText ? (
            <p className="mt-2 text-center text-xl font-bold text-green-400 sm:text-2xl">
              {frontSecondaryText}
            </p>
          ) : null}

          {showExample ? (
            <ExampleBar>
              {boldWordInSentence(frontExampleSentence, frontBoldTarget)}
            </ExampleBar>
          ) : null}

          {(frontSpeechText.trim() || showExample) && (
            <SpeakButton
              side="front"
              isSpeaking={isSpeaking}
              disabled={disabled}
              speechAvailable={speechAvailable}
              onSpeak={(e) =>
                void handleSpeak(e, frontSpeechText, frontSpeechLang, "front")
              }
            />
          )}
        </div>

        {!isFlipped ? (
          <p className="mt-4 text-xs text-zinc-500">👆 Tik om te omdraaien</p>
        ) : null}
      </div>
    );
  }

  function renderBackFace(hidden: boolean) {
    const rotate = "[transform:rotateY(180deg)]";
    const showExample =
      backExampleSentence.trim() || example_translation.trim() || example_word.trim();

    return (
      <div
        className={`card-back ${faceBase} relative ${rotate} ${
          hidden ? "hidden" : "flex"
        }`}
      >
        <div className="flex w-full flex-1 flex-col items-center justify-center">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-blue-400">
            {backLabel}
          </p>

          <CategoryHeader className="mt-3" />

          {backAnswerWord ? (
            <p className="mt-3 text-center text-2xl font-bold text-green-400 sm:text-3xl">
              {backAnswerWord}
            </p>
          ) : null}

          {showExample ? (
            <ExampleBar>
              {boldWordInSentence(backExampleSentence, backBoldTarget)}
            </ExampleBar>
          ) : null}

          {(backSpeechText.trim() || showExample) && (
            <SpeakButton
              side="back"
              isSpeaking={isSpeaking}
              disabled={disabled}
              speechAvailable={speechAvailable}
              onSpeak={(e) =>
                void handleSpeak(e, backSpeechText, backSpeechLang, "back")
              }
            />
          )}
        </div>
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
        className={`relative min-h-72 w-full cursor-pointer rounded-2xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
          disabled ? "cursor-not-allowed opacity-50" : ""
        }`}
      >
        <div
          className={`card-inner relative h-full min-h-72 w-full transition-transform duration-[600ms] [transform-style:preserve-3d] ${
            isFlipped
              ? "[transform:rotateY(180deg)]"
              : "[transform:rotateY(0deg)]"
          }`}
        >
          {renderFrontFace(isFlipped)}
          {renderBackFace(!isFlipped)}
        </div>
      </div>
    </div>
  );
}
