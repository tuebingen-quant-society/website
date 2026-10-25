"use client";

import { useMemo, useState } from "react";
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

/* ------------------------------------------------------------ CEX arbitrage */

const BTC_USD = 100_000;
const ETH_USD = 3_500;

const arbCopy = {
  de: {
    title: "ARBITRAGE-CHECK · NACH GEBÜHREN",
    mode: "Art",
    cross: "Zwei Börsen",
    triangle: "Dreieck",
    priceA: "Preis Börse A",
    spread: "Preis Börse B gegenüber A",
    feeA: "Taker-Gebühr A",
    feeB: "Taker-Gebühr B",
    fixed: "Fixe Kosten (Transfer)",
    size: "Handelsgröße",
    gross: "Spread brutto",
    feeTotal: "Gebühren",
    breakeven: "Nötiger Spread",
    net: "Netto",
    crossYes: (side: string, net: string) =>
      `Kaufen auf ${side}, verkaufen auf der anderen Börse. Bleibt ${net} übrig, sofern beide Orders zu diesen Preisen gefüllt werden.`,
    crossNo: "Kein Trade: Der Spread deckt die Kosten nicht.",
    ethBtc: "ETH/BTC-Kurs gegenüber implizit",
    feeTri: "Gebühr pro Trade",
    implied: "Implizit ETH/BTC",
    quoted: "Notiert ETH/BTC",
    forward: "USD → BTC → ETH → USD",
    reverse: "USD → ETH → BTC → USD",
    triYes: (route: string, edge: string) => `Die Route ${route} bringt ${edge} pro Durchlauf.`,
    triNo: "Kein Trade: Nach drei Gebühren lohnt sich keine Richtung.",
    caption:
      "Beispielwerte: BTC 100.000 $, ETH 3.500 $. In der Praxis verschwinden solche Lücken in Millisekunden, und Slippage frisst einen Teil davon.",
  },
  en: {
    title: "ARBITRAGE CHECK · AFTER FEES",
    mode: "Type",
    cross: "Two exchanges",
    triangle: "Triangle",
    priceA: "Price on exchange A",
    spread: "Price on B relative to A",
    feeA: "Taker fee A",
    feeB: "Taker fee B",
    fixed: "Fixed cost (transfer)",
    size: "Trade size",
    gross: "Gross spread",
    feeTotal: "Fees",
    breakeven: "Spread needed",
    net: "Net",
    crossYes: (side: string, net: string) =>
      `Buy on ${side}, sell on the other exchange. ${net} is left over, provided both orders fill at these prices.`,
    crossNo: "No trade: the spread does not cover the costs.",
    ethBtc: "ETH/BTC quote relative to implied",
    feeTri: "Fee per trade",
    implied: "Implied ETH/BTC",
    quoted: "Quoted ETH/BTC",
    forward: "USD → BTC → ETH → USD",
    reverse: "USD → ETH → BTC → USD",
    triYes: (route: string, edge: string) => `The route ${route} earns ${edge} per loop.`,
    triNo: "No trade: after three fees neither direction pays.",
    caption:
      "Example values: BTC $100,000, ETH $3,500. In practice gaps like these close within milliseconds, and slippage eats part of them.",
  },
} as const;

export function ArbitrageLab({ lang = "de" }: { lang?: Locale }) {
  const t = arbCopy[lang];
  const [mode, setMode] = useState<"cross" | "triangle">("cross");
  const [spreadBps, setSpreadBps] = useState(25);
  const [feeA, setFeeA] = useState(10);
  const [feeB, setFeeB] = useState(10);
  const [fixed, setFixed] = useState(5);
  const [size, setSize] = useState(20_000);
  const [ethBtcBps, setEthBtcBps] = useState(18);
  const [feeTri, setFeeTri] = useState(5);

  const priceB = BTC_USD * (1 + spreadBps / 10_000);
  const cross = crossExchange(BTC_USD, priceB, feeA, feeB, fixed, size);
  const needed = cross.feeBps + (fixed / size) * 10_000;

  const implied = ETH_USD / BTC_USD;
  const quoted = implied * (1 + ethBtcBps / 10_000);
  const tri = triangularEdge(BTC_USD, ETH_USD, quoted, feeTri);
  const best = tri.forward >= tri.reverse ? { route: t.forward, edge: tri.forward } : { route: t.reverse, edge: tri.reverse };
  const bps = (v: number) => `${signed(lang, v * 10_000, 1)} bp`;

  return (
    <Lab title={t.title} caption={t.caption}>
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
          <Stats>
            <Stat label={t.gross} value={`${signed(lang, cross.grossBps, 1)} bp`} />
            <Stat label={t.feeTotal} value={`${num(lang, cross.feeBps, 1)} bp`} />
            <Stat label={t.breakeven} value={`${num(lang, needed, 1)} bp`} />
            <Stat label={t.net} value={money(lang, cross.net, 2, true)} tone={toneOf(cross.net)} emphasis />
          </Stats>
          <Verdict tone={cross.net > 0 ? "up" : undefined}>
            {cross.net > 0 ? t.crossYes(cross.buyOn, money(lang, cross.net, 2)) : t.crossNo}
          </Verdict>
          <Controls>
            <Slider label={t.spread} value={spreadBps} min={-60} max={60} step={1} onChange={setSpreadBps} format={(v) => `${signed(lang, v, 0)} bp`} />
            <Slider label={t.feeA} value={feeA} min={0} max={20} step={0.5} onChange={setFeeA} format={(v) => `${num(lang, v, 1)} bp`} />
            <Slider label={t.feeB} value={feeB} min={0} max={20} step={0.5} onChange={setFeeB} format={(v) => `${num(lang, v, 1)} bp`} />
            <Slider label={t.fixed} value={fixed} min={0} max={50} step={1} onChange={setFixed} format={(v) => money(lang, v, 0)} />
            <Slider label={t.size} value={size} min={1_000} max={200_000} step={1_000} onChange={setSize} format={(v) => money(lang, v, 0)} />
          </Controls>
        </>
      ) : (
        <>
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
    size: "Du verkaufst",
    fee: "Pool-Gebühr",
    received: "Du bekommst",
    average: "Durchschnittspreis",
    after: "Poolpreis danach",
    impact: "Price Impact",
    arb: "Arbitrage-Gewinn danach",
    arbNote: (eth: string, usd: string) =>
      `Der Pool notiert jetzt unter dem Börsenkurs von 3.500 $. Ein Arbitrageur kauft ${eth} ETH aus dem Pool zurück, verkauft sie an der Börse und behält ${usd}. So hängen DEX- und CEX-Preise zusammen.`,
    curve: "Price Impact nach Ordergröße",
    hint: "Fahr über das Diagramm",
    eth: "ETH",
    caption:
      "Constant-Product-Pool wie Uniswap v2. Der Arbitrage-Gewinn ignoriert Gas und die Gebühr auf dem Rückweg.",
  },
  en: {
    title: "AMM · x · y = k · POOL 1,000 ETH / 3.5M USDC",
    size: "You sell",
    fee: "Pool fee",
    received: "You receive",
    average: "Average price",
    after: "Pool price after",
    impact: "Price impact",
    arb: "Arbitrage profit afterwards",
    arbNote: (eth: string, usd: string) =>
      `The pool now quotes below the exchange price of $3,500. An arbitrageur buys ${eth} ETH back from the pool, sells it on the exchange and keeps ${usd}. That is how DEX and CEX prices stay linked.`,
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

  const swap = constantProductSwap(POOL_ETH, POOL_USD, size, fee);
  const arb = arbitrageToPrice(POOL_ETH + size, POOL_USD - swap.amountOut, ETH_USD);

  const curve = useMemo(
    () =>
      Array.from({ length: 101 }, (_, i): Point => {
        const amount = Math.max(i, 0.01);
        return [i, constantProductSwap(POOL_ETH, POOL_USD, amount, fee).impact * 100];
      }),
    [fee],
  );

  return (
    <Lab title={t.title} caption={t.caption}>
      <Stats>
        <Stat label={t.received} value={money(lang, swap.amountOut, 0)} />
        <Stat label={t.average} value={money(lang, swap.average, 2)} />
        <Stat label={t.after} value={money(lang, swap.spotAfter, 2)} />
        <Stat label={t.impact} value={pct(lang, -swap.impact, 2)} tone="down" emphasis />
        <Stat label={t.arb} value={money(lang, arb.profit, 2, true)} tone={toneOf(arb.profit)} />
      </Stats>
      <p className="lab__note">{t.arbNote(num(lang, arb.amountX, 2), money(lang, arb.profit, 2))}</p>
      <Plot
        title={t.curve}
        series={[{ label: t.curve, points: curve }]}
        xLabel={t.eth}
        formatX={(v) => `${num(lang, v, 0)} ETH`}
        formatY={(v) => (lang === "de" ? `${num(lang, v, 1)} %` : `${num(lang, v, 1)}%`)}
        hint={t.hint}
        markers={[{ x: size, label: `${num(lang, size, 0)} ETH` }]}
        height={200}
      />
      <Controls>
        <Slider label={t.size} value={size} min={1} max={100} step={1} onChange={setSize} format={(v) => `${num(lang, v, 0)} ETH`} />
        <Slider label={t.fee} value={fee} min={0} max={100} step={5} onChange={setFee} format={(v) => pct(lang, v / 10_000, 2)} />
      </Controls>
    </Lab>
  );
}
