"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/i18n";
import {
  blackScholes,
  DAYS_PER_YEAR,
  monteCarloCall,
  mulberry32,
  payoffAtExpiry,
  valueBeforeExpiry,
  zeroCrossings,
  type Leg,
} from "@/lib/derivatives";
import {
  Controls,
  Lab,
  num,
  pct,
  Plot,
  Segmented,
  signed,
  Slider,
  Stat,
  Stats,
  toneOf,
  type Point,
} from "./ui";

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

const payoffCopy = {
  de: {
    title: "PAYOFF-LABOR · BASISWERT 100",
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
      longCall:
        "Du zahlst eine Prämie und verdienst, wenn der Kurs über Strike plus Prämie steigt. Mehr als die Prämie kannst du nicht verlieren.",
      longPut:
        "Das Spiegelbild des Calls: Gewinn bei fallenden Kursen, Verlust auf die Prämie begrenzt. Funktioniert wie eine Versicherung.",
      shortPut:
        "Du kassierst die Prämie und versprichst, zum Strike zu kaufen. Kleiner, wahrscheinlicher Gewinn; großer Verlust bei einem Crash.",
      coveredCall:
        "Basiswert halten und einen Call verkaufen. Die Prämie polstert Verluste etwas ab; dafür ist der Gewinn oberhalb des Strikes gedeckelt.",
      protectivePut:
        "Basiswert halten und einen Put kaufen. Der Verlust ist nach unten begrenzt; die Prämie kostet dich Rendite.",
      straddle:
        "Call und Put mit gleichem Strike. Du wettest auf eine große Bewegung, egal in welche Richtung; ruhige Märkte kosten dich beide Prämien.",
      bullSpread:
        "Call kaufen, Call mit 10 höherem Strike verkaufen. Günstiger als ein einzelner Call; Gewinn und Verlust sind beide begrenzt.",
    },
    strike: "Strike",
    vol: "Implizite Volatilität",
    days: "Laufzeit",
    daysUnit: "Tage",
    expiry: "G/V bei Fälligkeit",
    halfway: (d: number) => `G/V nach ${d} Tagen`,
    price: "Kurs",
    hint: "Fahr über das Diagramm",
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
      longCall:
        "You pay a premium and profit once the price rises above strike plus premium. You cannot lose more than the premium.",
      longPut:
        "The mirror image of the call: profit when prices fall, loss limited to the premium. It works like insurance.",
      shortPut:
        "You collect the premium and promise to buy at the strike. Small, likely profit; large loss in a crash.",
      coveredCall:
        "Hold the underlying and sell a call. The premium cushions losses a little; in return the upside above the strike is capped.",
      protectivePut:
        "Hold the underlying and buy a put. The downside is limited; the premium costs you return.",
      straddle:
        "Call and put with the same strike. You bet on a large move in either direction; quiet markets cost you both premiums.",
      bullSpread:
        "Buy a call, sell a call 10 higher. Cheaper than a single call; profit and loss are both limited.",
    },
    strike: "Strike",
    vol: "Implied volatility",
    days: "Time to expiry",
    daysUnit: "days",
    expiry: "P&L at expiry",
    halfway: (d: number) => `P&L after ${d} days`,
    price: "Price",
    hint: "Hover over the chart",
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

export function PayoffLab({ lang = "de" }: { lang?: Locale }) {
  const t = payoffCopy[lang];
  const [strategy, setStrategy] = useState<StrategyId>("longCall");
  const [strike, setStrike] = useState(105);
  const [vol, setVol] = useState(0.6);
  const [days, setDays] = useState(30);

  const result = useMemo(() => {
    const legs = strategies[strategy](strike);
    const years = days / DAYS_PER_YEAR;
    const cost = valueBeforeExpiry(legs, SPOT, years, 0, vol);
    const optionPremium = valueBeforeExpiry(
      legs.filter((leg) => leg.kind !== "spot"),
      SPOT,
      years,
      0,
      vol,
    );
    const half = Math.round(days / 2);
    const grid = Array.from({ length: 201 }, (_, i) => 50 + i * 0.5);
    const expiry: Point[] = grid.map((x) => [x, payoffAtExpiry(legs, x) - cost]);
    const midway: Point[] = grid.map((x) => [
      x,
      valueBeforeExpiry(legs, x, (days - half) / DAYS_PER_YEAR, 0, vol) - cost,
    ]);

    // Extremes over all prices from 0 upwards: the slope beyond the last
    // strike decides whether a side is unbounded.
    const wide = Array.from({ length: 601 }, (_, i) => i * 0.5);
    const values = wide.map((x) => payoffAtExpiry(legs, x) - cost);
    const tailSlope = legs.reduce(
      (sum, leg) => sum + (leg.kind === "put" ? 0 : leg.quantity),
      0,
    );
    const maxGain = tailSlope > 0 ? Infinity : Math.max(...values);
    const maxLoss = tailSlope < 0 ? -Infinity : Math.min(...values);
    const breakevens = zeroCrossings(wide.map((x, i): Point => [x, values[i]]));

    return { expiry, midway, half, optionPremium, maxGain, maxLoss, breakevens };
  }, [strategy, strike, vol, days]);

  const fmtGain = (v: number) => (Number.isFinite(v) ? signed(lang, v) : t.unlimited);

  return (
    <Lab title={t.title} caption={t.caption}>
      <Segmented
        label={t.strategy}
        value={strategy}
        onChange={setStrategy}
        options={(Object.keys(strategies) as StrategyId[]).map((id) => ({
          value: id,
          label: t.names[id],
        }))}
      />
      <p className="lab__note">{t.notes[strategy]}</p>
      <Plot
        title={`${t.names[strategy]}: ${t.expiry}`}
        series={[
          { label: t.expiry, points: result.expiry },
          { label: t.halfway(result.half), points: result.midway, tone: "muted", dashed: true },
        ]}
        xLabel={t.price}
        formatX={(v) => num(lang, v, 0)}
        formatY={(v) => signed(lang, v, Math.abs(v) < 10 ? 1 : 0)}
        hint={t.hint}
        markers={[{ x: SPOT, label: "S₀" }]}
      />
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
        <Slider
          label={t.strike}
          value={strike}
          min={80}
          max={120}
          step={1}
          onChange={setStrike}
          format={(v) => num(lang, v, 0)}
        />
        <Slider
          label={t.vol}
          value={vol}
          min={0.1}
          max={1.5}
          step={0.05}
          onChange={setVol}
          format={(v) => pct(lang, v, 0)}
        />
        <Slider
          label={t.days}
          value={days}
          min={2}
          max={180}
          step={1}
          onChange={setDays}
          format={(v) => `${v} ${t.daysUnit}`}
        />
      </Controls>
    </Lab>
  );
}

/* ------------------------------------------------------------ Pricer */

const pricerCopy = {
  de: {
    title: "BLACK-SCHOLES · EUROPÄISCHE OPTION",
    spot: "Kurs S",
    strike: "Strike K",
    days: "Laufzeit",
    daysUnit: "Tage",
    vol: "Volatilität σ",
    rate: "Zins r",
    call: "Call",
    put: "Put",
    metric: "Kennzahl",
    price: "Preis",
    delta: "Delta",
    gamma: "Gamma",
    vega: "Vega (pro Vol-Punkt)",
    theta: "Theta (pro Tag)",
    parity: "Put-Call-Parität: Beide Seiten sind immer gleich, egal welche Werte du einstellst.",
    parityLeft: "C − P",
    parityRight: "S − K·e^(−rT)",
    curveToday: "Call-Wert heute",
    curveIntrinsic: "Innerer Wert",
    plotTitle: "Call-Preis in Abhängigkeit vom Kurs",
    hint: "Fahr über das Diagramm",
    mcTitle: "Monte Carlo statt Formel",
    mcText:
      "Simuliere Endkurse mit geometrischer Brownscher Bewegung, mittle die abgezinsten Auszahlungen und vergleiche mit der Formel. Der Standardfehler schrumpft mit 1/√N.",
    mcRun: "Simulation starten",
    mcAgain: "Neu simulieren",
    paths: "Pfade",
    estimate: "Schätzung",
    stdError: "Std.-Fehler",
    error: "Abweichung",
  },
  en: {
    title: "BLACK-SCHOLES · EUROPEAN OPTION",
    spot: "Price S",
    strike: "Strike K",
    days: "Time to expiry",
    daysUnit: "days",
    vol: "Volatility σ",
    rate: "Rate r",
    call: "Call",
    put: "Put",
    metric: "Metric",
    price: "Price",
    delta: "Delta",
    gamma: "Gamma",
    vega: "Vega (per vol point)",
    theta: "Theta (per day)",
    parity: "Put-call parity: both sides always match, whatever values you set.",
    parityLeft: "C − P",
    parityRight: "S − K·e^(−rT)",
    curveToday: "Call value today",
    curveIntrinsic: "Intrinsic value",
    plotTitle: "Call price as a function of the underlying",
    hint: "Hover over the chart",
    mcTitle: "Monte Carlo instead of the formula",
    mcText:
      "Simulate terminal prices with geometric Brownian motion, average the discounted payoffs and compare with the formula. The standard error shrinks with 1/√N.",
    mcRun: "Run simulation",
    mcAgain: "Simulate again",
    paths: "Paths",
    estimate: "Estimate",
    stdError: "Std. error",
    error: "Deviation",
  },
} as const;

type McRow = { paths: number; price: number; stdError: number };

export function OptionPricer({ lang = "de" }: { lang?: Locale }) {
  const t = pricerCopy[lang];
  const [spot, setSpot] = useState(100);
  const [strike, setStrike] = useState(100);
  const [days, setDays] = useState(30);
  const [vol, setVol] = useState(0.6);
  const [rate, setRate] = useState(0.04);
  const [runs, setRuns] = useState(0);
  const [mc, setMc] = useState<McRow[] | null>(null);

  const years = days / DAYS_PER_YEAR;
  const bs = useMemo(() => blackScholes(spot, strike, years, rate, vol), [spot, strike, years, rate, vol]);

  const curve = useMemo(() => {
    const grid = Array.from({ length: 121 }, (_, i) => 40 + i);
    return {
      today: grid.map((x): Point => [x, blackScholes(x, strike, years, rate, vol).call]),
      intrinsic: grid.map((x): Point => [x, Math.max(x - strike, 0)]),
    };
  }, [strike, years, rate, vol]);

  function simulate() {
    const random = mulberry32(1000 + runs);
    setRuns(runs + 1);
    setMc(
      [1_000, 10_000, 100_000].map((paths) => ({
        paths,
        ...monteCarloCall(spot, strike, years, rate, vol, paths, random),
      })),
    );
  }

  // A run belongs to the inputs it was made with.
  const mcKey = `${spot}|${strike}|${days}|${vol}|${rate}`;
  const [mcFor, setMcFor] = useState(mcKey);
  if (mcFor !== mcKey) {
    setMcFor(mcKey);
    setMc(null);
  }

  const rows: [string, string, string][] = [
    [t.price, num(lang, bs.call), num(lang, bs.put)],
    [t.delta, num(lang, bs.callDelta, 3), num(lang, bs.putDelta, 3)],
    [t.gamma, num(lang, bs.gamma, 4), num(lang, bs.gamma, 4)],
    [t.vega, num(lang, bs.vega, 3), num(lang, bs.vega, 3)],
    [t.theta, signed(lang, bs.callTheta, 3), signed(lang, bs.putTheta, 3)],
  ];

  return (
    <Lab title={t.title}>
      <Controls>
        <Slider label={t.spot} value={spot} min={50} max={150} step={1} onChange={setSpot} format={(v) => num(lang, v, 0)} />
        <Slider label={t.strike} value={strike} min={50} max={150} step={1} onChange={setStrike} format={(v) => num(lang, v, 0)} />
        <Slider label={t.days} value={days} min={1} max={365} step={1} onChange={setDays} format={(v) => `${v} ${t.daysUnit}`} />
        <Slider label={t.vol} value={vol} min={0.05} max={1.5} step={0.05} onChange={setVol} format={(v) => pct(lang, v, 0)} />
        <Slider label={t.rate} value={rate} min={0} max={0.1} step={0.0025} onChange={setRate} format={(v) => pct(lang, v, 2)} />
      </Controls>

      <div className="lab__table-wrap">
        <table className="lab__table">
          <thead>
            <tr>
              <th>{t.metric}</th>
              <th>{t.call}</th>
              <th>{t.put}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, call, put]) => (
              <tr key={label}>
                <td>{label}</td>
                <td className="tnum">{call}</td>
                <td className="tnum">{put}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="lab__note">{t.parity}</p>
      <Stats>
        <Stat raw label={t.parityLeft} value={signed(lang, bs.call - bs.put, 4)} />
        <Stat
          raw
          label={t.parityRight}
          value={signed(lang, spot - strike * Math.exp(-rate * years), 4)}
        />
      </Stats>

      <Plot
        title={t.plotTitle}
        series={[
          { label: t.curveToday, points: curve.today },
          { label: t.curveIntrinsic, points: curve.intrinsic, tone: "muted", dashed: true },
        ]}
        xLabel="S"
        formatX={(v) => num(lang, v, 0)}
        formatY={(v) => num(lang, v, 0)}
        hint={t.hint}
        markers={[{ x: spot, label: "S" }, { x: strike, label: "K" }]}
        height={220}
      />

      <div className="lab__subsection">
        <h4 className="lab__subhead">{t.mcTitle}</h4>
        <p className="lab__note">{t.mcText}</p>
        <button type="button" className="btn btn--secondary lab__button" onClick={simulate}>
          {mc ? t.mcAgain : t.mcRun}
        </button>
        {mc ? (
          <div className="lab__table-wrap">
            <table className="lab__table">
              <thead>
                <tr>
                  <th>{t.paths}</th>
                  <th>{t.estimate}</th>
                  <th>{t.stdError}</th>
                  <th>{t.error}</th>
                </tr>
              </thead>
              <tbody>
                {mc.map((row) => (
                  <tr key={row.paths}>
                    <td className="tnum">{num(lang, row.paths, 0)}</td>
                    <td className="tnum">{num(lang, row.price, 3)}</td>
                    <td className="tnum">± {num(lang, row.stdError, 3)}</td>
                    <td className="tnum">{signed(lang, row.price - bs.call, 3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </Lab>
  );
}
