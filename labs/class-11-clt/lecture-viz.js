/* ============================================================
 * Class 11 Lecture — small illustrative widget.
 * Draw sample means of a skewed population (Exponential(1)),
 * standardize them, and watch the CLT kick in as n grows.
 * ============================================================ */
(function () {
  'use strict';

  const SVGNS = 'http://www.w3.org/2000/svg';
  const ACCENT = '#b14a2e';
  const BLUE = '#3a6ea5';
  const N_PRESETS = [1, 2, 5, 30, 100];
  const M = 2000; // replicate sample means per n

  function el(name, attrs) {
    const e = document.createElementNS(SVGNS, name);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  function normalPdf(z) { return Math.exp(-(z * z) / 2) / Math.sqrt(2 * Math.PI); }

  function initCltDemo() {
    const container = document.getElementById('viz-clt-demo');
    if (!container) return;

    const controls = document.createElement('div');
    controls.className = 'clt-preset-row';
    N_PRESETS.forEach((n, i) => {
      const b = document.createElement('button');
      b.className = 'btn';
      b.textContent = 'n = ' + n;
      b.addEventListener('click', () => {
        controls.querySelectorAll('button').forEach(x => x.classList.remove('primary'));
        b.classList.add('primary');
        render(n);
      });
      if (i === 0) b.classList.add('primary');
      controls.appendChild(b);
    });
    container.appendChild(controls);

    const width = 500, height = 240;
    const ml = 36, mr = 16, mt = 12, mb = 24;
    const plotW = width - ml - mr, plotH = height - mt - mb;
    const xmin = -4, xmax = 4;

    const svg = el('svg', { viewBox: `0 0 ${width} ${height}`, width: '100%', height: 'auto', role: 'img' });
    const gAxis = el('g'), gBars = el('g'), gCurve = el('g');
    svg.appendChild(gAxis); svg.appendChild(gBars); svg.appendChild(gCurve);
    container.appendChild(svg);

    const x2px = x => ml + (x - xmin) / (xmax - xmin) * plotW;
    const rng = window.LabBase.makeLcg(20261101);
    function expDraw() { return -Math.log(1 - Math.max(rng(), 1e-9)); } // Exponential(1): mean 1, sd 1

    function render(n) {
      const K = 40;
      const h = (xmax - xmin) / K;
      const counts = new Array(K).fill(0);
      for (let m = 0; m < M; m++) {
        let sum = 0;
        for (let i = 0; i < n; i++) sum += expDraw();
        const mean = sum / n;
        const z = Math.sqrt(n) * (mean - 1) / 1; // population sd = 1
        let b = Math.floor((z - xmin) / h);
        if (b >= 0 && b < K) counts[b]++;
      }
      const density = counts.map(c => c / (M * h));
      const ymax = Math.max(0.5, ...density);
      const y2px = y => mt + plotH - (y / ymax) * plotH;

      gAxis.textContent = '';
      gAxis.appendChild(el('line', { x1: ml, y1: mt + plotH, x2: ml + plotW, y2: mt + plotH, stroke: '#cfc9bd' }));

      gBars.textContent = '';
      for (let b = 0; b < K; b++) {
        const x0 = xmin + b * h, x1 = xmin + (b + 1) * h;
        gBars.appendChild(el('rect', {
          x: x2px(x0), y: y2px(density[b]), width: Math.max(0, x2px(x1) - x2px(x0) - 1), height: mt + plotH - y2px(density[b]),
          fill: ACCENT, 'fill-opacity': 0.3, stroke: ACCENT, 'stroke-width': 0.6,
        }));
      }

      gCurve.textContent = '';
      let d = '';
      for (let i = 0; i <= 100; i++) {
        const x = xmin + (xmax - xmin) * i / 100;
        d += (i === 0 ? 'M' : 'L') + x2px(x).toFixed(2) + ',' + y2px(normalPdf(x)).toFixed(2) + ' ';
      }
      gCurve.appendChild(el('path', { d, fill: 'none', stroke: BLUE, 'stroke-width': 1.8 }));
    }

    render(N_PRESETS[0]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCltDemo);
  } else {
    initCltDemo();
  }
})();
