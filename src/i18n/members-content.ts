import type { Locale } from ".";

type MembersCopy = {
  gate: {
    eyebrow: string;
    title: string;
    body: string;
    login: string;
    note: string;
  };
  authenticated: {
    eyebrow: string;
    title: string;
    body: string;
    verified: string;
    email: string;
    logout: string;
  };
  whatsapp: {
    eyebrow: string;
    title: string;
    body: string;
    cta: string;
    scan: string;
    qrLabel: string;
  };
  events: {
    title: string;
    body: string;
    status: string;
    items: { title: string; description: string }[];
  };
};

export const membersContent: Record<Locale, MembersCopy> = {
  de: {
    gate: {
      eyebrow: "Mitgliederbereich",
      title: "Für Studierende der Universität Tübingen.",
      body: "Melde dich mit deinem persönlichen Uni-Account an. Wir erhalten nur eine pseudonyme Kennung, deine verifizierte Uni-Mail und deinen Studierendenstatus.",
      login: "Mit Uni-Account anmelden",
      note: "Dein zentrales Passwort bleibt bei der Universität und wird nie an uns übertragen.",
    },
    authenticated: {
      eyebrow: "Zugang bestätigt",
      title: "Willkommen im Mitgliederbereich.",
      body: "Dein Login@Uni-Tübingen wurde erfolgreich geprüft.",
      verified: "Studierendenstatus bestätigt",
      email: "Verifizierte Uni-Mail",
      logout: "Abmelden",
    },
    whatsapp: {
      eyebrow: "WhatsApp-Gruppe",
      title: "Komm in die Gruppe",
      body: "Termine und der Aufbau laufen erstmal über unsere WhatsApp Gruppe. Der Beitritt ist dem Mitgliederbereich vorbehalten.",
      cta: "Gruppe beitreten",
      scan: "Oder mit dem Handy scannen",
      qrLabel: "QR-Code zum Beitritt der WhatsApp-Gruppe",
    },
    events: {
      title: "Nächste Formate",
      body: "Konkrete Termine erscheinen hier, sobald Räume und Speaker bestätigt sind.",
      status: "in Planung",
      items: [
        {
          title: "Paper-Reading-Session",
          description: "Ein aktuelles Quant-Paper gemeinsam vorbereiten und diskutieren.",
        },
        {
          title: "Einführungsworkshop",
          description: "Quantitative Finance, Daten und Modelle ohne vorausgesetztes Finance-Wissen.",
        },
        {
          title: "Projektabend",
          description: "Backtests, Datensätze und offene Ideen in kleiner Runde auseinandernehmen.",
        },
      ],
    },
  },
  en: {
    gate: {
      eyebrow: "Members area",
      title: "For students at the University of Tübingen.",
      body: "Sign in with your personal university account. We only receive a pseudonymous identifier, your verified university email, and your student status.",
      login: "Sign in with your university account",
      note: "Your central password stays with the university and is never shared with us.",
    },
    authenticated: {
      eyebrow: "Access confirmed",
      title: "Welcome to the members area.",
      body: "Your Login@Uni-Tübingen session was verified successfully.",
      verified: "Student status confirmed",
      email: "Verified university email",
      logout: "Sign out",
    },
    whatsapp: {
      eyebrow: "WhatsApp group",
      title: "Join our WhatsApp group",
      body: "Dates and everything around getting started run through our WhatsApp group for now. Joining stays reserved for the members area.",
      cta: "Join the group",
      scan: "Or scan it with your phone",
      qrLabel: "QR code to join the WhatsApp group",
    },
    events: {
      title: "Upcoming formats",
      body: "Confirmed dates will appear here as soon as rooms and speakers are set.",
      status: "planned",
      items: [
        {
          title: "Paper-reading session",
          description: "Prepare and discuss a current quantitative-finance paper together.",
        },
        {
          title: "Introductory workshop",
          description: "Quantitative finance, data, and models without assumed finance knowledge.",
        },
        {
          title: "Project evening",
          description: "Take apart backtests, datasets, and open ideas in a small group.",
        },
      ],
    },
  },
};
