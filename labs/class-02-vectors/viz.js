/* ============================================================
 * Understanding Uncertainty · Class 02 — Vectors, Distance & the
 * Inner Product. Each widget lives in its own IIFE. The presentation
 * toggle, TOC tracking, and prev/next nav are owned by lab-base.js.
 *
 * Shared numeric core (VEC.*) mirrors sampler.js / sampler.py so the
 * page, the samplers, and the assignment all agree on every number.
 * ============================================================ */
(function () {
  'use strict';

  const SVGNS = 'http://www.w3.org/2000/svg';
  const ACCENT = '#b14a2e';
  const NORMAL = '#2f6f9e';

  // ---------- vector numeric core (mirror of the samplers) ----------
  const VEC = {
    dot(x, y) { return x.reduce((s, xi, i) => s + xi * y[i], 0); },
    norm(x) { return Math.sqrt(this.dot(x, x)); },
    distance(x, y) {
      const d = x.map((xi, i) => xi - y[i]);
      return this.norm(d);
    },
    mean(X) { return X.reduce((a, b) => a + b, 0) / X.length; },
    covariance(X, Y) {
      const mx = this.mean(X), my = this.mean(Y);
      const cx = X.map(x => x - mx), cy = Y.map(y => y - my);
      return this.dot(cx, cy) / X.length;
    },
  };
  window.VEC = VEC; // exposed for console tinkering

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
  // Blend from cream (far) to accent-red (close), t in [0,1], 0 = far.
  function heatColor(t) {
    const c0 = [251, 250, 247], c1 = [177, 74, 46];
    const r = Math.round(c0[0] + (c1[0] - c0[0]) * t);
    const g = Math.round(c0[1] + (c1[1] - c0[1]) * t);
    const b = Math.round(c0[2] + (c1[2] - c0[2]) * t);
    return `rgb(${r},${g},${b})`;
  }
  function hrColor(t) {
    // t in [0,1]: blue (low HR) to accent-red (high HR)
    const c0 = [47, 111, 158], c1 = [177, 74, 46];
    const r = Math.round(c0[0] + (c1[0] - c0[0]) * t);
    const g = Math.round(c0[1] + (c1[1] - c0[1]) * t);
    const b = Math.round(c0[2] + (c1[2] - c0[2]) * t);
    return `rgb(${r},${g},${b})`;
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
  // Widget 1 — try it: the pairwise distance matrix
  // ============================================================
  function initTryIt(data) {
    const host = document.getElementById('viz-try-it');
    if (!host) return;
    const board = host.querySelector('.vc-board');
    const readout = host.querySelector('.vc-readout');
    const n = data.n;
    const points = data.na.map((na, i) => [na, data.cl[i]]);

    const D = points.map((p, i) => points.map((q, j) => VEC.distance(p, q)));
    const maxD = Math.max.apply(null, D.map(row => Math.max.apply(null, row)));

    const size = 480, cell = size / n, ml = 4, mt = 4;
    const svg = svgBox(size + ml + 4, size + mt + 4);
    board.innerHTML = '';
    board.appendChild(svg);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const d = D[i][j];
        const t = maxD > 0 ? 1 - d / maxD : 1; // 1 = close (dark), 0 = far
        const rect = el('rect', {
          class: 'vc-cell',
          x: ml + j * cell, y: mt + i * cell, width: cell, height: cell,
          fill: heatColor(t), stroke: '#fbfaf7', 'stroke-width': 0.5,
        });
        rect.addEventListener('mouseenter', () => {
          const [xi, yi] = points[i], [xj, yj] = points[j];
          readout.innerHTML =
            `Patient ${i} (Na=${fmt(xi, 0)}, Cl=${fmt(yi, 0)}) to patient ${j} (Na=${fmt(xj, 0)}, Cl=${fmt(yj, 0)}): ` +
            `√[(${fmt(xi, 0)}−${fmt(xj, 0)})² + (${fmt(yi, 0)}−${fmt(yj, 0)})²] = ` +
            `<strong>${fmt(d, 2)}</strong>`;
        });
        svg.appendChild(rect);
      }
    }
    readout.innerHTML = `Hover a cell. Darkest cells (other than the diagonal) are the two most similar patients out of all  ${n} × ${n} pairs; the diagonal (distance 0) never lights up because every patient matches itself exactly.`;
    wireDownloads(host, data);
  }

  // ============================================================
  // Widget 2 — patients as points: Na vs Cl, colored by HR
  // ============================================================
  function initScatter(data) {
    const host = document.getElementById('viz-scatter');
    if (!host) return;
    const board = host.querySelector('.vc-board');
    const width = 500, height = 340, ml = 46, mr = 16, mt = 16, mb = 34;
    const plotW = width - ml - mr, plotH = height - mt - mb;
    const svg = svgBox(width, height);
    board.innerHTML = ''; board.appendChild(svg);

    const na = data.na, cl = data.cl, hr = data.hr;
    const xmin = Math.min.apply(null, na) - 2, xmax = Math.max.apply(null, na) + 2;
    const ymin = Math.min.apply(null, cl) - 2, ymax = Math.max.apply(null, cl) + 2;
    const hrmin = Math.min.apply(null, hr), hrmax = Math.max.apply(null, hr);
    const x2px = x => ml + (x - xmin) / (xmax - xmin) * plotW;
    const y2px = y => mt + plotH - (y - ymin) / (ymax - ymin) * plotH;

    svg.appendChild(el('line', { x1: ml, y1: mt + plotH, x2: ml + plotW, y2: mt + plotH, stroke: '#cfc9bd' }));
    svg.appendChild(el('line', { x1: ml, y1: mt, x2: ml, y2: mt + plotH, stroke: '#cfc9bd' }));
    for (let i = 0; i <= 5; i++) {
      const xv = xmin + (xmax - xmin) * i / 5, px = x2px(xv);
      svg.appendChild(el('line', { x1: px, y1: mt + plotH, x2: px, y2: mt + plotH + 4, stroke: '#cfc9bd' }));
      svg.appendChild(txt(px, mt + plotH + 16, fmt(xv, 0), { 'text-anchor': 'middle' }));
      const yv = ymin + (ymax - ymin) * i / 5, py = y2px(yv);
      svg.appendChild(el('line', { x1: ml - 4, y1: py, x2: ml, y2: py, stroke: '#cfc9bd' }));
      svg.appendChild(txt(ml - 8, py + 3, fmt(yv, 0), { 'text-anchor': 'end' }));
    }
    svg.appendChild(txt(ml + plotW / 2, height - 4, 'Na', { 'text-anchor': 'middle', 'font-size': 11 }));
    const yl = txt(12, mt + plotH / 2, 'Cl', { 'text-anchor': 'middle', 'font-size': 11 });
    yl.setAttribute('transform', `rotate(-90 12 ${mt + plotH / 2})`);
    svg.appendChild(yl);

    na.forEach((x, i) => {
      const t = hrmax > hrmin ? (hr[i] - hrmin) / (hrmax - hrmin) : 0.5;
      svg.appendChild(el('circle', { cx: x2px(x), cy: y2px(cl[i]), r: 5, fill: hrColor(t), opacity: 0.85, stroke: '#fff', 'stroke-width': 0.7 }));
    });
  }

  // ============================================================
  // Widget 3 — covariance: raw vs. centered scatter
  // ============================================================
  function initCovariance(data) {
    const host = document.getElementById('viz-covariance');
    if (!host) return;
    const board = host.querySelector('.vc-board');
    const readout = host.querySelector('.vc-readout');
    const na = data.na, cl = data.cl;
    const mna = VEC.mean(na), mcl = VEC.mean(cl);
    const cna = na.map(x => x - mna), ccl = cl.map(x => x - mcl);
    const cov = VEC.covariance(na, cl);

    const width = 640, height = 260, panelW = 300, gap = 40;
    const svg = svgBox(width, height);
    board.innerHTML = ''; board.appendChild(svg);

    function drawPanel(x0, X, Y, title, symmetric) {
      const ml = 40, mr = 16, mt = 28, mb = 30;
      const plotW = panelW - ml - mr, plotH = height - mt - mb;
      const xmin = symmetric ? -Math.max.apply(null, X.map(Math.abs)) * 1.15 : Math.min.apply(null, X) - 1;
      const xmax = symmetric ? Math.max.apply(null, X.map(Math.abs)) * 1.15 : Math.max.apply(null, X) + 1;
      const ymin = symmetric ? -Math.max.apply(null, Y.map(Math.abs)) * 1.15 : Math.min.apply(null, Y) - 1;
      const ymax = symmetric ? Math.max.apply(null, Y.map(Math.abs)) * 1.15 : Math.max.apply(null, Y) + 1;
      const x2px = v => x0 + ml + (v - xmin) / (xmax - xmin) * plotW;
      const y2px = v => mt + plotH - (v - ymin) / (ymax - ymin) * plotH;

      svg.appendChild(txt(x0 + ml, 16, title, { 'font-size': 12, 'font-weight': 700, fill: '#1f1d1a' }));
      svg.appendChild(el('line', { x1: x0 + ml, y1: mt + plotH, x2: x0 + ml + plotW, y2: mt + plotH, stroke: '#cfc9bd' }));
      svg.appendChild(el('line', { x1: x0 + ml, y1: mt, x2: x0 + ml, y2: mt + plotH, stroke: '#cfc9bd' }));
      if (symmetric) {
        // origin cross-hairs
        svg.appendChild(el('line', { x1: x2px(0), y1: mt, x2: x2px(0), y2: mt + plotH, stroke: '#e0d8c6', 'stroke-dasharray': '3 3' }));
        svg.appendChild(el('line', { x1: x0 + ml, y1: y2px(0), x2: x0 + ml + plotW, y2: y2px(0), stroke: '#e0d8c6', 'stroke-dasharray': '3 3' }));
      }
      X.forEach((x, i) => {
        svg.appendChild(el('circle', { cx: x2px(x), cy: y2px(Y[i]), r: 4, fill: NORMAL, opacity: 0.75 }));
      });
    }

    drawPanel(0, na, cl, 'Raw: Na vs. Cl', false);
    drawPanel(panelW + gap, cna, ccl, 'Centered: (Na−mean) vs. (Cl−mean)', true);

    readout.innerHTML =
      `mean(Na) = ${fmt(mna, 1)}, mean(Cl) = ${fmt(mcl, 1)}. cov(Na, Cl) = c_Na · c_Cl / n = <strong>${fmt(cov, 2)}</strong> — ` +
      (cov > 0 ? 'positive: patients above-average in one tend to be above-average in the other.' : 'negative or near zero.');
  }

  // ---------- boot: one fetch, then all data-driven widgets ----------
  fetch('data.json').then(r => r.json()).then(data => {
    initTryIt(data);
    initScatter(data);
    initCovariance(data);
  }).catch(err => {
    const t = document.getElementById('viz-try-it');
    if (t) t.innerHTML = '<p style="color:#b14a2e">Could not load data.json — open this page over http (e.g. <code>python3 -m http.server</code>), not via file://.</p>';
    console.error(err);
  });

  // ============================================================
  // Inline glossary (contract from CLAUDE.md) — verbatim pattern
  // ============================================================
  const GLOSSARY = {
    'inner-product': {
      title: 'Inner product (dot product)',
      body: '<p>Multiply matching entries of two equal-length vectors and add the results into one number. It is the single operation underneath length, distance, covariance, and matrix multiplication.</p>',
    },
    covariance: {
      title: 'Covariance',
      body: '<p>A centered, averaged inner product between two variables: subtract each variable\'s mean, dot the results, divide by n. Positive covariance means the variables tend to be above (or below) their means together; zero means no linear relationship.</p>',
    },
    orthogonal: {
      title: 'Orthogonal',
      body: '<p>Two vectors whose inner product is exactly zero. Geometrically, they point in directions that share no component. It is the formal statement behind independence of random variables and many optimality conditions in statistics.</p>',
    },
    hadamard: {
      title: 'Hadamard product',
      body: '<p>Element-by-element multiplication of two same-shaped arrays, with no summation — what <code>A * B</code> computes in NumPy. It is a different operation from matrix multiplication (<code>A @ B</code>), which sums over a shared dimension.</p>',
    },
    broadcasting: {
      title: 'Broadcasting',
      body: '<p>NumPy\'s rule for combining arrays of different shapes by automatically expanding the smaller one — for example, a row vector minus a column vector produces a full grid of pairwise differences, with no explicit loop.</p>',
    },
  };

  window.GLOSSARY = GLOSSARY;

})();
