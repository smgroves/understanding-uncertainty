#!/usr/bin/env node
/* ============================================================
 * Understanding Uncertainty · Bootstrap sampler (standalone, no deps)
 * ------------------------------------------------------------
 * The bootstrap turns ONE sample into an estimate of how much a
 * statistic would wobble across many samples. The recipe:
 *
 *   1. Treat your sample as the population.
 *   2. Resample it WITH REPLACEMENT to the same size n.
 *   3. Recompute the statistic on that resample.
 *   4. Repeat B times. The spread of those B numbers approximates
 *      the sampling distribution; its middle 95% is a CI.
 *
 * This mirrors sampler.py line-for-line so you can compare the two.
 * Pure stdlib JS; randomness is a seeded LCG (the same one in
 * lab-base.js) so a given seed reproduces the same resamples.
 *
 * Usage:
 *   node sampler.js boot [B] [seed] [stat]   # print the B bootstrap stats
 *   node sampler.js ci   [B] [seed] [stat]   # print 95% CI + bootstrap SE
 * stat is "mean" (default) or "median". B defaults to 2000, seed to 42.
 * Reads the sample from data.json sitting next to this file.
 * ============================================================ */

'use strict';

// ---- Reproducible randomness --------------------------------
// Identical to LabBase.makeLcg in lab-base.js. Returns a float in
// [0, 1). Seed it and the whole stream of resamples is reproducible.
function makeLcg(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ---- Statistics of a sample ---------------------------------
function mean(X) { return X.reduce((a, b) => a + b, 0) / X.length; }
function std(X) {
  const m = mean(X);
  return Math.sqrt(X.reduce((a, b) => a + (b - m) * (b - m), 0) / X.length);
}
function quantile(sorted, p) {
  // linear-interpolation quantile (same as numpy's default)
  const k = (sorted.length - 1) * p;
  const lo = Math.floor(k), hi = Math.min(lo + 1, sorted.length - 1);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (k - lo);
}
function median(X) { return quantile(X.slice().sort((a, b) => a - b), 0.5); }

function statistic(X, name) {
  // The one thing you want a confidence interval for.
  if (name === 'mean') return mean(X);
  if (name === 'median') return median(X);
  throw new Error('unknown statistic: ' + name);
}

// ---- One bootstrap resample ---------------------------------
// Draw n indices uniformly WITH REPLACEMENT, so the same observation
// can appear several times and others not at all.
function resample(X, rng) {
  const n = X.length, out = [];
  for (let i = 0; i < n; i++) out.push(X[Math.floor(rng() * n)]);
  return out;
}

// ---- The bootstrap distribution -----------------------------
// B resamples -> B recomputed statistics. That collection is the
// simulated sampling distribution of the statistic.
function bootstrapStats(X, B, seed, name) {
  const rng = makeLcg(seed), out = [];
  for (let t = 0; t < B; t++) out.push(statistic(resample(X, rng), name));
  return out;
}

// ---- Percentile confidence interval -------------------------
// The (1 - alpha) CI is the alpha/2 and 1 - alpha/2 quantiles of the
// bootstrap statistics. For 95%, that is the 2.5th and 97.5th.
function percentileCI(stats, alpha) {
  alpha = alpha == null ? 0.05 : alpha;
  const s = stats.slice().sort((a, b) => a - b);
  return [quantile(s, alpha / 2), quantile(s, 1 - alpha / 2)];
}
function bootstrapSE(stats) { return std(stats); }

// ---- CLI -----------------------------------------------------
function main() {
  const fs = require('fs');
  const path = require('path');
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8'));
  const X = data.values;
  const cmd = process.argv[2] || 'ci';
  const B = process.argv[3] ? parseInt(process.argv[3], 10) : 2000;
  const seed = process.argv[4] ? parseInt(process.argv[4], 10) : 42;
  const name = process.argv[5] || 'mean';

  const stats = bootstrapStats(X, B, seed, name);

  if (cmd === 'boot') {
    process.stderr.write(`# n=${X.length}  B=${B}  seed=${seed}  stat=${name}\n`);
    for (const s of stats) process.stdout.write(`${s.toFixed(6)}\n`);
  } else if (cmd === 'ci') {
    const [lo, hi] = percentileCI(stats, 0.05);
    const se = bootstrapSE(stats);
    const obs = statistic(X, name);
    process.stderr.write(`# n=${X.length}  B=${B}  seed=${seed}  stat=${name}\n`);
    process.stdout.write(`observed ${name}: ${obs.toFixed(4)}\n`);
    process.stdout.write(`95% CI: (${lo.toFixed(4)}, ${hi.toFixed(4)})\n`);
    process.stdout.write(`bootstrap SE: ${se.toFixed(4)}\n`);
  } else {
    process.stderr.write('usage: node sampler.js [boot|ci] [B] [seed] [stat]\n');
    process.exit(1);
  }
}

if (typeof module !== 'undefined' && require.main === module) main();
if (typeof module !== 'undefined') {
  module.exports = { makeLcg, mean, std, quantile, median, statistic, resample, bootstrapStats, percentileCI, bootstrapSE };
}
