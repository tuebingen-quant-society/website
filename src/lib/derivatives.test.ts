import assert from "node:assert/strict";
import test from "node:test";
import {
  annualisedBasis,
  arbitrageToPrice,
  blackScholes,
  constantProductSwap,
  crossExchange,
  fairFuture,
  fundingCarry,
  fundingRate,
  liquidationPrice,
  monteCarloCall,
  mulberry32,
  normCdf,
  payoffAtExpiry,
  touchProbability,
  triangularEdge,
  zeroCrossings,
} from "./derivatives";

const close = (actual: number, expected: number, tolerance: number) =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${expected} ± ${tolerance}, got ${actual}`,
  );

test("normal CDF matches reference values", () => {
  close(normCdf(0), 0.5, 1e-7);
  close(normCdf(1.96), 0.9750021, 1e-6);
  close(normCdf(-1), 0.1586553, 1e-6);
});

test("Black-Scholes reproduces the textbook example (Hull)", () => {
  const bs = blackScholes(100, 100, 1, 0.05, 0.2);
  close(bs.call, 10.4506, 1e-3);
  close(bs.put, 5.5735, 1e-3);
  close(bs.callDelta, 0.6368, 1e-3);
});

test("put-call parity holds: C - P = S - K e^(-rT)", () => {
  for (const [spot, strike, years, rate, vol] of [
    [100, 90, 0.25, 0.03, 0.6],
    [60, 75, 2, 0.01, 0.35],
  ]) {
    const bs = blackScholes(spot, strike, years, rate, vol);
    close(bs.call - bs.put, spot - strike * Math.exp(-rate * years), 1e-6);
  }
});

test("Monte Carlo converges to Black-Scholes", () => {
  const mc = monteCarloCall(100, 100, 1, 0.05, 0.2, 200_000, mulberry32(7));
  close(mc.price, 10.4506, 4 * mc.stdError);
});

test("payoffs and break-evens of a long call", () => {
  const legs = [{ kind: "call" as const, strike: 100, quantity: 1 }];
  assert.equal(payoffAtExpiry(legs, 90), 0);
  assert.equal(payoffAtExpiry(legs, 120), 20);
  const pnl = [80, 90, 100, 110, 120].map((x): [number, number] => [x, payoffAtExpiry(legs, x) - 5]);
  assert.deepEqual(zeroCrossings(pnl), [105]);
});

test("cost of carry and annualised basis", () => {
  close(fairFuture(100, 0.04, 365), 100 * Math.exp(0.04), 1e-9);
  close(annualisedBasis(100, 101, 73), 0.05, 1e-9);
});

test("liquidation distance shrinks with leverage", () => {
  close(liquidationPrice(100, 10, 0.005, "long"), 90.5, 1e-9);
  close(liquidationPrice(100, 10, 0.005, "short"), 109.5, 1e-9);
  assert.ok(touchProbability(0.1, 0.6, 30) > touchProbability(0.2, 0.6, 30));
  assert.equal(touchProbability(0, 0.6, 1), 1);
});

test("funding rule pins the rate to the interest component in calm markets", () => {
  close(fundingRate(0.0002), 0.0001, 1e-12);
  close(fundingRate(-0.0003), 0.0001, 1e-12);
  close(fundingRate(0.002), 0.0015, 1e-12);
});

test("funding carry: 0.01 % per 8 h on 10k for 30 days", () => {
  const result = fundingCarry({
    notional: 10_000,
    ratesPer8h: [0.0001],
    days: 30,
    feeBpsPerLeg: 5,
    leverage: 3,
  });
  close(result.funding, 90, 1e-9);
  close(result.fees, 20, 1e-9);
  close(result.net, 70, 1e-9);
  assert.equal(result.daily.length, 31);
});

test("arbitrage helpers", () => {
  const cross = crossExchange(100, 100.3, 10, 10, 0, 10_000);
  assert.equal(cross.buyOn, "A");
  close(cross.grossBps, 30, 1e-6);
  assert.ok(cross.net > 0 && cross.net < 10.1);

  const fair = triangularEdge(100_000, 3_500, 0.035, 0);
  close(fair.forward, 0, 1e-12);
  close(fair.reverse, 0, 1e-12);

  const swap = constantProductSwap(1_000, 3_500_000, 10, 0);
  close(swap.amountOut, 34_653.47, 0.01);
  assert.ok(swap.impact > 0.009 && swap.impact < 0.011);

  const arb = arbitrageToPrice(1_010, 3_500_000 - swap.amountOut, 3_500);
  close(arb.amountX, 10, 1e-6);
  assert.ok(arb.profit > 0);
});
