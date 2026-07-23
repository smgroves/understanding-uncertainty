#!/usr/bin/env node
/* Understanding Uncertainty - Random numbers & the sample mean sampler
 * (standalone, pure JS, no dependencies)
 * ------------------------------------------------------------------
 * Mirrors sampler.py and viz.js's RNGL.* core line-for-line. The LCG
 * here is copy-identical to lab-base.js's LabBase.makeLcg.
 *
 * Usage (Node):
 *   node sampler.js mse <xhat>
 *   node sampler.js lcg <seed> <n>
 *   node sampler.js choice <k> <seed> <0|1>
 *
 * Reads the sample from data.json sitting next to this file.
 */
'use strict';
const fs = require('fs');
const path = require('path');

function makeLcg(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 2147483647;
  };
}

function mse(X, xhat) {
  return X.reduce((s, x) => s + (x - xhat) * (x - xhat), 0) / X.length;
}

function choice(items, k, seed, replace) {
  const rng = makeLcg(seed);
  if (replace) {
    const out = [];
    for (let i = 0; i < k; i++) out.push(items[Math.floor(rng() * items.length)]);
    return out;
  }
  const pool = items.slice();
  const out = [];
  for (let i = 0; i < k; i++) {
    const idx = Math.floor(rng() * pool.length);
    out.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return out;
}

function loadAges() {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8'));
  return data.age;
}

function main() {
  const argv = process.argv.slice(2);
  if (!argv.length) {
    process.stderr.write('usage: node sampler.js [mse|lcg|choice] ...\n');
    process.exit(1);
  }
  const cmd = argv[0];
  if (cmd === 'mse') {
    console.log(mse(loadAges(), parseFloat(argv[1])).toFixed(4));
  } else if (cmd === 'lcg') {
    const seed = parseInt(argv[1], 10), n = parseInt(argv[2], 10);
    const rng = makeLcg(seed);
    const out = [];
    for (let i = 0; i < n; i++) out.push(rng().toFixed(6));
    console.log(out.join(' '));
  } else if (cmd === 'choice') {
    const k = parseInt(argv[1], 10), seed = parseInt(argv[2], 10), replace = argv[3] === '1';
    console.log(choice(loadAges(), k, seed, replace).join(' '));
  } else {
    process.stderr.write('usage: node sampler.js [mse|lcg|choice] ...\n');
    process.exit(1);
  }
}

main();
