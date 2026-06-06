import type { createServerSupabaseClient } from "@/lib/supabase/server";
import { addUtcDays, studyStreakDays, type SessionRow } from "@/lib/stats-helpers";

export type { SessionRow };

export type SessionStats = {
  cardsStudiedToday: number;
  streakDays: number;
};

export type HeatmapDay = {
  date: string;
  count: number;
  active: boolean;
};

type SupabaseServerClient = Awaited<
  ReturnType<typeof createServerSupabaseClient>
>;

export async function fetchUserSessionsSince(
  supabase: SupabaseServerClient,
  userId: string,
  sinceDateUtc: string,
): Promise<SessionRow[]> {
  const { data, error } = await supabase
    .from("sessions")
    .select("date, cards_studied")
    .eq("user_id", userId)
    .gte("date", sinceDateUtc)
    .returns<SessionRow[]>();

  if (error) {
    console.error("[queries] fetchUserSessionsSince failed:", error.message);
    return [];
  }

  return data ?? [];
}

export function computeSessionStats(
  sessions: SessionRow[],
  todayUtc: string,
): SessionStats {
  const todayRow = sessions.find((s) => s.date === todayUtc);
  return {
    cardsStudiedToday: todayRow?.cards_studied ?? 0,
    streakDays: studyStreakDays(sessions, todayUtc),
  };
}

export function buildHeatmapDays(
  sessions: SessionRow[],
  todayUtc: string,
  dayCount = 30,
): HeatmapDay[] {
  const sessionByDate = new Map(
    sessions.map((s) => [s.date, s.cards_studied]),
  );
  const days: HeatmapDay[] = [];

  for (let i = dayCount - 1; i >= 0; i -= 1) {
    const date = addUtcDays(todayUtc, -i);
    const count = sessionByDate.get(date) ?? 0;
    days.push({
      date,
      count,
      active: count > 0,
    });
  }

  return days;
}

export { STUDY_WORD_SELECT, normalizeStudyWord } from "@/lib/study-words";
export type {
  StudyWord,
  StudyDirection,
  StudyDirectionMode,
  StudyMode,
} from "@/lib/study-words";
