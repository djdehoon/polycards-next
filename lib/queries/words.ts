// lib/queries/words.ts (or wherever your word queries are)
import { supabase } from '@/lib/supabase/client';
import { Word, WordRow, mapWordRowToWord } from '@/lib/db/types';

export async function getWordsByDeck(deckSlug: string): Promise<Word[]> {
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
