import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Instructies | PolyCards",
  description:
    "Hoe PolyCards werkt: studeren, audio, FSRS spaced repetition, dashboard-stats en technische details.",
};

const sectionClass =
  "mb-10 rounded-lg border border-zinc-800 bg-zinc-900 p-6 ring-1 ring-white/5 sm:p-8";

export default function InstructionsPage() {
  return (
    <div className="flex-1 px-4 py-6 sm:py-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
            Instructies
          </h1>
          <p className="mt-2 text-lg text-zinc-400">Alles over PolyCards</p>
        </header>

        <section className={sectionClass}>
          <h2 className="text-2xl font-semibold text-zinc-50">
            Wat is PolyCards?
          </h2>
          <p className="mt-3 text-zinc-300 leading-relaxed">
            PolyCards helpt je talen leren via slimme flashcards met{" "}
            <strong className="text-zinc-100">spaced repetition</strong> — een
            bewezen methode waarbij je woorden op het juiste moment herhaalt.
          </p>
          <div className="mt-4 rounded-md border border-zinc-700 bg-zinc-950/80 p-4">
            <p className="text-sm text-zinc-300">
              <strong className="text-zinc-100">Gebaseerd op FSRS:</strong>{" "}
              PolyCards gebruikt het moderne{" "}
              <a
                href="https://github.com/open-spaced-repetition/fsrs4anki"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                Free Spaced Repetition Scheduler (FSRS)
              </a>{" "}
              voor optimale herhaling.
            </p>
          </div>
        </section>

        <section className={sectionClass}>
          <h2 className="text-2xl font-semibold text-zinc-50">
            Hoe gebruik je de app?
          </h2>
          <ol className="mt-6 space-y-6">
            {[
              {
                title: "Kies een deck",
                body: (
                  <>
                    Ga naar het{" "}
                    <Link
                      href="/dashboard"
                      className="text-blue-400 hover:underline"
                    >
                      Dashboard
                    </Link>{" "}
                    en klik op <strong className="text-zinc-100">Studeren</strong>{" "}
                    bij een categorie.
                  </>
                ),
              },
              {
                title: "Bekijk de kaart",
                body: (
                  <>
                    Afhankelijk van de richting zie je een Oekraïens of
                    Nederlands woord. Probeer de vertaling te bedenken.
                  </>
                ),
              },
              {
                title: "Draai de kaart (of type)",
                body: (
                  <>
                    In <strong className="text-zinc-100">Flashcard</strong>-modus:
                    tik om te omdraaien. In{" "}
                    <strong className="text-zinc-100">Type</strong>-modus: typ
                    het antwoord zelf.
                  </>
                ),
              },
              {
                title: "Beoordeel jezelf",
                body: (
                  <>
                    Kies eerlijk:{" "}
                    <strong className="text-zinc-100">Again</strong> /{" "}
                    <strong className="text-zinc-100">Hard</strong> /{" "}
                    <strong className="text-zinc-100">Good</strong> /{" "}
                    <strong className="text-zinc-100">Easy</strong>. FSRS plant
                    de volgende herhaling.
                  </>
                ),
              },
            ].map((step, i) => (
              <li key={step.title} className="flex items-start gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-100">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-zinc-400">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className={sectionClass}>
          <h2 className="text-2xl font-semibold text-zinc-50">
            Audio-uitspraak
          </h2>
          <p className="mt-3 text-zinc-300">
            Op de flashcard staan twee knoppen:
          </p>
          <ul className="mt-4 space-y-2 text-zinc-300">
            <li>
              <strong className="text-zinc-100">Woord</strong> — alleen het
              woord
            </li>
            <li>
              <strong className="text-zinc-100">Zin</strong> — de hele
              voorbeeldzin
            </li>
          </ul>
          <p className="mt-4 text-sm text-zinc-500">
            Uitspraak via Google Cloud TTS (met browser-fallback). Nu: Oekraïens
            en Nederlands.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold text-zinc-50">
            Modes &amp; richtingen
          </h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 ring-1 ring-white/5 sm:p-8">
              <h3 className="text-xl font-semibold text-blue-400">
                Flashcard
              </h3>
              <p className="mt-2 text-zinc-300">
                Flip-kaart: eerst prompt, daarna antwoord. Goed voor snelle
                herhaling.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 ring-1 ring-white/5 sm:p-8">
              <h3 className="text-xl font-semibold text-amber-400">Type</h3>
              <p className="mt-2 text-zinc-300">
                Typ de vertaling zelf. Uitdagender — oefent actieve recall en
                spelling.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 ring-1 ring-white/5 sm:p-8">
              <h3 className="text-xl font-semibold text-green-400">
                Richting
              </h3>
              <p className="mt-2 text-zinc-300">
                Kies <strong className="text-zinc-100">UA → NL</strong>,{" "}
                <strong className="text-zinc-100">NL → UA</strong>, of{" "}
                <strong className="text-zinc-100">Mix</strong>. Oefen beide
                richtingen voor beter begrip.
              </p>
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <h2 className="text-2xl font-semibold text-zinc-50">
            Dashboard-statistieken
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="border-l-4 border-blue-400 pl-4">
              <h3 className="font-semibold text-blue-400">New</h3>
              <p className="mt-1 text-sm text-zinc-400">
                Woorden die je nog niet (echt) geleerd hebt.
              </p>
            </div>
            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="font-semibold text-red-500">Learning</h3>
              <p className="mt-1 text-sm text-zinc-400">
                Woorden in de leercyclus (inclusief relearning).
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-green-500">Due</h3>
              <p className="mt-1 text-sm text-zinc-400">
                Review-kaarten die nu aan de beurt zijn.
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-zinc-500">
            Volledige breakdown (inclusief Review) staat op{" "}
            <Link href="/stats" className="text-blue-400 hover:underline">
              Stats
            </Link>
            .
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className="text-2xl font-semibold text-zinc-50">
            Tips voor effectief leren
          </h2>
          <ul className="mt-4 space-y-2 text-zinc-300">
            <li>Oefen dagelijks, ook al is het maar 5 minuten</li>
            <li>Wees eerlijk bij Again / Hard / Good / Easy</li>
            <li>Gebruik audio voor uitspraak</li>
            <li>Oefen beide richtingen (UA↔NL)</li>
            <li>Herhaal hardop wat je hoort</li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className="text-2xl font-semibold text-zinc-50">
            Veelgestelde vragen
          </h2>
          <dl className="mt-6 space-y-6">
            <div>
              <dt className="font-semibold text-zinc-100">Kost de app geld?</dt>
              <dd className="mt-1 text-zinc-400">
                Nee, PolyCards is gratis.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-zinc-100">
                Wordt mijn voortgang opgeslagen?
              </dt>
              <dd className="mt-1 text-zinc-400">
                Ja, in je account via de database — ook als je van apparaat
                wisselt.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-zinc-100">Werkt het offline?</dt>
              <dd className="mt-1 text-zinc-400">
                Gedeeltelijk (PWA). Studeren en voortgang vragen meestal om
                internet; TTS ook.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-zinc-100">
                Welke talen zijn beschikbaar?
              </dt>
              <dd className="mt-1 text-zinc-400">
                Nu: Nederlands ↔ Oekraïens. Meer talen volgen later.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-zinc-100">
                Hoe werkt spaced repetition?
              </dt>
              <dd className="mt-1 text-zinc-400">
                FSRS plant de volgende herhaling op basis van je rating. Zie de{" "}
                <a href="#technical" className="text-blue-400 hover:underline">
                  technische sectie
                </a>
                .
              </dd>
            </div>
          </dl>
        </section>

        <section className={sectionClass}>
          <h2 className="text-2xl font-semibold text-zinc-50">
            Wat is nieuw
          </h2>
          <ul className="mt-4 space-y-2 text-zinc-300">
            <li>Dubbele audio-knoppen (Woord + Zin)</li>
            <li>Google Cloud TTS met browser-fallback</li>
            <li>Oekraïense voorbeeldzinnen</li>
            <li>Anki-kleuren op het dashboard (New / Learning / Due)</li>
            <li>Deze instructiepagina</li>
            <li>FSRS-gebaseerd spaced repetition</li>
          </ul>
        </section>

        <section
          id="technical"
          className="mb-10 scroll-mt-24 rounded-lg border border-zinc-700 bg-zinc-900/80 p-6 ring-1 ring-white/5 sm:p-8"
        >
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-semibold text-zinc-50">
              Technische details
            </h2>
            <span className="rounded-full bg-zinc-800 px-3 py-0.5 text-xs text-zinc-400">
              Voor gevorderde gebruikers
            </span>
          </div>

          <h3 className="text-lg font-semibold text-zinc-100">
            User progress
          </h3>
          <p className="mt-2 text-zinc-400">
            Per <strong className="text-zinc-200">gebruiker × woord</strong>{" "}
            bewaart PolyCards één rij in{" "}
            <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-sm text-zinc-200">
              user_progress
            </code>
            . Dat is de FSRS-kaart (state, due date, stability, difficulty).
            Er is geen aparte teller — New / Learning / Due worden afgeleid van
            deze rijen.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-zinc-100">
            Databasevelden
          </h3>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full border border-zinc-700 text-left text-sm">
              <thead className="bg-zinc-800 text-zinc-300">
                <tr>
                  <th className="border-b border-zinc-700 px-3 py-2 font-medium">
                    Veld
                  </th>
                  <th className="border-b border-zinc-700 px-3 py-2 font-medium">
                    Betekenis
                  </th>
                </tr>
              </thead>
              <tbody className="text-zinc-400">
                <tr>
                  <td className="border-b border-zinc-800 px-3 py-2">
                    <code className="text-zinc-200">user_id</code> +{" "}
                    <code className="text-zinc-200">word_id</code>
                  </td>
                  <td className="border-b border-zinc-800 px-3 py-2">
                    Unieke voortgang (upsert-key)
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-zinc-800 px-3 py-2">
                    <code className="text-zinc-200">state</code>
                  </td>
                  <td className="border-b border-zinc-800 px-3 py-2">
                    New / Learning / Review / Relearning
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-zinc-800 px-3 py-2">
                    <code className="text-zinc-200">due_date</code>
                  </td>
                  <td className="border-b border-zinc-800 px-3 py-2">
                    Wanneer de kaart weer due is
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-zinc-800 px-3 py-2">
                    <code className="text-zinc-200">stability</code> /{" "}
                    <code className="text-zinc-200">difficulty</code>
                  </td>
                  <td className="border-b border-zinc-800 px-3 py-2">
                    FSRS-geheugenparameters
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-zinc-800 px-3 py-2">
                    <code className="text-zinc-200">reps</code> /{" "}
                    <code className="text-zinc-200">lapses</code>
                  </td>
                  <td className="border-b border-zinc-800 px-3 py-2">
                    Reviews / mislukkingen
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2">
                    <code className="text-zinc-200">last_reviewed_at</code> /{" "}
                    <code className="text-zinc-200">last_rating</code>
                  </td>
                  <td className="px-3 py-2">Laatste review (1–4)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            RLS: alleen de eigenaar mag eigen progress lezen/schrijven.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-zinc-100">
            Flow bij studeren
          </h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-zinc-400">
            <li>
              <strong className="text-zinc-200">Queue:</strong> woorden zonder
              progress of met{" "}
              <code className="rounded bg-zinc-800 px-1 text-zinc-200">
                due_date ≤ now
              </code>
            </li>
            <li>
              <strong className="text-zinc-200">Rate:</strong> Again/Hard/Good/Easy
              → 1–4
            </li>
            <li>
              <strong className="text-zinc-200">FSRS:</strong>{" "}
              <code className="rounded bg-zinc-800 px-1 text-zinc-200">
                progressToCard
              </code>{" "}
              →{" "}
              <code className="rounded bg-zinc-800 px-1 text-zinc-200">
                scheduleReview
              </code>{" "}
              → upsert via{" "}
              <code className="rounded bg-zinc-800 px-1 text-zinc-200">
                cardToProgressPayload
              </code>
            </li>
            <li>
              <strong className="text-zinc-200">Sessie:</strong>{" "}
              <code className="rounded bg-zinc-800 px-1 text-zinc-200">
                record_study_session
              </code>{" "}
              voor dagdoel/streak
            </li>
          </ol>
          <p className="mt-2 text-xs text-zinc-500">
            Bestanden:{" "}
            <code className="text-zinc-400">src/app/(main)/study/page.tsx</code>,{" "}
            <code className="text-zinc-400">src/lib/srs.ts</code>
          </p>

          <h3 className="mt-8 text-lg font-semibold text-zinc-100">
            States vs dashboard
          </h3>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full border border-zinc-700 text-left text-sm">
              <thead className="bg-zinc-800 text-zinc-300">
                <tr>
                  <th className="border-b border-zinc-700 px-3 py-2 font-medium">
                    State
                  </th>
                  <th className="border-b border-zinc-700 px-3 py-2 font-medium">
                    Dashboard
                  </th>
                </tr>
              </thead>
              <tbody className="text-zinc-400">
                <tr>
                  <td className="border-b border-zinc-800 px-3 py-2">
                    Geen rij / New
                  </td>
                  <td className="border-b border-zinc-800 px-3 py-2 text-blue-400">
                    New
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-zinc-800 px-3 py-2">
                    Learning (+ Relearning)
                  </td>
                  <td className="border-b border-zinc-800 px-3 py-2 text-red-500">
                    Learning
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-zinc-800 px-3 py-2">
                    Review met due_date ≤ nu
                  </td>
                  <td className="border-b border-zinc-800 px-3 py-2 text-green-500">
                    Due
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2">
                    Review met due_date in de toekomst
                  </td>
                  <td className="px-3 py-2">
                    Niet op dashboard (wel op /stats als Review)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 rounded-md border border-zinc-700 bg-zinc-950/80 p-4 text-sm text-zinc-400">
            <p>
              Berekening:{" "}
              <code className="text-zinc-200">deckWordStats()</code> in{" "}
              <code className="text-zinc-200">src/lib/stats-helpers.ts</code>
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <strong className="text-zinc-200">Study-queue</strong> telt
                nieuwe woorden wél mee
              </li>
              <li>
                <strong className="text-zinc-200">Dashboard Due</strong> telt
                nieuwe woorden niet mee (Anki-stijl)
              </li>
            </ul>
          </div>

          <p className="mt-6 rounded-md border border-blue-500/30 bg-blue-950/40 p-4 text-zinc-300">
            <strong className="text-zinc-100">Samenvatting:</strong>{" "}
            <code className="text-zinc-200">user_progress</code> = geheugen per
            woord; FSRS schrijft bij elke rating bij; dashboard/stats lezen die
            rijen en tellen.
          </p>
        </section>

        <div className="rounded-lg bg-blue-600 px-6 py-8 text-center text-white shadow-lg">
          <h2 className="text-xl font-bold sm:text-2xl">
            Klaar om te beginnen?
          </h2>
          <p className="mt-2 text-blue-100">
            Kies een deck en start met studeren.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-block rounded-lg bg-white px-8 py-3 font-semibold text-blue-600 transition hover:bg-blue-50"
          >
            Naar dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
