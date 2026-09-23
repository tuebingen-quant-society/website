import type { Locale } from "@/i18n";

export type DirectoryKind = "quant-careers" | "quant-fields" | "opportunities";

export const directoryCopy: Record<Locale, Record<DirectoryKind, {
  title: string;
  description: string;
  eyebrow: string;
  intro: string;
  sectionTitles: string[];
}>> = {
  de: {
    "quant-careers": {
      title: "Quant-Karrierewege und Firmen",
      description: "Entdecke Arbeitgeber für quantitative Rollen in Trading, Energie, Versicherung, Forschung und weiteren Branchen.",
      eyebrow: "Karrierewege",
      intro: "Quantitative Arbeit gibt es weit über klassische Trading-Firmen hinaus. Hier findest du Einstiegsseiten von Arbeitgebern und die Themen, an denen quantitative Teams arbeiten.",
      sectionTitles: ["Arbeitgeber entdecken", "Wonach du suchen kannst"],
    },
    "quant-fields": {
      title: "Wo quantitative Fähigkeiten gebraucht werden",
      description: "Von Finanzmärkten bis Energie und Versicherung: Beispiele, wie Mathematik, Statistik und Programmierung praktisch eingesetzt werden.",
      eyebrow: "Einsatzfelder",
      intro: "„Quant“ ist keine einzelne Branche. Dieselben Werkzeuge – Mathematik, Statistik, Programmierung und Modellierung – helfen bei sehr unterschiedlichen Entscheidungen.",
      sectionTitles: ["Acht Felder, viele Fragen", "Gemeinsame Werkzeuge"],
    },
    opportunities: {
      title: "Quant-Wettbewerbe, Events und Rätsel",
      description: "Aktuelle studentische Trading-Wettbewerbe, Hackathons, akademische Challenges und kostenlose Einstiege in quantitative Denkweisen.",
      eyebrow: "Events & Einstieg",
      intro: "Finde einen passenden ersten Schritt: von einem Rätsel für fünf Minuten bis zu studentischen Wettbewerben, Hackathons und Forschungs-Challenges.",
      sectionTitles: ["Aktuelle Events und Wettbewerbe", "Einfach ausprobieren", "Was andere Quant-Clubs machen"],
    },
  },
  en: {
    "quant-careers": {
      title: "Quant careers and employers",
      description: "Explore employers for quantitative roles in trading, energy, insurance, research, and other fields.",
      eyebrow: "Career paths",
      intro: "Quantitative work reaches far beyond trading firms. Find employer career pages and examples of the problems quantitative teams work on.",
      sectionTitles: ["Explore employers", "Role titles to search"],
    },
    "quant-fields": {
      title: "Where quantitative skills are used",
      description: "From financial markets to energy and insurance: examples of how mathematics, statistics, and programming are applied.",
      eyebrow: "Fields",
      intro: "“Quant” is not one industry. The same tools—mathematics, statistics, programming, and modeling—help people make very different decisions.",
      sectionTitles: ["Eight fields, many questions", "Tools that travel"],
    },
    opportunities: {
      title: "Quant competitions, events, and puzzles",
      description: "Current student trading challenges, hackathons, academic competitions, and free ways to try quantitative thinking.",
      eyebrow: "Events & first steps",
      intro: "Find a first step that fits: a five-minute puzzle, a student competition, a hackathon, or a research challenge.",
      sectionTitles: ["Current events and competitions", "Try it for yourself", "What other quant societies do"],
    },
  },
};

export const roleSearchTerms: Record<Locale, string[]> = {
  de: ["Quantitative Research", "Trading Research", "Data Science", "Pricing", "Aktuariat", "Forecasting", "Risk Analytics", "Optimization", "Research Engineering"],
  en: ["Quantitative Research", "Trading Research", "Data Science", "Pricing", "Actuarial", "Forecasting", "Risk Analytics", "Optimization", "Research Engineering"],
};

export const sharedMethods: Record<Locale, string[]> = {
  de: ["Wahrscheinlichkeit & Statistik", "Programmierung & Daten", "Optimierung", "Unsicherheit messen", "Modelle kritisch prüfen"],
  en: ["Probability & statistics", "Programming & data", "Optimization", "Quantifying uncertainty", "Testing models critically"],
};
