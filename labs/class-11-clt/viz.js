/* ============================================================
 * Understanding Uncertainty · Class 11 — Central Limit Theorem
 * Each widget lives in its own IIFE. The presentation toggle,
 * TOC tracking, and prev/next nav are owned by lab-base.js.
 *
 * Shared numeric core (CLT.*) mirrors sampler.js / sampler.py so
 * the page, the JS sampler, and the Python sampler agree on the
 * same algorithm. All randomness flows through LabBase.makeLcg so
 * every draw is reproducible from a seed.
 * ============================================================ */
(function () {
  'use strict';

  const SVGNS = 'http://www.w3.org/2000/svg';
  const ACCENT = '#b14a2e';
  const NORMAL = '#2f6f9e';   // blue for the theoretical Normal overlay

  // ---------- CLT numeric core (mirror of the samplers) ----------
  const CLT = {
    mean(X) { return X.reduce((a, b) => a + b, 0) / X.length; },
    std(X) {
      const m = this.mean(X);
      return Math.sqrt(X.reduce((a, b) => a + (b - m) * (b - m), 0) / X.length);
    },
    normalPdf(x, mu, sigma) {
      const z = (x - mu) / sigma;
      return Math.exp(-(z * z) / 2) / (sigma * Math.sqrt(2 * Math.PI));
    },
    // Standard normal CDF via the Abramowitz–Stegun 7.1.26 erf approximation
    // (max error ~1.5e-7) — no external math library required.
    normalCdf(z) {
      const sign = z < 0 ? -1 : 1;
      const x = Math.abs(z) / Math.sqrt(2);
      const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741,
            a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
      const t = 1 / (1 + p * x);
      const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
      return 0.5 * (1 + sign * y);
    },
    // one sample mean = average of n draws WITH REPLACEMENT from X
    oneSampleMean(X, n, rand) {
      let s = 0;
      for (let i = 0; i < n; i++) s += X[Math.floor(rand() * X.length)];
      return s / n;
    },
    sampleMeans(X, n, m, seed) {
      const rand = LabBase.makeLcg(seed);
      const out = [];
      for (let j = 0; j < m; j++) out.push(this.oneSampleMean(X, n, rand));
      return out;
    },
  };
  window.CLT = CLT; // exposed for console tinkering

  // ---------- generative populations (all visibly non-normal) ----------
  // Built once from a fixed seed so their shape (and thus mu, sigma) is
  // stable across redraws. "cars" is the real skewed price data.
  const POP_CACHE = {};
  function boxMuller(rand) {
    const u1 = rand() || 1e-12, u2 = rand();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }
  function genPop(name, data) {
    if (name === 'cars') return data.values.slice();
    if (POP_CACHE[name]) return POP_CACHE[name];
    const rand = LabBase.makeLcg(20260701);
    const N = 1600, out = [];
    for (let i = 0; i < N; i++) {
      if (name === 'uniform') {
        out.push(rand() * 20);                       // U(0, 20)
      } else if (name === 'exponential') {
        out.push(-8 * Math.log(1 - (rand() || 1e-12))); // Exp(mean 8)
      } else if (name === 'bimodal') {
        const g = boxMuller(rand);
        out.push(rand() < 0.5 ? 3 + g * 1.2 : 16 + g * 2.0);
      }
    }
    POP_CACHE[name] = out;
    return out;
  }
  // Plot window for each source (kept fixed across n so the reader can
  // watch the sampling distribution tighten inside a stable frame).
  const XRANGE = { cars: [0, 40], uniform: [0, 20], exponential: [0, 45], bimodal: [0, 24] };
  const SRC_LABEL = { cars: 'Car prices (real, right-skewed)', uniform: 'Uniform', exponential: 'Exponential', bimodal: 'Bimodal' };

  // ---------- tiny DOM/SVG helpers ----------
  function el(name, attrs, kids) {
    const e = document.createElementNS(SVGNS, name);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (kids) kids.forEach(c => e.appendChild(c));
    return e;
  }
  function fmt(x, d) { return x.toFixed(d == null ? 2 : d); }

  // A reusable histogram plotter with an optional overlay curve.
  //   render(o): { values, xmin, xmax, nbins, barColor, barStroke,
  //                overlayFn:(x)->density | null, curveColor,
  //                muLine:number|null, ymax:number|null,
  //                xfmt:(v)->string, ylabel }
  function makeHistPlot(width, height) {
    const ml = 44, mr = 12, mt = 12, mb = 30;
    const svg = el('svg', { viewBox: `0 0 ${width} ${height}`, width: '100%', height: 'auto', style: 'display:block', role: 'img' });
    const gAxis = el('g'), gHist = el('g'), gCurve = el('g'), gMark = el('g');
    [gAxis, gHist, gCurve, gMark].forEach(g => svg.appendChild(g));

    function render(o) {
      [gAxis, gHist, gCurve, gMark].forEach(g => { g.textContent = ''; });
      const V = o.values, xmin = o.xmin, xmax = o.xmax;
      const nbins = o.nbins || 30;
      const plotW = width - ml - mr, plotH = height - mt - mb;
      const x2px = x => ml + (x - xmin) / (xmax - xmin) * plotW;

      // histogram (density-normalized so it shares the overlay's y-scale)
      const bw = (xmax - xmin) / nbins;
      const counts = new Array(nbins).fill(0);
      let outside = 0;
      V.forEach(v => {
        const b = Math.floor((v - xmin) / bw);
        if (b < 0 || b >= nbins) { outside++; return; }
        counts[b]++;
      });
      const dens = counts.map(c => c / (V.length * bw));

      // y-scale: fit bars and overlay peak
      let ymax = o.ymax;
      if (ymax == null) {
        ymax = Math.max.apply(null, dens);
        if (o.overlayFn) {
          for (let i = 0; i <= 200; i++) {
            const x = xmin + (xmax - xmin) * i / 200;
            ymax = Math.max(ymax, o.overlayFn(x));
          }
        }
        ymax = ymax * 1.18 || 1;
      }
      const y2px = y => mt + plotH - (y / ymax) * plotH;

      // axes
      gAxis.appendChild(el('line', { x1: ml, y1: mt + plotH, x2: ml + plotW, y2: mt + plotH, stroke: '#cfc9bd' }));
      gAxis.appendChild(el('line', { x1: ml, y1: mt, x2: ml, y2: mt + plotH, stroke: '#cfc9bd' }));
      const nt = 6;
      for (let i = 0; i <= nt; i++) {
        const xv = xmin + (xmax - xmin) * i / nt, px = x2px(xv);
        gAxis.appendChild(el('line', { x1: px, y1: mt + plotH, x2: px, y2: mt + plotH + 4, stroke: '#cfc9bd' }));
        const t = el('text', { x: px, y: mt + plotH + 16, 'text-anchor': 'middle', fill: '#8a857d', 'font-family': 'var(--sans)', 'font-size': 10 });
        t.textContent = (o.xfmt || (v => fmt(v, 0)))(xv);
        gAxis.appendChild(t);
      }
      const yl = el('text', { x: 12, y: mt + plotH / 2, 'text-anchor': 'middle', fill: '#8a857d', 'font-family': 'var(--sans)', 'font-size': 10, transform: `rotate(-90 12 ${mt + plotH / 2})` });
      yl.textContent = o.ylabel || 'density';
      gAxis.appendChild(yl);

      // bars
      dens.forEach((d, b) => {
        if (d <= 0) return;
        const x0 = x2px(xmin + b * bw), x1 = x2px(xmin + (b + 1) * bw);
        gHist.appendChild(el('rect', {
          x: x0 + 0.5, y: y2px(d), width: Math.max(0, x1 - x0 - 1),
          height: (mt + plotH) - y2px(d),
          fill: o.barColor || '#efe9dc', stroke: o.barStroke || '#e0d8c6',
        }));
      });

      // overlay curve (the theoretical Normal)
      if (o.overlayFn) {
        const N = 240; let d = '';
        for (let i = 0; i <= N; i++) {
          const x = xmin + (xmax - xmin) * i / N;
          const y = o.overlayFn(x);
          d += (i === 0 ? 'M ' : ' L ') + fmt(x2px(x), 1) + ' ' + fmt(y2px(y), 1);
        }
        gCurve.appendChild(el('path', { d, fill: 'none', stroke: o.curveColor || NORMAL, 'stroke-width': 2.4 }));
      }

      // vertical line at the population mean
      if (o.muLine != null) {
        const px = x2px(o.muLine);
        gMark.appendChild(el('line', { x1: px, y1: mt, x2: px, y2: mt + plotH, stroke: ACCENT, 'stroke-width': 1.5, 'stroke-dasharray': '4 3' }));
        const t = el('text', { x: px + 4, y: mt + 11, fill: ACCENT, 'font-family': 'var(--sans)', 'font-size': 10 });
        t.textContent = 'μ';
        gMark.appendChild(t);
      }
    }
    return { svg, render };
  }

  // Small labelled slider → { wrap, input, out }
  function slider(labelText, min, max, step, val) {
    const wrap = document.createElement('label'); wrap.className = 'clt-slider';
    const lab = document.createElement('span'); lab.className = 'clt-slider-label'; lab.textContent = labelText;
    const input = document.createElement('input'); input.type = 'range';
    input.min = min; input.max = max; input.step = step; input.value = val;
    const out = document.createElement('span'); out.className = 'clt-slider-out';
    wrap.appendChild(lab); wrap.appendChild(input); wrap.appendChild(out);
    return { wrap, input, out };
  }
  function radioGroup(labelText, options, current) {
    const row = document.createElement('div'); row.className = 'clt-radio';
    row.innerHTML = '<span class="clt-slider-label">' + labelText + '</span>';
    const name = 'clt-r-' + Math.random().toString(36).slice(2, 7);
    const inputs = {};
    options.forEach(([val, text]) => {
      const wrap = document.createElement('label'); wrap.className = 'clt-radio-btn';
      const input = document.createElement('input'); input.type = 'radio'; input.name = name;
      input.value = val; input.checked = (val === current);
      const span = document.createElement('span'); span.textContent = text;
      wrap.appendChild(input); wrap.appendChild(span); row.appendChild(wrap);
      inputs[val] = input;
    });
    return { row, inputs };
  }
  function xfmtFor(source) {
    return source === 'cars' ? (v => '$' + Math.round(v) + 'k') : (v => fmt(v, 0));
  }

  // ============================================================
  // Widget 1 — the CLT simulator (the star)
  // ============================================================
  function initTryIt(data) {
    const host = document.getElementById('viz-try-it');
    if (!host) return;

    // source population strip (fixed shape)
    const srcPlot = makeHistPlot(680, 150);
    const srcBoard = host.querySelector('.clt-source');
    srcBoard.appendChild(srcPlot.svg);

    // sampling distribution of the mean
    const meanPlot = makeHistPlot(680, 260);
    host.querySelector('.clt-board').appendChild(meanPlot.svg);

    const controls = host.querySelector('.clt-controls');
    const src = radioGroup('Population', [
      ['cars', 'Car prices'], ['uniform', 'Uniform'], ['exponential', 'Exponential'], ['bimodal', 'Bimodal'],
    ], 'cars');
    controls.appendChild(src.row);
    const nS = slider('Sample size n', 1, 200, 1, 30);
    controls.appendChild(nS.wrap);
    const mS = slider('# of sample means m', 500, 6000, 500, 2000);
    controls.appendChild(mS.wrap);
    const redraw = document.createElement('button'); redraw.className = 'btn'; redraw.textContent = 'Redraw ↻';
    controls.appendChild(redraw);

    const readout = host.querySelector('.clt-readout');
    let seed = 1;

    function source() { return Object.keys(src.inputs).find(k => src.inputs[k].checked); }

    function draw() {
      const name = source();
      const X = genPop(name, data);
      const mu = CLT.mean(X), sigma = CLT.std(X);
      const [xmin, xmax] = XRANGE[name];
      const n = parseInt(nS.input.value, 10), m = parseInt(mS.input.value, 10);
      nS.out.textContent = 'n = ' + n;
      mS.out.textContent = 'm = ' + m;

      // source population shape (skewed, fixed)
      srcPlot.render({
        values: X, xmin, xmax, nbins: 34,
        barColor: '#f4dccb', barStroke: '#e2bfa8',
        muLine: mu, xfmt: xfmtFor(name), ylabel: 'density',
      });

      // sampling distribution of the mean + Normal(mu, sigma^2/n) overlay
      const se = sigma / Math.sqrt(n);
      const means = CLT.sampleMeans(X, n, m, seed);
      const obsSd = CLT.std(means);
      meanPlot.render({
        values: means, xmin, xmax, nbins: 40,
        barColor: '#cfe0d6', barStroke: '#9ec3ae',
        overlayFn: x => CLT.normalPdf(x, mu, se), curveColor: NORMAL,
        muLine: mu, xfmt: xfmtFor(name), ylabel: 'density of X̄',
      });

      readout.innerHTML =
        `Population <strong>${SRC_LABEL[name]}</strong>: μ = <code>${fmt(mu, 3)}</code>, σ = <code>${fmt(sigma, 3)}</code>. ` +
        `The blue curve is <strong>Normal(μ, σ²/n)</strong>. ` +
        `Standard error σ/√n = <code>${fmt(se, 4)}</code>; observed spread of the ${m} means = <code>${fmt(obsSd, 4)}</code>.`;
    }

    src.row.addEventListener('change', () => { seed = 1; draw(); });
    nS.input.addEventListener('input', draw);
    mS.input.addEventListener('input', draw);
    redraw.addEventListener('click', () => { seed++; draw(); });

    wireDownloads(host, data);
    draw();
  }

  // ============================================================
  // Widget 2 — the standardized view (everything collapses to N(0,1))
  // ============================================================
  function initStandard(data) {
    const host = document.getElementById('viz-standard');
    if (!host) return;
    const plot = makeHistPlot(680, 260);
    host.querySelector('.clt-board').appendChild(plot.svg);
    const controls = host.querySelector('.clt-controls');
    const src = radioGroup('Population', [
      ['cars', 'Car prices'], ['uniform', 'Uniform'], ['exponential', 'Exponential'], ['bimodal', 'Bimodal'],
    ], 'cars');
    controls.appendChild(src.row);
    const nS = slider('Sample size n', 1, 200, 1, 30);
    controls.appendChild(nS.wrap);
    const redraw = document.createElement('button'); redraw.className = 'btn'; redraw.textContent = 'Redraw ↻';
    controls.appendChild(redraw);
    const readout = host.querySelector('.clt-readout');
    let seed = 1;

    function source() { return Object.keys(src.inputs).find(k => src.inputs[k].checked); }
    function draw() {
      const name = source();
      const X = genPop(name, data);
      const mu = CLT.mean(X), sigma = CLT.std(X);
      const n = parseInt(nS.input.value, 10);
      nS.out.textContent = 'n = ' + n;
      const se = sigma / Math.sqrt(n);
      const means = CLT.sampleMeans(X, n, 3000, seed);
      const z = means.map(mm => (mm - mu) / se); // standardize
      plot.render({
        values: z, xmin: -4, xmax: 4, nbins: 40,
        barColor: '#cfe0d6', barStroke: '#9ec3ae',
        overlayFn: x => CLT.normalPdf(x, 0, 1), curveColor: NORMAL,
        muLine: 0, xfmt: v => fmt(v, 0), ylabel: 'density of Z',
      });
      readout.innerHTML =
        `Standardized statistic <code>Z = (X̄ − μ)/(σ/√n)</code> for the <strong>${SRC_LABEL[name]}</strong> population. ` +
        `The blue curve is the fixed <strong>standard normal N(0,1)</strong> — the same curve for every n and every population. ` +
        `At n = 1 the histogram still shows the population's skew; grow n and it snaps onto the bell.`;
    }
    src.row.addEventListener('change', () => { seed = 1; draw(); });
    nS.input.addEventListener('input', draw);
    redraw.addEventListener('click', () => { seed++; draw(); });
    draw();
  }

  // ============================================================
  // Widget 3 — readout table: theoretical sigma/sqrt(n) vs observed sd
  // ============================================================
  function initTable(data) {
    const host = document.getElementById('viz-table');
    if (!host) return;
    const X = genPop('cars', data);
    const sigma = CLT.std(X);
    const rows = [1, 2, 5, 10, 30, 100, 200];
    const m = 4000, seed = 42;
    let html = '<table class="clt-table"><thead><tr>' +
      '<th>n</th><th>√n</th><th>σ/√n (theory)</th><th>observed sd of X̄</th><th>ratio</th>' +
      '</tr></thead><tbody>';
    rows.forEach(n => {
      const se = sigma / Math.sqrt(n);
      const obs = CLT.std(CLT.sampleMeans(X, n, m, seed));
      html += `<tr><td>${n}</td><td>${fmt(Math.sqrt(n), 3)}</td>` +
        `<td>${fmt(se, 4)}</td><td>${fmt(obs, 4)}</td><td>${fmt(obs / se, 3)}</td></tr>`;
    });
    html += '</tbody></table>';
    host.querySelector('.clt-board').innerHTML = html;
    const cap = host.querySelector('.clt-readout');
    if (cap) cap.innerHTML = `Car-price population, σ = <code>${fmt(sigma, 3)}</code>, m = ${m} sample means per row (seed ${seed}). ` +
      `The last column hugs 1.0: the observed spread of the sample means tracks σ/√n across two orders of magnitude in n.`;
  }

  // ============================================================
  // Widget 4 — testing a hypothesized mean (closed-form p-value)
  // ============================================================
  function initPValue(data) {
    const host = document.getElementById('viz-ptest');
    if (!host) return;

    const X = genPop('cars', data);
    const n = 30;
    // One fixed sample (seed 7), so only mu0 moves as the reader drags it.
    const rand = LabBase.makeLcg(7);
    const sample = [];
    for (let i = 0; i < n; i++) sample.push(X[Math.floor(rand() * X.length)]);
    const xbar = CLT.mean(sample);
    const sd = Math.sqrt(sample.reduce((a, b) => a + (b - xbar) * (b - xbar), 0) / (n - 1));
    const se = sd / Math.sqrt(n);

    const width = 680, height = 240;
    const ml = 44, mr = 12, mt = 16, mb = 30;
    const plotW = width - ml - mr, plotH = height - mt - mb;
    const svg = el('svg', { viewBox: `0 0 ${width} ${height}`, width: '100%', height: 'auto', style: 'display:block', role: 'img' });
    host.querySelector('.clt-board').appendChild(svg);
    const gTail = el('g'), gCurve = el('g'), gAxis = el('g'), gMark = el('g');
    [gTail, gCurve, gAxis, gMark].forEach(g => svg.appendChild(g));

    const zmin = -4, zmax = 4;
    const z2px = z => ml + (z - zmin) / (zmax - zmin) * plotW;
    const ymax = CLT.normalPdf(0, 0, 1) * 1.15;
    const y2px = y => mt + plotH - (y / ymax) * plotH;

    function draw() {
      [gTail, gCurve, gAxis, gMark].forEach(g => { g.textContent = ''; });
      const mu0 = parseFloat(mu0S.input.value);
      mu0S.out.textContent = fmt(mu0, 2);
      const z = (xbar - mu0) / se;
      const p = 2 * (1 - CLT.normalCdf(Math.abs(z)));

      // axis
      gAxis.appendChild(el('line', { x1: ml, y1: mt + plotH, x2: ml + plotW, y2: mt + plotH, stroke: '#cfc9bd' }));
      for (let zt = zmin; zt <= zmax; zt++) {
        const px = z2px(zt);
        gAxis.appendChild(el('line', { x1: px, y1: mt + plotH, x2: px, y2: mt + plotH + 4, stroke: '#cfc9bd' }));
        gAxis.appendChild(el('text', { x: px, y: mt + plotH + 16, 'text-anchor': 'middle', fill: '#8a857d', 'font-family': 'var(--sans)', 'font-size': 10 }, [document.createTextNode(zt)]));
      }

      // shaded tails beyond |z| — the p-value's two halves
      const az = Math.min(Math.abs(z), zmax);
      [[zmin, -az], [az, zmax]].forEach(([a, b]) => {
        if (b <= a) return;
        let d = `M ${fmt(z2px(a), 1)} ${fmt(mt + plotH, 1)}`;
        const N = 40;
        for (let i = 0; i <= N; i++) {
          const zz = a + (b - a) * i / N;
          d += ` L ${fmt(z2px(zz), 1)} ${fmt(y2px(CLT.normalPdf(zz, 0, 1)), 1)}`;
        }
        d += ` L ${fmt(z2px(b), 1)} ${fmt(mt + plotH, 1)} Z`;
        gTail.appendChild(el('path', { d, fill: '#fde0d2', stroke: 'none' }));
      });

      // the standard normal curve
      let dCurve = '';
      for (let i = 0; i <= 240; i++) {
        const zz = zmin + (zmax - zmin) * i / 240;
        dCurve += (i === 0 ? 'M ' : ' L ') + fmt(z2px(zz), 1) + ' ' + fmt(y2px(CLT.normalPdf(zz, 0, 1)), 1);
      }
      gCurve.appendChild(el('path', { d: dCurve, fill: 'none', stroke: NORMAL, 'stroke-width': 2.4 }));

      // observed Z marker
      const zpx = z2px(Math.max(zmin, Math.min(zmax, z)));
      gMark.appendChild(el('line', { x1: zpx, y1: mt, x2: zpx, y2: mt + plotH, stroke: ACCENT, 'stroke-width': 2 }));
      gMark.appendChild(el('text', { x: zpx, y: mt - 4, 'text-anchor': 'middle', fill: ACCENT, 'font-family': 'var(--sans)', 'font-size': 11, 'font-weight': 700 }, [document.createTextNode('Z = ' + fmt(z, 2))]));

      const reject = p < 0.05;
      const verdict = reject
        ? `<strong style="color:${ACCENT}">Reject</strong> H₀: μ = ${fmt(mu0, 2)}`
        : `<strong style="color:${NORMAL}">Fail to reject</strong> H₀: μ = ${fmt(mu0, 2)}`;
      host.querySelector('.clt-readout').innerHTML =
        `Sample of n = 30: X̄ = <strong>${fmt(xbar, 2)}</strong>, SE = <strong>${fmt(se, 3)}</strong>. ` +
        `Z = ${fmt(z, 2)}, p-value = <strong>${fmt(p, 4)}</strong>. ${verdict} at the 5% level.`;
    }

    const controls = host.querySelector('.clt-controls');
    const mu0S = slider('Hypothesized mean μ₀ ($k)', 0, 20, 0.1, 10.5);
    controls.appendChild(mu0S.wrap);
    mu0S.input.addEventListener('input', draw);
    draw();
  }

  // ---------- downloads (same pattern as the KDE lab) ----------
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

  // ---------- boot: one fetch, then all data-driven widgets ----------
  fetch('data.json').then(r => r.json()).then(data => {
    initTryIt(data);
    initStandard(data);
    initTable(data);
    initPValue(data);
  }).catch(err => {
    const t = document.getElementById('viz-try-it');
    if (t) t.innerHTML = '<p style="color:#b14a2e">Could not load data.json — open this page over http (e.g. <code>python3 -m http.server</code>), not via file://.</p>';
    console.error(err);
  });

  // ============================================================
  // Inline glossary (contract from CLAUDE.md / lab-01)
  // ============================================================
  const GLOSSARY = {
    'clt': {
      title: 'Central limit theorem',
      body: '<p>The result that the <em>mean</em> of many independent draws from almost any population becomes Normal as the sample size grows, no matter how non-normal the population is. It is why the bell curve shows up everywhere in statistics even when the raw data is skewed.</p>',
    },
    'sample-mean': {
      title: 'Sample mean X̄',
      body: '<p>The average of the n values in one sample. It is itself a random quantity: draw a new sample and you get a slightly different X̄. The CLT describes how those X̄ values are distributed.</p>',
    },
    'sampling-distribution': {
      title: 'Sampling distribution',
      body: '<p>The distribution of a statistic (here, the sample mean) across many repeated samples. It is not the distribution of the raw data — it is what you get by computing X̄ over and over and histogramming the results.</p>',
    },
    'standard-error': {
      title: 'Standard error',
      body: '<p>The standard deviation of a statistic\'s sampling distribution. For the sample mean it equals σ/√n: bigger samples give a smaller standard error, so the mean is estimated more precisely. It shrinks like 1/√n, not 1/n.</p>',
    },
    'normal': {
      title: 'Normal distribution',
      body: '<p>The symmetric bell curve Normal(μ, σ²), fully described by its mean μ and variance σ². The CLT says the sampling distribution of the mean approaches Normal(μ, σ²/n).</p>',
    },
    'standardize': {
      title: 'Standardize (z-score)',
      body: '<p>Subtract the mean and divide by the standard deviation, turning a quantity into "how many standard deviations from center." Standardizing the sample mean, Z = (X̄ − μ)/(σ/√n), maps every case onto the same standard normal N(0,1).</p>',
    },
    'iid': {
      title: 'iid — independent and identically distributed',
      body: '<p>Each observation is drawn from the same distribution (identically distributed) and does not depend on the others (independent). It is the core assumption the CLT needs to hold.</p>',
    },
    'variance': {
      title: 'Variance σ²',
      body: '<p>The average squared distance of values from their mean; its square root is the standard deviation σ. The CLT requires the population variance to be finite for the standard-error law σ/√n to apply.</p>',
    },
    'p-value': {
      title: 'p-value',
      body: '<p>The probability, assuming the null hypothesis is exactly true, of seeing a test statistic at least as extreme as the one observed. A small p-value means the data would be surprising under the null — it is not the probability that the null hypothesis itself is true.</p>',
    },
  };
  (function initGlossary() {
    const panel = document.getElementById('glossary-panel');
    const content = document.getElementById('glossary-content');
    const closeBtn = document.getElementById('glossary-close');
    if (!panel || !content) return;
    const terms = Array.from(document.querySelectorAll('.gloss[data-gloss]'));
    if (!terms.length) return;
    let activeTerm = null;

    function blockFor(node) {
      let n = node;
      while (n && n !== document.body) {
        if (n.tagName && /^(P|LI|H2|H3|H4|FIGURE|TABLE|BLOCKQUOTE|PRE)$/.test(n.tagName)) {
          if (n.tagName === 'LI') {
            const list = n.closest('ul, ol');
            if (list) return list;
          }
          return n;
        }
        n = n.parentElement;
      }
      return node;
    }
    function show(term) {
      const key = term.getAttribute('data-gloss');
      const g = GLOSSARY[key];
      if (!g) return;
      const block = blockFor(term);
      block.parentNode.insertBefore(panel, block.nextSibling);
      content.innerHTML = '<div class="glossary-panel-title">' + g.title + '</div><div class="glossary-content">' + g.body + '</div>';
      panel.hidden = false;
      terms.forEach(t => t.classList.toggle('active', t === term));
      activeTerm = term;
    }
    function hide() {
      panel.hidden = true;
      terms.forEach(t => t.classList.remove('active'));
      activeTerm = null;
    }
    terms.forEach(term => {
      term.setAttribute('tabindex', '0');
      term.setAttribute('role', 'button');
      term.addEventListener('mouseenter', () => show(term));
      term.addEventListener('click', () => (activeTerm === term ? hide() : show(term)));
      term.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activeTerm === term ? hide() : show(term); }
      });
    });
    if (closeBtn) closeBtn.addEventListener('click', hide);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !panel.hidden) {
        if (e.target.matches && e.target.matches('input, textarea')) return;
        hide();
      }
    });
  })();

})();
