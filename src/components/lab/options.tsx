"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/i18n";
import {
  blackScholes,
  DAYS_PER_YEAR,
  gaussian,
  mulberry32,
  payoffAtExpiry,
  valueBeforeExpiry,
  zeroCrossings,
  type BlackScholes,
  type Leg,
} from "@/lib/derivatives";
import {
  Controls,
  Lab,
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
  useTweened,
  useWidth,
  type Point,
} from "./ui";
import { useMissions } from "./workshop";

const SPOT = 100;

type StrategyId =
  | "longCall"
  | "longPut"
  | "shortPut"
  | "coveredCall"
  | "protectivePut"
  | "straddle"
  | "bullSpread";

const strategies: Record<StrategyId, (strike: number) => Leg[]> = {
  longCall: (k) => [{ kind: "call", strike: k, quantity: 1 }],
  longPut: (k) => [{ kind: "put", strike: k, quantity: 1 }],
  shortPut: (k) => [{ kind: "put", strike: k, quantity: -1 }],
  coveredCall: (k) => [
    { kind: "spot", quantity: 1 },
    { kind: "call", strike: k, quantity: -1 },
  ],
  protectivePut: (k) => [
    { kind: "spot", quantity: 1 },
    { kind: "put", strike: k, quantity: 1 },
  ],
  straddle: (k) => [
    { kind: "call", strike: k, quantity: 1 },
    { kind: "put", strike: k, quantity: 1 },
  ],
  bullSpread: (k) => [
    { kind: "call", strike: k, quantity: 1 },
    { kind: "call", strike: k + 10, quantity: -1 },
  ],
};

/* ------------------------------------------------------------ Payoff */

const payoffCopy = {
  de: {
    title: "PAYOFF-LABOR · BASISWERT 100",
    missions: "Aufgaben",
    mDrag: "Zieh den Strike K direkt im Diagramm.",
    mStraddle: "Finde die Strategie, die bei Crash und Rally gewinnt.",
    mDecay: "Lass die Zeit bis zur Fälligkeit ablaufen.",
    strategy: "Strategie",
    names: {
      longCall: "Long Call",
      longPut: "Long Put",
      shortPut: "Short Put",
      coveredCall: "Covered Call",
      protectivePut: "Protective Put",
      straddle: "Long Straddle",
      bullSpread: "Bull Call Spread",
    },
    notes: {
      longCall: "Prämie zahlen, auf steigende Kurse setzen. Mehr als die Prämie kannst du nicht verlieren.",
      longPut: "Spiegelbild des Calls: Gewinn bei fallenden Kursen. Funktioniert wie eine Versicherung.",
      shortPut: "Prämie kassieren, Kauf zum Strike versprechen. Kleiner, wahrscheinlicher Gewinn; großer Verlust im Crash.",
      coveredCall: "Basiswert halten, Call verkaufen. Die Prämie polstert etwas ab; der Gewinn ist gedeckelt.",
      protectivePut: "Basiswert halten, Put kaufen. Verlust nach unten begrenzt; die Prämie kostet Rendite.",
      straddle: "Call und Put mit gleichem Strike: Wette auf eine große Bewegung, egal wohin.",
      bullSpread: "Call kaufen, Call 10 höher verkaufen. Billiger als ein Call; Gewinn und Verlust begrenzt.",
    },
    legs: { call: "Call", put: "Put", spot: "Basiswert" },
    strike: "Strike",
    vol: "Implizite Volatilität",
    days: "Laufzeit",
    daysUnit: "Tage",
    expiry: "G/V bei Fälligkeit",
    today: (d: number) => `G/V mit ${d} ${d === 1 ? "Tag" : "Tagen"} Restlaufzeit`,
    price: "Kurs",
    hint: "Zieh K oder fahr über das Diagramm",
    decay: "Zeit ablaufen lassen",
    decayAgain: "Nochmal ablaufen lassen",
    pay: "Prämie, die du zahlst",
    receive: "Prämie, die du bekommst",
    maxGain: "Max. Gewinn",
    maxLoss: "Max. Verlust",
    breakeven: "Break-even",
    unlimited: "unbegrenzt",
    none: "keiner",
    caption:
      "Prämien nach Black-Scholes mit Zins 0. Ein Kontrakt bezieht sich hier auf eine Einheit des Basiswerts.",
  },
  en: {
    title: "PAYOFF LAB · UNDERLYING 100",
    missions: "Try this",
    mDrag: "Drag the strike K right on the chart.",
    mStraddle: "Find the strategy that wins in a crash and in a rally.",
    mDecay: "Let time run down to expiry.",
    strategy: "Strategy",
    names: {
      longCall: "Long call",
      longPut: "Long put",
      shortPut: "Short put",
      coveredCall: "Covered call",
      protectivePut: "Protective put",
      straddle: "Long straddle",
      bullSpread: "Bull call spread",
    },
    notes: {
      longCall: "Pay a premium, bet on rising prices. You cannot lose more than the premium.",
      longPut: "Mirror image of the call: profit when prices fall. Works like insurance.",
      shortPut: "Collect the premium, promise to buy at the strike. Small, likely gain; large loss in a crash.",
      coveredCall: "Hold the underlying, sell a call. The premium cushions a little; the upside is capped.",
      protectivePut: "Hold the underlying, buy a put. Downside limited; the premium costs return.",
      straddle: "Call and put at the same strike: a bet on a big move, either way.",
      bullSpread: "Buy a call, sell a call 10 higher. Cheaper than a call; gain and loss both limited.",
    },
    legs: { call: "Call", put: "Put", spot: "Underlying" },
    strike: "Strike",
    vol: "Implied volatility",
    days: "Time to expiry",
    daysUnit: "days",
    expiry: "P&L at expiry",
    today: (d: number) => `P&L with ${d} ${d === 1 ? "day" : "days"} left`,
    price: "Price",
    hint: "Drag K or hover over the chart",
    decay: "Let time run",
    decayAgain: "Run time again",
    pay: "Premium you pay",
    receive: "Premium you receive",
    maxGain: "Max gain",
    maxLoss: "Max loss",
    breakeven: "Break-even",
    unlimited: "unlimited",
    none: "none",
    caption:
      "Premiums from Black-Scholes with a zero rate. One contract refers to one unit of the underlying here.",
  },
} as const;

const PRICE_GRID = Array.from({ length: 201 }, (_, i) => 50 + i * 0.5);

export function PayoffLab({ lang = "de" }: { lang?: Locale }) {
  const t = payoffCopy[lang];
  const [strategy, setStrategy] = useState<StrategyId>("longCall");
  const [strike, setStrike] = useState(105);
  const [vol, setVol] = useState(0.6);
  const [days, setDays] = useState(30);
  const [dragged, setDragged] = useState(false);
  const [decayed, setDecayed] = useState(false);
  const clock = usePlayback(3200);

  const remaining = clock.playing || decayed ? days * (1 - clock.t) : days;
  const legs = strategies[strategy](strike);

  const result = useMemo(() => {
    const years = days / DAYS_PER_YEAR;
    const cost = valueBeforeExpiry(legs, SPOT, years, 0, vol);
    const optionPremium = valueBeforeExpiry(
      legs.filter((leg) => leg.kind !== "spot"),
      SPOT,
      years,
      0,
      vol,
    );
    const expiry: Point[] = PRICE_GRID.map((x) => [x, payoffAtExpiry(legs, x) - cost]);

    // Extremes over all prices from 0 upwards: the slope beyond the last
    // strike decides whether a side is unbounded.
    const wide = Array.from({ length: 601 }, (_, i) => i * 0.5);
    const values = wide.map((x) => payoffAtExpiry(legs, x) - cost);
    const tailSlope = legs.reduce((sum, leg) => sum + (leg.kind === "put" ? 0 : leg.quantity), 0);
    const maxGain = tailSlope > 0 ? Infinity : Math.max(...values);
    const maxLoss = tailSlope < 0 ? -Infinity : Math.min(...values);
    const breakevens = zeroCrossings(wide.map((x, i): Point => [x, values[i]]));
    return { cost, expiry, optionPremium, maxGain, maxLoss, breakevens };
    // `legs` is rebuilt every render; strategy and strike define it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strategy, strike, vol, days]);

  const today: Point[] = PRICE_GRID.map((x) => [
    x,
    valueBeforeExpiry(legs, x, remaining / DAYS_PER_YEAR, 0, vol) - result.cost,
  ]);

  const expiryLine = useTweened(result.expiry, strategy);
  const todayLine = useTweened(today, strategy);
  const fmtGain = (v: number) => (Number.isFinite(v) ? signed(lang, v) : t.unlimited);

  const missions = useMissions("payoff", [
    { id: "drag", label: t.mDrag, done: dragged },
    { id: "straddle", label: t.mStraddle, done: strategy === "straddle" },
    { id: "decay", label: t.mDecay, done: decayed && !clock.playing },
  ]);

  return (
    <Lab title={t.title} caption={t.caption} missions={{ title: t.missions, items: missions }}>
      <Segmented
        label={t.strategy}
        value={strategy}
        onChange={setStrategy}
        options={(Object.keys(strategies) as StrategyId[]).map((id) => ({
          value: id,
          label: t.names[id],
        }))}
      />
      <div className="lab__legs-row">
        <ul className="lab__legs" role="list">
          {legs.map((leg) => (
            <li key={`${leg.kind}${leg.kind === "spot" ? "" : leg.strike}`} className={leg.quantity < 0 ? "is-short" : "is-long"}>
              <span className="tnum">{leg.quantity > 0 ? "+1" : "−1"}</span>{" "}
              {t.legs[leg.kind]}
              {leg.kind === "spot" ? null : <span className="tnum"> K {leg.strike}</span>}
            </li>
          ))}
        </ul>
        <p className="lab__note">{t.notes[strategy]}</p>
      </div>
      <Plot
        title={`${t.names[strategy]}: ${t.expiry}`}
        series={[
          { label: t.expiry, points: expiryLine },
          { label: t.today(Math.round(remaining)), points: todayLine, tone: "muted", dashed: true },
        ]}
        xLabel={t.price}
        formatX={(v) => num(lang, v, 0)}
        formatY={(v) => signed(lang, v, Math.abs(v) < 10 ? 1 : 0)}
        hint={t.hint}
        markers={[
          {
            x: strike,
            label: "K",
            onDrag: (x) => {
              setStrike(x);
              setDragged(true);
            },
            min: 80,
            max: 120,
            step: 1,
          },
          { x: SPOT, label: "S₀" },
        ]}
      />
      <div className="lab__toolbar">
        <PlayButton
          label={decayed ? t.decayAgain : t.decay}
          onClick={() => {
            setDecayed(true);
            clock.play();
          }}
          playing={clock.playing}
        />
      </div>
      <Stats>
        <Stat
          label={result.optionPremium >= 0 ? t.pay : t.receive}
          value={num(lang, Math.abs(result.optionPremium))}
        />
        <Stat label={t.maxGain} value={fmtGain(result.maxGain)} tone={toneOf(result.maxGain)} />
        <Stat label={t.maxLoss} value={fmtGain(result.maxLoss)} tone={toneOf(result.maxLoss)} />
        <Stat
          label={t.breakeven}
          value={
            result.breakevens.length
              ? result.breakevens.map((b) => num(lang, b, 2)).join(" / ")
              : t.none
          }
        />
      </Stats>
      <Controls>
        <Slider label={t.strike} value={strike} min={80} max={120} step={1} onChange={setStrike} format={(v) => num(lang, v, 0)} />
        <Slider label={t.vol} value={vol} min={0.1} max={1.5} step={0.05} onChange={setVol} format={(v) => pct(lang, v, 0)} />
        <Slider
          label={t.days}
          value={days}
          min={2}
          max={180}
          step={1}
          onChange={(v) => {
            setDays(v);
            setDecayed(false);
          }}
          format={(v) => `${v} ${t.daysUnit}`}
        />
      </Controls>
    </Lab>
  );
}

/* ------------------------------------------------------------ Pricer */

type MetricId = "price" | "delta" | "gamma" | "vega" | "theta";

const pricerCopy = {
  de: {
    title: "BLACK-SCHOLES · EUROPÄISCHE OPTION",
    missions: "Aufgaben",
    mDelta: "Bring das Delta des Calls auf 0,50.",
    mGamma: "Zeig Gamma an und verkürz die Laufzeit auf eine Woche.",
    mDrag: "Zieh S oder K im Diagramm.",
    spot: "Kurs S",
    strike: "Strike K",
    days: "Laufzeit",
    daysUnit: "Tage",
    vol: "Volatilität σ",
    rate: "Zins r",
    call: "Call",
    put: "Put",
    both: "Call und Put",
    metric: "Kennzahl",
    metrics: {
      price: "Preis",
      delta: "Delta",
      gamma: "Gamma",
      vega: "Vega (pro Vol-Punkt)",
      theta: "Theta (pro Tag)",
    },
    pick: "Wähl eine Zeile, um sie im Diagramm zu sehen.",
    parity: "Put-Call-Parität: Beide Seiten sind immer gleich.",
    parityLeft: "C − P",
    parityRight: "S − K·e^(−rT)",
    hint: "Zieh S oder K",
  },
  en: {
    title: "BLACK-SCHOLES · EUROPEAN OPTION",
    missions: "Try this",
    mDelta: "Get the call's delta to 0.50.",
    mGamma: "Show gamma and shorten expiry to one week.",
    mDrag: "Drag S or K on the chart.",
    spot: "Price S",
    strike: "Strike K",
    days: "Time to expiry",
    daysUnit: "days",
    vol: "Volatility σ",
    rate: "Rate r",
    call: "Call",
    put: "Put",
    both: "Call and put",
    metric: "Metric",
    metrics: {
      price: "Price",
      delta: "Delta",
      gamma: "Gamma",
      vega: "Vega (per vol point)",
      theta: "Theta (per day)",
    },
    pick: "Pick a row to see it on the chart.",
    parity: "Put-call parity: both sides always match.",
    parityLeft: "C − P",
    parityRight: "S − K·e^(−rT)",
    hint: "Drag S or K",
  },
} as const;

const metricValue: Record<MetricId, (bs: BlackScholes) => [number, number]> = {
  price: (bs) => [bs.call, bs.put],
  delta: (bs) => [bs.callDelta, bs.putDelta],
  gamma: (bs) => [bs.gamma, bs.gamma],
  vega: (bs) => [bs.vega, bs.vega],
  theta: (bs) => [bs.callTheta, bs.putTheta],
};

const metricDigits: Record<MetricId, number> = { price: 2, delta: 3, gamma: 4, vega: 3, theta: 3 };
const SPOT_GRID = Array.from({ length: 121 }, (_, i) => 40 + i);

export function OptionPricer({ lang = "de" }: { lang?: Locale }) {
  const t = pricerCopy[lang];
  const [spot, setSpot] = useState(100);
  const [strike, setStrike] = useState(100);
  const [days, setDays] = useState(30);
  const [vol, setVol] = useState(0.6);
  const [rate, setRate] = useState(0.04);
  const [metric, setMetric] = useState<MetricId>("price");
  const [dragged, setDragged] = useState(false);

  const years = days / DAYS_PER_YEAR;
  const bs = useMemo(() => blackScholes(spot, strike, years, rate, vol), [spot, strike, years, rate, vol]);

  const curves = useMemo(() => {
    const values = SPOT_GRID.map((x) => metricValue[metric](blackScholes(x, strike, years, rate, vol)));
    return {
      call: values.map(([c], i): Point => [SPOT_GRID[i], c]),
      put: values.map(([, p], i): Point => [SPOT_GRID[i], p]),
    };
  }, [metric, strike, years, rate, vol]);

  const callLine = useTweened(curves.call, metric);
  const putLine = useTweened(curves.put, metric);
  const shared = metric === "gamma" || metric === "vega";
  const digits = metricDigits[metric];

  const missions = useMissions("pricer", [
    { id: "delta", label: t.mDelta, done: Math.abs(bs.callDelta - 0.5) < 0.005 },
    { id: "gamma", label: t.mGamma, done: metric === "gamma" && days <= 7 },
    { id: "drag", label: t.mDrag, done: dragged },
  ]);

  const rows = (Object.keys(metricValue) as MetricId[]).map((id) => {
    const [call, put] = metricValue[id](bs);
    const format = id === "theta" ? signed : num;
    return { id, call: format(lang, call, metricDigits[id]), put: format(lang, put, metricDigits[id]) };
  });

  return (
    <Lab title={t.title} missions={{ title: t.missions, items: missions }}>
      <Controls>
        <Slider label={t.spot} value={spot} min={50} max={150} step={1} onChange={setSpot} format={(v) => num(lang, v, 0)} />
        <Slider label={t.strike} value={strike} min={50} max={150} step={1} onChange={setStrike} format={(v) => num(lang, v, 0)} />
        <Slider label={t.days} value={days} min={1} max={365} step={1} onChange={setDays} format={(v) => `${v} ${t.daysUnit}`} />
        <Slider label={t.vol} value={vol} min={0.05} max={1.5} step={0.05} onChange={setVol} format={(v) => pct(lang, v, 0)} />
        <Slider label={t.rate} value={rate} min={0} max={0.1} step={0.0025} onChange={setRate} format={(v) => pct(lang, v, 2)} />
      </Controls>

      <div className="lab__table-wrap">
        <table className="lab__table lab__table--pick">
          <caption className="lab__table-caption">{t.pick}</caption>
          <thead>
            <tr>
              <th>{t.metric}</th>
              <th>{t.call}</th>
              <th>{t.put}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} aria-selected={metric === row.id} onClick={() => setMetric(row.id)}>
                <td>
                  <button
                    type="button"
                    className="lab__row-pick"
                    aria-pressed={metric === row.id}
                    onClick={(event) => {
                      event.stopPropagation();
                      setMetric(row.id);
                    }}
                  >
                    {t.metrics[row.id]}
                  </button>
                </td>
                <td className="tnum">{row.call}</td>
                <td className="tnum">{row.put}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Plot
        title={t.metrics[metric]}
        series={
          shared
            ? [{ label: t.both, points: callLine }]
            : [
                { label: t.call, points: callLine },
                { label: t.put, points: putLine, tone: "warm" },
              ]
        }
        xLabel="S"
        formatX={(v) => num(lang, v, 0)}
        formatY={(v) => num(lang, v, Math.max(0, digits - 1))}
        hint={t.hint}
        markers={[
          { x: spot, label: "S", onDrag: (x) => { setSpot(x); setDragged(true); }, min: 50, max: 150 },
          { x: strike, label: "K", onDrag: (x) => { setStrike(x); setDragged(true); }, min: 50, max: 150 },
        ]}
        dots={[
          { x: spot, y: metricValue[metric](bs)[0] },
          ...(shared ? [] : [{ x: spot, y: metricValue[metric](bs)[1], tone: "warm" as const }]),
        ]}
        height={240}
      />

      <p className="lab__note">{t.parity}</p>
      <Stats>
        <Stat raw label={t.parityLeft} value={signed(lang, bs.call - bs.put, 4)} />
        <Stat raw label={t.parityRight} value={signed(lang, spot - strike * Math.exp(-rate * years), 4)} />
      </Stats>
    </Lab>
  );
}

/* ------------------------------------------------------------ Monte Carlo */

const mcCopy = {
  de: {
    title: "MONTE CARLO · CALL, SPOT 100, 30 TAGE",
    missions: "Aufgaben",
    mRun: "Starte eine Simulation.",
    mAgain: "Simulier noch einmal: Wie stark wackelt die Schätzung?",
    mOtm: "Setz den Strike auf 130 oder höher und simulier.",
    strike: "Strike K",
    vol: "Volatilität σ",
    run: "Simulation starten",
    again: "Neu simulieren",
    fan: "40 von 20.000 simulierten Kursverläufen",
    itm: "endet im Geld",
    otm: "endet wertlos",
    paths: "Pfade",
    estimate: "Schätzung",
    stdError: "Std.-Fehler",
    exact: "Black-Scholes",
    error: "Abweichung",
    running: "Schätzung nach N Pfaden",
    band: "±2 Std.-Fehler",
    hint: "Fahr über das Diagramm",
    idle: "Noch keine Simulation.",
    caption:
      "Endkurse aus geometrischer Brownscher Bewegung, Zins 4 %. Die Schätzung ist der Mittelwert der abgezinsten Auszahlungen; der Trichter zeigt, wie der Fehler mit 1/√N schrumpft.",
  },
  en: {
    title: "MONTE CARLO · CALL, SPOT 100, 30 DAYS",
    missions: "Try this",
    mRun: "Run a simulation.",
    mAgain: "Simulate again: how much does the estimate wobble?",
    mOtm: "Set the strike to 130 or higher and simulate.",
    strike: "Strike K",
    vol: "Volatility σ",
    run: "Run simulation",
    again: "Simulate again",
    fan: "40 of 20,000 simulated price paths",
    itm: "ends in the money",
    otm: "expires worthless",
    paths: "Paths",
    estimate: "Estimate",
    stdError: "Std. error",
    exact: "Black-Scholes",
    error: "Deviation",
    running: "Estimate after N paths",
    band: "±2 std. errors",
    hint: "Hover over the chart",
    idle: "No simulation yet.",
    caption:
      "Terminal prices from geometric Brownian motion, rate 4%. The estimate is the mean of the discounted payoffs; the funnel shows the error shrinking with 1/√N.",
  },
} as const;

const MC_TOTAL = 20_000;
const MC_EVERY = 100;
const FAN_PATHS = 40;
const FAN_STEPS = 30;
const MC_DAYS = 30;
const MC_RATE = 0.04;

type McRun = {
  fan: number[][];
  running: Point[];
  upper: Point[];
  lower: Point[];
  stdErrors: number[];
  exact: number;
};

function simulateMc(seed: number, strike: number, vol: number): McRun {
  const random = mulberry32(seed);
  const years = MC_DAYS / DAYS_PER_YEAR;
  const discount = Math.exp(-MC_RATE * years);
  const exact = blackScholes(SPOT, strike, years, MC_RATE, vol).call;

  const dt = years / FAN_STEPS;
  const fan = Array.from({ length: FAN_PATHS }, () => {
    let price = SPOT;
    const path = [price];
    for (let i = 0; i < FAN_STEPS; i++) {
      price *= Math.exp((MC_RATE - 0.5 * vol * vol) * dt + vol * Math.sqrt(dt) * gaussian(random));
      path.push(price);
    }
    return path;
  });

  const drift = (MC_RATE - 0.5 * vol * vol) * years;
  const diffusion = vol * Math.sqrt(years);
  let sum = 0;
  let sumSq = 0;
  const running: Point[] = [];
  const stdErrors: number[] = [];
  for (let n = 1; n <= MC_TOTAL; n++) {
    const terminal = SPOT * Math.exp(drift + diffusion * gaussian(random));
    const payoff = discount * Math.max(terminal - strike, 0);
    sum += payoff;
    sumSq += payoff * payoff;
    if (n % MC_EVERY === 0) {
      const mean = sum / n;
      running.push([n, mean]);
      stdErrors.push(Math.sqrt(Math.max(sumSq / n - mean * mean, 0) / n));
    }
  }
  const sd = stdErrors[stdErrors.length - 1] * Math.sqrt(MC_TOTAL);
  const upper = running.map(([n]): Point => [n, exact + (2 * sd) / Math.sqrt(n)]);
  const lower = running.map(([n]): Point => [n, exact - (2 * sd) / Math.sqrt(n)]);
  return { fan, running, upper, lower, stdErrors, exact };
}

function PathFan({ fan, strike, t, label, itm, otm }: { fan: number[][]; strike: number; t: number; label: string; itm: string; otm: string }) {
  const [ref, width] = useWidth<HTMLDivElement>(640);
  const height = 190;
  const pad = { l: 40, r: 16, t: 12, b: 12 };
  const all = fan.flat().concat(strike);
  const lo = Math.min(...all) * 0.98;
  const hi = Math.max(...all) * 1.02;
  const sx = (i: number) => pad.l + (i / FAN_STEPS) * (width - pad.l - pad.r);
  const sy = (v: number) => pad.t + ((hi - v) / (hi - lo)) * (height - pad.t - pad.b);

  return (
    <figure className="lab__plot lab__fan" ref={ref}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
        <line x1={pad.l} x2={width - pad.r} y1={sy(strike)} y2={sy(strike)} className="lab__level lab__level--muted" />
        {Math.abs(sy(strike) - sy(SPOT)) < 14 ? (
          <text x={pad.l - 6} y={sy(SPOT) + 4} textAnchor="end" className="lab__tick">S₀=K</text>
        ) : (
          <>
            <text x={pad.l - 6} y={sy(strike) + 4} textAnchor="end" className="lab__tick">K</text>
            <text x={pad.l - 6} y={sy(SPOT) + 4} textAnchor="end" className="lab__tick">S₀</text>
          </>
        )}
        {fan.map((path, i) => {
          const start = (i / FAN_PATHS) * 0.55;
          const progress = Math.min(1, Math.max(0, (t - start) / 0.25));
          if (progress <= 0) return null;
          const end = path[path.length - 1];
          const inMoney = end > strike;
          const d = path.map((v, j) => `${j ? "L" : "M"}${sx(j).toFixed(1)},${sy(v).toFixed(1)}`).join("");
          return (
            <g key={i} className={inMoney ? "lab__fan-path is-itm" : "lab__fan-path"}>
              <path d={d} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - progress} />
              {progress >= 1 ? <circle cx={sx(FAN_STEPS)} cy={sy(end)} r={3} /> : null}
            </g>
          );
        })}
      </svg>
      <figcaption className="lab__readout">
        <span className="lab__key lab__key--accent">{itm}</span>
        <span className="lab__key lab__key--muted">{otm}</span>
        <span className="lab__hint">{label}</span>
      </figcaption>
    </figure>
  );
}

export function MonteCarloLab({ lang = "de" }: { lang?: Locale }) {
  const t = mcCopy[lang];
  const [strike, setStrike] = useState(100);
  const [vol, setVol] = useState(0.6);
  const [seed, setSeed] = useState(0);
  const [runs, setRuns] = useState(0);
  const [otmRun, setOtmRun] = useState(false);
  const clock = usePlayback(3600);

  // A run belongs to the inputs it was made with; new inputs clear it.
  const inputs = `${strike}|${vol}`;
  const [ranWith, setRanWith] = useState<string | null>(null);
  const sim = useMemo(
    () => (seed && ranWith === inputs ? simulateMc(seed, strike, vol) : null),
    [seed, ranWith, inputs, strike, vol],
  );

  function run() {
    setSeed((s) => s + 1);
    setRanWith(inputs);
    clock.play(() => {
      setRuns((r) => r + 1);
      if (strike >= 130) setOtmRun(true);
    });
  }

  // The fan draws during the first half, the estimate during the second.
  const estimateT = Math.min(1, Math.max(0, (clock.t - 0.35) / 0.65));
  const visible = sim ? Math.max(1, Math.round(estimateT * sim.running.length)) : 0;
  const current = sim ? sim.running[visible - 1] : null;
  const currentSe = sim ? sim.stdErrors[visible - 1] : 0;
  const exact = blackScholes(SPOT, strike, MC_DAYS / DAYS_PER_YEAR, MC_RATE, vol).call;

  const missions = useMissions("mc", [
    { id: "run", label: t.mRun, done: runs >= 1 },
    { id: "again", label: t.mAgain, done: runs >= 2 },
    { id: "otm", label: t.mOtm, done: otmRun },
  ]);

  return (
    <Lab title={t.title} caption={t.caption} missions={{ title: t.missions, items: missions }}>
      <Controls>
        <Slider label={t.strike} value={strike} min={70} max={150} step={1} onChange={setStrike} format={(v) => num(lang, v, 0)} />
        <Slider label={t.vol} value={vol} min={0.1} max={1.2} step={0.05} onChange={setVol} format={(v) => pct(lang, v, 0)} />
      </Controls>
      <div className="lab__toolbar">
        <PlayButton label={sim ? t.again : t.run} onClick={run} playing={clock.playing} />
        {!sim ? <span className="lab__ticker">{t.idle}</span> : null}
      </div>
      {sim ? (
        <>
          <PathFan fan={sim.fan} strike={strike} t={clock.t} label={t.fan} itm={t.itm} otm={t.otm} />
          <Plot
            title={t.running}
            series={[
              { label: t.estimate, points: sim.running.slice(0, visible) },
              { label: t.exact, points: sim.running.map(([n]): Point => [n, sim.exact]), tone: "muted" },
              { label: `${t.band} +`, points: sim.upper, tone: "muted", dashed: true },
              { label: `${t.band} −`, points: sim.lower, tone: "muted", dashed: true },
            ]}
            xLabel={t.paths}
            xDomain={[MC_EVERY, MC_TOTAL]}
            yDomain={[
              Math.max(0, sim.exact - 3 * (sim.upper[0][1] - sim.exact) * 0.6),
              sim.exact + 3 * (sim.upper[0][1] - sim.exact) * 0.6,
            ]}
            includeZero={false}
            formatX={(v) => num(lang, v, 0)}
            formatY={(v) => num(lang, v, 2)}
            hint={t.hint}
            endDot
            height={200}
          />
        </>
      ) : null}
      <Stats>
        <Stat label={t.paths} value={current ? num(lang, current[0], 0) : "–"} />
        <Stat label={t.estimate} value={current ? num(lang, current[1], 3) : "–"} />
        <Stat label={t.stdError} value={current ? `± ${num(lang, currentSe, 3)}` : "–"} />
        <Stat label={t.exact} value={num(lang, exact, 3)} />
        <Stat
          label={t.error}
          value={current ? signed(lang, current[1] - exact, 3) : "–"}
          emphasis
        />
      </Stats>
    </Lab>
  );
}
