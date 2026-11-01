"use client";

import { useMemo, useState, type CSSProperties } from "react";
import type { Locale } from "@/i18n";
import {
  DAYS_PER_YEAR,
  fundingRate,
  liquidationPrice,
  touchProbability,
  type Side,
} from "@/lib/derivatives";
import { pricePath } from "./futures";
import {
  Controls,
  Lab,
  money,
  num,
  pct,
  PlayButton,
  Plot,
  Segmented,
  signed,
  Slider,
  Stat,
  Stats,
  toneOf,
  usePlayback,
  Verdict,
  type Point,
} from "./ui";
import { useMissions } from "./workshop";

const SPOT = 100;
const POSITION = 10_000;

/* ------------------------------------------------------------ Funding */

const fundingCopy = {
  de: {
    title: "FUNDING · WER ZAHLT AN WEN",
    missions: "Aufgaben",
    mFlat: "Finde die Zone, in der das Funding genau 0,01 % beträgt.",
    mNegative: "Lass die Shorts an die Longs zahlen.",
    mHot: "Treib das Funding über 100 % p. a.",
    premium: "Perp gegenüber Spot (Premium)",
    interval: "Zahlungstakt",
    every8: "Alle 8 h",
    hourly: "Stündlich",
    longs: "Longs",
    shorts: "Shorts",
    perPayment: (amount: string, every: string) => `${amount} ${every}`,
    every8Short: "pro 8 h",
    hourlyShort: "pro Stunde",
    rate: "Funding pro 8 h",
    payment: "Zahlung auf 10.000 $",
    annual: "Annualisiert",
    curve: "Funding nach Premium",
    flat: "fest",
    premiumAxis: "Premium",
    hint: "Zieh den Regler P im Diagramm",
    positive: "Der Perp notiert über Spot. Longs zahlen an Shorts; Long-Sein wird teurer, der Preis wird zurückgedrückt.",
    negative: "Der Perp notiert unter Spot. Shorts zahlen an Longs; Short-Sein wird teurer.",
    neutral: "Kein Funding: Perp und Spot liegen gleichauf.",
    caption:
      "Regel wie bei Binance und BitMEX: Funding = P + clamp(0,01 % − P, ±0,05 %). Bei stündlicher Zahlung gibt es pro Stunde ein Achtel des 8-Stunden-Satzes.",
  },
  en: {
    title: "FUNDING · WHO PAYS WHOM",
    missions: "Try this",
    mFlat: "Find the zone where funding is exactly 0.01%.",
    mNegative: "Make the shorts pay the longs.",
    mHot: "Push funding above 100% p.a.",
    premium: "Perp versus spot (premium)",
    interval: "Payment interval",
    every8: "Every 8 h",
    hourly: "Hourly",
    longs: "Longs",
    shorts: "Shorts",
    perPayment: (amount: string, every: string) => `${amount} ${every}`,
    every8Short: "per 8 h",
    hourlyShort: "per hour",
    rate: "Funding per 8 h",
    payment: "Payment on $10,000",
    annual: "Annualised",
    curve: "Funding by premium",
    flat: "flat",
    premiumAxis: "Premium",
    hint: "Drag the P handle on the chart",
    positive: "The perp trades above spot. Longs pay shorts; being long gets more expensive and the price is pushed back.",
    negative: "The perp trades below spot. Shorts pay longs; being short gets more expensive.",
    neutral: "No funding: perp and spot are level.",
    caption:
      "Rule as on Binance and BitMEX: funding = P + clamp(0.01% − P, ±0.05%). With hourly payments each hour pays one eighth of the 8-hour rate.",
  },
} as const;

/** Premium in percent, as the slider and the chart show it. */
const PREMIUM_STEPS = Array.from({ length: 121 }, (_, i) => -0.3 + i * 0.005);

export function FundingLab({ lang = "de" }: { lang?: Locale }) {
  const t = fundingCopy[lang];
  const [premium, setPremium] = useState(0.1);
  const [interval, setPayEvery] = useState<"8h" | "1h">("8h");

  const rate = fundingRate(premium / 100);
  const payment = (POSITION * rate) / (interval === "8h" ? 1 : 8);
  const annual = rate * 3 * DAYS_PER_YEAR;
  const curve = useMemo(
    () => PREMIUM_STEPS.map((p): Point => [p, fundingRate(p / 100) * 100]),
    [],
  );

  const direction = rate > 1e-9 ? "right" : rate < -1e-9 ? "left" : "none";
  const drops = Math.min(10, Math.max(1, Math.round(Math.abs(rate) / 0.0003 + 1)));
  const fmtP = (v: number) => (lang === "de" ? `${num(lang, v, 2)} %` : `${num(lang, v, 2)}%`);

  const missions = useMissions("funding", [
    { id: "flat", label: t.mFlat, done: Math.abs(rate - 0.0001) < 1e-8 },
    { id: "negative", label: t.mNegative, done: rate < -1e-9 },
    { id: "hot", label: t.mHot, done: annual > 1 },
  ]);

  return (
    <Lab title={t.title} caption={t.caption} missions={{ title: t.missions, items: missions }}>
      <div
        className="lab__flow"
        data-direction={direction}
        style={{ "--drops": drops } as CSSProperties}
      >
        <span className={`lab__flow-side${direction === "right" ? " is-paying" : ""}`}>{t.longs}</span>
        <span className="lab__flow-track" aria-hidden="true">
          {direction === "none"
            ? null
            : Array.from({ length: drops }, (_, i) => (
                <i key={`${direction}${drops}${i}`} style={{ animationDelay: `${(-i * 1.6) / drops}s` }} />
              ))}
        </span>
        <span className={`lab__flow-side${direction === "left" ? " is-paying" : ""}`}>{t.shorts}</span>
        <span className="lab__flow-amount tnum" aria-live="polite">
          {direction === "none"
            ? "0"
            : t.perPayment(
                money(lang, Math.abs(payment), 2),
                interval === "8h" ? t.every8Short : t.hourlyShort,
              )}
        </span>
      </div>
      <Verdict tone={direction === "none" ? undefined : direction === "right" ? "up" : "down"}>
        {direction === "right" ? t.positive : direction === "left" ? t.negative : t.neutral}
      </Verdict>
      <Plot
        title={t.curve}
        series={[{ label: t.curve, points: curve }]}
        xLabel={t.premiumAxis}
        formatX={fmtP}
        formatY={fmtP}
        hint={t.hint}
        bands={[{ from: -0.04, to: 0.06, label: t.flat }]}
        markers={[{ x: premium, label: "P", onDrag: setPremium, step: 0.005, min: -0.3, max: 0.3 }]}
        dots={[{ x: premium, y: rate * 100 }]}
        height={220}
      />
      <Stats>
        <Stat label={t.rate} value={pct(lang, rate, 3, true)} tone={toneOf(rate)} />
        <Stat label={t.payment} value={money(lang, payment, 2, true)} />
        <Stat label={t.annual} value={pct(lang, annual, 1, true)} tone={toneOf(annual)} emphasis />
      </Stats>
      <Controls>
        <Slider label={t.premium} value={premium} min={-0.3} max={0.3} step={0.005} onChange={setPremium} format={(v) => (lang === "de" ? `${signed(lang, v, 3)} %` : `${signed(lang, v, 3)}%`)} />
        <div className="lab__control">
          <span className="lab__control-head">{t.interval}</span>
          <Segmented
            label={t.interval}
            value={interval}
            onChange={setPayEvery}
            size="small"
            options={[
              { value: "8h", label: t.every8 },
              { value: "1h", label: t.hourly },
            ]}
          />
        </div>
      </Controls>
    </Lab>
  );
}

/* ------------------------------------------------------------ Liquidation */

const liqCopy = {
  de: {
    title: "HEBEL · LIQUIDATION",
    missions: "Aufgaben",
    mLiq: "Lass dich einmal liquidieren.",
    mSafe: "Finde einen Hebel mit unter 10 % Risiko in 30 Tagen.",
    mRuns: "Starte fünf Stresstests und vergleich mit dem Modell.",
    side: "Richtung",
    long: "Long",
    short: "Short",
    view: "Ansicht",
    stress: "Stresstest",
    curveView: "Hebel-Kurve",
    leverage: "Hebel",
    maintenance: "Maintenance Margin",
    vol: "Volatilität p. a.",
    liq: "Liquidation bei",
    distance: "Abstand",
    sigmas: "Tagesbewegungen",
    touch30: "Risiko in 30 Tagen",
    run: "30 Tage simulieren",
    entry: "Einstieg",
    liqLine: "Liquidation",
    day: "Tag",
    price: "Kurs",
    hint: "Fahr über das Diagramm",
    survived: "Überlebt: 30 Tage ohne Liquidation.",
    liquidated: (day: string) => `Liquidiert an Tag ${day}. Deine Margin ist weg.`,
    waiting: "Starte einen Lauf: ein zufälliger Kursverlauf über 30 Tage.",
    tally: (hits: number, runs: number, model: string) =>
      `Bisher ${hits} von ${runs} ${runs === 1 ? "Lauf" : "Läufen"} liquidiert. Das Modell sagt ${model}.`,
    curve: "Risiko in 30 Tagen nach Hebel",
    lev: "Hebel",
    caption:
      "Faustregel für eine isolierte Position ohne Gebühren. Die Wahrscheinlichkeit nimmt normalverteilte Renditen an; echte Krypto-Renditen haben dickere Ränder, die Zahl ist also eher zu niedrig.",
  },
  en: {
    title: "LEVERAGE · LIQUIDATION",
    missions: "Try this",
    mLiq: "Get liquidated once.",
    mSafe: "Find a leverage with under 10% risk over 30 days.",
    mRuns: "Run five stress tests and compare with the model.",
    side: "Side",
    long: "Long",
    short: "Short",
    view: "View",
    stress: "Stress test",
    curveView: "Leverage curve",
    leverage: "Leverage",
    maintenance: "Maintenance margin",
    vol: "Volatility p.a.",
    liq: "Liquidated at",
    distance: "Distance",
    sigmas: "Daily moves",
    touch30: "Risk over 30 days",
    run: "Simulate 30 days",
    entry: "Entry",
    liqLine: "Liquidation",
    day: "Day",
    price: "Price",
    hint: "Hover over the chart",
    survived: "Survived: 30 days without liquidation.",
    liquidated: (day: string) => `Liquidated on day ${day}. Your margin is gone.`,
    waiting: "Start a run: one random price path over 30 days.",
    tally: (hits: number, runs: number, model: string) =>
      `So far ${hits} of ${runs} ${runs === 1 ? "run" : "runs"} liquidated. The model says ${model}.`,
    curve: "Risk over 30 days by leverage",
    lev: "Leverage",
    caption:
      "Rule of thumb for an isolated position without fees. The probability assumes normally distributed returns; real crypto returns have fatter tails, so the number is more likely too low.",
  },
} as const;

const STEPS_PER_DAY = 6;
const HORIZON = 30;

export function LiquidationLab({ lang = "de" }: { lang?: Locale }) {
  const t = liqCopy[lang];
  const [side, setSide] = useState<Side>("long");
  const [view, setView] = useState<"stress" | "curve">("stress");
  const [leverage, setLeverage] = useState(10);
  const [maintenance, setMaintenance] = useState(0.005);
  const [vol, setVol] = useState(0.6);
  const [seed, setSeed] = useState(0);
  const [tally, setTally] = useState({ key: "", runs: 0, hits: 0 });
  const [totalRuns, setTotalRuns] = useState(0);
  const [everLiquidated, setEverLiquidated] = useState(false);
  const clock = usePlayback(2400);

  const liq = liquidationPrice(SPOT, leverage, maintenance, side);
  const distance = Math.abs(Math.log(Math.max(liq, 1e-9) / SPOT));
  const dailySigma = vol / Math.sqrt(DAYS_PER_YEAR);
  const p30 = touchProbability(distance, vol, HORIZON);
  const paramKey = `${side}|${leverage}|${maintenance}|${vol}`;
  const runsHere = tally.key === paramKey ? tally : { key: paramKey, runs: 0, hits: 0 };

  const path = useMemo(() => {
    if (!seed) return null;
    const prices = pricePath(seed * 7919, HORIZON, vol, HORIZON * STEPS_PER_DAY);
    const hit = prices.findIndex((p) => (side === "long" ? p <= liq : p >= liq));
    const points = prices.map((p, i): Point => [i / STEPS_PER_DAY, p]);
    const end = hit >= 0 ? hit : points.length - 1;
    return { points: points.slice(0, end + 1), hit, full: points };
  }, [seed, vol, side, liq]);

  const shown = path ? path.points.slice(0, Math.max(1, Math.round(clock.t * (HORIZON * STEPS_PER_DAY)) + 1)) : [];
  const finished = path !== null && shown.length >= path.points.length && !clock.playing;
  const domain = useMemo((): [number, number] => {
    const ys = [SPOT, liq, ...(path ? path.points.map(([, y]) => y) : [])];
    const low = Math.min(...ys);
    const high = Math.max(...ys);
    const pad = (high - low) * 0.12 + 1;
    return [low - pad, high + pad];
  }, [path, liq]);

  const curve = useMemo(
    () =>
      Array.from({ length: 100 }, (_, i): Point => {
        const lev = i + 1;
        const price = liquidationPrice(SPOT, lev, maintenance, side);
        if (price <= 0) return [lev, 0];
        return [lev, touchProbability(Math.abs(Math.log(price / SPOT)), vol, HORIZON) * 100];
      }),
    [maintenance, side, vol],
  );

  function run() {
    const next = seed + 1;
    setSeed(next);
    const prices = pricePath(next * 7919, HORIZON, vol, HORIZON * STEPS_PER_DAY);
    const hit = prices.some((p) => (side === "long" ? p <= liq : p >= liq));
    clock.play(() => {
      setTally({ key: paramKey, runs: runsHere.runs + 1, hits: runsHere.hits + (hit ? 1 : 0) });
      setTotalRuns((n) => n + 1);
      if (hit) setEverLiquidated(true);
    });
  }

  const missions = useMissions("liquidation", [
    { id: "liq", label: t.mLiq, done: everLiquidated },
    { id: "safe", label: t.mSafe, done: p30 < 0.1 },
    { id: "runs", label: t.mRuns, done: totalRuns >= 5 },
  ]);

  const hitDay = path && path.hit >= 0 ? path.hit / STEPS_PER_DAY : null;
  const fmtPct0 = (v: number) => (lang === "de" ? `${num(lang, v, 0)} %` : `${num(lang, v, 0)}%`);

  return (
    <Lab title={t.title} caption={t.caption} missions={{ title: t.missions, items: missions }}>
      <div className="lab__toolbar">
        <Segmented
          label={t.side}
          value={side}
          onChange={setSide}
          size="small"
          options={[
            { value: "long", label: t.long },
            { value: "short", label: t.short },
          ]}
        />
        <Segmented
          label={t.view}
          value={view}
          onChange={setView}
          size="small"
          options={[
            { value: "stress", label: t.stress },
            { value: "curve", label: t.curveView },
          ]}
        />
      </div>
      <Stats>
        <Stat label={t.liq} value={num(lang, Math.max(liq, 0), 2)} />
        <Stat label={t.distance} value={pct(lang, liq / SPOT - 1, 2, true)} tone={toneOf(side === "long" ? -1 : 1)} />
        <Stat label={t.sigmas} value={`${num(lang, distance / dailySigma, 1)} σ`} />
        <Stat label={t.touch30} value={pct(lang, p30, 1)} tone={p30 > 0.1 ? "down" : undefined} emphasis />
      </Stats>

      {view === "stress" ? (
        <>
          <div className="lab__subhead-row">
            <Verdict tone={finished ? (hitDay !== null ? "down" : "up") : undefined}>
              {!path || !finished
                ? t.waiting
                : hitDay !== null
                  ? t.liquidated(num(lang, hitDay, 1))
                  : t.survived}
            </Verdict>
            <PlayButton label={t.run} onClick={run} playing={clock.playing} />
          </div>
          <div className={finished && hitDay !== null ? "lab__flash" : undefined}>
            <Plot
              title={t.stress}
              series={[{ label: t.price, points: shown.length ? shown : [[0, SPOT]] }]}
              xLabel={t.day}
              xDomain={[0, HORIZON]}
              yDomain={domain}
              includeZero={false}
              formatX={(v) => num(lang, v, 0)}
              formatY={(v) => num(lang, v, 0)}
              hint={t.hint}
              levels={[
                { y: SPOT, label: t.entry },
                { y: liq, label: `${t.liqLine} ${num(lang, liq, 1)}`, tone: "down" },
              ]}
              dots={
                finished && hitDay !== null && path
                  ? [{ x: hitDay, y: path.points[path.points.length - 1][1], tone: "down", pulse: true }]
                  : []
              }
              endDot={!finished || hitDay === null}
              height={230}
            />
          </div>
          {runsHere.runs > 0 ? (
            <p className="lab__note tnum">{t.tally(runsHere.hits, runsHere.runs, pct(lang, p30, 0))}</p>
          ) : null}
        </>
      ) : (
        <Plot
          title={t.curve}
          series={[{ label: t.curve, points: curve }]}
          xLabel={t.lev}
          formatX={(v) => `${num(lang, v, 0)}×`}
          formatY={fmtPct0}
          hint={t.hint}
          markers={[{ x: leverage, label: `${leverage}×`, onDrag: setLeverage, min: 1, max: 100, step: 1 }]}
          yDomain={[0, 100]}
          height={230}
        />
      )}

      <Controls>
        <Slider label={t.leverage} value={leverage} min={1} max={100} step={1} onChange={setLeverage} format={(v) => `${v}×`} />
        <Slider label={t.vol} value={vol} min={0.2} max={1.2} step={0.05} onChange={setVol} format={(v) => pct(lang, v, 0)} />
        <Slider label={t.maintenance} value={maintenance} min={0.002} max={0.02} step={0.001} onChange={setMaintenance} format={(v) => pct(lang, v, 1)} />
      </Controls>
    </Lab>
  );
}
