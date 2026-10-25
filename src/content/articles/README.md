# Artikel schreiben

Öffentliche Materialien (Research-Notes, Workshop-Unterlagen, Artikel). Alles in
diesem Ordner erscheint automatisch in der Übersicht seiner Sprache — deutsche
Texte unter `/articles`, englische unter `/en/articles`. Es gibt keine Liste,
die zusätzlich gepflegt werden muss.

## Neuen Beitrag anlegen

1. `_template.mdx` kopieren und nach `<slug>.mdx` umbenennen. Der Dateiname ist
   die URL: `vol-surface.mdx` → `tuequant.de/article/vol-surface`.
   Kleinbuchstaben, Bindestriche, keine Umlaute.
2. Den `meta`-Block oben ausfüllen und `draft: true` entfernen.
3. Text darunter als Markdown schreiben.

Das war's. Die Übersicht zeigt zehn Beiträge pro Seite, neueste zuerst; ältere
landen automatisch auf `/articles/2`, `/articles/3` und so weiter.

## meta-Felder

| Feld          | Pflicht | Bedeutung                                                   |
| ------------- | ------- | ----------------------------------------------------------- |
| `title`       | ja      | Überschrift auf Karte und Artikelseite                      |
| `description` | ja      | Ein bis zwei Sätze; Kartentext, `<meta description>`, Teaser |
| `date`        | ja      | `YYYY-MM-DD`, sortiert die Liste                            |
| `lang`        | ja      | `"de"` oder `"en"` — die Sprache *dieses Textes*            |
| `kind`        | ja      | `"research-note"`, `"workshop"` oder `"article"`            |
| `authors`     | nein    | Liste von Namen                                             |
| `topics`      | nein    | Schlagworte unter dem Titel                                 |
| `resources`   | nein    | Downloads: `{ label, href }`, Dateien in `public/articles/` |
| `updated`     | nein    | `YYYY-MM-DD`, wenn ein Beitrag überarbeitet wurde           |
| `preview`     | nein    | `false` entfernt die generierte Grafik überall              |
| `draft`       | nein    | `true` versteckt den Beitrag (nicht in der Liste, 404)      |

Falsche oder fehlende Pflichtfelder brechen den Build mit einer Meldung ab, in
der der Dateiname steht — kaputte Karten kommen so gar nicht erst live.

## Sprachen

Beiträge werden nicht automatisch übersetzt. Die Übersicht zeigt nur Texte in
der ausgewählten Sprache. Direkte Links auf einen Beitrag bleiben erreichbar;
Navigation, Datum und Fußzeile folgen dabei weiterhin der Sprache der Route.

## Vorschaubild

Es gibt keins zum Hochladen. Die Grafik auf der Karte wird aus dem Dateinamen
erzeugt und bleibt damit stabil, solange der Slug gleich bleibt. Die Form richtet
sich nach `kind`: simulierter Kurs (Research-Note), Verteilung (Workshop), zwei
Reihen im Vergleich (Artikel). Mit `preview: false` bleibt ein Beitrag auf der
Karte, der Leseseite und im Social Preview bewusst ohne diese Grafik.

## Dateien

Bilder, Folien und Notebooks nach `public/articles/` legen und mit absolutem
Pfad verlinken (`/articles/dateiname.pdf`). `_`-Dateien in diesem Ordner sind
Vorlagen und werden nie veröffentlicht.

## Formeln

Formeln sind LaTeX und werden beim Build mit KaTeX gesetzt. Mathe steht
immer zwischen doppelten Dollarzeichen, auch im Fließtext (`$$\sigma$$`):
einzelne `$` bleiben Preise wie „100 $“. Eine abgesetzte Formel mit Legende
kommt in einen `<Formula>`-Kasten; Leerzeilen um den Inhalt nicht vergessen:

```mdx
<Formula>

$$
F = S \cdot e^{rT}
$$

- $$S$$: Spotpreis
- $$T$$: Restlaufzeit in Jahren

</Formula>
```

## Interaktive Elemente

Rechner und Quiz aus `src/components/lab` lassen sich direkt im Text verwenden.
Oben in der Datei importieren und an der gewünschten Stelle einsetzen; `lang`
steuert Beschriftung und Zahlenformat:

```mdx
import { PayoffLab } from "@/components/lab";

<PayoffLab lang="de" />
```

Verfügbar sind `BasisLab`, `PayoffLab`, `OptionPricer`, `LiquidationLab`,
`FundingCarryLab`, `ArbitrageLab`, `AmmLab` und `Quiz`. Die Mathematik dahinter
liegt in `src/lib/derivatives.ts` und ist getestet.
