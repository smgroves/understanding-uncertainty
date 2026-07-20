#!/usr/bin/env node
/* ============================================================
 * Understanding Uncertainty · Central Limit Theorem sampler
 * ------------------------------------------------------------
 * The central limit theorem is a statement about the SAMPLE MEAN.
 * Draw n values with replacement from a population, average them,
 * and you get one sample mean X-bar. Repeat m times and you have
 * the sampling distribution of the mean. This script reports the
 * two numbers the CLT predicts:
 *
 *   mean_of_means -> should sit on the population mean  mu
 *   sd_of_means   -> should shrink like  sigma / sqrt(n)  (std error)
 *
 * Pure stdlib JS, no deps, so you can read every line and compare
 * it to sampler.py (same commands, same math). The RNG here is the
 * shared makeLcg used by the lab widgets, so a given seed reproduces
 * exactly the numbers the page shows.
 *
 * Usage:
 *   node sampler.js means [n] [m] [seed]   # print mean_of_means, sd_of_means
 *   node sampler.js draws [n] [m] [seed]   # print the m sample means
 * Defaults: n=30, m=2000, seed=1. Population is data.json next door.
 * ============================================================ */

'use strict';

// ---- Reproducible RNG (same LCG as LabBase.makeLcg) ----------
function makeLcg(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ---- Summary statistics -------------------------------------
// mean and (population) standard deviation: sd divides by length so it
// matches pop_sd stored in data.json.
function mean(X) { return X.reduce((a, b) => a + b, 0) / X.length; }
function std(X) {
  const m = mean(X);
  return Math.sqrt(X.reduce((a, b) => a + (b - m) * (b - m), 0) / X.length);
}

// ---- The sampling distribution of the mean ------------------
// One "sample mean" is the average of n draws made WITH REPLACEMENT.
function oneSampleMean(X, n, rand) {
  let s = 0;
  for (let i = 0; i < n; i++) s += X[Math.floor(rand() * X.length)];
  return s / n;
}

// Draw m independent sample means; seeding makes the run reproducible.
function sampleMeans(X, n, m, seed) {
  const rand = makeLcg(seed);
  const out = [];
  for (let j = 0; j < m; j++) out.push(oneSampleMean(X, n, rand));
  return out;
}

// ---- CLI -----------------------------------------------------
function main() {
  const fs = require('fs');
  const path = require('path');
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8'));
  const X = data.values;
  const popSd = data.pop_sd;

  const cmd = process.argv[2] || 'means';
  const n = process.argv[3] ? parseInt(process.argv[3], 10) : 30;
  const m = process.argv[4] ? parseInt(process.argv[4], 10) : 2000;
  const seed = process.argv[5] ? parseInt(process.argv[5], 10) : 1;

  const means = sampleMeans(X, n, m, seed);

  if (cmd === 'means') {
    const mom = mean(means);
    const som = std(means);
    const seTheory = popSd / Math.sqrt(n);
    process.stderr.write(`# n=${n}  m=${m}  seed=${seed}  pop_mean=${mean(X).toFixed(4)}  pop_sd=${popSd.toFixed(4)}\n`);
    process.stdout.write(`mean_of_means ${mom.toFixed(6)}   (pop_mean = ${mean(X).toFixed(6)})\n`);
    process.stdout.write(`sd_of_means   ${som.toFixed(6)}   (sigma/sqrt(n) = ${seTheory.toFixed(6)})\n`);
  } else if (cmd === 'draws') {
    for (const v of means) process.stdout.write(`${v.toFixed(6)}\n`);
  } else {
    process.stderr.write('usage: node sampler.js [means|draws] [n] [m] [seed]\n');
    process.exit(1);
  }
}

if (typeof module !== 'undefined' && require.main === module) main();
if (typeof module !== 'undefined') {
  module.exports = { makeLcg, mean, std, oneSampleMean, sampleMeans };
}
