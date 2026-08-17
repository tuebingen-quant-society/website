/**
 * The artwork on the Open Graph cards, as standalone SVG markup.
 *
 * Two figures:
 *  - `articleFigureSvg` — an article's own signature shape, the exact geometry
 *    <ArticlePreview> draws on the card and in the article header.
 *  - `marketFigureSvg` — the candlestick chart of the site-wide card, a
 *    deterministic GBM sim with the same parameters as the signature plot.
 *
 * Both return a complete <svg> document with literal colours, ready to be
 * base64'd into an <img> for satori (see ./theme.ts).
 */
import { articleFigure, figureGrid, FIGURE_HEIGHT, FIGURE_WIDTH } from "@/lib/article-figure";
import type { ArticleKind } from "@/lib/articles";
import { ogColors } from "./theme";

const round = (value: number) => Math.round(value * 100) / 100;

/** The brand gradient, as the <defs> block both figures share. */
function gradientDefs(): string {
  return `<defs>
    <linearGradient id="stroke" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${ogColors.accent}"/>
      <stop offset="100%" stop-color="${ogColors.accent2}"/>
    </linearGradient>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${ogColors.accent}" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="${ogColors.accent}" stop-opacity="0"/>
    </linearGradient>
  </defs>`;
}

/**
 * An article's figure, stretched to the width of the card. The aspect ratio is
 * deliberately not preserved — same as on the site, where the SVG is set to
 * `preserveAspectRatio: none` and fills its card.
 */
export function articleFigureSvg(slug: string, kind: ArticleKind): string {
  const figure = articleFigure(slug, kind);

  const grid = figureGrid
    .map(
      (y) =>
        `<line x1="0" x2="${FIGURE_WIDTH}" y1="${round(y)}" y2="${round(y)}" stroke="${ogColors.rule}" stroke-width="1"/>`,
    )
    .join("");

  let body: string;
  if (figure.shape === "distribution") {
    body = figure.bars
      .map(
        (bar) =>
          `<rect x="${round(bar.x)}" y="${round(bar.y)}" width="${round(bar.width)}" height="${round(bar.height)}" rx="1.5" fill="url(#stroke)" opacity="${round(bar.opacity)}"/>`,
      )
      .join("");
  } else if (figure.shape === "series") {
    body =
      `<path d="${figure.area}" fill="url(#fade)"/>` +
      `<path d="${figure.secondary}" fill="none" stroke="${ogColors.ruleStrong}" stroke-width="1.6" stroke-dasharray="4 4"/>` +
      `<path d="${figure.primary}" fill="none" stroke="url(#stroke)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  } else {
    body =
      `<path d="${figure.area}" fill="url(#fade)"/>` +
      `<path d="${figure.line}" fill="none" stroke="url(#stroke)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<circle cx="${FIGURE_WIDTH - 2}" cy="${round(figure.markerY)}" r="3.5" fill="${ogColors.accent2}"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${FIGURE_WIDTH} ${FIGURE_HEIGHT}" preserveAspectRatio="none">${gradientDefs()}${grid}${body}</svg>`;
}

// ------------------------------------------------------------ Market figure

const MARKET_WIDTH = 1200;
const MARKET_HEIGHT = 300;

/** mulberry32 with a fixed seed — the site card is the same image every build. */
function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * The candlestick chart of the site-wide card: μ, σ and Δt are the parameters
 * quoted in the signature plot's chrome (see config.plotParams), so the picture
 * and the caption describe the same process.
 */
export function marketFigureSvg(): string {
  const random = mulberry32(20260715);
  const gaussian = () => {
    const u = random() || 1e-9;
    const v = random() || 1e-9;
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };

  const MU = 0.08;
  const SIGMA = 0.2;
  const DT = 1 / 252;
  const CANDLES = 46;
  const SUBTICKS = 6;
  const EMA_K = 2 / (14 + 1);

  let price = 100;
  let ema = price;
  const candles: { open: number; high: number; low: number; close: number }[] = [];
  const emas: number[] = [];

  for (let index = 0; index < CANDLES; index += 1) {
    const candle = { open: price, high: price, low: price, close: price };
    for (let tick = 0; tick < SUBTICKS; tick += 1) {
      price *= Math.exp((MU - SIGMA ** 2 / 2) * DT + SIGMA * Math.sqrt(DT) * gaussian());
      candle.close = price;
      candle.high = Math.max(candle.high, price);
      candle.low = Math.min(candle.low, price);
    }
    ema += EMA_K * (candle.close - ema);
    candles.push(candle);
    emas.push(ema);
  }

  const top = 12;
  const bottom = MARKET_HEIGHT - 12;
  let low = Infinity;
  let high = -Infinity;
  for (const candle of candles) {
    low = Math.min(low, candle.low);
    high = Math.max(high, candle.high);
  }
  const padding = (high - low) * 0.12;
  low -= padding;
  high += padding;

  const yOf = (value: number) => bottom - ((value - low) / (high - low)) * (bottom - top);
  const slot = MARKET_WIDTH / CANDLES;
  const bodyWidth = slot * 0.55;

  const grid = [0, 1, 2, 3, 4]
    .map((row) => {
      const y = round(top + ((bottom - top) / 4) * row);
      return `<line x1="0" x2="${MARKET_WIDTH}" y1="${y}" y2="${y}" stroke="${ogColors.rule}" stroke-width="1.5"/>`;
    })
    .join("");

  const sticks = candles
    .map((candle, index) => {
      const x = round(index * slot + slot / 2);
      const colour = candle.close >= candle.open ? ogColors.up : ogColors.down;
      const yOpen = yOf(candle.open);
      const yClose = yOf(candle.close);
      return (
        `<line x1="${x}" y1="${round(yOf(candle.high))}" x2="${x}" y2="${round(yOf(candle.low))}" stroke="${colour}" stroke-width="2"/>` +
        `<rect x="${round(x - bodyWidth / 2)}" y="${round(Math.min(yOpen, yClose))}" width="${round(bodyWidth)}" height="${round(Math.max(2, Math.abs(yClose - yOpen)))}" rx="1.5" fill="${colour}"/>`
      );
    })
    .join("");

  const trend = emas
    .map((value, index) => `${round(index * slot + slot / 2)},${round(yOf(value))}`)
    .join(" ");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MARKET_WIDTH} ${MARKET_HEIGHT}" preserveAspectRatio="none">${grid}${sticks}<polyline points="${trend}" fill="none" stroke="${ogColors.accent}" stroke-width="3" stroke-linejoin="round" opacity="0.9"/></svg>`;
}
