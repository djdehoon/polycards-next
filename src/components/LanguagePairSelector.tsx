"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLanguagePair } from "@/app/actions/language-pair";
import {
  LANGUAGE_PAIR_STORAGE_KEY,
  languagePairLabel,
  type LanguagePair,
  type LanguagePairCode,
} from "@/lib/language-pairs";

export function LanguagePairSelector({
  pairs,
  activePair,
}: {
  pairs: LanguagePair[];
  activePair: LanguagePairCode;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleChange(nextCode: string) {
    const parsed = pairs.find((p) => p.code === nextCode);
    if (!parsed || parsed.code === activePair) return;

    localStorage.setItem(LANGUAGE_PAIR_STORAGE_KEY, parsed.code);

    startTransition(() => {
      void setLanguagePair(parsed.code).then(() => {
        router.push("/dashboard");
        router.refresh();
      });
    });
  }

  return (
    <label className="flex min-w-0 flex-col gap-0.5">
      <span className="sr-only">Taalcombinatie</span>
      <select
        value={activePair}
        disabled={pending}
        onChange={(e) => handleChange(e.target.value)}
        className="max-w-[11rem] truncate rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-zinc-100 sm:max-w-none sm:px-3 sm:text-sm disabled:opacity-60"
        aria-label="Taalcombinatie"
      >
        {pairs.map((pair) => (
          <option key={pair.code} value={pair.code}>
            {languagePairLabel(pair)}
          </option>
        ))}
      </select>
    </label>
  );
}
