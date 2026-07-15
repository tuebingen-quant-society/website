/**
 * Renders public/og.png (1200×630) — "Quant Terminal" redesign.
 * Dark background, deterministically simulated candlestick chart (fixed
 * seed so the image is reproducible) plus an EMA line and the wordmark.
 *
 * Run: npm run og  (only needed if the wordmark or look changes)
 *
 * Rasterizes with sharp, which Astro already brings in — no browser in the build.
 */
import { writeFile, mkdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { wortmarke as marke } from "../src/config.ts";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const wortmarke = marke.lang;

const W = 1200;
const H = 630;

// Colors — must match src/styles/global.css.
const PAPER = "#0A0D12";
const INK = "#E9EDF2";
const MUTED = "#9AA5B2";
const RULE = "#1F2733";
const ACCENT = "#FF5C72";
const UP = "#2FBF8F";
const DOWN = "#F4506A";

const r = (n) => Math.round(n * 100) / 100;

// ---------------------------------------------------------------- Simulation

// mulberry32 — fixed seed so `npm run og` always produces the same image.
const mulberry32 = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const rand = mulberry32(20260715);
const randn = () => {
  let u = 0;
  let v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

const MU = 0.08;
const SIGMA = 0.2;
const DT = 1 / 252;
const N = 42;
const SUBTICKS = 6;
const EMA_K = 2 / (14 + 1);

let price = 100;
let ema = price;
const candles = [];
const emas = [];

for (let i = 0; i < N; i++) {
  const k = { o: price, h: price, l: price, c: price };
  for (let j = 0; j < SUBTICKS; j++) {
    price *= Math.exp((MU - SIGMA ** 2 / 2) * DT + SIGMA * Math.sqrt(DT) * randn());
    k.c = price;
    k.h = Math.max(k.h, price);
    k.l = Math.min(k.l, price);
  }
  ema = ema + EMA_K * (k.c - ema);
  candles.push(k);
  emas.push(ema);
}

// ---------------------------------------------------------------- Chart geometry

const X0 = 90;
const X1 = 1110;
const Y0 = 88;
const Y1 = 430;

let lo = Infinity;
let hi = -Infinity;
for (const k of candles) {
  lo = Math.min(lo, k.l);
  hi = Math.max(hi, k.h);
}
const pad = (hi - lo) * 0.12;
lo -= pad;
hi += pad;

const yOf = (p) => Y1 - ((p - lo) / (hi - lo)) * (Y1 - Y0);
const cw = (X1 - X0) / N;
const bodyW = cw * 0.55;

let candleSvg = "";
for (let i = 0; i < N; i++) {
  const k = candles[i];
  const x = r(X0 + i * cw + cw / 2);
  const col = k.c >= k.o ? UP : DOWN;
  const yO = yOf(k.o);
  const yC = yOf(k.c);
  candleSvg += `<line x1="${x}" y1="${r(yOf(k.h))}" x2="${x}" y2="${r(yOf(k.l))}" stroke="${col}" stroke-width="2"/>`;
  candleSvg += `<rect x="${r(x - bodyW / 2)}" y="${r(Math.min(yO, yC))}" width="${r(bodyW)}" height="${r(Math.max(2, Math.abs(yC - yO)))}" rx="1.5" fill="${col}"/>`;
}

const emaPts = emas
  .map((e, i) => `${r(X0 + i * cw + cw / 2)},${r(yOf(e))}`)
  .join(" ");

let gridSvg = "";
for (let y = Y0; y <= Y1 + 1; y += (Y1 - Y0) / 4) {
  gridSvg += `<line x1="${X0}" y1="${r(y)}" x2="${X1}" y2="${r(y)}" stroke="${RULE}" stroke-width="1.5"/>`;
}

// ---------------------------------------------------------------- Wordmark

// Text is computed into paths instead of set as <text>: the SVG rasterizer
// in sharp doesn't know @font-face and would fall back to a system font.
// As a path, the OG image looks the same everywhere.
const { default: wawoff2 } = await import("wawoff2");
const { default: opentype } = await import("opentype.js");

const loadFont = async (rel) => {
  const woff2 = await readFile(resolve(root, rel));
  const ttf = await wawoff2.decompress(woff2);
  return opentype.parse(ttf.buffer.slice(ttf.byteOffset, ttf.byteOffset + ttf.byteLength));
};

const sans = await loadFont(
  "node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-600-normal.woff2"
);
const mono = await loadFont(
  "node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2"
);

// opentype.js 2.0.0 has a bug in toPathData(): the commands themselves are
// clean, but the serializer writes NaN into individual x values. Hence
// serializing it ourselves here.
const cmdToPath = (commands) =>
  commands
    .map((c) => {
      switch (c.type) {
        case "M":
          return `M${r(c.x)} ${r(c.y)}`;
        case "L":
          return `L${r(c.x)} ${r(c.y)}`;
        case "C":
          return `C${r(c.x1)} ${r(c.y1)} ${r(c.x2)} ${r(c.y2)} ${r(c.x)} ${r(c.y)}`;
        case "Q":
          return `Q${r(c.x1)} ${r(c.y1)} ${r(c.x)} ${r(c.y)}`;
        case "Z":
          return "Z";
        default:
          throw new Error(`Unbekanntes Pfad-Kommando: ${c.type}`);
      }
    })
    .join("");

const textPath = (font, text, x, y, size, tracking = 0) => {
  // tracking in px between glyphs — opentype has no letter-spacing.
  let cx = x;
  let commands = [];
  for (const ch of text) {
    commands = commands.concat(font.getPath(ch, cx, y, size).commands);
    cx += font.getAdvanceWidth(ch, size) + tracking;
  }
  const nanCmd = commands.find((c) =>
    Object.values(c).some((v) => typeof v === "number" && Number.isNaN(v))
  );
  if (nanCmd) throw new Error(`Textpfad enthält NaN: ${JSON.stringify(nanCmd)}`);
  return cmdToPath(commands);
};

const markPath = textPath(sans, wortmarke, 90, 540, 56);
const subPath = textPath(
  mono,
  "// QUANTITATIVE FINANCE · UNIVERSITÄT TÜBINGEN",
  90,
  582,
  19,
  1.5
);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${PAPER}"/>

  ${gridSvg}
  ${candleSvg}
  <polyline points="${emaPts}" fill="none" stroke="${ACCENT}" stroke-width="3" stroke-linejoin="round" opacity="0.9"/>

  <path d="${markPath}" fill="${INK}"/>
  <path d="${subPath}" fill="${MUTED}"/>
</svg>`;

await mkdir(resolve(root, "public"), { recursive: true });

try {
  const { default: sharp } = await import("sharp");
  await sharp(Buffer.from(svg)).png().toFile(resolve(root, "public/og.png"));
  console.log("public/og.png geschrieben (1200×630).");
} catch (err) {
  // Only write the intermediate stage on error, so it can be inspected.
  await writeFile(resolve(root, "og.debug.svg"), svg, "utf8");
  console.error(
    "Rastern fehlgeschlagen — Zwischenstufe liegt in og.debug.svg.\n" +
      String(err?.message ?? err)
  );
  process.exitCode = 1;
}
