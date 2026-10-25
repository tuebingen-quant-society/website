/**
 * Pricing and arbitrage math behind the interactive derivatives article.
 *
 * Pure functions only, so the widgets stay thin and everything here is covered
 * by derivatives.test.ts. Rates are decimals (0.04 = 4 %), time is in years
 * unless a parameter says days, fees are in basis points (1 bp = 0.01 %).
 */

const SQRT_2PI = Math.sqrt(2 * Math.PI);
export const DAYS_PER_YEAR = 365;

/** Standard normal density. */
export function normPdf(x: number): number {
  return Math.exp(-0.5 * x * x) / SQRT_2PI;
}

/**
 * Standard normal CDF via the complementary error function (W. J. Cody's
 * rational approximation through erfc, absolute error below 1.2e-7).
 */
export function normCdf(x: number): number {
  const z = Math.abs(x) / Math.SQRT2;
  const t = 1 / (1 + 0.5 * z);
  const erfc =
    t *
    Math.exp(
      -z * z -
        1.26551223 +
        t *
          (1.00002368 +
            t *
              (0.37409196 +
                t *
                  (0.09678418 +
                    t *
                      (-0.18628806 +
                        t *
                          (0.27886807 +
                            t *
                              (-1.13520398 +
                                t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))),
    );
  return x >= 0 ? 1 - 0.5 * erfc : 0.5 * erfc;
}

export type BlackScholes = {
  call: number;
  put: number;
  d1: number;
  d2: number;
  callDelta: number;
  putDelta: number;
  gamma: number;
  /** Price change per 1 volatility point (0.01). */
  vega: number;
  /** Price change per calendar day. */
  callTheta: number;
  putTheta: number;
};

/** European options on a non-dividend underlying. */
export function blackScholes(
  spot: number,
  strike: number,
  years: number,
  rate: number,
  vol: number,
): BlackScholes {
  const discount = Math.exp(-rate * years);
  if (years <= 0 || vol <= 0) {
    const forwardIntrinsic = spot - strike * discount;
    const call = Math.max(forwardIntrinsic, 0);
    const put = Math.max(-forwardIntrinsic, 0);
    const itm = spot > strike ? 1 : 0;
    return {
      call,
      put,
      d1: 0,
      d2: 0,
      callDelta: itm,
      putDelta: itm - 1,
      gamma: 0,
      vega: 0,
      callTheta: 0,
      putTheta: 0,
    };
  }

  const sqrtT = Math.sqrt(years);
  const d1 = (Math.log(spot / strike) + (rate + 0.5 * vol * vol) * years) / (vol * sqrtT);
  const d2 = d1 - vol * sqrtT;
  const call = spot * normCdf(d1) - strike * discount * normCdf(d2);
  const put = strike * discount * normCdf(-d2) - spot * normCdf(-d1);
  const decay = (-spot * normPdf(d1) * vol) / (2 * sqrtT);

  return {
    call,
    put,
    d1,
    d2,
    callDelta: normCdf(d1),
    putDelta: normCdf(d1) - 1,
    gamma: normPdf(d1) / (spot * vol * sqrtT),
    vega: (spot * normPdf(d1) * sqrtT) / 100,
    callTheta: (decay - rate * strike * discount * normCdf(d2)) / DAYS_PER_YEAR,
    putTheta: (decay + rate * strike * discount * normCdf(-d2)) / DAYS_PER_YEAR,
  };
}

/** Small, fast, seedable PRNG (mulberry32), so simulations are reproducible. */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Standard normal draw (Box-Muller). */
export function gaussian(random: () => number): number {
  let u = 0;
  while (u === 0) u = random();
  const v = random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/**
 * Monte Carlo price of a European call under geometric Brownian motion.
 * Returns the estimate and its standard error.
 */
export function monteCarloCall(
  spot: number,
  strike: number,
  years: number,
  rate: number,
  vol: number,
  paths: number,
  random: () => number,
): { price: number; stdError: number } {
  const drift = (rate - 0.5 * vol * vol) * years;
  const diffusion = vol * Math.sqrt(years);
  const discount = Math.exp(-rate * years);
  let sum = 0;
  let sumSq = 0;
  for (let i = 0; i < paths; i++) {
    const terminal = spot * Math.exp(drift + diffusion * gaussian(random));
    const payoff = discount * Math.max(terminal - strike, 0);
    sum += payoff;
    sumSq += payoff * payoff;
  }
  const mean = sum / paths;
  const variance = Math.max(sumSq / paths - mean * mean, 0);
  return { price: mean, stdError: Math.sqrt(variance / paths) };
}

/* ------------------------------------------------------------ Option payoffs */

export type Leg =
  | { kind: "call" | "put"; strike: number; quantity: number }
  | { kind: "spot"; quantity: number };

/** Value of a set of legs at expiry, per unit of the underlying. */
export function payoffAtExpiry(legs: Leg[], price: number): number {
  return legs.reduce((total, leg) => {
    if (leg.kind === "spot") return total + leg.quantity * price;
    const intrinsic =
      leg.kind === "call" ? Math.max(price - leg.strike, 0) : Math.max(leg.strike - price, 0);
    return total + leg.quantity * intrinsic;
  }, 0);
}

/** Black-Scholes value of the same legs before expiry. */
export function valueBeforeExpiry(
  legs: Leg[],
  price: number,
  years: number,
  rate: number,
  vol: number,
): number {
  return legs.reduce((total, leg) => {
    if (leg.kind === "spot") return total + leg.quantity * price;
    const bs = blackScholes(price, leg.strike, years, rate, vol);
    return total + leg.quantity * (leg.kind === "call" ? bs.call : bs.put);
  }, 0);
}

/** Price where a sampled P&L curve crosses zero, by linear interpolation. */
export function zeroCrossings(points: [number, number][]): number[] {
  const crossings: number[] = [];
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    if (y0 === 0 && (i === 1 || points[i - 2][1] !== 0)) crossings.push(x0);
    else if ((y0 < 0 && y1 > 0) || (y0 > 0 && y1 < 0)) {
      crossings.push(x0 + ((x1 - x0) * -y0) / (y1 - y0));
    }
  }
  return crossings;
}

/* ------------------------------------------------------------ Futures */

/** Cost-of-carry fair value with continuous compounding: F = S * e^(rT). */
export function fairFuture(spot: number, rate: number, days: number): number {
  return spot * Math.exp((rate * days) / DAYS_PER_YEAR);
}

/** Simple annualised basis: how much the future trades above spot, per year. */
export function annualisedBasis(spot: number, future: number, days: number): number {
  return (future / spot - 1) * (DAYS_PER_YEAR / days);
}

/* ------------------------------------------------------------ Perpetuals */

export type Side = "long" | "short";

/**
 * Approximate liquidation price of an isolated position (linear contract,
 * fees ignored): the position is closed once the loss eats the initial margin
 * down to the maintenance margin.
 */
export function liquidationPrice(
  entry: number,
  leverage: number,
  maintenance: number,
  side: Side,
): number {
  const buffer = 1 / leverage - maintenance;
  return side === "long" ? entry * (1 - buffer) : entry * (1 + buffer);
}

/**
 * Probability that a driftless Brownian log price touches a barrier at log
 * distance `distance` within `days` (reflection principle). A rough guide,
 * real returns have fatter tails, so the true number is usually higher.
 */
export function touchProbability(distance: number, volAnnual: number, days: number): number {
  if (distance <= 0) return 1;
  const sigma = volAnnual * Math.sqrt(days / DAYS_PER_YEAR);
  if (sigma === 0) return 0;
  return Math.min(1, 2 * (1 - normCdf(distance / sigma)));
}

/** The funding rule most venues share: F = P + clamp(I - P, -0.05 %, +0.05 %). */
export function fundingRate(premium: number, interest = 0.0001, clamp = 0.0005): number {
  return premium + Math.min(Math.max(interest - premium, -clamp), clamp);
}

export type CarryInput = {
  notional: number;
  /** One funding rate per 8 h period, in order; reused cyclically if short. */
  ratesPer8h: number[];
  days: number;
  feeBpsPerLeg: number;
  leverage: number;
};

export type CarryResult = {
  /** Cumulative net P&L after each day, starting with day 0 (after entry fees). */
  daily: [number, number][];
  funding: number;
  fees: number;
  net: number;
  capital: number;
  annualisedReturn: number;
};

/**
 * Delta-neutral funding carry: long spot, short perp of equal notional. The
 * short receives funding when the rate is positive and pays when negative.
 * Fees: four legs in total (buy spot, sell perp, and the reverse at exit).
 * Capital: the full spot notional plus the perp margin.
 */
export function fundingCarry({
  notional,
  ratesPer8h,
  days,
  feeBpsPerLeg,
  leverage,
}: CarryInput): CarryResult {
  const legFee = (notional * feeBpsPerLeg) / 10_000;
  const capital = notional * (1 + 1 / leverage);
  const periods = days * 3;
  let pnl = -2 * legFee;
  let funding = 0;
  const daily: [number, number][] = [[0, pnl]];

  for (let p = 0; p < periods; p++) {
    const rate = ratesPer8h.length ? ratesPer8h[p % ratesPer8h.length] : 0;
    const payment = notional * rate;
    funding += payment;
    pnl += payment;
    if ((p + 1) % 3 === 0) daily.push([(p + 1) / 3, pnl]);
  }

  pnl -= 2 * legFee;
  daily[daily.length - 1] = [days, pnl];

  return {
    daily,
    funding,
    fees: 4 * legFee,
    net: pnl,
    capital,
    annualisedReturn: days > 0 ? (pnl / capital) * (DAYS_PER_YEAR / days) : 0,
  };
}

/**
 * A plausible funding path: mean-reverting around `mean` with noise and rare
 * sentiment flips, clipped to the ±0.75 % per 8 h band many venues use.
 */
export function simulateFunding(
  mean: number,
  periods: number,
  random: () => number,
): number[] {
  const rates: number[] = [];
  let level = mean;
  for (let i = 0; i < periods; i++) {
    const shock = random() < 0.01 ? -Math.abs(mean) * (4 + 6 * random()) : 0;
    level += 0.15 * (mean - level) + 0.00006 * gaussian(random) + shock;
    rates.push(Math.min(Math.max(level, -0.0075), 0.0075));
  }
  return rates;
}

/* ------------------------------------------------------------ Arbitrage */

/** Buy where it is cheap, sell where it is expensive, pay both taker fees. */
export function crossExchange(
  priceA: number,
  priceB: number,
  feeBpsA: number,
  feeBpsB: number,
  fixedCost: number,
  size: number,
): { grossBps: number; feeBps: number; net: number; buyOn: "A" | "B" } {
  const buyOn = priceA <= priceB ? "A" : "B";
  const [buy, sell, feeBuy, feeSell] =
    buyOn === "A" ? [priceA, priceB, feeBpsA, feeBpsB] : [priceB, priceA, feeBpsB, feeBpsA];
  const units = size / buy;
  const proceeds = units * sell * (1 - feeSell / 10_000);
  const cost = size * (1 + feeBuy / 10_000);
  return {
    buyOn,
    grossBps: (sell / buy - 1) * 10_000,
    feeBps: feeBuy + feeSell,
    net: proceeds - cost - fixedCost,
  };
}

/**
 * Triangular loop through three order books. `forward`: USD → BTC → ETH → USD,
 * `reverse`: USD → ETH → BTC → USD. Both as the relative gain after fees.
 */
export function triangularEdge(
  btcUsd: number,
  ethUsd: number,
  ethBtc: number,
  feeBps: number,
): { forward: number; reverse: number; implied: number } {
  const keep = (1 - feeBps / 10_000) ** 3;
  const forward = (1 / btcUsd / ethBtc) * ethUsd * keep - 1;
  const reverse = (1 / ethUsd) * ethBtc * btcUsd * keep - 1;
  return { forward, reverse, implied: ethUsd / btcUsd };
}

/**
 * Constant-product pool (x * y = k, Uniswap v2 style): sell `amountIn` of
 * token X for token Y, with the fee taken from the input.
 */
export function constantProductSwap(
  reserveX: number,
  reserveY: number,
  amountIn: number,
  feeBps: number,
): { amountOut: number; spotBefore: number; spotAfter: number; average: number; impact: number } {
  const inAfterFee = amountIn * (1 - feeBps / 10_000);
  const amountOut = (reserveY * inAfterFee) / (reserveX + inAfterFee);
  const spotBefore = reserveY / reserveX;
  const spotAfter = (reserveY - amountOut) / (reserveX + amountIn);
  const average = amountIn > 0 ? amountOut / amountIn : spotBefore;
  return { amountOut, spotBefore, spotAfter, average, impact: 1 - average / spotBefore };
}

/**
 * The arbitrage that follows a swap: buy X back from the pool until its price
 * equals the outside market again (pool fee ignored), sell it there.
 */
export function arbitrageToPrice(
  reserveX: number,
  reserveY: number,
  targetPrice: number,
): { amountX: number; costY: number; profit: number } {
  const k = reserveX * reserveY;
  const targetX = Math.sqrt(k / targetPrice);
  const targetY = Math.sqrt(k * targetPrice);
  const amountX = reserveX - targetX;
  const costY = targetY - reserveY;
  return { amountX, costY, profit: amountX * targetPrice - costY };
}
