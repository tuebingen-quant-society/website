# Tübingen Quant Society — Website

Öffentliche Single-Page der studentischen Initiative, statisch gehostet.

Astro, statischer Output, kein UI-Framework. Ausgeliefert werden ~141 KB
(Startseite, inkl. Schriften) und 2,3 KB Inline-JS.

## Setup

```bash
npm install
npm run dev      # http://localhost:4321
```

| Script | Zweck |
|---|---|
| `npm run dev` | Dev-Server mit Hot Reload |
| `npm run build` | Statischer Build nach `dist/` |
| `npm run preview` | `dist/` lokal servieren |
| `npm run og` | `public/og.png` neu rendern (nur nötig, wenn sich Wortmarke oder Kurve ändert) |
| `npm run fonts` | Newsreader-Subset neu bauen (nur nötig, wenn sich der Zeichensatz ändert) |

`og` und `fonts` erzeugen eingecheckte Artefakte — der normale Build braucht sie nicht.

## Inhalte ändern

**Alles Inhaltliche steht in [`src/config.ts`](./src/config.ts)** (Spec §13).
Layout-Dateien enthalten keine Copy. Dort liegen Mission-Text, Kontakt-Mail,
Social-URLs, Aktivitäten, Form-Endpoint und die Impressums-Angaben.

Neue Aktivitäten-Karte = ein Objekt im Array, kein Markup:

```ts
{ titel: "Neues Format", beschreibung: "Kurze Beschreibung.", geplant: true }
```

`geplant: true` setzt das Badge und nimmt die Karte optisch zurück (§6.4).

## Offen vor dem Livegang

Die folgenden Punkte sind Platzhalter und entsprechen §16 der Spec.
**`git grep TODO src/` findet alle.**

| # | Punkt | Wo |
|---|---|---|
| 2 | Domain — steckt in Canonical, OG-URL, `sitemap.xml`, `robots.txt` | `site` in `src/config.ts` |
| 2 | Instagram- und LinkedIn-Handle, Kontakt-Mail | `kontakt` in `src/config.ts` |
| 3 | **Impressum: Name + ladungsfähige Anschrift.** Ohne das darf die Seite nicht öffentlich gehen (§5 DDG). | `impressum` in `src/config.ts` |
| 4 | Form-Backend | `formEndpoint` in `src/config.ts` |

Die Datenschutzerklärung ist ein Entwurf und deckt Hosting-Logs, Mailingliste
und Analytics ab (§11). Sobald das Form-Backend feststeht, gehören Anbieter,
Sitz und Speicherdauer hinein — die Seite weist im Text selbst darauf hin.
Vor dem Livegang juristisch prüfen lassen.

### Formular

Solange `formEndpoint` leer ist, läuft das Formular im **Mock-Modus**: alle fünf
Zustände aus §6.6 sind auslösbar und testbar, es geht aber nichts raus. Sobald
dort eine URL steht, postet es echt (`POST`, JSON `{ email }`) — ohne
Code-Änderung. Double-Opt-In muss das Backend leisten; die Datenschutzerklärung
sagt es bereits zu.

## Abweichungen von der Spec

Drei Stellen, an denen die Spec sich selbst widerspricht oder ihre Zahlen
nicht aufgehen. Jede ist im Code an Ort und Stelle kommentiert:

- **§6.4 `opacity: 0.72` vs. §9 Kontrast ≥4.5:1** — komponiert käme
  `--ink-muted` auf einer geplanten Karte auf 3,19:1. Text und Badge dieser
  Karten nehmen die Abdunklung deshalb vorweg (`--ink` statt `--ink-muted`) und
  landen bei 7,08:1, bei unverändertem Erscheinungsbild.
  Siehe `src/styles/global.css`.
- **§5 Achsen-Label auf Mobile** — die Label stehen in Viewbox-Einheiten und
  skalieren mit dem Plot. Bei 320px kämen 12 Einheiten als ~5px an. Auf <768px
  stehen sie deshalb auf 26 Einheiten und landen bei ~10px, dort wo sie auch auf
  dem Desktop ankommen. Siehe `src/components/SignaturePlot.astro`.
- **§8 Touch-Targets ≥44px** — der Datenschutz-Link im Fließtext am Formular ist
  18px hoch. 44px würden die Zeile aufreißen; das ist die Inline-Ausnahme aus
  WCAG 2.5.8. Alle freistehenden Bedienelemente halten die 44px ein.

Zusätzlich zur Spec: **§6.4 legt für die Aktivitäten-Sektion nur die Karten
fest.** Eyebrow und Headline übernehmen wörtlich Nav-Item und Sektions-Label aus
der IA (§3), statt neue Copy zu erfinden.

## Aufbau

```
src/
  config.ts               ← sämtliche Inhalte (§13)
  layouts/Base.astro      ← Meta, OG, Skip-Link, Header/Footer
  components/
    Header.astro          §6.1
    Footer.astro          §6.7
    SignaturePlot.astro   §5 — „Das Band"
    JoinForm.astro        §6.6 — fünf Zustände
  pages/
    index.astro           §6.2–6.6
    impressum.astro       §11
    datenschutz.astro     §11
    robots.txt.ts         §10 — generiert, damit die Domain nur in config steht
  styles/
    global.css            Design-Tokens (§4) + Komponenten (§7)
    fonts.css             @font-face für den Newsreader-Subset
scripts/
  gen-plot.mjs            Pfaddaten der Signature-Kurve
  subset-fonts.mjs        Newsreader-Subset (132 KB → 53 KB)
  render-og.mjs           public/og.png
```

## Schriften

Selbst gehostet, keine Third-Party-Requests (§11) — im Network-Tab ist die Seite
auf allen drei Routen bei null externen Requests.

IBM Plex Sans (400/600) und Mono (500) kommen unverändert über `@fontsource`.
Newsreader wird als eigener Subset gebaut: `wght` fest auf 400 instanziert,
`opsz` bleibt variabel (§4.2 braucht `optical-sizing`). Das drückt die
Display-Schrift von 132 KB auf 53 KB und die Startseite unter das 200-KB-Budget
aus §10. Begründung und Zeichensatz stehen in `scripts/subset-fonts.mjs`.

## Deployment

Statischer Output in `dist/`, deploybar auf Vercel. Repo in Vercel importieren
(Framework-Preset **Astro** wird automatisch erkannt, Build-Command `npm run
build`, Output-Verzeichnis `dist`); jeder Push auf `main` deployt automatisch.
`tuequant.de` als Custom Domain im Vercel-Projekt hinterlegen und DNS gemäß
Vercel-Anleitung setzen.

Canonical, OG-URL, Sitemap und `robots.txt` hängen an `site` in
`src/config.ts` (aktuell `https://tuequant.de`) und aktualisieren sich
automatisch.
