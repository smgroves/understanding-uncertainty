#!/usr/bin/env node
/* ============================================================
 * Understanding Uncertainty · Binomial sampler (standalone, no deps)
 * ------------------------------------------------------------
 * A Binomial(n, p) random variable is two things at once:
 *   1. a PROBABILITY MODEL  -> evaluate P(X = k) for every count k
 *   2. a GENERATIVE PROCESS  -> flip n Bernoulli(p) coins, count the 1s
 *
 * This file does both, in pure stdlib JS, so you can read every
 * line and port it to Python (see sampler.py, same arguments).
 *
 * Usage:
 *   node sampler.js pmf    [n] [p]        # print k, P(X=k) for k=0..n
 *   node sampler.js sample [m] [n] [p]    # draw m counts of n flips each
 * With no n / p, the sample size and death rate from data.json are used.
 * Reads the sample from data.json sitting next to this file.
 * ============================================================ */

'use strict';

// ---- The binomial coefficient  C(n,k) = n! / (k! (n-k)!) ----
// A multiplicative loop, kept in double precision. Exact for the
// n we use here (C(40,20) is well under 2^53).
function nChooseK(n, k) {
  if (k < 0 || k > n) return 0;
  k = Math.min(k, n - k);          // symmetry: C(n,k) == C(n,n-k)
  let c = 1;
  for (let i = 0; i < k; i++) c = c * (n - i) / (i + 1);
  return c;
}

// ---- The PMF  P(X = k) = C(n,k) p^k (1-p)^(n-k) -------------
function binomPmf(n, p, k) {
  if (k < 0 || k > n) return 0;
  if (p <= 0) return k === 0 ? 1 : 0;
  if (p >= 1) return k === n ? 1 : 0;
  return nChooseK(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

// ---- One Bernoulli(p) trial: a single 0/1 flip -------------
function bernoulli(p, rand) {
  return (rand ? rand() : Math.random()) < p ? 1 : 0;
}

// ---- One Binomial(n,p) draw: sum of n Bernoulli trials -----
function binomSampleOne(n, p, rand) {
  let s = 0;
  for (let i = 0; i < n; i++) s += bernoulli(p, rand);
  return s;
}

function binomSample(m, n, p, rand) {
  const out = [];
  for (let j = 0; j < m; j++) out.push(binomSampleOne(n, p, rand));
  return out;
}

// ---- CLI -----------------------------------------------------
function main() {
  const fs = require('fs');
  const path = require('path');
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8'));
  const values = data.values;
  const nDefault = values.length;       // 299 patients
  const pDefault = data.p_hat;          // observed death rate
  const cmd = process.argv[2] || 'pmf';

  if (cmd === 'pmf') {
    const n = process.argv[3] ? parseInt(process.argv[3], 10) : nDefault;
    const p = process.argv[4] ? parseFloat(process.argv[4]) : pDefault;
    process.stderr.write(`# n=${n}  p=${p.toFixed(6)}  mean=n*p=${(n * p).toFixed(4)}\n`);
    for (let k = 0; k <= n; k++) {
      process.stdout.write(`${k}\t${binomPmf(n, p, k).toFixed(6)}\n`);
    }
  } else if (cmd === 'sample') {
    const m = process.argv[3] ? parseInt(process.argv[3], 10) : 10;
    const n = process.argv[4] ? parseInt(process.argv[4], 10) : nDefault;
    const p = process.argv[5] ? parseFloat(process.argv[5]) : pDefault;
    for (const v of binomSample(m, n, p)) process.stdout.write(`${v}\n`);
  } else {
    process.stderr.write('usage: node sampler.js [pmf|sample] ...\n');
    process.exit(1);
  }
}

if (typeof module !== 'undefined' && require.main === module) main();
if (typeof module !== 'undefined') {
  module.exports = { nChooseK, binomPmf, bernoulli, binomSampleOne, binomSample };
}
