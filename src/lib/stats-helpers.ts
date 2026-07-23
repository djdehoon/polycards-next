import { State } from "ts-fsrs";

/** FSRS state → browse/stats label */
export function fsrsStateLabel(state: number): "New" | "Learning" | "Review" | "Relearning" {
  switch (state) {
    case State.Learning:
      return "Learning";
    case State.Review:
      return "Review";
    case State.Relearning:
      return "Relearning";
    case State.New:
    default:
      return "New";
  }
}

export interface DeckWordStats {
  total: number;
  new: number;
  learning: number;
  review: number;
  relearning: number;
  due: number;
  /** Words with at least one successful review cycle (reps > 0) */
  learned: number;
}

/**
 * % "complete" = share of words that have been studied at least once (reps > 0).
 */
export function deckWordStats(
  wordIds: readonly string[],
  progressByWordId: ReadonlyMap<
    string,
    { state: number; reps: number; due_date: string }
  >,
  now: Date,
): DeckWordStats {
  const empty: DeckWordStats = {
    total: wordIds.length,
    new: 0,
    learning: 0,
    review: 0,
    relearning: 0,
    due: 0,
    learned: 0,
  };
  if (wordIds.length === 0) return empty;

  let newC = 0;
  let learning = 0;
  let review = 0;
  let relearning = 0;
  let due = 0;
  let learned = 0;

  for (const id of wordIds) {
    const p = progressByWordId.get(id);
    if (!p) {
      newC += 1;
      continue;
    }
    if (p.reps > 0) learned += 1;
    switch (p.state) {
      case State.New:
        newC += 1;
        break;
      case State.Learning:
        learning += 1;
        break;
      case State.Review:
        review += 1;
        if (new Date(p.due_date) <= now) due += 1;
        break;
      case State.Relearning:
        relearning += 1;
        if (new Date(p.due_date) <= now) due += 1;
        break;
      default:
        newC += 1;
    }
  }

  return {
    total: wordIds.length,
    new: newC,
    learning,
    review,
    relearning,
    due,
    learned,
  };
}

export function percentLearned(stats: DeckWordStats): number {
  if (stats.total === 0) return 0;
  return Math.round((100 * stats.learned) / stats.total);
}

export interface SessionRow {
  date: string;
  cards_studied: number;
}

/** `date` ISO `YYYY-MM-DD`; streak = consecutive days with activity ending today or yesterday */
export function studyStreakDays(rows: readonly SessionRow[], todayUtc: string): number {
  const active = new Set(
    rows.filter((r) => r.cards_studied > 0).map((r) => r.date),
  );
  if (!active.size) return 0;

  let d = parseIsoDateUtc(todayUtc);
  if (!active.has(formatIsoDate(d))) {
    d = addDays(d, -1);
  }
  if (!active.has(formatIsoDate(d))) {
    return 0;
  }

  let streak = 0;
  while (active.has(formatIsoDate(d))) {
    streak += 1;
    d = addDays(d, -1);
  }
  return streak;
}

function parseIsoDateUtc(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function formatIsoDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, delta: number): Date {
  const x = new Date(d.getTime());
  x.setUTCDate(x.getUTCDate() + delta);
  return x;
}

/** Today as YYYY-MM-DD in UTC (matches DB `sessions.date` from migration) */
export function utcTodayString(now: Date): string {
  return formatIsoDate(now);
}

/** Add calendar days to a UTC ISO date string (YYYY-MM-DD). */
export function addUtcDays(iso: string, delta: number): string {
  const d = addDays(parseIsoDateUtc(iso), delta);
  return formatIsoDate(d);
}
