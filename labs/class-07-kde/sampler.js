#!/usr/bin/env node
/* ============================================================
 * Understanding Uncertainty · KDE sampler (standalone, no deps)
 * ------------------------------------------------------------
 * A kernel density estimate is two things at once:
 *   1. an ESTIMATOR of the density f(x)  -> evaluate on a grid
 *   2. a GENERATIVE MODEL you can sample from -> draw new x values
 *
 * This file does both, in pure stdlib JS, so you can read every
 * line and port it to Python (see sampler.py, same arguments).
 *
 * Usage:
 *   node sampler.js grid   [bandwidth] [kernel]   # print x, f_hat(x)
 *   node sampler.js sample [n] [bandwidth] [kernel]# draw n values
 * kernel is "gaussian" (default) or "uniform".
 * With no bandwidth, Silverman's rule-of-thumb is used.
 * Reads the sample from data.json sitting next to this file.
 * ============================================================ */

'use strict';

// ---- Kernels -------------------------------------------------
// Each kernel k(z) integrates to 1 and is centered at 0. The KDE
// places one copy of (1/h)*k((x - x_i)/h) on every data point.
function gaussianKernel(z) {
  return Math.exp(-(z * z) / 2) / Math.sqrt(2 * Math.PI);
}
function uniformKernel(z) {
  // The "moving window": 1/2 inside |z| < 1, zero outside.
  return Math.abs(z) < 1 ? 0.5 : 0;
}
function kernelFor(name) {
  return name === 'uniform' ? uniformKernel : gaussianKernel;
}

// ---- Summary statistics -------------------------------------
function mean(X) { return X.reduce((a, b) => a + b, 0) / X.length; }
function std(X) {
  const m = mean(X);
  return Math.sqrt(X.reduce((a, b) => a + (b - m) * (b - m), 0) / X.length);
}
function quantile(sorted, p) {
  const k = (sorted.length - 1) * p;
  const lo = Math.floor(k), hi = Math.min(lo + 1, sorted.length - 1);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (k - lo);
}
function iqr(X) {
  const s = X.slice().sort((a, b) => a - b);
  return quantile(s, 0.75) - quantile(s, 0.25);
}

// ---- Silverman's rule-of-thumb bandwidth --------------------
// The constant depends on the kernel:
//   uniform  -> 1.84 * sd * n^(-1/5)
//   gaussian -> 0.9  * min(sd, IQR/1.34) * n^(-1/5)  (robust form)
function silverman(X, kernel) {
  const n = X.length;
  if (kernel === 'uniform') return 1.84 * std(X) * Math.pow(n, -0.2);
  return 0.9 * Math.min(std(X), iqr(X) / 1.34) * Math.pow(n, -0.2);
}

// ---- The estimator ------------------------------------------
// f_hat(x) = (1 / n h) * sum_i k((x - x_i) / h)
function kdeAt(x, X, h, kernel) {
  const k = kernelFor(kernel);
  let s = 0;
  for (let i = 0; i < X.length; i++) s += k((x - X[i]) / h);
  return s / (X.length * h);
}

function kdeGrid(X, h, kernel, gridPoints) {
  gridPoints = gridPoints || 120;
  const lo = Math.min.apply(null, X) - h;
  const hi = Math.max.apply(null, X) + h;
  const step = (hi - lo) / (gridPoints - 1);
  const out = [];
  for (let i = 0; i < gridPoints; i++) {
    const x = lo + i * step;
    out.push([x, kdeAt(x, X, h, kernel)]);
  }
  return out;
}

// ---- Sampling from the KDE ----------------------------------
// The KDE is a mixture: pick a data point uniformly, then jitter it
// by the kernel. For the Gaussian that jitter is Normal(0, h); for
// the uniform kernel it is Uniform(-h, h).
function kdeSample(X, h, kernel, n, rand) {
  rand = rand || Math.random;
  const out = [];
  for (let j = 0; j < n; j++) {
    const base = X[Math.floor(rand() * X.length)];
    let jitter;
    if (kernel === 'uniform') {
      jitter = (rand() * 2 - 1) * h;
    } else {
      // Box-Muller for a standard normal, scaled by h.
      const u1 = rand(), u2 = rand();
      const z = Math.sqrt(-2 * Math.log(u1 || 1e-12)) * Math.cos(2 * Math.PI * u2);
      jitter = z * h;
    }
    out.push(base + jitter);
  }
  return out;
}

// ---- CLI -----------------------------------------------------
function main() {
  const fs = require('fs');
  const path = require('path');
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8'));
  const X = data.values;
  const cmd = process.argv[2] || 'grid';

  if (cmd === 'grid') {
    const kernel = process.argv[4] || 'gaussian';
    const h = process.argv[3] ? parseFloat(process.argv[3]) : silverman(X, kernel);
    process.stderr.write(`# n=${X.length}  kernel=${kernel}  h=${h.toFixed(4)}\n`);
    for (const [x, f] of kdeGrid(X, h, kernel)) {
      process.stdout.write(`${x.toFixed(4)}\t${f.toFixed(6)}\n`);
    }
  } else if (cmd === 'sample') {
    const n = process.argv[3] ? parseInt(process.argv[3], 10) : 10;
    const kernel = process.argv[5] || 'gaussian';
    const h = process.argv[4] ? parseFloat(process.argv[4]) : silverman(X, kernel);
    for (const v of kdeSample(X, h, kernel, n)) {
      process.stdout.write(`${v.toFixed(4)}\n`);
    }
  } else {
    process.stderr.write('usage: node sampler.js [grid|sample] ...\n');
    process.exit(1);
  }
}

if (typeof module !== 'undefined' && require.main === module) main();
if (typeof module !== 'undefined') {
  module.exports = { gaussianKernel, uniformKernel, mean, std, iqr, silverman, kdeAt, kdeGrid, kdeSample };
}
