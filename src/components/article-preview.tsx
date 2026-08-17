/**
 * The preview graphic on an article card and in the article header.
 *
 * The shape itself comes from src/lib/article-figure.ts — the same geometry the
 * Open Graph card is painted from, so the share preview and the page agree.
 * This component only paints it, in the page's own colours.
 *
 * Purely decorative: the card's own text carries the meaning, so the SVG is
 * hidden from assistive technology.
 */
import {
  articleFigure,
  figureGrid,
  FIGURE_HEIGHT,
  FIGURE_WIDTH,
} from "@/lib/article-figure";
import type { ArticleKind } from "@/lib/articles";

export function ArticlePreview({ slug, kind }: { slug: string; kind: ArticleKind }) {
  const figure = articleFigure(slug, kind);
  const gradient = `article-grad-${slug}`;
  const fade = `article-fade-${slug}`;

  return (
    <svg
      className="article-preview"
      viewBox={`0 0 ${FIGURE_WIDTH} ${FIGURE_HEIGHT}`}
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

      <g stroke="var(--rule)" strokeWidth="1">
        {figureGrid.map((y) => (
          <line key={y} x1="0" x2={FIGURE_WIDTH} y1={y} y2={y} />
        ))}
      </g>

      {figure.shape === "distribution" ? (
        <g fill={`url(#${gradient})`}>
          {figure.bars.map((bar, index) => (
            <rect
              key={index}
              x={bar.x}
              y={bar.y}
              width={bar.width}
              height={bar.height}
              rx="1.5"
              opacity={bar.opacity}
            />
          ))}
        </g>
      ) : figure.shape === "series" ? (
        <>
          <path d={figure.area} fill={`url(#${fade})`} />
          <path
            d={figure.secondary}
            fill="none"
            stroke="var(--rule-strong)"
            strokeWidth="1.6"
            strokeDasharray="4 4"
          />
          <path
            d={figure.primary}
            fill="none"
            stroke={`url(#${gradient})`}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <>
          <path d={figure.area} fill={`url(#${fade})`} />
          <path
            d={figure.line}
            fill="none"
            stroke={`url(#${gradient})`}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx={FIGURE_WIDTH - 2} cy={figure.markerY} r="3.5" fill="var(--accent-2)" />
        </>
      )}
    </svg>
  );
}
