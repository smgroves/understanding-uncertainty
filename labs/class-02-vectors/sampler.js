#!/usr/bin/env node
/* Understanding Uncertainty - Vectors & the inner product sampler
 * (standalone, pure JS, no dependencies)
 * ------------------------------------------------------------------
 * Mirrors sampler.py and viz.js's VEC.* core line-for-line.
 *
 * Usage (Node):
 *   node sampler.js dot <x1,x2,...> <y1,y2,...>
 *   node sampler.js norm <x1,x2,...>
 *   node sampler.js distance <x1,x2,...> <y1,y2,...>
 *   node sampler.js covariance <na|cl> <na|cl>
 *   node sampler.js dmatrix
 *
 * Reads the sample from data.json sitting next to this file.
 */
'use strict';
const fs = require('fs');
const path = require('path');

function dot(x, y) { return x.reduce((s, xi, i) => s + xi * y[i], 0); }
function norm(x) { return Math.sqrt(dot(x, x)); }
function distance(x, y) { return norm(x.map((xi, i) => xi - y[i])); }
function mean(X) { return X.reduce((a, b) => a + b, 0) / X.length; }
function covariance(X, Y) {
  const mx = mean(X), my = mean(Y);
  const cx = X.map(x => x - mx), cy = Y.map(y => y - my);
  return dot(cx, cy) / X.length;
}
function distanceMatrix(points) {
  const n = points.length;
  const D = [];
  for (let i = 0; i < n; i++) {
    const row = [];
    for (let j = 0; j < n; j++) row.push(distance(points[i], points[j]));
    D.push(row);
  }
  return D;
}
function fmt(x) { return x.toFixed(4); }
function parseVec(s) { return s.split(',').map(parseFloat); }

function load() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8'));
}

function main() {
  const argv = process.argv.slice(2);
  if (!argv.length) {
    process.stderr.write('usage: node sampler.js [dot|norm|distance|covariance|dmatrix] ...\n');
    process.exit(1);
  }
  const cmd = argv[0];
  if (cmd === 'dot') {
    console.log(fmt(dot(parseVec(argv[1]), parseVec(argv[2]))));
  } else if (cmd === 'norm') {
    console.log(fmt(norm(parseVec(argv[1]))));
  } else if (cmd === 'distance') {
    console.log(fmt(distance(parseVec(argv[1]), parseVec(argv[2]))));
  } else if (cmd === 'covariance') {
    const data = load();
    console.log(fmt(covariance(data[argv[1]], data[argv[2]])));
  } else if (cmd === 'dmatrix') {
    const data = load();
    const points = data.na.map((x, i) => [x, data.cl[i]]);
    const D = distanceMatrix(points);
    process.stderr.write(`# n=${points.length}\n`);
    D.forEach(row => console.log(row.map(fmt).join(' ')));
  } else {
    process.stderr.write('usage: node sampler.js [dot|norm|distance|covariance|dmatrix] ...\n');
    process.exit(1);
  }
}

main();
