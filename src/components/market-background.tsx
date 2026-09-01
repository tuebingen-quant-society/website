"use client";

import { useEffect, useRef } from "react";
import { useThemeChange } from "@/hooks/use-theme-change";

type Series = {
  points: number[];
  value: number;
  anchor: number;
  volatility: number;
  speed: number;
  offset: number;
  stroke: string;
  alpha: number;
  width: number;
  fill: boolean;
};

const DX = 7;

function gaussian() {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function MarketBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const themeVersion = useThemeChange();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const parent = canvas?.parentElement;
    if (!canvas || !context || !parent) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const css = getComputedStyle(document.documentElement);
    const color = (name: string, fallback: string) =>
      css.getPropertyValue(name).trim() || fallback;
    const palette = [
      [color("--accent", "#ff5c72"), 0.5, 1.6, true],
      [color("--up", "#2fbf8f"), 0.32, 1.2, false],
      [color("--market-muted", "#8fa0b4"), 0.16, 1, false],
      [color("--market-muted", "#8fa0b4"), 0.12, 1, false],
      [color("--accent", "#ff5c72"), 0.14, 1, false],
    ] as const;

    let width = 0;
    let height = 0;
    let series: Series[] = [];
    let frameId = 0;
    let running = false;
    let last = 0;

    const next = (line: Series) => {
      line.value += line.volatility * gaussian() + (line.anchor - line.value) * 0.02;
      line.value = Math.min(0.92, Math.max(0.08, line.value));
      return line.value;
    };

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const pointCount = Math.ceil(width / DX) + 3;
      series = palette.map(([stroke, alpha, lineWidth, fill], index) => {
        const anchor = 0.25 + (0.55 * index) / (palette.length - 1);
        const line: Series = {
          points: [],
          value: anchor,
          anchor,
          volatility: 0.014 + Math.random() * 0.012,
          speed: 0.008 + Math.random() * 0.008,
          offset: 0,
          stroke,
          alpha,
          width: lineWidth,
          fill,
        };
        for (let i = 0; i < pointCount; i += 1) line.points.push(next(line));
        return line;
      });
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      for (const line of series) {
        context.save();
        context.translate(-line.offset, 0);
        context.globalAlpha = line.alpha;
        context.strokeStyle = line.stroke;
        context.lineWidth = line.width;
        context.beginPath();
        line.points.forEach((point, index) => {
          const x = index * DX;
          const y = point * height;
          if (index === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        });
        context.stroke();
        if (line.fill) {
          context.globalAlpha = 0.05;
          context.lineTo((line.points.length - 1) * DX, height);
          context.lineTo(0, height);
          context.closePath();
          context.fillStyle = line.stroke;
          context.fill();
        }
        context.restore();
      }
    };

    const frame = (time: number) => {
      if (!running) return;
      const elapsed = Math.min(time - last, 100);
      last = time;
      for (const line of series) {
        line.offset += line.speed * elapsed;
        while (line.offset >= DX) {
          line.offset -= DX;
          line.points.push(next(line));
          line.points.shift();
        }
      }
      draw();
      frameId = requestAnimationFrame(frame);
    };
    const start = () => {
      if (running || reduced) return;
      running = true;
      last = performance.now();
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
    const visibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", visibility);

    return () => {
      stop();
      observer.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [themeVersion]);

  return <canvas className="market-bg" ref={canvasRef} aria-hidden="true" />;
}
