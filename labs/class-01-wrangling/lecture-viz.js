/* ============================================================
 * Class 01 Lecture — small illustrative widget.
 * A fixed right-skewed toy sample; toggle between raw, log, and
 * arcsinh transforms and watch the histogram symmetrize.
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

  function arcsinh(x) { return Math.log(x + Math.sqrt(x * x + 1)); }

  function initTailTransform() {
    const container = document.getElementById('viz-tail-transform');
    if (!container) return;

    // Fixed right-skewed sample: exp(N(0, 0.8)) via seeded LCG + Box-Muller,
    // scaled to look like a "listing price" variable.
    const rng = window.LabBase.makeLcg(20260827);
    const raw = [];
    for (let i = 0; i < 300; i += 2) {
      const u1 = Math.max(rng(), 1e-9), u2 = rng();
      const r = Math.sqrt(-2 * Math.log(u1));
      raw.push(1000 * Math.exp(0.8 * r * Math.cos(2 * Math.PI * u2)));
      raw.push(1000 * Math.exp(0.8 * r * Math.sin(2 * Math.PI * u2)));
    }

    const controls = document.createElement('div');
    controls.className = 'tail-controls';
    controls.innerHTML =
      '<button type="button" class="btn primary" data-t="raw">Raw</button>' +
      '<button type="button" class="btn" data-t="log">log</button>' +
      '<button type="button" class="btn" data-t="arcsinh">arcsinh</button>';
    container.appendChild(controls);

    const width = 480, height = 200;
    const ml = 30, mr = 14, mt = 12, mb = 22;
    const plotW = width - ml - mr, plotH = height - mt - mb;

    const svg = el('svg', { viewBox: `0 0 ${width} ${height}`, width: '100%', height: 'auto', role: 'img' });
    const gAxis = el('g'), gBars = el('g');
    svg.appendChild(gAxis); svg.appendChild(gBars);
    container.appendChild(svg);

    const readout = document.createElement('div');
    readout.className = 'tail-readout';
    container.appendChild(readout);

    function transform(vals, t) {
      if (t === 'log') return vals.map(v => Math.log(v));
      if (t === 'arcsinh') return vals.map(v => arcsinh(v));
      return vals.slice();
    }

    function render(t) {
      const vals = transform(raw, t);
      const xmin = Math.min(...vals), xmax = Math.max(...vals);
      const K = 24;
      const h = (xmax - xmin) / K;
      const counts = new Array(K).fill(0);
      vals.forEach(v => {
        let b = Math.floor((v - xmin) / h);
        if (b >= K) b = K - 1; if (b < 0) b = 0;
        counts[b]++;
      });
      const cmax = Math.max(...counts);
      const x2px = x => ml + (x - xmin) / (xmax - xmin) * plotW;
      const y2px = c => mt + plotH - (c / cmax) * plotH;

      gAxis.textContent = '';
      gAxis.appendChild(el('line', { x1: ml, y1: mt + plotH, x2: ml + plotW, y2: mt + plotH, stroke: '#cfc9bd' }));

      gBars.textContent = '';
      for (let b = 0; b < K; b++) {
        const x0 = xmin + b * h, x1 = xmin + (b + 1) * h;
        gBars.appendChild(el('rect', {
          x: x2px(x0), y: y2px(counts[b]), width: Math.max(0, x2px(x1) - x2px(x0) - 1), height: mt + plotH - y2px(counts[b]),
          fill: ACCENT, 'fill-opacity': 0.3, stroke: ACCENT, 'stroke-width': 0.6,
        }));
      }

      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      const sorted = vals.slice().sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      readout.textContent = `mean = ${mean.toFixed(2)} · median = ${median.toFixed(2)} · gap = ${Math.abs(mean - median).toFixed(2)}`;
    }

    controls.querySelectorAll('button').forEach(b => {
      b.addEventListener('click', () => {
        controls.querySelectorAll('button').forEach(x => x.classList.remove('primary'));
        b.classList.add('primary');
        render(b.dataset.t);
      });
    });

    render('raw');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTailTransform);
  } else {
    initTailTransform();
  }
})();
