export type LandingDeck = {
  slug: string;
  title: string;
};

/** CTA for the marketing "Choose Language" cards (LIVE rows only). */
export type ChooseLanguageLink = {
  href: string;
  target: "_self" | "_blank";
  buttonText: string;
  /** `true`: `next/link`. `false`: `<a>` for static HTML under `/public`. */
  useNextLink: boolean;
};

/** Rich card copy for the marketing "Choose Language" grid. */
export type ChooseLanguageDisplay =
  | {
      status: "live";
      subtitle: string;
      statsLine: string;
    }
  | {
      status: "coming_soon";
      subtitle: string;
      statsLine: string;
      comingSoonLabel: string;
    };

export type LandingLanguage = {
  id: string;
  label: string;
  flag: string;
  decks: LandingDeck[];
  /** Present for LIVE marketing cards with links; omitted for coming-soon cards. */
  chooseLink?: ChooseLanguageLink;
  chooseLanguageDisplay?: ChooseLanguageDisplay;
};

/** Fixed order for the Choose Language marketing grid (Portuguese is 5th). */
export const CHOOSE_LANGUAGE_GRID_IDS = [
  "ukrainian",
  "spanish",
  "polish",
  "chinese",
  "portuguese",
  "arabic",
  "finnish",
  "swedish",
] as const;

export type ChooseLanguageGridId = (typeof CHOOSE_LANGUAGE_GRID_IDS)[number];

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
    chooseLink: {
      href: "/dashboard",
      target: "_self",
      buttonText: "Start Learning",
      useNextLink: true,
    },
    chooseLanguageDisplay: {
      subtitle: "Українська ↔ English",
      status: "live",
      statsLine: "100 words • 10 categories",
    },
  },
  {
    id: "spanish",
    label: "Spanish",
    flag: "🇪🇸",
    decks: threeDecks("Spanish", "spanish"),
    chooseLink: {
      href: "/languages/index-spanish.html",
      target: "_blank",
      buttonText: "Open Dictionary",
      useNextLink: false,
    },
    chooseLanguageDisplay: {
      subtitle: "Español ↔ English",
      status: "live",
      statsLine: "100 words • 10 categories",
    },
  },
  {
    id: "polish",
    label: "Polish",
    flag: "🇵🇱",
    decks: threeDecks("Polish", "polish"),
    chooseLink: {
      href: "/languages/index-polish.html",
      target: "_blank",
      buttonText: "Open Dictionary",
      useNextLink: false,
    },
    chooseLanguageDisplay: {
      subtitle: "Polski ↔ English",
      status: "live",
      statsLine: "100 words • 10 categories",
    },
  },
  {
    id: "chinese",
    label: "Chinese",
    flag: "🇨🇳",
    decks: threeDecks("Chinese", "chinese"),
    chooseLink: {
      href: "/languages/index-chinese.html",
      target: "_blank",
      buttonText: "Open Dictionary",
      useNextLink: false,
    },
    chooseLanguageDisplay: {
      subtitle: "中文 ↔ English",
      status: "live",
      statsLine: "100 words • 10 categories",
    },
  },
  {
    id: "portuguese",
    label: "Portuguese",
    flag: "🇵🇹",
    decks: threeDecks("Portuguese", "portuguese"),
    chooseLink: {
      href: "/languages/index-portuguese.html",
      target: "_blank",
      buttonText: "Open Dictionary",
      useNextLink: false,
    },
    chooseLanguageDisplay: {
      subtitle: "Português ↔ English",
      status: "live",
      statsLine: "100 words • 10 categories",
    },
  },
  {
    id: "arabic",
    label: "Arabic",
    flag: "🇸🇦",
    decks: threeDecks("Arabic", "arabic"),
    chooseLanguageDisplay: {
      subtitle: "العربية ↔ English",
      status: "coming_soon",
      statsLine: "100 words • 10 categories",
      comingSoonLabel: "May 2026",
    },
  },
  {
    id: "finnish",
    label: "Finnish",
    flag: "🇫🇮",
    decks: threeDecks("Finnish", "finnish"),
    chooseLanguageDisplay: {
      subtitle: "Suomi ↔ English",
      status: "coming_soon",
      statsLine: "100 words • 10 categories",
      comingSoonLabel: "May 2026",
    },
  },
  {
    id: "swedish",
    label: "Swedish",
    flag: "🇸🇪",
    decks: threeDecks("Swedish", "swedish"),
    chooseLanguageDisplay: {
      subtitle: "Svenska ↔ English",
      status: "coming_soon",
      statsLine: "100 words • 10 categories",
      comingSoonLabel: "June 2026",
    },
  },
];
