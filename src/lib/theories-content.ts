export type Theory = {
  id: string;
  navEmoji: string;
  navLabel: string;
  navSubtitle: string;
  title: string;
  authorYear: string;
  intro: string;
  principles: string[];
  evidence: string;
  polycardsApplication: string;
  detailParagraphs: string[];
};

export const THEORIES: Theory[] = [
  {
    id: "spaced-repetition",
    navEmoji: "🔄",
    navLabel: "Spaced Repetition",
    navSubtitle: "Review at the right moment",
    title: "Spaced Repetition",
    authorYear: "Ebbinghaus (1885) · modern SRS (SM-2, FSRS)",
    intro:
      "Memory decays predictably. Reviewing just before you forget strengthens long-term retention far more than massed cramming.",
    principles: [
      "Increase intervals as material becomes easier.",
      "Prioritize items you are about to forget.",
      "Short, repeated sessions beat single long blocks.",
    ],
    evidence:
      "Hundreds of studies show spaced practice yields higher retention than massed practice (the spacing effect), across ages and domains.",
    polycardsApplication:
      "PolyCards schedules each word with spaced repetition (FSRS), surfacing cards when your brain needs them—not when the calendar says so.",
    detailParagraphs: [
      "Ebbinghaus’s forgetting curve showed that without review, recall drops steeply at first, then more slowly. Spaced repetition rides that curve: each successful recall at widening intervals signals durable learning.",
      "Algorithms like FSRS estimate per-item stability and difficulty, adapting to how you actually rate cards. That is why the same deck can feel “hard” for one learner and “easy” for another while both still progress.",
    ],
  },
  {
    id: "comprehensible-input",
    navEmoji: "🌍",
    navLabel: "Comprehensible Input",
    navSubtitle: "Meaning-first exposure",
    title: "Comprehensible Input",
    authorYear: "Krashen (1980s) · i+1 hypothesis",
    intro:
      "We acquire language when we understand messages slightly beyond our current level—not when we drill isolated forms we cannot yet use.",
    principles: [
      "Input should be mostly understandable (i+1).",
      "Meaning comes first; form follows naturally with exposure.",
      "Affective filter: anxiety and confusion block acquisition.",
    ],
    evidence:
      "Meta-analyses link extensive comprehensible input with vocabulary growth and reading gains, especially when learners can infer meaning from context.",
    polycardsApplication:
      "Cards pair words with translations and example contexts so each review is a micro-dose of understandable input, not rote symbol matching.",
    detailParagraphs: [
      "Krashen distinguished acquisition (implicit, meaning-focused) from learning (explicit rules). Apps cannot replace immersion, but they can supply steady, level-appropriate input in digestible chunks.",
      "PolyCards keeps each card a small, meaningful unit—term, gloss, and optional sentence—so reviews reinforce comprehension, not empty repetition.",
    ],
  },
  {
    id: "active-recall",
    navEmoji: "🎯",
    navLabel: "Active Recall",
    navSubtitle: "Test, then strengthen",
    title: "Active Recall (Retrieval Practice)",
    authorYear: "Roediger & Karpicke (2006) · Karpicke & Roediger (2008)",
    intro:
      "Pulling an answer from memory strengthens memory more than re-reading the same material. Testing is learning.",
    principles: [
      "Generate the answer before revealing feedback.",
      "Struggle within reason: desirable difficulties improve retention.",
      "Mix topics (interleaving) to discriminate similar items.",
    ],
    evidence:
      "The “testing effect” is one of the most replicated findings in cognitive psychology: retrieval practice boosts long-term retention versus restudy.",
    polycardsApplication:
      "Every card is a prompt to recall before you flip or rate—classic active recall, not passive highlighting.",
    detailParagraphs: [
      "Re-reading feels productive because fluency increases; retrieval feels harder because it exposes gaps. The harder route is the one that lasts.",
      "PolyCards ratings after recall tell the scheduler how well knowledge stuck, closing the loop between retrieval and spacing.",
    ],
  },
  {
    id: "frequency-based",
    navEmoji: "📊",
    navLabel: "Frequency-Based",
    navSubtitle: "High-impact words first",
    title: "Frequency-Based Learning",
    authorYear: "Zipf / corpus linguistics · high-frequency vocabulary",
    intro:
      "A small set of high-frequency words covers a large share of everyday speech and text. Learning them first maximizes communicative payoff per hour.",
    principles: [
      "Target words that appear often in real usage.",
      "Build coverage before chasing rare literary terms.",
      "Track progress toward communicative thresholds.",
    ],
    evidence:
      "Corpus studies consistently show heavy Zipfian skew: the top ~1000 lemmas unlock a large fraction of running words in many genres.",
    polycardsApplication:
      "Decks can prioritize practical, high-utility vocabulary so beginners feel progress in real conversations sooner.",
    detailParagraphs: [
      "Frequency is not the only criterion—register and personal goals matter—but it is a strong prior for what to teach first.",
      "PolyCards decks are curated so learners spend reps on words that move the needle, not alphabetical trivia.",
    ],
  },
  {
    id: "sentence-based",
    navEmoji: "📝",
    navLabel: "Sentence-Based",
    navSubtitle: "Words in real usage",
    title: "Sentence-Based Learning",
    authorYear: "Usage-based / collocational approaches",
    intro:
      "Words live in collocations and constructions. Learning in sentences encodes grammar, pragmatics, and memory cues together.",
    principles: [
      "Chunks beat isolated lemmas for production.",
      "Collocations reveal valency and idiomatic usage.",
      "Context disambiguates polysemy.",
    ],
    evidence:
      "Research on collocation learning and construction grammar suggests richer contexts improve transfer to speaking and writing.",
    polycardsApplication:
      "Where available, example sentences anchor each lemma in living syntax—so recall is closer to real use than bare word lists.",
    detailParagraphs: [
      "Isolated flashcards risk “list knowledge.” Sentence-based cards tie form to function: you remember how the word sounds in a line someone might actually say.",
      "PolyCards encourages short, realistic contexts alongside glosses so retrieval resembles communication, not dictionary bingo.",
    ],
  },
];

export type SummaryRow = {
  theory: string;
  coreIdea: string;
  inPolyCards: string;
};

export const SUMMARY_ROWS: SummaryRow[] = [
  {
    theory: "Spaced repetition",
    coreIdea: "Review on the edge of forgetting.",
    inPolyCards: "FSRS scheduling per card.",
  },
  {
    theory: "Comprehensible input",
    coreIdea: "Understand messages slightly above your level.",
    inPolyCards: "Glosses + short contexts on cards.",
  },
  {
    theory: "Active recall",
    coreIdea: "Retrieve before feedback.",
    inPolyCards: "Prompt → recall → rate flow.",
  },
  {
    theory: "Frequency-based",
    coreIdea: "High-utility words first.",
    inPolyCards: "Practical deck ordering.",
  },
  {
    theory: "Sentence-based",
    coreIdea: "Words in chunks and collocations.",
    inPolyCards: "Example sentences where provided.",
  },
];

export const HOW_THEORIES_WORK_TOGETHER = `None of these ideas competes with the others—they stack. Spacing and retrieval make memories durable; comprehensible input and sentences make those memories *usable* in real language; frequency prioritizes what to learn first so effort converts to communication faster. PolyCards is designed so a single study session quietly applies all five.`;

export const KIT_EXAMPLE = {
  title: "Example: learning “кіт” (cat)",
  steps: [
    {
      label: "Frequency-based",
      text: "“кіт” is high-utility household vocabulary—worth learning early.",
    },
    {
      label: "Sentence-based",
      text: "Learn it inside a short line (“Це кіт.”) so grammar and intonation ride along with the lemma.",
    },
    {
      label: "Comprehensible input",
      text: "Understand the sentence with a gloss or image first so the form maps to meaning.",
    },
    {
      label: "Active recall",
      text: "Hide the answer, retrieve “cat” or “кіт,” then rate yourself honestly.",
    },
    {
      label: "Spaced repetition",
      text: "The scheduler brings “кіт” back after an interval tuned to your last rating until it sticks with minimal total time.",
    },
  ],
};
