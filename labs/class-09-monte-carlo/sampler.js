#!/usr/bin/env node
/* ============================================================
 * Understanding Uncertainty · Monte Carlo sampler (standalone, no deps)
 * ------------------------------------------------------------
 * Two ideas, one loop:
 *   1. The WEAK LAW OF LARGE NUMBERS: the sample mean of iid draws
 *      converges to the expected value E[X] as n grows.
 *   2. MONTE CARLO: estimate E[g(X)] (an average, an integral, or pi)
 *      by drawing random points and averaging g over them. The error
 *      shrinks like 1/sqrt(n), regardless of the problem's dimension.
 *
 * This mirrors sampler.py line-for-line so you can compare the two.
 * All randomness comes from one seeded linear-congruential generator
 * (makeRng) with the same constants as LabBase.makeLcg in the browser,
 * so every run is reproducible and matches Python and the widgets.
 *
 * Usage:
 *   node sampler.js mean  [n] [seed]   # MC estimate of E[X] from n draws
 *   node sampler.js pi    [n] [seed]   # MC estimate of pi from n points
 *   node sampler.js trace [n] [seed]   # running mean after each of n draws
 * Reads the population from data.json sitting next to this file.
 * ============================================================ */

'use strict';

// ---- Seeded random number generator -------------------------
// A linear-congruential generator (LCG). Same constants as LabBase.makeLcg,
// so a given seed produces the same stream in JS and Python. Returns a
// function that yields the next uniform value in [0, 1).
function makeRng(seed) {
  let s = (seed >>> 0);
  return function () {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ---- Summary statistics -------------------------------------
function mean(a) { return a.reduce((p, q) => p + q, 0) / a.length; }
function std(a) {
  const m = mean(a);
  return Math.sqrt(a.reduce((p, q) => p + (q - m) * (q - m), 0) / a.length);
}

// ---- WLLN / Monte Carlo estimator of E[X] -------------------
// Treat the data.json values as the population. Draw n values from it with
// replacement and average them: that average estimates the population mean.
function resampleMean(X, n, seed) {
  const rng = makeRng(seed);
  let total = 0;
  for (let i = 0; i < n; i++) total += X[Math.floor(rng() * X.length)];
  return total / n;
}

// The running mean after each draw (for the convergence plot). Element k-1
// is the average of the first k draws; it should settle toward E[X].
function runningMean(X, n, seed) {
  const rng = makeRng(seed);
  const out = [];
  let total = 0;
  for (let k = 1; k <= n; k++) {
    total += X[Math.floor(rng() * X.length)];
    out.push(total / k);
  }
  return out;
}

// ---- Monte Carlo estimate of pi -----------------------------
// Throw n points uniformly into the unit square [0,1] x [0,1]. The quarter
// circle x^2 + y^2 < 1 has area pi/4, so the fraction of points inside,
// times 4, estimates pi.
function estimatePi(n, seed) {
  const rng = makeRng(seed);
  let inside = 0;
  for (let i = 0; i < n; i++) {
    const x = rng(), y = rng();
    if (x * x + y * y < 1) inside++;
  }
  return 4 * inside / n;
}

// ---- CLI -----------------------------------------------------
function main() {
  const fs = require('fs');
  const path = require('path');
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8'));
  const X = data.values;
  const truth = data.true_mean != null ? data.true_mean : mean(X);
  const cmd = process.argv[2] || 'mean';

  if (cmd === 'mean') {
    const n = process.argv[3] ? parseInt(process.argv[3], 10) : 1000;
    const seed = process.argv[4] ? parseInt(process.argv[4], 10) : 1;
    const est = resampleMean(X, n, seed);
    const se = std(X) / Math.sqrt(n);
    process.stderr.write(`# n=${n} seed=${seed} truth=${truth.toFixed(6)} se=${se.toFixed(6)}\n`);
    process.stdout.write(`${est.toFixed(6)}\n`);
  } else if (cmd === 'pi') {
    const n = process.argv[3] ? parseInt(process.argv[3], 10) : 1000;
    const seed = process.argv[4] ? parseInt(process.argv[4], 10) : 1;
    const est = estimatePi(n, seed);
    process.stderr.write(`# n=${n} seed=${seed} truth=${Math.PI.toFixed(6)}\n`);
    process.stdout.write(`${est.toFixed(6)}\n`);
  } else if (cmd === 'trace') {
    const n = process.argv[3] ? parseInt(process.argv[3], 10) : 200;
    const seed = process.argv[4] ? parseInt(process.argv[4], 10) : 1;
    process.stderr.write(`# k running_mean  (truth=${truth.toFixed(6)})\n`);
    runningMean(X, n, seed).forEach((m, i) => process.stdout.write(`${i + 1}\t${m.toFixed(6)}\n`));
  } else {
    process.stderr.write('usage: node sampler.js [mean|pi|trace] [n] [seed]\n');
    process.exit(1);
  }
}

if (typeof module !== 'undefined' && require.main === module) main();
if (typeof module !== 'undefined') {
  module.exports = { makeRng, mean, std, resampleMean, runningMean, estimatePi };
}
