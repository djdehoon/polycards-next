"use client";

import { useCallback, useEffect, useState } from "react";
import {
  SPEAK_FAILED_MESSAGE,
  isSpeechSupported,
  speakWord,
  stopSpeech,
  type SpeechLanguage,
} from "@/lib/audio";
import {
  compareAnswer,
  getPhonetic,
  isUkrainianPrompt,
  type StudyDirection,
  type StudyWord,
} from "@/lib/study-words";
import {
  StudyCategoryBadge,
  StudyWordExamples,
} from "@/components/study/StudyCardFace";

type TypeStudyCardProps = {
  studyWord: StudyWord;
  direction: StudyDirection;
  disabled?: boolean;
  onRevealed?: () => void;
};

export function TypeStudyCard({
  studyWord,
  direction,
  disabled = false,
  onRevealed,
}: TypeStudyCardProps) {
  const prompt =
    direction === "ua-nl" ? studyWord.translation : studyWord.word;
  const answer = direction === "ua-nl" ? studyWord.word : studyWord.translation;
  const promptLang = direction === "ua-nl" ? "Oekraïens" : "Nederlands";
  const answerLang = direction === "ua-nl" ? "Nederlands" : "Oekraïens";
  const speechLang: SpeechLanguage = direction === "ua-nl" ? "uk-UA" : "nl-NL";
  const phonetic = isUkrainianPrompt(direction)
    ? getPhonetic(studyWord)
    : null;

  const [input, setInput] = useState("");
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [speechAvailable, setSpeechAvailable] = useState(false);
  const [speakError, setSpeakError] = useState<string | null>(null);

  useEffect(() => {
    setSpeechAvailable(isSpeechSupported());
  }, []);

  useEffect(() => {
    setInput("");
    setChecked(false);
    setCorrect(false);
    setSpeakError(null);
    stopSpeech();
  }, [studyWord.id]);

  const handleCheck = useCallback(() => {
    if (disabled || checked) return;
    const ok = compareAnswer(input, answer);
    setCorrect(ok);
    setChecked(true);
    onRevealed?.();
  }, [disabled, checked, input, answer, onRevealed]);

  const handleSpeak = useCallback(async () => {
    if (disabled || speaking || !speechAvailable) return;
    setSpeaking(true);
    setSpeakError(null);
    try {
      await speakWord(prompt, speechLang);
    } catch (err) {
      console.error("[audio] speak failed:", err);
      setSpeakError(SPEAK_FAILED_MESSAGE);
    } finally {
      setSpeaking(false);
    }
  }, [disabled, speaking, speechAvailable, prompt, speechLang]);

  return (
    <div className="relative rounded-2xl border border-zinc-700 bg-zinc-800 px-5 py-6 shadow-xl">
      <StudyCategoryBadge
        category={studyWord.category}
        className="absolute left-3 top-3"
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 pt-6">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Typ in het {answerLang.toLowerCase()}
          </p>
          <p className="mt-1 text-xs text-zinc-500">{promptLang}</p>
          {studyWord.emoji ? (
            <span className="mt-2 block text-2xl" aria-hidden>
              {studyWord.emoji}
            </span>
          ) : null}
          <p className="mt-1 text-2xl font-semibold text-zinc-50">{prompt}</p>
          {phonetic ? (
            <p className="mt-1 text-sm italic text-zinc-400">{phonetic}</p>
          ) : null}
        </div>
        <button
          type="button"
          disabled={disabled || speaking || !speechAvailable}
          onClick={() => void handleSpeak()}
          className="shrink-0 rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-blue-500 disabled:opacity-60"
          aria-label="Uitspraak"
        >
          {speaking ? "…" : "🔊 Uitspraak"}
        </button>
      </div>
      {speakError ? (
        <p
          role="alert"
          aria-live="polite"
          className="mt-2 text-xs text-amber-400"
        >
          {speakError}
        </p>
      ) : null}

      <StudyWordExamples studyWord={studyWord} />

      <div className="mt-5">
        <input
          type="text"
          value={input}
          disabled={disabled || checked}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleCheck();
            }
          }}
          placeholder={`Typ het ${answerLang.toLowerCase()} woord…`}
          className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </div>

      {!checked ? (
        <button
          type="button"
          disabled={disabled || !input.trim()}
          onClick={handleCheck}
          className="mt-4 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Controleer
        </button>
      ) : (
        <div
          className={`mt-4 rounded-lg border px-3 py-3 text-sm ${
            correct
              ? "border-emerald-700/60 bg-emerald-950/40 text-emerald-300"
              : "border-amber-700/60 bg-amber-950/40 text-amber-200"
          }`}
        >
          {correct ? "✅ Goed!" : "❌ Niet helemaal."}{" "}
          <span className="text-zinc-300">
            Antwoord: <strong className="text-zinc-50">{answer}</strong>
          </span>
        </div>
      )}
    </div>
  );
}
