/**
 * Members-only page: how engagement in the TQS turns into credit points.
 *
 * Content follows the guideline "Leitfaden für die Anrechnung von
 * gesellschaftlichem Engagement in studentischen Initiativen (SI)" of the
 * Abteilung Überfachliche Bildung und berufliche Orientierung, Stand
 * 01.06.2026. When the department publishes a new version, update `stand`
 * and the numbers below — nothing here is derived at runtime.
 */
import type { Locale } from ".";

type CreditPointsCopy = {
  eyebrow: string;
  back: string;
  title: string;
  lead: string;
  /** Small mono line under the lead: what this is and how current it is. */
  meta: string[];
  math: {
    title: string;
    items: { value: string; label: string; note: string }[];
    note: string;
  };
  steps: {
    title: string;
    intro: string;
    items: { title: string; body: string }[];
  };
  roles: {
    title: string;
    intro: string;
    caption: string;
    head: { role: string; task: string; cp: string };
    rows: { role: string; task: string; cp: string }[];
    /** The "Anmerkungen" under the table we submitted to the department. */
    notes: string[];
    callout: { title: string; body: string };
  };
  formalities: {
    title: string;
    facts: { term: string; detail: string }[];
    rulesTitle: string;
    rules: string[];
  };
  help: { title: string; body: string; cta: string };
  source: string;
};

export const creditPointsContent: Record<Locale, CreditPointsCopy> = {
  de: {
    eyebrow: "Mitgliederbereich",
    back: "Zurück zum Mitgliederbereich",
    title: "Credit Points für dein Engagement",
    lead: "Die TQS ist als studentische Initiative bei der Abteilung Überfachliche Bildung und berufliche Orientierung aufgenommen. Heißt: Deine Arbeit hier kannst du dir im überfachlichen Bereich anrechnen lassen — bis zu 10 CP im Laufe des Bachelors. Wie das läuft, steht hier komplett drin, damit niemand raten muss.",
    meta: [
      "Stand 29.08.2026",
      "Leitfaden vom 01.06.2026",
      "CP-Verteilung der TQS vom 27.08.2026",
      "Fragen: kontakt@tuequant.de",
    ],
    math: {
      title: "Wie die 10 CP zusammenkommen",
      items: [
        {
          value: "1–8",
          label: "CP fürs Engagement",
          note: "30 Arbeitsstunden = 1 CP",
        },
        {
          value: "2",
          label: "CP für die Reflexionseinheit",
          note: "ILIAS-Raum + Workshop",
        },
        {
          value: "10",
          label: "CP maximal im überfachlichen Bereich",
          note: "über das gesamte Bachelor-Studium",
        },
      ],
      note: "Bescheinigt wird pro Person und Semester, immer unbenotet. Anrechnen lässt sich nur Engagement ab dem Semester, in dem die TQS anerkannt wurde — rückwirkend geht nichts, und nur, was du auch wirklich gemacht hast.",
    },
    steps: {
      title: "Der Weg zum Schein",
      intro: "Sechs Schritte, und die Reihenfolge zählt: Die Reflexionseinheit setzt voraus, dass du schon substanziell mitgearbeitet hast, und unsere Bestätigung kommt zum Schluss.",
      items: [
        {
          title: "Mindestens 30 Stunden mitarbeiten",
          body: "Sessions, Workshops, Projekte, Orga — ein Amt aus der Tabelle unten oder einfach aktive Mitgliedschaft. Schreib deine Stunden und Tätigkeiten selbst mit. Das ist die Grundlage für alles Weitere, und niemand rekonstruiert das ein Jahr später aus dem Gedächtnis.",
        },
        {
          title: "Den asynchronen ILIAS-Raum durcharbeiten",
          body: "Erster Teil der Reflexionseinheit, verpflichtend für alle, deren Engagement ab dem Wintersemester 2025/26 angefangen hat. Wann du das machst, ist dir überlassen.",
        },
        {
          title: "Reflexionsworkshop besuchen",
          body: "Zweiter Teil. Anmeldung läuft über das Transdisciplinary Course Program, dessen Fristen und Formalia gelten. Eine Bestätigung von uns brauchst du dafür noch nicht.",
        },
        {
          title: "Bestätigung der TQS einholen",
          body: "Sobald feststeht, wie lange du dabei warst, oder du die CP brauchst: Sag uns Bescheid. Wir bestätigen deine Teilnahme per ILIAS-Umfrage im SI-Raum.",
        },
        {
          title: "Schein über den Vorstand einreichen",
          body: "Den Schein füllen wir aus, nicht du. Der Vorstand schickt alle Scheine gesammelt als ein durchgehendes Word-Dokument an die Abteilung. Danach dauert die Bearbeitung rund vier Wochen.",
        },
        {
          title: "Anrechnung beim Prüfungsamt klären",
          body: "Die Abteilung stellt nur die Bescheinigung aus. Ob die CP bei dir im Bereich Schlüsselqualifikationen tatsächlich zählen, entscheidet dein Prüfungsamt. Frag dort besser vorher nach als hinterher.",
        },
      ],
    },
    roles: {
      title: "Ämter und Richtwerte",
      intro: "Das ist die Verteilung, die wir bei der Abteilung eingereicht haben. Die Spannen sind Richtwerte, kein Automatismus: Was am Ende im Schein steht, richtet sich nach den Stunden, die tatsächlich zusammengekommen sind. In jedem Amt stecken außerdem die Aufgaben des aktiven Mitglieds mit drin.",
      caption: "Pro Person und Semester. Die Obergrenze von 8 CP fürs Engagement bleibt in jedem Fall.",
      head: { role: "Amt / Tätigkeit", task: "Aufgaben und Erwartung", cp: "CP" },
      rows: [
        {
          role: "Aktives Mitglied",
          task: "Aktiv bei den regelmäßigen Treffen dabei, Vor- und Nachbereitung der Themen (etwa die Publikationen lesen, die wir besprechen), regelmäßig bei Veranstaltungen der TQS",
          cp: "1–2",
        },
        {
          role: "Vorstand",
          task: "Semesterplanung, Leitung der wöchentlichen Treffen, Organisation der Events, Gesamtverantwortung und Vertretung gegenüber der Universität Tübingen und Partnern",
          cp: "3–4",
        },
        {
          role: "Finanzen",
          task: "Haushaltsplanung, Buchführung und Abrechnung, Fördermittel beantragen und abrechnen, Beiträge und Zuwendungen von Kooperationspartnern verwalten (sobald es Sponsoren gibt)",
          cp: "2–3",
        },
        {
          role: "Lehre und Workshops",
          task: "Einführungsworkshops zu Python, Statistik und Finanzdaten konzipieren und durchführen, Kursmaterial erstellen und öffentlich zugänglich pflegen, Teilnehmende betreuen, Raumbuchung und Verwaltung",
          cp: "3–6",
        },
        {
          role: "Research",
          task: "Publikationen für die Treffen auswählen und aufbereiten, moderieren, an Projekten arbeiten (Modelle, Datenanalysen) und sie für Treffen und Website ausarbeiten, Nachbereitung und Doku, Raumbuchung",
          cp: "1–2 pro Projekt / Treffen",
        },
        {
          role: "Projekt-, Event- und Wettbewerbsleitung",
          task: "Hackathons und Trading-Challenges konzipieren und durchführen, Ergebnisse auswerten und veröffentlichen, Raumbuchung und Verwaltung der Events",
          cp: "3–6",
        },
        {
          role: "Webmaster & Technik",
          task: "Website und Mitgliederbereich pflegen, Social-Media-Kanäle, Werbung und Kommunikation, Betrieb der technischen Infrastruktur (IdP-Anmeldung, GitHub-Repos, Domain und Hosting)",
          cp: "2–3",
        },
        {
          role: "Partnerschaften und Kooperationen",
          task: "Kooperationen mit Vereinen, Hochschulgruppen und Unternehmen aufbauen und pflegen, Gastvorträge und gemeinsame Veranstaltungen organisieren, Kooperationen für Uni und Website dokumentieren",
          cp: "2–4",
        },
        {
          role: "Kommunikation und Öffentlichkeitsarbeit",
          task: "Kontakt zur Universität und anderen Stakeholdern, Austausch mit anderen studentischen Initiativen und Teilnahme am Vernetzungstreffen, Auftritte bei öffentlichen Anlässen (Dies Universitatis, Erstsemesterbegrüßung, Konferenzen)",
          cp: "2–3",
        },
      ],
      notes: [
        "Viele Ämter fließen ineinander über, und das sollen sie auch. Wer mehreres macht, bekommt die CP nicht pro Kategorie aufaddiert, sondern als Abbild des Gesamtaufwands.",
        "Ein paar Ämter ergeben erst nach den nächsten Meilensteinen richtig Sinn — Vereinseintragung, Sponsoren. Bis dahin sind sie eher eine Absichtserklärung als ein Amt.",
      ],
      callout: {
        title: "Eine Bedingung gilt für alles",
        body: "Das Engagement muss im öffentlichen Raum stattfinden, die Außenwirkung also nachvollziehbar sein. Bei uns sind das die öffentlich zugänglichen Materialien und Beiträge auf tuequant.de, die universitätsöffentlichen Workshops und Sessions, die Trading-Challenge und unsere Kooperationen. Interne Kleinarbeit allein reicht dafür nicht.",
      },
    },
    formalities: {
      title: "Fristen und Formalia",
      facts: [
        {
          term: "Einreichung",
          detail: "Innerhalb eines Monats nach Ende der Vorlesungszeit, also bis Mitte März bzw. Ende August, per Mail an civic-engagement@tracs.uni-tuebingen.de",
        },
        {
          term: "Zeitpunkt",
          detail: "Spätestens in dem Semester, in dem du dich zuletzt engagiert hast. Rückwirkende Bescheinigungen gibt es nur im Ausnahmefall",
        },
        {
          term: "Form",
          detail: "Alle Scheine als ein zusammenhängendes Word-Dokument, je Schein maximal eine Seite, einheitlich formatiert",
        },
        {
          term: "Bearbeitungsdauer",
          detail: "Etwa vier Wochen. Versand digital, Papierschein auf Anfrage in der Keplerstraße 2, Raum 050",
        },
        {
          term: "Vernetzungstreffen",
          detail: "Jährlich, in der Regel am 5. Dezember. Für uns verpflichtend: ein bis zwei Leute von der TQS. Wer nicht hinkommt, reicht hinterher einen ausführlichen Tätigkeitsbericht nach",
        },
      ],
      rulesTitle: "Schreibregeln für den Schein",
      rules: [
        "Vor- und Nachname im gesamten Text, nie nur der Vorname",
        "Semester als WiSe 25/26 oder SoSe 26 abkürzen, nicht als WS 25 oder SS 26",
        "„Universität Tübingen“ immer ausschreiben, nicht „Uni Tübingen“",
        "Rechtschreibung und Grammatik prüfen — der Schein geht durch eine Prüfung",
        "Nur unbenotete Scheine, eine Note gibt es nicht",
        "Englische Scheine sind möglich, wenn wir selbst übersetzen und die Abteilung gegenliest",
      ],
    },
    help: {
      title: "Unklar, was auf dich zutrifft?",
      body: "Schreib uns lieber einmal zu früh als einmal zu spät — gerade beim Stundenzählen und beim Zeitpunkt der Einreichung lässt sich vorher alles klären und hinterher wenig reparieren.",
      cta: "Schreib uns",
    },
    source: "Zusammenfassung des Leitfadens der Abteilung Überfachliche Bildung und berufliche Orientierung (Stand 01.06.2026) und der CP-Verteilung, die wir dort für die TQS eingereicht haben (Stand 27.08.2026). Im Zweifel gelten diese beiden Dokumente; Details und FAQ stehen im ILIAS-Kurs „Studentisches Ehrenamt in Hochschulgruppen“.",
  },

  en: {
    eyebrow: "Members area",
    back: "Back to the members area",
    title: "Credit points for your work here",
    lead: "The TQS is a registered student initiative with the Abteilung Überfachliche Bildung und berufliche Orientierung. Which means the work you do here counts towards the interdisciplinary area of your degree — up to 10 CP over the course of a bachelor's. The whole procedure is written out below so nobody has to guess.",
    meta: [
      "Updated 29 Aug 2026",
      "Guideline of 1 June 2026",
      "TQS credit-point distribution of 27 Aug 2026",
      "Questions: kontakt@tuequant.de",
    ],
    math: {
      title: "How the 10 CP add up",
      items: [
        {
          value: "1–8",
          label: "CP for the engagement",
          note: "30 hours of work = 1 CP",
        },
        {
          value: "2",
          label: "CP for the reflection unit",
          note: "ILIAS course + workshop",
        },
        {
          value: "10",
          label: "CP maximum, interdisciplinary area",
          note: "across the whole bachelor's degree",
        },
      ],
      note: "Certificates are issued per person and semester, always ungraded. Only engagement from the semester in which the TQS was recognised can be counted — nothing retroactive, and only what you actually did.",
    },
    steps: {
      title: "How you get the certificate",
      intro: "Six steps, and the order matters: the reflection unit assumes you have already put in real work, and our confirmation comes last.",
      items: [
        {
          title: "Put in at least 30 hours",
          body: "Sessions, workshops, projects, organising — a role from the table below, or simply active membership. Keep your own record of hours and tasks. Everything else builds on it, and nobody reconstructs a year of work from memory.",
        },
        {
          title: "Work through the asynchronous ILIAS course",
          body: "First half of the reflection unit, mandatory for everyone whose engagement started in the winter semester 2025/26 or later. When you do it is up to you.",
        },
        {
          title: "Attend the reflection workshop",
          body: "Second half. You register through the Transdisciplinary Course Program, and its deadlines and formalities apply. You don't need anything from us at this point.",
        },
        {
          title: "Ask us for the confirmation",
          body: "Once it's clear how long you were involved, or once you need the CP: tell us. We confirm your participation through the ILIAS survey in the SI course.",
        },
        {
          title: "Let the board submit the certificate",
          body: "We fill in the certificate, not you. The board sends all of them to the department together, as one continuous Word document. Processing then takes about four weeks.",
        },
        {
          title: "Check the recognition with your examination office",
          body: "The department only issues the certificate. Whether the CP actually count towards your key-qualification requirement is your examination office's call. Ask them before, not after.",
        },
      ],
    },
    roles: {
      title: "Roles and rough values",
      intro: "This is the distribution we submitted to the department. The ranges are guidance, not an entitlement: what ends up on the certificate follows the hours that actually accumulated. Every role also includes the duties of an active member.",
      caption: "Per person and semester. The ceiling of 8 CP for engagement applies either way.",
      head: { role: "Role / activity", task: "Duties and expectations", cp: "CP" },
      rows: [
        {
          role: "Active member",
          task: "Actively at the regular meetings, preparing and following up on the topics (reading the publications we discuss, for instance), regularly at TQS events",
          cp: "1–2",
        },
        {
          role: "Board",
          task: "Semester planning, chairing the weekly meetings, organising events, overall responsibility and representing us to the University of Tübingen and to partners",
          cp: "3–4",
        },
        {
          role: "Finance",
          task: "Budgeting, bookkeeping and accounting, applying for and settling funding, managing contributions from cooperation partners (once there are sponsors)",
          cp: "2–3",
        },
        {
          role: "Teaching and workshops",
          task: "Designing and running the introductory workshops on Python, statistics and financial data, writing and maintaining publicly available course material, supporting participants, room booking and admin",
          cp: "3–6",
        },
        {
          role: "Research",
          task: "Choosing and preparing the publications for the meetings, moderating them, working on projects (models, data analyses) and writing them up for meetings and the website, follow-up and documentation, room booking",
          cp: "1–2 per project / meeting",
        },
        {
          role: "Project, event and competition lead",
          task: "Designing and running the hackathons and trading challenges, evaluating and publishing the results, room booking and event admin",
          cp: "3–6",
        },
        {
          role: "Webmaster & tech",
          task: "Maintaining the website and members area, the social media channels, publicity and communication, running the technical infrastructure (IdP login, GitHub repos, domain and hosting)",
          cp: "2–3",
        },
        {
          role: "Partnerships and cooperations",
          task: "Building and maintaining cooperations with associations, student groups and companies, organising guest talks and joint events, documenting the cooperations for the university and the website",
          cp: "2–4",
        },
        {
          role: "Communications and public relations",
          task: "Contact with the university and other stakeholders, keeping in touch with other student initiatives and attending the networking meeting, representing the TQS at public occasions (Dies Universitatis, orientation week, conferences)",
          cp: "2–3",
        },
      ],
      notes: [
        "Plenty of these roles bleed into each other, and they're meant to. If you do several, the CP aren't added up per category — they reflect the total effort.",
        "A few roles only really make sense after the next milestones: registration as an association, sponsors. Until then they are more of an intention than a role.",
      ],
      callout: {
        title: "One condition applies to all of it",
        body: "The engagement has to happen in public — the effect outside the group must be visible. For us that's the publicly available material and articles on tuequant.de, the workshops and sessions open to the university, the trading challenge and our cooperations. Internal busywork on its own doesn't qualify.",
      },
    },
    formalities: {
      title: "Deadlines and formalities",
      facts: [
        {
          term: "Submission",
          detail: "Within one month of the end of the lecture period, so by mid-March or the end of August, by mail to civic-engagement@tracs.uni-tuebingen.de",
        },
        {
          term: "Timing",
          detail: "At the latest in the semester in which you were last involved. Retroactive certificates are issued only in exceptional cases",
        },
        {
          term: "Format",
          detail: "All certificates as one continuous Word document, one page each, consistently formatted",
        },
        {
          term: "Processing time",
          detail: "About four weeks. Sent digitally; a paper certificate can be picked up at Keplerstraße 2, room 050, on request",
        },
        {
          term: "Networking meeting",
          detail: "Annually, usually on 5 December. Mandatory for us: one or two people from the TQS. If nobody makes it, we have to hand in a detailed activity report afterwards",
        },
      ],
      rulesTitle: "Writing rules for the certificate",
      rules: [
        "First and last name throughout the text, never just the first name",
        "Abbreviate semesters as WiSe 25/26 or SoSe 26, not WS 25 or SS 26",
        "Always write out “Universität Tübingen”, never “Uni Tübingen”",
        "Check spelling and grammar — the certificate gets reviewed",
        "Ungraded only, there is no mark",
        "English certificates are possible if we translate them ourselves and the department checks them",
      ],
    },
    help: {
      title: "Not sure what applies to you?",
      body: "Better to ask once too early than once too late — especially with counting hours and hitting the submission window, everything is easy to sort out in advance and hard to fix afterwards.",
      cta: "Get in touch",
    },
    source: "A summary of the guideline issued by the Abteilung Überfachliche Bildung und berufliche Orientierung (dated 1 June 2026) and of the credit-point distribution we submitted there for the TQS (dated 27 August 2026). In case of doubt those two documents apply; details and an FAQ are in the ILIAS course „Studentisches Ehrenamt in Hochschulgruppen“.",
  },
};
