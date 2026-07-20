/* ============================================================
 * Understanding Uncertainty · Class 09 — Monte Carlo lab widgets
 * Each widget lives in its own IIFE. The presentation toggle,
 * TOC tracking, and prev/next nav are owned by lab-base.js.
 *
 * Shared numeric core (MC.*) mirrors sampler.js / sampler.py
 * line-for-line so all three agree on every number. All randomness
 * flows through LabBase.makeLcg(seed) so runs are reproducible.
 * ============================================================ */
(function () {
  'use strict';

  const SVGNS = 'http://www.w3.org/2000/svg';
  const ACCENT = '#b14a2e';
  const INSIDE = '#c15a37';   // orange-red — inside the quarter disc
  const OUTSIDE = '#4a9d6a';  // green — outside
  const TRACE = '#33607f';    // blue — running-average trajectory

  // ---------- Monte Carlo numeric core (mirror of sampler.js) ----------
  const MC = {
    makeRng(seed) { return LabBase.makeLcg(seed); },
    mean(a) { return a.reduce((p, q) => p + q, 0) / a.length; },
    std(a) {
      const m = this.mean(a);
      return Math.sqrt(a.reduce((p, q) => p + (q - m) * (q - m), 0) / a.length);
    },
    resampleMean(X, n, seed) {
      const rng = this.makeRng(seed);
      let total = 0;
      for (let i = 0; i < n; i++) total += X[Math.floor(rng() * X.length)];
      return total / n;
    },
    runningMean(X, n, seed) {
      const rng = this.makeRng(seed);
      const out = [];
      let total = 0;
      for (let k = 1; k <= n; k++) {
        total += X[Math.floor(rng() * X.length)];
        out.push(total / k);
      }
      return out;
    },
    estimatePi(n, seed) {
      const rng = this.makeRng(seed);
      let inside = 0;
      for (let i = 0; i < n; i++) {
        const x = rng(), y = rng();
        if (x * x + y * y < 1) inside++;
      }
      return 4 * inside / n;
    },
    // Point-by-point pi draws (for the scatter widget). Returns the array of
    // {x, y, inside} for the first n draws of a seed.
    piPoints(n, seed) {
      const rng = this.makeRng(seed);
      const out = [];
      for (let i = 0; i < n; i++) {
        const x = rng(), y = rng();
        out.push({ x, y, inside: x * x + y * y < 1 });
      }
      return out;
    },
  };
  window.MC = MC; // exposed for console tinkering

  // ---------- tiny DOM/SVG helpers ----------
  function el(name, attrs, kids) {
    const e = document.createElementNS(SVGNS, name);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (kids) kids.forEach(c => e.appendChild(c));
    return e;
  }
  function fmt(x, d) { return x.toFixed(d == null ? 2 : d); }

  function slider(labelText, min, max, step, val) {
    const wrap = document.createElement('label');
    wrap.className = 'mc-slider';
    const lab = document.createElement('span'); lab.className = 'mc-slider-label'; lab.textContent = labelText;
    const input = document.createElement('input');
    input.type = 'range'; input.min = min; input.max = max; input.step = step; input.value = val;
    const out = document.createElement('span'); out.className = 'mc-slider-out';
    wrap.appendChild(lab); wrap.appendChild(input); wrap.appendChild(out);
    return { wrap, input, out };
  }
  function button(text, primary) {
    const b = document.createElement('button');
    b.className = 'btn' + (primary ? ' primary' : '');
    b.textContent = text;
    return b;
  }
  function radioBtn(text, value, checked, name) {
    const wrap = document.createElement('label'); wrap.className = 'mc-radio-btn';
    const input = document.createElement('input'); input.type = 'radio'; input.name = name;
    input.value = value; input.checked = !!checked;
    const span = document.createElement('span'); span.textContent = text;
    wrap.appendChild(input); wrap.appendChild(span);
    return { wrap, input };
  }

  // ============================================================
  // Widget 1 — the WLLN running-average demo (try-it, real data)
  // ============================================================
  (function initWLLN() {
    const host = document.getElementById('viz-try-it');
    if (!host) return;

    fetch('data.json').then(r => r.json()).then(data => {
      const X = data.values;
      const truth = data.true_mean != null ? data.true_mean : MC.mean(X);
      const sigma = data.std != null ? data.std : MC.std(X);
      const Nmax = 500;
      const W = 680, H = 300, ml = 48, mr = 16, mt = 14, mb = 34;
      const plotW = W - ml - mr, plotH = H - mt - mb;
      const ymin = 0, ymax = 22;

      const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', height: 'auto', style: 'display:block', role: 'img' });
      host.querySelector('.mc-board').appendChild(svg);
      const gStatic = el('g'); svg.appendChild(gStatic);
      const gDyn = el('g'); svg.appendChild(gDyn);

      const x2px = k => ml + (k - 1) / (Nmax - 1) * plotW;
      const clampY = y => Math.max(ymin, Math.min(ymax, y));
      const y2px = y => mt + plotH - (clampY(y) - ymin) / (ymax - ymin) * plotH;

      let seed = 1, rmeans = [], k = 1, playing = false, raf = null;
      function recompute() { rmeans = MC.runningMean(X, Nmax, seed); }

      function drawStatic() {
        gStatic.textContent = '';
        gStatic.appendChild(el('line', { x1: ml, y1: mt + plotH, x2: ml + plotW, y2: mt + plotH, stroke: '#cfc9bd' }));
        gStatic.appendChild(el('line', { x1: ml, y1: mt, x2: ml, y2: mt + plotH, stroke: '#cfc9bd' }));
        for (let v = 0; v <= ymax; v += 4) {
          const py = y2px(v);
          gStatic.appendChild(el('line', { x1: ml - 4, y1: py, x2: ml, y2: py, stroke: '#cfc9bd' }));
          const t = el('text', { x: ml - 7, y: py + 3, 'text-anchor': 'end', fill: '#8a857d', 'font-family': 'var(--sans)', 'font-size': 10 });
          t.textContent = '$' + v + 'k'; gStatic.appendChild(t);
        }
        [1, 100, 200, 300, 400, 500].forEach(kv => {
          const px = x2px(kv);
          gStatic.appendChild(el('line', { x1: px, y1: mt + plotH, x2: px, y2: mt + plotH + 4, stroke: '#cfc9bd' }));
          const t = el('text', { x: px, y: mt + plotH + 16, 'text-anchor': 'middle', fill: '#8a857d', 'font-family': 'var(--sans)', 'font-size': 10 });
          t.textContent = kv; gStatic.appendChild(t);
        });
        const xl = el('text', { x: ml + plotW / 2, y: H - 2, 'text-anchor': 'middle', fill: '#8a857d', 'font-family': 'var(--sans)', 'font-size': 11 });
        xl.textContent = 'number of draws  k'; gStatic.appendChild(xl);

        // ±1 SE ribbon: μ ± σ/√k, drawn as a filled band that narrows
        let dUp = '';
        for (let kk = 1; kk <= Nmax; kk++) dUp += (kk === 1 ? 'M ' : ' L ') + fmt(x2px(kk), 1) + ' ' + fmt(y2px(truth + sigma / Math.sqrt(kk)), 1);
        let dLo = '';
        for (let kk = Nmax; kk >= 1; kk--) dLo += ' L ' + fmt(x2px(kk), 1) + ' ' + fmt(y2px(truth - sigma / Math.sqrt(kk)), 1);
        gStatic.appendChild(el('path', { d: dUp + dLo + ' Z', fill: ACCENT + '18', stroke: 'none' }));

        // true-mean line
        gStatic.appendChild(el('line', { x1: ml, y1: y2px(truth), x2: ml + plotW, y2: y2px(truth), stroke: ACCENT, 'stroke-width': 1.5, 'stroke-dasharray': '5 4' }));
        const tl = el('text', { x: ml + plotW - 2, y: y2px(truth) - 5, 'text-anchor': 'end', fill: ACCENT, 'font-family': 'var(--sans)', 'font-size': 11 });
        tl.textContent = 'μ ≈ $' + fmt(truth, 2) + 'k'; gStatic.appendChild(tl);
      }

      function drawDyn() {
        gDyn.textContent = '';
        let d = '';
        for (let kk = 1; kk <= k; kk++) d += (kk === 1 ? 'M ' : ' L ') + fmt(x2px(kk), 1) + ' ' + fmt(y2px(rmeans[kk - 1]), 1);
        gDyn.appendChild(el('path', { d, fill: 'none', stroke: TRACE, 'stroke-width': 1.8 }));
        gDyn.appendChild(el('circle', { cx: x2px(k), cy: y2px(rmeans[k - 1]), r: 3.5, fill: TRACE }));

        const est = rmeans[k - 1];
        const se = sigma / Math.sqrt(k);
        readout.innerHTML = `After <strong>k = ${k}</strong> draws: running average <span class="mc-big">$${fmt(est, 3)}k</span>` +
          `, off the true mean by <code>${fmt(Math.abs(est - truth), 3)}</code>. ` +
          `Standard error <code>σ/√k = ${fmt(se, 3)}</code> (seed ${seed}).`;
      }

      // ----- controls -----
      const controls = host.querySelector('.mc-controls');
      const readout = host.querySelector('.mc-readout');
      const kS = slider('Draws k', 1, Nmax, 1, 1);
      controls.appendChild(kS.wrap);
      const btnRow = document.createElement('div'); btnRow.className = 'mc-btn-row';
      const playBtn = button('Play', true);
      const stepBtn = button('Step');
      const resetBtn = button('Reset');
      const seedBtn = button('Reseed');
      btnRow.appendChild(playBtn); btnRow.appendChild(stepBtn); btnRow.appendChild(resetBtn); btnRow.appendChild(seedBtn);
      controls.appendChild(btnRow);

      function setK(nk) { k = Math.max(1, Math.min(Nmax, nk)); kS.input.value = k; kS.out.textContent = k; drawDyn(); }
      function stopPlay() { playing = false; playBtn.textContent = 'Play'; if (raf) cancelAnimationFrame(raf); raf = null; }
      function tick() {
        if (!playing) return;
        setK(k + Math.max(1, Math.round(Nmax / 240)));
        if (k >= Nmax) { stopPlay(); return; }
        raf = requestAnimationFrame(tick);
      }

      kS.input.addEventListener('input', () => { stopPlay(); setK(parseInt(kS.input.value, 10)); });
      playBtn.addEventListener('click', () => {
        if (playing) { stopPlay(); return; }
        if (k >= Nmax) setK(1);
        playing = true; playBtn.textContent = 'Pause'; raf = requestAnimationFrame(tick);
      });
      stepBtn.addEventListener('click', () => { stopPlay(); setK(k + 1); });
      resetBtn.addEventListener('click', () => { stopPlay(); setK(1); });
      seedBtn.addEventListener('click', () => { stopPlay(); seed = (Math.floor(Math.random() * 1e9) + 1) >>> 0; recompute(); drawDyn(); });

      wireDownloads(host, data);
      recompute();
      drawStatic();
      setK(1);
    }).catch(err => { host.innerHTML = '<p style="color:#b14a2e">Could not load data.json — open this page over http (e.g. python3 -m http.server), not via file://.</p>'; console.error(err); });
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
  // Widget 2 — Monte Carlo π (darts in the unit square)
  // ============================================================
  (function initPi() {
    const host = document.getElementById('viz-pi');
    if (!host) return;
    const Nmax = 3000;
    const S = 300, ml = 12, mt = 12, W = S + ml + 12, H = S + mt + 12;

    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', height: 'auto', style: 'display:block;max-width:360px;margin:0 auto', role: 'img' });
    host.querySelector('.mc-board').appendChild(svg);
    const gFrame = el('g'); svg.appendChild(gFrame);
    const gPts = el('g'); svg.appendChild(gPts);

    const ux = x => ml + x * S;              // data x in [0,1] -> px
    const uy = y => mt + (1 - y) * S;        // data y in [0,1] -> px (flip)

    // square frame + shaded quarter disc + arc
    gFrame.appendChild(el('rect', { x: ml, y: mt, width: S, height: S, fill: '#fff', stroke: '#cfc9bd' }));
    const arc = `M ${ux(0)} ${uy(1)} A ${S} ${S} 0 0 1 ${ux(1)} ${uy(0)} L ${ux(0)} ${uy(0)} Z`;
    gFrame.appendChild(el('path', { d: arc, fill: INSIDE + '14', stroke: INSIDE, 'stroke-width': 1.4 }));

    let seed = 1, pts = [], n = 300;
    function recompute() { pts = MC.piPoints(Nmax, seed); }

    const readout = host.querySelector('.mc-readout');
    function draw() {
      gPts.textContent = '';
      let inside = 0;
      for (let i = 0; i < n; i++) {
        const p = pts[i];
        if (p.inside) inside++;
        gPts.appendChild(el('circle', { cx: fmt(ux(p.x), 1), cy: fmt(uy(p.y), 1), r: 2.1, fill: p.inside ? INSIDE : OUTSIDE, opacity: 0.72 }));
      }
      const est = 4 * inside / n;
      readout.innerHTML = `<span class="mc-big">π̂ = ${fmt(est, 4)}</span> &nbsp; from ${inside} inside / ${n} darts ` +
        `(4 × ${fmt(inside / n, 4)}). Off true π by <code>${fmt(Math.abs(est - Math.PI), 4)}</code> (seed ${seed}).`;
    }

    const controls = host.querySelector('.mc-controls');
    const nS = slider('Darts n', 10, Nmax, 10, n);
    controls.appendChild(nS.wrap);
    const btnRow = document.createElement('div'); btnRow.className = 'mc-btn-row';
    const playBtn = button('Play', true);
    const resetBtn = button('Reset');
    const seedBtn = button('Reseed');
    btnRow.appendChild(playBtn); btnRow.appendChild(resetBtn); btnRow.appendChild(seedBtn);
    controls.appendChild(btnRow);

    let playing = false, raf = null;
    function setN(nn) { n = Math.max(10, Math.min(Nmax, nn)); nS.input.value = n; nS.out.textContent = n; draw(); }
    function stopPlay() { playing = false; playBtn.textContent = 'Play'; if (raf) cancelAnimationFrame(raf); raf = null; }
    function tick() {
      if (!playing) return;
      setN(n + Math.max(10, Math.round(Nmax / 200)));
      if (n >= Nmax) { stopPlay(); return; }
      raf = requestAnimationFrame(tick);
    }
    nS.input.addEventListener('input', () => { stopPlay(); setN(parseInt(nS.input.value, 10)); });
    playBtn.addEventListener('click', () => {
      if (playing) { stopPlay(); return; }
      if (n >= Nmax) setN(10);
      playing = true; playBtn.textContent = 'Pause'; raf = requestAnimationFrame(tick);
    });
    resetBtn.addEventListener('click', () => { stopPlay(); setN(10); });
    seedBtn.addEventListener('click', () => { stopPlay(); seed = (Math.floor(Math.random() * 1e9) + 1) >>> 0; recompute(); draw(); });

    recompute();
    setN(300);
  })();

  // ============================================================
  // Widget 3 — error vs n on log–log axes (the 1/√n rule)
  // ============================================================
  (function initRate() {
    const host = document.getElementById('viz-rate');
    if (!host) return;

    fetch('data.json').then(r => r.json()).then(data => {
      const X = data.values;
      const meanTruth = data.true_mean != null ? data.true_mean : MC.mean(X);
      const SEEDS = 150;
      // log-spaced n from 10 to 10000 (averaged over many seeds so the
      // 1/√n trend shows cleanly through Monte Carlo noise)
      const ns = [];
      for (let i = 0; i <= 25; i++) ns.push(Math.round(Math.pow(10, 1 + 3 * i / 25)));

      function curve(kind) {
        return ns.map(n => {
          let s = 0;
          for (let seed = 1; seed <= SEEDS; seed++) {
            const est = kind === 'mean' ? MC.resampleMean(X, n, seed) : MC.estimatePi(n, seed);
            s += Math.abs(est - (kind === 'mean' ? meanTruth : Math.PI));
          }
          return { n, err: Math.max(1e-6, s / SEEDS) };
        });
      }
      const curves = { mean: curve('mean'), pi: curve('pi') };

      const W = 680, H = 320, ml = 56, mr = 16, mt = 16, mb = 40;
      const plotW = W - ml - mr, plotH = H - mt - mb;
      const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', height: 'auto', style: 'display:block', role: 'img' });
      host.querySelector('.mc-board').appendChild(svg);
      const g = el('g'); svg.appendChild(g);

      const xlo = 1, xhi = 4; // log10 n domain (10 .. 1e4)
      const x2px = ln => ml + (ln - xlo) / (xhi - xlo) * plotW;

      const readout = host.querySelector('.mc-readout');

      function lsSlope(pts) {
        // least-squares slope of log10(err) on log10(n)
        const xs = pts.map(p => Math.log10(p.n)), yy = pts.map(p => Math.log10(p.err));
        const mx = MC.mean(xs), my = MC.mean(yy);
        let num = 0, den = 0;
        for (let i = 0; i < xs.length; i++) { num += (xs[i] - mx) * (yy[i] - my); den += (xs[i] - mx) * (xs[i] - mx); }
        return num / den;
      }

      function render(kind) {
        g.textContent = '';
        const pts = curves[kind];
        // y domain from data + guide, padded
        const guideC = median(pts.map(p => p.err * Math.sqrt(p.n)));
        const allY = pts.map(p => p.err).concat(pts.map(p => guideC / Math.sqrt(p.n)));
        const ylo = Math.floor(Math.log10(Math.min.apply(null, allY)));
        const yhi = Math.ceil(Math.log10(Math.max.apply(null, allY)));
        const y2px = ly => mt + plotH - (ly - ylo) / (yhi - ylo) * plotH;

        // axes
        g.appendChild(el('line', { x1: ml, y1: mt + plotH, x2: ml + plotW, y2: mt + plotH, stroke: '#cfc9bd' }));
        g.appendChild(el('line', { x1: ml, y1: mt, x2: ml, y2: mt + plotH, stroke: '#cfc9bd' }));
        for (let e = xlo; e <= xhi; e++) {
          const px = x2px(e);
          g.appendChild(el('line', { x1: px, y1: mt + plotH, x2: px, y2: mt + plotH + 4, stroke: '#cfc9bd' }));
          const t = el('text', { x: px, y: mt + plotH + 16, 'text-anchor': 'middle', fill: '#8a857d', 'font-family': 'var(--sans)', 'font-size': 10 });
          t.textContent = '10' + sup(e); g.appendChild(t);
        }
        for (let e = ylo; e <= yhi; e++) {
          const py = y2px(e);
          g.appendChild(el('line', { x1: ml - 4, y1: py, x2: ml, y2: py, stroke: '#cfc9bd' }));
          const t = el('text', { x: ml - 7, y: py + 3, 'text-anchor': 'end', fill: '#8a857d', 'font-family': 'var(--sans)', 'font-size': 10 });
          t.textContent = '10' + sup(e); g.appendChild(t);
        }
        const xl = el('text', { x: ml + plotW / 2, y: H - 4, 'text-anchor': 'middle', fill: '#8a857d', 'font-family': 'var(--sans)', 'font-size': 11 });
        xl.textContent = 'number of draws  n'; g.appendChild(xl);
        const yl = el('text', { x: 14, y: mt + plotH / 2, 'text-anchor': 'middle', fill: '#8a857d', 'font-family': 'var(--sans)', 'font-size': 11, transform: `rotate(-90 14 ${mt + plotH / 2})` });
        yl.textContent = 'absolute error'; g.appendChild(yl);

        // guide line C/√n  (slope -1/2)
        let dg = '';
        pts.forEach((p, i) => { dg += (i === 0 ? 'M ' : ' L ') + fmt(x2px(Math.log10(p.n)), 1) + ' ' + fmt(y2px(Math.log10(guideC / Math.sqrt(p.n))), 1); });
        g.appendChild(el('path', { d: dg, fill: 'none', stroke: '#8a857d', 'stroke-width': 1.4, 'stroke-dasharray': '5 4' }));

        // measured error curve
        let d = '';
        pts.forEach((p, i) => { d += (i === 0 ? 'M ' : ' L ') + fmt(x2px(Math.log10(p.n)), 1) + ' ' + fmt(y2px(Math.log10(p.err)), 1); });
        g.appendChild(el('path', { d, fill: 'none', stroke: ACCENT, 'stroke-width': 2 }));
        pts.forEach(p => g.appendChild(el('circle', { cx: fmt(x2px(Math.log10(p.n)), 1), cy: fmt(y2px(Math.log10(p.err)), 1), r: 2.6, fill: ACCENT })));

        const slope = lsSlope(pts);
        readout.innerHTML = `<strong>${kind === 'mean' ? 'Car-price mean' : 'π estimate'}</strong>: ` +
          `measured slope <span class="mc-big">${fmt(slope, 3)}</span> (theory: −0.5). ` +
          `The dashed line is a pure <code>C/√n</code> reference — the two run parallel, which is the whole claim.`;
      }

      // estimator toggle
      const controls = host.querySelector('.mc-controls');
      const row = document.createElement('div'); row.className = 'mc-radio';
      row.innerHTML = '<span class="mc-slider-label">Estimator</span>';
      const rMean = radioBtn('Car-price mean', 'mean', true, 'mc-rate');
      const rPi = radioBtn('π estimate', 'pi', false, 'mc-rate');
      row.appendChild(rMean.wrap); row.appendChild(rPi.wrap);
      controls.appendChild(row);
      rMean.input.addEventListener('change', () => render('mean'));
      rPi.input.addEventListener('change', () => render('pi'));

      render('mean');
    });

    function median(a) {
      const s = a.slice().sort((p, q) => p - q);
      const m = Math.floor(s.length / 2);
      return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
    }
    function sup(e) {
      const map = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
      return String(e).split('').map(c => map[c] || c).join('');
    }
  })();

  // ============================================================
  // Inline glossary (contract from CLAUDE.md / lab-01, verbatim wiring)
  // ============================================================
  const GLOSSARY = {
    'monte-carlo': {
      title: 'Monte Carlo method',
      body: '<p>A way to compute a quantity by drawing random numbers and averaging a simple rule applied to each. Named after the casino, because it turns a hard calculation into repeated games of chance. It estimates averages, integrals, probabilities, and areas — anything expressible as an expected value.</p>',
    },
    'wlln': {
      title: 'Weak law of large numbers (WLLN)',
      body: '<p>The theorem that the sample mean of iid draws converges <em>in probability</em> to the expected value: for any fixed tolerance, the chance the average is that far from the truth goes to zero as the sample grows. "Weak" refers to this mode of convergence, and it is what makes Monte Carlo work.</p>',
    },
    'sample-mean': {
      title: 'Sample mean X̄ₙ',
      body: '<p>The ordinary average of your <code>n</code> observed draws, <code>(x₁ + … + xₙ)/n</code>. It is itself a random quantity — a different sample gives a different value — but it is centred on the true mean and its spread shrinks as <code>n</code> grows.</p>',
    },
    'expected-value': {
      title: 'Expected value E[X]',
      body: '<p>The long-run average of a random variable: the number the sample mean settles on if you could draw forever. For the 92 car prices treated as a population, <code>E[X]</code> is simply their exact average, about <code>$8.59k</code>.</p>',
    },
    'iid': {
      title: 'iid — independent and identically distributed',
      body: '<p>Each draw comes from the same distribution (identically distributed) and no draw influences any other (independent). It is the assumption behind the clean formula <code>Var(X̄ₙ) = σ²/n</code>; without independence the variance would not divide by <code>n</code> so neatly.</p>',
    },
    'standard-error': {
      title: 'Standard error',
      body: '<p>The standard deviation of an <em>estimate</em>, as opposed to of the raw data. For a sample mean it is <code>σ/√n</code>: it measures how much the average would jump around if you redrew the sample, and it shrinks like <code>1/√n</code>.</p>',
    },
    'conv-rate': {
      title: 'Convergence rate (1/√n)',
      body: '<p>How fast the error falls as you add draws. Monte Carlo error scales like <code>1/√n</code>, so a straight line of slope <code>−1/2</code> on log–log axes. To gain one decimal digit of accuracy you need 100× the draws.</p>',
    },
    'rng-seed': {
      title: 'RNG seed',
      body: '<p>The starting value of a pseudo-random number generator. Fixing the seed makes the "random" stream reproducible: the same seed replays the same draws, so a result can be checked and a bug can be reproduced. All three artifacts here share one seeded generator.</p>',
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
