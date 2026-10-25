"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/i18n";
import {
  annualisedBasis,
  DAYS_PER_YEAR,
  fairFuture,
  fundingCarry,
  liquidationPrice,
  mulberry32,
  simulateFunding,
  touchProbability,
  type Side,
} from "@/lib/derivatives";
import {
  Controls,
  Lab,
  money,
  num,
  pct,
  Plot,
  Segmented,
  signed,
  Slider,
  Stat,
  Stats,
  toneOf,
  Verdict,
  type Point,
} from "./ui";

const SPOT = 100;

/* ------------------------------------------------------------ Basis */

const basisCopy = {
  de: {
    title: "CASH AND CARRY · SPOT 100",
    future: "Futurespreis",
    days: "Restlaufzeit",
    daysUnit: "Tage",
    rate: "Dein Finanzierungszins",
    fees: "Gebühren gesamt",
    fair: "Fairer Preis",
    basis: "Basis p. a.",
    edge: "Gewinn über Finanzierung",
    perHundred: "pro 100",
    carry: (excess: string) =>
      `Cash and Carry: Spot kaufen, Future verkaufen. Du lockst die Basis ein und verdienst ${excess} pro 100 mehr, als dich das Kapital kostet.`,
    reverse: (excess: string) =>
      `Reverse Cash and Carry: Der Future ist zu billig. Spot leihen und verkaufen, Future kaufen; das bringt ${excess} pro 100, wenn du den Basiswert günstig leihen kannst.`,
    flat: "Kein Trade: Nach Zins und Gebühren bleibt nichts übrig.",
    table: "Ergebnis bei Fälligkeit, egal wo der Kurs landet",
    terminal: "Kurs bei Fälligkeit",
    spotLeg: "Spot long",
    futureLeg: "Future short",
    total: "Summe nach Gebühren",
    caption: "Beispielwerte, keine Marktdaten. Fairer Preis S · e^(rT); Basis einfach annualisiert: (F/S − 1) · 365 / Tage.",
  },
  en: {
    title: "CASH AND CARRY · SPOT 100",
    future: "Futures price",
    days: "Time to expiry",
    daysUnit: "days",
    rate: "Your funding rate",
    fees: "Total fees",
    fair: "Fair value",
    basis: "Basis p.a.",
    edge: "Profit above funding",
    perHundred: "per 100",
    carry: (excess: string) =>
      `Cash and carry: buy spot, sell the future. You lock in the basis and earn ${excess} per 100 more than the capital costs you.`,
    reverse: (excess: string) =>
      `Reverse cash and carry: the future is too cheap. Borrow and sell spot, buy the future; that earns ${excess} per 100 if you can borrow the underlying cheaply.`,
    flat: "No trade: nothing is left after interest and fees.",
    table: "Result at expiry, wherever the price ends up",
    terminal: "Price at expiry",
    spotLeg: "Spot long",
    futureLeg: "Future short",
    total: "Total after fees",
    caption: "Example values, not market data. Fair value S · e^(rT); simple annualised basis: (F/S − 1) · 365 / days.",
  },
} as const;

export function BasisLab({ lang = "de" }: { lang?: Locale }) {
  const t = basisCopy[lang];
  const [future, setFuture] = useState(101.8);
  const [days, setDays] = useState(90);
  const [rate, setRate] = useState(0.04);
  const [feeBps, setFeeBps] = useState(10);

  const fair = fairFuture(SPOT, rate, days);
  const basis = annualisedBasis(SPOT, future, days);
  const fees = (SPOT * feeBps) / 10_000;
  const edge = future - fair - fees;
  const reverseEdge = fair - future - fees;
  const outcomes = [70, 100, 130];

  return (
    <Lab title={t.title} caption={t.caption}>
      <Controls>
        <Slider label={t.future} value={future} min={98} max={106} step={0.05} onChange={setFuture} format={(v) => num(lang, v, 2)} />
        <Slider label={t.days} value={days} min={7} max={365} step={1} onChange={setDays} format={(v) => `${v} ${t.daysUnit}`} />
        <Slider label={t.rate} value={rate} min={0} max={0.12} step={0.0025} onChange={setRate} format={(v) => pct(lang, v, 2)} />
        <Slider label={t.fees} value={feeBps} min={0} max={50} step={1} onChange={setFeeBps} format={(v) => `${v} bp`} />
      </Controls>
      <Stats>
        <Stat label={t.fair} value={num(lang, fair, 2)} />
        <Stat label={t.basis} value={pct(lang, basis, 2, true)} tone={toneOf(basis)} />
        <Stat
          label={`${t.edge} (${t.perHundred})`}
          value={signed(lang, Math.max(edge, reverseEdge), 2)}
          tone={toneOf(Math.max(edge, reverseEdge))}
          emphasis
        />
      </Stats>
      <Verdict tone={edge > 0 || reverseEdge > 0 ? "up" : undefined}>
        {edge > 0
          ? t.carry(num(lang, edge, 2))
          : reverseEdge > 0
            ? t.reverse(num(lang, reverseEdge, 2))
            : t.flat}
      </Verdict>
      <div className="lab__table-wrap">
        <table className="lab__table">
          <caption className="lab__table-caption">{t.table}</caption>
          <thead>
            <tr>
              <th>{t.terminal}</th>
              <th>{t.spotLeg}</th>
              <th>{t.futureLeg}</th>
              <th>{t.total}</th>
            </tr>
          </thead>
          <tbody>
            {outcomes.map((end) => (
              <tr key={end}>
                <td className="tnum">{num(lang, end, 0)}</td>
                <td className="tnum">{signed(lang, end - SPOT, 2)}</td>
                <td className="tnum">{signed(lang, future - end, 2)}</td>
                <td className="tnum">{signed(lang, future - SPOT - fees, 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Lab>
  );
}

/* ------------------------------------------------------------ Funding carry */

const carryCopy = {
  de: {
    title: "FUNDING CARRY · SPOT LONG + PERP SHORT",
    notional: "Positionsgröße",
    rate: "Funding pro 8 h (Mittel)",
    days: "Haltedauer",
    daysUnit: "Tage",
    fee: "Gebühr pro Trade",
    leverage: "Hebel auf dem Perp",
    mode: "Funding-Verlauf",
    constant: "Konstant",
    simulated: "Simuliert",
    newPath: "Neuer Pfad",
    pnl: "Kumulierter Gewinn",
    day: "Tag",
    hint: "Fahr über das Diagramm",
    funding: "Funding erhalten",
    fees: "Gebühren (4 Trades)",
    net: "Netto",
    capital: "Gebundenes Kapital",
    annual: "Rendite p. a.",
    liquidation: (move: string) =>
      `Das Short-Bein wird bei einem Anstieg von etwa ${move} liquidiert. Die Spot-Seite gewinnt dann zwar genauso viel, liegt aber auf einem anderen Konto; ohne Nachschuss ist die Absicherung weg.`,
    caption:
      "Vereinfachtes Modell: Funding auf den Nominalwert, keine Preisbewegung, Liquidation bei 0,5 % Maintenance Margin. Der simulierte Pfad ist erfunden und keine Prognose.",
  },
  en: {
    title: "FUNDING CARRY · SPOT LONG + PERP SHORT",
    notional: "Position size",
    rate: "Funding per 8 h (mean)",
    days: "Holding period",
    daysUnit: "days",
    fee: "Fee per trade",
    leverage: "Leverage on the perp",
    mode: "Funding path",
    constant: "Constant",
    simulated: "Simulated",
    newPath: "New path",
    pnl: "Cumulative profit",
    day: "Day",
    hint: "Hover over the chart",
    funding: "Funding received",
    fees: "Fees (4 trades)",
    net: "Net",
    capital: "Capital tied up",
    annual: "Return p.a.",
    liquidation: (move: string) =>
      `The short leg gets liquidated after a rise of roughly ${move}. The spot side gains just as much, but it sits in a different account; without a top-up the hedge is gone.`,
    caption:
      "Simplified model: funding on notional, no price moves, liquidation at 0.5% maintenance margin. The simulated path is made up and not a forecast.",
  },
} as const;

export function FundingCarryLab({ lang = "de" }: { lang?: Locale }) {
  const t = carryCopy[lang];
  const [notional, setNotional] = useState(10_000);
  const [rate, setRate] = useState(0.0001);
  const [days, setDays] = useState(30);
  const [fee, setFee] = useState(5);
  const [leverage, setLeverage] = useState(3);
  const [mode, setMode] = useState<"constant" | "simulated">("constant");
  const [seed, setSeed] = useState(11);

  const result = useMemo(() => {
    const rates = mode === "constant" ? [rate] : simulateFunding(rate, days * 3, mulberry32(seed));
    return fundingCarry({ notional, ratesPer8h: rates, days, feeBpsPerLeg: fee, leverage });
  }, [notional, rate, days, fee, leverage, mode, seed]);

  const liqMove = 1 / leverage - 0.005;

  return (
    <Lab title={t.title} caption={t.caption}>
      <Segmented
        label={t.mode}
        value={mode}
        onChange={setMode}
        options={[
          { value: "constant", label: t.constant },
          { value: "simulated", label: t.simulated },
        ]}
      />
      <Plot
        title={t.pnl}
        series={[{ label: t.pnl, points: result.daily }]}
        xLabel={t.day}
        formatX={(v) => num(lang, v, 0)}
        formatY={(v) => money(lang, v, 0, true)}
        hint={t.hint}
        endDot
        height={220}
      />
      {mode === "simulated" ? (
        <button type="button" className="btn btn--secondary lab__button" onClick={() => setSeed(seed + 1)}>
          {t.newPath}
        </button>
      ) : null}
      <Stats>
        <Stat label={t.funding} value={money(lang, result.funding, 2, true)} tone={toneOf(result.funding)} />
        <Stat label={t.fees} value={money(lang, -result.fees, 2)} tone="down" />
        <Stat label={t.net} value={money(lang, result.net, 2, true)} tone={toneOf(result.net)} />
        <Stat label={t.capital} value={money(lang, result.capital, 0)} />
        <Stat label={t.annual} value={pct(lang, result.annualisedReturn, 2, true)} tone={toneOf(result.annualisedReturn)} emphasis />
      </Stats>
      <Controls>
        <Slider label={t.notional} value={notional} min={1_000} max={100_000} step={1_000} onChange={setNotional} format={(v) => money(lang, v, 0)} />
        <Slider label={t.rate} value={rate} min={-0.0003} max={0.001} step={0.00001} onChange={setRate} format={(v) => pct(lang, v, 3, true)} />
        <Slider label={t.days} value={days} min={1} max={365} step={1} onChange={setDays} format={(v) => `${v} ${t.daysUnit}`} />
        <Slider label={t.fee} value={fee} min={0} max={10} step={0.5} onChange={setFee} format={(v) => `${num(lang, v, 1)} bp`} />
        <Slider label={t.leverage} value={leverage} min={1} max={10} step={1} onChange={setLeverage} format={(v) => `${v}×`} />
      </Controls>
      <p className="lab__note">{t.liquidation(pct(lang, liqMove, 1))}</p>
    </Lab>
  );
}

/* ------------------------------------------------------------ Liquidation */

const liqCopy = {
  de: {
    title: "HEBEL · LIQUIDATIONSPREIS",
    side: "Richtung",
    long: "Long",
    short: "Short",
    leverage: "Hebel",
    maintenance: "Maintenance Margin",
    vol: "Volatilität p. a.",
    entry: "Einstieg",
    liq: "Liquidation bei",
    distance: "Abstand",
    sigmas: "Tagesbewegungen",
    touch: (d: number) => `P(Liquidation in ${d} ${d === 1 ? "Tag" : "Tagen"})`,
    curve: "P(Liquidation in 30 Tagen) nach Hebel",
    hint: "Fahr über das Diagramm",
    lev: "Hebel",
    caption:
      "Faustregel für eine isolierte Position ohne Gebühren. Die Wahrscheinlichkeit nimmt normalverteilte Renditen an; echte Krypto-Renditen haben dickere Ränder, die Zahl ist also eher zu niedrig.",
  },
  en: {
    title: "LEVERAGE · LIQUIDATION PRICE",
    side: "Side",
    long: "Long",
    short: "Short",
    leverage: "Leverage",
    maintenance: "Maintenance margin",
    vol: "Volatility p.a.",
    entry: "Entry",
    liq: "Liquidated at",
    distance: "Distance",
    sigmas: "Daily moves",
    touch: (d: number) => `P(liquidation within ${d} ${d === 1 ? "day" : "days"})`,
    curve: "P(liquidation within 30 days) by leverage",
    hint: "Hover over the chart",
    lev: "Leverage",
    caption:
      "Rule of thumb for an isolated position without fees. The probability assumes normally distributed returns; real crypto returns have fatter tails, so the number is more likely too low.",
  },
} as const;

export function LiquidationLab({ lang = "de" }: { lang?: Locale }) {
  const t = liqCopy[lang];
  const [side, setSide] = useState<Side>("long");
  const [leverage, setLeverage] = useState(10);
  const [maintenance, setMaintenance] = useState(0.005);
  const [vol, setVol] = useState(0.6);

  const liq = liquidationPrice(SPOT, leverage, maintenance, side);
  const distance = Math.abs(Math.log(liq / SPOT));
  const dailySigma = vol / Math.sqrt(DAYS_PER_YEAR);

  const curve = useMemo(
    () =>
      Array.from({ length: 100 }, (_, i): Point => {
        const lev = i + 1;
        const price = liquidationPrice(SPOT, lev, maintenance, side);
        if (price <= 0) return [lev, 0];
        return [lev, touchProbability(Math.abs(Math.log(price / SPOT)), vol, 30) * 100];
      }),
    [maintenance, side, vol],
  );

  return (
    <Lab title={t.title} caption={t.caption}>
      <Segmented
        label={t.side}
        value={side}
        onChange={setSide}
        options={[
          { value: "long", label: t.long },
          { value: "short", label: t.short },
        ]}
      />
      <Stats>
        <Stat label={t.entry} value={num(lang, SPOT, 2)} />
        <Stat label={t.liq} value={num(lang, Math.max(liq, 0), 2)} emphasis />
        <Stat label={t.distance} value={pct(lang, liq / SPOT - 1, 2, true)} tone={toneOf(side === "long" ? -1 : 1)} />
        <Stat label={t.sigmas} value={`${num(lang, distance / dailySigma, 1)} σ`} />
        {[1, 7, 30].map((d) => (
          <Stat key={d} label={t.touch(d)} value={pct(lang, touchProbability(distance, vol, d), 1)} />
        ))}
      </Stats>
      <Plot
        title={t.curve}
        series={[{ label: t.curve, points: curve }]}
        xLabel={t.lev}
        formatX={(v) => `${num(lang, v, 0)}×`}
        formatY={(v) => (lang === "de" ? `${num(lang, v, 0)} %` : `${num(lang, v, 0)}%`)}
        hint={t.hint}
        markers={[{ x: leverage, label: `${leverage}×` }]}
        yDomain={[0, 100]}
        height={200}
      />
      <Controls>
        <Slider label={t.leverage} value={leverage} min={1} max={100} step={1} onChange={setLeverage} format={(v) => `${v}×`} />
        <Slider label={t.maintenance} value={maintenance} min={0.002} max={0.02} step={0.001} onChange={setMaintenance} format={(v) => pct(lang, v, 1)} />
        <Slider label={t.vol} value={vol} min={0.2} max={1.2} step={0.05} onChange={setVol} format={(v) => pct(lang, v, 0)} />
      </Controls>
    </Lab>
  );
}
