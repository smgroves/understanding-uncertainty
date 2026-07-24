/* ============================================================
 * Class 03 Lecture — small illustrative widget.
 * Flip a (possibly biased) coin repeatedly and watch the running
 * average of the +1/-1 gamble converge toward its expectation.
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

  function initCoinFlip() {
    const container = document.getElementById('viz-coin-flip');
    if (!container) return;

    const width = 620, height = 220;
    const ml = 42, mr = 14, mt = 10, mb = 24;
    const plotW = width - ml - mr, plotH = height - mt - mb;

    const controls = document.createElement('div');
    controls.className = 'coin-controls';
    controls.innerHTML =
      '<label>p(heads) = <span class="p-val">0.50</span> ' +
      '<input type="range" min="0.05" max="0.95" step="0.05" value="0.5" class="p-slider"></label>' +
      '<button type="button" class="btn flip-1">Flip once</button>' +
      '<button type="button" class="btn flip-50">Flip 50</button>' +
      '<button type="button" class="btn reset">Reset</button>';
    container.appendChild(controls);

    const svg = el('svg', { viewBox: `0 0 ${width} ${height}`, width: '100%', height: 'auto', role: 'img' });
    const gAxis = el('g'), gPath = el('g'), gTarget = el('g');
    svg.appendChild(gAxis); svg.appendChild(gTarget); svg.appendChild(gPath);
    container.appendChild(svg);

    const readout = document.createElement('div');
    readout.className = 'coin-readout';
    container.appendChild(readout);

    let p = 0.5;
    let rng = window.LabBase.makeLcg(20260901);
    let flips = []; // sequence of +1/-1
    let running = []; // running average after each flip

    function x2px(i, n) { return ml + (n <= 1 ? 0 : i / (n - 1)) * plotW; }
    function y2px(v) { return mt + plotH / 2 - v * (plotH / 2); }

    function drawAxes() {
      gAxis.textContent = '';
      gAxis.appendChild(el('line', { x1: ml, y1: y2px(0), x2: ml + plotW, y2: y2px(0), stroke: '#cfc9bd', 'stroke-width': 1 }));
      [-1, -0.5, 0, 0.5, 1].forEach(v => {
        gAxis.appendChild(el('line', { x1: ml - 4, y1: y2px(v), x2: ml, y2: y2px(v), stroke: '#cfc9bd' }));
        const t = el('text', { x: ml - 8, y: y2px(v) + 3, 'text-anchor': 'end', 'font-size': '10', fill: '#6b675f' });
        t.textContent = v.toFixed(1);
        gAxis.appendChild(t);
      });
    }

    function render() {
      drawAxes();
      const target = 2 * p - 1;
      gTarget.textContent = '';
      gTarget.appendChild(el('line', {
        x1: ml, y1: y2px(target), x2: ml + plotW, y2: y2px(target),
        stroke: '#3a6ea5', 'stroke-width': 1.2, 'stroke-dasharray': '5,4',
      }));

      gPath.textContent = '';
      if (running.length > 0) {
        let d = '';
        running.forEach((v, i) => { d += (i === 0 ? 'M' : 'L') + x2px(i, running.length).toFixed(2) + ',' + y2px(v).toFixed(2) + ' '; });
        gPath.appendChild(el('path', { d, fill: 'none', stroke: ACCENT, 'stroke-width': 1.8 }));
      }

      const n = flips.length;
      const avg = n ? running[n - 1] : 0;
      readout.innerHTML = `n = ${n} flips &nbsp;·&nbsp; running average = ${avg.toFixed(3)} &nbsp;·&nbsp; target E[X] = 2p-1 = ${target.toFixed(2)}`;
    }

    function flipOnce() {
      const x = rng() < p ? 1 : -1;
      flips.push(x);
      const prevSum = flips.length > 1 ? running[running.length - 1] * (flips.length - 1) : 0;
      running.push((prevSum + x) / flips.length);
    }

    container.querySelector('.p-slider').addEventListener('input', e => {
      p = parseFloat(e.target.value);
      container.querySelector('.p-val').textContent = p.toFixed(2);
      render();
    });
    container.querySelector('.flip-1').addEventListener('click', () => { flipOnce(); render(); });
    container.querySelector('.flip-50').addEventListener('click', () => { for (let i = 0; i < 50; i++) flipOnce(); render(); });
    container.querySelector('.reset').addEventListener('click', () => { flips = []; running = []; rng = window.LabBase.makeLcg(20260901 + Math.floor(Math.random() * 1e6)); render(); });

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCoinFlip);
  } else {
    initCoinFlip();
  }
})();
