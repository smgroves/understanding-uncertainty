#!/usr/bin/env node
/* ============================================================
 * Understanding Uncertainty · ECDF + inverse-transform sampler
 * ------------------------------------------------------------
 * A cumulative distribution function is two things at once:
 *   1. an ESTIMATOR of F(x) = P(X <= x)   -> evaluate the ECDF on a grid
 *   2. a GENERATOR you can sample from     -> invert it at a uniform draw
 *
 * The inverse probability transform: if U ~ Uniform(0,1) then
 * F^{-1}(U) has distribution F. With only a sample in hand we use the
 * EMPIRICAL CDF F_hat and its inverse (the empirical quantile), so
 * F_hat^{-1}(U) resamples the observed data - the bootstrap.
 *
 * Pure stdlib JS, so you can read every line and port it to Python
 * (see sampler.py, same arguments and the same seeded RNG, so both
 * files print the identical sample given the same seed).
 *
 * Usage:
 *   node sampler.js ecdf   [gridPoints]      # print x, F_hat(x)
 *   node sampler.js sample [n] [seed]        # draw n inverse-transform values
 *   node sampler.js quantile <u>             # print F_hat^{-1}(u), u in [0,1]
 * Reads the sample from data.json sitting next to this file.
 * ============================================================ */

'use strict';

// ---- The empirical CDF --------------------------------------
// F_hat(x) = (1/n) * sum_i 1{ x_i <= x } : the proportion at or below x.
// It is a non-decreasing staircase climbing from 0 to 1 by 1/n a step.
function ecdfAt(x, X) {
  let c = 0;
  for (let i = 0; i < X.length; i++) if (X[i] <= x) c++;
  return c / X.length;
}

// ---- The empirical quantile (inverse ECDF) ------------------
// F_hat^{-1}(u) = smallest observed x with F_hat(x) >= u, which is the
// order statistic at rank k = ceil(n*u). This is the value the
// inverse-transform "reads off" when a horizontal line at height u
// meets the staircase. Expects a pre-sorted array.
function quantileSorted(u, sorted) {
  const n = sorted.length;
  let k = Math.ceil(n * u);          // 1-indexed rank
  if (k < 1) k = 1;
  if (k > n) k = n;
  return sorted[k - 1];
}

// ---- Inverse-transform sampling -----------------------------
// Draw U ~ Uniform(0,1), return F_hat^{-1}(U). Because each order
// statistic is equally likely, this resamples the data uniformly.
function sample(X, n, rand) {
  const sorted = X.slice().sort((a, b) => a - b);
  const out = [];
  for (let j = 0; j < n; j++) out.push(quantileSorted(rand(), sorted));
  return out;
}

// ---- Seeded RNG (identical sequence to sampler.py) ----------
// Math.imul gives the exact low-32-bit product, so this matches
// Python's arbitrary-precision `(s*A + C) & 0x7fffffff` bit-for-bit.
// (A plain `s * 1103515245` in JS overflows 2^53 and would drift.)
function makeLcg(seed) {
  let s = seed >>> 0;
  return function () {
    s = (Math.imul(s, 1103515245) + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ---- CLI -----------------------------------------------------
function main() {
  const fs = require('fs');
  const path = require('path');
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8'));
  const X = data.values;
  const sorted = X.slice().sort((a, b) => a - b);
  const cmd = process.argv[2] || 'ecdf';

  if (cmd === 'ecdf') {
    const g = process.argv[3] ? parseInt(process.argv[3], 10) : 120;
    const lo = sorted[0], hi = sorted[sorted.length - 1], pad = (hi - lo) * 0.05;
    process.stderr.write(`# n=${X.length}  variable=${data.variable} (${data.unit})\n`);
    for (let i = 0; i < g; i++) {
      const x = (lo - pad) + (hi - lo + 2 * pad) * i / (g - 1);
      process.stdout.write(`${x.toFixed(4)}\t${ecdfAt(x, X).toFixed(6)}\n`);
    }
  } else if (cmd === 'sample') {
    const n = process.argv[3] ? parseInt(process.argv[3], 10) : 10;
    const seed = process.argv[4] ? parseInt(process.argv[4], 10) : 6042;
    for (const v of sample(X, n, makeLcg(seed))) process.stdout.write(`${v.toFixed(4)}\n`);
  } else if (cmd === 'quantile') {
    const u = parseFloat(process.argv[3]);
    if (!(u >= 0 && u <= 1)) { process.stderr.write('u must be in [0,1]\n'); process.exit(1); }
    process.stdout.write(`${quantileSorted(u, sorted).toFixed(6)}\n`);
  } else {
    process.stderr.write('usage: node sampler.js [ecdf|sample|quantile] ...\n');
    process.exit(1);
  }
}

if (typeof module !== 'undefined' && require.main === module) main();
if (typeof module !== 'undefined') {
  module.exports = { ecdfAt, quantileSorted, sample, makeLcg };
}
