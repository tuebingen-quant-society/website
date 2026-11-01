"use client";

/**
 * Two explorers that replace long lists: the quirks of crypto markets as a
 * set of tiles, and the strategy landscape as a map you can click through.
 */
import { useState } from "react";
import type { Locale } from "@/i18n";
import { Lab, Segmented, useWidth } from "./ui";
import { useMissions, useWorkshop } from "./workshop";

/* ------------------------------------------------------------ Market map */

type Quirk = { id: string; glyph: string; title: string; text: string };

const quirks: Record<Locale, Quirk[]> = {
  de: [
    {
      id: "always",
      glyph: "24/7",
      title: "Rund um die Uhr",
      text: "Kein Börsenschluss, keine Feiertage. Nachts und am Wochenende ist weniger Liquidität im Markt; Bewegungen fallen dann oft größer aus.",
    },
    {
      id: "fragmented",
      glyph: "×100",
      title: "Fragmentiert",
      text: "Derselbe Coin handelt auf dutzenden Börsen, gegen verschiedene Stablecoins und als Spot, Future, Perp und Option. Preisunterschiede sind deshalb häufiger als bei einer Aktie mit einer Heimatbörse.",
    },
    {
      id: "venues",
      glyph: "CEX/DEX",
      title: "Zwei Arten Börse",
      text: "Zentrale Börsen wie Binance, Coinbase oder Kraken arbeiten wie klassische Börsen mit Orderbuch und Verwahrung. Dezentrale Börsen wie Uniswap oder Hyperliquid laufen auf einer Blockchain; du handelst aus deiner eigenen Wallet.",
    },
    {
      id: "stable",
      glyph: "1 $",
      title: "Stablecoins",
      text: "USDT und USDC sollen 1 $ wert sein und sind die eigentliche Handelswährung. Sie können sich lösen: USDC fiel im März 2023 nach dem Zusammenbruch der Silicon Valley Bank kurz auf etwa 0,88 $.",
    },
    {
      id: "counterparty",
      glyph: "FTX",
      title: "Gegenpartei",
      text: "Auf einer zentralen Börse ist dein Guthaben rechtlich oft nur eine Forderung gegen die Börse. Bei FTX waren im November 2022 Milliarden an Kundengeldern weg.",
    },
    {
      id: "rules",
      glyph: "MiCA",
      title: "Regulierung",
      text: "In der EU gilt seit Ende 2024 vollständig die MiCA-Verordnung. Sie lizenziert Krypto-Dienstleister und Stablecoin-Emittenten.",
    },
  ],
  en: [
    {
      id: "always",
      glyph: "24/7",
      title: "Always open",
      text: "No closing bell, no holidays. Liquidity is thinner at night and at weekends; moves are often larger then.",
    },
    {
      id: "fragmented",
      glyph: "×100",
      title: "Fragmented",
      text: "The same coin trades on dozens of exchanges, against different stablecoins, and as spot, future, perp and option. Price gaps are therefore more common than for a stock with one home exchange.",
    },
    {
      id: "venues",
      glyph: "CEX/DEX",
      title: "Two kinds of exchange",
      text: "Centralised exchanges such as Binance, Coinbase or Kraken work like classic exchanges with an order book and custody. Decentralised exchanges such as Uniswap or Hyperliquid run on a blockchain; you trade from your own wallet.",
    },
    {
      id: "stable",
      glyph: "$1",
      title: "Stablecoins",
      text: "USDT and USDC are meant to be worth $1 and are the actual trading currency. They can slip: USDC briefly fell to about $0.88 in March 2023 after Silicon Valley Bank collapsed.",
    },
    {
      id: "counterparty",
      glyph: "FTX",
      title: "Counterparty",
      text: "On a centralised exchange your balance is often legally just a claim against the exchange. At FTX, billions in customer funds were gone in November 2022.",
    },
    {
      id: "rules",
      glyph: "MiCA",
      title: "Regulation",
      text: "Since the end of 2024 the EU's MiCA regulation applies in full. It licenses crypto service providers and stablecoin issuers.",
    },
  ],
};

const mapCopy = {
  de: {
    title: "KRYPTO · SECHS EIGENHEITEN",
    missions: "Aufgaben",
    mAll: "Öffne alle sechs Eigenheiten.",
    pick: "Eigenheit wählen",
  },
  en: {
    title: "CRYPTO · SIX QUIRKS",
    missions: "Try this",
    mAll: "Open all six quirks.",
    pick: "Pick a quirk",
  },
} as const;

export function MarketMap({ lang = "de" }: { lang?: Locale }) {
  const t = mapCopy[lang];
  const list = quirks[lang];
  const [selected, setSelected] = useState(list[0].id);
  const [seen, setSeen] = useState<Set<string>>(() => new Set([list[0].id]));
  const current = list.find((q) => q.id === selected)!;

  const missions = useMissions("markets", [
    { id: "all", label: t.mAll, done: seen.size === list.length },
  ]);

  return (
    <Lab title={t.title} missions={{ title: t.missions, items: missions }}>
      <div className="lab__tiles" role="group" aria-label={t.pick}>
        {list.map((quirk) => (
          <button
            key={quirk.id}
            type="button"
            className={`lab__tile${seen.has(quirk.id) ? " is-seen" : ""}`}
            aria-pressed={quirk.id === selected}
            onClick={() => {
              setSelected(quirk.id);
              setSeen((s) => new Set(s).add(quirk.id));
            }}
          >
            <span className="lab__tile-glyph">{quirk.glyph}</span>
            <span className="lab__tile-title">{quirk.title}</span>
          </button>
        ))}
      </div>
      <div className="lab__detail" key={current.id} aria-live="polite">
        <p className="lab__detail-title">{current.title}</p>
        <p>{current.text}</p>
      </div>
    </Lab>
  );
}

/* ------------------------------------------------------------ Strategy map */

type Strategy = {
  id: string;
  /** 0 = only a statistical edge, 1 = profit fixed at entry. */
  certainty: number;
  /** 0 = patience and capital, 1 = speed and technology. */
  speed: number;
  anchor?: "start" | "end";
  module?: string;
};

const strategyShape: Strategy[] = [
  { id: "cashCarry", certainty: 0.9, speed: 0.12, anchor: "end", module: "futures" },
  { id: "fundingCarry", certainty: 0.72, speed: 0.26, anchor: "end", module: "arbitrage" },
  { id: "optionsArb", certainty: 0.86, speed: 0.5, anchor: "end", module: "pricing" },
  { id: "crossExchange", certainty: 0.9, speed: 0.72, anchor: "end", module: "arbitrage" },
  { id: "triangle", certainty: 0.94, speed: 0.9, anchor: "end", module: "arbitrage" },
  { id: "cexDex", certainty: 0.66, speed: 0.95, anchor: "end", module: "markets" },
  { id: "marketMaking", certainty: 0.42, speed: 0.82 },
  { id: "volTrading", certainty: 0.3, speed: 0.38, module: "pricing" },
  { id: "statArb", certainty: 0.12, speed: 0.58 },
];

type StrategyText = { name: string; earn: string; risk: string; text: string };

const strategyText: Record<Locale, Record<string, StrategyText>> = {
  de: {
    cashCarry: {
      name: "Cash and Carry",
      earn: "Basis bis zur Fälligkeit",
      risk: "Margin, Börsenausfall",
      text: "Spot kaufen, Quartals-Future verkaufen, bis zur Fälligkeit halten. Die Rendite steht für die Laufzeit fest; das Kapital ist bis zum Verfall gebunden.",
    },
    fundingCarry: {
      name: "Funding-Carry",
      earn: "Funding auf der Short-Seite",
      risk: "Negatives Funding, Liquidation, ADL",
      text: "Spot long, Perp short, gleicher Nominalwert. Kursbewegungen heben sich auf, übrig bleibt das Funding. Der Ertrag schwankt; aussteigen kannst du jederzeit.",
    },
    optionsArb: {
      name: "Optionsarbitrage",
      earn: "Paritätsverletzung, Box-Zins",
      risk: "Liquidität, Margin",
      text: "Die Put-Call-Parität muss auf jeder Börse gelten. Eine Box aus Bull Call Spread und Bear Put Spread zahlt sicher die Strike-Differenz; ihr Preis verrät einen Zins, den du einlocken kannst.",
    },
    crossExchange: {
      name: "Cross-Exchange",
      earn: "Preisunterschied",
      risk: "Latenz, Bestände auf zwei Börsen",
      text: "Auf der billigen Börse kaufen, auf der teuren verkaufen. Überwiesen wird dabei nichts: Man hält auf beiden Seiten Bestände und gleicht gelegentlich aus.",
    },
    triangle: {
      name: "Dreieck",
      earn: "Fehlbewertung des Kreuzkurses",
      risk: "Ausführung, drei Gebühren",
      text: "Drei Paare auf einer Börse: USD → BTC → ETH → USD. Passt ETH/BTC nicht zu den Dollarkursen und deckt die Lücke drei Gebühren, bleibt ein Gewinn.",
    },
    cexDex: {
      name: "CEX-DEX und MEV",
      earn: "Abweichung Pool zu Markt",
      risk: "Gas, Konkurrenz um den Block",
      text: "Große Orders schieben einen Pool vom Marktpreis weg; Arbitrageure holen ihn zurück. Die Reihenfolge im Block ist verhandelbar, den Gewinn daraus nennt man MEV.",
    },
    marketMaking: {
      name: "Market Making",
      earn: "Spread, Gebührenrabatte",
      risk: "Inventar, Adverse Selection",
      text: "Gleichzeitig Kauf- und Verkaufskurse stellen und den Spread verdienen. Gefährlich sind Inventar, das gegen dich läuft, und Gegenparteien, die mehr wissen als du.",
    },
    volTrading: {
      name: "Vol-Trading",
      earn: "Implizit minus realisiert",
      risk: "Crashs, Sprünge",
      text: "Option verkaufen und das Delta laufend absichern: Gewinn, solange die realisierte Vol unter der impliziten bleibt. Umgekehrt verdient Gamma Scalping an großen Bewegungen und zahlt dafür Theta.",
    },
    statArb: {
      name: "Statistische Arbitrage",
      earn: "Rückkehr zum Mittelwert",
      risk: "Regimewechsel, Overfitting",
      text: "Pairs Trade: BTC und ETH laufen meist ähnlich. Öffnet sich das Verhältnis weit, den billigeren kaufen und den teureren verkaufen. Out-of-sample-Tests zählen hier mehr als das Modell.",
    },
  },
  en: {
    cashCarry: {
      name: "Cash and carry",
      earn: "Basis until expiry",
      risk: "Margin, exchange failure",
      text: "Buy spot, sell the quarterly future, hold to expiry. The return is fixed for the term; the capital is tied up until expiry.",
    },
    fundingCarry: {
      name: "Funding carry",
      earn: "Funding on the short side",
      risk: "Negative funding, liquidation, ADL",
      text: "Long spot, short perp, same notional. Price moves cancel out and the funding is what remains. The income varies; you can exit at any time.",
    },
    optionsArb: {
      name: "Options arbitrage",
      earn: "Parity violations, box rate",
      risk: "Liquidity, margin",
      text: "Put-call parity has to hold on every exchange. A box of a bull call spread and a bear put spread always pays the strike difference; its price implies a rate you can lock in.",
    },
    crossExchange: {
      name: "Cross-exchange",
      earn: "Price difference",
      risk: "Latency, inventory on two venues",
      text: "Buy on the cheap exchange, sell on the expensive one. Nothing gets transferred: you hold inventory on both sides and rebalance now and then.",
    },
    triangle: {
      name: "Triangle",
      earn: "Mispriced cross rate",
      risk: "Execution, three fees",
      text: "Three pairs on one exchange: USD → BTC → ETH → USD. If ETH/BTC does not match the dollar prices and the gap covers three fees, a profit remains.",
    },
    cexDex: {
      name: "CEX-DEX and MEV",
      earn: "Pool versus market gap",
      risk: "Gas, competition for the block",
      text: "Large orders push a pool away from the market price; arbitrageurs bring it back. Transaction order within a block is negotiable, and the profit from it is called MEV.",
    },
    marketMaking: {
      name: "Market making",
      earn: "Spread, fee rebates",
      risk: "Inventory, adverse selection",
      text: "Quote buy and sell prices at the same time and earn the spread. The danger is inventory that moves against you and counterparties who know more than you.",
    },
    volTrading: {
      name: "Vol trading",
      earn: "Implied minus realised",
      risk: "Crashes, jumps",
      text: "Sell an option and hedge its delta continuously: you profit while realised vol stays below implied. Conversely, gamma scalping earns on large moves and pays theta for it.",
    },
    statArb: {
      name: "Statistical arbitrage",
      earn: "Mean reversion",
      risk: "Regime change, overfitting",
      text: "Pairs trade: BTC and ETH usually move together. When the ratio opens up, buy the cheaper and sell the dearer. Out-of-sample tests matter more than the model here.",
    },
  },
};

const explorerCopy = {
  de: {
    title: "STRATEGIEKARTE · WO QUANTS IN KRYPTO VERDIENEN",
    missions: "Aufgaben",
    mThree: "Vergleich drei Strategien auf der Karte.",
    mAll: "Sieh dir alle neun an.",
    xLow: "statistischer Vorteil",
    xHigh: "Gewinn beim Einstieg fest",
    yLow: "Geduld und Kapital",
    yHigh: "Tempo und Technik",
    earn: "Du verdienst",
    risk: "Hauptrisiko",
    tryIt: "Im Labor ausprobieren",
    pick: "Strategie wählen",
  },
  en: {
    title: "STRATEGY MAP · WHERE QUANTS EARN IN CRYPTO",
    missions: "Try this",
    mThree: "Compare three strategies on the map.",
    mAll: "Look at all nine.",
    xLow: "statistical edge",
    xHigh: "profit fixed at entry",
    yLow: "patience and capital",
    yHigh: "speed and technology",
    earn: "You earn",
    risk: "Main risk",
    tryIt: "Try it in the lab",
    pick: "Pick a strategy",
  },
} as const;

export function StrategyExplorer({ lang = "de" }: { lang?: Locale }) {
  const t = explorerCopy[lang];
  const texts = strategyText[lang];
  const workshop = useWorkshop();
  const [selected, setSelected] = useState("fundingCarry");
  const [seen, setSeen] = useState<Set<string>>(() => new Set(["fundingCarry"]));
  const current = strategyShape.find((s) => s.id === selected)!;
  const text = texts[selected];

  const pick = (id: string) => {
    setSelected(id);
    setSeen((s) => new Set(s).add(id));
  };

  const missions = useMissions("strategies", [
    { id: "three", label: t.mThree, done: seen.size >= 3 },
    { id: "all", label: t.mAll, done: seen.size === strategyShape.length },
  ]);

  const W = 560;
  const H = 300;
  const pad = { l: 28, r: 20, t: 22, b: 30 };
  const sx = (v: number) => pad.l + v * (W - pad.l - pad.r);
  const sy = (v: number) => H - pad.b - v * (H - pad.t - pad.b);
  const module = current.module ? workshop?.modules.find((m) => m.id === current.module) : undefined;
  const [wrap, width] = useWidth<HTMLDivElement>(680);
  // Below this width the map's labels would shrink past legibility; the
  // same strategies become a list of buttons instead.
  const compact = width < 520;

  return (
    <Lab title={t.title} missions={{ title: t.missions, items: missions }}>
      <div ref={wrap}>
        {compact ? (
          <Segmented
            label={t.pick}
            value={selected}
            onChange={pick}
            size="small"
            options={strategyShape
              .slice()
              .sort((a, b) => b.certainty - a.certainty)
              .map((s) => ({ value: s.id, label: texts[s.id].name }))}
          />
        ) : (
          <figure className="lab__plot lab__map">
            <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={t.pick}>
              <line x1={pad.l} x2={W - pad.r} y1={H - pad.b} y2={H - pad.b} className="lab__axis-zero" />
              <line x1={pad.l} x2={pad.l} y1={pad.t} y2={H - pad.b} className="lab__axis-zero" />
              <text x={pad.l} y={H - 8} className="lab__tick">← {t.xLow}</text>
              <text x={W - pad.r} y={H - 8} textAnchor="end" className="lab__tick">{t.xHigh} →</text>
              <text x={pad.l + 8} y={pad.t - 6} className="lab__tick">↑ {t.yHigh}</text>
              <text x={pad.l + 8} y={H - pad.b - 8} className="lab__tick lab__map-faint">{t.yLow}</text>
              {strategyShape.map((s) => {
                const active = s.id === selected;
                const x = sx(s.certainty);
                const y = sy(s.speed);
                const end = s.anchor === "end";
                return (
                  <g
                    key={s.id}
                    className={`lab__map-point${active ? " is-active" : ""}${seen.has(s.id) ? " is-seen" : ""}`}
                    role="button"
                    tabIndex={0}
                    aria-pressed={active}
                    aria-label={texts[s.id].name}
                    onClick={() => pick(s.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        pick(s.id);
                      }
                    }}
                  >
                    <circle cx={x} cy={y} r="18" className="lab__map-hit" />
                    <circle cx={x} cy={y} r={active ? 8 : 6} className="lab__map-dot" />
                    <text x={end ? x - 13 : x + 13} y={y + 4} textAnchor={end ? "end" : "start"} className="lab__map-label">
                      {texts[s.id].name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </figure>
        )}
      </div>
      <div className="lab__detail" key={selected} aria-live="polite">
        <p className="lab__detail-title">{text.name}</p>
        <p>{text.text}</p>
        <dl className="lab__facts">
          <div>
            <dt>{t.earn}</dt>
            <dd>{text.earn}</dd>
          </div>
          <div>
            <dt>{t.risk}</dt>
            <dd>{text.risk}</dd>
          </div>
        </dl>
        {module && workshop ? (
          <button type="button" className="link link--arrow lab__jump" onClick={() => workshop.go(module.id)}>
            <span className="link__label">
              {t.tryIt}: {module.label}
            </span>
          </button>
        ) : null}
      </div>
    </Lab>
  );
}
