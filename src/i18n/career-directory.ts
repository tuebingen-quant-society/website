import type { CareerField, Employer } from "@/lib/public-directory-types";

export const careerFields: CareerField[] = [
  {
    title: { de: "Handel und Market Making", en: "Trading and market making" },
    summary: {
      de: "Firmen stellen laufend Kauf- und Verkaufspreise und handeln auf vielen Börsen gleichzeitig.",
      en: "Firms continuously quote buy and sell prices and trade across many markets.",
    },
    work: {
      de: "Orderbücher, Preisbildung, Ausführung, Lager- und Risikosteuerung",
      en: "Order books, pricing, execution, inventory, and risk management",
    },
    methods: {
      de: "Wahrscheinlichkeit, Statistik, Optimierung, Systeme mit geringer Latenz",
      en: "Probability, statistics, optimization, and low-latency systems",
    },
  },
  {
    title: { de: "Systematische Fonds", en: "Systematic funds" },
    summary: {
      de: "Modelle helfen, Muster in Daten zu bewerten und Portfolios regelbasiert zu verwalten.",
      en: "Models help assess patterns in data and manage portfolios systematically.",
    },
    work: {
      de: "Signalforschung, Portfolios, Transaktionskosten und Risikomodelle",
      en: "Signal research, portfolios, transaction costs, and risk models",
    },
    methods: {
      de: "Zeitreihen, Statistik, Machine Learning, Portfoliooptimierung",
      en: "Time series, statistics, machine learning, portfolio optimization",
    },
  },
  {
    title: { de: "Banken und Finanzinfrastruktur", en: "Banks and financial infrastructure" },
    summary: {
      de: "Quantitative Teams entwickeln Modelle und Systeme für Preise, Risiken und Märkte.",
      en: "Quantitative teams build models and systems for prices, risk, and markets.",
    },
    work: {
      de: "Derivate, Markt- und Kreditrisiko, Modellprüfung, Betrugserkennung, Börsentechnik",
      en: "Derivatives, market and credit risk, model validation, fraud detection, exchange technology",
    },
    methods: {
      de: "Stochastik, numerische Methoden, Statistik, Datenengineering",
      en: "Stochastic modeling, numerical methods, statistics, data engineering",
    },
  },
  {
    title: { de: "Energie und Rohstoffe", en: "Energy and commodities" },
    summary: {
      de: "Strom, Gas und erneuerbare Erzeugung müssen trotz Wetter und schwankender Nachfrage geplant werden.",
      en: "Power, gas, and renewable generation must be scheduled despite weather and changing demand.",
    },
    work: {
      de: "Erzeugungsprognosen, Speicher, Dispatch, Stromhandel und Netzbilanzierung",
      en: "Generation forecasts, storage, dispatch, power trading, and grid balancing",
    },
    methods: {
      de: "Probabilistische Prognosen, Optimierung, Zeitreihen, Wetterdaten",
      en: "Probabilistic forecasting, optimization, time series, weather data",
    },
  },
  {
    title: { de: "Versicherung und Rückversicherung", en: "Insurance and reinsurance" },
    summary: {
      de: "Versicherer quantifizieren seltene Schäden, langfristige Verpflichtungen und Unsicherheit.",
      en: "Insurers quantify rare losses, long-term liabilities, and uncertainty.",
    },
    work: {
      de: "Tarifierung, Reserven, Katastrophenrisiko, Betrug und Solvenz",
      en: "Pricing, reserving, catastrophe risk, fraud, and solvency",
    },
    methods: {
      de: "Aktuarielle Mathematik, Statistik, Extremwerttheorie, Machine Learning",
      en: "Actuarial mathematics, statistics, extreme-value theory, machine learning",
    },
  },
  {
    title: { de: "Klima, Wetter und Naturgefahren", en: "Climate, weather, and catastrophe risk" },
    summary: {
      de: "Modelle schätzen Extremereignisse und deren Folgen für Infrastruktur, Unternehmen und Versicherungen.",
      en: "Models estimate extreme events and their effects on infrastructure, businesses, and insurers.",
    },
    work: {
      de: "Wetterprognosen, Klimarisiken, Expositionsmodelle und Anpassungsplanung",
      en: "Weather forecasts, climate risk, exposure models, and adaptation planning",
    },
    methods: {
      de: "Simulation, Geodaten, probabilistische Modellierung, Kausalität",
      en: "Simulation, geospatial data, probabilistic modeling, causal inference",
    },
  },
  {
    title: { de: "Logistik und digitale Marktplätze", en: "Logistics and digital marketplaces" },
    summary: {
      de: "Plattformen koordinieren Angebot und Nachfrage und entscheiden, was wann wohin gelangt.",
      en: "Platforms coordinate supply and demand and decide what goes where and when.",
    },
    work: {
      de: "Routen, Matching, dynamische Preise, Lager und Nachfrageprognosen",
      en: "Routing, matching, dynamic pricing, inventory, and demand forecasting",
    },
    methods: {
      de: "Operations Research, Optimierung, Auktionen, kausale Experimente",
      en: "Operations research, optimization, auctions, causal experiments",
    },
  },
  {
    title: { de: "Sport und Gesundheit", en: "Sports and health" },
    summary: {
      de: "Daten unterstützen Entscheidungen über Strategie, Behandlung und knappe Ressourcen.",
      en: "Data informs decisions about strategy, treatment, and scarce resources.",
    },
    work: {
      de: "Spielerbewertung, Sensordaten, klinische Studien und Ressourcenplanung",
      en: "Player valuation, sensor data, clinical trials, and resource planning",
    },
    methods: {
      de: "Statistik, Zeitreihen, Versuchsdesign, Bild- und Sensordatenanalyse",
      en: "Statistics, time series, experimental design, image and sensor analysis",
    },
  },
];

export const employers: Employer[] = [
  { name: "Jane Street", area: { de: "Handel", en: "Trading" }, href: "https://www.janestreet.com/join-jane-street/", roles: { de: "Trading, quantitative research, Software Engineering", en: "Trading, quantitative research, software engineering" } },
  { name: "Optiver", area: { de: "Handel", en: "Trading" }, href: "https://www.optiver.com/working-at-optiver/", roles: { de: "Trading, Research, Technology; Praktika und Graduate-Programme", en: "Trading, research, technology; internships and graduate programs" } },
  { name: "IMC", area: { de: "Handel", en: "Trading" }, href: "https://www.imc.com/eu/careers", roles: { de: "Trading, Quant Research, Engineering", en: "Trading, quant research, engineering" } },
  { name: "Susquehanna (SIG)", area: { de: "Handel", en: "Trading" }, href: "https://jobs.sig.biz/", roles: { de: "Trading, Quantitative Research, Technology", en: "Trading, quantitative research, technology" } },
  { name: "Hudson River Trading", area: { de: "Handel", en: "Trading" }, href: "https://www.hudsonrivertrading.com/careers/", roles: { de: "Algorithmic Trading, Research, Software Engineering", en: "Algorithmic trading, research, software engineering" } },
  { name: "Citadel Securities", area: { de: "Handel", en: "Trading" }, href: "https://www.citadelsecurities.com/careers/", roles: { de: "Quantitative Research, Trading, Engineering", en: "Quantitative research, trading, engineering" } },
  { name: "Man Group", area: { de: "Systematische Fonds", en: "Systematic funds" }, href: "https://www.man.com/careers", roles: { de: "Forschung, Datenwissenschaft, Portfolio und Risiko", en: "Research, data science, portfolio, and risk" } },
  { name: "Winton", area: { de: "Systematische Fonds", en: "Systematic funds" }, href: "https://www.winton.com/careers", roles: { de: "Forschung, Datenwissenschaft, Engineering", en: "Research, data science, engineering" } },
  { name: "Qube Research & Technologies", area: { de: "Systematische Fonds", en: "Systematic funds" }, href: "https://www.qube-rt.com/careers/", roles: { de: "Quant Research, Technology, Operations", en: "Quant research, technology, operations" } },
  { name: "Deutsche Börse Group", area: { de: "Finanzinfrastruktur", en: "Financial infrastructure" }, href: "https://careers.deutsche-boerse.com/", roles: { de: "Marktdaten, Risiko, Handelssysteme und Analytics", en: "Market data, risk, trading systems, and analytics" } },
  { name: "Deutsche Bank", area: { de: "Banken und Finanzinfrastruktur", en: "Banks and financial infrastructure" }, href: "https://careers.db.com/students-graduates/", roles: { de: "Investment Banking, Quantitative Analyse, Data Science, Technologie und Risiko", en: "Investment banking, quantitative analysis, data science, technology, and risk" } },
  { name: "Wintermute", area: { de: "Digitale Vermögenswerte", en: "Digital assets" }, href: "https://www.wintermute.com/careers", roles: { de: "Algorithmischer Handel, Research, Engineering", en: "Algorithmic trading, research, engineering" } },
  { name: "Statkraft", area: { de: "Energie", en: "Energy" }, href: "https://www.statkraft.com/careers/job-opportunities/", roles: { de: "Energiehandel, Prognosen, Trading und Optimierung", en: "Energy trading, forecasting, trading, and optimization" } },
  { name: "Danske Commodities", area: { de: "Energie", en: "Energy" }, href: "https://danskecommodities.com/join-us", roles: { de: "Energiehandel und -optimierung; Angebote für Studierende und Berufseinsteiger", en: "Energy trading and optimization; student and early-career opportunities" } },
  { name: "MFT Energy", area: { de: "Energie", en: "Energy" }, href: "https://mft-energy.com/graduate/", roles: { de: "Graduate-Programm im Energiehandel; technologie- und marktorientiert", en: "Graduate program in energy trading, combining technology and markets" } },
  { name: "Axpo", area: { de: "Energie", en: "Energy" }, href: "https://www.axpo.com/ch/en/people-and-careers/students-and-graduates.html", roles: { de: "Studierendenprojekte, Praktika und Trainee-Programm in Handel und Vertrieb", en: "Student projects, internships, and trainee roles in trading and sales" } },
  { name: "EDF Trading", area: { de: "Energie", en: "Energy" }, href: "https://www.edftrading.com/careers/graduates-interns", roles: { de: "Graduate Trading Programm und Praktika im Energiehandel", en: "Graduate trading program and energy-trading internships" } },
  { name: "SEFE", area: { de: "Energie", en: "Energy" }, href: "https://cms-sefe-prod.sefe.eu/en/career/", roles: { de: "Energie- und Rohstoffmärkte; Einstiegsrollen für Absolvent:innen", en: "Energy and commodity markets; graduate and early-career roles" } },
  { name: "Vattenfall", area: { de: "Energie", en: "Energy" }, href: "https://careers.vattenfall.com/", roles: { de: "Strommärkte, Handel, Prognosen und Energiewende", en: "Power markets, trading, forecasting, and energy transition" } },
  { name: "Alpiq", area: { de: "Energie", en: "Energy" }, href: "https://www.alpiq.com/career", roles: { de: "Europäischer Energiehandel und Graduate-Einstieg", en: "European energy trading and graduate opportunities" } },
  { name: "Equinor", area: { de: "Energie und Rohstoffe", en: "Energy and commodities" }, href: "https://www.equinor.com/careers", roles: { de: "Energiehandel, Marktanalyse, Daten und Engineering", en: "Energy trading, market analysis, data, and engineering" } },
  { name: "EnBW", area: { de: "Energie", en: "Energy" }, href: "https://www.enbw.com/careers/", roles: { de: "Energiehandel, Datenanalyse und Erzeugungsoptimierung", en: "Energy trading, data analysis, and generation optimization" } },
  { name: "Munich Re", area: { de: "Versicherung", en: "Insurance" }, href: "https://careers.munichre.com/en/munichre-student-and-graduates", roles: { de: "Praktika und Graduate-Programme; Aktuariat, Data Science, Risiko und Analytics", en: "Internships and graduate programs in actuarial, data science, risk, and analytics" } },
  { name: "Hannover Re", area: { de: "Versicherung", en: "Insurance" }, href: "https://www.hannover-re.com/en/career/entry-level/students/", roles: { de: "Praktika und Werkstudierendenstellen; Mathematik, Statistik, Data Science und Aktuariat", en: "Internships and working-student roles in mathematics, statistics, data science, and actuarial work" } },
  { name: "Swiss Re", area: { de: "Versicherung", en: "Insurance" }, href: "https://www.swissre.com/careers/early-talent.html", roles: { de: "Graduate-Programme, Praktika und Einstiegsrollen in Aktuariat, Daten, Risiko und Pricing", en: "Graduate programs, internships, and early roles in actuarial, data, risk, and pricing" } },
];
