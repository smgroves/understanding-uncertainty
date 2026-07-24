/* ============================================================
 * Class 04 Lecture — small illustrative widget.
 * Step the LCG recurrence one draw at a time and watch consecutive
 * draws (u_i, u_i+1) fill the unit square with no visible pattern.
 * ============================================================ */
(function () {
  'use strict';

  const SVGNS = 'http://www.w3.org/2000/svg';
  const ACCENT = '#b14a2e';
  const MULT = 1103515245, INC = 12345, MOD = 0x7fffffff;

  function el(name, attrs) {
    const e = document.createElementNS(SVGNS, name);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  function initLcgStep() {
    const container = document.getElementById('viz-lcg-step');
    if (!container) return;

    const controls = document.createElement('div');
    controls.className = 'lcg-controls';
    controls.innerHTML =
      '<button type="button" class="btn step-1">Step once</button>' +
      '<button type="button" class="btn step-20">Step 20</button>' +
      '<button type="button" class="btn reset">Reset (seed = 1)</button>';
    container.appendChild(controls);

    const trace = document.createElement('div');
    trace.className = 'lcg-trace';
    container.appendChild(trace);

    const size = 260;
    const svg = el('svg', { viewBox: `0 0 ${size} ${size}`, width: '100%', height: 'auto', style: 'display:block;max-width:280px;margin:8px auto 0', role: 'img' });
    svg.appendChild(el('rect', { x: 0, y: 0, width: size, height: size, fill: 'none', stroke: '#cfc9bd' }));
    const gPts = el('g');
    svg.appendChild(gPts);
    container.appendChild(svg);

    const readout = document.createElement('div');
    readout.className = 'lcg-readout';
    container.appendChild(readout);

    let seed = 1;
    let history = [];

    function step() {
      seed = (seed * MULT + INC) & MOD;
      history.push(seed / MOD);
    }

    function render() {
      const last8 = history.slice(-8).map(u => u.toFixed(4));
      trace.innerHTML = `x<sub>n+1</sub> = (1103515245 · x<sub>n</sub> + 12345) mod 2<sup>31</sup><br>last draws: ${last8.join(', ') || '—'}`;

      gPts.textContent = '';
      for (let i = 0; i + 1 < history.length; i++) {
        const px = history[i] * size, py = size - history[i + 1] * size;
        gPts.appendChild(el('circle', { cx: px, cy: py, r: 2, fill: ACCENT, 'fill-opacity': 0.6 }));
      }

      readout.textContent = `n = ${history.length} draws · current seed = ${seed}`;
    }

    container.querySelector('.step-1').addEventListener('click', () => { step(); render(); });
    container.querySelector('.step-20').addEventListener('click', () => { for (let i = 0; i < 20; i++) step(); render(); });
    container.querySelector('.reset').addEventListener('click', () => { seed = 1; history = []; render(); });

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLcgStep);
  } else {
    initLcgStep();
  }
})();
