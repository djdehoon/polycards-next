export type LandingDeck = {
  slug: string;
  title: string;
};

export type LandingLanguage = {
  id: string;
  label: string;
  flag: string;
  decks: LandingDeck[];
};

function threeDecks(langLabel: string, prefix: string): LandingDeck[] {
  return [
    { slug: `${prefix}-dictionary`, title: `${langLabel} Dictionary` },
    { slug: `${prefix}-translation`, title: `${langLabel} Translation` },
    { slug: `${prefix}-polycards`, title: `${langLabel} PolyCards` },
  ];
}

export const LANDING_LANGUAGES: LandingLanguage[] = [
  {
    id: "ukrainian",
    label: "Ukrainian",
    flag: "🇺🇦",
    decks: threeDecks("Ukrainian", "ukrainian"),
  },
  {
    id: "spanish",
    label: "Spanish",
    flag: "🇪🇸",
    decks: threeDecks("Spanish", "spanish"),
  },
  {
    id: "portuguese",
    label: "Portuguese",
    flag: "🇵🇹",
    decks: threeDecks("Portuguese", "portuguese"),
  },
  {
    id: "polish",
    label: "Polish",
    flag: "🇵🇱",
    decks: threeDecks("Polish", "polish"),
  },
  {
    id: "chinese",
    label: "Chinese",
    flag: "🇨🇳",
    decks: threeDecks("Chinese", "chinese"),
  },
  {
    id: "finnish",
    label: "Finnish",
    flag: "🇫🇮",
    decks: threeDecks("Finnish", "finnish"),
  },
];
