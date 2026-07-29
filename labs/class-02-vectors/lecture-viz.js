/* ============================================================
 * Class 02 Lecture — small illustrative widget.
 * Two draggable 2D vectors: live dot product, length, angle,
 * and the projection of one onto the other.
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

  function initDotProduct() {
    const container = document.getElementById('viz-dot-product');
    if (!container) return;

    const width = 320, height = 320;
    const cx = width / 2, cy = height / 2;
    const scale = 22; // px per unit

    const svg = el('svg', { viewBox: `0 0 ${width} ${height}`, width: '100%', height: 'auto', style: 'display:block;max-width:360px;margin:0 auto', role: 'img' });
    container.appendChild(svg);

    // grid
    const gGrid = el('g');
    for (let i = -6; i <= 6; i++) {
      gGrid.appendChild(el('line', { x1: cx + i * scale, y1: 0, x2: cx + i * scale, y2: height, stroke: '#e7e2d6', 'stroke-width': 1 }));
      gGrid.appendChild(el('line', { x1: 0, y1: cy + i * scale, x2: width, y2: cy + i * scale, stroke: '#e7e2d6', 'stroke-width': 1 }));
    }
    gGrid.appendChild(el('line', { x1: 0, y1: cy, x2: width, y2: cy, stroke: '#b6afa0', 'stroke-width': 1.2 }));
    gGrid.appendChild(el('line', { x1: cx, y1: 0, x2: cx, y2: height, stroke: '#b6afa0', 'stroke-width': 1.2 }));
    svg.appendChild(gGrid);

    const gProj = el('g'); svg.appendChild(gProj);
    const gVecs = el('g'); svg.appendChild(gVecs);
    const readout = document.createElement('div');
    readout.className = 'dot-readout';
    container.appendChild(readout);

    function toPx(v) { return { x: cx + v.x * scale, y: cy - v.y * scale }; }
    function toUnit(px, py) { return { x: (px - cx) / scale, y: -(py - cy) / scale }; }

    function arrow(v, color) {
      const p = toPx(v);
      const g = el('g');
      g.appendChild(el('line', { x1: cx, y1: cy, x2: p.x, y2: p.y, stroke: color, 'stroke-width': 2.2 }));
      const ang = Math.atan2(cy - p.y, p.x - cx);
      const ah = 8;
      const p1 = { x: p.x - ah * Math.cos(ang - 0.4), y: p.y + ah * Math.sin(ang - 0.4) };
      const p2 = { x: p.x - ah * Math.cos(ang + 0.4), y: p.y + ah * Math.sin(ang + 0.4) };
      g.appendChild(el('path', { d: `M${p.x},${p.y} L${p1.x},${p1.y} M${p.x},${p.y} L${p2.x},${p2.y}`, stroke: color, 'stroke-width': 2.2, 'stroke-linecap': 'round' }));
      return g;
    }

    let vx = { x: 3, y: 1 }, vy = { x: 1, y: 2.5 };

    function render() {
      gVecs.textContent = '';
      gProj.textContent = '';

      const dot = vx.x * vy.x + vx.y * vy.y;
      const lx = Math.sqrt(vx.x * vx.x + vx.y * vx.y);
      const ly = Math.sqrt(vy.x * vy.x + vy.y * vy.y);
      const cosang = lx > 0 && ly > 0 ? Math.max(-1, Math.min(1, dot / (lx * ly))) : 0;
      const angleDeg = Math.acos(cosang) * 180 / Math.PI;

      // projection of y onto x
      let projLen = 0;
      if (lx > 1e-6) {
        const t = dot / (lx * lx);
        projLen = t * lx; // signed length of the shadow, in the direction of x
        const proj = { x: vx.x * t, y: vx.y * t };
        const a = toPx(proj), b = toPx(vy);
        gProj.appendChild(el('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: '#9a9488', 'stroke-width': 1, 'stroke-dasharray': '4,3' }));
        gProj.appendChild(el('line', { x1: cx, y1: cy, x2: a.x, y2: a.y, stroke: BLUE, 'stroke-width': 4, 'stroke-opacity': 0.35 }));
      }

      gVecs.appendChild(arrow(vx, ACCENT));
      gVecs.appendChild(arrow(vy, BLUE));

      [{ v: vx, color: ACCENT }, { v: vy, color: BLUE }].forEach(({ v, color }, i) => {
        const p = toPx(v);
        const handle = el('circle', { cx: p.x, cy: p.y, r: 9, fill: color, 'fill-opacity': 0.15, stroke: color, 'stroke-width': 2, style: 'cursor:grab' });
        handle.dataset.which = i === 0 ? 'x' : 'y';
        gVecs.appendChild(handle);
      });

      const relation = Math.abs(angleDeg - 90) < 3 ? 'orthogonal (⊥)' : (dot > 0 ? 'positively correlated' : 'negatively correlated');
      readout.innerHTML =
        `<span style="color:${ACCENT}">x = (${vx.x.toFixed(1)}, ${vx.y.toFixed(1)})</span>, ` +
        `<span style="color:${BLUE}">y = (${vy.x.toFixed(1)}, ${vy.y.toFixed(1)})</span><br>` +
        `x·y = ${dot.toFixed(2)} &nbsp;·&nbsp; ‖x‖ = ${lx.toFixed(2)} &nbsp;·&nbsp; ‖y‖ = ${ly.toFixed(2)} &nbsp;·&nbsp; angle = ${angleDeg.toFixed(0)}°<br>` +
        `shadow length = ${projLen.toFixed(2)} &nbsp;·&nbsp; shadow × ‖x‖ = ${(projLen * lx).toFixed(2)} = x·y <em>(the asymmetric shadow, times the vector it's cast on, always reconstructs the symmetric dot product)</em><br>` +
        `<strong>${relation}</strong>`;
    }

    let dragging = null;
    svg.addEventListener('pointerdown', e => {
      const t = e.target;
      if (t.dataset && t.dataset.which) { dragging = t.dataset.which; svg.setPointerCapture(e.pointerId); }
    });
    svg.addEventListener('pointermove', e => {
      if (!dragging) return;
      const rect = svg.getBoundingClientRect();
      const px = (e.clientX - rect.left) * (width / rect.width);
      const py = (e.clientY - rect.top) * (height / rect.height);
      let u = toUnit(px, py);
      u.x = Math.max(-6, Math.min(6, Math.round(u.x * 4) / 4));
      u.y = Math.max(-6, Math.min(6, Math.round(u.y * 4) / 4));
      if (dragging === 'x') vx = u; else vy = u;
      render();
    });
    svg.addEventListener('pointerup', () => { dragging = null; });
    svg.addEventListener('pointerleave', () => { dragging = null; });

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDotProduct);
  } else {
    initDotProduct();
  }
})();
