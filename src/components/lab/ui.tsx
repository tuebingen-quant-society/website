"use client";

/**
 * Building blocks of the interactive article widgets: the panel frame, range
 * sliders, segmented buttons, stat tiles, mission checklists, a small SVG line
 * plot and the animation hooks behind playback and morphing. Colours and type
 * come from the site tokens, so every widget follows the theme.
 */
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import type { Locale } from "@/i18n";
import type { MissionView } from "./workshop";

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

/* ------------------------------------------------------------ Motion */

/** True when the reader asked the OS for less motion. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

const easeOut = (t: number) => 1 - (1 - t) ** 3;

/**
 * A 0 → 1 clock for "play" buttons. With reduced motion it jumps straight to
 * the end, so every animation still lands on its final state.
 */
export function usePlayback(duration: number) {
  const reduced = useReducedMotion();
  const [t, setT] = useState(1);
  const [playing, setPlaying] = useState(false);
  const frame = useRef(0);

  const stop = useCallback(() => {
    cancelAnimationFrame(frame.current);
    setPlaying(false);
  }, []);

  const play = useCallback(
    (onDone?: () => void) => {
      cancelAnimationFrame(frame.current);
      if (reduced) {
        setT(1);
        setPlaying(false);
        onDone?.();
        return;
      }
      const start = performance.now();
      setT(0);
      setPlaying(true);
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        setT(progress);
        if (progress < 1) frame.current = requestAnimationFrame(tick);
        else {
          setPlaying(false);
          onDone?.();
        }
      };
      frame.current = requestAnimationFrame(tick);
    },
    [duration, reduced],
  );

  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  return { t, playing, play, stop, setT };
}

/**
 * Morph a line to its new shape whenever `key` changes (a new strategy, a new
 * random path). Slider moves keep the same key and update instantly, so the
 * curve never lags behind the thumb.
 */
export function useTweened(points: Point[], key: string | number, duration = 420): Point[] {
  const reduced = useReducedMotion();
  const [frameValue, setFrameValue] = useState<Point[] | null>(null);
  const shown = useRef(points);
  const target = useRef(points);
  const lastKey = useRef(key);
  const raf = useRef(0);
  target.current = points;

  useEffect(() => {
    if (lastKey.current === key) return;
    lastKey.current = key;
    const from = shown.current;
    if (reduced || from.length !== target.current.length) return;
    cancelAnimationFrame(raf.current);
    const start = performance.now();
    const tick = (now: number) => {
      const progress = easeOut(Math.min(1, (now - start) / duration));
      const next = target.current.map(
        ([x, y], i): Point => [x, from[i][1] + (y - from[i][1]) * progress],
      );
      if (progress < 1) {
        setFrameValue(next);
        raf.current = requestAnimationFrame(tick);
      } else setFrameValue(null);
    };
    raf.current = requestAnimationFrame(tick);
  }, [key, duration, reduced]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const result = frameValue ?? points;
  useLayoutEffect(() => {
    shown.current = result;
  });
  return result;
}

/* ------------------------------------------------------------ Frame */

type LabProps = {
  title: string;
  caption?: ReactNode;
  children: ReactNode;
  /** Shown right under the title bar: what to try in this lab. */
  missions?: { title: string; items: MissionView[] };
};

/** The terminal-style panel every widget sits in. */
export function Lab({ title, caption, children, missions }: LabProps) {
  return (
    <section className="lab panel" aria-label={title}>
      <div className="lab__bar" aria-hidden="true">
        <span className="plot__dots">
          <i className="plot__dot plot__dot--r" />
          <i className="plot__dot plot__dot--y" />
          <i className="plot__dot plot__dot--g" />
        </span>
        <span className="plot__title">{title}</span>
        {missions ? (
          <span className="lab__score tnum">
            {missions.items.filter((m) => m.done).length}/{missions.items.length}
          </span>
        ) : null}
      </div>
      {missions ? <Missions title={missions.title} items={missions.items} /> : null}
      <div className="lab__body">{children}</div>
      {caption ? <p className="lab__caption">{caption}</p> : null}
    </section>
  );
}

/** The "try this" list. Items tick themselves off as the reader gets there. */
export function Missions({ title, items }: { title: string; items: MissionView[] }) {
  const done = items.filter((m) => m.done).length;
  return (
    <div className="lab__missions">
      <p className="lab__missions-head">
        <span>{title}</span>
        <span className="lab__missions-meter" aria-hidden="true">
          <span style={{ width: `${(done / items.length) * 100}%` }} />
        </span>
      </p>
      <ul className="lab__mission-list" role="list">
        {items.map((mission) => (
          <li
            key={mission.id}
            className={`lab__mission${mission.done ? " is-done" : ""}${mission.fresh ? " is-fresh" : ""}`}
          >
            <svg className="lab__check" viewBox="0 0 20 20" aria-hidden="true">
              <circle cx="10" cy="10" r="8.5" />
              <path d="M6 10.4l2.6 2.6L14 7.6" />
            </svg>
            <span>{mission.label}</span>
            <span className="sr-only">{mission.done ? " ✓" : ""}</span>
          </li>
        ))}
      </ul>
    </div>
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
  const fill = ((value - min) / (max - min || 1)) * 100;
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
        style={{ "--fill": `${Math.min(100, Math.max(0, fill))}%` } as CSSProperties}
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
  size?: "small";
};

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  size,
}: SegmentedProps<T>) {
  return (
    <div
      className={`lab__segmented${size ? ` lab__segmented--${size}` : ""}`}
      role="group"
      aria-label={label}
    >
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

/** The one button that starts an animation; shows a play or replay glyph. */
export function PlayButton({
  label,
  onClick,
  playing,
  disabled,
}: {
  label: string;
  onClick: () => void;
  playing?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className="btn btn--secondary lab__button lab__play"
      onClick={onClick}
      disabled={disabled || playing}
      data-playing={playing || undefined}
    >
      <svg viewBox="0 0 16 16" aria-hidden="true" className="lab__play-glyph">
        <path d="M4.5 2.8v10.4L13 8z" />
      </svg>
      {label}
    </button>
  );
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

export type Tone = "accent" | "muted" | "warm" | "up" | "down";

export type Series = {
  label: string;
  points: Point[];
  tone?: Tone;
  dashed?: boolean;
};

export type Marker = {
  x: number;
  label: string;
  /** Makes the marker a handle the reader can drag along the x axis. */
  onDrag?: (x: number) => void;
  min?: number;
  max?: number;
  step?: number;
};

type PlotProps = {
  title: string;
  series: Series[];
  xLabel: string;
  formatX: (value: number) => string;
  formatY: (value: number) => string;
  hint: string;
  markers?: Marker[];
  /** Horizontal reference lines, e.g. a liquidation price. */
  levels?: { y: number; label: string; tone?: Tone }[];
  /** A shaded x range, e.g. the zone where funding stays flat. */
  bands?: { from: number; to: number; label?: string }[];
  dots?: { x: number; y: number; tone?: Tone; label?: string; pulse?: boolean; anchor?: "start" | "end" }[];
  xDomain?: [number, number];
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

export function useWidth<T extends HTMLElement>(fallback: number) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      const next = Math.round(entry.contentRect.width);
      // Hidden workshop modules measure 0; keep the last real width.
      if (next > 0) setWidth(Math.max(260, next));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

function nearest(points: Point[], x: number): Point | null {
  if (!points.length) return null;
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

const clamp = (value: number, low: number, high: number) =>
  Math.min(Math.max(value, low), high);

export function Plot({
  title,
  series,
  xLabel,
  formatX,
  formatY,
  hint,
  markers = [],
  levels = [],
  bands = [],
  dots = [],
  xDomain,
  yDomain,
  includeZero = true,
  endDot = false,
  height = 260,
}: PlotProps) {
  const [wrapRef, width] = useWidth<HTMLDivElement>(680);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);

  const all = series.flatMap((s) => s.points);
  const xs = series[0].points.map(([x]) => x);
  const [xMin, xMax] = xDomain ?? [Math.min(...xs), Math.max(...xs)];

  let [yMin, yMax] = yDomain ?? (all.length
    ? [Math.min(...all.map(([, y]) => y)), Math.max(...all.map(([, y]) => y))]
    : [0, 1]);
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
  // Coordinates are rounded so server and browser render identical markup
  // even when their Math.exp/log differ in the last bits.
  const round = (v: number) => Math.round(v * 10) / 10;
  const sx = (x: number) => round(MARGIN.left + ((x - xMin) / (xMax - xMin || 1)) * innerW);
  const sy = (y: number) =>
    round(MARGIN.top + ((yMax - clamp(y, yMin, yMax)) / (yMax - yMin || 1)) * innerH);
  const path = (points: Point[]) =>
    points.map(([x, y], i) => `${i ? "L" : "M"}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join("");

  const yTicks = niceTicks(yMin, yMax, 4).filter((t) => t >= yMin && t <= yMax);
  const xTicks = niceTicks(xMin, xMax, Math.max(3, Math.round(innerW / 110))).filter(
    (t) => t >= xMin && t <= xMax,
  );

  function toDataX(event: ReactPointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width) * width;
    return { px, x: clamp(xMin + ((px - MARGIN.left) / innerW) * (xMax - xMin), xMin, xMax) };
  }

  function moveMarker(index: number, x: number) {
    const marker = markers[index];
    if (!marker?.onDrag) return;
    const step = marker.step ?? 1;
    const snapped = Math.round(x / step) * step;
    marker.onDrag(clamp(snapped, marker.min ?? xMin, marker.max ?? xMax));
  }

  // Draggable markers stack their grips, so two handles at the same x
  // (spot and strike at the money) stay separately grabbable.
  const gripRow = new Map<number, number>();
  markers.forEach((m, i) => {
    if (m.onDrag) gripRow.set(i, gripRow.size);
  });
  const gripY = (index: number) => MARGIN.top - 2 + (gripRow.get(index) ?? 0) * 24;

  function onPointerDown(event: ReactPointerEvent<SVGSVGElement>) {
    const { px, x } = toDataX(event);
    const rect = event.currentTarget.getBoundingClientRect();
    const py = ((event.clientY - rect.top) / rect.height) * height;
    const reach = event.pointerType === "touch" ? 26 : 14;
    const near = markers
      .map((m, i) => ({ m, i }))
      .filter(({ m }) => m.onDrag && Math.abs(sx(m.x) - px) <= reach)
      .sort((a, b) => Math.abs(gripY(a.i) + 10 - py) - Math.abs(gripY(b.i) + 10 - py));
    const hit = near.length ? near[0].i : -1;
    if (hit >= 0) {
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(hit);
      moveMarker(hit, x);
      return;
    }
    setHoverX(x);
  }

  function onPointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    const { x } = toDataX(event);
    if (dragging !== null) moveMarker(dragging, x);
    else setHoverX(x);
  }

  function onHandleKey(index: number, event: ReactKeyboardEvent<SVGGElement>) {
    const marker = markers[index];
    const step = marker.step ?? 1;
    const delta =
      event.key === "ArrowRight" || event.key === "ArrowUp"
        ? step
        : event.key === "ArrowLeft" || event.key === "ArrowDown"
          ? -step
          : 0;
    if (!delta) return;
    event.preventDefault();
    moveMarker(index, marker.x + delta);
  }

  const showHover = hoverX !== null && dragging === null;
  const hovered = showHover
    ? series
        .map((s) => ({ s, point: nearest(s.points, hoverX) }))
        .filter((h): h is { s: Series; point: Point } => h.point !== null)
    : [];
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
        className={dragging !== null ? "is-dragging" : undefined}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={() => setDragging(null)}
        onPointerCancel={() => setDragging(null)}
        onPointerLeave={() => {
          if (dragging === null) setHoverX(null);
        }}
      >
        {bands.map((band) => (
          <g key={`b${band.from}`}>
            <rect
              x={sx(band.from)}
              y={MARGIN.top}
              width={Math.max(0, sx(band.to) - sx(band.from))}
              height={innerH}
              className="lab__band"
            />
            {band.label ? (
              <text
                x={(sx(band.from) + sx(band.to)) / 2}
                y={height - MARGIN.bottom - 6}
                textAnchor="middle"
                className="lab__tick lab__band-label"
              >
                {band.label}
              </text>
            ) : null}
          </g>
        ))}
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
        {levels.map((level) => (
          <g key={`l${level.label}`}>
            <line
              x1={MARGIN.left}
              x2={width - MARGIN.right}
              y1={sy(level.y)}
              y2={sy(level.y)}
              className={`lab__level lab__level--${level.tone ?? "muted"}`}
            />
            <text
              x={width - MARGIN.right - 4}
              y={sy(level.y) - 6}
              textAnchor="end"
              className={`lab__tick lab__level-label lab__level-label--${level.tone ?? "muted"}`}
            >
              {level.label}
            </text>
          </g>
        ))}
        {markers.map((marker, index) => (
          <g key={`m${marker.label}`} className={marker.onDrag ? "lab__handle" : undefined}>
            <line
              x1={sx(marker.x)}
              x2={sx(marker.x)}
              y1={MARGIN.top}
              y2={height - MARGIN.bottom}
              className={marker.onDrag ? "lab__marker lab__marker--live" : "lab__marker"}
            />
            {marker.onDrag ? (
              <g
                tabIndex={0}
                role="slider"
                aria-label={marker.label}
                aria-valuemin={marker.min ?? xMin}
                aria-valuemax={marker.max ?? xMax}
                aria-valuenow={marker.x}
                aria-valuetext={formatX(marker.x)}
                onKeyDown={(event) => onHandleKey(index, event)}
                className="lab__handle-knob"
              >
                <rect
                  x={sx(marker.x) - 16}
                  y={gripY(index)}
                  width={32}
                  height={20}
                  rx={10}
                />
                <text x={sx(marker.x)} y={gripY(index) + 14} textAnchor="middle">
                  {marker.label}
                </text>
              </g>
            ) : (
              <text
                x={sx(marker.x) + 5}
                y={MARGIN.top + 10 + index * 13}
                className="lab__tick lab__marker-label"
              >
                {marker.label}
              </text>
            )}
          </g>
        ))}
        {series
          .slice()
          .reverse()
          .map((s) =>
            s.points.length ? (
              <path
                key={s.label}
                d={path(s.points)}
                className={`lab__line lab__line--${s.tone ?? "accent"}${s.dashed ? " lab__line--dashed" : ""}`}
              />
            ) : null,
          )}
        {endDot && last ? <circle cx={sx(last[0])} cy={sy(last[1])} r={4} className="lab__dot" /> : null}
        {dots.map((dot, i) => (
          <g key={`d${i}`}>
            {dot.pulse ? (
              <circle cx={sx(dot.x)} cy={sy(dot.y)} r={6} className={`lab__pulse lab__pulse--${dot.tone ?? "accent"}`} />
            ) : null}
            <circle
              cx={sx(dot.x)}
              cy={sy(dot.y)}
              r={5}
              className={`lab__hover-dot lab__hover-dot--${dot.tone ?? "accent"}`}
            />
            {dot.label ? (
              <text
                x={sx(dot.x) + ((dot.anchor ?? (sx(dot.x) > width - 80 ? "end" : "start")) === "end" ? -9 : 9)}
                y={sy(dot.y) - 9}
                textAnchor={dot.anchor ?? (sx(dot.x) > width - 80 ? "end" : "start")}
                className="lab__tick lab__dot-label"
              >
                {dot.label}
              </text>
            ) : null}
          </g>
        ))}
        {hovered.length ? (
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
        {hovered.length ? (
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
