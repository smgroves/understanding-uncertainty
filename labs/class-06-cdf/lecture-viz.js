/* ============================================================
 * Class 06 Lecture — small illustrative widget.
 * Slide the number of grid bins K and watch a fixed sample's
 * histogram approach the smooth density as the grid gets finer.
 * ============================================================ */
(function () {
  'use strict';

  const SVGNS = 'http://www.w3.org/2000/svg';
  const ACCENT = '#b14a2e';

  function el(name, attrs) {
    const e = document.createElementNS(SVGNS, name);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  function normalPdf(z) { return Math.exp(-(z * z) / 2) / Math.sqrt(2 * Math.PI); }

  function initGridLimit() {
    const container = document.getElementById('viz-grid-limit');
    if (!container) return;

    // Fixed sample: 500 standard-normal draws via seeded LCG + Box-Muller.
    const rng = window.LabBase.makeLcg(20260910);
    const N = 500;
    const X = [];
    for (let i = 0; i < N; i += 2) {
      const u1 = Math.max(rng(), 1e-9), u2 = rng();
      const r = Math.sqrt(-2 * Math.log(u1));
      X.push(r * Math.cos(2 * Math.PI * u2));
      X.push(r * Math.sin(2 * Math.PI * u2));
    }

    const controls = document.createElement('div');
    controls.className = 'grid-limit-controls';
    controls.innerHTML = '<label>grid bins K = <span class="k-val">6</span> <input type="range" min="3" max="60" step="1" value="6" class="k-slider"></label>';
    container.appendChild(controls);

    const width = 560, height = 240;
    const ml = 36, mr = 16, mt = 12, mb = 24;
    const plotW = width - ml - mr, plotH = height - mt - mb;
    const xmin = -4, xmax = 4;

    const svg = el('svg', { viewBox: `0 0 ${width} ${height}`, width: '100%', height: 'auto', role: 'img' });
    const gBars = el('g'), gCurve = el('g'), gAxis = el('g');
    svg.appendChild(gAxis); svg.appendChild(gBars); svg.appendChild(gCurve);
    container.appendChild(svg);

    const x2px = x => ml + (x - xmin) / (xmax - xmin) * plotW;

    function render(K) {
      const h = (xmax - xmin) / K;
      const counts = new Array(K).fill(0);
      X.forEach(x => {
        let b = Math.floor((x - xmin) / h);
        if (b < 0) b = 0; if (b >= K) b = K - 1;
        counts[b]++;
      });
      const density = counts.map(c => c / (X.length * h));
      const ymax = Math.max(0.5, ...density, ...[0, 1, 2, 3].map(z => normalPdf(z)));
      const y2px = y => mt + plotH - (y / ymax) * plotH;

      gAxis.textContent = '';
      gAxis.appendChild(el('line', { x1: ml, y1: mt + plotH, x2: ml + plotW, y2: mt + plotH, stroke: '#cfc9bd' }));

      gBars.textContent = '';
      for (let b = 0; b < K; b++) {
        const x0 = xmin + b * h, x1 = xmin + (b + 1) * h;
        gBars.appendChild(el('rect', {
          x: x2px(x0), y: y2px(density[b]), width: Math.max(0, x2px(x1) - x2px(x0) - 1), height: mt + plotH - y2px(density[b]),
          fill: ACCENT, 'fill-opacity': 0.28, stroke: ACCENT, 'stroke-width': 0.6,
        }));
      }

      gCurve.textContent = '';
      let d = '';
      for (let i = 0; i <= 100; i++) {
        const x = xmin + (xmax - xmin) * i / 100;
        const y = normalPdf(x);
        d += (i === 0 ? 'M' : 'L') + x2px(x).toFixed(2) + ',' + y2px(y).toFixed(2) + ' ';
      }
      gCurve.appendChild(el('path', { d, fill: 'none', stroke: '#3a6ea5', 'stroke-width': 1.8 }));
    }

    const slider = container.querySelector('.k-slider');
    slider.addEventListener('input', () => {
      container.querySelector('.k-val').textContent = slider.value;
      render(parseInt(slider.value, 10));
    });

    render(6);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGridLimit);
  } else {
    initGridLimit();
  }
})();
