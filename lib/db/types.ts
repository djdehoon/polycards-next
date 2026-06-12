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
    word: string;              // Dutch
    translation: string;       // Ukrainian
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
    language_pair_id: string;
    word: string;
    translation: string;
    category: string;
    phonetic: string;
    example_word: string;
    example_translation: string;
    emoji: string;
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
      word: row.word,
      translation: row.translation,
      category: row.category || '',
      phonetic: row.phonetic || '',
      example_word: row.example_word || '',
      example_translation: row.example_translation || '',
      emoji: row.emoji || '📝',
      sort_order: row.sort_order,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
  