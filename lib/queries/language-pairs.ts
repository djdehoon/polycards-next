// lib/queries/language-pairs.ts
import { supabase } from '@/lib/supabase/client';
import { LanguagePair } from '@/lib/db/types';

export async function getAllLanguagePairs(): Promise<LanguagePair[]> {
  const { data, error } = await supabase
    .from('language_pairs')
    .select('*')
    .eq('active', true)
    .order('code', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getLanguagePairByCode(code: string): Promise<LanguagePair | null> {
  const { data, error } = await supabase
    .from('language_pairs')
    .select('*')
    .eq('code', code)
    .single();

  if (error) return null;
  return data;
}
