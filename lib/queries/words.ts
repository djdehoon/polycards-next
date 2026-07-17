// lib/queries/words.ts (or wherever your word queries are)
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { Word, mapWordRowToWord } from '../db/types';

export async function getWordsByDeck(deckSlug: string): Promise<Word[]> {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from('words')
    .select(`
      *,
      decks!inner(slug)
    `)
    .eq('decks.slug', deckSlug)
    .order('sort_order', { ascending: true });

  if (error) throw error;

  return data.map(mapWordRowToWord);
}

export async function getWordsByLanguagePair(languagePairCode: string): Promise<Word[]> {
  const supabase = createBrowserSupabaseClient();
  // First get the language pair
  const { data: pair, error: pairError } = await supabase
    .from('language_pairs')
    .select('id')
    .eq('code', languagePairCode)
    .single();

  if (pairError) throw pairError;

  // Then get words for that pair
  const { data, error } = await supabase
    .from('words')
    .select('*')
    .eq('language_pair_id', pair.id)
    .order('sort_order', { ascending: true });

  if (error) throw error;

  return data.map(mapWordRowToWord);
}
