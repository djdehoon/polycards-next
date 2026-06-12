"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  isSpeechSupported,
  speakWord,
  stopSpeech,
  type SpeechLanguage,
} from "@/lib/audio";
import type { StudyDirection, StudyWord } from "@/lib/study-words";

export type FlipCardProps = {
  studyWord: StudyWord;
  direction: StudyDirection;
  isFlipped?: boolean;
  onFlip?: (flipped: boolean) => void;
  disabled?: boolean;
};

type SpeakingSide = "front" | "back";

type FaceContent = {
  mainWord: string;
  secondaryWord: string;
  exampleSentence: string;
  boldTarget: string;
  speechText: string;
  lang: SpeechLanguage;
  showPhonetic: boolean;
};

const faceBase =
  "absolute inset-0 flex flex-col items-center overflow-y-auto rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-6 shadow-xl sm:px-5 sm:py-8";

function formatPhonetic(phonetic: string): string | null {
  const trimmed = phonetic.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) return trimmed;
  return `[${trimmed}]`;
}

function swapWordInSentence(
  sentence: string,
  fromWord: string,
  toWord: string,
): string {
  if (!sentence.trim() || !fromWord.trim() || !toWord.trim()) return "";
  const pattern = new RegExp(
    fromWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    "i",
  );
  if (!pattern.test(sentence)) return "";
  return sentence.replace(pattern, toWord);
}

function boldWordInSentence(sentence: string, target: string): ReactNode {
  if (!sentence.trim()) return null;
  if (!target.trim()) return sentence;

  const pattern = new RegExp(target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
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
  label,
}: {
  side: SpeakingSide;
  isSpeaking: SpeakingSide | null;
  disabled: boolean;
  speechAvailable: boolean;
  onSpeak: (e: React.MouseEvent<HTMLButtonElement>) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled || isSpeaking !== null || !speechAvailable}
      onClick={onSpeak}
      className="mt-3 flex items-center gap-2 rounded-xl bg-zinc-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-60"
      aria-label={label}
      title={speechAvailable ? label : "Spraak wordt niet ondersteund"}
    >
      <span className="text-blue-400" aria-hidden>
        🔊
      </span>
      {isSpeaking === side ? "Playing..." : label}
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

function buildFaceContent(
  direction: StudyDirection,
  side: "front" | "back",
  wordUk: string,
  wordNl: string,
  exampleUk: string,
  exampleNl: string,
): FaceContent {
  const isUaNl = direction === "ua-nl";

  if (side === "front") {
    if (isUaNl) {
      const exampleSentence =
        swapWordInSentence(exampleNl, wordNl, wordUk) ||
        exampleUk ||
        exampleNl;
      return {
        mainWord: wordUk,
        secondaryWord: wordNl,
        exampleSentence,
        boldTarget: wordUk,
        speechText: exampleUk || wordUk,
        lang: "uk-UA",
        showPhonetic: true,
      };
    }

    const exampleSentence =
      swapWordInSentence(exampleUk, wordUk, wordNl) ||
      exampleNl ||
      exampleUk;
    return {
      mainWord: wordNl,
      secondaryWord: wordUk,
      exampleSentence,
      boldTarget: wordNl,
      speechText: exampleNl || wordNl,
      lang: "nl-NL",
      showPhonetic: false,
    };
  }

  if (isUaNl) {
    return {
      mainWord: wordNl,
      secondaryWord: "",
      exampleSentence: exampleNl,
      boldTarget: wordNl,
      speechText: exampleNl || wordNl,
      lang: "nl-NL",
      showPhonetic: false,
    };
  }

  return {
    mainWord: wordUk,
    secondaryWord: "",
    exampleSentence: exampleUk,
    boldTarget: wordUk,
    speechText: exampleUk || wordUk,
    lang: "uk-UA",
    showPhonetic: true,
  };
}

export function FlipCard({
  studyWord,
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

  const wordUk = studyWord.term;
  const wordNl = studyWord.translation;
  const exampleUk = studyWord.example_uk ?? "";
  const exampleNl = studyWord.example_nl ?? "";
  const phonetic = studyWord.translit ?? "";
  const category = studyWord.category ?? "";
  const deckTitle = studyWord.deckTitle ?? category;
  const emoji = studyWord.emoji ?? "📝";

  const isUaNl = direction === "ua-nl";
  const formattedPhonetic = formatPhonetic(phonetic);
  const displayEmoji = emoji.trim() || "📝";
  const displayTitle = deckTitle || category;

  const frontContent = buildFaceContent(
    direction,
    "front",
    wordUk,
    wordNl,
    exampleUk,
    exampleNl,
  );
  const backContent = buildFaceContent(
    direction,
    "back",
    wordUk,
    wordNl,
    exampleUk,
    exampleNl,
  );

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
  }, [studyWord.id, direction, isControlled]);

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

  const directionLabel = isUaNl ? "UA → NL" : "NL → UA";
  const answerLabel = isUaNl ? "NL VERTALING" : "UA VERTALING";

  function DirectionBadge({ className = "" }: { className?: string }) {
    return (
      <span
        className={`inline-block rounded-full bg-zinc-800 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-400 ring-1 ring-zinc-700 ${className}`}
      >
        {directionLabel}
      </span>
    );
  }

  function CategoryHeader({ className = "" }: { className?: string }) {
    if (!displayTitle) return null;
    return (
      <p
        className={`text-center text-xs font-bold uppercase tracking-widest text-blue-400 ${className}`}
      >
        {displayTitle} {displayEmoji}
      </p>
    );
  }

  function renderFrontFace(hidden: boolean) {
    return (
      <div
        className={`card-front ${faceBase} relative ${
          hidden ? "hidden" : "flex"
        }`}
      >
        <div className="flex w-full flex-1 flex-col items-center justify-center">
          <DirectionBadge className="mb-2" />
          <CategoryHeader />

          {frontContent.mainWord ? (
            <p className="mt-4 text-center text-3xl font-bold text-white sm:text-4xl">
              {frontContent.mainWord}
            </p>
          ) : null}

          {frontContent.showPhonetic && formattedPhonetic ? (
            <p className="mt-2 text-center text-sm italic text-zinc-500">
              {formattedPhonetic}
            </p>
          ) : null}

          {frontContent.secondaryWord ? (
            <p className="mt-2 text-center text-xl font-bold text-green-400 sm:text-2xl">
              {frontContent.secondaryWord}
            </p>
          ) : null}

          {frontContent.exampleSentence.trim() ? (
            <ExampleBar>
              {boldWordInSentence(
                frontContent.exampleSentence,
                frontContent.boldTarget,
              )}
            </ExampleBar>
          ) : null}

          {frontContent.speechText.trim() && (
            <SpeakButton
              side="front"
              isSpeaking={isSpeaking}
              disabled={disabled}
              speechAvailable={speechAvailable}
              onSpeak={(e) =>
                void handleSpeak(
                  e,
                  frontContent.speechText,
                  frontContent.lang,
                  "front",
                )
              }
              label="Uitspraak"
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
    return (
      <div
        className={`card-back ${faceBase} relative [transform:rotateY(180deg)] ${
          hidden ? "hidden" : "flex"
        }`}
      >
        <div className="flex w-full flex-1 flex-col items-center justify-center">
          <DirectionBadge className="mb-2" />
          <p className="text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">
            {answerLabel}
          </p>
          <CategoryHeader className="mt-2" />

          {backContent.mainWord ? (
            <p className="mt-4 text-center text-3xl font-bold text-green-400 sm:text-4xl">
              {backContent.mainWord}
            </p>
          ) : null}

          {backContent.showPhonetic && formattedPhonetic ? (
            <p className="mt-2 text-center text-sm italic text-zinc-500">
              {formattedPhonetic}
            </p>
          ) : null}

          {backContent.exampleSentence.trim() ? (
            <ExampleBar>
              {boldWordInSentence(
                backContent.exampleSentence,
                backContent.boldTarget,
              )}
            </ExampleBar>
          ) : null}

          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            {backContent.mainWord.trim() && (
              <SpeakButton
                side="back"
                isSpeaking={isSpeaking}
                disabled={disabled}
                speechAvailable={speechAvailable}
                onSpeak={(e) =>
                  void handleSpeak(
                    e,
                    backContent.mainWord,
                    backContent.lang,
                    "back",
                  )
                }
                label="Woord"
              />
            )}
            {backContent.exampleSentence.trim() && (
              <SpeakButton
                side="back"
                isSpeaking={isSpeaking}
                disabled={disabled}
                speechAvailable={speechAvailable}
                onSpeak={(e) =>
                  void handleSpeak(
                    e,
                    backContent.exampleSentence,
                    backContent.lang,
                    "back",
                  )
                }
                label="Zin"
              />
            )}
          </div>
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
          isUaNl ? "ring-1 ring-blue-500/40" : "ring-1 ring-amber-500/40"
        } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
        data-direction={direction}
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
