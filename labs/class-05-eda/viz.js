/* ============================================================
 * Understanding Uncertainty · Class 05 — Proportions, One-Hot
 * Encoding & the ECDF. Each widget lives in its own IIFE. The
 * presentation toggle, TOC tracking, and prev/next nav are owned
 * by lab-base.js.
 *
 * Shared numeric core (EDA.*) mirrors sampler.js / sampler.py so the
 * page, the samplers, and the assignment all agree on every number.
 * ============================================================ */
(function () {
  'use strict';

  const SVGNS = 'http://www.w3.org/2000/svg';
  const ACCENT = '#b14a2e';
  const NORMAL = '#2f6f9e';
  const NEUTRAL = '#d5e6dc';

  const EDA = {
    proportion(labels, target) {
      const hits = labels.filter(v => v === target).length;
      return hits / labels.length;
    },
    se(p, n) { return Math.sqrt(p * (1 - p) / n); },
    ecdfAt(values, x) {
      return values.filter(v => v <= x).length / values.length;
    },
  };
  window.EDA = EDA;

  // ---------- tiny DOM/SVG helpers ----------
  function el(name, attrs, kids) {
    const e = document.createElementNS(SVGNS, name);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (kids) kids.forEach(c => e.appendChild(c));
    return e;
  }
  function txt(x, y, s, opts) {
    const t = el('text', Object.assign({
      x, y, 'font-family': 'var(--sans)', 'font-size': 10, fill: '#8a857d',
    }, opts || {}));
    t.textContent = s;
    return t;
  }
  function fmt(x, d) { return x.toFixed(d == null ? 2 : d); }
  function svgBox(width, height) {
    return el('svg', { viewBox: `0 0 ${width} ${height}`, width: '100%', height: 'auto', style: 'display:block', role: 'img' });
  }
  function slider(labelText, min, max, step, val) {
    const wrap = document.createElement('label'); wrap.className = 'eda-slider';
    const lab = document.createElement('span'); lab.className = 'eda-slider-label'; lab.textContent = labelText;
    const input = document.createElement('input'); input.type = 'range';
    input.min = min; input.max = max; input.step = step; input.value = val;
    const out = document.createElement('span'); out.className = 'eda-slider-out';
    wrap.appendChild(lab); wrap.appendChild(input); wrap.appendChild(out);
    return { wrap, input, out };
  }
  function wireDownloads(host, data) {
    const row = host.querySelector('.chat-downloads');
    if (!row) return;
    row.querySelectorAll('[data-dl]').forEach(b => {
      b.addEventListener('click', e => {
        e.preventDefault();
        const which = b.getAttribute('data-dl');
        if (which === 'data') {
          LabBase.downloadBlob('data.json', JSON.stringify(data, null, 2), 'application/json');
        } else if (which === 'js') {
          fetch('sampler.js').then(r => r.text()).then(t => LabBase.downloadBlob('sampler.js', t, 'text/javascript'));
        } else if (which === 'py') {
          fetch('sampler.py').then(r => r.text()).then(t => LabBase.downloadBlob('sampler.py', t, 'text/x-python'));
        }
      });
    });
  }

  // ============================================================
  // Widget 1 — try it: proportion & shrinking standard error
  // ============================================================
  function initTryIt(data) {
    const host = document.getElementById('viz-try-it');
    if (!host) return;
    const board = host.querySelector('.eda-board');
    const controls = host.querySelector('.eda-controls');
    const readout = host.querySelector('.eda-readout');
    const outcomes = data.outcome;
    const N = outcomes.length;

    // fixed shuffle so growing n just reveals more of the same order
    const shuf = outcomes.slice();
    (function shuffle() {
      const rng = LabBase.makeLcg(2026);
      for (let i = shuf.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        const t = shuf[i]; shuf[i] = shuf[j]; shuf[j] = t;
      }
    })();

    const width = 680, height = 130, ml = 20, mr = 20, mt = 40, mb = 30;
    const plotW = width - ml - mr, plotH = height - mt - mb;
    const svg = svgBox(width, height);
    board.appendChild(svg);
    const xmin = 0, xmax = 1;
    const x2px = x => ml + (x - xmin) / (xmax - xmin) * plotW;
    const axisY = mt + plotH;

    const gBand = el('g'), gAxis = el('g'), gMark = el('g');
    [gBand, gAxis, gMark].forEach(g => svg.appendChild(g));

    const s = slider('Sample size n', 10, N, 1, N);
    controls.appendChild(s.wrap);

    function draw() {
      [gBand, gAxis, gMark].forEach(g => { g.textContent = ''; });
      const n = parseInt(s.input.value, 10);
      s.out.textContent = n;
      const sub = shuf.slice(0, n);
      const p = EDA.proportion(sub, 1);
      const se = EDA.se(p, n);

      gAxis.appendChild(el('line', { x1: ml, y1: axisY, x2: ml + plotW, y2: axisY, stroke: '#cfc9bd' }));
      for (let i = 0; i <= 10; i++) {
        const xv = i / 10, px = x2px(xv);
        gAxis.appendChild(el('line', { x1: px, y1: axisY, x2: px, y2: axisY + 4, stroke: '#cfc9bd' }));
        if (i % 2 === 0) gAxis.appendChild(txt(px, axisY + 16, fmt(xv, 1), { 'text-anchor': 'middle' }));
      }

      const lo = Math.max(0, p - se), hi = Math.min(1, p + se);
      gBand.appendChild(el('rect', { x: x2px(lo), y: mt, width: x2px(hi) - x2px(lo), height: plotH, fill: NEUTRAL, opacity: 0.7 }));
      gMark.appendChild(el('line', { x1: x2px(p), y1: mt - 8, x2: x2px(p), y2: mt + plotH + 4, stroke: ACCENT, 'stroke-width': 2.4 }));
      gMark.appendChild(txt(x2px(p), mt - 14, 'p̂ = ' + fmt(p, 3), { 'text-anchor': 'middle', fill: ACCENT, 'font-weight': 700 }));

      readout.innerHTML =
        `n = <strong>${n}</strong>: p̂ = <strong>${fmt(p, 3)}</strong>, SE = √(p̂(1−p̂)/n) = <strong>${fmt(se, 4)}</strong>. ` +
        `95%-ish band: (${fmt(Math.max(0, p - 2 * se), 3)}, ${fmt(Math.min(1, p + 2 * se), 3)}).`;
    }
    s.input.addEventListener('input', draw);
    draw();
    wireDownloads(host, data);
  }

  // ============================================================
  // Widget 2 — one-hot encoding table
  // ============================================================
  function initOneHot(data) {
    const host = document.getElementById('viz-onehot');
    if (!host) return;
    const board = host.querySelector('.eda-board');
    const labels = ['1', '2', '3'];
    const triage = data.triage;
    const n = triage.length;

    let html = '<table class="eda-onehot"><thead><tr><th>Patient</th>';
    labels.forEach(l => { html += `<th>triage = ${l}</th>`; });
    html += '</tr></thead><tbody>';
    for (let i = 0; i < 8; i++) {
      html += `<tr><td>${i}</td>`;
      labels.forEach(l => {
        const hit = triage[i] === l;
        html += `<td class="${hit ? 'hit' : ''}">${hit ? 1 : 0}</td>`;
      });
      html += '</tr>';
    }
    html += '</tbody><tfoot><tr><td>p̂ (all 200)</td>';
    labels.forEach(l => {
      const p = EDA.proportion(triage, l);
      html += `<td>${fmt(p, 3)}</td>`;
    });
    html += '</tr></tfoot></table>';
    board.innerHTML = html;
  }

  // ============================================================
  // Widget 3 — the ECDF is a proportion, with its own SE band
  // ============================================================
  function initECDF(data) {
    const host = document.getElementById('viz-ecdf');
    if (!host) return;
    const board = host.querySelector('.eda-board');
    const controls = host.querySelector('.eda-controls');
    const readout = host.querySelector('.eda-readout');
    const hr = data.hr;
    const n = hr.length;
    const sorted = hr.slice().sort((a, b) => a - b);
    const xmin = Math.floor(sorted[0]) - 2, xmax = Math.ceil(sorted[sorted.length - 1]) + 2;

    const width = 680, height = 260, ml = 46, mr = 16, mt = 16, mb = 30;
    const plotW = width - ml - mr, plotH = height - mt - mb;
    const svg = svgBox(width, height);
    board.appendChild(svg);
    const x2px = x => ml + (x - xmin) / (xmax - xmin) * plotW;
    const y2px = y => mt + plotH - y * plotH;

    const gBand = el('g'), gStep = el('g'), gAxis = el('g'), gMark = el('g');
    [gAxis, gBand, gStep, gMark].forEach(g => svg.appendChild(g));

    // static axes + ECDF step curve
    gAxis.appendChild(el('line', { x1: ml, y1: mt + plotH, x2: ml + plotW, y2: mt + plotH, stroke: '#cfc9bd' }));
    gAxis.appendChild(el('line', { x1: ml, y1: mt, x2: ml, y2: mt + plotH, stroke: '#cfc9bd' }));
    for (let i = 0; i <= 6; i++) {
      const xv = xmin + (xmax - xmin) * i / 6, px = x2px(xv);
      gAxis.appendChild(el('line', { x1: px, y1: mt + plotH, x2: px, y2: mt + plotH + 4, stroke: '#cfc9bd' }));
      gAxis.appendChild(txt(px, mt + plotH + 16, fmt(xv, 0), { 'text-anchor': 'middle' }));
    }
    let d = `M ${fmt(x2px(xmin), 1)} ${fmt(y2px(0), 1)}`;
    sorted.forEach((v, i) => {
      const f = (i + 1) / n;
      d += ` L ${fmt(x2px(v), 1)} ${fmt(y2px(f - 1 / n), 1)} L ${fmt(x2px(v), 1)} ${fmt(y2px(f), 1)}`;
    });
    d += ` L ${fmt(x2px(xmax), 1)} ${fmt(y2px(1), 1)}`;
    gStep.appendChild(el('path', { d, fill: 'none', stroke: NORMAL, 'stroke-width': 1.8 }));

    const s = slider('Threshold x (HR)', xmin, xmax, 1, Math.round((xmin + xmax) / 2));
    controls.appendChild(s.wrap);

    function draw() {
      gBand.textContent = ''; gMark.textContent = '';
      const x = parseFloat(s.input.value);
      s.out.textContent = fmt(x, 0);
      const f = EDA.ecdfAt(hr, x);
      const se = EDA.se(f, n);
      const lo = Math.max(0, f - se), hi = Math.min(1, f + se);

      gBand.appendChild(el('rect', { x: ml, y: y2px(hi), width: plotW, height: y2px(lo) - y2px(hi), fill: NEUTRAL, opacity: 0.5 }));
      gMark.appendChild(el('line', { x1: x2px(x), y1: mt, x2: x2px(x), y2: mt + plotH, stroke: ACCENT, 'stroke-width': 1.6, 'stroke-dasharray': '4 3' }));
      gMark.appendChild(el('line', { x1: ml, y1: y2px(f), x2: ml + plotW, y2: y2px(f), stroke: ACCENT, 'stroke-width': 1.2, 'stroke-dasharray': '2 3' }));
      gMark.appendChild(txt(x2px(x), mt - 4, 'x = ' + fmt(x, 0), { 'text-anchor': 'middle', fill: ACCENT, 'font-weight': 700 }));

      readout.innerHTML =
        `F̂(${fmt(x, 0)}) = <strong>${fmt(f, 3)}</strong>, SE = √(F̂(1−F̂)/n) = <strong>${fmt(se, 4)}</strong>. ` +
        `Band: (${fmt(lo, 3)}, ${fmt(hi, 3)}).`;
    }
    s.input.addEventListener('input', draw);
    draw();
  }

  // ---------- boot: one fetch, then all data-driven widgets ----------
  fetch('data.json').then(r => r.json()).then(data => {
    initTryIt(data);
    initOneHot(data);
    initECDF(data);
  }).catch(err => {
    const t = document.getElementById('viz-try-it');
    if (t) t.innerHTML = '<p style="color:#b14a2e">Could not load data.json — open this page over http (e.g. <code>python3 -m http.server</code>), not via file://.</p>';
    console.error(err);
  });

  // ============================================================
  // Glossary content (wiring lives in shared/lab-base.js)
  // ============================================================
  window.GLOSSARY = {
    'one-hot-lab': {
      title: 'One-hot encoding',
      body: '<p>Representing a categorical variable as one 0/1 column per possible label, with exactly one column equal to 1 in each row. Each column\'s own average is a sample proportion for that label.</p>',
    },
    'se-lab': {
      title: 'Standard error',
      body: '<p>The standard deviation of an estimator\'s sampling distribution — how much the estimate would jump around across repeated samples. For a proportion, it is exactly √(p̂(1−p̂)/n).</p>',
    },
  };
})();
