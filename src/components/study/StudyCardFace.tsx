import {
  getStudyExamples,
  getTranslit,
  type StudyWord,
} from "@/lib/study-words";

export function StudyCategoryBadge({
  category,
  className = "absolute left-3 top-3",
}: {
  category: string | null | undefined;
  className?: string;
}) {
  if (!category) return null;

  return (
    <span
      className={`rounded-md bg-zinc-900/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-400 ring-1 ring-zinc-700 ${className}`}
    >
      {category}
    </span>
  );
}

export function StudyWordBody({
  word,
  langLabel,
  mainText,
  showTranslit,
}: {
  word: StudyWord;
  langLabel: string;
  mainText: string;
  showTranslit: boolean;
}) {
  const translit = getTranslit(word);

  return (
    <>
      <span className="mb-1 mt-4 text-xs font-medium uppercase tracking-wide text-zinc-500">
        {langLabel}
      </span>
      {word.emoji ? (
        <span className="mb-1 text-2xl" aria-hidden>
          {word.emoji}
        </span>
      ) : null}
      <p className="text-center text-2xl font-semibold text-zinc-50">{mainText}</p>
      {showTranslit && translit ? (
        <p className="mt-1 text-sm italic text-zinc-400">{translit}</p>
      ) : null}
      <StudyWordExamples word={word} />
    </>
  );
}

export function StudyWordExamples({ word }: { word: StudyWord }) {
  const examples = getStudyExamples(word);
  if (examples.length === 0) return null;

  return (
    <div className="mt-3 max-w-full space-y-1 px-2 text-center">
      {examples.map((ex) => (
        <p
          key={ex}
          className="text-xs italic leading-snug text-zinc-400 sm:text-sm"
        >
          {ex}
        </p>
      ))}
    </div>
  );
}
