import type { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  FALLBACK_LANGUAGE_PAIRS,
  type LanguagePair,
  type LanguagePairCode,
  parseLanguagePairCode,
} from "@/lib/language-pairs";

type SupabaseServerClient = Awaited<
  ReturnType<typeof createServerSupabaseClient>
>;

export async function fetchLanguagePairs(
  supabase: SupabaseServerClient,
): Promise<LanguagePair[]> {
  const { data, error } = await supabase
    .from("language_pairs")
    .select("code, source_language, target_language, flag_emoji, sort_order")
    .order("sort_order", { ascending: true });

  if (error || !data?.length) {
    return FALLBACK_LANGUAGE_PAIRS;
  }

  const parsed = data
    .map((row) => {
      const code = parseLanguagePairCode(row.code);
      if (!code) return null;
      return {
        code,
        source_language: String(row.source_language ?? ""),
        target_language: String(row.target_language ?? ""),
        flag_emoji: String(row.flag_emoji ?? ""),
        sort_order:
          typeof row.sort_order === "number" ? row.sort_order : 0,
      } satisfies LanguagePair;
    })
    .filter((row): row is LanguagePair => row !== null);

  if (parsed.length === 0) {
    return FALLBACK_LANGUAGE_PAIRS;
  }

  const present = new Set(parsed.map((p) => p.code));
  const merged = [
    ...parsed,
    ...FALLBACK_LANGUAGE_PAIRS.filter((p) => !present.has(p.code)),
  ];
  return merged.sort((a, b) => a.sort_order - b.sort_order);
}

export async function fetchDeckIdsForPair(
  supabase: SupabaseServerClient,
  pairCode: LanguagePairCode,
): Promise<string[]> {
  let query = supabase.from("words").select("deck_id");

  if (pairCode === "nl-uk") {
    query = query.or("language_pair_code.eq.nl-uk,language_pair_code.is.null");
  } else {
    query = query.eq("language_pair_code", pairCode);
  }

  const { data, error } = await query;

  if (error || !data?.length) {
    return [];
  }

  return [...new Set(data.map((row) => String(row.deck_id)))];
}
