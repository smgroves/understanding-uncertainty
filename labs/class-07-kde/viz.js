/* ============================================================
 * Understanding Uncertainty · Class 07 — KDE lab widgets
 * Each widget lives in its own IIFE. The presentation toggle,
 * TOC tracking, and prev/next nav are owned by lab-base.js.
 *
 * Shared numeric core (KDE.*) mirrors sampler.js / sampler.py
 * line-for-line so all three agree on every number.
 * ============================================================ */
(function () {
  'use strict';

  const SVGNS = 'http://www.w3.org/2000/svg';
  const ACCENT = '#b14a2e';

  // ---------- KDE numeric core (mirror of sampler.js) ----------
  const KDE = {
    gaussian: z => Math.exp(-(z * z) / 2) / Math.sqrt(2 * Math.PI),
    uniform:  z => (Math.abs(z) < 1 ? 0.5 : 0),
    kernelFor(name) { return name === 'uniform' ? this.uniform : this.gaussian; },
    mean(X) { return X.reduce((a, b) => a + b, 0) / X.length; },
    std(X) {
      const m = this.mean(X);
      return Math.sqrt(X.reduce((a, b) => a + (b - m) * (b - m), 0) / X.length);
    },
    quantile(sorted, p) {
      const k = (sorted.length - 1) * p;
      const lo = Math.floor(k), hi = Math.min(lo + 1, sorted.length - 1);
      return sorted[lo] + (sorted[hi] - sorted[lo]) * (k - lo);
    },
    iqr(X) {
      const s = X.slice().sort((a, b) => a - b);
      return this.quantile(s, 0.75) - this.quantile(s, 0.25);
    },
    silverman(X, kernel) {
      const n = X.length;
      if (kernel === 'uniform') return 1.84 * this.std(X) * Math.pow(n, -0.2);
      return 0.9 * Math.min(this.std(X), this.iqr(X) / 1.34) * Math.pow(n, -0.2);
    },
    at(x, X, h, kernel) {
      const k = this.kernelFor(kernel);
      let s = 0;
      for (let i = 0; i < X.length; i++) s += k((x - X[i]) / h);
      return s / (X.length * h);
    },
  };
  window.KDE = KDE; // exposed for console tinkering

  // ---------- tiny DOM/SVG helpers ----------
  function el(name, attrs, kids) {
    const e = document.createElementNS(SVGNS, name);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (kids) kids.forEach(c => e.appendChild(c));
    return e;
  }
  function fmt(x, d) { return x.toFixed(d == null ? 2 : d); }

  // A reusable density plot. Returns { svg, render(opts) }.
  //   opts: { X, h, kernel, xmax, ymax, showHist, showRug,
  //           components:bool, highlightX:number|null, curveColor }
  function makePlot(width, height) {
    const ml = 46, mr = 14, mt = 12, mb = 30;
    const svg = el('svg', {
      viewBox: `0 0 ${width} ${height}`,
      width: '100%', height: 'auto',
      style: 'display:block',
      role: 'img',
    });
    const gGrid = el('g'); svg.appendChild(gGrid);
    const gHist = el('g'); svg.appendChild(gHist);
    const gComp = el('g'); svg.appendChild(gComp);
    const gCurve = el('g'); svg.appendChild(gCurve);
    const gRug = el('g'); svg.appendChild(gRug);
    const gAxis = el('g'); svg.appendChild(gAxis);

    function render(o) {
      [gGrid, gHist, gComp, gCurve, gRug, gAxis].forEach(g => { g.textContent = ''; });
      const X = o.X, h = o.h, kernel = o.kernel;
      const xmin = 0, xmax = o.xmax;
      const plotW = width - ml - mr, plotH = height - mt - mb;
      const x2px = x => ml + (x - xmin) / (xmax - xmin) * plotW;
      const y2px = y => mt + plotH - (y / o.ymax) * plotH;

      // axes
      gAxis.appendChild(el('line', { x1: ml, y1: mt + plotH, x2: ml + plotW, y2: mt + plotH, stroke: '#cfc9bd', 'stroke-width': 1 }));
      gAxis.appendChild(el('line', { x1: ml, y1: mt, x2: ml, y2: mt + plotH, stroke: '#cfc9bd', 'stroke-width': 1 }));
      const nticks = 6;
      for (let i = 0; i <= nticks; i++) {
        const xv = xmin + (xmax - xmin) * i / nticks;
        const px = x2px(xv);
        gAxis.appendChild(el('line', { x1: px, y1: mt + plotH, x2: px, y2: mt + plotH + 4, stroke: '#cfc9bd' }));
        const t = el('text', { x: px, y: mt + plotH + 16, 'text-anchor': 'middle', fill: '#8a857d',
          'font-family': 'var(--sans)', 'font-size': 10 });
        t.textContent = '$' + Math.round(xv) + 'k';
        gAxis.appendChild(t);
      }
      const yl = el('text', { x: 12, y: mt + plotH / 2, 'text-anchor': 'middle', fill: '#8a857d',
        'font-family': 'var(--sans)', 'font-size': 10, transform: `rotate(-90 12 ${mt + plotH / 2})` });
      yl.textContent = 'density';
      gAxis.appendChild(yl);

      // histogram (density-normalized) so it shares the KDE's y-scale
      if (o.showHist) {
        const bins = 18, bw = xmax / bins;
        const counts = new Array(bins).fill(0);
        X.forEach(v => { const b = Math.min(bins - 1, Math.floor(v / bw)); counts[b]++; });
        counts.forEach((c, b) => {
          const dens = c / (X.length * bw);
          const x0 = x2px(b * bw), x1 = x2px((b + 1) * bw);
          gHist.appendChild(el('rect', {
            x: x0 + 0.5, y: y2px(dens), width: Math.max(0, x1 - x0 - 1),
            height: (mt + plotH) - y2px(dens), fill: '#efe9dc', stroke: '#e0d8c6',
          }));
        });
      }

      // per-point kernel components (the "stack these bumps" view)
      if (o.components) {
        const N = 160;
        for (let j = 0; j < X.length; j++) {
          let d = `M ${x2px(xmin)} ${y2px(0)}`;
          const k = KDE.kernelFor(kernel);
          for (let i = 0; i <= N; i++) {
            const x = xmin + (xmax - xmin) * i / N;
            const y = k((x - X[j]) / h) / (X.length * h);
            d += ` L ${fmt(x2px(x), 1)} ${fmt(y2px(y), 1)}`;
          }
          gComp.appendChild(el('path', { d, fill: 'none', stroke: '#9ec3ae', 'stroke-width': 1, opacity: 0.7 }));
        }
      }

      // the KDE curve itself
      const N = 220;
      let d = '';
      for (let i = 0; i <= N; i++) {
        const x = xmin + (xmax - xmin) * i / N;
        const y = KDE.at(x, X, h, kernel);
        d += (i === 0 ? 'M ' : ' L ') + fmt(x2px(x), 1) + ' ' + fmt(y2px(y), 1);
      }
      // fill under curve
      const fillD = d + ` L ${x2px(xmax)} ${y2px(0)} L ${x2px(xmin)} ${y2px(0)} Z`;
      gCurve.appendChild(el('path', { d: fillD, fill: (o.curveColor || ACCENT) + '22', stroke: 'none' }));
      gCurve.appendChild(el('path', { d, fill: 'none', stroke: o.curveColor || ACCENT, 'stroke-width': 2.2 }));

      // rug of data points
      if (o.showRug) {
        X.forEach(v => {
          gRug.appendChild(el('line', {
            x1: x2px(v), y1: mt + plotH, x2: x2px(v), y2: mt + plotH - 7,
            stroke: ACCENT, 'stroke-width': 1, opacity: 0.5,
          }));
        });
      }

      // optional highlight of a query point x and its window
      if (o.highlightX != null) {
        const hx = o.highlightX;
        if (o.windowHalf != null) {
          gGrid.appendChild(el('rect', {
            x: x2px(Math.max(xmin, hx - o.windowHalf)), y: mt,
            width: x2px(Math.min(xmax, hx + o.windowHalf)) - x2px(Math.max(xmin, hx - o.windowHalf)),
            height: plotH, fill: '#fde0d2', opacity: 0.5,
          }));
        }
        gGrid.appendChild(el('line', { x1: x2px(hx), y1: mt, x2: x2px(hx), y2: mt + plotH, stroke: ACCENT, 'stroke-width': 1.5, 'stroke-dasharray': '4 3' }));
        const fx = KDE.at(hx, X, h, kernel);
        gGrid.appendChild(el('circle', { cx: x2px(hx), cy: y2px(fx), r: 4, fill: ACCENT }));
      }
    }

    return { svg, render };
  }

  // Small labelled slider builder → returns { wrap, input, out }
  function slider(labelText, min, max, step, val, unit) {
    const wrap = document.createElement('label');
    wrap.className = 'kde-slider';
    const lab = document.createElement('span'); lab.className = 'kde-slider-label'; lab.textContent = labelText;
    const input = document.createElement('input');
    input.type = 'range'; input.min = min; input.max = max; input.step = step; input.value = val;
    const out = document.createElement('span'); out.className = 'kde-slider-out';
    wrap.appendChild(lab); wrap.appendChild(input); wrap.appendChild(out);
    wrap._unit = unit || '';
    return { wrap, input, out };
  }

  // ============================================================
  // Widget 1 — the KDE playground (real car-price data)
  // ============================================================
  (function initPlayground() {
    const host = document.getElementById('viz-try-it');
    if (!host) return;

    fetch('data.json').then(r => r.json()).then(data => {
      const X = data.values;
      const xmax = 40;
      const plot = makePlot(680, 300);
      const board = host.querySelector('.kde-board');
      board.appendChild(plot.svg);

      const controls = host.querySelector('.kde-controls');
      const hSlider = slider('Bandwidth h', 0.3, 10, 0.1, 3.5, '$k');
      controls.appendChild(hSlider.wrap);

      // kernel toggle
      const krow = document.createElement('div'); krow.className = 'kde-radio';
      krow.innerHTML = '<span class="kde-slider-label">Kernel</span>';
      const kg = radioBtn('Gaussian', 'gaussian', true);
      const ku = radioBtn('Uniform', 'uniform', false);
      krow.appendChild(kg.wrap); krow.appendChild(ku.wrap);
      controls.appendChild(krow);

      // checkboxes
      const opts = document.createElement('div'); opts.className = 'kde-checks';
      const cHist = checkBtn('Histogram', true);
      const cRug = checkBtn('Rug (data)', true);
      opts.appendChild(cHist.wrap); opts.appendChild(cRug.wrap);
      controls.appendChild(opts);

      // silverman button + readout
      const srow = document.createElement('div'); srow.className = 'kde-silverman';
      const sBtn = document.createElement('button'); sBtn.className = 'btn'; sBtn.textContent = "Silverman's h";
      const sOut = document.createElement('span'); sOut.className = 'kde-note';
      srow.appendChild(sBtn); srow.appendChild(sOut);
      controls.appendChild(srow);

      let kernel = 'gaussian';
      function draw() {
        const h = parseFloat(hSlider.input.value);
        hSlider.out.textContent = fmt(h, 1) + ' $k';
        const sh = KDE.silverman(X, kernel);
        sOut.textContent = `Silverman rule for the ${kernel} kernel: h ≈ ${fmt(sh, 2)} $k`;
        // ymax: fit to a slightly-below-silverman curve so bars/curve don't clip
        const ymax = Math.max(0.14, peak(X, Math.max(0.6, KDE.silverman(X, kernel) * 0.6), kernel) * 1.15);
        plot.render({ X, h, kernel, xmax, ymax, showHist: cHist.input.checked, showRug: cRug.input.checked });
      }
      function setKernel(k) { kernel = k; kg.input.checked = (k === 'gaussian'); ku.input.checked = (k === 'uniform'); draw(); }

      hSlider.input.addEventListener('input', draw);
      kg.input.addEventListener('change', () => setKernel('gaussian'));
      ku.input.addEventListener('change', () => setKernel('uniform'));
      cHist.input.addEventListener('change', draw);
      cRug.input.addEventListener('change', draw);
      sBtn.addEventListener('click', () => { hSlider.input.value = fmt(KDE.silverman(X, kernel), 1); draw(); });

      // downloads
      wireDownloads(host, data);
      draw();
    }).catch(err => { host.innerHTML = '<p style="color:#b14a2e">Could not load data.json — open this page over http (or from the lab folder).</p>'; console.error(err); });

    function peak(X, h, kernel) {
      let m = 0;
      for (let x = 0; x <= 40; x += 0.25) m = Math.max(m, KDE.at(x, X, h, kernel));
      return m;
    }
  })();

  function radioBtn(text, value, checked) {
    const wrap = document.createElement('label'); wrap.className = 'kde-radio-btn';
    const input = document.createElement('input'); input.type = 'radio'; input.name = 'kde-kernel-' + Math.random().toString(36).slice(2, 6);
    input.value = value; input.checked = !!checked;
    const span = document.createElement('span'); span.textContent = text;
    wrap.appendChild(input); wrap.appendChild(span);
    return { wrap, input };
  }
  function checkBtn(text, checked) {
    const wrap = document.createElement('label'); wrap.className = 'kde-check-btn';
    const input = document.createElement('input'); input.type = 'checkbox'; input.checked = !!checked;
    const span = document.createElement('span'); span.textContent = text;
    wrap.appendChild(input); wrap.appendChild(span);
    return { wrap, input };
  }

  function wireDownloads(host, data) {
    const row = host.querySelector('.chat-downloads');
    if (!row) return;
    const btns = row.querySelectorAll('[data-dl]');
    btns.forEach(b => {
      b.addEventListener('click', e => {
        e.preventDefault();
        const which = b.getAttribute('data-dl');
        if (which === 'data') {
          LabBase.downloadBlob('data.json', JSON.stringify(data), 'application/json');
        } else if (which === 'js') {
          fetch('sampler.js').then(r => r.text()).then(t => LabBase.downloadBlob('sampler.js', t, 'text/javascript'));
        } else if (which === 'py') {
          fetch('sampler.py').then(r => r.text()).then(t => LabBase.downloadBlob('sampler.py', t, 'text/x-python'));
        }
      });
    });
  }

  // ============================================================
  // Widget 2 — moving window (uniform kernel = counting in a box)
  // ============================================================
  (function initWindow() {
    const host = document.getElementById('viz-window');
    if (!host) return;
    fetch('data.json').then(r => r.json()).then(data => {
      const X = data.values, n = X.length, xmax = 40;
      const plot = makePlot(680, 260);
      host.querySelector('.kde-board').appendChild(plot.svg);
      const controls = host.querySelector('.kde-controls');
      const xS = slider('Window centre x', 1, 38, 0.5, 5);
      const hS = slider('Half-width h', 0.5, 10, 0.5, 6);
      controls.appendChild(xS.wrap); controls.appendChild(hS.wrap);
      const out = host.querySelector('.kde-window-readout');

      function draw() {
        const x = parseFloat(xS.input.value), h = parseFloat(hS.input.value);
        xS.out.textContent = '$' + fmt(x, 1) + 'k';
        hS.out.textContent = '±$' + fmt(h, 1) + 'k';
        const inside = X.filter(v => Math.abs(v - x) < h).length;
        const fx = inside / (2 * n * h);
        plot.render({ X, h, kernel: 'uniform', xmax, ymax: 0.14, showHist: false, showRug: true, highlightX: x, windowHalf: h });
        out.innerHTML = `Points in the window <code>|x − xᵢ| &lt; h</code>: <strong>${inside}</strong> of ${n}. ` +
          `So <code>f̂(${fmt(x, 1)}) = ${inside} / (2 · ${n} · ${fmt(h, 1)}) = ${fmt(fx, 4)}</code>.`;
      }
      xS.input.addEventListener('input', draw);
      hS.input.addEventListener('input', draw);
      draw();
    });
  })();

  // ============================================================
  // Widget 3 — stacking kernels on a TINY hand-traceable sample
  // ============================================================
  const TOY = [2, 4, 5, 5, 9];      // prices in $k — used across the toy widgets
  const TOY_H = 1.5;                 // pinned toy bandwidth ($k)
  window.KDE_TOY = { X: TOY, h: TOY_H };
  (function initStack() {
    const host = document.getElementById('viz-stack');
    if (!host) return;
    const xmax = 12;
    const plot = makePlot(620, 280);
    host.querySelector('.kde-board').appendChild(plot.svg);
    const controls = host.querySelector('.kde-controls');
    const hS = slider('Bandwidth h', 0.4, 3.5, 0.1, TOY_H, '$k');
    controls.appendChild(hS.wrap);
    const kg = radioBtn('Gaussian', 'gaussian', true);
    const ku = radioBtn('Uniform', 'uniform', false);
    const krow = document.createElement('div'); krow.className = 'kde-radio';
    krow.innerHTML = '<span class="kde-slider-label">Kernel</span>';
    krow.appendChild(kg.wrap); krow.appendChild(ku.wrap);
    controls.appendChild(krow);
    const cComp = checkBtn('Show the 5 kernels', true);
    const crow = document.createElement('div'); crow.className = 'kde-checks'; crow.appendChild(cComp.wrap);
    controls.appendChild(crow);

    let kernel = 'gaussian';
    function draw() {
      const h = parseFloat(hS.input.value);
      hS.out.textContent = fmt(h, 1) + ' $k';
      plot.render({ X: TOY, h, kernel, xmax, ymax: 0.42, showHist: false, showRug: true, components: cComp.input.checked });
    }
    hS.input.addEventListener('input', draw);
    kg.input.addEventListener('change', () => { kernel = 'gaussian'; draw(); });
    ku.input.addEventListener('change', () => { kernel = 'uniform'; draw(); });
    cComp.input.addEventListener('change', draw);
    draw();
  })();

  // ============================================================
  // Widget 4 — bias–variance: three bandwidth regimes
  // ============================================================
  (function initBiasVar() {
    const host = document.getElementById('viz-biasvar');
    if (!host) return;
    fetch('data.json').then(r => r.json()).then(data => {
      const X = data.values, xmax = 40;
      const plot = makePlot(680, 280);
      host.querySelector('.kde-board').appendChild(plot.svg);
      const controls = host.querySelector('.kde-controls');
      const sh = KDE.silverman(X, 'gaussian');
      const presets = [
        { label: 'Undersmoothed', h: sh * 0.35, note: 'Tiny h: the curve chases every data point — high variance, spurious bumps.' },
        { label: "Silverman", h: sh, note: `Silverman's rule (h ≈ ${fmt(sh, 2)} $k): a sensible default balancing the two.` },
        { label: 'Oversmoothed', h: sh * 3.2, note: 'Large h: the curve is a smooth blob — high bias, the two price clusters are erased.' },
      ];
      const note = host.querySelector('.kde-note');
      const btnRow = document.createElement('div'); btnRow.className = 'kde-preset-row';
      let active = 1;
      presets.forEach((p, i) => {
        const b = document.createElement('button'); b.className = 'btn'; b.textContent = p.label;
        b.addEventListener('click', () => { active = i; render(); btnRow.querySelectorAll('button').forEach((x, j) => x.classList.toggle('primary', j === i)); });
        btnRow.appendChild(b);
      });
      controls.appendChild(btnRow);
      function render() {
        const p = presets[active];
        plot.render({ X, h: p.h, kernel: 'gaussian', xmax, ymax: 0.16, showHist: true, showRug: true });
        note.textContent = p.note;
      }
      btnRow.querySelectorAll('button')[active].classList.add('primary');
      render();
    });
  })();

  // ============================================================
  // Inline glossary (contract from CLAUDE.md / lab-01)
  // ============================================================
  const GLOSSARY = {
    ecdf: {
      title: 'ECDF — empirical cumulative distribution function',
      body: '<p>The staircase function <code>F̂(x)</code> that jumps up by <code>1/n</code> at every data point. It reports the sample proportion of observations at or below <code>x</code>. The KDE is (roughly) the <em>slope</em> of this staircase.</p>',
    },
    indicator: {
      title: 'Indicator function 𝕀{·}',
      body: '<p>A function that is <code>1</code> when its condition is true and <code>0</code> otherwise. <code>𝕀{|x − xᵢ| &lt; h}</code> is 1 exactly when point <code>xᵢ</code> falls inside the window of half-width <code>h</code> around <code>x</code>. Summing indicators is just counting.</p>',
    },
    bandwidth: {
      title: 'Bandwidth h',
      body: '<p>The width of the neighbourhood each data point influences — the single knob of a KDE. Small <code>h</code> gives a spiky, high-variance estimate; large <code>h</code> gives a smooth, high-bias one. It plays the same role as bin width in a histogram.</p>',
    },
    kernel: {
      title: 'Kernel k(z)',
      body: '<p>A non-negative function that integrates to 1, centred at 0, placed as a little bump on top of every data point. The <strong>uniform</strong> kernel is a flat box; the <strong>Gaussian</strong> kernel is a bell curve. The KDE is the average of all these bumps.</p>',
    },
    silverman: {
      title: "Silverman's rule-of-thumb",
      body: '<p>A plug-in formula for a reasonable starting bandwidth: <code>h = 1.84 · sd(X) · n^(−1/5)</code> for the uniform kernel (a different constant for the Gaussian). It is not optimal, but it is a convenient, data-driven default you can then tune.</p>',
    },
    iqr: {
      title: 'IQR — interquartile range',
      body: '<p>The spread of the middle half of the data: the 75th percentile minus the 25th. Because it ignores the tails, it is a robust measure of scale — useful in the Gaussian bandwidth rule when a few extreme prices would otherwise inflate the standard deviation.</p>',
    },
    consistent: {
      title: 'Consistent (but biased) estimator',
      body: '<p><strong>Biased</strong>: on average the KDE does not equal the true density, because <code>h</code> is not zero. <strong>Consistent</strong>: as the sample grows, Silverman shrinks <code>h → 0</code>, so the bias vanishes and the estimate converges to the truth. Bias you can live with if it disappears with more data.</p>',
    },
    broadcasting: {
      title: 'Broadcasting (NumPy)',
      body: '<p>A rule that lets arrays of different shapes combine without explicit loops. <code>x_grid[:,None] − X[None,:]</code> subtracts every data point from every grid point, producing a full grid-by-data matrix in one vectorised expression.</p>',
    },
  };

  window.GLOSSARY = GLOSSARY;

})();
