/* ============================================================
 * Class 05 Lecture — small illustrative widget.
 * Drag six toy sample points on a number line; the ECDF step
 * function below recomputes live from their positions.
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

  function initEcdfDrag() {
    const container = document.getElementById('viz-ecdf-drag');
    if (!container) return;

    const width = 560, height = 200;
    const ml = 36, mr = 16, mt = 14, mb = 40;
    const plotW = width - ml - mr, plotH = height - mt - mb;
    const xmin = 0, xmax = 10;

    const svg = el('svg', { viewBox: `0 0 ${width} ${height}`, width: '100%', height: 'auto', role: 'img' });
    container.appendChild(svg);

    const gAxis = el('g'), gStep = el('g'), gPoints = el('g');
    svg.appendChild(gAxis); svg.appendChild(gStep); svg.appendChild(gPoints);

    const readout = document.createElement('div');
    readout.className = 'ecdf-drag-readout';
    container.appendChild(readout);

    const x2px = x => ml + (x - xmin) / (xmax - xmin) * plotW;
    const y2px = y => mt + plotH - y * plotH;
    const px2x = px => xmin + (px - ml) / plotW * (xmax - xmin);

    let X = [2, 3.5, 4, 6, 6.5, 8.5];

    function drawAxes() {
      gAxis.textContent = '';
      gAxis.appendChild(el('line', { x1: ml, y1: mt + plotH, x2: ml + plotW, y2: mt + plotH, stroke: '#cfc9bd' }));
      gAxis.appendChild(el('line', { x1: ml, y1: mt, x2: ml, y2: mt + plotH, stroke: '#cfc9bd' }));
      [0, 0.25, 0.5, 0.75, 1].forEach(v => {
        gAxis.appendChild(el('line', { x1: ml - 4, y1: y2px(v), x2: ml, y2: y2px(v), stroke: '#cfc9bd' }));
        const t = el('text', { x: ml - 8, y: y2px(v) + 3, 'text-anchor': 'end', 'font-size': '10', fill: '#6b675f' });
        t.textContent = v.toFixed(2);
        gAxis.appendChild(t);
      });
      const axLabel = el('text', { x: ml + plotW / 2, y: height - 6, 'text-anchor': 'middle', 'font-size': '10', fill: '#6b675f' });
      axLabel.textContent = 'x';
      gAxis.appendChild(axLabel);
    }

    function render() {
      drawAxes();
      const sorted = X.slice().sort((a, b) => a - b);
      const n = sorted.length;

      gStep.textContent = '';
      let d = `M${x2px(xmin).toFixed(1)},${y2px(0).toFixed(1)} `;
      let prevX = xmin, count = 0;
      sorted.forEach(xi => {
        d += `L${x2px(xi).toFixed(1)},${y2px(count / n).toFixed(1)} `;
        count++;
        d += `L${x2px(xi).toFixed(1)},${y2px(count / n).toFixed(1)} `;
      });
      d += `L${x2px(xmax).toFixed(1)},${y2px(1).toFixed(1)} `;
      gStep.appendChild(el('path', { d, fill: 'none', stroke: ACCENT, 'stroke-width': 2 }));

      gPoints.textContent = '';
      X.forEach((xi, i) => {
        const c = el('circle', { cx: x2px(xi), cy: mt + plotH + 14, r: 7, fill: ACCENT, 'fill-opacity': 0.25, stroke: ACCENT, 'stroke-width': 1.6, style: 'cursor:grab' });
        c.dataset.i = String(i);
        gPoints.appendChild(c);
      });

      readout.textContent = `sample: [${sorted.map(v => v.toFixed(1)).join(', ')}]  ·  n = ${n}`;
    }

    let dragging = null;
    svg.addEventListener('pointerdown', e => {
      if (e.target.dataset && e.target.dataset.i !== undefined) { dragging = +e.target.dataset.i; svg.setPointerCapture(e.pointerId); }
    });
    svg.addEventListener('pointermove', e => {
      if (dragging === null) return;
      const rect = svg.getBoundingClientRect();
      const px = (e.clientX - rect.left) * (width / rect.width);
      let x = px2x(px);
      x = Math.max(xmin, Math.min(xmax, Math.round(x * 4) / 4));
      X[dragging] = x;
      render();
    });
    svg.addEventListener('pointerup', () => { dragging = null; });
    svg.addEventListener('pointerleave', () => { dragging = null; });

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEcdfDrag);
  } else {
    initEcdfDrag();
  }
})();
