"use client";

/**
 * Building blocks of the interactive article widgets: the panel frame, range
 * sliders, segmented buttons, stat tiles and a small SVG line plot. Colours
 * and type come from the site tokens, so every widget follows the theme.
 */
import {
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import type { Locale } from "@/i18n";

/* ------------------------------------------------------------ Formatting */

const MINUS = "−";

function numberLocale(lang: Locale): string {
  return lang === "de" ? "de-DE" : "en-US";
}

export function num(lang: Locale, value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "∞";
  const text = new Intl.NumberFormat(numberLocale(lang), {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Math.abs(value));
  return value < 0 && Number(text.replace(/\D/g, "")) !== 0 ? `${MINUS}${text}` : text;
}

export function signed(lang: Locale, value: number, digits = 2): string {
  const text = num(lang, value, digits);
  return value > 0 && Number(text.replace(/\D/g, "")) !== 0 ? `+${text}` : text;
}

export function pct(lang: Locale, value: number, digits = 2, withSign = false): string {
  const text = (withSign ? signed : num)(lang, value * 100, digits);
  return lang === "de" ? `${text} %` : `${text}%`;
}

export function money(lang: Locale, value: number, digits = 2, withSign = false): string {
  const body = num(lang, Math.abs(value), digits);
  const zero = Number(body.replace(/\D/g, "")) === 0;
  const sign = zero ? "" : value < 0 ? MINUS : withSign && value > 0 ? "+" : "";
  return lang === "de" ? `${sign}${body} $` : `${sign}$${body}`;
}

/** Tone for a figure: market colours, always shown together with its sign. */
export function toneOf(value: number, epsilon = 1e-9): "up" | "down" | undefined {
  if (value > epsilon) return "up";
  if (value < -epsilon) return "down";
  return undefined;
}

/* ------------------------------------------------------------ Frame */

type LabProps = {
  title: string;
  caption?: ReactNode;
  children: ReactNode;
};

/** The terminal-style panel every widget sits in. */
export function Lab({ title, caption, children }: LabProps) {
  return (
    <section className="lab panel" aria-label={title}>
      <div className="lab__bar" aria-hidden="true">
        <span className="plot__dots">
          <i className="plot__dot plot__dot--r" />
          <i className="plot__dot plot__dot--y" />
          <i className="plot__dot plot__dot--g" />
        </span>
        <span className="plot__title">{title}</span>
      </div>
      <div className="lab__body">{children}</div>
      {caption ? <p className="lab__caption">{caption}</p> : null}
    </section>
  );
}

/* ------------------------------------------------------------ Controls */

type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
  onChange: (value: number) => void;
};

export function Slider({ label, value, min, max, step, format, onChange }: SliderProps) {
  const id = useId();
  return (
    <div className="lab__control">
      <div className="lab__control-head">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id} className="tnum">
          {format(value)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

type SegmentedProps<T extends string> = {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
};

export function Segmented<T extends string>({ label, value, options, onChange }: SegmentedProps<T>) {
  return (
    <div className="lab__segmented" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className="lab__segment"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function Controls({ children }: { children: ReactNode }) {
  return <div className="lab__controls">{children}</div>;
}

type StatProps = {
  label: string;
  value: string;
  tone?: "up" | "down";
  emphasis?: boolean;
  /** Keep the label's case, e.g. for formulas. */
  raw?: boolean;
};

export function Stat({ label, value, tone, emphasis, raw }: StatProps) {
  return (
    <div className={`lab__stat${emphasis ? " lab__stat--emphasis" : ""}`}>
      <span className={`lab__stat-label${raw ? " lab__stat-label--raw" : ""}`}>{label}</span>
      <span className={`lab__stat-value tnum${tone ? ` is-${tone}` : ""}`}>{value}</span>
    </div>
  );
}

export function Stats({ children }: { children: ReactNode }) {
  return <div className="lab__stats">{children}</div>;
}

export function Verdict({ children, tone }: { children: ReactNode; tone?: "up" | "down" }) {
  return (
    <p className={`lab__verdict${tone ? ` is-${tone}` : ""}`} aria-live="polite">
      {children}
    </p>
  );
}

/* ------------------------------------------------------------ Plot */

export type Point = [number, number];

export type Series = {
  label: string;
  points: Point[];
  tone?: "accent" | "muted";
  dashed?: boolean;
};

type PlotProps = {
  title: string;
  series: Series[];
  xLabel: string;
  formatX: (value: number) => string;
  formatY: (value: number) => string;
  hint: string;
  markers?: { x: number; label: string }[];
  yDomain?: [number, number];
  includeZero?: boolean;
  endDot?: boolean;
  height?: number;
};

const MARGIN = { left: 58, right: 14, top: 18, bottom: 30 };

/** Round tick steps (1, 2, 5 × 10^n) across a range. */
export function niceTicks(min: number, max: number, count = 5): number[] {
  const span = max - min || 1;
  const rough = span / count;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const normalised = rough / magnitude;
  const step =
    (normalised < 1.5 ? 1 : normalised < 3 ? 2 : normalised < 7 ? 5 : 10) * magnitude;
  const ticks: number[] = [];
  for (let value = Math.ceil(min / step) * step; value <= max + step * 1e-6; value += step) {
    ticks.push(Math.abs(value) < step * 1e-6 ? 0 : value);
  }
  return ticks;
}

function useWidth<T extends HTMLElement>(fallback: number) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.max(260, Math.round(entry.contentRect.width)));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

function nearest(points: Point[], x: number): Point {
  let low = 0;
  let high = points.length - 1;
  while (high - low > 1) {
    const mid = (low + high) >> 1;
    if (points[mid][0] < x) low = mid;
    else high = mid;
  }
  return Math.abs(points[low][0] - x) <= Math.abs(points[high][0] - x)
    ? points[low]
    : points[high];
}

export function Plot({
  title,
  series,
  xLabel,
  formatX,
  formatY,
  hint,
  markers = [],
  yDomain,
  includeZero = true,
  endDot = false,
  height = 260,
}: PlotProps) {
  const [wrapRef, width] = useWidth<HTMLDivElement>(680);
  const [hoverX, setHoverX] = useState<number | null>(null);

  const all = series.flatMap((s) => s.points);
  const xs = series[0].points.map(([x]) => x);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);

  let [yMin, yMax] = yDomain ?? [
    Math.min(...all.map(([, y]) => y)),
    Math.max(...all.map(([, y]) => y)),
  ];
  if (includeZero) {
    yMin = Math.min(yMin, 0);
    yMax = Math.max(yMax, 0);
  }
  if (!yDomain) {
    const pad = (yMax - yMin || Math.abs(yMax) || 1) * 0.08;
    yMin -= pad;
    yMax += pad;
  }

  const innerW = width - MARGIN.left - MARGIN.right;
  const innerH = height - MARGIN.top - MARGIN.bottom;
  const sx = (x: number) => MARGIN.left + ((x - xMin) / (xMax - xMin || 1)) * innerW;
  const sy = (y: number) =>
    MARGIN.top + ((yMax - Math.min(Math.max(y, yMin), yMax)) / (yMax - yMin || 1)) * innerH;
  const path = (points: Point[]) =>
    points.map(([x, y], i) => `${i ? "L" : "M"}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join("");

  const yTicks = niceTicks(yMin, yMax, 4).filter((t) => t >= yMin && t <= yMax);
  const xTicks = niceTicks(xMin, xMax, Math.max(3, Math.round(innerW / 110)));

  function track(event: ReactPointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width) * width;
    const x = xMin + ((px - MARGIN.left) / innerW) * (xMax - xMin);
    setHoverX(Math.min(Math.max(x, xMin), xMax));
  }

  const hovered =
    hoverX === null ? null : series.map((s) => ({ s, point: nearest(s.points, hoverX) }));
  const primary = series[0].points;
  const last = primary[primary.length - 1];

  return (
    <figure className="lab__plot" ref={wrapRef}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={title}
        onPointerMove={track}
        onPointerDown={track}
        onPointerLeave={() => setHoverX(null)}
      >
        {yTicks.map((tick) => (
          <g key={`y${tick}`}>
            <line
              x1={MARGIN.left}
              x2={width - MARGIN.right}
              y1={sy(tick)}
              y2={sy(tick)}
              className={tick === 0 ? "lab__axis-zero" : "lab__grid"}
            />
            <text x={MARGIN.left - 8} y={sy(tick) + 4} textAnchor="end" className="lab__tick">
              {formatY(tick)}
            </text>
          </g>
        ))}
        {xTicks.map((tick) => (
          <text
            key={`x${tick}`}
            x={sx(tick)}
            y={height - 8}
            textAnchor={sx(tick) > width - 40 ? "end" : "middle"}
            className="lab__tick"
          >
            {formatX(tick)}
          </text>
        ))}
        {markers.map((marker, index) => (
          <g key={`m${marker.label}`}>
            <line
              x1={sx(marker.x)}
              x2={sx(marker.x)}
              y1={MARGIN.top}
              y2={height - MARGIN.bottom}
              className="lab__marker"
            />
            <text
              x={sx(marker.x) + 5}
              y={MARGIN.top + 10 + index * 13}
              className="lab__tick lab__marker-label"
            >
              {marker.label}
            </text>
          </g>
        ))}
        {series
          .slice()
          .reverse()
          .map((s) => (
            <path
              key={s.label}
              d={path(s.points)}
              className={`lab__line lab__line--${s.tone ?? "accent"}${s.dashed ? " lab__line--dashed" : ""}`}
            />
          ))}
        {endDot && last ? <circle cx={sx(last[0])} cy={sy(last[1])} r={4} className="lab__dot" /> : null}
        {hovered ? (
          <g>
            <line
              x1={sx(hovered[0].point[0])}
              x2={sx(hovered[0].point[0])}
              y1={MARGIN.top}
              y2={height - MARGIN.bottom}
              className="lab__guide"
            />
            {hovered.map(({ s, point }) => (
              <circle
                key={s.label}
                cx={sx(point[0])}
                cy={sy(point[1])}
                r={4}
                className={`lab__hover-dot lab__hover-dot--${s.tone ?? "accent"}`}
              />
            ))}
          </g>
        ) : null}
      </svg>
      <figcaption className="lab__readout tnum">
        {hovered ? (
          <>
            <span>
              {xLabel} {formatX(hovered[0].point[0])}
            </span>
            {hovered.map(({ s, point }) => (
              <span key={s.label} className={`lab__key lab__key--${s.tone ?? "accent"}`}>
                {s.label} {formatY(point[1])}
              </span>
            ))}
          </>
        ) : (
          <>
            {series.map((s) => (
              <span
                key={s.label}
                className={`lab__key lab__key--${s.tone ?? "accent"}${s.dashed ? " lab__key--dashed" : ""}`}
              >
                {s.label}
              </span>
            ))}
            <span className="lab__hint">{hint}</span>
          </>
        )}
      </figcaption>
    </figure>
  );
}
