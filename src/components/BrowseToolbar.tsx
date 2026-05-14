"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

type Deck = { id: string; title: string; description: string | null };

const STATUS_OPTIONS = [
  { value: "all", label: "Alle statussen" },
  { value: "New", label: "New" },
  { value: "Learning", label: "Learning" },
  { value: "Review", label: "Review" },
  { value: "Relearning", label: "Relearning" },
] as const;

export function BrowseToolbar({
  decks,
  initialQ,
}: {
  decks: Deck[];
  initialQ: string;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(initialQ);

  const push = useCallback(
    (next: Record<string, string | undefined>) => {
      const params = new URLSearchParams(sp.toString());
      for (const [k, v] of Object.entries(next)) {
        if (v === undefined || v === "") {
          params.delete(k);
        } else {
          params.set(k, v);
        }
      }
      router.push(`/browse?${params.toString()}`);
    },
    [router, sp],
  );

  return (
    <div className="mb-6 flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4 ring-1 ring-white/5 sm:flex-row sm:flex-wrap sm:items-end">
      <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-xs text-zinc-500">
        Deck
        <select
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          value={sp.get("deck") ?? decks[0]?.id ?? ""}
          onChange={(e) => push({ deck: e.target.value || undefined })}
        >
          {decks.map((d) => (
            <option key={d.id} value={d.id}>
              {d.title}
            </option>
          ))}
        </select>
      </label>
      <label className="flex min-w-[10rem] flex-col gap-1 text-xs text-zinc-500">
        Status
        <select
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          value={sp.get("status") ?? "all"}
          onChange={(e) =>
            push({
              status: e.target.value === "all" ? undefined : e.target.value,
            })
          }
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <form
        className="flex min-w-[12rem] flex-1 flex-col gap-1"
        onSubmit={(e) => {
          e.preventDefault();
          push({ q: q.trim() || undefined });
        }}
      >
        <label className="text-xs text-zinc-500" htmlFor="browse-q">
          Zoeken
        </label>
        <div className="flex gap-2">
          <input
            id="browse-q"
            className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600"
            placeholder="Woord of vertaling…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-700"
          >
            Zoek
          </button>
        </div>
      </form>
    </div>
  );
}
