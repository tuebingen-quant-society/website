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
  /**
   * Header navigation. An `href` starting with "#" is an anchor on the home
   * page; anything else is a locale-agnostic route resolved through
   * localePath(). `activeFor` marks the item as current on routes that belong
   * to it without sharing its path ("article/…" belongs to "articles").
   */
  nav: { label: string; href: string; activeFor?: string }[];
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
    /** Column heading + link label for the public materials. */
    materialLabel: string;
    materialLink: string;
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
        "Studentische Initiative im Aufbau: Quantitative Finance, algorithmisches Trading und Machine Learning an der Uni Tübingen. Offen für alle Studiengänge, Vorkenntnisse brauchst du keine.",
      sprache: "de",
      ogLocale: "de_DE",
    },
    skipLink: "Zum Inhalt springen",
    loginCta: { label: "Uni-Login" },
    nav: [
      { label: "Über uns", href: "#about" },
      { label: "Aktivitäten", href: "#activities" },
      { label: "Artikel", href: "articles", activeFor: "article" },
    ],
    langToggle: {
      aria: "Sprache wählen",
      to: { de: "Auf Deutsch anzeigen", en: "In English anzeigen" },
    },
    hero: {
      headline: "Quantitative Finance,",
      headlineAccent: "von Studis für Studis",
      subline:
        "Wir bauen zurzeit die Tübingen Quant Society auf: eine studentische Gruppe für alle, die wissen wollen, wie an Finanzmärkten mit Daten, Modellen und Code gearbeitet wird. Wer jetzt dazukommt, prägt mit, wohin das Ganze geht.",
      ctaPrimaer: { label: "Mitmachen", href: "#join" },
      ctaSekundaer: { label: "Was wir vorhaben", href: "#activities" },
    },
    about: {
      headline: "Zwischen Vorlesung und Praxis liegen viele Schritte.",
      absaetze: [
        "Inhaltlich dreht sich alles um Quantitative Finance und das, was drumherum passiert: algorithmisches Trading, Machine Learning, Märkte, Market Making, Derivate, Crypto und die Frage, wie man im Quant-Bereich eigentlich landet.",
        "Tübingen hat starke Leute in Machine Learning, Mathematik und Data Science. Was bisher fehlt, ist eine Gruppe, die dieses Wissen mal auf Märkte loslässt und offen darüber redet, was daran trägt und was nicht. Genau dafür sind wir da. Wir wollen die Sachen verstehen, Anlageberatung machen wir keine.",
        "Wie technisch das Ganze wird, hängt davon ab, wer sich zusammenfindet. Wenn viele Lust auf Code haben, schreiben wir Code. Wenn lieber über Märkte, Research und Unternehmen geredet werden soll, machen wir das. Beides passt.",
      ],
    },
    activities: {
      headline: "Was wir vorhaben.",
      karten: [
        {
          titel: "Paper- & Market-Sessions",
          beschreibung:
            "Wir nehmen uns ein Paper oder eine aktuelle Marktbewegung vor und reden darüber, was da eigentlich passiert.",
          geplant: false,
        },
        {
          titel: "Projekte",
          beschreibung:
            "Backtests, Modelle, Datenkram. Zeig, woran du bastelst, und lass es die Runde diskutieren.",
          geplant: false,
        },
        {
          titel: "Workshops für den Einstieg",
          beschreibung:
            "Python, Statistik, Umgang mit Finanzdaten. Gedacht für alle, die bei null anfangen.",
          geplant: false,
        },
        {
          titel: "Trading-Challenges",
          beschreibung:
            "Kleine Wettbewerbe, bei denen man mehr lernt als beim Zuschauen.",
          geplant: true,
        },
        {
          titel: "Gastvorträge",
          beschreibung:
            "Leute einladen, die das beruflich machen, und ihnen Löcher in den Bauch fragen.",
          geplant: true,
        },
        {
          titel: "Firmen & Partnerschaften",
          beschreibung:
            "Langfristig würden wir gern Quant-Firmen und Market Maker nach Tübingen holen, für Vorträge, Workshops oder Recruiting.",
          geplant: true,
        },
      ],
      badge: "geplant",
    },
    open: {
      headline: "Du musst nichts mitbringen außer Interesse.",
      absatz:
        "Weder Finance- noch Programmierkenntnisse sind Voraussetzung. Egal ob du aus Mathe, Informatik, Physik, ML, BWL oder etwas ganz anderem kommst, und egal in welchem Semester: Wenn dich das Thema interessiert, komm einfach vorbei. Viel Material ist auf Englisch, und die Treffen machen wir auf Englisch, wenn es für die Runde besser passt.",
    },
    join: {
      headline: "Lust, dabei zu sein?",
      absatz:
        "Wir suchen sowohl Leute, die einfach mitmachen wollen, als auch Leute, die beim Aufbau und bei der Vereinsgründung mit anpacken. Eine Rolle gibt es für fast alles: Events, Partnerschaften, Marketing, Finanzen, Community oder die Formate selbst. Termine und Materialien findest du im Mitgliederbereich.",
      cta: "Mit Uni-Account anmelden",
      hinweis:
        "Für Studierende der Uni Tübingen. Dein Passwort bekommen wir nie zu sehen, das bleibt bei der Uni.",
      instagramLink: "Oder schreib uns auf Instagram",
    },
    footer: {
      einzeiler: "Studentische Initiative an der Universität Tübingen. Gerade im Aufbau.",
      kontaktLabel: "Kontakt",
      folgenLabel: "Folgen",
      materialLabel: "Lesen",
      materialLink: "Veröffentlichungen",
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
        "A student initiative getting off the ground: quantitative finance, algorithmic trading and machine learning at the University of Tübingen. Open to every subject, no prior knowledge needed.",
      sprache: "en",
      ogLocale: "en_US",
    },
    skipLink: "Skip to content",
    loginCta: { label: "Uni login" },
    nav: [
      { label: "About", href: "#about" },
      { label: "Activities", href: "#activities" },
      { label: "Articles", href: "articles", activeFor: "article" },
    ],
    langToggle: {
      aria: "Choose language",
      to: { de: "Show in German", en: "Show in English" },
    },
    hero: {
      headline: "Quantitative finance,",
      headlineAccent: "by students, for students",
      subline:
        "We're building the Tübingen Quant Society right now: a student group for anyone who wants to know how data, models and code actually get used in financial markets. Join early and you get a real say in where this goes.",
      ctaPrimaer: { label: "Get involved", href: "#join" },
      ctaSekundaer: { label: "What we've got planned", href: "#activities" },
    },
    about: {
      headline: "There are a lot of steps between lectures and practice.",
      absaetze: [
        "It's quantitative finance and everything around it: algorithmic trading, machine learning, markets, market making, derivatives, crypto, and how people actually end up working in the field.",
        "Tübingen has brilliant people in machine learning, maths and data science. What's been missing is a group that points all of that at markets and talks openly about what holds up and what doesn't. That's us. We're here to understand how it works, and we don't give investment advice.",
        "How technical things get depends on who shows up. If people want to write code, we'll write code. If the group would rather dig into markets, research and companies, we'll do that. Both work.",
      ],
    },
    activities: {
      headline: "What we've got planned.",
      karten: [
        {
          titel: "Paper & market sessions",
          beschreibung:
            "We take a paper or something that just happened in the markets and talk through what's really going on.",
          geplant: false,
        },
        {
          titel: "Projects",
          beschreibung:
            "Backtests, models, messy data. Bring whatever you're building and let's talk it through.",
          geplant: false,
        },
        {
          titel: "Workshops to get started",
          beschreibung:
            "Python, statistics, working with financial data. Made for people starting from zero.",
          geplant: false,
        },
        {
          titel: "Trading challenges",
          beschreibung:
            "Small competitions, because you learn more doing it than watching.",
          geplant: true,
        },
        {
          titel: "Guest talks",
          beschreibung:
            "Invite people who do this for a living and ask them everything.",
          geplant: true,
        },
        {
          titel: "Companies & partnerships",
          beschreibung:
            "Longer term we'd love to bring quant firms and market makers to Tübingen for talks, workshops or recruiting.",
          geplant: true,
        },
      ],
      badge: "planned",
    },
    open: {
      headline: "All you need to bring is interest.",
      absatz:
        "No finance background required, no coding required. Maths, computer science, physics, ML, economics or something completely unrelated, any semester: if the topic sounds interesting, just come along. A lot of the material is in English, and we'll run the meetings in English whenever that suits the group better.",
    },
    join: {
      headline: "Want to be part of it?",
      absatz:
        "We're looking for people who just want to take part, and for people who want to help build this and get the society officially founded. There's a role for pretty much anything: events, partnerships, marketing, finances, community, or the sessions themselves. Dates and materials live in the members area.",
      cta: "Sign in with your university account",
      hinweis:
        "For students at the University of Tübingen. We never see your password, it stays with the university.",
      instagramLink: "Or message us on Instagram",
    },
    footer: {
      einzeiler: "A student initiative at the University of Tübingen. Currently getting off the ground.",
      kontaktLabel: "Contact",
      folgenLabel: "Follow",
      materialLabel: "Read",
      materialLink: "Publications",
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
