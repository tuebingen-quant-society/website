/**
 * Generates the subset of the display font — Spec §10 ("only the needed
 * weights/subsets").
 *
 * Run: npm run fonts   (only needed if the character set below changes)
 *
 * Why at all: Newsreader Variable ships latin with two axes
 * (wght 200-800, opsz 6-72) and weighs 132 KB. That would put the home page
 * at ~223 KB, over the 200 KB budget from §10 — for two headline styles.
 *
 * §4.2 uses Newsreader exclusively at weight 400, but with
 * `optical-sizing: auto`. So wght is fixed at 400 and opsz is left variable:
 * 132 KB → ~37 KB, without losing optical sizing.
 *
 * The result is checked in so the build runs without a wasm subsetter.
 *
 * IBM Plex Sans/Mono are left untouched — they're static single weights
 * and, at ~62 KB combined, not a concern.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

const range = (von, bis) =>
  Array.from({ length: bis - von + 1 }, (_, i) => String.fromCodePoint(von + i)).join("");

/**
 * Deliberately generous: ASCII + Latin-1 covers German including umlauts
 * and the common European accents, plus the typographic characters that
 * appear in German copy. The subset therefore isn't tied to the current
 * copy in config.ts — headlines can change without rebuilding the font.
 * If a character is missing here, only that one falls back to the
 * fallback serif; check this list in that case.
 */
const CHARSET =
  range(0x20, 0x7e) + // printable ASCII
  range(0xa0, 0xff) + // Latin-1: äöüÄÖÜß, é, à, ç …
  "–—‚‘’„“”…•·€†‡‰′″←→↑↓−×÷≈≤≥";

const QUELLE = resolve(
  root,
  "node_modules/@fontsource-variable/newsreader/files/newsreader-latin-opsz-normal.woff2"
);
const ZIEL_DIR = resolve(root, "src/styles/fonts");
const ZIEL = resolve(ZIEL_DIR, "newsreader-opsz-400-latin.woff2");

const { default: subsetFont } = await import("subset-font");

const src = await readFile(QUELLE);
const out = await subsetFont(src, CHARSET, {
  targetFormat: "woff2",
  // wght fixed at 400, opsz stays variable (§4.2).
  variationAxes: { wght: 400 },
});

await mkdir(ZIEL_DIR, { recursive: true });
await writeFile(ZIEL, out);

// Sanity check: opsz must have survived instancing, otherwise
// `optical-sizing: auto` in the CSS is a no-op and no one would notice.
const { default: wawoff2 } = await import("wawoff2");
const { default: opentype } = await import("opentype.js");
const ttf = await wawoff2.decompress(out);
const font = opentype.parse(ttf.buffer.slice(ttf.byteOffset, ttf.byteOffset + ttf.byteLength));
const achsen = (font.tables.fvar?.axes ?? []).map((a) => a.tag);

if (!achsen.includes("opsz")) {
  throw new Error(
    `opsz-Achse fehlt im Subset (gefunden: ${achsen.join(", ") || "keine"}). ` +
      "§4.2 verlangt optical-sizing für die Display-Schrift."
  );
}
if (achsen.includes("wght")) {
  throw new Error("wght wurde nicht instanziert — der Subset ist größer als nötig.");
}

const kb = (n) => (n / 1024).toFixed(1) + " KB";
console.log(
  `src/styles/fonts/newsreader-opsz-400-latin.woff2 geschrieben\n` +
    `  ${kb(src.length)} → ${kb(out.length)}, Achsen: ${achsen.join(", ")}, ` +
    `${[...new Set(CHARSET)].length} Zeichen`
);
