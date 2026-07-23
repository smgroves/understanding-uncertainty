#!/usr/bin/env node
/* Understanding Uncertainty - Proportions, one-hot encoding & the ECDF
 * sampler (standalone, pure JS, no dependencies)
 * ------------------------------------------------------------------
 * Mirrors sampler.py and viz.js's EDA.* core line-for-line.
 *
 * Usage (Node):
 *   node sampler.js proportion <label1,label2,...> <target>
 *   node sampler.js ecdf <v1,v2,...> <x>
 *
 * Reads the sample from data.json sitting next to this file (not
 * needed for the two commands above, which take their data inline).
 */
'use strict';

function proportion(labels, target) {
  return labels.filter(v => v === target).length / labels.length;
}
function se(p, n) { return Math.sqrt(p * (1 - p) / n); }
function ecdfAt(values, x) {
  return values.filter(v => v <= x).length / values.length;
}

function main() {
  const argv = process.argv.slice(2);
  if (!argv.length) {
    process.stderr.write('usage: node sampler.js [proportion|ecdf] ...\n');
    process.exit(1);
  }
  const cmd = argv[0];
  if (cmd === 'proportion') {
    const labels = argv[1].split(',');
    const target = argv[2];
    const p = proportion(labels, target);
    console.log(p.toFixed(6) + ' ' + se(p, labels.length).toFixed(6));
  } else if (cmd === 'ecdf') {
    const values = argv[1].split(',').map(parseFloat);
    const x = parseFloat(argv[2]);
    const f = ecdfAt(values, x);
    console.log(f.toFixed(6) + ' ' + se(f, values.length).toFixed(6));
  } else {
    process.stderr.write('usage: node sampler.js [proportion|ecdf] ...\n');
    process.exit(1);
  }
}

main();
