/**
 * Translatable site content, keyed by locale (Spec §13).
 *
 * Add or change copy here — never in the layout/components. To add a language,
 * extend the `locales` tuple in ./index.ts and add a matching entry below; the
 * `Record<Locale, SiteContent>` type will flag anything missing.
 *
 * Legal pages (Impressum/Datenschutz) are not modelled here: their prose lives
 * inline in the page files (src/pages/**), because it is legal text that reads
 * best in place and rarely changes.
 */
import type { Locale } from "./index";

export type Aktivitaet = {
  titel: string;
  beschreibung: string;
  geplant: boolean;
};

export type TickerItem = {
  sym: string;
  val: string;
  dir: "up" | "down" | "flat";
};

export type SiteContent = {
  meta: {
    titel: string;
    beschreibung: string;
    /** <html lang> value. */
    sprache: string;
    /** og:locale value, e.g. "de_DE". */
    ogLocale: string;
  };
  skipLink: string;
  /**
   * Header only — the direct way in for people who already know they have an
   * account. The label says "login" outright; visitors who don't know what to
   * do yet are sent to the closing section instead (`hero.ctaPrimaer`).
   */
  loginCta: { label: string };
  nav: { label: string; href: string }[];
  langToggle: {
    /** Accessible label for the whole language switcher. */
    aria: string;
    /** Accessible label per target locale, keyed by locale code. */
    to: Record<Locale, string>;
  };
  hero: {
    headline: string;
    /** Rendered as the gradient phrase after `headline`. */
    headlineAccent: string;
    subline: string;
    /**
     * Points at the closing section, not at the login: the invitation explains
     * itself there before anyone is asked for a password.
     */
    ctaPrimaer: { label: string; href: string };
    ctaSekundaer: { label: string; href: string };
  };
  about: {
    headline: string;
    absaetze: string[];
  };
  activities: {
    headline: string;
    /** New card = one object. Do not touch the markup. */
    karten: Aktivitaet[];
    /** Badge on planned cards. */
    badge: string;
  };
  open: {
    headline: string;
    absatz: string;
  };
  join: {
    headline: string;
    absatz: string;
    /** Spells out the login in full — the page's last, most explicit CTA. */
    cta: string;
    /** Who the login is for, directly under the button. */
    hinweis: string;
    instagramLink: string;
  };
  footer: {
    einzeiler: string;
    /** Column headings in the footer. */
    kontaktLabel: string;
    folgenLabel: string;
    impressumLabel: string;
    datenschutzLabel: string;
  };
  plot: {
    ariaLabel: string;
    hinweis: string;
  };
  /**
   * Ticker tape below the hero — purely decorative (aria-hidden) and
   * intentionally tongue-in-cheek: no real prices, no financial claims.
   * dir: "up" | "down" | "flat" controls color and arrow.
   */
  ticker: readonly TickerItem[];
};

export const content: Record<Locale, SiteContent> = {
  de: {
    meta: {
      titel:
        "Tübingen Quant Society — Quantitative Finance an der Universität Tübingen",
      beschreibung:
        "Studentische Initiative für Quantitative Finance und algorithmisches Trading an der Universität Tübingen. Paper-Sessions, Workshops, Projekte. Keine Vorkenntnisse nötig.",
      sprache: "de",
      ogLocale: "de_DE",
    },
    skipLink: "Zum Inhalt springen",
    loginCta: { label: "Uni-Login" },
    nav: [
      { label: "Über uns", href: "#about" },
      { label: "Aktivitäten", href: "#activities" },
    ],
    langToggle: {
      aria: "Sprache wählen",
      to: { de: "Auf Deutsch anzeigen", en: "In English anzeigen" },
    },
    hero: {
      headline: "Quantitative Finance,",
      headlineAccent: "offen diskutiert.",
      subline:
        "Ein Ort an der Universität Tübingen, um Paper zu lesen, Projekte zu diskutieren und zu verstehen, wie datengetriebene Entscheidungen auf Finanzmärkten zustande kommen.",
      ctaPrimaer: { label: "Mitmachen", href: "#join" },
      ctaSekundaer: { label: "Was wir machen", href: "#activities" },
    },
    about: {
      headline: "Zwischen Vorlesung und Praxis fehlt ein Raum.",
      absaetze: [
        "Quantitative Methoden prägen moderne Kapitalmärkte, sind für Außenstehende aber intransparent und faktisch großen Instituten vorbehalten. Wer sie verstehen will, findet im Studium selten einen Ort dafür.",
        "Tübingen ist ein herausragender Standort für Maschinelles Lernen, Mathematik und Data Science. Was fehlt, ist die Verbindung dieser methodischen Stärke mit angewandter, kritischer Marktkompetenz. Genau diese Lücke wollen wir schließen — als Bildungs- und Austauschformat, nicht als Anlageberatung.",
      ],
    },
    activities: {
      headline: "Was wir machen.",
      karten: [
        {
          titel: "Paper-Reading-Sessions",
          beschreibung:
            "Wir lesen und diskutieren gemeinsam wissenschaftliche Arbeiten und Marktstudien.",
          geplant: false,
        },
        {
          titel: "Projekt- & Ideenaustausch",
          beschreibung:
            "Eigene Projekte vorstellen und auseinandernehmen — Backtesting, Modellierung, Datenanalyse.",
          geplant: false,
        },
        {
          titel: "Einführungsworkshops",
          beschreibung:
            "Praxisnahe Formate zu Grundlagen: Programmierung, Statistik, Umgang mit Finanzdaten.",
          geplant: false,
        },
        {
          titel: "Gastvorträge",
          beschreibung: "Einblicke aus Forschung und Praxis.",
          geplant: true,
        },
        {
          titel: "Wettbewerbe",
          beschreibung: "Eigene Trading- und Data-Science-Challenges.",
          geplant: true,
        },
      ],
      badge: "geplant",
    },
    open: {
      headline: "Vorkenntnisse in Finance brauchst du nicht.",
      absatz:
        "Offen für alle Fachrichtungen und alle Semester. Ob du aus Mathe, Informatik, ML, Physik oder den Wirtschaftswissenschaften kommst — oder aus etwas ganz anderem: Wenn dich quantitative Methoden interessieren, bist du richtig. Fachliteratur und Materialien sind überwiegend englisch, die Treffen sind es auf Wunsch auch.",
    },
    join: {
      headline: "Komm zum nächsten Treffen.",
      absatz:
        "Termine, Räume und Materialien stehen im Mitgliederbereich. Melde dich einmal mit deinem Uni-Account an — mehr braucht es nicht.",
      cta: "Mit Uni-Account anmelden",
      hinweis:
        "Für Studierende der Universität Tübingen. Dein Passwort bleibt bei der Uni.",
      instagramLink: "Oder folge uns auf Instagram",
    },
    footer: {
      einzeiler: "Studentische Initiative an der Universität Tübingen.",
      kontaktLabel: "Kontakt",
      folgenLabel: "Folgen",
      impressumLabel: "Impressum",
      datenschutzLabel: "Datenschutz",
    },
    plot: {
      ariaLabel:
        "Animierter, simulierter Kurs-Chart — zufällig erzeugter Pfad ohne echte Marktdaten",
      hinweis: "Simulation",
    },
    ticker: [
      { sym: "PAPER-SESSION", val: "+1.00", dir: "up" },
      { sym: "VORKENNTNISSE", val: "0.00 NÖTIG", dir: "flat" },
      { sym: "NEUGIER", val: "+2.41", dir: "up" },
      { sym: "KAFFEE", val: "−0.87", dir: "down" },
      { sym: "P(MITMACHEN)", val: "→ 1", dir: "up" },
      { sym: "σ(IDEEN)", val: "+3.14", dir: "up" },
      { sym: "BACKTEST", val: "RUNNING", dir: "flat" },
      { sym: "OVERFITTING", val: "−1.29", dir: "down" },
      { sym: "SHARPE(TQS)", val: "+2.20", dir: "up" },
      { sym: "TÜBINGEN·QUANT", val: "OPEN", dir: "up" },
    ],
  },

  en: {
    meta: {
      titel:
        "Tübingen Quant Society — Quantitative Finance at the University of Tübingen",
      beschreibung:
        "Student initiative for quantitative finance and algorithmic trading at the University of Tübingen. Paper sessions, workshops, projects. No prior knowledge required.",
      sprache: "en",
      ogLocale: "en_US",
    },
    skipLink: "Skip to content",
    loginCta: { label: "Uni login" },
    nav: [
      { label: "About", href: "#about" },
      { label: "Activities", href: "#activities" },
    ],
    langToggle: {
      aria: "Choose language",
      to: { de: "Show in German", en: "Show in English" },
    },
    hero: {
      headline: "Quantitative finance,",
      headlineAccent: "openly discussed.",
      subline:
        "A place at the University of Tübingen to read papers, discuss projects, and understand how data-driven decisions are made in financial markets.",
      ctaPrimaer: { label: "Get involved", href: "#join" },
      ctaSekundaer: { label: "What we do", href: "#activities" },
    },
    about: {
      headline: "Between lectures and practice, a space is missing.",
      absaetze: [
        "Quantitative methods shape modern capital markets, yet they stay opaque to outsiders and are in practice reserved for large institutions. Those who want to understand them rarely find a place for it during their studies.",
        "Tübingen is an outstanding location for machine learning, mathematics, and data science. What's missing is the link between this methodological strength and applied, critical market expertise. That's exactly the gap we want to close — as a format for learning and exchange, not as investment advice.",
      ],
    },
    activities: {
      headline: "What we do.",
      karten: [
        {
          titel: "Paper-reading sessions",
          beschreibung:
            "We read and discuss academic papers and market studies together.",
          geplant: false,
        },
        {
          titel: "Project & idea exchange",
          beschreibung:
            "Present your own projects and take them apart — backtesting, modelling, data analysis.",
          geplant: false,
        },
        {
          titel: "Introductory workshops",
          beschreibung:
            "Hands-on formats on the fundamentals: programming, statistics, working with financial data.",
          geplant: false,
        },
        {
          titel: "Guest talks",
          beschreibung: "Insights from research and practice.",
          geplant: true,
        },
        {
          titel: "Competitions",
          beschreibung: "Our own trading and data-science challenges.",
          geplant: true,
        },
      ],
      badge: "planned",
    },
    open: {
      headline: "You don't need any prior finance knowledge.",
      absatz:
        "Open to every discipline and every semester. Whether you come from maths, computer science, ML, physics, or economics — or from something else entirely: if quantitative methods interest you, you're in the right place. The literature and materials are mostly in English, and the meetings are too on request.",
    },
    join: {
      headline: "Come to the next meeting.",
      absatz:
        "Dates, rooms, and materials live in the members area. Sign in once with your university account — that's all it takes.",
      cta: "Sign in with your university account",
      hinweis:
        "For students at the University of Tübingen. Your password stays with the university.",
      instagramLink: "Or follow us on Instagram",
    },
    footer: {
      einzeiler: "A student initiative at the University of Tübingen.",
      kontaktLabel: "Contact",
      folgenLabel: "Follow",
      impressumLabel: "Legal notice",
      datenschutzLabel: "Privacy",
    },
    plot: {
      ariaLabel:
        "Animated, simulated price chart — a randomly generated path with no real market data",
      hinweis: "Simulation",
    },
    ticker: [
      { sym: "PAPER-SESSION", val: "+1.00", dir: "up" },
      { sym: "PRIOR-KNOWLEDGE", val: "0.00 REQ.", dir: "flat" },
      { sym: "CURIOSITY", val: "+2.41", dir: "up" },
      { sym: "COFFEE", val: "−0.87", dir: "down" },
      { sym: "P(JOINING)", val: "→ 1", dir: "up" },
      { sym: "σ(IDEAS)", val: "+3.14", dir: "up" },
      { sym: "BACKTEST", val: "RUNNING", dir: "flat" },
      { sym: "OVERFITTING", val: "−1.29", dir: "down" },
      { sym: "SHARPE(TQS)", val: "+2.20", dir: "up" },
      { sym: "TÜBINGEN·QUANT", val: "OPEN", dir: "up" },
    ],
  },
};
