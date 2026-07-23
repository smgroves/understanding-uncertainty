/* ============================================================
 * Understanding Uncertainty · Class 04 — Random Numbers & the Sample Mean
 * Each widget lives in its own IIFE. The presentation toggle, TOC
 * tracking, and prev/next nav are owned by lab-base.js.
 *
 * Shared numeric core (RNGL.*) mirrors sampler.js / sampler.py so the
 * page, the samplers, and the assignment all agree on every number.
 * ============================================================ */
(function () {
  'use strict';

  const SVGNS = 'http://www.w3.org/2000/svg';
  const ACCENT = '#b14a2e';
  const NORMAL = '#2f6f9e';

  const RNGL = {
    mean(X) { return X.reduce((a, b) => a + b, 0) / X.length; },
    mse(X, xhat) { return X.reduce((s, x) => s + (x - xhat) * (x - xhat), 0) / X.length; },
  };
  window.RNGL = RNGL;

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
    const wrap = document.createElement('label'); wrap.className = 'rng-slider';
    const lab = document.createElement('span'); lab.className = 'rng-slider-label'; lab.textContent = labelText;
    const input = document.createElement('input'); input.type = 'range';
    input.min = min; input.max = max; input.step = step; input.value = val;
    const out = document.createElement('span'); out.className = 'rng-slider-out';
    wrap.appendChild(lab); wrap.appendChild(input); wrap.appendChild(out);
    return { wrap, input, out };
  }
  function button(text, primary) {
    const b = document.createElement('button');
    b.className = 'btn' + (primary ? ' primary' : '');
    b.textContent = text;
    return b;
  }
  function checkbox(labelText, checked) {
    const wrap = document.createElement('label'); wrap.className = 'rng-check-btn';
    const input = document.createElement('input'); input.type = 'checkbox'; input.checked = !!checked;
    const span = document.createElement('span'); span.textContent = labelText;
    wrap.appendChild(input); wrap.appendChild(span);
    return { wrap, input };
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
  // Widget 1 — try it: minimize mean squared error
  // ============================================================
  function initMSE(data) {
    const host = document.getElementById('viz-mse');
    if (!host) return;
    const board = host.querySelector('.rng-board');
    const controls = host.querySelector('.rng-controls');
    const readout = host.querySelector('.rng-readout');
    const ages = data.age;
    const trueMean = RNGL.mean(ages);
    const xmin = Math.floor(Math.min.apply(null, ages)) - 2;
    const xmax = Math.ceil(Math.max.apply(null, ages)) + 2;

    const width = 680, height = 240, ml = 46, mr = 16, mt = 16, mb = 30;
    const plotW = width - ml - mr, plotH = height - mt - mb;
    const svg = svgBox(width, height);
    board.appendChild(svg);
    const gCurve = el('g'), gAxis = el('g'), gMark = el('g');
    [gAxis, gCurve, gMark].forEach(g => svg.appendChild(g));

    // pin the y-scale once (doesn't depend on the slider)
    let ymax = 0;
    for (let i = 0; i <= 200; i++) {
      const xv = xmin + (xmax - xmin) * i / 200;
      ymax = Math.max(ymax, RNGL.mse(ages, xv));
    }
    ymax *= 1.08;
    const x2px = x => ml + (x - xmin) / (xmax - xmin) * plotW;
    const y2px = y => mt + plotH - (y / ymax) * plotH;

    // axes (static)
    gAxis.appendChild(el('line', { x1: ml, y1: mt + plotH, x2: ml + plotW, y2: mt + plotH, stroke: '#cfc9bd' }));
    gAxis.appendChild(el('line', { x1: ml, y1: mt, x2: ml, y2: mt + plotH, stroke: '#cfc9bd' }));
    for (let i = 0; i <= 6; i++) {
      const xv = xmin + (xmax - xmin) * i / 6, px = x2px(xv);
      gAxis.appendChild(el('line', { x1: px, y1: mt + plotH, x2: px, y2: mt + plotH + 4, stroke: '#cfc9bd' }));
      gAxis.appendChild(txt(px, mt + plotH + 16, fmt(xv, 0), { 'text-anchor': 'middle' }));
    }
    const yl = txt(12, mt + plotH / 2, 'MSE(x̂)', { 'text-anchor': 'middle' });
    yl.setAttribute('transform', `rotate(-90 12 ${mt + plotH / 2})`);
    gAxis.appendChild(yl);

    // the parabola itself (static)
    let d = '';
    for (let i = 0; i <= 200; i++) {
      const xv = xmin + (xmax - xmin) * i / 200;
      const yv = RNGL.mse(ages, xv);
      d += (i === 0 ? 'M ' : ' L ') + fmt(x2px(xv), 1) + ' ' + fmt(y2px(yv), 1);
    }
    gCurve.appendChild(el('path', { d, fill: 'none', stroke: NORMAL, 'stroke-width': 2.4 }));

    // true minimum marker (static)
    gCurve.appendChild(el('line', {
      x1: x2px(trueMean), y1: mt, x2: x2px(trueMean), y2: mt + plotH,
      stroke: '#cfc9bd', 'stroke-width': 1.4, 'stroke-dasharray': '4 3',
    }));

    const s = slider('Your guess x̂', xmin, xmax, 0.5, 40);
    controls.appendChild(s.wrap);

    function draw() {
      gMark.textContent = '';
      const xhat = parseFloat(s.input.value);
      s.out.textContent = fmt(xhat, 1);
      const yv = RNGL.mse(ages, xhat);
      gMark.appendChild(el('circle', { cx: x2px(xhat), cy: y2px(yv), r: 6, fill: ACCENT }));
      const found = Math.abs(xhat - trueMean) < 0.3;
      readout.innerHTML =
        `x̂ = <strong>${fmt(xhat, 1)}</strong>, MSE(x̂) = <strong>${fmt(yv, 2)}</strong>. ` +
        (found
          ? `<strong style="color:${NORMAL}">That's the minimum</strong> — you found the sample mean, ${fmt(trueMean, 3)}.`
          : `The true minimum sits at ${fmt(trueMean, 1)}; keep sliding to close the gap.`);
    }
    s.input.addEventListener('input', draw);
    draw();
    wireDownloads(host, data);
  }

  // ============================================================
  // Widget 2 — seeds you can trust
  // ============================================================
  function initSeed() {
    const host = document.getElementById('viz-seed');
    if (!host) return;
    const controls = host.querySelector('.rng-controls');
    const readout = host.querySelector('.rng-readout');

    const s = slider('Seed', 1, 999, 1, 42);
    controls.appendChild(s.wrap);
    const drawBtn = button('Draw 8 numbers', true);
    controls.appendChild(drawBtn);

    let lastSeed = null, lastSeq = null;

    function draw() {
      const seed = parseInt(s.input.value, 10);
      const rng = LabBase.makeLcg(seed);
      const seq = Array.from({ length: 8 }, () => rng());
      const seqStr = seq.map(v => fmt(v, 4)).join(', ');
      const repeat = seed === lastSeed;
      readout.innerHTML =
        `Seed <strong>${seed}</strong>: [${seqStr}]` +
        (repeat ? ` — <strong style="color:${NORMAL}">identical</strong> to the last draw with this same seed.` : '.');
      lastSeed = seed; lastSeq = seq;
    }
    drawBtn.addEventListener('click', draw);
    draw();
  }

  // ============================================================
  // Widget 3 — with replacement vs. without: an 8-ball urn
  // ============================================================
  function initUrn() {
    const host = document.getElementById('viz-urn');
    if (!host) return;
    const board = host.querySelector('.rng-board');
    const controls = host.querySelector('.rng-controls');
    const readout = host.querySelector('.rng-readout');

    const URN = ['red', 'red', 'red', 'blue', 'blue', 'blue', 'green', 'green'];
    const chk = checkbox('With replacement', true);
    controls.appendChild(chk.wrap);
    const drawBtn = button('Draw 8 balls', true);
    controls.appendChild(drawBtn);

    let seed = 5;

    function draw() {
      seed++;
      const rng = LabBase.makeLcg(seed);
      const withReplacement = chk.input.checked;
      const drawn = [];
      if (withReplacement) {
        for (let i = 0; i < 8; i++) drawn.push(URN[Math.floor(rng() * URN.length)]);
      } else {
        const pool = URN.slice();
        for (let i = 0; i < 8; i++) {
          const idx = Math.floor(rng() * pool.length);
          drawn.push(pool[idx]);
          pool.splice(idx, 1);
        }
      }
      board.innerHTML = '';
      drawn.forEach((color, i) => {
        const ball = document.createElement('span');
        ball.className = 'rng-ball ' + color;
        ball.textContent = i + 1;
        board.appendChild(ball);
      });
      const counts = { red: 0, blue: 0, green: 0 };
      drawn.forEach(c => counts[c]++);
      readout.innerHTML =
        `${withReplacement ? 'With' : 'Without'} replacement: drew <strong>${counts.red} red, ${counts.blue} blue, ${counts.green} green</strong>` +
        (withReplacement
          ? ' — can (and often does) differ from the urn\'s true composition (3 red, 3 blue, 2 green).'
          : ' — always exactly matches the urn\'s composition (3 red, 3 blue, 2 green), just reordered.');
    }
    drawBtn.addEventListener('click', draw);
    chk.input.addEventListener('change', draw);
    draw();
  }

  // ============================================================
  // Widget 4 — writing it fast: measure two methods live
  // ============================================================
  function initSpeed() {
    const host = document.getElementById('viz-speed');
    if (!host) return;
    const controls = host.querySelector('.rng-controls');
    const readout = host.querySelector('.rng-readout');

    const runBtn = button('Run both methods', true);
    controls.appendChild(runBtn);

    const B = 20000, N = 100;

    function methodLoop() {
      const rng = LabBase.makeLcg(1);
      const results = [];
      for (let b = 0; b < B; b++) {
        const sample = [];
        for (let i = 0; i < N; i++) sample.push(rng());
        results.push(sample.reduce((a, x) => a + x, 0) / sample.length);
      }
      return results;
    }
    function methodFlat() {
      const rng = LabBase.makeLcg(1);
      const results = new Float64Array(B);
      for (let b = 0; b < B; b++) {
        let total = 0;
        for (let i = 0; i < N; i++) total += rng();
        results[b] = total / N;
      }
      return results;
    }

    function run() {
      readout.innerHTML = 'Running…';
      setTimeout(() => {
        const t0 = performance.now();
        const r1 = methodLoop();
        const t1 = performance.now();
        const r2 = methodFlat();
        const t2 = performance.now();
        const loopMs = t1 - t0, flatMs = t2 - t1;
        const ratio = loopMs / flatMs;
        readout.innerHTML =
          `Array-per-sample loop: <strong>${fmt(loopMs, 1)} ms</strong>. Pre-allocated flat loop: <strong>${fmt(flatMs, 1)} ms</strong>. ` +
          `That's <strong>${fmt(ratio, 1)}×</strong> faster on this run, on this machine — both computed the same ${B.toLocaleString()} sample means from the same seeded draws.`;
      });
    }
    runBtn.addEventListener('click', run);
  }

  // ---------- boot: one fetch, then all data-driven widgets ----------
  fetch('data.json').then(r => r.json()).then(data => {
    initMSE(data);
    initSeed();
    initUrn();
    initSpeed();
  }).catch(err => {
    const t = document.getElementById('viz-mse');
    if (t) t.innerHTML = '<p style="color:#b14a2e">Could not load data.json — open this page over http (e.g. <code>python3 -m http.server</code>), not via file://.</p>';
    console.error(err);
  });

  // ============================================================
  // Glossary content (wiring lives in shared/lab-base.js)
  // ============================================================
  window.GLOSSARY = {
    mse: {
      title: 'Mean squared error (MSE)',
      body: '<p>The average of the squared distance between a guess and every data point. Minimizing MSE over a single guess is exactly what singles out the sample mean as the best predictor.</p>',
    },
    'estimator-props': {
      title: 'Unbiased estimator',
      body: '<p>An estimator whose expected value equals the true parameter exactly, with no systematic tendency to run high or low. The sample mean is unbiased for the population mean.</p>',
    },
    lcg: {
      title: 'Linear congruential generator (LCG)',
      body: '<p>A simple, deterministic recipe for pseudorandom numbers: each new state is (multiplier × old state + increment) mod some large number, and the uniform output is that state rescaled to [0, 1). Same seed, same entire sequence, every time.</p>',
    },
  };
})();
