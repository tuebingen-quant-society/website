"use client";

import { useEffect, useRef, useState } from "react";
import { plotParams } from "@/config";
import { content, type Locale } from "@/i18n";
import { useThemeChange } from "@/hooks/use-theme-change";

type Candle = { open: number; high: number; low: number; close: number };

const MAX_CANDLES = 64;
const SUBTICKS = 6;
const EMA_WEIGHT = 2 / 15;

function gaussian() {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

type Readout = { text: string; dir: "up" | "down" };

export function SignaturePlot({ locale }: { locale: Locale }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [readout, setReadout] = useState<Readout>({ text: "—", dir: "up" });
  const [reduced, setReduced] = useState(false);
  const translated = content[locale].plot;
  const themeVersion = useThemeChange();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(prefersReduced);
    const css = getComputedStyle(document.documentElement);
    const color = (name: string, fallback: string) =>
      css.getPropertyValue(name).trim() || fallback;
    const colors = {
      up: color("--up", "#2fbf8f"),
      down: color("--down", "#f4506a"),
      grid: color("--rule", "#1f2733"),
      text: color("--ink-muted", "#9aa5b2"),
      accent: color("--accent", "#ff5c72"),
    };

    let price = 100;
    let subtick = 0;
    let previousEma = price;
    let width = 0;
    let height = 0;
    let frameId = 0;
    let running = false;
    let lastFrame = 0;
    let accumulator = 0;
    const candles: Candle[] = [];
    const averages: number[] = [];
    const drift = (0.08 - (0.2 * 0.2) / 2) / 252;
    const shock = 0.2 * Math.sqrt(1 / 252);

    const openCandle = () => {
      previousEma = averages.at(-1) ?? price;
      candles.push({ open: price, high: price, low: price, close: price });
      averages.push(previousEma);
      if (candles.length > MAX_CANDLES) {
        candles.shift();
        averages.shift();
      }
      subtick = 0;
    };
    const tick = () => {
      price *= Math.exp(drift + shock * gaussian());
      const candle = candles.at(-1);
      if (!candle) return;
      candle.close = price;
      candle.high = Math.max(candle.high, price);
      candle.low = Math.min(candle.low, price);
      averages[averages.length - 1] =
        previousEma + EMA_WEIGHT * (candle.close - previousEma);
      subtick += 1;
      if (subtick >= SUBTICKS) openCandle();
    };

    openCandle();
    for (let i = 0; i < MAX_CANDLES * SUBTICKS; i += 1) tick();
    const sessionOpen = candles[0].open;

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      const low = Math.min(...candles.map((candle) => candle.low));
      const high = Math.max(...candles.map((candle) => candle.high));
      const padding = (high - low) * 0.12 || 1;
      const minimum = low - padding;
      const maximum = high + padding;
      const axisWidth = 58;
      const plotWidth = width - axisWidth;
      const candleWidth = plotWidth / MAX_CANDLES;
      const y = (value: number) =>
        14 + (1 - (value - minimum) / (maximum - minimum)) * (height - 26);

      context.clearRect(0, 0, width, height);
      context.font = "10px 'IBM Plex Mono', monospace";
      context.textBaseline = "middle";
      for (let row = 0; row <= 4; row += 1) {
        const value = minimum + ((maximum - minimum) * row) / 4;
        const rowY = y(value);
        context.strokeStyle = colors.grid;
        context.beginPath();
        context.moveTo(0, rowY);
        context.lineTo(plotWidth, rowY);
        context.stroke();
        context.fillStyle = colors.text;
        context.fillText(value.toFixed(1), plotWidth + 8, rowY);
      }
      candles.forEach((candle, index) => {
        const x = index * candleWidth + candleWidth / 2;
        const candleColor = candle.close >= candle.open ? colors.up : colors.down;
        context.strokeStyle = candleColor;
        context.beginPath();
        context.moveTo(x, y(candle.high));
        context.lineTo(x, y(candle.low));
        context.stroke();
        context.fillStyle = candleColor;
        context.fillRect(
          x - Math.max(2, candleWidth * 0.58) / 2,
          Math.min(y(candle.open), y(candle.close)),
          Math.max(2, candleWidth * 0.58),
          Math.max(1, Math.abs(y(candle.close) - y(candle.open))),
        );
      });
      context.strokeStyle = colors.accent;
      context.lineWidth = 1.6;
      context.beginPath();
      averages.forEach((average, index) => {
        const x = index * candleWidth + candleWidth / 2;
        if (index === 0) context.moveTo(x, y(average));
        else context.lineTo(x, y(average));
      });
      context.stroke();

      const delta = ((price - sessionOpen) / sessionOpen) * 100;
      const up = delta >= 0;
      setReadout({
        text: `${price.toFixed(2)} ${up ? "▲" : "▼"} ${up ? "+" : ""}${delta.toFixed(2)}%`,
        dir: up ? "up" : "down",
      });
    };

    const frame = (time: number) => {
      if (!running) return;
      accumulator += Math.min(time - lastFrame, 200);
      lastFrame = time;
      while (accumulator >= 140) {
        accumulator -= 140;
        tick();
      }
      draw();
      frameId = requestAnimationFrame(frame);
    };
    const start = () => {
      if (running || prefersReduced) return;
      running = true;
      lastFrame = performance.now();
      frameId = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frameId);
    };
    const resize = () => {
      fit();
      draw();
    };

    resize();
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) start();
      else stop();
    });
    observer.observe(canvas);
    window.addEventListener("resize", resize);
    return () => {
      stop();
      observer.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [themeVersion]);

  return (
    <figure className="panel plot" role="img" aria-label={translated.ariaLabel}>
      <div className="plot__bar" aria-hidden="true">
        <span className="plot__dots">
          <i className="plot__dot plot__dot--r" />
          <i className="plot__dot plot__dot--y" />
          <i className="plot__dot plot__dot--g" />
        </span>
        <span className="plot__title">{plotParams.titel}</span>
        {!reduced && (
          <span className="plot__live">
            <i className="plot__pulse" />
            {plotParams.live}
          </span>
        )}
      </div>
      <canvas className="plot__canvas" ref={canvasRef} />
      <figcaption className="plot__meta" aria-hidden="true">
        <span className="plot__params">{plotParams.params}</span>
        <span className={`plot__last is-${readout.dir}`}>{readout.text}</span>
        <span className="plot__note">{translated.hinweis}</span>
      </figcaption>
    </figure>
  );
}
