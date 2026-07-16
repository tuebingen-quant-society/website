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
    label: string;
    placeholder: string;
    buttonIdle: string;
    buttonPending: string;
    erfolg: string;
    fehlerUngueltig: string;
    /** {kontakt-mail} is replaced at runtime with kontakt.mail. */
    fehlerNetzwerk: string;
    instagramLink: string;
    /** §11 requires a privacy policy link directly on the form. */
    datenschutzHinweis: string;
    datenschutzLinkText: string;
  };
  footer: {
    einzeiler: string;
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
        "Trag dich in die Mailingliste ein — wir schreiben, wenn das nächste Treffen ansteht. Kein Spam, keine Verpflichtung.",
      label: "E-Mail-Adresse",
      placeholder: "deine@uni-tuebingen.de",
      buttonIdle: "Eintragen",
      buttonPending: "Wird eingetragen …",
      erfolg: "Eingetragen. Du hörst von uns, sobald das nächste Treffen steht.",
      fehlerUngueltig: "Diese E-Mail-Adresse sieht nicht gültig aus.",
      fehlerNetzwerk:
        "Das hat nicht geklappt. Versuch es nochmal oder schreib uns direkt: {kontakt-mail}.",
      instagramLink: "Oder folge uns auf Instagram",
      datenschutzHinweis: "Wie wir deine Adresse verarbeiten, steht in der",
      datenschutzLinkText: "Datenschutzerklärung",
    },
    footer: {
      einzeiler: "Studentische Initiative an der Universität Tübingen.",
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
        "Sign up for the mailing list — we'll write when the next meeting is coming up. No spam, no commitment.",
      label: "Email address",
      placeholder: "you@uni-tuebingen.de",
      buttonIdle: "Sign up",
      buttonPending: "Signing up …",
      erfolg: "You're on the list. You'll hear from us as soon as the next meeting is set.",
      fehlerUngueltig: "That email address doesn't look valid.",
      fehlerNetzwerk:
        "That didn't work. Please try again or write to us directly: {kontakt-mail}.",
      instagramLink: "Or follow us on Instagram",
      datenschutzHinweis: "How we handle your address is set out in our",
      datenschutzLinkText: "privacy policy",
    },
    footer: {
      einzeiler: "A student initiative at the University of Tübingen.",
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
