export type LandingDeck = {
  slug: string;
  title: string;
};

/** CTA for the marketing "Choose Language" cards. */
export type ChooseLanguageLink = {
  href: string;
  target: "_self" | "_blank";
  buttonText: string;
  /** `true`: `next/link`. `false`: `<a>` for static HTML under `/public`. */
  useNextLink: boolean;
};

export type LandingLanguage = {
  id: string;
  label: string;
  flag: string;
  decks: LandingDeck[];
  chooseLink: ChooseLanguageLink;
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
    chooseLink: {
      href: "/dashboard",
      target: "_self",
      buttonText: "Start Learning",
      useNextLink: true,
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
  },
  {
    id: "finnish",
    label: "Finnish",
    flag: "🇫🇮",
    decks: threeDecks("Finnish", "finnish"),
    // No public/languages/index-finnish.html yet
    chooseLink: {
      href: "/dashboard",
      target: "_self",
      buttonText: "Start Learning",
      useNextLink: true,
    },
  },
];
