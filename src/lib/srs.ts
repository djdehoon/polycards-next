import {
  Rating,
  State,
  createEmptyCard,
  fsrs,
  type Card,
  type Grade,
  type RecordLogItem,
} from "ts-fsrs";

/** Shared SRS scheduler (FSRS-5 defaults via generatorParameters inside `fsrs`). */
export const srsScheduler = fsrs();

export type ProgressRow = {
  id: string;
  user_id: string;
  word_id: string;
  stability: number;
  difficulty: number;
  state: number;
  reps: number;
  lapses: number;
  due_date: string;
  last_reviewed_at: string | null;
  updated_at: string;
};

/** UI scores map to SRS Rating (Again=1 … Easy=4). */
export function ratingFromScore(score: 1 | 2 | 3 | 4): Grade {
  const map: Record<1 | 2 | 3 | 4, Grade> = {
    1: Rating.Again,
    2: Rating.Hard,
    3: Rating.Good,
    4: Rating.Easy,
  };
  return map[score];
}

/** Hydrate a ts-fsrs `Card` from DB progress, or create a new card. */
export function progressToCard(row: ProgressRow | null, now: Date): Card {
  if (!row) {
    return createEmptyCard(now);
  }

  return {
    due: new Date(row.due_date),
    stability: row.stability,
    difficulty: row.difficulty,
    elapsed_days: 0,
    scheduled_days: 0,
    learning_steps: 0,
    reps: row.reps,
    lapses: row.lapses,
    state: row.state as State,
    last_review: row.last_reviewed_at
      ? new Date(row.last_reviewed_at)
      : undefined,
  };
}

/** Apply a grade and return the scheduler output (updated card + log). */
export function scheduleReview(
  card: Card,
  grade: Grade,
  now: Date,
): RecordLogItem {
  return srsScheduler.next(card, now, grade);
}

/** Build Supabase upsert payload from the card returned by the SRS algorithm. */
export function cardToProgressPayload(
  userId: string,
  wordId: string,
  card: Card,
  reviewedAt: Date,
): {
  user_id: string;
  word_id: string;
  stability: number;
  difficulty: number;
  state: number;
  reps: number;
  lapses: number;
  due_date: string;
  last_reviewed_at: string;
  updated_at: string;
} {
  return {
    user_id: userId,
    word_id: wordId,
    stability: card.stability,
    difficulty: card.difficulty,
    state: card.state,
    reps: card.reps,
    lapses: card.lapses,
    due_date: card.due.toISOString(),
    last_reviewed_at: reviewedAt.toISOString(),
    updated_at: reviewedAt.toISOString(),
  };
}
