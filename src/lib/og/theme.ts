/**
 * Palette and fonts for the generated Open Graph cards.
 *
 * The cards are rasterised by satori (inside next/og), which knows nothing
 * about our stylesheet: no custom properties, no @font-face. So the tokens are
 * mirrored here as literals and the fonts are handed over as buffers.
 *
 * Keep the colours in step with the :root block in src/styles/global.css.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";

/** Facebook, LinkedIn and X all want 1.91:1 — 1200×630 is the safe size. */
export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

export const ogColors = {
  paper: "#05070c",
  surface: "#0a0e16",
  ink: "#edf1f7",
  inkMuted: "#99a5b7",
  inkSubtle: "#7b8799",
  rule: "#1a2130",
  ruleStrong: "#2a3547",
  accent: "#ff5c72",
  accent2: "#ffa06b",
  up: "#2fbf8f",
  down: "#f4506a",
} as const;

/**
 * satori reads ttf, otf and woff — but not woff2. @fontsource ships both next
 * to each other, so the plain .woff files are taken straight from the package
 * rather than checking another copy of the fonts into the repo.
 *
 * Every card is prerendered during `next build`, so reaching into node_modules
 * never happens at request time.
 */
function fontFile(pkg: string, file: string): string {
  return path.join(process.cwd(), "node_modules", "@fontsource", pkg, "files", file);
}

export type OgFont = {
  name: string;
  data: Buffer;
  weight: 400 | 500 | 600;
  style: "normal";
};

/**
 * The three faces the cards use. Named without spaces so the `fontFamily`
 * strings in the card markup stay unambiguous for satori.
 */
export async function ogFonts(): Promise<OgFont[]> {
  const [sans, sansSemibold, mono] = await Promise.all([
    readFile(fontFile("ibm-plex-sans", "ibm-plex-sans-latin-400-normal.woff")),
    readFile(fontFile("ibm-plex-sans", "ibm-plex-sans-latin-600-normal.woff")),
    readFile(fontFile("ibm-plex-mono", "ibm-plex-mono-latin-500-normal.woff")),
  ]);

  return [
    { name: "PlexSans", data: sans, weight: 400, style: "normal" },
    { name: "PlexSans", data: sansSemibold, weight: 600, style: "normal" },
    { name: "PlexMono", data: mono, weight: 500, style: "normal" },
  ];
}

/**
 * satori draws `<img>` reliably, but its support for inline SVG children is
 * patchier — so the figures are serialised to markup and embedded as data URIs.
 * base64 rather than percent-encoding: the markup contains `#` and `"` in
 * quantity, and base64 sidesteps escaping all of it.
 */
export function svgDataUri(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;
}
