// lib/db/types.ts

// ===== LANGUAGE PAIRS =====
export interface LanguagePair {
    id: string;
    code: string;              // 'nl-uk', 'en-uk'
    from_language: string;     // 'Dutch', 'English'
    to_language: string;       // 'Ukrainian', 'Spanish'
    from_code: string;         // 'nl', 'en'
    to_code: string;           // 'uk', 'es'
    from_flag: string;         // '🇳🇱', '🇬🇧'
    to_flag: string;           // '🇺🇦', '🇪🇸'
    active: boolean;
    created_at: string;
    updated_at: string;
  }
  
  // ===== DECKS =====
  export interface DeckRow {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    language_pair_id: string;  // ← NEW!
    sort_order: number;
    created_at: string;
    updated_at: string;
  }
  
  export interface Deck {
    id: string;
    slug: string;
    title: string;
    description: string;
    language_pair_id: string;  // ← NEW!
    sort_order: number;
    created_at: string;
    updated_at: string;
  }
  
  // ===== WORDS =====
  export interface WordRow {
    id: string;
    deck_id: string;
    language_pair_id: string;  // ← NEW!
    term: string;              // Database column (source language)
    translation: string;       // Database column (target language)
    category: string | null;   // ← NEW!
    phonetic: string | null;   // ← NEW!
    example_word: string | null;        // ← NEW! (changed from example_term)
    example_translation: string | null; // ← NEW!
    emoji: string | null;      // ← NEW!
    sort_order: number;
    created_at: string;
    updated_at: string;
  }
  
  export interface Word {
    id: string;
    deck_id: string;
    language_pair_id: string;  // ← NEW!
    word_uk: string;           // Maps from 'term'
    word_nl: string;           // Maps from 'translation'
    category: string;          // ← NEW!
    phonetic: string;          // ← NEW!
    example_uk: string;        // Maps from 'example_word'
    example_nl: string;        // Maps from 'example_translation'
    emoji: string;             // ← NEW!
    sort_order: number;
    created_at: string;
    updated_at: string;
  }
  
  // ===== MAPPING FUNCTION =====
  export function mapWordRowToWord(row: WordRow): Word {
    return {
      id: row.id,
      deck_id: row.deck_id,
      language_pair_id: row.language_pair_id,
      word_uk: row.term,                      // Map from database 'term'
      word_nl: row.translation,               // Map from database 'translation'
      category: row.category || '',
      phonetic: row.phonetic || '',
      example_uk: row.example_word || '',     // Map from database 'example_word'
      example_nl: row.example_translation || '',
      emoji: row.emoji || '📝',
      sort_order: row.sort_order,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
  