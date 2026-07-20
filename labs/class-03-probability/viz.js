/* ============================================================
 * Understanding Uncertainty · Class 03 — Binomial lab widgets
 * Each widget lives in its own IIFE. The presentation toggle,
 * TOC tracking, and prev/next nav are owned by lab-base.js.
 *
 * Shared numeric core (BINOM.*) mirrors sampler.js / sampler.py
 * line-for-line so all three agree on every number.
 * ============================================================ */
(function () {
  'use strict';

  const SVGNS = 'http://www.w3.org/2000/svg';
  const ACCENT = '#b14a2e';
  const POS = '#fde0d2';
  const POS_STROKE = '#d8a48a';

  // ---------- Binomial numeric core (mirror of sampler.js) ----------
  const BINOM = {
    // C(n,k): multiplicative loop, exact in double for the n we use.
    nChooseK(n, k) {
      if (k < 0 || k > n) return 0;
      k = Math.min(k, n - k);
      let c = 1;
      for (let i = 0; i < k; i++) c = c * (n - i) / (i + 1);
      return c;
    },
    // P(X=k) = C(n,k) p^k (1-p)^(n-k), with p=0 / p=1 handled.
    pmf(n, p, k) {
      if (k < 0 || k > n) return 0;
      if (p <= 0) return k === 0 ? 1 : 0;
      if (p >= 1) return k === n ? 1 : 0;
      return this.nChooseK(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
    },
    // Full PMF over k = 0..n as an array.
    pmfArray(n, p) {
      const out = new Array(n + 1);
      for (let k = 0; k <= n; k++) out[k] = this.pmf(n, p, k);
      return out;
    },
    mean(n, p) { return n * p; },
    variance(n, p) { return n * p * (1 - p); },
    sd(n, p) { return Math.sqrt(this.variance(n, p)); },
    mode(n, p) { return Math.floor((n + 1) * p); }, // a most-likely count
  };
  window.BINOM = BINOM; // exposed for console tinkering

  // ---------- tiny DOM/SVG helpers ----------
  function el(name, attrs, kids) {
    const e = document.createElementNS(SVGNS, name);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (kids) kids.forEach(c => e.appendChild(c));
    return e;
  }
  function fmt(x, d) { return x.toFixed(d == null ? 2 : d); }
  function txt(x, y, s, extra) {
    const a = Object.assign({ x, y, 'font-family': 'var(--sans)', 'font-size': 10, fill: '#8a857d' }, extra || {});
    const t = el('text', a); t.textContent = s; return t;
  }

  // Small labelled slider builder → returns { wrap, input, out }
  function slider(labelText, min, max, step, val) {
    const wrap = document.createElement('label');
    wrap.className = 'bn-slider';
    const lab = document.createElement('span'); lab.className = 'bn-slider-label'; lab.textContent = labelText;
    const input = document.createElement('input');
    input.type = 'range'; input.min = min; input.max = max; input.step = step; input.value = val;
    const out = document.createElement('span'); out.className = 'bn-slider-out';
    wrap.appendChild(lab); wrap.appendChild(input); wrap.appendChild(out);
    return { wrap, input, out };
  }
  function button(text, primary) {
    const b = document.createElement('button');
    b.className = 'btn' + (primary ? ' primary' : '');
    b.textContent = text;
    return b;
  }

  // Discrete-k bar chart plot. Returns { svg, render(opts) }.
  //   opts: { n, ymax, exact:[p_k], empirical:[q_k]|null, meanMark:bool,
  //           mean:number, highlightK:int|null }
  function makeBarPlot(width, height) {
    const ml = 44, mr = 12, mt = 14, mb = 30;
    const svg = el('svg', { viewBox: `0 0 ${width} ${height}`, width: '100%', height: 'auto', style: 'display:block', role: 'img' });
    const gAxis = el('g'); const gBars = el('g'); const gExact = el('g'); const gMark = el('g');
    [gAxis, gBars, gExact, gMark].forEach(g => svg.appendChild(g));

    function render(o) {
      [gAxis, gBars, gExact, gMark].forEach(g => { g.textContent = ''; });
      const n = o.n, ymax = o.ymax;
      const plotW = width - ml - mr, plotH = height - mt - mb;
      const slot = plotW / (n + 1);
      const kCenter = k => ml + (k + 0.5) * slot;
      const y2px = y => mt + plotH - (y / ymax) * plotH;

      // axes
      gAxis.appendChild(el('line', { x1: ml, y1: mt + plotH, x2: ml + plotW, y2: mt + plotH, stroke: '#cfc9bd' }));
      gAxis.appendChild(el('line', { x1: ml, y1: mt, x2: ml, y2: mt + plotH, stroke: '#cfc9bd' }));
      // y ticks
      const yticks = 4;
      for (let i = 0; i <= yticks; i++) {
        const yv = ymax * i / yticks, py = y2px(yv);
        gAxis.appendChild(el('line', { x1: ml - 4, y1: py, x2: ml, y2: py, stroke: '#cfc9bd' }));
        gAxis.appendChild(txt(ml - 7, py + 3, fmt(yv, 2), { 'text-anchor': 'end' }));
      }
      gAxis.appendChild(txt(12, mt + plotH / 2, 'P(X=k)', { 'text-anchor': 'middle', transform: `rotate(-90 12 ${mt + plotH / 2})` }));
      // x labels (thin them out when n is large)
      const stepLbl = Math.max(1, Math.round((n + 1) / 12));
      for (let k = 0; k <= n; k += stepLbl) {
        gAxis.appendChild(txt(kCenter(k), mt + plotH + 15, String(k), { 'text-anchor': 'middle' }));
      }
      gAxis.appendChild(txt(ml + plotW, mt + plotH + 15, 'k', { 'text-anchor': 'end', 'font-style': 'italic' }));

      // empirical bars (if any) drawn underneath, as filled boxes
      const bw = Math.max(1, slot * 0.78);
      if (o.empirical) {
        for (let k = 0; k <= n; k++) {
          const q = o.empirical[k]; if (!q) continue;
          gBars.appendChild(el('rect', {
            x: kCenter(k) - bw / 2, y: y2px(q), width: bw, height: (mt + plotH) - y2px(q),
            fill: POS, stroke: POS_STROKE, 'stroke-width': 0.8,
          }));
        }
      } else if (o.exact) {
        // when no empirical overlay, the exact PMF *is* the bars
        for (let k = 0; k <= n; k++) {
          const pk = o.exact[k];
          const highlighted = o.highlightK === k;
          gBars.appendChild(el('rect', {
            x: kCenter(k) - bw / 2, y: y2px(pk), width: bw, height: (mt + plotH) - y2px(pk),
            fill: highlighted ? ACCENT : ACCENT + '33', stroke: ACCENT, 'stroke-width': highlighted ? 1.4 : 0.8,
          }));
        }
      }

      // exact PMF overlay (markers + connecting line) when there is also empirical
      if (o.empirical && o.exact) {
        let d = '';
        for (let k = 0; k <= n; k++) {
          d += (k === 0 ? 'M ' : ' L ') + fmt(kCenter(k), 1) + ' ' + fmt(y2px(o.exact[k]), 1);
        }
        gExact.appendChild(el('path', { d, fill: 'none', stroke: ACCENT, 'stroke-width': 2 }));
        if (n <= 30) for (let k = 0; k <= n; k++) {
          gExact.appendChild(el('circle', { cx: kCenter(k), cy: y2px(o.exact[k]), r: 2.6, fill: ACCENT }));
        }
      }

      // mean marker n*p
      if (o.meanMark) {
        const mx = ml + (o.mean + 0.5) * slot;
        gMark.appendChild(el('line', { x1: mx, y1: mt, x2: mx, y2: mt + plotH, stroke: ACCENT, 'stroke-width': 1.5, 'stroke-dasharray': '4 3' }));
        gMark.appendChild(txt(mx, mt - 3, 'mean n·p = ' + fmt(o.mean, 1), { 'text-anchor': 'middle', fill: ACCENT, 'font-size': 10, 'font-weight': 700 }));
      }
    }
    return { svg, render };
  }

  // ============================================================
  // Widget 1 — Binomial PMF explorer (the "Try it" demo)
  // ============================================================
  (function initExplorer() {
    const host = document.getElementById('viz-try-it');
    if (!host) return;

    fetch('data.json').then(r => r.json()).then(data => {
      const P_HAT = data.p_hat;
      const plot = makeBarPlot(680, 300);
      host.querySelector('.bn-board').appendChild(plot.svg);

      const controls = host.querySelector('.bn-controls');
      const nS = slider('Trials n', 1, 40, 1, 12);
      const pS = slider('P(success) p', 0, 1, 0.01, 0.5);
      controls.appendChild(nS.wrap); controls.appendChild(pS.wrap);

      const presetRow = document.createElement('div'); presetRow.className = 'bn-preset-row';
      const coinBtn = button('Fair coin (p = 0.5)');
      const dataBtn = button('Heart-failure p̂ ≈ ' + fmt(P_HAT, 2));
      presetRow.appendChild(coinBtn); presetRow.appendChild(dataBtn);
      controls.appendChild(presetRow);

      const readout = host.querySelector('.bn-readout');

      function draw() {
        const n = parseInt(nS.input.value, 10), p = parseFloat(pS.input.value);
        nS.out.textContent = String(n);
        pS.out.textContent = fmt(p, 2);
        const exact = BINOM.pmfArray(n, p);
        const ymax = Math.max(0.02, Math.max.apply(null, exact) * 1.18);
        const mean = BINOM.mean(n, p), mode = BINOM.mode(n, p);
        plot.render({ n, ymax, exact, meanMark: true, mean, highlightK: mode });
        readout.innerHTML =
          `Mean <code>E[X] = n·p = ${fmt(mean, 2)}</code> &nbsp;·&nbsp; ` +
          `variance <code>n·p·(1−p) = ${fmt(BINOM.variance(n, p), 2)}</code> &nbsp;·&nbsp; ` +
          `sd <code>${fmt(BINOM.sd(n, p), 2)}</code>. ` +
          `Most likely count <code>k = ${mode}</code> with <code>P(X=${mode}) = ${fmt(BINOM.pmf(n, p, mode), 4)}</code>.`;
      }
      nS.input.addEventListener('input', draw);
      pS.input.addEventListener('input', draw);
      coinBtn.addEventListener('click', () => { pS.input.value = '0.5'; draw(); });
      dataBtn.addEventListener('click', () => { pS.input.value = fmt(P_HAT, 2); nS.input.value = '20'; draw(); });

      wireDownloads(host, data);
      draw();
    }).catch(err => {
      host.innerHTML = '<p style="color:#b14a2e">Could not load data.json — open this page over http (e.g. <code>python3 -m http.server</code>), not with file://.</p>';
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
  // Widget 2 — Sample paths: running proportion converging to p
  // ============================================================
  (function initPaths() {
    const host = document.getElementById('viz-paths');
    if (!host) return;

    const width = 680, height = 300, ml = 44, mr = 12, mt = 14, mb = 30;
    const svg = el('svg', { viewBox: `0 0 ${width} ${height}`, width: '100%', height: 'auto', style: 'display:block' });
    host.querySelector('.bn-board').appendChild(svg);
    const gAxis = el('g'), gP = el('g'), gPaths = el('g');
    [gAxis, gP, gPaths].forEach(g => svg.appendChild(g));

    const controls = host.querySelector('.bn-controls');
    const pS = slider('P(success) p', 0.05, 0.95, 0.01, 0.32);
    const kS = slider('Paths', 1, 8, 1, 4);
    controls.appendChild(pS.wrap); controls.appendChild(kS.wrap);
    const btnRow = document.createElement('div'); btnRow.className = 'bn-preset-row';
    const playBtn = button('Play', true), stepBtn = button('Step'), resetBtn = button('Reset'), seedBtn = button('Reseed');
    [playBtn, stepBtn, resetBtn, seedBtn].forEach(b => btnRow.appendChild(b));
    controls.appendChild(btnRow);
    const readout = host.querySelector('.bn-readout');

    const N = 300;                 // max trials per path
    let seedBase = 1234;
    let paths = [];                // each: array of uniforms u[i]
    let t = 1;                     // trials revealed so far
    let raf = null;

    function buildPaths() {
      const kPaths = parseInt(kS.input.value, 10);
      paths = [];
      for (let j = 0; j < kPaths; j++) {
        const rand = LabBase.makeLcg(seedBase + j * 7919);
        const u = new Array(N);
        for (let i = 0; i < N; i++) u[i] = rand();
        paths.push(u);
      }
    }

    const x2px = i => ml + (i - 1) / (N - 1) * (width - ml - mr);
    const y2px = y => mt + (height - mt - mb) - y * (height - mt - mb);

    function drawAxes(p) {
      gAxis.textContent = ''; gP.textContent = '';
      const plotH = height - mt - mb;
      gAxis.appendChild(el('line', { x1: ml, y1: mt + plotH, x2: width - mr, y2: mt + plotH, stroke: '#cfc9bd' }));
      gAxis.appendChild(el('line', { x1: ml, y1: mt, x2: ml, y2: mt + plotH, stroke: '#cfc9bd' }));
      for (let i = 0; i <= 5; i++) {
        const yv = i / 5, py = y2px(yv);
        gAxis.appendChild(el('line', { x1: ml - 4, y1: py, x2: ml, y2: py, stroke: '#cfc9bd' }));
        gAxis.appendChild(txt(ml - 7, py + 3, fmt(yv, 1), { 'text-anchor': 'end' }));
      }
      gAxis.appendChild(txt(12, mt + plotH / 2, 'proportion', { 'text-anchor': 'middle', transform: `rotate(-90 12 ${mt + plotH / 2})` }));
      [1, 60, 120, 180, 240, 300].forEach(i => {
        gAxis.appendChild(txt(x2px(i), mt + plotH + 15, String(i), { 'text-anchor': 'middle' }));
      });
      gAxis.appendChild(txt(width - mr, mt + plotH + 15, 'trial t', { 'text-anchor': 'end', 'font-style': 'italic' }));
      // dashed line at p
      gP.appendChild(el('line', { x1: ml, y1: y2px(p), x2: width - mr, y2: y2px(p), stroke: ACCENT, 'stroke-width': 1.5, 'stroke-dasharray': '5 4' }));
      gP.appendChild(txt(width - mr, y2px(p) - 4, 'p = ' + fmt(p, 2), { 'text-anchor': 'end', fill: ACCENT, 'font-weight': 700 }));
    }

    function drawPaths(p) {
      gPaths.textContent = '';
      const colors = ['#4a9d6a', '#b14a2e', '#3a6ea5', '#c89b1f', '#7a4fa3', '#2f7a4d', '#a5522f', '#5a5a5a'];
      let finalProps = [];
      paths.forEach((u, j) => {
        let ones = 0, d = '';
        for (let i = 1; i <= t; i++) {
          if (u[i - 1] < p) ones++;
          const prop = ones / i;
          d += (i === 1 ? 'M ' : ' L ') + fmt(x2px(i), 1) + ' ' + fmt(y2px(prop), 1);
        }
        gPaths.appendChild(el('path', { d, fill: 'none', stroke: colors[j % colors.length], 'stroke-width': 1.4, opacity: 0.85 }));
        finalProps.push(ones / t);
      });
      const avg = finalProps.reduce((a, b) => a + b, 0) / finalProps.length;
      readout.innerHTML = `After <strong>t = ${t}</strong> trials, the running proportions are ` +
        `[${finalProps.map(v => fmt(v, 3)).join(', ')}] — spread out early, then squeezing toward <code>p = ${fmt(p, 2)}</code> ` +
        `(their mean is ${fmt(avg, 3)}). That squeeze is the <strong>law of large numbers</strong>.`;
    }

    function draw() {
      const p = parseFloat(pS.input.value);
      pS.out.textContent = fmt(p, 2);
      kS.out.textContent = String(parseInt(kS.input.value, 10));
      drawAxes(p);
      drawPaths(p);
    }
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } playBtn.textContent = 'Play'; playBtn.classList.add('primary'); }
    function play() {
      if (raf) { stop(); return; }
      playBtn.textContent = 'Pause'; playBtn.classList.remove('primary');
      const tick = () => {
        t = Math.min(N, t + 2);
        draw();
        if (t < N) raf = requestAnimationFrame(tick); else stop();
      };
      raf = requestAnimationFrame(tick);
    }

    pS.input.addEventListener('input', draw);
    kS.input.addEventListener('input', () => { buildPaths(); if (t > N) t = N; draw(); });
    playBtn.addEventListener('click', play);
    stepBtn.addEventListener('click', () => { stop(); t = Math.min(N, t + 15); draw(); });
    resetBtn.addEventListener('click', () => { stop(); t = 1; draw(); });
    seedBtn.addEventListener('click', () => { stop(); seedBase = (seedBase * 16807 + 17) % 2147483647; buildPaths(); t = 1; draw(); });

    buildPaths(); draw();
  })();

  // ============================================================
  // Widget 3 — Count histogram converging to the exact PMF
  // ============================================================
  (function initHistogram() {
    const host = document.getElementById('viz-hist');
    if (!host) return;

    const plot = makeBarPlot(680, 300);
    host.querySelector('.bn-board').appendChild(plot.svg);
    const controls = host.querySelector('.bn-controls');
    const nS = slider('Trials n', 2, 40, 1, 20);
    const pS = slider('P(success) p', 0.05, 0.95, 0.01, 0.32);
    controls.appendChild(nS.wrap); controls.appendChild(pS.wrap);
    const btnRow = document.createElement('div'); btnRow.className = 'bn-preset-row';
    const add100 = button('+100 experiments', true), add1000 = button('+1000'), resetBtn = button('Reset'), seedBtn = button('Reseed');
    [add100, add1000, resetBtn, seedBtn].forEach(b => btnRow.appendChild(b));
    controls.appendChild(btnRow);
    const readout = host.querySelector('.bn-readout');

    let rng = LabBase.makeLcg(20260901);
    let counts = [];               // histogram of observed totals, length n+1
    let total = 0;                 // experiments run
    let sumCounts = 0;             // running sum of the totals (for empirical mean)

    function resetCounts() {
      const n = parseInt(nS.input.value, 10);
      counts = new Array(n + 1).fill(0);
      total = 0; sumCounts = 0;
    }
    function runExperiments(m) {
      const n = parseInt(nS.input.value, 10), p = parseFloat(pS.input.value);
      for (let e = 0; e < m; e++) {
        let ones = 0;
        for (let i = 0; i < n; i++) if (rng() < p) ones++;
        counts[ones]++; total++; sumCounts += ones;
      }
      draw();
    }
    function draw() {
      const n = parseInt(nS.input.value, 10), p = parseFloat(pS.input.value);
      nS.out.textContent = String(n);
      pS.out.textContent = fmt(p, 2);
      const exact = BINOM.pmfArray(n, p);
      const empirical = total > 0 ? counts.map(c => c / total) : null;
      const emax = empirical ? Math.max.apply(null, empirical) : 0;
      const ymax = Math.max(0.02, Math.max(Math.max.apply(null, exact), emax) * 1.18);
      plot.render({ n, ymax, exact, empirical });
      if (total > 0) {
        const empMean = sumCounts / total;
        readout.innerHTML = `<strong>${total.toLocaleString()}</strong> experiments so far. ` +
          `Empirical mean count <code>${fmt(empMean, 3)}</code> vs exact <code>n·p = ${fmt(BINOM.mean(n, p), 3)}</code>. ` +
          `The orange line is the exact PMF; the shaded bars are what you actually rolled — they converge as you add experiments.`;
      } else {
        readout.innerHTML = `The orange line is the exact PMF <code>P(X=k)</code>. Click <strong>+100 experiments</strong> to flip <code>n</code> coins, count the 1s, and stack the result onto the histogram.`;
      }
    }
    nS.input.addEventListener('input', () => { resetCounts(); draw(); });
    pS.input.addEventListener('input', () => { resetCounts(); draw(); });
    add100.addEventListener('click', () => runExperiments(100));
    add1000.addEventListener('click', () => runExperiments(1000));
    resetBtn.addEventListener('click', () => { resetCounts(); draw(); });
    seedBtn.addEventListener('click', () => { rng = LabBase.makeLcg((Date.now() % 2000000000) >>> 0); resetCounts(); draw(); });

    resetCounts(); draw();
  })();

  // ============================================================
  // Inline glossary (contract from CLAUDE.md / lab-01)
  // ============================================================
  const GLOSSARY = {
    bernoulli: {
      title: 'Bernoulli trial',
      body: '<p>A single random experiment with exactly two outcomes, labelled <code>1</code> (success) and <code>0</code> (failure), where success happens with probability <code>p</code>. One coin flip, one patient who does or does not survive. The binomial count is a sum of <code>n</code> of these.</p>',
    },
    indicator: {
      title: 'Indicator function 𝕀{·}',
      body: '<p>A function that is <code>1</code> when its condition is true and <code>0</code> otherwise. A Bernoulli trial <em>is</em> an indicator: <code>𝕀{coin lands heads}</code>. Because it is already 0 or 1, summing indicators is just counting the successes.</p>',
    },
    pmf: {
      title: 'PMF — probability mass function',
      body: '<p>For a discrete random variable, the function <code>P(X = k)</code> that assigns a probability to each possible value <code>k</code>. Unlike a density, its values are actual probabilities and they sum to exactly 1 across all <code>k</code>.</p>',
    },
    binomcoef: {
      title: 'Binomial coefficient C(n, k)',
      body: '<p>The number of distinct ways to choose <code>k</code> successes out of <code>n</code> trials, read "n choose k": <code>C(n,k) = n! / (k!(n−k)!)</code>. It counts the orderings that all give the same total, which is why it multiplies the probability of any one such ordering.</p>',
    },
    iid: {
      title: 'iid — independent and identically distributed',
      body: '<p>Each trial has the <em>same</em> success probability <code>p</code> (identically distributed) and no trial\'s outcome affects any other (independent). The binomial formula assumes both; correlated or drifting trials break it.</p>',
    },
    samplepath: {
      title: 'Sample path',
      body: '<p>One realized sequence of outcomes as the process runs, and the curve you get by plotting a running statistic (here, the proportion of successes) against the trial number. Different random seeds give different paths; the law of large numbers says they all converge to <code>p</code>.</p>',
    },
    expectation: {
      title: 'Expected value E[X]',
      body: '<p>The long-run average value of a random variable, weighting each outcome by its probability. For a Binomial(n, p) the expected count is <code>E[X] = n·p</code> — flip 20 coins with <code>p = 0.5</code> and you expect about 10 heads.</p>',
    },
    lln: {
      title: 'Law of large numbers',
      body: '<p>As the number of iid trials grows, the observed proportion of successes converges to the true probability <code>p</code>. It is why the running-proportion paths settle onto the dashed line, and why more data pins down an estimate more tightly.</p>',
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
