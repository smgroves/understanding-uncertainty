/* ============================================================
 * Class 10 Lecture — small illustrative widget.
 * One purpose: show the sampling distribution of a non-normal
 * statistic (the mean of N=20 Exponential(0.5) lightbulbs)
 * stabilizing as the number of replications T grows.
 * ============================================================ */
(function () {
  'use strict';

  const SVGNS = 'http://www.w3.org/2000/svg';
  const ACCENT = '#b14a2e';
  const N = 20, R = 10, SCALE = 0.5;
  const T_PRESETS = [10, 100, 1000, 10000, 100000];
  const BINS = 120;

  function el(name, attrs) {
    const e = document.createElementNS(SVGNS, name);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  function gaussianKernel(z) { return Math.exp(-(z * z) / 2) / Math.sqrt(2 * Math.PI); }

  function expDraw(rng) { return -SCALE * Math.log(1 - rng()); }

  function std(X) {
    const m = X.reduce((a, b) => a + b, 0) / X.length;
    return Math.sqrt(X.reduce((a, b) => a + (b - m) * (b - m), 0) / X.length);
  }

  // Bin the T sample means, then run the KDE over bin centers weighted
  // by count. Equivalent to a direct KDE but O(grid*BINS) instead of
  // O(grid*T), so T=100,000 stays instant.
  function kdeCurve(means, grid, xmin, xmax) {
    const h = 1.06 * std(means) * Math.pow(means.length, -0.2);
    const counts = new Array(BINS).fill(0);
    const w = (xmax - xmin) / BINS;
    for (let i = 0; i < means.length; i++) {
      let b = Math.floor((means[i] - xmin) / w);
      if (b < 0) b = 0; if (b >= BINS) b = BINS - 1;
      counts[b]++;
    }
    return grid.map(x => {
      let s = 0;
      for (let b = 0; b < BINS; b++) {
        if (!counts[b]) continue;
        const center = xmin + (b + 0.5) * w;
        s += counts[b] * gaussianKernel((x - center) / h);
      }
      return s / (means.length * h);
    });
  }

  function initSimStability() {
    const container = document.getElementById('viz-sim-stability');
    if (!container) return;

    const width = 640, height = 300;
    const ml = 46, mr = 14, mt = 12, mb = 30;
    const plotW = width - ml - mr, plotH = height - mt - mb;
    const xmin = 0.1, xmax = 0.95;

    const row = document.createElement('div');
    row.className = 'sim-preset-row';
    T_PRESETS.forEach((T, i) => {
      const b = document.createElement('button');
      b.className = 'btn';
      b.textContent = 'T = ' + T.toLocaleString();
      b.dataset.t = String(T);
      b.addEventListener('click', () => {
        row.querySelectorAll('button').forEach(x => x.classList.remove('primary'));
        b.classList.add('primary');
        render(T);
      });
      if (i === 0) b.classList.add('primary');
      row.appendChild(b);
    });
    container.querySelector('.sim-preset-row').replaceWith(row);

    const svg = el('svg', { viewBox: `0 0 ${width} ${height}`, width: '100%', height: 'auto', role: 'img' });
    const gAxis = el('g');
    const gCurves = el('g');
    svg.appendChild(gAxis);
    svg.appendChild(gCurves);
    container.appendChild(svg);

    const x2px = x => ml + (x - xmin) / (xmax - xmin) * plotW;

    function drawAxes() {
      gAxis.textContent = '';
      gAxis.appendChild(el('line', { x1: ml, y1: mt + plotH, x2: ml + plotW, y2: mt + plotH, stroke: '#cfc9bd', 'stroke-width': 1 }));
      for (let i = 0; i <= 4; i++) {
        const xv = xmin + (xmax - xmin) * i / 4;
        const px = x2px(xv);
        gAxis.appendChild(el('line', { x1: px, y1: mt + plotH, x2: px, y2: mt + plotH + 4, stroke: '#cfc9bd' }));
        const t = el('text', { x: px, y: mt + plotH + 16, 'text-anchor': 'middle', 'font-size': '10', fill: '#6b675f' });
        t.textContent = xv.toFixed(2);
        gAxis.appendChild(t);
      }
      const label = el('text', { x: ml + plotW / 2, y: height - 4, 'text-anchor': 'middle', 'font-size': '10', fill: '#6b675f' });
      label.textContent = 'sample mean of N=20 lightbulb lifetimes';
      gAxis.appendChild(label);
    }

    function render(T) {
      const rng = window.LabBase.makeLcg(20260724);
      const grid = [];
      const G = 90;
      for (let i = 0; i <= G; i++) grid.push(xmin + (xmax - xmin) * i / G);

      const curves = [];
      let ymax = 0;
      for (let r = 0; r < R; r++) {
        const means = new Array(T);
        for (let t = 0; t < T; t++) {
          let sum = 0;
          for (let i = 0; i < N; i++) sum += expDraw(rng);
          means[t] = sum / N;
        }
        const ys = kdeCurve(means, grid, xmin, xmax);
        for (let i = 0; i < ys.length; i++) if (ys[i] > ymax) ymax = ys[i];
        curves.push(ys);
      }

      drawAxes();
      gCurves.textContent = '';
      const y2px = y => mt + plotH - (y / ymax) * plotH;
      curves.forEach(ys => {
        let d = '';
        grid.forEach((x, i) => { d += (i === 0 ? 'M' : 'L') + x2px(x).toFixed(2) + ',' + y2px(ys[i]).toFixed(2) + ' '; });
        gCurves.appendChild(el('path', { d, fill: 'none', stroke: ACCENT, 'stroke-width': 1.3, 'stroke-opacity': 0.55 }));
      });
    }

    render(T_PRESETS[0]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSimStability);
  } else {
    initSimStability();
  }
})();
