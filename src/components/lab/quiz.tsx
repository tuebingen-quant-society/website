"use client";

import { useState } from "react";
import type { Locale } from "@/i18n";

type Question = {
  prompt: string;
  options: string[];
  answer: number;
  why: string;
};

const questions: Record<Locale, Question[]> = {
  de: [
    {
      prompt:
        "Spot steht bei 100, der Zins bei 4 % p. a. Wo sollte ein Future mit einem Jahr Laufzeit ungefähr notieren?",
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
      prompt: "Das Funding eines Perps ist deutlich positiv. Wer zahlt an wen?",
      options: [
        "Shorts zahlen an Longs",
        "Longs zahlen an Shorts",
        "Beide zahlen an die Börse",
        "Niemand, Funding ist nur ein Indikator",
      ],
      answer: 1,
      why: "Positives Funding heißt: Der Perp notiert über Spot. Longs zahlen, damit Shorts den Preis zurückdrücken. Genau davon lebt der Funding-Carry.",
    },
    {
      prompt: "Grob gerechnet: Wie weit darf der Kurs bei 20× Hebel gegen dich laufen, bevor liquidiert wird?",
      options: ["Etwa 20 %", "Etwa 10 %", "Knapp 5 %", "Knapp 0,5 %"],
      answer: 2,
      why: "Die Margin ist 1/20 = 5 % des Nominalwerts. Abzüglich Maintenance Margin bleiben gut 4,5 %; bei 60 % Volatilität ist das weniger als zwei Tagesbewegungen.",
    },
    {
      prompt: "Welches Risiko bleibt beim Funding-Carry (Spot long, Perp short), obwohl die Position delta-neutral ist?",
      options: [
        "Keins, die Position ist risikolos",
        "Nur das Kursrisiko",
        "Börsenausfall, Liquidation des Short-Beins und negatives Funding",
        "Nur das Zinsrisiko",
      ],
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
      prompt: "A perp's funding is clearly positive. Who pays whom?",
      options: [
        "Shorts pay longs",
        "Longs pay shorts",
        "Both pay the exchange",
        "Nobody, funding is just an indicator",
      ],
      answer: 1,
      why: "Positive funding means the perp trades above spot. Longs pay so that shorts push the price back. That is exactly what the funding carry lives on.",
    },
    {
      prompt: "Roughly: how far can the price move against you at 20× leverage before you get liquidated?",
      options: ["About 20%", "About 10%", "Just under 5%", "Just under 0.5%"],
      answer: 2,
      why: "Margin is 1/20 = 5% of notional. After the maintenance margin a little over 4.5% is left; at 60% volatility that is less than two daily moves.",
    },
    {
      prompt: "Which risk remains in the funding carry (spot long, perp short) even though the position is delta neutral?",
      options: [
        "None, the position is risk free",
        "Only price risk",
        "Exchange failure, liquidation of the short leg and negative funding",
        "Only interest rate risk",
      ],
      answer: 2,
      why: "Price moves cancel out, the venue and the margin do not. FTX showed in 2022 that counterparty risk can be the largest item.",
    },
  ],
};

const quizCopy = {
  de: {
    title: "KURZ TESTEN · 5 FRAGEN",
    score: (n: number, total: number) => `${n} von ${total} richtig`,
    right: "Richtig.",
    wrong: "Nicht ganz.",
    reset: "Nochmal",
  },
  en: {
    title: "QUICK CHECK · 5 QUESTIONS",
    score: (n: number, total: number) => `${n} of ${total} correct`,
    right: "Correct.",
    wrong: "Not quite.",
    reset: "Start over",
  },
} as const;

export function Quiz({ lang = "de" }: { lang?: Locale }) {
  const t = quizCopy[lang];
  const list = questions[lang];
  const [answers, setAnswers] = useState<(number | null)[]>(() => list.map(() => null));
  const answered = answers.filter((a) => a !== null).length;
  const correct = answers.filter((a, i) => a === list[i].answer).length;

  return (
    <section className="lab panel" aria-label={t.title}>
      <div className="lab__bar" aria-hidden="true">
        <span className="plot__dots">
          <i className="plot__dot plot__dot--r" />
          <i className="plot__dot plot__dot--y" />
          <i className="plot__dot plot__dot--g" />
        </span>
        <span className="plot__title">{t.title}</span>
        <span className="lab__score tnum">{t.score(correct, list.length)}</span>
      </div>
      <ol className="lab__quiz">
        {list.map((question, qi) => {
          const chosen = answers[qi];
          return (
            <li key={question.prompt} className="lab__question">
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
                      onClick={() =>
                        setAnswers((current) => current.map((a, i) => (i === qi ? oi : a)))
                      }
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {chosen !== null ? (
                <p className="lab__why" aria-live="polite">
                  <strong>{chosen === question.answer ? t.right : t.wrong}</strong> {question.why}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>
      {answered > 0 ? (
        <div className="lab__body">
          <button
            type="button"
            className="btn btn--secondary lab__button"
            onClick={() => setAnswers(list.map(() => null))}
          >
            {t.reset}
          </button>
        </div>
      ) : null}
    </section>
  );
}
