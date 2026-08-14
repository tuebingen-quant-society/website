/**
 * Minimal QR-code encoder — enough to turn a short URL into a module matrix,
 * nothing more. Byte mode, error-correction level M, versions 1–10 (up to 216
 * bytes of payload), which covers any invite link we would ever print.
 *
 * Written out rather than pulled in as a dependency so the code is generated at
 * build/render time on our own server: no third-party image endpoint gets to see
 * which link a member is scanning.
 *
 * Structure follows ISO/IEC 18004: data codewords -> Reed-Solomon blocks ->
 * interleaving -> module placement -> mask selection by penalty score.
 */

export type QrMatrix = {
  /** Number of modules per side, excluding the quiet zone. */
  size: number;
  /** `modules[y][x] === true` means a dark module. */
  modules: boolean[][];
};

/** Total codewords (data + EC) per version, index = version - 1. */
const TOTAL_CODEWORDS = [26, 44, 70, 100, 134, 172, 196, 242, 292, 346];
/** EC codewords per block at level M. */
const EC_PER_BLOCK = [10, 16, 26, 18, 24, 16, 18, 22, 22, 26];
/** Number of EC blocks at level M. */
const EC_BLOCKS = [1, 1, 1, 2, 2, 4, 4, 4, 5, 5];
/** Row/column centres of the alignment patterns. */
const ALIGNMENT_CENTERS: readonly (readonly number[])[] = [
  [],
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50],
];

const MAX_VERSION = TOTAL_CODEWORDS.length;
/** Level M in the 2-bit format-information field. */
const EC_FORMAT_BITS = 0b00;
const PENALTY_N1 = 3;
const PENALTY_N2 = 3;
const PENALTY_N3 = 40;
const PENALTY_N4 = 10;

/** GF(256) tables for the primitive polynomial x^8 + x^4 + x^3 + x^2 + 1. */
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
for (let i = 0, x = 1; i < 255; i++) {
  GF_EXP[i] = x;
  GF_LOG[x] = i;
  x <<= 1;
  if (x & 0x100) x ^= 0x11d;
}
for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function getBit(value: number, index: number): boolean {
  return ((value >>> index) & 1) !== 0;
}

function dataCapacity(version: number): number {
  const v = version - 1;
  return TOTAL_CODEWORDS[v] - EC_BLOCKS[v] * EC_PER_BLOCK[v];
}

/** Smallest version whose data capacity holds `byteLength` bytes in byte mode. */
function pickVersion(byteLength: number): number {
  for (let version = 1; version <= MAX_VERSION; version++) {
    const headerBits = 4 + (version < 10 ? 8 : 16);
    if (headerBits + byteLength * 8 <= dataCapacity(version) * 8) return version;
  }
  throw new RangeError(
    `QR payload of ${byteLength} bytes exceeds version ${MAX_VERSION} at EC level M`,
  );
}

/** Mode indicator, length, payload, terminator and the 0xEC/0x11 pad pattern. */
function buildDataCodewords(bytes: readonly number[], version: number): number[] {
  const capacityBits = dataCapacity(version) * 8;
  const bits: number[] = [];
  const push = (value: number, length: number) => {
    for (let i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1);
  };

  push(0b0100, 4);
  push(bytes.length, version < 10 ? 8 : 16);
  for (const byte of bytes) push(byte, 8);
  push(0, Math.min(4, capacityBits - bits.length));
  while (bits.length % 8 !== 0) bits.push(0);

  const codewords: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j];
    codewords.push(byte);
  }
  for (let pad = 0xec; codewords.length < capacityBits / 8; pad ^= 0xec ^ 0x11) {
    codewords.push(pad);
  }
  return codewords;
}

/** Generator polynomial (x - a^0)(x - a^1)...(x - a^(degree-1)), leading 1 dropped. */
function rsDivisor(degree: number): number[] {
  const result = new Array<number>(degree).fill(0);
  result[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < degree; j++) {
      result[j] = gfMul(result[j], root);
      if (j + 1 < degree) result[j] ^= result[j + 1];
    }
    root = gfMul(root, 0x02);
  }
  return result;
}

/** Remainder of `data` * x^degree divided by the generator polynomial. */
function rsRemainder(data: readonly number[], divisor: readonly number[]): number[] {
  const result = new Array<number>(divisor.length).fill(0);
  for (const byte of data) {
    const factor = byte ^ (result.shift() as number);
    result.push(0);
    divisor.forEach((coefficient, i) => {
      result[i] ^= gfMul(coefficient, factor);
    });
  }
  return result;
}

/** Split into blocks, append EC codewords, then interleave block-wise. */
function addEccAndInterleave(data: readonly number[], version: number): number[] {
  const v = version - 1;
  const rawCodewords = TOTAL_CODEWORDS[v];
  const blockEccLen = EC_PER_BLOCK[v];
  const numBlocks = EC_BLOCKS[v];
  const numShortBlocks = numBlocks - (rawCodewords % numBlocks);
  const shortBlockLen = Math.floor(rawCodewords / numBlocks);

  const divisor = rsDivisor(blockEccLen);
  const blocks: number[][] = [];
  for (let i = 0, offset = 0; i < numBlocks; i++) {
    const length = shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1);
    const block = data.slice(offset, offset + length);
    offset += length;
    const ecc = rsRemainder(block, divisor);
    // Pad short blocks to a common length; the filler is skipped when interleaving.
    if (i < numShortBlocks) block.push(0);
    blocks.push(block.concat(ecc));
  }

  const result: number[] = [];
  for (let i = 0; i < blocks[0].length; i++) {
    blocks.forEach((block, j) => {
      if (i !== shortBlockLen - blockEccLen || j >= numShortBlocks) result.push(block[i]);
    });
  }
  return result;
}

const MASKS: ((x: number, y: number) => boolean)[] = [
  (x, y) => (x + y) % 2 === 0,
  (_x, y) => y % 2 === 0,
  (x) => x % 3 === 0,
  (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
  (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
  (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
];

function buildMatrix(version: number, codewords: readonly number[]): QrMatrix {
  const size = version * 4 + 17;
  const modules: boolean[][] = Array.from({ length: size }, () =>
    new Array<boolean>(size).fill(false),
  );
  const isFunction: boolean[][] = Array.from({ length: size }, () =>
    new Array<boolean>(size).fill(false),
  );

  const setFunction = (x: number, y: number, dark: boolean) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    modules[y][x] = dark;
    isFunction[y][x] = true;
  };

  const drawFormatBits = (mask: number) => {
    const data = (EC_FORMAT_BITS << 3) | mask;
    let rem = data;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const bits = (((data << 10) | rem) ^ 0x5412) >>> 0;

    for (let i = 0; i <= 5; i++) setFunction(8, i, getBit(bits, i));
    setFunction(8, 7, getBit(bits, 6));
    setFunction(8, 8, getBit(bits, 7));
    setFunction(7, 8, getBit(bits, 8));
    for (let i = 9; i < 15; i++) setFunction(14 - i, 8, getBit(bits, i));

    for (let i = 0; i < 8; i++) setFunction(size - 1 - i, 8, getBit(bits, i));
    for (let i = 8; i < 15; i++) setFunction(8, size - 15 + i, getBit(bits, i));
    setFunction(8, size - 8, true); // the always-dark module
  };

  // Timing patterns.
  for (let i = 0; i < size; i++) {
    setFunction(6, i, i % 2 === 0);
    setFunction(i, 6, i % 2 === 0);
  }

  // Finder patterns plus their separators.
  for (const [cx, cy] of [
    [3, 3],
    [size - 4, 3],
    [3, size - 4],
  ]) {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        setFunction(cx + dx, cy + dy, dist !== 2 && dist !== 4);
      }
    }
  }

  // Alignment patterns, skipping the three that would sit on a finder.
  const centers = ALIGNMENT_CENTERS[version - 1];
  const last = centers.length - 1;
  for (let i = 0; i < centers.length; i++) {
    for (let j = 0; j < centers.length; j++) {
      if ((i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0)) {
        continue;
      }
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          setFunction(
            centers[j] + dx,
            centers[i] + dy,
            Math.max(Math.abs(dx), Math.abs(dy)) !== 1,
          );
        }
      }
    }
  }

  // Reserve the format area; the real bits are written once the mask is chosen.
  drawFormatBits(0);

  if (version >= 7) {
    let rem = version;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const bits = (version << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const dark = getBit(bits, i);
      const a = size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      setFunction(a, b, dark);
      setFunction(b, a, dark);
    }
  }

  // Zig-zag placement of the codeword bits, two columns at a time from the right.
  let bitIndex = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? size - 1 - vert : vert;
        if (!isFunction[y][x] && bitIndex < codewords.length * 8) {
          modules[y][x] = getBit(codewords[bitIndex >>> 3], 7 - (bitIndex & 7));
          bitIndex++;
        }
      }
    }
  }

  const applyMask = (mask: number) => {
    const shouldInvert = MASKS[mask];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (!isFunction[y][x] && shouldInvert(x, y)) modules[y][x] = !modules[y][x];
      }
    }
  };

  let bestMask = 0;
  let bestPenalty = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    applyMask(mask);
    drawFormatBits(mask);
    const penalty = penaltyScore(modules, size);
    if (penalty < bestPenalty) {
      bestPenalty = penalty;
      bestMask = mask;
    }
    applyMask(mask); // masking is its own inverse
  }
  applyMask(bestMask);
  drawFormatBits(bestMask);

  return { size, modules };
}

/** Scoring from ISO/IEC 18004 §8.8.2, used only to pick the least-bad mask. */
function penaltyScore(modules: readonly boolean[][], size: number): number {
  let result = 0;

  const addHistory = (runLength: number, history: number[], atStart: boolean) => {
    if (atStart) runLength += size; // the quiet zone counts as light modules
    history.pop();
    history.unshift(runLength);
  };
  const countFinderLike = (history: readonly number[]) => {
    const n = history[1];
    const core =
      n > 0 && history[2] === n && history[3] === n * 3 && history[4] === n && history[5] === n;
    return (
      (core && history[0] >= n * 4 && history[6] >= n ? 1 : 0) +
      (core && history[6] >= n * 4 && history[0] >= n ? 1 : 0)
    );
  };

  const scanLine = (at: (i: number) => boolean) => {
    const history = [0, 0, 0, 0, 0, 0, 0];
    let runColor = false;
    let runLength = 0;
    for (let i = 0; i < size; i++) {
      if (at(i) === runColor) {
        runLength++;
        if (runLength === 5) result += PENALTY_N1;
        else if (runLength > 5) result++;
      } else {
        addHistory(runLength, history, history[0] === 0);
        if (!runColor) result += countFinderLike(history) * PENALTY_N3;
        runColor = at(i);
        runLength = 1;
      }
    }
    if (runColor) {
      addHistory(runLength, history, history[0] === 0);
      runLength = 0;
    }
    addHistory(runLength + size, history, history[0] === 0);
    result += countFinderLike(history) * PENALTY_N3;
  };

  for (let y = 0; y < size; y++) scanLine((x) => modules[y][x]);
  for (let x = 0; x < size; x++) scanLine((y) => modules[y][x]);

  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      const color = modules[y][x];
      if (
        color === modules[y][x + 1] &&
        color === modules[y + 1][x] &&
        color === modules[y + 1][x + 1]
      ) {
        result += PENALTY_N2;
      }
    }
  }

  let dark = 0;
  for (const row of modules) for (const module of row) if (module) dark++;
  const total = size * size;
  result += (Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1) * PENALTY_N4;

  return result;
}

/** Encode `text` (UTF-8, byte mode, EC level M) into a module matrix. */
export function encodeQr(text: string): QrMatrix {
  const bytes = Array.from(new TextEncoder().encode(text));
  const version = pickVersion(bytes.length);
  return buildMatrix(version, addEccAndInterleave(buildDataCodewords(bytes, version), version));
}

/**
 * SVG path data for every dark module, offset by `margin` modules of quiet zone.
 * Horizontal runs are merged into one sub-path each to keep the markup small.
 */
export function qrPathData(matrix: QrMatrix, margin = 4): string {
  const parts: string[] = [];
  for (let y = 0; y < matrix.size; y++) {
    let x = 0;
    while (x < matrix.size) {
      if (!matrix.modules[y][x]) {
        x++;
        continue;
      }
      let run = 1;
      while (x + run < matrix.size && matrix.modules[y][x + run]) run++;
      parts.push(`M${x + margin} ${y + margin}h${run}v1h-${run}z`);
      x += run;
    }
  }
  return parts.join("");
}
