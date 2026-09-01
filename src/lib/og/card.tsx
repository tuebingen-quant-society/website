/**
 * The layout of every generated Open Graph card.
 *
 * One shape for all of them — accent rule, eyebrow, headline, byline, a figure
 * band and the wordmark — so a shared article and the site itself preview as
 * the same object. Only the figure and the words change.
 *
 * This is satori markup, not the DOM: flex is the only layout model, every
 * container states `display: flex`, and there is no cascade to inherit from.
 */
import { ogColors } from "./theme";

/** How much room the figure band and the wordmark strip take off the bottom. */
const FIGURE_BAND = 190;
const FOOTER = 96;

type OgCardProps = {
  /** Small caps line above the headline; the first segment picks up the accent. */
  eyebrow: string[];
  title: string;
  /** Authors, dates, or the site's own one-liner. Optional — drafts have none. */
  byline?: string;
  /** The optional figure, as a data URI (see ./figures.ts). */
  figure?: string;
  wordmark: string;
  /** Bottom right — the bare domain, so the card is attributable on its own. */
  domain: string;
};

/**
 * Headlines have to survive at thumbnail size, so the type scale steps down
 * rather than wrapping into a fourth line.
 */
function headlineSize(title: string): number {
  if (title.length <= 40) return 66;
  if (title.length <= 70) return 54;
  if (title.length <= 110) return 44;
  return 38;
}

/** Cut on a word boundary — a headline chopped mid-word reads as broken. */
export function truncate(text: string, limit: number): string {
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > limit * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

export function OgCard({ eyebrow, title, byline, figure, wordmark, domain }: OgCardProps) {
  const headline = truncate(title, 140);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: ogColors.paper,
        fontFamily: "PlexSans",
        color: ogColors.ink,
      }}
    >
      {/* The brand signature, carried by the one gradient the palette has. */}
      <div
        style={{
          display: "flex",
          height: 6,
          width: "100%",
          backgroundImage: `linear-gradient(90deg, ${ogColors.accent} 0%, ${ogColors.accent2} 100%)`,
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          padding: "54px 72px 28px 72px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "PlexMono",
            fontSize: 21,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: ogColors.inkSubtle,
          }}
        >
          {eyebrow.map((segment, index) => (
            <div key={segment} style={{ display: "flex" }}>
              {index > 0 && <div style={{ display: "flex", padding: "0 12px" }}>·</div>}
              <div style={{ display: "flex", color: index === 0 ? ogColors.accent : undefined }}>
                {segment}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: headlineSize(headline),
            fontWeight: 600,
            lineHeight: 1.14,
            letterSpacing: -0.5,
          }}
        >
          {headline}
        </div>

        {byline ? (
          <div
            style={{
              display: "flex",
              marginTop: "auto",
              paddingTop: 24,
              fontSize: 26,
              lineHeight: 1.35,
              color: ogColors.inkMuted,
            }}
          >
            {truncate(byline, 150)}
          </div>
        ) : null}
      </div>

      {/* A raw <img>, not next/image: this tree is rasterised by satori, which
          has no Next runtime to optimise anything. */}
      {figure ? <img src={figure} width={1200} height={FIGURE_BAND} alt="" /> : null}

      <div
        style={{
          display: "flex",
          height: FOOTER,
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 72px",
          borderTop: `1px solid ${ogColors.rule}`,
          backgroundColor: ogColors.surface,
        }}
      >
        <div style={{ display: "flex", fontSize: 28, fontWeight: 600 }}>{wordmark}</div>
        <div
          style={{
            display: "flex",
            fontFamily: "PlexMono",
            fontSize: 22,
            color: ogColors.inkSubtle,
          }}
        >
          {domain}
        </div>
      </div>
    </div>
  );
}
