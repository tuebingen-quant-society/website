"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/i18n";
import {
  annualisedBasis,
  DAYS_PER_YEAR,
  fairFuture,
  fundingCarry,
  gaussian,
  mulberry32,
  simulateFunding,
} from "@/lib/derivatives";
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
  useTweened,
  Verdict,
  type Point,
} from "./ui";
import { useMissions } from "./workshop";

const SPOT = 100;

/** Daily closes of a driftless random walk in log space, seeded. */
export function pricePath(seed: number, days: number, vol: number, steps = days): number[] {
  const random = mulberry32(seed);
  const dt = days / DAYS_PER_YEAR / steps;
  const path = [SPOT];
  let price = SPOT;
  for (let i = 0; i < steps; i++) {
    price *= Math.exp(-0.5 * vol * vol * dt + vol * Math.sqrt(dt) * gaussian(random));
    path.push(price);
  }
  return path;
}

/* ------------------------------------------------------------ Basis */

const basisCopy = {
  de: {
    title: "CASH AND CARRY · SPOT 100",
    missions: "Aufgaben",
    mFair: "Schieb den Future auf seinen fairen Preis.",
    mReverse: "Mach den Future so billig, dass sich der umgekehrte Trade lohnt.",
    mPlay: "Spiel zwei Kursverläufe ab und vergleich die Summe am Ende.",
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
      `Cash and Carry: Spot kaufen, Future verkaufen. Du verdienst ${excess} pro 100 mehr, als dich das Kapital kostet.`,
    reverse: (excess: string) =>
      `Reverse Cash and Carry: Spot leihen und verkaufen, Future kaufen. Bringt ${excess} pro 100, wenn du den Basiswert günstig leihen kannst.`,
    flat: "Kein Trade: Nach Zins und Gebühren bleibt nichts übrig.",
    runTitle: "Probelauf: Kurs zufällig, Ergebnis fest",
    play: "Kursverlauf abspielen",
    again: "Neuer Kursverlauf",
    day: "Tag",
    hint: "Fahr über das Diagramm",
    spotLeg: "Spot long",
    futureLeg: "Future short",
    total: "Summe",
    at: (day: number, price: string) => `Tag ${day} · Kurs ${price}`,
    caption:
      "Beispielwerte, keine Marktdaten. Fairer Preis S · e^(rT); Basis einfach annualisiert. Der Probelauf nutzt 60 % Volatilität; der Future läuft bis zur Fälligkeit auf den Spotpreis zu.",
  },
  en: {
    title: "CASH AND CARRY · SPOT 100",
    missions: "Try this",
    mFair: "Slide the future to its fair value.",
    mReverse: "Make the future cheap enough that the reverse trade pays.",
    mPlay: "Play two price paths and compare the total at expiry.",
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
      `Cash and carry: buy spot, sell the future. You earn ${excess} per 100 more than the capital costs you.`,
    reverse: (excess: string) =>
      `Reverse cash and carry: borrow and sell spot, buy the future. Earns ${excess} per 100 if you can borrow the underlying cheaply.`,
    flat: "No trade: nothing is left after interest and fees.",
    runTitle: "Dry run: random price, fixed result",
    play: "Play a price path",
    again: "New price path",
    day: "Day",
    hint: "Hover over the chart",
    spotLeg: "Spot long",
    futureLeg: "Future short",
    total: "Total",
    at: (day: number, price: string) => `Day ${day} · price ${price}`,
    caption:
      "Example values, not market data. Fair value S · e^(rT); simple annualised basis. The dry run uses 60% volatility; the future converges to spot by expiry.",
  },
} as const;

export function BasisLab({ lang = "de" }: { lang?: Locale }) {
  const t = basisCopy[lang];
  const [future, setFuture] = useState(101.8);
  const [days, setDays] = useState(90);
  const [rate, setRate] = useState(0.04);
  const [feeBps, setFeeBps] = useState(10);
  const [seed, setSeed] = useState(7);
  const [runs, setRuns] = useState(0);
  const clock = usePlayback(2600);

  const fair = fairFuture(SPOT, rate, days);
  const basis = annualisedBasis(SPOT, future, days);
  const fees = (SPOT * feeBps) / 10_000;
  const edge = future - fair - fees;
  const reverseEdge = fair - future - fees;

  const run = useMemo(() => {
    const path = pricePath(seed, days, 0.6);
    const spot: Point[] = [];
    const fut: Point[] = [];
    const sum: Point[] = [];
    path.forEach((price, day) => {
      const futurePrice = price * (future / SPOT) ** ((days - day) / days);
      spot.push([day, price - SPOT]);
      fut.push([day, future - futurePrice]);
      sum.push([day, price - SPOT + future - futurePrice - fees]);
    });
    const ys = [...spot, ...fut, ...sum].map(([, y]) => y);
    const reach = Math.max(8, ...ys.map(Math.abs)) * 1.08;
    return { path, spot, fut, sum, domain: [-reach, reach] as [number, number] };
  }, [seed, days, future, fees]);

  const shownDay = Math.round(clock.t * days);
  const cut = (points: Point[]) => points.slice(0, shownDay + 1);

  const missions = useMissions("basis", [
    { id: "fair", label: t.mFair, done: Math.abs(future - fair) < 0.06 },
    { id: "reverse", label: t.mReverse, done: reverseEdge > 0 },
    { id: "play", label: t.mPlay, done: runs >= 2 },
  ]);

  function play() {
    if (runs > 0) setSeed((s) => s + 1);
    clock.play(() => setRuns((r) => r + 1));
  }

  return (
    <Lab title={t.title} caption={t.caption} missions={{ title: t.missions, items: missions }}>
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

      <div className="lab__subsection">
        <div className="lab__subhead-row">
          <h4 className="lab__subhead">{t.runTitle}</h4>
          <PlayButton label={runs ? t.again : t.play} onClick={play} playing={clock.playing} />
        </div>
        <p className="lab__ticker tnum" aria-live="off">
          {t.at(shownDay, num(lang, run.path[shownDay], 2))}
        </p>
        <Plot
          title={t.runTitle}
          series={[
            { label: t.total, points: cut(run.sum) },
            { label: t.spotLeg, points: cut(run.spot), tone: "warm" },
            { label: t.futureLeg, points: cut(run.fut), tone: "muted", dashed: true },
          ]}
          xLabel={t.day}
          xDomain={[0, days]}
          yDomain={run.domain}
          formatX={(v) => num(lang, v, 0)}
          formatY={(v) => signed(lang, v, 0)}
          hint={t.hint}
          endDot
          height={220}
        />
        <Stats>
          <Stat label={t.spotLeg} value={signed(lang, run.spot[shownDay][1], 2)} tone={toneOf(run.spot[shownDay][1])} />
          <Stat label={t.futureLeg} value={signed(lang, run.fut[shownDay][1], 2)} tone={toneOf(run.fut[shownDay][1])} />
          <Stat label={t.total} value={signed(lang, run.sum[shownDay][1], 2)} tone={toneOf(run.sum[shownDay][1])} emphasis />
        </Stats>
      </div>
    </Lab>
  );
}

/* ------------------------------------------------------------ Funding carry */

const carryCopy = {
  de: {
    title: "FUNDING CARRY · SPOT LONG + PERP SHORT",
    missions: "Aufgaben",
    mFees: "Finde eine Haltedauer, bei der die Gebühren das Funding auffressen.",
    mReturn: "Bring die Rendite über 15 % p. a.",
    mSim: "Schalte auf simuliertes Funding und würfle einen neuen Pfad.",
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
      `Das Short-Bein wird bei einem Anstieg von etwa ${move} liquidiert. Die Spot-Seite gewinnt dann genauso viel, liegt aber auf einem anderen Konto; ohne Nachschuss ist die Absicherung weg.`,
    caption:
      "Vereinfachtes Modell: Funding auf den Nominalwert, keine Preisbewegung, Liquidation bei 0,5 % Maintenance Margin. Der simulierte Pfad ist erfunden und keine Prognose.",
  },
  en: {
    title: "FUNDING CARRY · SPOT LONG + PERP SHORT",
    missions: "Try this",
    mFees: "Find a holding period where fees eat all the funding.",
    mReturn: "Push the return above 15% p.a.",
    mSim: "Switch to simulated funding and roll a new path.",
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

  const line = useTweened(result.daily, `${mode}${seed}`);
  const liqMove = 1 / leverage - 0.005;

  const missions = useMissions("carry", [
    { id: "fees", label: t.mFees, done: rate > 0 && result.net < 0 },
    { id: "return", label: t.mReturn, done: result.annualisedReturn > 0.15 },
    { id: "sim", label: t.mSim, done: mode === "simulated" && seed > 11 },
  ]);

  return (
    <Lab title={t.title} caption={t.caption} missions={{ title: t.missions, items: missions }}>
      <div className="lab__toolbar">
        <Segmented
          label={t.mode}
          value={mode}
          onChange={setMode}
          size="small"
          options={[
            { value: "constant", label: t.constant },
            { value: "simulated", label: t.simulated },
          ]}
        />
        {mode === "simulated" ? (
          <PlayButton label={t.newPath} onClick={() => setSeed(seed + 1)} />
        ) : null}
      </div>
      <Plot
        title={t.pnl}
        series={[{ label: t.pnl, points: line }]}
        xLabel={t.day}
        formatX={(v) => num(lang, v, 0)}
        formatY={(v) => money(lang, v, 0, true)}
        hint={t.hint}
        endDot
        height={220}
      />
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
