#!/usr/bin/env node
/* Understanding Uncertainty - Wrangling & robust statistics sampler
 * (standalone, pure JS, no dependencies)
 * ------------------------------------------------------------------
 * Mirrors sampler.py and viz.js's WR.* core line-for-line: the same
 * mean, variance, median, and quantile on the same 250-listing sample.
 *
 * Usage (Node):
 *   node sampler.js describe <price|mileage>
 *   node sampler.js mean     <price|mileage>
 *   node sampler.js variance <price|mileage>
 *   node sampler.js median   <price|mileage>
 *   node sampler.js quantile <price|mileage> <frac>
 *
 * Reads the sample from data.json sitting next to this file.
 */
'use strict';
const fs = require('fs');
const path = require('path');

function mean(X) { return X.reduce((a, b) => a + b, 0) / X.length; }
function variance(X) {
  const m = mean(X);
  return X.reduce((a, b) => a + (b - m) * (b - m), 0) / X.length;
}
function std(X) { return Math.sqrt(variance(X)); }
function median(X) {
  const v = X.slice().sort((a, b) => a - b);
  const n = v.length, mid = Math.floor(n / 2);
  if (mid !== n / 2) return v[mid];
  return (v[mid - 1] + v[mid]) / 2;
}
function quantile(X, frac) {
  const v = X.slice().sort((a, b) => a - b);
  const n = v.length;
  const idx = Math.max(Math.ceil(n * frac) - 1, 0);
  return v[idx];
}
function fmt(x) { return x.toFixed(4); }

function load(varName) {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8'));
  if (varName !== 'price' && varName !== 'mileage') {
    process.stderr.write("variable must be 'price' or 'mileage'\n");
    process.exit(1);
  }
  return data[varName];
}

function main() {
  const argv = process.argv.slice(2);
  if (!argv.length) {
    process.stderr.write('usage: node sampler.js [describe|mean|variance|median|quantile] <price|mileage> [frac]\n');
    process.exit(1);
  }
  const cmd = argv[0];
  if (cmd === 'describe') {
    const X = load(argv[1]);
    const q25 = quantile(X, 0.25), q75 = quantile(X, 0.75);
    process.stderr.write(`# n=${X.length}  variable=${argv[1]}\n`);
    console.log('mean:     ' + fmt(mean(X)));
    console.log('variance: ' + fmt(variance(X)));
    console.log('sd:       ' + fmt(std(X)));
    console.log('median:   ' + fmt(median(X)));
    console.log('q25:      ' + fmt(q25));
    console.log('q75:      ' + fmt(q75));
    console.log('IQR:      ' + fmt(q75 - q25));
  } else if (cmd === 'mean') {
    console.log(fmt(mean(load(argv[1]))));
  } else if (cmd === 'variance') {
    console.log(fmt(variance(load(argv[1]))));
  } else if (cmd === 'median') {
    console.log(fmt(median(load(argv[1]))));
  } else if (cmd === 'quantile') {
    const X = load(argv[1]);
    console.log(fmt(quantile(X, parseFloat(argv[2]))));
  } else {
    process.stderr.write('usage: node sampler.js [describe|mean|variance|median|quantile] <price|mileage> [frac]\n');
    process.exit(1);
  }
}

main();
