/**
 * The geometry behind an article's signature figure.
 *
 * Two things draw it: <ArticlePreview> on the cards and in the article header,
 * and the Open Graph card in src/lib/og. They must produce the *same* shape for
 * the same slug — a share preview that disagrees with the page it links to
 * looks like a bug. So the maths lives here once and both sides only paint it.
 *
 * No image files, no uploads: the shape is derived from the slug, so every
 * piece gets its own recognisable figure and it never changes once the slug is
 * fixed. The figure family follows the kind — a simulated path for research
 * notes, a distribution for workshop handouts, two correlated series for
 * articles — which makes the three formats scannable at card size.
 */
import type { ArticleKind } from "@/lib/articles";

export const FIGURE_WIDTH = 400;
export const FIGURE_HEIGHT = 150;

const TOP = 14;
const BOTTOM = FIGURE_HEIGHT - 12;

/** Terminal grid, the same motif as the hero background. */
export const figureGrid: number[] = [0, 1, 2, 3].map(
  (row) => TOP + ((BOTTOM - TOP) / 3) * row,
);

export type FigureBar = {
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
};

export type ArticleFigure =
  /** Research note: one simulated path with the area under it washed in. */
  | { shape: "path"; area: string; line: string; markerY: number }
  /** Article: two correlated series — the comparison shape. */
  | { shape: "series"; area: string; primary: string; secondary: string }
  /** Workshop handout: a jittered bell — the first histogram of every course. */
  | { shape: "distribution"; bars: FigureBar[] };

/** FNV-1a — a short, stable hash so the same slug always draws the same figure. */
function seedFrom(slug: string): number {
  let hash = 2166136261;
  for (let index = 0; index < slug.length; index += 1) {
    hash = Math.imul(hash ^ slug.charCodeAt(index), 16777619);
  }
  return hash >>> 0;
}

/** Small deterministic PRNG — same seed, same series, on server and client. */
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

function gaussian(random: () => number): number {
  const u = random() || 1e-9;
  const v = random() || 1e-9;
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** Geometric Brownian motion, scaled into the box. */
function walk(random: () => number, steps: number, sigma: number): number[] {
  const drift = (random() - 0.42) * 0.006;
  const values: number[] = [];
  let value = 100;
  for (let step = 0; step < steps; step += 1) {
    value *= Math.exp(drift + sigma * gaussian(random));
    values.push(value);
  }
  return values;
}

/** Map a series onto the drawing box, leaving a little headroom top and bottom. */
function scale(values: number[]): number[] {
  const low = Math.min(...values);
  const high = Math.max(...values);
  const span = high - low || 1;
  return values.map(
    (value) => BOTTOM - ((value - low) / span) * (BOTTOM - TOP) * 0.92,
  );
}

function linePath(ys: number[]): string {
  const step = FIGURE_WIDTH / (ys.length - 1);
  return ys
    .map(
      (y, index) =>
        `${index === 0 ? "M" : "L"}${(index * step).toFixed(1)} ${y.toFixed(1)}`,
    )
    .join(" ");
}

/** Close a line into the filled area beneath it. */
function areaPath(line: string): string {
  return `${line} L${FIGURE_WIDTH} ${FIGURE_HEIGHT} L0 ${FIGURE_HEIGHT} Z`;
}

/**
 * The figure for one article. Pure: same slug and kind in, same numbers out —
 * on the server, in the browser and in the build step that bakes the OG card.
 */
export function articleFigure(slug: string, kind: ArticleKind): ArticleFigure {
  const random = mulberry32(seedFrom(slug));

  if (kind === "workshop") {
    const count = 24;
    const gap = 3;
    const barWidth = (FIGURE_WIDTH - gap * (count - 1)) / count;
    const spread = 0.28 + random() * 0.1;
    const centre = 0.42 + random() * 0.16;

    const bars = Array.from({ length: count }, (_, index): FigureBar => {
      const position = index / (count - 1);
      const bell = Math.exp(-((position - centre) ** 2) / (2 * spread ** 2));
      const height = Math.max(3, bell * (BOTTOM - TOP) * (0.82 + random() * 0.3));
      return {
        x: index * (barWidth + gap),
        y: BOTTOM - height,
        width: barWidth,
        height,
        opacity: 0.32 + bell * 0.62,
      };
    });

    return { shape: "distribution", bars };
  }

  if (kind === "article") {
    const base = walk(random, 40, 0.018);
    const shadow = base.map(
      (value, index) => value * (1 + (index / base.length) * (random() - 0.55) * 0.12),
    );
    const [primary, secondary] = [scale(base), scale(shadow)];
    const line = linePath(primary);

    return {
      shape: "series",
      area: areaPath(line),
      primary: line,
      secondary: linePath(secondary),
    };
  }

  // The sigma is drawn before walk() runs — keep the expression inline so the
  // PRNG is consumed in exactly this order.
  const ys = scale(walk(random, 48, 0.016 + random() * 0.012));
  const line = linePath(ys);

  return {
    shape: "path",
    area: areaPath(line),
    line,
    markerY: ys[ys.length - 1],
  };
}
