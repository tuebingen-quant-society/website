# Artikel schreiben

Öffentliche Materialien (Research-Notes, Workshop-Unterlagen, Artikel). Alles in
diesem Ordner erscheint automatisch unter `/articles` und `/en/articles` — es
gibt keine Liste, die zusätzlich gepflegt werden muss.

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
| `draft`       | nein    | `true` versteckt den Beitrag (nicht in der Liste, 404)      |

Falsche oder fehlende Pflichtfelder brechen den Build mit einer Meldung ab, in
der der Dateiname steht — kaputte Karten kommen so gar nicht erst live.

## Sprachen

Beiträge werden nicht übersetzt. Ein englischer Text taucht auch in der
deutschen Liste auf und bekommt dort das Label „Englisch"; umgekehrt genauso.
Die Seite drumherum (Navigation, Datum, Fußzeile) ist immer in der Sprache der
Route.

## Vorschaubild

Es gibt keins zum Hochladen. Die Grafik auf der Karte wird aus dem Dateinamen
erzeugt und bleibt damit stabil, solange der Slug gleich bleibt. Die Form richtet
sich nach `kind`: simulierter Kurs (Research-Note), Verteilung (Workshop), zwei
Reihen im Vergleich (Artikel).

## Dateien

Bilder, Folien und Notebooks nach `public/articles/` legen und mit absolutem
Pfad verlinken (`/articles/dateiname.pdf`). `_`-Dateien in diesem Ordner sind
Vorlagen und werden nie veröffentlicht.
