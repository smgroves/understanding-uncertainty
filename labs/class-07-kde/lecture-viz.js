/* ============================================================
 * Class 07 Lecture — small illustrative widget.
 * Overlay the uniform and Gaussian kernels at a shared bandwidth h,
 * both scaled so each integrates to 1 — same job, different shape.
 * ============================================================ */
(function () {
  'use strict';

  const SVGNS = 'http://www.w3.org/2000/svg';
  const ACCENT = '#b14a2e';
  const BLUE = '#3a6ea5';

  function el(name, attrs) {
    const e = document.createElementNS(SVGNS, name);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  function uniformKernel(z) { return Math.abs(z) < 1 ? 0.5 : 0; }
  function gaussianKernel(z) { return Math.exp(-(z * z) / 2) / Math.sqrt(2 * Math.PI); }

  function initKernelCompare() {
    const container = document.getElementById('viz-kernel-compare');
    if (!container) return;

    const controls = document.createElement('div');
    controls.className = 'kernel-compare-controls';
    controls.innerHTML = '<label>bandwidth h = <span class="h-val">1.0</span> <input type="range" min="0.4" max="2.5" step="0.1" value="1" class="h-slider"></label>';
    container.appendChild(controls);

    const width = 480, height = 220;
    const ml = 36, mr = 16, mt = 12, mb = 24;
    const plotW = width - ml - mr, plotH = height - mt - mb;
    const xmin = -4, xmax = 4;

    const svg = el('svg', { viewBox: `0 0 ${width} ${height}`, width: '100%', height: 'auto', style: 'display:block;max-width:420px;margin:0 auto', role: 'img' });
    const gAxis = el('g'), gU = el('g'), gG = el('g');
    svg.appendChild(gAxis); svg.appendChild(gU); svg.appendChild(gG);
    container.appendChild(svg);

    const x2px = x => ml + (x - xmin) / (xmax - xmin) * plotW;

    function render(h) {
      const ymax = 0.5 / h + 0.05;
      const y2px = y => mt + plotH - (y / ymax) * plotH;

      gAxis.textContent = '';
      gAxis.appendChild(el('line', { x1: ml, y1: mt + plotH, x2: ml + plotW, y2: mt + plotH, stroke: '#cfc9bd' }));

      let dU = '';
      for (let i = 0; i <= 200; i++) {
        const x = xmin + (xmax - xmin) * i / 200;
        const y = uniformKernel(x / h) / h;
        dU += (i === 0 ? 'M' : 'L') + x2px(x).toFixed(2) + ',' + y2px(y).toFixed(2) + ' ';
      }
      gU.textContent = '';
      gU.appendChild(el('path', { d: dU, fill: ACCENT, 'fill-opacity': 0.18, stroke: ACCENT, 'stroke-width': 2 }));

      let dG = '';
      for (let i = 0; i <= 200; i++) {
        const x = xmin + (xmax - xmin) * i / 200;
        const y = gaussianKernel(x / h) / h;
        dG += (i === 0 ? 'M' : 'L') + x2px(x).toFixed(2) + ',' + y2px(y).toFixed(2) + ' ';
      }
      gG.textContent = '';
      gG.appendChild(el('path', { d: dG, fill: 'none', stroke: BLUE, 'stroke-width': 2 }));
    }

    const slider = container.querySelector('.h-slider');
    slider.addEventListener('input', () => {
      container.querySelector('.h-val').textContent = parseFloat(slider.value).toFixed(1);
      render(parseFloat(slider.value));
    });

    render(1);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initKernelCompare);
  } else {
    initKernelCompare();
  }
})();
