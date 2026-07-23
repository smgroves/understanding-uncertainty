/* ============================================================
 * Understanding Uncertainty · Class 06 — CDF + inverse transform
 * Each widget lives in its own IIFE. The presentation toggle,
 * TOC tracking, and prev/next nav are owned by lab-base.js.
 *
 * Shared numeric core (CDF.*) mirrors sampler.js / sampler.py
 * line-for-line so all three agree on every number.
 * ============================================================ */
(function () {
  'use strict';

  const SVGNS = 'http://www.w3.org/2000/svg';
  const ACCENT = '#b14a2e';
  const GREY = '#8a857d';

  // ---------- CDF numeric core (mirror of sampler.js) ----------
  const CDF = {
    ecdfAt(x, X) {
      let c = 0;
      for (let i = 0; i < X.length; i++) if (X[i] <= x) c++;
      return c / X.length;
    },
    sortAsc(X) { return X.slice().sort((a, b) => a - b); },
    quantileSorted(u, sorted) {
      const n = sorted.length;
      let k = Math.ceil(n * u);        // 1-indexed rank
      if (k < 1) k = 1;
      if (k > n) k = n;
      return sorted[k - 1];
    },
    mean(X) { return X.reduce((a, b) => a + b, 0) / X.length; },
    std(X) {
      const m = this.mean(X);
      return Math.sqrt(X.reduce((a, b) => a + (b - m) * (b - m), 0) / X.length);
    },
    // Normal CDF via an erf approximation — used only for the smooth
    // reference overlay, never for the empirical math.
    erf(x) {
      const s = x < 0 ? -1 : 1; x = Math.abs(x);
      const t = 1 / (1 + 0.3275911 * x);
      const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t
        - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
      return s * y;
    },
    normCdf(x, m, sd) { return 0.5 * (1 + this.erf((x - m) / (sd * Math.SQRT2))); },
  };
  window.CDF = CDF; // exposed for console tinkering

  // ---------- tiny DOM/SVG helpers ----------
  function el(name, attrs, kids) {
    const e = document.createElementNS(SVGNS, name);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (kids) kids.forEach(c => e.appendChild(c));
    return e;
  }
  function fmt(x, d) { return x.toFixed(d == null ? 2 : d); }
  function txt(x, y, s, extra) {
    const t = el('text', Object.assign({ x, y, fill: GREY,
      'font-family': 'var(--sans)', 'font-size': 10 }, extra || {}));
    t.textContent = s;
    return t;
  }

  // ============================================================
  // A reusable ECDF staircase plot. Returns { svg, render(opts) }.
  //   opts: { X, xmin, xmax, showRug, showNormal,
  //           cdfX:number|null,  // draw the x -> F_hat(x) mapping
  //           invU:number|null } // draw the u -> F_hat^{-1}(u) mapping
  // ============================================================
  function makeEcdfPlot(width, height) {
    const ml = 52, mr = 16, mt = 14, mb = 34;
    const svg = el('svg', {
      viewBox: `0 0 ${width} ${height}`, width: '100%', height: 'auto',
      style: 'display:block', role: 'img',
    });
    const gGrid = el('g'); svg.appendChild(gGrid);
    const gRef = el('g'); svg.appendChild(gRef);
    const gStair = el('g'); svg.appendChild(gStair);
    const gRug = el('g'); svg.appendChild(gRug);
    const gMark = el('g'); svg.appendChild(gMark);
    const gAxis = el('g'); svg.appendChild(gAxis);

    function render(o) {
      [gGrid, gRef, gStair, gRug, gMark, gAxis].forEach(g => { g.textContent = ''; });
      const X = o.X, n = X.length, sorted = CDF.sortAsc(X);
      const xmin = o.xmin, xmax = o.xmax;
      const plotW = width - ml - mr, plotH = height - mt - mb;
      const x2px = x => ml + (x - xmin) / (xmax - xmin) * plotW;
      const y2px = p => mt + plotH - p * plotH;
      const y0 = mt + plotH;

      // axes
      gAxis.appendChild(el('line', { x1: ml, y1: y0, x2: ml + plotW, y2: y0, stroke: '#cfc9bd' }));
      gAxis.appendChild(el('line', { x1: ml, y1: mt, x2: ml, y2: y0, stroke: '#cfc9bd' }));
      const nxt = 6;
      for (let i = 0; i <= nxt; i++) {
        const xv = xmin + (xmax - xmin) * i / nxt, px = x2px(xv);
        gAxis.appendChild(el('line', { x1: px, y1: y0, x2: px, y2: y0 + 4, stroke: '#cfc9bd' }));
        gAxis.appendChild(txt(px, y0 + 16, Math.round(xv), { 'text-anchor': 'middle' }));
      }
      gAxis.appendChild(txt((ml + plotW) / 2, y0 + 30, 'age at diagnosis (years)',
        { 'text-anchor': 'middle', 'font-size': 10.5 }));
      // y ticks 0..1 with faint gridlines
      [0, 0.25, 0.5, 0.75, 1].forEach(p => {
        gGrid.appendChild(el('line', { x1: ml, y1: y2px(p), x2: ml + plotW, y2: y2px(p),
          stroke: '#e6e1d6', 'stroke-dasharray': p === 0 || p === 1 ? '0' : '2 4' }));
        gAxis.appendChild(txt(ml - 8, y2px(p) + 3, p.toFixed(2), { 'text-anchor': 'end' }));
      });
      const yl = txt(14, mt + plotH / 2, 'F̂(x) = P(X ≤ x)',
        { 'text-anchor': 'middle', transform: `rotate(-90 14 ${mt + plotH / 2})` });
      gAxis.appendChild(yl);

      // smooth Normal(mean, sd) reference CDF (dashed grey)
      if (o.showNormal) {
        const m = CDF.mean(X), sd = CDF.std(X);
        let d = '';
        const N = 180;
        for (let i = 0; i <= N; i++) {
          const x = xmin + (xmax - xmin) * i / N;
          d += (i === 0 ? 'M ' : ' L ') + fmt(x2px(x), 1) + ' ' + fmt(y2px(CDF.normCdf(x, m, sd)), 1);
        }
        gRef.appendChild(el('path', { d, fill: 'none', stroke: GREY, 'stroke-width': 1.4, 'stroke-dasharray': '5 4', opacity: 0.85 }));
      }

      // the ECDF staircase (right-continuous step function)
      let d = `M ${fmt(x2px(xmin), 1)} ${fmt(y2px(0), 1)}`;
      let prev = 0;
      for (let i = 0; i < n; i++) {
        const px = x2px(sorted[i]);
        d += ` L ${fmt(px, 1)} ${fmt(y2px(prev), 1)}`;      // horizontal to jump
        prev = (i + 1) / n;
        d += ` L ${fmt(px, 1)} ${fmt(y2px(prev), 1)}`;      // vertical jump by 1/n
      }
      d += ` L ${fmt(x2px(xmax), 1)} ${fmt(y2px(1), 1)}`;
      gStair.appendChild(el('path', { d, fill: 'none', stroke: ACCENT, 'stroke-width': 2 }));

      // rug of the data points
      if (o.showRug) {
        for (let i = 0; i < n; i++) {
          gRug.appendChild(el('line', { x1: x2px(X[i]), y1: y0, x2: x2px(X[i]), y2: y0 - 7,
            stroke: ACCENT, 'stroke-width': 1, opacity: 0.4 }));
        }
      }

      // x -> F_hat(x) mapping (widget 1)
      if (o.cdfX != null) {
        const x = o.cdfX, p = CDF.ecdfAt(x, X);
        gMark.appendChild(el('line', { x1: x2px(x), y1: y0, x2: x2px(x), y2: y2px(p),
          stroke: ACCENT, 'stroke-width': 1.4, 'stroke-dasharray': '4 3' }));
        gMark.appendChild(el('line', { x1: ml, y1: y2px(p), x2: x2px(x), y2: y2px(p),
          stroke: ACCENT, 'stroke-width': 1.4, 'stroke-dasharray': '4 3' }));
        gMark.appendChild(el('circle', { cx: x2px(x), cy: y2px(p), r: 4.5, fill: ACCENT }));
        gMark.appendChild(el('circle', { cx: ml, cy: y2px(p), r: 3, fill: ACCENT }));
      }

      // u -> F_hat^{-1}(u) mapping (widgets 3 & 4) — read the staircase backwards
      if (o.invU != null) {
        const u = o.invU, x = CDF.quantileSorted(u, sorted);
        gMark.appendChild(el('line', { x1: ml, y1: y2px(u), x2: x2px(x), y2: y2px(u),
          stroke: '#2f7a4d', 'stroke-width': 1.6, 'stroke-dasharray': '4 3' }));
        gMark.appendChild(el('line', { x1: x2px(x), y1: y2px(u), x2: x2px(x), y2: y0,
          stroke: '#2f7a4d', 'stroke-width': 1.6, 'stroke-dasharray': '4 3' }));
        gMark.appendChild(el('circle', { cx: ml, cy: y2px(u), r: 3, fill: '#2f7a4d' }));
        gMark.appendChild(el('circle', { cx: x2px(x), cy: y2px(u), r: 4.5, fill: '#2f7a4d' }));
        gMark.appendChild(el('circle', { cx: x2px(x), cy: y0, r: 3.2, fill: '#2f7a4d' }));
      }
    }
    return { svg, render };
  }

  // Small labelled slider builder → returns { wrap, input, out }
  function slider(labelText, min, max, step, val) {
    const wrap = document.createElement('label');
    wrap.className = 'cdf-slider';
    const lab = document.createElement('span'); lab.className = 'cdf-slider-label'; lab.textContent = labelText;
    const input = document.createElement('input');
    input.type = 'range'; input.min = min; input.max = max; input.step = step; input.value = val;
    const out = document.createElement('span'); out.className = 'cdf-slider-out';
    wrap.appendChild(lab); wrap.appendChild(input); wrap.appendChild(out);
    return { wrap, input, out };
  }
  function checkBtn(text, checked) {
    const wrap = document.createElement('label'); wrap.className = 'cdf-check-btn';
    const input = document.createElement('input'); input.type = 'checkbox'; input.checked = !!checked;
    const span = document.createElement('span'); span.textContent = text;
    wrap.appendChild(input); wrap.appendChild(span);
    return { wrap, input };
  }
  function button(text, cls) {
    const b = document.createElement('button'); b.className = 'btn' + (cls ? ' ' + cls : '');
    b.textContent = text; return b;
  }

  const XMIN = 32, XMAX = 90; // age axis, hugs the data range (33.8 – 88.3)

  // ============================================================
  // Widget 1 — the ECDF builder (try-it demo)
  // ============================================================
  (function initTryIt() {
    const host = document.getElementById('viz-try-it');
    if (!host) return;
    fetch('data.json').then(r => r.json()).then(data => {
      const X = data.values, n = X.length;
      const plot = makeEcdfPlot(680, 300);
      host.querySelector('.cdf-board').appendChild(plot.svg);
      const controls = host.querySelector('.cdf-controls');
      const xS = slider('Query age x', XMIN, XMAX, 0.5, 60);
      controls.appendChild(xS.wrap);
      const opts = document.createElement('div'); opts.className = 'cdf-checks';
      const cRug = checkBtn('Rug (data)', true);
      const cNorm = checkBtn('Overlay Normal CDF', false);
      opts.appendChild(cRug.wrap); opts.appendChild(cNorm.wrap);
      controls.appendChild(opts);
      const out = host.querySelector('.cdf-readout');

      function draw() {
        const x = parseFloat(xS.input.value);
        xS.out.textContent = fmt(x, 1) + ' yr';
        const k = X.filter(v => v <= x).length, p = k / n;
        plot.render({ X, xmin: XMIN, xmax: XMAX, showRug: cRug.input.checked,
          showNormal: cNorm.input.checked, cdfX: x });
        out.innerHTML = `Of <strong>n = ${n}</strong> patients, <strong>${k}</strong> were diagnosed at age ` +
          `<code>≤ ${fmt(x, 1)}</code>, so <code>F̂(${fmt(x, 1)}) = ${k}/${n} = <strong>${fmt(p, 3)}</strong></code>. ` +
          `Reading the staircase at any x returns a probability in [0, 1].`;
      }
      xS.input.addEventListener('input', draw);
      cRug.input.addEventListener('change', draw);
      cNorm.input.addEventListener('change', draw);
      wireDownloads(host, data);
      draw();
    }).catch(err => {
      host.innerHTML = '<p style="color:#b14a2e">Could not load data.json — open this page over http (e.g. <code>python3 -m http.server</code>), not via file://.</p>';
      console.error(err);
    });
  })();

  function wireDownloads(host, data) {
    const row = host.querySelector('.chat-downloads');
    if (!row) return;
    row.querySelectorAll('[data-dl]').forEach(b => {
      b.addEventListener('click', e => {
        e.preventDefault();
        const which = b.getAttribute('data-dl');
        if (which === 'data') LabBase.downloadBlob('data.json', JSON.stringify(data), 'application/json');
        else if (which === 'js') fetch('sampler.js').then(r => r.text()).then(t => LabBase.downloadBlob('sampler.js', t, 'text/javascript'));
        else if (which === 'py') fetch('sampler.py').then(r => r.text()).then(t => LabBase.downloadBlob('sampler.py', t, 'text/x-python'));
      });
    });
  }

  // ============================================================
  // Widget 2 — F̂ approaches F as the sample grows (convergence)
  // ============================================================
  (function initConverge() {
    const host = document.getElementById('viz-converge');
    if (!host) return;
    fetch('data.json').then(r => r.json()).then(data => {
      const full = data.values, m0 = CDF.mean(full), sd0 = CDF.std(full);
      const plot = makeEcdfPlot(680, 280);
      host.querySelector('.cdf-board').appendChild(plot.svg);
      const controls = host.querySelector('.cdf-controls');
      const mS = slider('Sample size m', 5, full.length, 1, 12);
      controls.appendChild(mS.wrap);
      const out = host.querySelector('.cdf-readout');
      // Draw the reference from the FULL sample so it stays fixed as m grows.
      function draw() {
        const m = parseInt(mS.input.value, 10);
        mS.out.textContent = m + ' pts';
        const Xm = full.slice(0, m);
        // render staircase of the subset, but keep the fixed Normal reference
        plot.render({ X: Xm, xmin: XMIN, xmax: XMAX, showRug: true, showNormal: true });
        out.innerHTML = `The staircase now has <strong>m = ${m}</strong> steps, each of height <code>1/${m} = ${fmt(1 / m, 3)}</code>. ` +
          `The dashed grey curve is a fixed <code>Normal(${fmt(m0, 1)}, ${fmt(sd0, 1)})</code> reference. ` +
          `Slide m up: the empirical staircase hugs the smooth curve ever more tightly.`;
      }
      mS.input.addEventListener('input', draw);
      draw();
    });
  })();

  // ============================================================
  // Widget 3 — THE STAR: inverse-transform mapper (drag u)
  // ============================================================
  (function initInverse() {
    const host = document.getElementById('viz-inverse');
    if (!host) return;
    fetch('data.json').then(r => r.json()).then(data => {
      const X = data.values, sorted = CDF.sortAsc(X);
      const plot = makeEcdfPlot(680, 300);
      host.querySelector('.cdf-board').appendChild(plot.svg);
      const controls = host.querySelector('.cdf-controls');
      const uS = slider('Uniform draw u', 0, 1, 0.01, 0.5);
      controls.appendChild(uS.wrap);
      const btnRow = document.createElement('div'); btnRow.className = 'cdf-btn-row';
      const rnd = button('Draw a random u', 'primary');
      btnRow.appendChild(rnd);
      controls.appendChild(btnRow);
      const out = host.querySelector('.cdf-readout');

      function draw() {
        const u = parseFloat(uS.input.value);
        uS.out.textContent = fmt(u, 2);
        const x = CDF.quantileSorted(u, sorted);
        plot.render({ X, xmin: XMIN, xmax: XMAX, showRug: true, invU: u });
        out.innerHTML = `Start at height <strong>u = ${fmt(u, 2)}</strong> on the y-axis. Move right to the staircase, ` +
          `then drop straight down: <code>x = F̂⁻¹(${fmt(u, 2)}) = <strong>${fmt(x, 2)}</strong></code> years. ` +
          `That mapped x is one inverse-transform sample.`;
      }
      uS.input.addEventListener('input', draw);
      rnd.addEventListener('click', () => { uS.input.value = fmt(Math.random(), 2); draw(); });
      draw();
    });
  })();

  // ============================================================
  // Widget 4 — sampling by inverting: histogram match (2 panels)
  // ============================================================
  (function initSample() {
    const host = document.getElementById('viz-sample');
    if (!host) return;
    fetch('data.json').then(r => r.json()).then(data => {
      const X = data.values, n = X.length, sorted = CDF.sortAsc(X);
      const W = 680, H = 340, ml = 52, mr = 16, mt = 14, mb = 34;
      const gap = 26;
      const topH = 150, botTop = mt + topH + gap, botH = H - botTop - mb;
      const plotW = W - ml - mr;
      const x2px = x => ml + (x - XMIN) / (XMAX - XMIN) * plotW;
      const yTop = p => mt + topH - p * topH;               // prob in [0,1]
      // histogram binning shared by data + samples
      const BINS = 24, bw = (XMAX - XMIN) / BINS;
      const dataCounts = new Array(BINS).fill(0);
      X.forEach(v => { const b = Math.min(BINS - 1, Math.max(0, Math.floor((v - XMIN) / bw))); dataCounts[b]++; });
      const dataDens = dataCounts.map(c => c / (n * bw));
      const densMax = Math.max.apply(null, dataDens) * 1.25;
      const yBot = d => botTop + botH - (d / densMax) * botH;

      const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', height: 'auto', style: 'display:block', role: 'img' });
      host.querySelector('.cdf-board').appendChild(svg);
      const gStatic = el('g'); svg.appendChild(gStatic);   // axes + data outline + staircase
      const gDyn = el('g'); svg.appendChild(gDyn);         // sampled bars + last ray

      // ---- static layer (drawn once) ----
      // top: ECDF staircase + axis
      gStatic.appendChild(el('line', { x1: ml, y1: mt + topH, x2: ml + plotW, y2: mt + topH, stroke: '#cfc9bd' }));
      gStatic.appendChild(el('line', { x1: ml, y1: mt, x2: ml, y2: mt + topH, stroke: '#cfc9bd' }));
      [0, 0.5, 1].forEach(p => gStatic.appendChild(txt(ml - 8, yTop(p) + 3, p.toFixed(1), { 'text-anchor': 'end' })));
      gStatic.appendChild(txt(14, mt + topH / 2, 'F̂(x)', { 'text-anchor': 'middle', transform: `rotate(-90 14 ${mt + topH / 2})` }));
      let d = `M ${fmt(x2px(XMIN), 1)} ${fmt(yTop(0), 1)}`; let prev = 0;
      for (let i = 0; i < n; i++) { const px = x2px(sorted[i]); d += ` L ${fmt(px, 1)} ${fmt(yTop(prev), 1)}`; prev = (i + 1) / n; d += ` L ${fmt(px, 1)} ${fmt(yTop(prev), 1)}`; }
      d += ` L ${fmt(x2px(XMAX), 1)} ${fmt(yTop(1), 1)}`;
      gStatic.appendChild(el('path', { d, fill: 'none', stroke: ACCENT, 'stroke-width': 1.8 }));
      // bottom: axis + faint data-histogram outline
      gStatic.appendChild(el('line', { x1: ml, y1: botTop + botH, x2: ml + plotW, y2: botTop + botH, stroke: '#cfc9bd' }));
      gStatic.appendChild(el('line', { x1: ml, y1: botTop, x2: ml, y2: botTop + botH, stroke: '#cfc9bd' }));
      for (let i = 0; i <= 6; i++) {
        const xv = XMIN + (XMAX - XMIN) * i / 6, px = x2px(xv);
        gStatic.appendChild(el('line', { x1: px, y1: botTop + botH, x2: px, y2: botTop + botH + 4, stroke: '#cfc9bd' }));
        gStatic.appendChild(txt(px, botTop + botH + 16, Math.round(xv), { 'text-anchor': 'middle' }));
      }
      gStatic.appendChild(txt((ml + plotW) / 2, botTop + botH + 30, 'age at diagnosis (years)', { 'text-anchor': 'middle', 'font-size': 10.5 }));
      gStatic.appendChild(txt(14, botTop + botH / 2, 'density', { 'text-anchor': 'middle', transform: `rotate(-90 14 ${botTop + botH / 2})` }));
      // data outline as a stepped path
      let od = '', prevY = yBot(0);
      for (let b = 0; b < BINS; b++) {
        const x0 = x2px(XMIN + b * bw), x1 = x2px(XMIN + (b + 1) * bw), yy = yBot(dataDens[b]);
        od += (b === 0 ? `M ${fmt(x0, 1)} ${fmt(yBot(0), 1)}` : ` L ${fmt(x0, 1)} ${fmt(prevY, 1)}`);
        od += ` L ${fmt(x0, 1)} ${fmt(yy, 1)} L ${fmt(x1, 1)} ${fmt(yy, 1)}`;
        prevY = yy;
      }
      gStatic.appendChild(el('path', { d: od, fill: 'none', stroke: GREY, 'stroke-width': 1.3, 'stroke-dasharray': '4 3', opacity: 0.8 }));
      gStatic.appendChild(txt(ml + plotW - 4, botTop + 12, 'dashed = original data', { 'text-anchor': 'end', 'font-size': 10, fill: GREY }));

      // ---- dynamic layer ----
      let rand = Math.random, samples = [];
      function renderDyn(lastU) {
        gDyn.textContent = '';
        // sampled histogram (filled accent)
        const c = new Array(BINS).fill(0);
        samples.forEach(v => { const b = Math.min(BINS - 1, Math.max(0, Math.floor((v - XMIN) / bw))); c[b]++; });
        const tot = samples.length || 1;
        for (let b = 0; b < BINS; b++) {
          const dens = c[b] / (tot * bw);
          if (dens <= 0) continue;
          const x0 = x2px(XMIN + b * bw), x1 = x2px(XMIN + (b + 1) * bw);
          gDyn.appendChild(el('rect', { x: x0 + 0.5, y: yBot(dens), width: Math.max(0, x1 - x0 - 1),
            height: (botTop + botH) - yBot(dens), fill: ACCENT, opacity: 0.32 }));
        }
        // last draw's mapping ray, top panel + drop into the histogram
        if (lastU != null) {
          const x = CDF.quantileSorted(lastU, sorted);
          gDyn.appendChild(el('line', { x1: ml, y1: yTop(lastU), x2: x2px(x), y2: yTop(lastU), stroke: '#2f7a4d', 'stroke-width': 1.5 }));
          gDyn.appendChild(el('line', { x1: x2px(x), y1: yTop(lastU), x2: x2px(x), y2: botTop + botH, stroke: '#2f7a4d', 'stroke-width': 1.3, 'stroke-dasharray': '3 3', opacity: 0.7 }));
          gDyn.appendChild(el('circle', { cx: ml, cy: yTop(lastU), r: 3, fill: '#2f7a4d' }));
          gDyn.appendChild(el('circle', { cx: x2px(x), cy: yTop(lastU), r: 4, fill: '#2f7a4d' }));
        }
        tally.textContent = `drawn: ${samples.length}`;
      }

      // controls
      const controls = host.querySelector('.cdf-controls');
      const btnRow = document.createElement('div'); btnRow.className = 'cdf-btn-row';
      const b1 = button('Draw 1', 'primary'), b200 = button('Draw 200'), bReset = button('Reset');
      btnRow.appendChild(b1); btnRow.appendChild(b200); btnRow.appendChild(bReset);
      controls.appendChild(btnRow);
      const tally = document.createElement('span'); tally.className = 'cdf-tally';
      btnRow.appendChild(tally);

      let anim = null;
      function stopAnim() { if (anim) { clearInterval(anim); anim = null; } }
      function drawOne() {
        stopAnim();
        const u = rand(); samples.push(CDF.quantileSorted(u, sorted)); renderDyn(u);
      }
      function drawMany(total) {
        stopAnim();
        let added = 0;
        anim = setInterval(() => {
          let lastU = null;
          for (let i = 0; i < 10 && added < total; i++, added++) { lastU = rand(); samples.push(CDF.quantileSorted(lastU, sorted)); }
          renderDyn(lastU);
          if (added >= total) stopAnim();
        }, 40);
      }
      b1.addEventListener('click', drawOne);
      b200.addEventListener('click', () => drawMany(200));
      bReset.addEventListener('click', () => { stopAnim(); samples = []; renderDyn(null); });
      renderDyn(null);
    });
  })();

  // ============================================================
  // Inline glossary (contract from CLAUDE.md / lab-01)
  // ============================================================
  const GLOSSARY = {
    cdf: {
      title: 'CDF — cumulative distribution function',
      body: '<p>The function <code>F(x) = P(X ≤ x)</code>: the probability a random draw lands at or below <code>x</code>. Every CDF is <em>non-decreasing</em>, starts at 0 far to the left, and rises to 1 far to the right. Its slope is the density.</p>',
    },
    ecdf: {
      title: 'ECDF — empirical cumulative distribution function',
      body: '<p>The sample estimate of the CDF: the staircase <code>F̂(x) = (1/n) Σ 1{xᵢ ≤ x}</code> that jumps up by <code>1/n</code> at every observed value. With no model assumed, it is the most honest picture of the data a CDF can give.</p>',
    },
    quantile: {
      title: 'Quantile',
      body: '<p>The inverse question to the CDF: the <code>u</code>-quantile is the value <code>x</code> below which a fraction <code>u</code> of the distribution sits. The 0.5-quantile is the median. Reading the CDF staircase backwards (height <code>u</code> across, then down) gives the empirical quantile.</p>',
    },
    uniform: {
      title: 'Uniform(0, 1) distribution',
      body: '<p>The "flat" distribution on the interval <code>[0, 1]</code>: every sub-interval of the same width is equally likely, so its own CDF is just the 45° line <code>F(u) = u</code>. It is the raw material every random-number generator produces, and the input to the inverse transform.</p>',
    },
    'inverse-transform': {
      title: 'Inverse probability transform',
      body: '<p>The fact that if <code>U ~ Uniform(0,1)</code> then <code>F⁻¹(U)</code> has distribution <code>F</code>. So to sample from <em>any</em> distribution you know the CDF of, you draw one uniform and read off its quantile. Using the ECDF\'s inverse resamples your data — the bootstrap.</p>',
    },
    monotone: {
      title: 'Monotone (non-decreasing)',
      body: '<p>A function that never goes down as its input increases: <code>x₁ ≤ x₂ ⟹ F(x₁) ≤ F(x₂)</code>. A CDF is always monotone (adding more of the axis can only add probability), which is exactly what makes its inverse well defined.</p>',
    },
    iid: {
      title: 'iid — independent and identically distributed',
      body: '<p>The standard assumption that each observation is an independent draw from the <em>same</em> distribution. It is what licenses treating the ECDF as an estimate of one fixed underlying CDF, and what makes <code>F̂ → F</code> as the sample grows.</p>',
    },
  };

  window.GLOSSARY = GLOSSARY;

})();
