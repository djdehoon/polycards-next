"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  SPEAK_FAILED_MESSAGE,
  isSpeechSupported,
  isSpeakAbortError,
  speakWord,
  stopSpeech,
  type SpeechLanguage,
} from "@/lib/audio";
import type { StudyDirection, StudyWord } from "@/lib/study-words";
import {
  getLanguagePairMeta,
  type LanguagePairCode,
} from "@/lib/language-pairs";
import { ChineseStrokeOrder } from "@/components/study/ChineseStrokeOrder";
import { SentenceAnalysis } from "@/components/study/SentenceAnalysis";
import { hasWordAnalysis } from "@/config/features";

export type FlipCardProps = {
  studyWord: StudyWord;
  direction: StudyDirection;
  languagePair: LanguagePairCode;
  isFlipped?: boolean;
  onFlip?: (flipped: boolean) => void;
  disabled?: boolean;
  uitlegOpen?: boolean;
  onUitlegOpenChange?: (open: boolean) => void;
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
  emoji?: string;
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

function stripTrailingPunctuation(token: string): string {
  return token.replace(/[.,!?;:…]+$/u, "");
}

function normalizePhonetic(raw: string): string {
  return raw.trim().replace(/^\[|\]$/g, "").trim();
}

function tokensMatchBoldTarget(token: string, boldTarget: string): boolean {
  const normalizedToken = stripTrailingPunctuation(token);
  return (
    normalizedToken.localeCompare(boldTarget, undefined, {
      sensitivity: "accent",
    }) === 0
  );
}

function primarySentenceHasSpaces(primarySentence: string): boolean {
  return /\s/u.test(primarySentence.trim());
}

/** Bold target for transliteration line: phonetic match or same word index as primary sentence. */
function exampleTranslation2BoldTarget(
  primarySentence: string,
  secondarySentence: string,
  boldTarget: string,
  phonetic?: string | null,
): string {
  const secondaryWords = secondarySentence
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!secondaryWords.length) return "";

  if (boldTarget.trim()) {
    const directPattern = new RegExp(
      boldTarget.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i",
    );
    if (directPattern.test(secondarySentence)) return boldTarget;
  }

  const normalizedPhonetic = phonetic ? normalizePhonetic(phonetic) : "";
  if (normalizedPhonetic) {
    const phoneticPattern = new RegExp(
      normalizedPhonetic.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i",
    );
    if (phoneticPattern.test(secondarySentence)) return normalizedPhonetic;
  }

  if (!primarySentenceHasSpaces(primarySentence)) {
    return "";
  }

  if (!primarySentence.trim() || !boldTarget.trim()) {
    return stripTrailingPunctuation(secondaryWords[0]);
  }

  const primaryWords = primarySentence.trim().split(/\s+/).filter(Boolean);

  let matchWordIndex = primaryWords.findIndex((token) =>
    tokensMatchBoldTarget(token, boldTarget),
  );

  if (matchWordIndex < 0) {
    const targetPattern = new RegExp(
      boldTarget.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i",
    );
    const match = primarySentence.match(targetPattern);
    if (match?.index !== undefined) {
      const before = primarySentence.slice(0, match.index).trim();
      matchWordIndex = before ? before.split(/\s+/).length : 0;
    }
  }

  if (matchWordIndex >= 0 && matchWordIndex < secondaryWords.length) {
    return stripTrailingPunctuation(secondaryWords[matchWordIndex]);
  }

  return "";
}

function faceShowsExampleTranslation(
  direction: StudyDirection,
  side: "front" | "back",
): boolean {
  const isTargetNl = direction === "target-nl";
  return side === "front" ? isTargetNl : !isTargetNl;
}

function buildFaceContent(
  direction: StudyDirection,
  side: "front" | "back",
  word: string,
  translation: string,
  example_word: string,
  example_translation: string,
  targetSpeechLang: SpeechLanguage,
  emoji?: string,
): FaceContent {
  const isTargetNl = direction === "target-nl";

  if (side === "front") {
    if (isTargetNl) {
      const exampleSentence =
        example_translation ||
        swapWordInSentence(example_word, word, translation) ||
        example_word;
      return {
        mainWord: translation,
        secondaryWord: word,
        exampleSentence,
        boldTarget: translation,
        speechText: example_translation || translation,
        lang: targetSpeechLang,
        showPhonetic: true,
      };
    }

    const exampleSentence =
      example_word ||
      swapWordInSentence(example_translation, translation, word) ||
      example_translation;
    return {
      mainWord: word,
      secondaryWord: translation,
      exampleSentence,
      boldTarget: word,
      speechText: example_word || word,
      lang: "nl-NL",
      showPhonetic: false,
    };
  }

  if (isTargetNl) {
    return {
      mainWord: word,
      secondaryWord: "",
      exampleSentence: example_word,
      boldTarget: word,
      speechText: example_word || word,
      lang: "nl-NL",
      showPhonetic: false,
      emoji,
    };
  }

  return {
    mainWord: translation,
    secondaryWord: "",
    exampleSentence: example_translation,
    boldTarget: translation,
    speechText: example_translation || translation,
    lang: targetSpeechLang,
    showPhonetic: true,
    emoji,
  };
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

function ExampleBar({
  children,
  className = "mt-5",
  variant = "secondary",
  zhSentence = false,
}: {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary";
  zhSentence?: boolean;
}) {
  const textSize = zhSentence
    ? "text-2xl zh-sentence"
    : variant === "primary"
      ? "text-xl sm:text-2xl"
      : "text-base sm:text-lg";

  return (
    <div
      className={`${className} w-full rounded-lg bg-zinc-800/80 px-4 py-3 text-center ${textSize} text-zinc-300`}
    >
      {children}
    </div>
  );
}

export function FlipCard({
  studyWord,
  direction,
  languagePair,
  isFlipped: isFlippedProp,
  onFlip,
  disabled = false,
  uitlegOpen: uitlegOpenProp,
  onUitlegOpenChange,
}: FlipCardProps) {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const isControlled = isFlippedProp !== undefined;
  const isFlipped = isControlled ? isFlippedProp : internalFlipped;

  const [isSpeaking, setIsSpeaking] = useState<SpeakingSide | null>(null);
  const [speechAvailable, setSpeechAvailable] = useState(false);
  const [speakError, setSpeakError] = useState<string | null>(null);
  const [internalUitlegOpen, setInternalUitlegOpen] = useState(false);
  const uitlegOpen = uitlegOpenProp ?? internalUitlegOpen;
  const setUitlegOpen = onUitlegOpenChange ?? setInternalUitlegOpen;

  const word = studyWord.word;
  const translation = studyWord.translation;
  const example_word = studyWord.example_word ?? "";
  const example_translation = studyWord.example_translation ?? "";
  const example_translation2 = studyWord.example_translation2 ?? "";
  const phonetic = studyWord.phonetic ?? "";
  const displayTitle = (studyWord.deckTitle ?? "").trim();
  const pairMeta = getLanguagePairMeta(languagePair);
  const isTargetNl = direction === "target-nl";
  const isZh = languagePair === "nl-zh";
  const formattedPhonetic = formatPhonetic(phonetic);
  const displayEmoji = (studyWord.emoji ?? "").trim() || "📝";

  const frontContent = buildFaceContent(
    direction,
    "front",
    word,
    translation,
    example_word,
    example_translation,
    pairMeta.targetSpeechLang,
  );
  const backContent = buildFaceContent(
    direction,
    "back",
    word,
    translation,
    example_word,
    example_translation,
    pairMeta.targetSpeechLang,
    displayEmoji,
  );

  useEffect(() => {
    setSpeechAvailable(isSpeechSupported());
  }, []);

  useEffect(() => {
    if (!isControlled) {
      setInternalFlipped(false);
    }
    setIsSpeaking(null);
    setSpeakError(null);
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
      setSpeakError(null);
      try {
        await speakWord(text, language, { rate: 0.8, pitch: 1.0 });
      } catch (err) {
        if (!isSpeakAbortError(err)) {
          console.error("[audio] speak failed:", err);
          setSpeakError(SPEAK_FAILED_MESSAGE);
        }
      } finally {
        setIsSpeaking(null);
      }
    },
    [disabled, isSpeaking, speechAvailable],
  );

  const directionLabel = isTargetNl
    ? pairMeta.directionToNl
    : pairMeta.directionFromNl;
  const answerLabel = isTargetNl
    ? "NL VERTALING"
    : `${pairMeta.targetShort} VERTALING`;

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
        {displayTitle} 
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
          {/* <DirectionBadge className="mb-2" /> */}
          <CategoryHeader />

          {frontContent.mainWord ? (
            <p
              className={
                isZh && frontContent.showPhonetic
                  ? "zh-calligraphy mt-4 text-center text-7xl leading-none sm:text-9xl"
                  : "mt-4 text-center text-4xl font-bold text-white sm:text-6xl"
              }
            >
              {frontContent.mainWord}
            </p>
          ) : null}

          {frontContent.showPhonetic && formattedPhonetic ? (
            <p
              className={
                isZh
                  ? "mt-2 text-center text-sm italic text-zinc-500"
                  : "mt-2 text-center text-lg italic text-zinc-500 sm:text-xl"
              }
            >
              {formattedPhonetic}
            </p>
          ) : null}

          {frontContent.exampleSentence.trim() ? (
            <ExampleBar
              variant="primary"
              zhSentence={isZh && frontContent.lang === "zh-CN"}
            >
              {boldWordInSentence(
                frontContent.exampleSentence,
                frontContent.boldTarget,
              )}
            </ExampleBar>
          ) : null}
          {example_translation2 &&
            faceShowsExampleTranslation(direction, "front") && (
            <ExampleBar className="mt-2" variant="secondary">
              {boldWordInSentence(
                example_translation2,
                exampleTranslation2BoldTarget(
                  frontContent.exampleSentence,
                  example_translation2,
                  frontContent.boldTarget,
                  phonetic,
                ),
              )}
            </ExampleBar>
          )}

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            {frontContent.mainWord.trim() && (
              <SpeakButton
                side="front"
                isSpeaking={isSpeaking}
                disabled={disabled}
                speechAvailable={speechAvailable}
                onSpeak={(e) =>
                  void handleSpeak(
                    e,
                    frontContent.mainWord,
                    frontContent.lang,
                    "front",
                  )
                }
                label="Woord"
              />
            )}
            {frontContent.exampleSentence.trim() && (
              <SpeakButton
                side="front"
                isSpeaking={isSpeaking}
                disabled={disabled}
                speechAvailable={speechAvailable}
                onSpeak={(e) =>
                  void handleSpeak(
                    e,
                    frontContent.exampleSentence,
                    frontContent.lang,
                    "front",
                  )
                }
                label="Zin"
              />
            )}
          </div>

          {isZh && frontContent.showPhonetic && frontContent.mainWord.trim() ? (
            <ChineseStrokeOrder characters={frontContent.mainWord} />
          ) : null}
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
          {/* <DirectionBadge className="mb-2" /> */}
          {/* <p className="text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">
            {answerLabel}
          </p> */}
          <CategoryHeader className="mt-2" />

          {backContent.emoji ? (
            <span className="mt-6 text-4xl" aria-hidden>
              {backContent.emoji}
            </span>
          ) : null}

          {backContent.mainWord ? (
            <p
              className={
                isZh && backContent.showPhonetic
                  ? "zh-calligraphy mt-4 text-center text-7xl leading-none sm:text-9xl"
                  : "mt-4 text-center text-4xl font-bold text-green-400 sm:text-5xl"
              }
            >
              {backContent.mainWord}
            </p>
          ) : null}

          {backContent.showPhonetic && formattedPhonetic ? (
            <p
              className={
                isZh
                  ? "mt-2 text-center text-sm italic text-zinc-500"
                  : "mt-2 text-center text-lg italic text-zinc-500 sm:text-xl"
              }
            >
              {formattedPhonetic}
            </p>
          ) : null}

          {backContent.exampleSentence.trim() ? (
            <ExampleBar
              variant="primary"
              zhSentence={isZh && backContent.lang === "zh-CN"}
            >
              {boldWordInSentence(
                backContent.exampleSentence,
                backContent.boldTarget,
              )}
            </ExampleBar>
          ) : null}
          {example_translation2 &&
            faceShowsExampleTranslation(direction, "back") && (
            <ExampleBar className="mt-2" variant="secondary">
              {boldWordInSentence(
                example_translation2,
                exampleTranslation2BoldTarget(
                  backContent.exampleSentence,
                  example_translation2,
                  backContent.boldTarget,
                  phonetic,
                ),
              )}
            </ExampleBar>
          )}

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

          {isZh && backContent.showPhonetic && backContent.mainWord.trim() ? (
            <ChineseStrokeOrder characters={backContent.mainWord} />
          ) : null}
        </div>
      </div>
    );
  }

  const zhAnalysisSentence =
    frontContent.lang === "zh-CN"
      ? frontContent.exampleSentence
      : backContent.lang === "zh-CN"
        ? backContent.exampleSentence
        : "";

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
          isTargetNl ? "ring-1 ring-blue-500/40" : "ring-1 ring-amber-500/40"
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
      {hasWordAnalysis(languagePair) && zhAnalysisSentence.trim() ? (
        <SentenceAnalysis
          chineseSentence={zhAnalysisSentence}
          pinyinSentence={example_translation2 || ""}
          languagePairCode={languagePair}
          isExpanded={uitlegOpen}
          onExpandedChange={setUitlegOpen}
        />
      ) : null}
      {speakError ? (
        <p
          role="alert"
          aria-live="polite"
          className="mt-2 text-center text-xs text-amber-400"
        >
          {speakError}
        </p>
      ) : null}
    </div>
  );
}
