// Generates the path data for the signature plot (§5).
// Run: node scripts/gen-plot.mjs  — paste output into src/components/SignaturePlot.astro
// Kept in-repo so the curve can be re-tuned without hand-editing path data.

const MU = 380;
const SIGMA = 96;
const BASELINE = 236; // curve asymptote, sits just above the x-axis (244)
const PEAK = 172; // curve height at mu

const density = (x) => Math.exp(-0.5 * ((x - MU) / SIGMA) ** 2);
const curveY = (x) => BASELINE - density(x) * PEAK;
// Envelope widens where the distribution has mass: uncertainty is largest at the mode.
const halfBand = (x) => 5 + 20 * density(x);

const X0 = 56;
const X1 = 704;
const N = 24;

const sample = (fn) =>
  Array.from({ length: N + 1 }, (_, i) => {
    const x = X0 + ((X1 - X0) * i) / N;
    return [x, fn(x)];
  });

const r = (n) => Math.round(n * 100) / 100;

// Catmull-Rom through the samples, converted to cubic Béziers.
function toPath(pts, { close = false } = {}) {
  let d = `M ${r(pts[0][0])} ${r(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? pts[i + 1];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${r(c1[0])} ${r(c1[1])}, ${r(c2[0])} ${r(c2[1])}, ${r(p2[0])} ${r(p2[1])}`;
  }
  return close ? d + " Z" : d;
}

const curve = sample(curveY);
const upper = sample((x) => curveY(x) - halfBand(x));
const lower = sample((x) => curveY(x) + halfBand(x));

// Band is one closed shape: along the upper envelope, back along the lower.
const bandPath = toPath(upper) + " " + toPath([...lower].reverse()).replace(/^M/, "L") + " Z";

console.log("--- curve ---\n" + toPath(curve));
console.log("\n--- band ---\n" + bandPath);
console.log(
  "\n--- extents ---\n" +
    JSON.stringify({
      peakY: r(curveY(MU)),
      bandTopY: r(curveY(MU) - halfBand(MU)),
      bandBottomAtPeak: r(curveY(MU) + halfBand(MU)),
      tailCurveY: r(curveY(X0)),
      tailBandBottomY: r(curveY(X0) + halfBand(X0)),
    })
);
