/**
 * The preview graphic on an article card.
 *
 * No image files, no uploads: the shape is derived from the article's slug, so
 * every piece gets its own recognisable figure and it never changes once the
 * slug is fixed. The figure family follows the kind — a simulated path for
 * research notes, a distribution for workshop handouts, two correlated series
 * for articles — which makes the three formats scannable at card size.
 *
 * Purely decorative: the card's own text carries the meaning, so the SVG is
 * hidden from assistive technology.
 */
import type { ArticleKind } from "@/lib/articles";

const WIDTH = 400;
const HEIGHT = 150;
const TOP = 14;
const BOTTOM = HEIGHT - 12;

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
  return values.map((value) => BOTTOM - ((value - low) / span) * (BOTTOM - TOP) * 0.92);
}

function linePath(ys: number[]): string {
  const step = WIDTH / (ys.length - 1);
  return ys.map((y, index) => `${index === 0 ? "M" : "L"}${(index * step).toFixed(1)} ${y.toFixed(1)}`).join(" ");
}

export function ArticlePreview({ slug, kind }: { slug: string; kind: ArticleKind }) {
  const random = mulberry32(seedFrom(slug));
  const gradient = `article-grad-${slug}`;
  const fade = `article-fade-${slug}`;

  return (
    <svg
      className="article-preview"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--accent-2)" />
        </linearGradient>
        <linearGradient id={fade} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Terminal grid, the same motif as the hero background. */}
      <g stroke="var(--rule)" strokeWidth="1">
        {[0, 1, 2, 3].map((row) => {
          const y = TOP + ((BOTTOM - TOP) / 3) * row;
          return <line key={row} x1="0" x2={WIDTH} y1={y} y2={y} />;
        })}
      </g>

      {kind === "workshop"
        ? <Distribution random={random} gradient={gradient} />
        : kind === "article"
          ? <Series random={random} gradient={gradient} fade={fade} />
          : <Path random={random} gradient={gradient} fade={fade} />}
    </svg>
  );
}

/** Research note: one simulated path with the area under it washed in. */
function Path({
  random,
  gradient,
  fade,
}: {
  random: () => number;
  gradient: string;
  fade: string;
}) {
  const ys = scale(walk(random, 48, 0.016 + random() * 0.012));
  const line = linePath(ys);
  const last = ys[ys.length - 1];

  return (
    <>
      <path d={`${line} L${WIDTH} ${HEIGHT} L0 ${HEIGHT} Z`} fill={`url(#${fade})`} />
      <path
        d={line}
        fill="none"
        stroke={`url(#${gradient})`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={WIDTH - 2} cy={last} r="3.5" fill="var(--accent-2)" />
    </>
  );
}

/** Article: two correlated series — the comparison shape. */
function Series({
  random,
  gradient,
  fade,
}: {
  random: () => number;
  gradient: string;
  fade: string;
}) {
  const base = walk(random, 40, 0.018);
  const shadow = base.map((value, index) => value * (1 + (index / base.length) * (random() - 0.55) * 0.12));
  const [primary, secondary] = [scale(base), scale(shadow)];

  return (
    <>
      <path d={`${linePath(primary)} L${WIDTH} ${HEIGHT} L0 ${HEIGHT} Z`} fill={`url(#${fade})`} />
      <path
        d={linePath(secondary)}
        fill="none"
        stroke="var(--rule-strong)"
        strokeWidth="1.6"
        strokeDasharray="4 4"
      />
      <path
        d={linePath(primary)}
        fill="none"
        stroke={`url(#${gradient})`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}

/** Workshop handout: a jittered bell — the first histogram of every course. */
function Distribution({ random, gradient }: { random: () => number; gradient: string }) {
  const count = 24;
  const gap = 3;
  const barWidth = (WIDTH - gap * (count - 1)) / count;
  const spread = 0.28 + random() * 0.1;
  const centre = 0.42 + random() * 0.16;

  return (
    <g fill={`url(#${gradient})`}>
      {Array.from({ length: count }, (_, index) => {
        const position = index / (count - 1);
        const bell = Math.exp(-((position - centre) ** 2) / (2 * spread ** 2));
        const height = Math.max(3, bell * (BOTTOM - TOP) * (0.82 + random() * 0.3));
        return (
          <rect
            key={index}
            x={index * (barWidth + gap)}
            y={BOTTOM - height}
            width={barWidth}
            height={height}
            rx="1.5"
            opacity={0.32 + bell * 0.62}
          />
        );
      })}
    </g>
  );
}
