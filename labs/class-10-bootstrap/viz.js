/* ============================================================
 * Understanding Uncertainty · Class 10 — The Bootstrap widgets
 * Each widget lives in its own IIFE. The presentation toggle,
 * TOC tracking, and prev/next nav are owned by lab-base.js.
 *
 * Shared numeric core (BOOT.*) mirrors sampler.js / sampler.py
 * line-for-line so the page, the samplers, and the assignment all
 * agree on every number. Randomness is LabBase.makeLcg(seed), the
 * same seeded generator the samplers use, so runs are reproducible.
 * ============================================================ */
(function () {
  'use strict';

  const SVGNS = 'http://www.w3.org/2000/svg';
  const ACCENT = '#b14a2e';
  const TEAL = '#2f7a4d';

  // ---------- bootstrap numeric core (mirror of sampler.js) ----------
  const BOOT = {
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
    median(X) { return this.quantile(X.slice().sort((a, b) => a - b), 0.5); },
    statFor(X, name) {
      if (name === 'median') return this.median(X);
      return this.mean(X);
    },
    // one bootstrap resample: n draws WITH replacement (returns indices)
    resampleIdx(n, rng) {
      const idx = new Array(n);
      for (let i = 0; i < n; i++) idx[i] = Math.floor(rng() * n);
      return idx;
    },
    statOfIdx(X, idx, name) {
      const v = idx.map(i => X[i]);
      return this.statFor(v, name);
    },
    percentileCI(stats, alpha) {
      const a = alpha == null ? 0.05 : alpha;
      const s = stats.slice().sort((x, y) => x - y);
      return [this.quantile(s, a / 2), this.quantile(s, 1 - a / 2)];
    },
  };
  window.BOOT = BOOT; // exposed for console tinkering

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
    return el('svg', {
      viewBox: `0 0 ${width} ${height}`, width: '100%', height: 'auto',
      style: 'display:block', role: 'img',
    });
  }

  // Draw a horizontal price axis at pixel row `ypx` spanning [xmin,xmax].
  function drawAxis(g, x2px, ypx, xmin, xmax, nticks) {
    g.appendChild(el('line', { x1: x2px(xmin), y1: ypx, x2: x2px(xmax), y2: ypx, stroke: '#cfc9bd', 'stroke-width': 1 }));
    for (let i = 0; i <= nticks; i++) {
      const xv = xmin + (xmax - xmin) * i / nticks;
      const px = x2px(xv);
      g.appendChild(el('line', { x1: px, y1: ypx, x2: px, y2: ypx + 4, stroke: '#cfc9bd' }));
      g.appendChild(txt(px, ypx + 15, '$' + Math.round(xv) + 'k', { 'text-anchor': 'middle' }));
    }
  }

  // Labelled slider → { wrap, input, out }
  function slider(labelText, min, max, step, val) {
    const wrap = document.createElement('label');
    wrap.className = 'bs-slider';
    const lab = document.createElement('span'); lab.className = 'bs-slider-label'; lab.textContent = labelText;
    const input = document.createElement('input');
    input.type = 'range'; input.min = min; input.max = max; input.step = step; input.value = val;
    const out = document.createElement('span'); out.className = 'bs-slider-out';
    wrap.appendChild(lab); wrap.appendChild(input); wrap.appendChild(out);
    return { wrap, input, out };
  }
  function radioBtn(text, value, checked, group) {
    const wrap = document.createElement('label'); wrap.className = 'bs-radio-btn';
    const input = document.createElement('input'); input.type = 'radio'; input.name = group;
    input.value = value; input.checked = !!checked;
    const span = document.createElement('span'); span.textContent = text;
    wrap.appendChild(input); wrap.appendChild(span);
    return { wrap, input };
  }
  function button(text, primary) {
    const b = document.createElement('button');
    b.className = 'btn' + (primary ? ' primary' : '');
    b.textContent = text;
    return b;
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
  // Widget 1 — one resample (the "try it" demo)
  // ============================================================
  (function initResample() {
    const host = document.getElementById('viz-try-it');
    if (!host) return;

    fetch('data.json').then(r => r.json()).then(data => {
      const X = data.values, n = X.length;
      const xmin = 0, xmax = 40;
      const width = 680, height = 300;
      const ml = 44, mr = 16;
      const svg = svgBox(width, height);
      host.querySelector('.bs-board').appendChild(svg);
      const gSample = el('g'); const gResample = el('g'); const gMarks = el('g'); const gAxis = el('g');
      [gSample, gResample, gMarks, gAxis].forEach(g => svg.appendChild(g));

      const x2px = x => ml + (x - xmin) / (xmax - xmin) * (width - ml - mr);
      const sampleBase = 78;      // baseline for the sample rug
      const resampleBase = 236;   // baseline for the resample stacks
      const axisY = 252;
      const obsMean = data.observed_mean;

      let seed = 101;

      function draw(idx) {
        [gSample, gResample, gMarks, gAxis].forEach(g => { g.textContent = ''; });
        drawAxis(gAxis, x2px, axisY, xmin, xmax, 8);

        // ---- sample rug (top lane) ----
        gSample.appendChild(txt(ml, 34, 'Your sample — 92 listings', { 'font-weight': 700, fill: '#4a4742' }));
        X.forEach(v => {
          gSample.appendChild(el('line', {
            x1: x2px(v), y1: sampleBase, x2: x2px(v), y2: sampleBase - 15,
            stroke: ACCENT, 'stroke-width': 1.4, opacity: 0.45,
          }));
        });
        gSample.appendChild(el('line', { x1: x2px(xmin), y1: sampleBase, x2: x2px(xmax), y2: sampleBase, stroke: '#cfc9bd' }));

        // ---- resample (bottom lane): stack dots by multiplicity ----
        gResample.appendChild(txt(ml, 118, 'One resample — 92 draws WITH replacement', { 'font-weight': 700, fill: '#4a4742' }));
        const count = new Array(n).fill(0);
        idx.forEach(i => { count[i]++; });
        let leftOut = 0, maxMult = 0;
        for (let i = 0; i < n; i++) {
          if (count[i] === 0) { leftOut++; continue; }
          if (count[i] > maxMult) maxMult = count[i];
          for (let m = 0; m < count[i]; m++) {
            gResample.appendChild(el('circle', {
              cx: x2px(X[i]), cy: resampleBase - m * 7, r: 2.6,
              fill: count[i] > 1 ? ACCENT : '#d8a48a',
              opacity: count[i] > 1 ? 0.9 : 0.6,
            }));
          }
        }
        // faint markers for the omitted listings, just below the baseline
        for (let i = 0; i < n; i++) {
          if (count[i] === 0) {
            gResample.appendChild(el('line', {
              x1: x2px(X[i]), y1: resampleBase + 3, x2: x2px(X[i]), y2: resampleBase + 9,
              stroke: '#c9c2b4', 'stroke-width': 1,
            }));
          }
        }
        gResample.appendChild(el('line', { x1: x2px(xmin), y1: resampleBase, x2: x2px(xmax), y2: resampleBase, stroke: '#cfc9bd' }));

        // ---- mean lines ----
        const rsMean = BOOT.mean(idx.map(i => X[i]));
        // observed mean: accent dashed, spans both lanes
        gMarks.appendChild(el('line', { x1: x2px(obsMean), y1: 40, x2: x2px(obsMean), y2: axisY, stroke: ACCENT, 'stroke-width': 1.6, 'stroke-dasharray': '5 3' }));
        gMarks.appendChild(txt(x2px(obsMean) + 4, 48, 'observed mean ' + fmt(obsMean, 2), { fill: ACCENT, 'font-weight': 700 }));
        // resample mean: teal dashed
        gMarks.appendChild(el('line', { x1: x2px(rsMean), y1: 124, x2: x2px(rsMean), y2: axisY, stroke: TEAL, 'stroke-width': 1.6, 'stroke-dasharray': '3 3' }));
        gMarks.appendChild(txt(x2px(rsMean) + 4, resampleBase + 22, 'resample mean ' + fmt(rsMean, 2), { fill: TEAL, 'font-weight': 700 }));

        const out = host.querySelector('.bs-readout');
        out.innerHTML =
          `Resample <strong>mean = ${fmt(rsMean, 2)} $k</strong> vs the observed <strong>${fmt(obsMean, 2)} $k</strong>. ` +
          `<strong>${leftOut}</strong> of ${n} listings were left out of this resample, and the most-drawn listing appears <strong>${maxMult}×</strong>. ` +
          `Draw again — the resample mean wanders, and that wander is what the bootstrap measures.`;
      }

      function newResample() {
        const rng = LabBase.makeLcg(seed++);
        draw(BOOT.resampleIdx(n, rng));
      }

      const controls = host.querySelector('.bs-controls');
      const row = document.createElement('div'); row.className = 'bs-btn-row';
      const rsBtn = button('Resample', true);
      rsBtn.addEventListener('click', newResample);
      row.appendChild(rsBtn);
      controls.appendChild(row);

      wireDownloads(host, data);
      newResample();
    }).catch(err => {
      host.innerHTML = '<p style="color:#b14a2e">Could not load data.json — open this page over http (e.g. <code>python3 -m http.server</code>), not via file://.</p>';
      console.error(err);
    });
  })();

  // ============================================================
  // Widget 2 — the bootstrap distribution builder (the STAR)
  // ============================================================
  (function initBootDist() {
    const host = document.getElementById('viz-bootdist');
    if (!host) return;

    fetch('data.json').then(r => r.json()).then(data => {
      const X = data.values, n = X.length;
      const width = 680, height = 300;
      const ml = 46, mr = 16, mt = 16, mb = 30;
      const plotW = width - ml - mr, plotH = height - mt - mb;
      const svg = svgBox(width, height);
      host.querySelector('.bs-board').appendChild(svg);
      const gBars = el('g'); const gCI = el('g'); const gAxis = el('g'); const gMarks = el('g');
      [gCI, gBars, gMarks, gAxis].forEach(g => svg.appendChild(g));

      const SEED = 42;
      const BINS = 36;
      // Pin each statistic's x-range from a full B=2000 bootstrap so the bars
      // don't rescale horizontally as the distribution fills in.
      const ranges = {};
      ['mean', 'median'].forEach(name => {
        const rng = LabBase.makeLcg(SEED);
        let lo = Infinity, hi = -Infinity;
        for (let t = 0; t < 2000; t++) {
          const s = BOOT.statOfIdx(X, BOOT.resampleIdx(n, rng), name);
          if (s < lo) lo = s; if (s > hi) hi = s;
        }
        const pad = (hi - lo) * 0.12 + 1e-9;
        ranges[name] = [lo - pad, hi + pad];
      });

      const state = { name: 'mean', B: 2000, stats: [], rng: LabBase.makeLcg(SEED), playing: false, raf: 0 };

      function reset() {
        state.stats = [];
        state.rng = LabBase.makeLcg(SEED);
        state.playing = false;
        if (state.raf) cancelAnimationFrame(state.raf);
        render();
      }

      function addBatch(k) {
        for (let i = 0; i < k && state.stats.length < state.B; i++) {
          state.stats.push(BOOT.statOfIdx(X, BOOT.resampleIdx(n, state.rng), state.name));
        }
      }

      function tick() {
        if (!state.playing) return;
        addBatch(25);
        render();
        if (state.stats.length >= state.B) { state.playing = false; playBtn.textContent = 'Play'; return; }
        state.raf = requestAnimationFrame(tick);
      }

      function render() {
        [gBars, gCI, gAxis, gMarks].forEach(g => { g.textContent = ''; });
        const [xlo, xhi] = ranges[state.name];
        const x2px = x => ml + (x - xlo) / (xhi - xlo) * plotW;
        const obs = BOOT.statFor(X, state.name);

        // histogram of collected stats
        const bw = (xhi - xlo) / BINS;
        const counts = new Array(BINS).fill(0);
        state.stats.forEach(s => {
          let b = Math.floor((s - xlo) / bw);
          if (b < 0) b = 0; if (b >= BINS) b = BINS - 1;
          counts[b]++;
        });
        const maxCount = Math.max(1, ...counts);
        const y2px = c => mt + plotH - (c / maxCount) * plotH;

        // CI shading (needs a few stats to be meaningful)
        let lo = null, hi = null;
        if (state.stats.length >= 10) {
          [lo, hi] = BOOT.percentileCI(state.stats, 0.05);
          gCI.appendChild(el('rect', {
            x: x2px(lo), y: mt, width: Math.max(0, x2px(hi) - x2px(lo)), height: plotH,
            fill: ACCENT, opacity: 0.10,
          }));
        }

        // bars
        counts.forEach((c, b) => {
          if (c === 0) return;
          const x0 = x2px(xlo + b * bw), x1 = x2px(xlo + (b + 1) * bw);
          gBars.appendChild(el('rect', {
            x: x0 + 0.5, y: y2px(c), width: Math.max(0, x1 - x0 - 1),
            height: (mt + plotH) - y2px(c), fill: '#fde0d2', stroke: '#d8a48a',
          }));
        });

        // axis
        drawAxis(gAxis, x2px, mt + plotH, xlo, xhi, 6);
        const yl = txt(12, mt + plotH / 2, 'count', { 'text-anchor': 'middle' });
        yl.setAttribute('transform', `rotate(-90 12 ${mt + plotH / 2})`);
        gAxis.appendChild(yl);

        // percentile lines + observed marker
        if (lo != null) {
          [[lo, '2.5%'], [hi, '97.5%']].forEach(([q, lab]) => {
            gMarks.appendChild(el('line', { x1: x2px(q), y1: mt, x2: x2px(q), y2: mt + plotH, stroke: ACCENT, 'stroke-width': 1.4, 'stroke-dasharray': '4 3' }));
            gMarks.appendChild(txt(x2px(q), mt - 4, lab, { 'text-anchor': 'middle', fill: ACCENT }));
          });
        }
        gMarks.appendChild(el('line', { x1: x2px(obs), y1: mt, x2: x2px(obs), y2: mt + plotH, stroke: TEAL, 'stroke-width': 2 }));
        gMarks.appendChild(txt(x2px(obs), mt + 10, 'observed', { 'text-anchor': 'middle', fill: TEAL, 'font-weight': 700 }));

        // readout
        const out = host.querySelector('.bs-readout');
        const se = state.stats.length ? BOOT.std(state.stats) : 0;
        let msg = `<strong>${state.stats.length}</strong> of ${state.B} resamples collected. `;
        if (lo != null) {
          msg += `95% CI for the ${state.name}: <strong>(${fmt(lo, 2)}, ${fmt(hi, 2)}) $k</strong>. ` +
                 `bootstrap SE = <strong>${fmt(se, 3)}</strong>. ` +
                 `The observed ${state.name} (${fmt(obs, 2)}) sits inside it.`;
        } else {
          msg += 'Keep going — a confidence interval needs a filled-in distribution.';
        }
        out.innerHTML = msg;
      }

      // ---- controls ----
      const controls = host.querySelector('.bs-controls');
      const stgroup = 'bs-stat-' + Math.random().toString(36).slice(2, 6);
      const rMean = radioBtn('Mean', 'mean', true, stgroup);
      const rMed = radioBtn('Median', 'median', false, stgroup);
      const srow = document.createElement('div'); srow.className = 'bs-radio';
      srow.innerHTML = '<span class="bs-slider-label">Statistic</span>';
      srow.appendChild(rMean.wrap); srow.appendChild(rMed.wrap);
      controls.appendChild(srow);

      const bS = slider('Resamples B', 100, 3000, 50, state.B);
      controls.appendChild(bS.wrap);
      bS.out.textContent = state.B;

      const brow = document.createElement('div'); brow.className = 'bs-btn-row';
      const playBtn = button('Play', true);
      const stepBtn = button('+100');
      const resetBtn = button('Reset');
      brow.appendChild(playBtn); brow.appendChild(stepBtn); brow.appendChild(resetBtn);
      controls.appendChild(brow);

      playBtn.addEventListener('click', () => {
        if (state.stats.length >= state.B) reset();
        state.playing = !state.playing;
        playBtn.textContent = state.playing ? 'Pause' : 'Play';
        if (state.playing) tick();
      });
      stepBtn.addEventListener('click', () => { state.playing = false; playBtn.textContent = 'Play'; addBatch(100); render(); });
      resetBtn.addEventListener('click', () => { reset(); playBtn.textContent = 'Play'; });
      rMean.input.addEventListener('change', () => { state.name = 'mean'; reset(); playBtn.textContent = 'Play'; });
      rMed.input.addEventListener('change', () => { state.name = 'median'; reset(); playBtn.textContent = 'Play'; });
      bS.input.addEventListener('input', () => { state.B = parseInt(bS.input.value, 10); bS.out.textContent = state.B; reset(); playBtn.textContent = 'Play'; });

      render();
    });
  })();

  // ============================================================
  // Widget 3 — standard error and the role of n
  // ============================================================
  (function initSE() {
    const host = document.getElementById('viz-se');
    if (!host) return;

    fetch('data.json').then(r => r.json()).then(data => {
      const Xfull = data.values, nFull = Xfull.length;
      // One fixed shuffle of the full sample; a subsample of size n is its
      // first n entries, so growing n just reveals more of the same order.
      const shuf = Xfull.slice();
      (function shuffle() {
        const rng = LabBase.makeLcg(999);
        for (let i = shuf.length - 1; i > 0; i--) {
          const j = Math.floor(rng() * (i + 1));
          const tmp = shuf[i]; shuf[i] = shuf[j]; shuf[j] = tmp;
        }
      })();

      const width = 680, height = 150;
      const ml = 46, mr = 16;
      const svg = svgBox(width, height);
      host.querySelector('.bs-board').appendChild(svg);
      const g = el('g'); svg.appendChild(g);
      const xmin = 0, xmax = 20;
      const x2px = x => ml + (x - xmin) / (xmax - xmin) * (width - ml - mr);
      const rowCI = 58, rowNorm = 96, axisY = 122;

      function sdSample(X) {
        const m = BOOT.mean(X), k = X.length;
        return Math.sqrt(X.reduce((a, b) => a + (b - m) * (b - m), 0) / (k - 1));
      }

      function draw() {
        g.textContent = '';
        const nSub = parseInt(nS.input.value, 10);
        const B = parseInt(bS.input.value, 10);
        nS.out.textContent = nSub;
        bS.out.textContent = B;
        const X = shuf.slice(0, nSub);

        // bootstrap the mean of the subsample
        const rng = LabBase.makeLcg(42);
        const stats = [];
        for (let t = 0; t < B; t++) stats.push(BOOT.statOfIdx(X, BOOT.resampleIdx(nSub, rng), 'mean'));
        const [lo, hi] = BOOT.percentileCI(stats, 0.05);
        const se = BOOT.std(stats);
        const m = BOOT.mean(X);
        const classicalSE = sdSample(X) / Math.sqrt(nSub);

        drawAxis(g, x2px, axisY, xmin, xmax, 5);

        // bootstrap CI whisker (accent)
        g.appendChild(txt(ml, rowCI - 14, 'bootstrap 95% CI', { 'font-weight': 700, fill: ACCENT }));
        g.appendChild(el('line', { x1: x2px(lo), y1: rowCI, x2: x2px(hi), y2: rowCI, stroke: ACCENT, 'stroke-width': 3 }));
        [lo, hi].forEach(q => g.appendChild(el('line', { x1: x2px(q), y1: rowCI - 6, x2: x2px(q), y2: rowCI + 6, stroke: ACCENT, 'stroke-width': 2 })));
        g.appendChild(el('circle', { cx: x2px(m), cy: rowCI, r: 3.5, fill: ACCENT }));

        // classical normal interval mean ± 1.96·sd/√n (teal, for comparison)
        const clo = m - 1.96 * classicalSE, chi = m + 1.96 * classicalSE;
        g.appendChild(txt(ml, rowNorm - 14, 'mean ± 1.96 · sd/√n', { 'font-weight': 700, fill: TEAL }));
        g.appendChild(el('line', { x1: x2px(clo), y1: rowNorm, x2: x2px(chi), y2: rowNorm, stroke: TEAL, 'stroke-width': 3, opacity: 0.7 }));
        [clo, chi].forEach(q => g.appendChild(el('line', { x1: x2px(q), y1: rowNorm - 6, x2: x2px(q), y2: rowNorm + 6, stroke: TEAL, 'stroke-width': 2, opacity: 0.7 })));

        // numeric readouts
        host.querySelector('.bs-stats').innerHTML =
          statHTML('sample size n', nSub) +
          statHTML('bootstrap SE', fmt(se, 3)) +
          statHTML('sd / √n', fmt(classicalSE, 3)) +
          statHTML('CI width', fmt(hi - lo, 3) + ' $k');
      }
      function statHTML(label, val) {
        return `<div class="bs-stat"><span class="bs-stat-label">${label}</span><span class="bs-stat-val">${val}</span></div>`;
      }

      const controls = host.querySelector('.bs-controls');
      const nS = slider('Sample size n', 10, nFull, 1, nFull);
      const bS = slider('Resamples B', 200, 3000, 100, 2000);
      controls.appendChild(nS.wrap); controls.appendChild(bS.wrap);
      nS.input.addEventListener('input', draw);
      bS.input.addEventListener('input', draw);
      draw();
    });
  })();

  // ============================================================
  // Inline glossary (contract from CLAUDE.md / lab-01) — verbatim
  // ============================================================
  const GLOSSARY = {
    bootstrap: {
      title: 'The bootstrap',
      body: '<p>A resampling method that estimates how much a statistic would vary across repeated samples, using only the single sample you actually have. The trick: treat your sample as if it were the whole population and draw new samples from it. Named for pulling yourself up "by your own bootstraps".</p>',
    },
    'resampling-with-replacement': {
      title: 'Resampling with replacement',
      body: '<p>Drawing <code>n</code> observations from your <code>n</code>-point sample where each draw is independent and can land on any observation — so a single listing may be picked several times and others not at all. That reuse is what makes each resample differ from the original, and from every other resample.</p>',
    },
    'sampling-distribution': {
      title: 'Sampling distribution',
      body: '<p>The distribution of a statistic (say the mean) across all the samples you <em>could</em> have drawn from the population. It tells you how much the statistic wobbles from sample to sample. You normally never see it — you have one sample — which is exactly the gap the bootstrap fills.</p>',
    },
    statistic: {
      title: 'Statistic',
      body: '<p>Any number computed from a sample: the mean, the median, a standard deviation, a correlation. A statistic is itself random, because it depends on which observations happened to land in your sample. The bootstrap asks how random.</p>',
    },
    'standard-error': {
      title: 'Standard error',
      body: '<p>The standard deviation of a statistic\'s sampling distribution — a measure of how much the statistic would jump around across repeated samples. For the mean it is famously <code>sd/√n</code>. The bootstrap estimates it directly as the standard deviation of the bootstrap statistics.</p>',
    },
    percentile: {
      title: 'Percentile',
      body: '<p>The value below which a given fraction of the data falls. The 2.5th percentile is the number that 2.5% of the values sit below; the 97.5th has 97.5% below it. The stretch between them holds the middle 95% of the bootstrap statistics.</p>',
    },
    'confidence-interval': {
      title: 'Confidence interval',
      body: '<p>A range that captures the plausible values of a quantity at some confidence level. The percentile bootstrap 95% CI is simply the 2.5th-to-97.5th percentile range of the bootstrap statistics: an interval read straight off the simulated sampling distribution, no normal-curve assumption required.</p>',
    },
    'point-estimate': {
      title: 'Point estimate',
      body: '<p>A single-number best guess of a quantity — here, the statistic computed on your one real sample (the observed mean or median). A confidence interval wraps a point estimate in a range that reflects how uncertain that single number is.</p>',
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
