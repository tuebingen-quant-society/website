import assert from "node:assert/strict";
import test from "node:test";
import { encodeQr, qrPathData, type QrMatrix } from "./qr";

const LINK = "https://chat.whatsapp.com/ABCDEFGHIJKLMNOPQRSTUV";

/** Reads the 15 format-information bits from the copy around the top-left finder. */
function readFormatBits({ size, modules }: QrMatrix): number {
  const bits: boolean[] = [];
  for (let i = 0; i <= 5; i++) bits[i] = modules[i][8];
  bits[6] = modules[7][8];
  bits[7] = modules[8][8];
  bits[8] = modules[8][7];
  for (let i = 9; i < 15; i++) bits[i] = modules[8][14 - i];
  return bits.reduce((value, bit, i) => value | (Number(bit) << i), 0);
}

test("version scales with the payload and stays within level M capacity", () => {
  assert.equal(encodeQr("a").size, 21); // version 1
  assert.equal(encodeQr("x".repeat(14)).size, 21);
  assert.equal(encodeQr("x".repeat(15)).size, 25); // version 2
  assert.equal(encodeQr("x".repeat(213)).size, 57); // version 10, the largest we support
  assert.throws(() => encodeQr("x".repeat(214)), RangeError);
});

test("function patterns sit where the standard puts them", () => {
  const matrix = encodeQr(LINK);
  const { size, modules } = matrix;

  for (const [ox, oy] of [
    [0, 0],
    [size - 7, 0],
    [0, size - 7],
  ]) {
    for (let dy = 0; dy < 7; dy++) {
      for (let dx = 0; dx < 7; dx++) {
        const dist = Math.max(Math.abs(dx - 3), Math.abs(dy - 3));
        assert.equal(
          modules[oy + dy][ox + dx],
          dist !== 2,
          `finder module ${ox + dx},${oy + dy}`,
        );
      }
    }
  }

  for (let i = 8; i < size - 8; i++) {
    assert.equal(modules[6][i], i % 2 === 0, `timing column ${i}`);
    assert.equal(modules[i][6], i % 2 === 0, `timing row ${i}`);
  }

  assert.equal(modules[size - 8][8], true, "the always-dark module");
});

test("format information encodes level M and a valid mask", () => {
  const matrix = encodeQr(LINK);
  const bits = readFormatBits(matrix);

  // The BCH(15,5) remainder must vanish once the fixed mask pattern is removed.
  let rem = bits ^ 0x5412;
  for (let i = 14; i >= 10; i--) {
    if ((rem >>> i) & 1) rem ^= 0x537 << (i - 10);
  }
  assert.equal(rem, 0, "format bits fail their BCH check");

  const data = (bits ^ 0x5412) >>> 10;
  assert.equal(data >>> 3, 0b00, "error-correction level is not M");
  assert.ok((data & 0b111) < 8);

  // Both copies of the format information must agree.
  const { size, modules } = matrix;
  for (let i = 0; i < 8; i++) {
    assert.equal(modules[8][size - 1 - i], ((bits >>> i) & 1) === 1, `format copy bit ${i}`);
  }
  for (let i = 8; i < 15; i++) {
    assert.equal(modules[size - 15 + i][8], ((bits >>> i) & 1) === 1, `format copy bit ${i}`);
  }
});

/**
 * Golden fingerprint of a full matrix. The encoder's output was verified as
 * scannable against an independent decoder (jsQR); this pins it so a later
 * refactor cannot silently change the modules.
 */
test("encoding is stable for a known payload", () => {
  const { size, modules } = encodeQr(LINK);
  const rows = modules.map((row) => row.map((dark) => (dark ? "#" : ".")).join(""));

  assert.equal(size, 33); // version 4
  assert.equal(rows[0], "#######.###.#.#.###.#.##..#######");
  assert.equal(rows[6], "#######.#.#.#.#.#.#.#.#.#.#######");
  assert.equal(rows[32], "#######.#.###.##.##..####.....#.#");
  assert.equal(
    rows.reduce((count, row) => count + row.split("#").length - 1, 0),
    556,
  );
});

test("path data covers exactly the dark modules", () => {
  const matrix = encodeQr("https://tuequant.de");
  const path = qrPathData(matrix, 4);
  const covered = [...path.matchAll(/h(\d+)v1/g)].reduce(
    (total, match) => total + Number(match[1]),
    0,
  );
  const dark = matrix.modules.flat().filter(Boolean).length;

  assert.equal(covered, dark);
  assert.match(path, /^M\d+ \d+h/);
});
