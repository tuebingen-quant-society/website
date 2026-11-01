"use client";

/**
 * The closing check: one question at a time, one per module, with the
 * explanation right after each answer and a score at the end.
 */
import { useState } from "react";
import type { Locale } from "@/i18n";
import { Lab } from "./ui";
import { useMissions } from "./workshop";

type Question = {
  prompt: string;
  options: string[];
  answer: number;
  why: string;
};

const questions: Record<Locale, Question[]> = {
  de: [
    {
      prompt: "Spot steht bei 100, der Zins bei 4 % p. a. Wo sollte ein Future mit einem Jahr Laufzeit ungefähr notieren?",
      options: ["96", "100", "104", "Kommt auf die Erwartung des Marktes an"],
      answer: 2,
      why: "Cost of Carry: F ≈ S · e^(rT) ≈ 104,08. Notiert er deutlich höher, kaufst du Spot und verkaufst den Future; die Erwartung des Marktes spielt dafür keine Rolle.",
    },
    {
      prompt: "Du hast einen Long Call mit Strike 100 für eine Prämie von 6 gekauft. Wo liegt dein Break-even?",
      options: ["94", "100", "106", "112"],
      answer: 2,
      why: "Bei Fälligkeit muss der innere Wert die Prämie zurückverdienen: 100 + 6 = 106.",
    },
    {
      prompt: "Welche Eingabe der Black-Scholes-Formel lässt sich nicht direkt am Markt ablesen?",
      options: ["Kurs", "Strike", "Volatilität", "Zins"],
      answer: 2,
      why: "Kurs, Strike, Laufzeit und Zins sind bekannt. Die Volatilität rechnet man aus dem Optionspreis zurück; das ist die implizite Vol.",
    },
    {
      prompt: "Das Funding eines Perps ist deutlich positiv. Wer zahlt an wen?",
      options: ["Shorts zahlen an Longs", "Longs zahlen an Shorts", "Beide zahlen an die Börse", "Niemand, Funding ist nur ein Indikator"],
      answer: 1,
      why: "Positives Funding heißt: Der Perp notiert über Spot. Longs zahlen, damit Shorts den Preis zurückdrücken. Davon lebt der Funding-Carry.",
    },
    {
      prompt: "Grob gerechnet: Wie weit darf der Kurs bei 20× Hebel gegen dich laufen, bevor liquidiert wird?",
      options: ["Etwa 20 %", "Etwa 10 %", "Knapp 5 %", "Knapp 0,5 %"],
      answer: 2,
      why: "Die Margin ist 1/20 = 5 % des Nominalwerts. Abzüglich Maintenance Margin bleiben gut 4,5 %; bei 60 % Volatilität sind das weniger als zwei Tagesbewegungen.",
    },
    {
      prompt: "Du verkaufst 10 % der ETH-Reserve in einen x · y = k-Pool (ohne Gebühr). Was passiert mit dem Poolpreis?",
      options: ["Bleibt gleich", "Fällt um etwa 10 %", "Fällt um etwa 17 %", "Steigt"],
      answer: 2,
      why: "x wird zu 1,1 · x, y zu y / 1,1. Der Preis y / x fällt also um den Faktor 1,21, gut 17 %. Arbitrageure schieben ihn danach zurück.",
    },
    {
      prompt: "Drei Trades mit je 5 bp Gebühr. Ab welcher Fehlbewertung des Kreuzkurses lohnt sich ein Dreieck?",
      options: ["Ab 5 bp", "Ab gut 15 bp", "Ab 30 bp", "Jede Abweichung lohnt sich"],
      answer: 1,
      why: "Jeder der drei Trades kostet 5 bp. Erst eine Lücke über rund 15 bp bleibt nach Gebühren übrig, und das nur, wenn alle drei Orders zum Preis gefüllt werden.",
    },
    {
      prompt: "Welches Risiko bleibt beim Funding-Carry (Spot long, Perp short), obwohl die Position delta-neutral ist?",
      options: ["Keins, die Position ist risikolos", "Nur das Kursrisiko", "Börsenausfall, Liquidation des Short-Beins und negatives Funding", "Nur das Zinsrisiko"],
      answer: 2,
      why: "Kursbewegungen heben sich auf, Plattform und Margin aber nicht. FTX hat 2022 gezeigt, dass Gegenparteirisiko der größte Posten sein kann.",
    },
  ],
  en: [
    {
      prompt: "Spot is at 100, the rate is 4% p.a. Roughly where should a one-year future trade?",
      options: ["96", "100", "104", "It depends on what the market expects"],
      answer: 2,
      why: "Cost of carry: F ≈ S · e^(rT) ≈ 104.08. If it trades clearly higher, you buy spot and sell the future; market expectations play no role in that.",
    },
    {
      prompt: "You bought a long call with strike 100 for a premium of 6. Where is your break-even?",
      options: ["94", "100", "106", "112"],
      answer: 2,
      why: "At expiry the intrinsic value has to earn back the premium: 100 + 6 = 106.",
    },
    {
      prompt: "Which input to the Black-Scholes formula cannot be read directly off the market?",
      options: ["Price", "Strike", "Volatility", "Rate"],
      answer: 2,
      why: "Price, strike, time and rate are known. Volatility is backed out of the option price; that is implied vol.",
    },
    {
      prompt: "A perp's funding is clearly positive. Who pays whom?",
      options: ["Shorts pay longs", "Longs pay shorts", "Both pay the exchange", "Nobody, funding is just an indicator"],
      answer: 1,
      why: "Positive funding means the perp trades above spot. Longs pay so that shorts push the price back. That is what the funding carry lives on.",
    },
    {
      prompt: "Roughly: how far can the price move against you at 20× leverage before you get liquidated?",
      options: ["About 20%", "About 10%", "Just under 5%", "Just under 0.5%"],
      answer: 2,
      why: "Margin is 1/20 = 5% of notional. After the maintenance margin a little over 4.5% is left; at 60% volatility that is less than two daily moves.",
    },
    {
      prompt: "You sell 10% of the ETH reserve into an x · y = k pool (no fee). What happens to the pool price?",
      options: ["It stays the same", "It falls by about 10%", "It falls by about 17%", "It rises"],
      answer: 2,
      why: "x becomes 1.1 · x and y becomes y / 1.1. The price y / x falls by a factor of 1.21, a little over 17%. Arbitrageurs push it back afterwards.",
    },
    {
      prompt: "Three trades at 5 bp fee each. From what mispricing of the cross rate does a triangle pay?",
      options: ["From 5 bp", "From a little over 15 bp", "From 30 bp", "Any gap pays"],
      answer: 1,
      why: "Each of the three trades costs 5 bp. Only a gap above roughly 15 bp survives the fees, and only if all three orders fill at the price.",
    },
    {
      prompt: "Which risk remains in the funding carry (spot long, perp short) even though the position is delta neutral?",
      options: ["None, the position is risk free", "Only price risk", "Exchange failure, liquidation of the short leg and negative funding", "Only interest rate risk"],
      answer: 2,
      why: "Price moves cancel out, the venue and the margin do not. FTX showed in 2022 that counterparty risk can be the largest item.",
    },
  ],
};

const quizCopy = {
  de: {
    title: "ABSCHLUSS-CHECK · 8 FRAGEN",
    missions: "Aufgaben",
    mAll: "Beantworte alle acht Fragen.",
    mGood: "Schaff mindestens sechs richtig.",
    question: (n: number, total: number) => `Frage ${n} von ${total}`,
    right: "Richtig.",
    wrong: "Nicht ganz.",
    next: "Nächste Frage",
    finish: "Ergebnis ansehen",
    score: (n: number, total: number) => `${n} von ${total} richtig`,
    great: "Sitzt. Du kannst die Labore jetzt selbst nachbauen, am besten mit echten Daten.",
    okay: "Guter Anfang. Die Module mit falschen Antworten lohnen einen zweiten Blick.",
    reset: "Nochmal",
    jump: (n: number) => `Zu Frage ${n}`,
  },
  en: {
    title: "FINAL CHECK · 8 QUESTIONS",
    missions: "Try this",
    mAll: "Answer all eight questions.",
    mGood: "Get at least six right.",
    question: (n: number, total: number) => `Question ${n} of ${total}`,
    right: "Correct.",
    wrong: "Not quite.",
    next: "Next question",
    finish: "See your result",
    score: (n: number, total: number) => `${n} of ${total} correct`,
    great: "Solid. You could rebuild the labs yourself now, ideally with real data.",
    okay: "Good start. The modules behind the wrong answers are worth a second look.",
    reset: "Start over",
    jump: (n: number) => `Go to question ${n}`,
  },
} as const;

export function Quiz({ lang = "de" }: { lang?: Locale }) {
  const t = quizCopy[lang];
  const list = questions[lang];
  const [answers, setAnswers] = useState<(number | null)[]>(() => list.map(() => null));
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [best, setBest] = useState(0);

  const correct = answers.filter((a, i) => a === list[i].answer).length;
  const answered = answers.filter((a) => a !== null).length;
  const question = list[index];
  const chosen = answers[index];

  const missions = useMissions("quiz", [
    { id: "all", label: t.mAll, done: answered === list.length },
    { id: "good", label: t.mGood, done: Math.max(best, finished ? correct : 0) >= 6 },
  ]);

  function choose(option: number) {
    setAnswers((current) => current.map((a, i) => (i === index ? option : a)));
  }

  function advance() {
    if (index < list.length - 1) setIndex(index + 1);
    else {
      setFinished(true);
      setBest((b) => Math.max(b, correct));
    }
  }

  function reset() {
    setAnswers(list.map(() => null));
    setIndex(0);
    setFinished(false);
  }

  return (
    <Lab title={t.title} missions={{ title: t.missions, items: missions }}>
      <ol className="lab__steps" role="list">
        {list.map((q, i) => {
          const a = answers[i];
          const state = a === null ? "" : a === q.answer ? " is-right" : " is-wrong";
          return (
            <li key={q.prompt}>
              <button
                type="button"
                className={`lab__step${state}`}
                aria-current={!finished && i === index ? "step" : undefined}
                aria-label={t.jump(i + 1)}
                onClick={() => {
                  setFinished(false);
                  setIndex(i);
                }}
              />
            </li>
          );
        })}
      </ol>

      {finished ? (
        <div className="lab__result" aria-live="polite">
          <p className="lab__result-score tnum">{t.score(correct, list.length)}</p>
          <p className="lab__note">{correct >= 6 ? t.great : t.okay}</p>
          <button type="button" className="btn btn--secondary lab__button" onClick={reset}>
            {t.reset}
          </button>
        </div>
      ) : (
        <div className="lab__card" key={index}>
          <p className="lab__card-count tnum">{t.question(index + 1, list.length)}</p>
          <p className="lab__prompt">{question.prompt}</p>
          <div className="lab__options" role="group" aria-label={question.prompt}>
            {question.options.map((option, oi) => {
              const state =
                chosen === null
                  ? ""
                  : oi === question.answer
                    ? " is-right"
                    : oi === chosen
                      ? " is-wrong"
                      : "";
              return (
                <button
                  key={option}
                  type="button"
                  className={`lab__option${state}`}
                  aria-pressed={chosen === oi}
                  disabled={chosen !== null}
                  onClick={() => choose(oi)}
                >
                  {option}
                </button>
              );
            })}
          </div>
          {chosen !== null ? (
            <>
              <p className="lab__why" aria-live="polite">
                <strong>{chosen === question.answer ? t.right : t.wrong}</strong> {question.why}
              </p>
              <button type="button" className="btn btn--primary lab__button" onClick={advance}>
                {index < list.length - 1 ? t.next : t.finish}
              </button>
            </>
          ) : null}
        </div>
      )}
    </Lab>
  );
}
