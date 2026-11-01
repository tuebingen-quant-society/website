"use client";

import { useMemo, useState, type CSSProperties } from "react";
import type { Locale } from "@/i18n";
import {
  arbitrageToPrice,
  constantProductSwap,
  crossExchange,
  triangularEdge,
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
  useReducedMotion,
  Verdict,
  type Point,
} from "./ui";
import { useMissions } from "./workshop";

/* ------------------------------------------------------------ CEX arbitrage */

const BTC_USD = 100_000;
const ETH_USD = 3_500;
const LOOP = 10_000;

const arbCopy = {
  de: {
    title: "ARBITRAGE-CHECK · NACH GEBÜHREN",
    missions: "Aufgaben",
    mCross: "Finde den Spread, ab dem sich der Trade zwischen zwei Börsen lohnt.",
    mForward: "Finde eine profitable Dreiecks-Route, die mit BTC beginnt.",
    mReverse: "Und eine, die mit ETH beginnt.",
    mode: "Art",
    cross: "Zwei Börsen",
    triangle: "Dreieck",
    exchangeA: "Börse A",
    exchangeB: "Börse B",
    spread: "Preis Börse B gegenüber A",
    feeA: "Taker-Gebühr A",
    feeB: "Taker-Gebühr B",
    fixed: "Fixe Kosten (Transfer)",
    size: "Handelsgröße",
    gross: "Spread brutto",
    feeTotal: "Gebühren",
    breakeven: "Nötiger Spread",
    net: "Netto",
    buy: "kaufen",
    sell: "verkaufen",
    noTrade: "kein Trade",
    crossYes: (side: string, net: string) =>
      `Kaufen auf ${side}, verkaufen auf der anderen Börse. Bleibt ${net}, sofern beide Orders zu diesen Preisen gefüllt werden.`,
    crossNo: "Kein Trade: Der Spread deckt die Kosten nicht.",
    ethBtc: "ETH/BTC-Kurs gegenüber implizit",
    feeTri: "Gebühr pro Trade",
    implied: "Implizit ETH/BTC",
    quoted: "Notiert ETH/BTC",
    forward: "USD → BTC → ETH → USD",
    reverse: "USD → ETH → BTC → USD",
    start: "Start",
    triYes: (route: string, edge: string) => `Die Route ${route} bringt ${edge} pro Durchlauf.`,
    triNo: "Kein Trade: Nach drei Gebühren lohnt sich keine Richtung.",
    caption:
      "Beispielwerte: BTC 100.000 $, ETH 3.500 $. In der Praxis verschwinden solche Lücken in Millisekunden, und Slippage frisst einen Teil davon.",
  },
  en: {
    title: "ARBITRAGE CHECK · AFTER FEES",
    missions: "Try this",
    mCross: "Find the spread at which trading across two exchanges pays.",
    mForward: "Find a profitable triangle route that starts with BTC.",
    mReverse: "And one that starts with ETH.",
    mode: "Type",
    cross: "Two exchanges",
    triangle: "Triangle",
    exchangeA: "Exchange A",
    exchangeB: "Exchange B",
    spread: "Price on B relative to A",
    feeA: "Taker fee A",
    feeB: "Taker fee B",
    fixed: "Fixed cost (transfer)",
    size: "Trade size",
    gross: "Gross spread",
    feeTotal: "Fees",
    breakeven: "Spread needed",
    net: "Net",
    buy: "buy",
    sell: "sell",
    noTrade: "no trade",
    crossYes: (side: string, net: string) =>
      `Buy on ${side}, sell on the other exchange. ${net} is left over, provided both orders fill at these prices.`,
    crossNo: "No trade: the spread does not cover the costs.",
    ethBtc: "ETH/BTC quote relative to implied",
    feeTri: "Fee per trade",
    implied: "Implied ETH/BTC",
    quoted: "Quoted ETH/BTC",
    forward: "USD → BTC → ETH → USD",
    reverse: "USD → ETH → BTC → USD",
    start: "Start",
    triYes: (route: string, edge: string) => `The route ${route} earns ${edge} per loop.`,
    triNo: "No trade: after three fees neither direction pays.",
    caption:
      "Example values: BTC $100,000, ETH $3,500. In practice gaps like these close within milliseconds, and slippage eats part of them.",
  },
} as const;

/** Coins moving between two venues; the direction follows the trade. */
function Flow({
  left,
  right,
  direction,
  amount,
  drops = 4,
}: {
  left: string;
  right: string;
  direction: "left" | "right" | "none";
  amount: string;
  drops?: number;
}) {
  return (
    <div className="lab__flow" data-direction={direction} style={{ "--drops": drops } as CSSProperties}>
      <span className={`lab__flow-side${direction === "right" ? " is-paying" : ""}`}>{left}</span>
      <span className="lab__flow-track" aria-hidden="true">
        {direction === "none"
          ? null
          : Array.from({ length: drops }, (_, i) => (
              <i key={`${direction}${i}`} style={{ animationDelay: `${(-i * 1.6) / drops}s` }} />
            ))}
      </span>
      <span className={`lab__flow-side${direction === "left" ? " is-paying" : ""}`}>{right}</span>
      <span className="lab__flow-amount tnum" aria-live="polite">
        {amount}
      </span>
    </div>
  );
}

type Hop = { from: "USD" | "BTC" | "ETH"; amount: number };

/** The triangle as a picture: three books, the route and what you hold after each hop. */
function Triangle({
  hops,
  profitable,
  lang,
  start,
}: {
  hops: Hop[];
  profitable: boolean;
  lang: Locale;
  start: string;
}) {
  const reduced = useReducedMotion();
  const at = { USD: [60, 190], BTC: [210, 40], ETH: [360, 190] } as const;
  const order = hops.map((h) => h.from);
  const d = [...order, order[0]]
    .map((node, i) => `${i ? "L" : "M"}${at[node][0]},${at[node][1]}`)
    .join("");
  const digits = { USD: 2, BTC: 5, ETH: 4 } as const;
  const final = hops[hops.length - 1].amount;

  return (
    <figure className="lab__plot lab__triangle">
      <svg viewBox="0 0 420 240" role="img" aria-label={order.join(" → ")}>
        <path d="M60,190L210,40L360,190Z" className="lab__tri-edge" />
        <path d={d} className={profitable ? "lab__tri-route is-live" : "lab__tri-route"} />
        {profitable && !reduced ? (
          <circle r="6" className="lab__tri-coin">
            <animateMotion dur="3.2s" repeatCount="indefinite" path={d} />
          </circle>
        ) : null}
        {(Object.keys(at) as (keyof typeof at)[]).map((node) => {
          const hop = hops.find((h) => h.from === node)!;
          const [x, y] = at[node];
          const below = node !== "BTC";
          return (
            <g key={node}>
              <circle cx={x} cy={y} r="22" className="lab__tri-node" />
              <text x={x} y={y + 5} textAnchor="middle" className="lab__tri-name">
                {node}
              </text>
              <text x={x} y={below ? y + 42 : y - 32} textAnchor="middle" className="lab__tick">
                {node === "USD"
                  ? `${start} ${num(lang, hop.amount, 0)}`
                  : num(lang, hop.amount, digits[node])}
              </text>
            </g>
          );
        })}
        <text x="210" y="150" textAnchor="middle" className={`lab__tri-result${final >= LOOP ? " is-up" : " is-down"}`}>
          {signed(lang, final - LOOP, 2)} $
        </text>
      </svg>
    </figure>
  );
}

export function ArbitrageLab({ lang = "de" }: { lang?: Locale }) {
  const t = arbCopy[lang];
  const [mode, setMode] = useState<"cross" | "triangle">("cross");
  const [spreadBps, setSpreadBps] = useState(15);
  const [feeA, setFeeA] = useState(10);
  const [feeB, setFeeB] = useState(10);
  const [fixed, setFixed] = useState(5);
  const [size, setSize] = useState(20_000);
  const [ethBtcBps, setEthBtcBps] = useState(8);
  const [feeTri, setFeeTri] = useState(5);

  const priceB = BTC_USD * (1 + spreadBps / 10_000);
  const cross = crossExchange(BTC_USD, priceB, feeA, feeB, fixed, size);
  const needed = cross.feeBps + (fixed / size) * 10_000;

  const implied = ETH_USD / BTC_USD;
  const quoted = implied * (1 + ethBtcBps / 10_000);
  const tri = triangularEdge(BTC_USD, ETH_USD, quoted, feeTri);
  const forwardBest = tri.forward >= tri.reverse;
  const best = forwardBest ? { route: t.forward, edge: tri.forward } : { route: t.reverse, edge: tri.reverse };
  const bps = (v: number) => `${signed(lang, v * 10_000, 1)} bp`;

  const keep = 1 - feeTri / 10_000;
  const hops: Hop[] = forwardBest
    ? (() => {
        const btc = (LOOP / BTC_USD) * keep;
        const eth = (btc / quoted) * keep;
        return [
          { from: "USD", amount: LOOP },
          { from: "BTC", amount: btc },
          { from: "ETH", amount: eth },
          { from: "USD", amount: eth * ETH_USD * keep },
        ];
      })()
    : (() => {
        const eth = (LOOP / ETH_USD) * keep;
        const btc = eth * quoted * keep;
        return [
          { from: "USD", amount: LOOP },
          { from: "ETH", amount: eth },
          { from: "BTC", amount: btc },
          { from: "USD", amount: btc * BTC_USD * keep },
        ];
      })();

  const missions = useMissions("arbitrage", [
    { id: "cross", label: t.mCross, done: cross.net > 0 },
    { id: "forward", label: t.mForward, done: tri.forward > 0 },
    { id: "reverse", label: t.mReverse, done: tri.reverse > 0 },
  ]);

  const cheapFirst = cross.buyOn === "A";
  const direction = cross.net > 0 ? (cheapFirst ? "right" : "left") : "none";

  return (
    <Lab title={t.title} caption={t.caption} missions={{ title: t.missions, items: missions }}>
      <Segmented
        label={t.mode}
        value={mode}
        onChange={setMode}
        options={[
          { value: "cross", label: t.cross },
          { value: "triangle", label: t.triangle },
        ]}
      />
      {mode === "cross" ? (
        <>
          <Flow
            left={`${t.exchangeA} · ${money(lang, BTC_USD, 0)}`}
            right={`${t.exchangeB} · ${money(lang, priceB, 0)}`}
            direction={direction}
            amount={
              cross.net > 0
                ? `${cheapFirst ? t.exchangeA : t.exchangeB} ${t.buy} → ${cheapFirst ? t.exchangeB : t.exchangeA} ${t.sell}`
                : t.noTrade
            }
          />
          <Stats>
            <Stat label={t.gross} value={`${signed(lang, cross.grossBps, 1)} bp`} />
            <Stat label={t.feeTotal} value={`${num(lang, cross.feeBps, 1)} bp`} />
            <Stat label={t.breakeven} value={`${num(lang, needed, 1)} bp`} />
            <Stat label={t.net} value={money(lang, cross.net, 2, true)} tone={toneOf(cross.net)} emphasis />
          </Stats>
          <Verdict tone={cross.net > 0 ? "up" : undefined}>
            {cross.net > 0
              ? t.crossYes(cross.buyOn === "A" ? t.exchangeA : t.exchangeB, money(lang, cross.net, 2))
              : t.crossNo}
          </Verdict>
          <Controls>
            <Slider label={t.spread} value={spreadBps} min={-60} max={60} step={1} onChange={setSpreadBps} format={(v) => `${signed(lang, v, 0)} bp`} />
            <Slider label={t.size} value={size} min={1_000} max={200_000} step={1_000} onChange={setSize} format={(v) => money(lang, v, 0)} />
            <Slider label={t.feeA} value={feeA} min={0} max={20} step={0.5} onChange={setFeeA} format={(v) => `${num(lang, v, 1)} bp`} />
            <Slider label={t.feeB} value={feeB} min={0} max={20} step={0.5} onChange={setFeeB} format={(v) => `${num(lang, v, 1)} bp`} />
            <Slider label={t.fixed} value={fixed} min={0} max={50} step={1} onChange={setFixed} format={(v) => money(lang, v, 0)} />
          </Controls>
        </>
      ) : (
        <>
          <Triangle hops={hops} profitable={best.edge > 0} lang={lang} start={t.start} />
          <Stats>
            <Stat label={t.implied} value={num(lang, implied, 5)} />
            <Stat label={t.quoted} value={num(lang, quoted, 5)} />
            <Stat label={t.forward} value={bps(tri.forward)} tone={toneOf(tri.forward)} />
            <Stat label={t.reverse} value={bps(tri.reverse)} tone={toneOf(tri.reverse)} />
          </Stats>
          <Verdict tone={best.edge > 0 ? "up" : undefined}>
            {best.edge > 0 ? t.triYes(best.route, pct(lang, best.edge, 3)) : t.triNo}
          </Verdict>
          <Controls>
            <Slider label={t.ethBtc} value={ethBtcBps} min={-60} max={60} step={1} onChange={setEthBtcBps} format={(v) => `${signed(lang, v, 0)} bp`} />
            <Slider label={t.feeTri} value={feeTri} min={0} max={10} step={0.5} onChange={setFeeTri} format={(v) => `${num(lang, v, 1)} bp`} />
          </Controls>
        </>
      )}
    </Lab>
  );
}

/* ------------------------------------------------------------ AMM */

const POOL_ETH = 1_000;
const POOL_USD = POOL_ETH * ETH_USD;

const ammCopy = {
  de: {
    title: "AMM · x · y = k · POOL 1.000 ETH / 3,5 MIO. USDC",
    missions: "Aufgaben",
    mImpact: "Verkauf so viel, dass der Price Impact über 5 % liegt.",
    mArb: "Lass den Arbitrageur den Pool zurückschieben.",
    mFee: "Setz die Pool-Gebühr auf 0.",
    view: "Ansicht",
    curveView: "Kurve x · y = k",
    curveKey: "x · y = k, USDC in Mio.",
    impactView: "Price Impact",
    size: "Du verkaufst",
    fee: "Pool-Gebühr",
    received: "Du bekommst",
    average: "Durchschnittspreis",
    after: "Poolpreis danach",
    impact: "Price Impact",
    arb: "Arbitrage-Gewinn",
    arbRun: "Arbitrageur handeln lassen",
    arbAgain: "Nochmal ansehen",
    arbNote: (eth: string, usd: string) =>
      `Der Pool notiert jetzt unter dem Börsenkurs von 3.500 $. Ein Arbitrageur kauft ${eth} ETH aus dem Pool zurück, verkauft sie an der Börse und behält ${usd}.`,
    arbDone: "Der Pool steht wieder bei 3.500 $. Niemand hat ihm den Marktpreis gesagt; die Arbitrage hat ihn hingeschoben.",
    reserves: "ETH im Pool",
    usdc: "USDC im Pool",
    before: "vorher",
    pool: "Pool",
    curve: "Price Impact nach Ordergröße",
    hint: "Fahr über das Diagramm",
    eth: "ETH",
    caption:
      "Constant-Product-Pool wie Uniswap v2. Der Arbitrage-Gewinn ignoriert Gas und die Gebühr auf dem Rückweg.",
  },
  en: {
    title: "AMM · x · y = k · POOL 1,000 ETH / 3.5M USDC",
    missions: "Try this",
    mImpact: "Sell enough that the price impact goes above 5%.",
    mArb: "Let the arbitrageur push the pool back.",
    mFee: "Set the pool fee to 0.",
    view: "View",
    curveView: "Curve x · y = k",
    curveKey: "x · y = k, USDC in millions",
    impactView: "Price impact",
    size: "You sell",
    fee: "Pool fee",
    received: "You receive",
    average: "Average price",
    after: "Pool price after",
    impact: "Price impact",
    arb: "Arbitrage profit",
    arbRun: "Let the arbitrageur trade",
    arbAgain: "Watch again",
    arbNote: (eth: string, usd: string) =>
      `The pool now quotes below the exchange price of $3,500. An arbitrageur buys ${eth} ETH back from the pool, sells it on the exchange and keeps ${usd}.`,
    arbDone: "The pool is back at $3,500. Nobody told it the market price; the arbitrage pushed it there.",
    reserves: "ETH in pool",
    usdc: "USDC in pool",
    before: "before",
    pool: "Pool",
    curve: "Price impact by order size",
    hint: "Hover over the chart",
    eth: "ETH",
    caption:
      "Constant-product pool as in Uniswap v2. The arbitrage profit ignores gas and the fee on the way back.",
  },
} as const;

export function AmmLab({ lang = "de" }: { lang?: Locale }) {
  const t = ammCopy[lang];
  const [size, setSize] = useState(20);
  const [fee, setFee] = useState(30);
  const [view, setView] = useState<"curve" | "impact">("curve");
  const [arbFor, setArbFor] = useState<string | null>(null);
  const [arbRuns, setArbRuns] = useState(0);
  const clock = usePlayback(1800);

  const swap = constantProductSwap(POOL_ETH, POOL_USD, size, fee);
  const afterX = POOL_ETH + size;
  const afterY = POOL_USD - swap.amountOut;
  const arb = arbitrageToPrice(afterX, afterY, ETH_USD);
  const k = afterX * afterY;
  const targetX = afterX - arb.amountX;

  const inputs = `${size}|${fee}`;
  const arbActive = arbFor === inputs;
  const progress = arbActive ? clock.t : 0;
  const poolX = afterX + (targetX - afterX) * progress;
  const poolY = k / poolX;

  const curve = useMemo(
    () => Array.from({ length: 121 }, (_, i): Point => {
      const x = 960 + i * 1.5;
      return [x, k / x / 1e6];
    }),
    [k],
  );
  const impactCurve = useMemo(
    () =>
      Array.from({ length: 101 }, (_, i): Point => {
        const amount = Math.max(i, 0.01);
        return [i, constantProductSwap(POOL_ETH, POOL_USD, amount, fee).impact * 100];
      }),
    [fee],
  );

  const missions = useMissions("amm", [
    { id: "impact", label: t.mImpact, done: swap.impact > 0.05 },
    { id: "arb", label: t.mArb, done: arbRuns > 0 },
    { id: "fee", label: t.mFee, done: fee === 0 },
  ]);

  function runArb() {
    setArbFor(inputs);
    setView("curve");
    clock.play(() => setArbRuns((n) => n + 1));
  }

  const arbFinished = arbActive && !clock.playing;
  const fmtPct1 = (v: number) => (lang === "de" ? `${num(lang, v, 1)} %` : `${num(lang, v, 1)}%`);

  return (
    <Lab title={t.title} caption={t.caption} missions={{ title: t.missions, items: missions }}>
      <Stats>
        <Stat label={t.received} value={money(lang, swap.amountOut, 0)} />
        <Stat label={t.average} value={money(lang, swap.average, 2)} />
        <Stat label={t.after} value={money(lang, poolY / poolX, 2)} />
        <Stat label={t.impact} value={pct(lang, -swap.impact, 2)} tone="down" emphasis />
      </Stats>
      <div className="lab__toolbar">
        <Segmented
          label={t.view}
          value={view}
          onChange={setView}
          size="small"
          options={[
            { value: "curve", label: t.curveView },
            { value: "impact", label: t.impactView },
          ]}
        />
      </div>
      {view === "curve" ? (
        <Plot
          title={t.curveView}
          series={[{ label: t.curveKey, points: curve, tone: "muted" }]}
          xLabel={t.reserves}
          formatX={(v) => `${num(lang, v, 0)}`}
          formatY={(v) => num(lang, v, 2)}
          hint={t.hint}
          includeZero={false}
          dots={[
            { x: POOL_ETH, y: POOL_USD / 1e6, tone: "muted", label: t.before, anchor: "end" },
            { x: poolX, y: poolY / 1e6, tone: "accent", label: `${t.pool} ${money(lang, poolY / poolX, 0)}`, pulse: clock.playing },
          ]}
          height={230}
        />
      ) : (
        <Plot
          title={t.curve}
          series={[{ label: t.curve, points: impactCurve }]}
          xLabel={t.eth}
          formatX={(v) => `${num(lang, v, 0)} ETH`}
          formatY={fmtPct1}
          hint={t.hint}
          markers={[{ x: size, label: `${num(lang, size, 0)}`, onDrag: setSize, min: 1, max: 100, step: 1 }]}
          height={230}
        />
      )}
      <div className="lab__subhead-row">
        <p className="lab__note">
          {arbFinished ? t.arbDone : t.arbNote(num(lang, arb.amountX, 2), money(lang, arb.profit, 2))}
        </p>
        <PlayButton label={arbFinished ? t.arbAgain : t.arbRun} onClick={runArb} playing={clock.playing} />
      </div>
      <Stats>
        <Stat label={t.reserves} value={num(lang, poolX, 2)} />
        <Stat label={t.usdc} value={money(lang, poolY, 0)} />
        <Stat label={t.arb} value={money(lang, arb.profit * progress, 2, true)} tone={toneOf(arb.profit * progress)} />
      </Stats>
      <Controls>
        <Slider label={t.size} value={size} min={1} max={100} step={1} onChange={setSize} format={(v) => `${num(lang, v, 0)} ETH`} />
        <Slider label={t.fee} value={fee} min={0} max={100} step={5} onChange={setFee} format={(v) => pct(lang, v / 10_000, 2)} />
      </Controls>
    </Lab>
  );
}
