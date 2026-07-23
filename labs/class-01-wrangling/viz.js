/* ============================================================
 * Understanding Uncertainty · Class 01 — Wrangling & Robust Statistics
 * Each widget lives in its own IIFE. The presentation toggle,
 * TOC tracking, and prev/next nav are owned by lab-base.js.
 *
 * Shared numeric core (WR.*) mirrors sampler.js / sampler.py so the
 * page, the samplers, and the assignment all agree on every number.
 * ============================================================ */
(function () {
  'use strict';

  const SVGNS = 'http://www.w3.org/2000/svg';
  const ACCENT = '#b14a2e';
  const NORMAL = '#2f6f9e';   // blue for the median / "second statistic" line
  const POS = '#fde0d2';      // mean ± sd band
  const NEUTRAL = '#d5e6dc';  // IQR band

  // ---------- wrangling numeric core (mirror of the samplers) ----------
  const WR = {
    mean(X) { return X.reduce((a, b) => a + b, 0) / X.length; },
    variance(X) {
      const m = this.mean(X);
      return X.reduce((a, b) => a + (b - m) * (b - m), 0) / X.length;
    },
    std(X) { return Math.sqrt(this.variance(X)); },
    median(X) {
      const v = X.slice().sort((a, b) => a - b);
      const n = v.length, mid = Math.floor(n / 2);
      if (mid !== n / 2) return v[mid];
      return (v[mid - 1] + v[mid]) / 2;
    },
    quantile(X, frac) {
      const v = X.slice().sort((a, b) => a - b);
      const n = v.length;
      const idx = Math.max(Math.ceil(n * frac) - 1, 0);
      return v[idx];
    },
    arcsinh(x) { return Math.log(x + Math.sqrt(x * x + 1)); },
  };
  window.WR = WR; // exposed for console tinkering

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
    const wrap = document.createElement('label'); wrap.className = 'wr-slider';
    const lab = document.createElement('span'); lab.className = 'wr-slider-label'; lab.textContent = labelText;
    const input = document.createElement('input'); input.type = 'range';
    input.min = min; input.max = max; input.step = step; input.value = val;
    const out = document.createElement('span'); out.className = 'wr-slider-out';
    wrap.appendChild(lab); wrap.appendChild(input); wrap.appendChild(out);
    return { wrap, input, out };
  }
  function radioGroup(labelText, options, current) {
    const row = document.createElement('div'); row.className = 'wr-radio';
    row.innerHTML = '<span class="wr-slider-label">' + labelText + '</span>';
    const name = 'wr-r-' + Math.random().toString(36).slice(2, 7);
    const inputs = {};
    options.forEach(([val, text]) => {
      const wrap = document.createElement('label'); wrap.className = 'wr-radio-btn';
      const input = document.createElement('input'); input.type = 'radio'; input.name = name;
      input.value = val; input.checked = (val === current);
      const span = document.createElement('span'); span.textContent = text;
      wrap.appendChild(input); wrap.appendChild(span); row.appendChild(wrap);
      inputs[val] = input;
    });
    return { row, inputs, value: () => Object.keys(inputs).find(k => inputs[k].checked) };
  }
  function checkbox(labelText, checked) {
    const wrap = document.createElement('label'); wrap.className = 'wr-check-btn';
    const input = document.createElement('input'); input.type = 'checkbox'; input.checked = !!checked;
    const span = document.createElement('span'); span.textContent = labelText;
    wrap.appendChild(input); wrap.appendChild(span);
    return { wrap, input };
  }
  function statHTML(label, val) {
    return `<div class="wr-stat"><span class="wr-stat-label">${label}</span><span class="wr-stat-val">${val}</span></div>`;
  }

  // A horizontal number-line strip plot: dots for each value, plus optional
  // vertical marker lines (mean/median/quantile) drawn over them.
  function drawStrip(host, width, height, values, opts) {
    opts = opts || {};
    const ml = 16, mr = 16, mt = opts.mt != null ? opts.mt : 34, rowH = height - mt - 30;
    const svg = svgBox(width, height);
    host.innerHTML = '';
    host.appendChild(svg);
    const xmin = opts.xmin != null ? opts.xmin : 0;
    const xmax = opts.xmax != null ? opts.xmax : Math.max.apply(null, values) * 1.05;
    const x2px = x => ml + (x - xmin) / (xmax - xmin) * (width - ml - mr);
    const yMid = mt + rowH / 2;

    // axis
    svg.appendChild(el('line', { x1: ml, y1: mt + rowH + 14, x2: width - mr, y2: mt + rowH + 14, stroke: '#cfc9bd' }));
    const nt = 6;
    for (let i = 0; i <= nt; i++) {
      const xv = xmin + (xmax - xmin) * i / nt, px = x2px(xv);
      svg.appendChild(el('line', { x1: px, y1: mt + rowH + 14, x2: px, y2: mt + rowH + 18, stroke: '#cfc9bd' }));
      svg.appendChild(txt(px, mt + rowH + 30, (opts.xfmt || (v => fmt(v, 0)))(xv), { 'text-anchor': 'middle' }));
    }

    // dots, tiny deterministic jitter by index so overlapping values fan out
    values.forEach((v, i) => {
      if (v < xmin || v > xmax) return;
      const jitter = ((i * 2654435761) % 1000 / 1000 - 0.5) * rowH * 0.7;
      svg.appendChild(el('circle', {
        cx: x2px(v), cy: yMid + jitter, r: 3.2, fill: '#cfc9bd', opacity: 0.75,
      }));
    });

    // marker lines (drawn on top). Labels whose x-pixel positions are close
    // together are staggered onto two rows so they never overlap.
    const markers = (opts.markers || []).slice().sort((a, b) => x2px(a.value) - x2px(b.value));
    let lastPx = -Infinity, row = 0;
    markers.forEach(m => {
      const px = x2px(m.value);
      row = (px - lastPx < 46) ? row + 1 : 0;
      lastPx = px;
      const labelY = mt - 10 - (row % 2) * 13;
      svg.appendChild(el('line', {
        x1: px, y1: mt - 6, x2: px, y2: mt + rowH + 8,
        stroke: m.color, 'stroke-width': 2.2,
        'stroke-dasharray': m.dashed ? '4 3' : 'none',
      }));
      svg.appendChild(txt(px, labelY, m.label, { 'text-anchor': 'middle', fill: m.color, 'font-weight': 700 }));
    });

    // optional shaded band (IQR / mean ± sd)
    if (opts.band) {
      const b = opts.band;
      svg.insertBefore(el('rect', {
        x: x2px(b.lo), y: mt - 4, width: Math.max(0, x2px(b.hi) - x2px(b.lo)), height: rowH + 8,
        fill: b.color, opacity: 0.55,
      }), svg.firstChild.nextSibling);
    }
    return svg;
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
  // Widget 1 — try it: toggle a variable, toggle the truck
  // ============================================================
  function initTryIt(data) {
    const host = document.getElementById('viz-try-it');
    if (!host) return;
    const board = host.querySelector('.wr-board');
    const controls = host.querySelector('.wr-controls');
    const readout = host.querySelector('.wr-readout');

    const truckIdx = data.mileage.indexOf(Math.max.apply(null, data.mileage));

    const varSel = radioGroup('Variable', [['mileage', 'Mileage (mi)'], ['price', 'Price ($)']], 'mileage');
    controls.appendChild(varSel.row);
    const truckChk = checkbox('Include the 1,017,936-mile salvage truck', true);
    controls.appendChild(truckChk.wrap);

    function draw() {
      const varName = varSel.value();
      const full = data[varName];
      const values = truckChk.input.checked ? full.slice() : full.filter((_, i) => i !== truckIdx);
      const mean = WR.mean(values), median = WR.median(values);
      const xfmt = varName === 'price' ? (v => '$' + Math.round(v / 1000) + 'k') : (v => Math.round(v / 1000) + 'k mi');
      drawStrip(board, 680, 150, values, {
        xmin: 0, xmax: Math.max.apply(null, full) * 1.05,
        xfmt,
        markers: [
          { value: mean, color: ACCENT, label: 'mean', dashed: true },
          { value: median, color: NORMAL, label: 'median' },
        ],
      });
      readout.innerHTML =
        `n = ${values.length}. Mean = <strong>${varName === 'price' ? '$' + fmt(mean, 0) : fmt(mean, 0) + ' mi'}</strong>, ` +
        `median = <strong>${varName === 'price' ? '$' + fmt(median, 0) : fmt(median, 0) + ' mi'}</strong>. ` +
        (truckChk.input.checked
          ? 'The truck is included — drag it out with the checkbox to see both statistics react.'
          : 'The truck is excluded from this view.');
    }
    varSel.row.querySelectorAll('input').forEach(i => i.addEventListener('change', draw));
    truckChk.input.addEventListener('change', draw);
    draw();
    wireDownloads(host, data);
  }

  // ============================================================
  // Widget 2 — toy set: {12, 34, 41, 58, slider}
  // ============================================================
  function initToyStat(data) {
    const host = document.getElementById('viz-toystat');
    if (!host) return;
    const board = host.querySelector('.wr-board');
    const controls = host.querySelector('.wr-controls');
    const readout = host.querySelector('.wr-readout');
    const FIXED = [12, 34, 41, 58];

    const s = slider('Fifth car’s mileage (thousands)', 20, 1200, 1, 1018);
    controls.appendChild(s.wrap);

    function draw() {
      const fifth = parseFloat(s.input.value);
      s.out.textContent = fmt(fifth, 0) + 'k mi';
      const X = FIXED.concat([fifth]);
      const mean = WR.mean(X), median = WR.median(X), sd = WR.std(X), v = WR.variance(X);
      drawStrip(board, 680, 150, X, {
        xmin: 0, xmax: 1250,
        xfmt: x => fmt(x, 0),
        markers: [
          { value: mean, color: ACCENT, label: 'mean', dashed: true },
          { value: median, color: NORMAL, label: 'median' },
        ],
      });
      const medianNote = median === 41
        ? 'at or above 41, the fifth value never outranks 41 for the middle position, so the median is pinned no matter how much larger it gets.'
        : 'below 41, the fifth value has displaced 41 from the middle rank, so the median has moved with it.';
      readout.innerHTML =
        `X = {12, 34, 41, 58, ${fmt(fifth, 0)}}. Mean = <strong>${fmt(mean, 1)}</strong>, ` +
        `variance = <strong>${fmt(v, 1)}</strong>, sd = <strong>${fmt(sd, 1)}</strong>, ` +
        `median = <strong>${fmt(median, 1)}</strong> — ${medianNote}`;
    }
    s.input.addEventListener('input', draw);
    draw();
  }

  // ============================================================
  // Widget 3 — quantiles and the IQR, real price data
  // ============================================================
  function initQuantile(data) {
    const host = document.getElementById('viz-quantile');
    if (!host) return;
    const board = host.querySelector('.wr-board');
    const controls = host.querySelector('.wr-controls');
    const readout = host.querySelector('.wr-readout');
    const X = data.price;
    const mean = WR.mean(X), sd = WR.std(X);
    const q25 = WR.quantile(X, 0.25), q75 = WR.quantile(X, 0.75);

    const f = slider('Quantile f', 0, 1, 0.01, 0.5);
    controls.appendChild(f.wrap);

    function draw() {
      const frac = parseFloat(f.input.value);
      f.out.textContent = fmt(frac, 2);
      const qf = WR.quantile(X, frac);
      const svg = drawStrip(board, 680, 190, X, {
        xmin: 0, xmax: Math.max.apply(null, X) * 1.02,
        mt: 60,
        xfmt: v => '$' + Math.round(v / 1000) + 'k',
        markers: [{ value: qf, color: ACCENT, label: 'q(' + fmt(frac, 2) + ')' }],
        band: { lo: q25, hi: q75, color: NEUTRAL },
      });
      // mean ± sd band, drawn as a second row above the strip for comparison
      const ml = 16, mr = 16;
      const x2px = x => ml + (x - 0) / (Math.max.apply(null, X) * 1.02 - 0) * (680 - ml - mr);
      const lo = mean - sd, hi = mean + sd;
      const rect = el('rect', { x: x2px(lo), y: 8, width: Math.max(0, x2px(hi) - x2px(lo)), height: 16, fill: POS, opacity: 0.85 });
      svg.insertBefore(rect, svg.firstChild);
      svg.appendChild(txt(x2px(mean), 20, 'mean ± sd', { 'text-anchor': 'middle', fill: '#8a6a52', 'font-weight': 700 }));

      readout.innerHTML =
        `q(${fmt(frac, 2)}) = <strong>$${fmt(qf, 0)}</strong>. IQR = q(.75) − q(.25) = $${fmt(q75, 0)} − $${fmt(q25, 0)} = ` +
        `<strong>$${fmt(q75 - q25, 0)}</strong>. Compare to mean ± sd = $${fmt(lo, 0)} to $${fmt(hi, 0)}, a span of $${fmt(2 * sd, 0)}.`;
    }
    f.input.addEventListener('input', draw);
    draw();
  }

  // ============================================================
  // Widget 4 — taming the long tail: raw / log / arcsinh
  // ============================================================
  function initTransform(data) {
    const host = document.getElementById('viz-transform');
    if (!host) return;
    const board = host.querySelector('.wr-board');
    const controls = host.querySelector('.wr-controls');
    const readout = host.querySelector('.wr-readout');
    const X = data.price;

    const sel = radioGroup('Scale', [['raw', 'Raw'], ['log', 'Log'], ['arcsinh', 'Arcsinh']], 'raw');
    controls.appendChild(sel.row);

    function transformed() {
      const mode = sel.value();
      if (mode === 'raw') return { vals: X.slice(), dropped: 0 };
      if (mode === 'log') {
        const vals = X.filter(x => x > 0).map(x => Math.log(x));
        return { vals, dropped: X.length - vals.length };
      }
      return { vals: X.map(x => WR.arcsinh(x)), dropped: 0 };
    }

    function draw() {
      const { vals, dropped } = transformed();
      const width = 680, height = 220, ml = 44, mr = 12, mt = 12, mb = 30;
      const plotW = width - ml - mr, plotH = height - mt - mb;
      const svg = svgBox(width, height);
      board.innerHTML = ''; board.appendChild(svg);
      const xmin = Math.min.apply(null, vals), xmax = Math.max.apply(null, vals);
      const nbins = 28, bw = (xmax - xmin) / nbins || 1;
      const counts = new Array(nbins).fill(0);
      vals.forEach(v => {
        let b = Math.floor((v - xmin) / bw);
        if (b < 0) b = 0; if (b >= nbins) b = nbins - 1;
        counts[b]++;
      });
      const maxC = Math.max.apply(null, counts) || 1;
      const x2px = x => ml + (x - xmin) / (xmax - xmin || 1) * plotW;
      const y2px = c => mt + plotH - (c / maxC) * plotH;
      counts.forEach((c, b) => {
        if (!c) return;
        const x0 = x2px(xmin + b * bw), x1 = x2px(xmin + (b + 1) * bw);
        svg.appendChild(el('rect', {
          x: x0 + 0.5, y: y2px(c), width: Math.max(0, x1 - x0 - 1), height: (mt + plotH) - y2px(c),
          fill: '#fde0d2', stroke: '#d8a48a',
        }));
      });
      svg.appendChild(el('line', { x1: ml, y1: mt + plotH, x2: ml + plotW, y2: mt + plotH, stroke: '#cfc9bd' }));
      for (let i = 0; i <= 5; i++) {
        const xv = xmin + (xmax - xmin) * i / 5, px = x2px(xv);
        svg.appendChild(el('line', { x1: px, y1: mt + plotH, x2: px, y2: mt + plotH + 4, stroke: '#cfc9bd' }));
        svg.appendChild(txt(px, mt + plotH + 16, fmt(xv, 1), { 'text-anchor': 'middle' }));
      }
      const mode = sel.value();
      const label = mode === 'raw' ? 'price ($)' : mode === 'log' ? 'log(price)' : 'arcsinh(price)';
      readout.innerHTML =
        `Histogram of <strong>${label}</strong>, n = ${vals.length}` +
        (dropped ? ` (<strong>${dropped}</strong> zero-price rows dropped — log is undefined at 0).` : '.') +
        ' Raw price is a wall-plus-tail shape; log and arcsinh pull the tail in toward symmetric.';
    }
    sel.row.querySelectorAll('input').forEach(i => i.addEventListener('change', draw));
    draw();
  }

  // ============================================================
  // Widget 5 — comparing groups: price by title_status
  // ============================================================
  function initGroups(data) {
    const host = document.getElementById('viz-groups');
    if (!host) return;
    const board = host.querySelector('.wr-board');
    const readout = host.querySelector('.wr-readout');

    const groups = {};
    data.rows.forEach(r => {
      (groups[r.title_status] = groups[r.title_status] || []).push(r.price);
    });
    const names = Object.keys(groups);
    const xmax = Math.max.apply(null, data.price) * 1.02;

    const width = 680, rowH = 90, height = rowH * names.length + 20;
    const svg = svgBox(width, height);
    board.innerHTML = ''; board.appendChild(svg);
    const ml = 16, mr = 16;
    const x2px = x => ml + (x - 0) / xmax * (width - ml - mr);

    let statsHtml = '';
    names.forEach((name, gi) => {
      const vals = groups[name];
      const mean = WR.mean(vals), median = WR.median(vals);
      const yTop = gi * rowH + 26;
      svg.appendChild(txt(ml, yTop - 10, name + ' (n=' + vals.length + ')', { 'font-weight': 700, fill: '#1f1d1a', 'font-size': 12 }));
      vals.forEach((v, i) => {
        const jitter = ((i * 2654435761) % 1000 / 1000 - 0.5) * (rowH - 40);
        svg.appendChild(el('circle', { cx: x2px(v), cy: yTop + (rowH - 40) / 2 + jitter, r: 3, fill: '#cfc9bd', opacity: 0.7 }));
      });
      [[mean, ACCENT, 'mean', true], [median, NORMAL, 'median', false]].forEach(([val, color, label, dashed]) => {
        const px = x2px(val);
        svg.appendChild(el('line', {
          x1: px, y1: yTop - 4, x2: px, y2: yTop + (rowH - 40) + 4, stroke: color, 'stroke-width': 2,
          'stroke-dasharray': dashed ? '4 3' : 'none',
        }));
      });
      statsHtml += statHTML(name + ' mean', '$' + fmt(mean, 0)) + statHTML(name + ' median', '$' + fmt(median, 0));
    });
    // shared axis at the bottom
    const axisY = height - 14;
    svg.appendChild(el('line', { x1: ml, y1: axisY, x2: width - mr, y2: axisY, stroke: '#cfc9bd' }));
    for (let i = 0; i <= 6; i++) {
      const xv = xmax * i / 6, px = x2px(xv);
      svg.appendChild(el('line', { x1: px, y1: axisY, x2: px, y2: axisY + 4, stroke: '#cfc9bd' }));
      svg.appendChild(txt(px, axisY + 16, '$' + Math.round(xv / 1000) + 'k', { 'text-anchor': 'middle' }));
    }
    readout.innerHTML = statsHtml;
  }

  // ---------- boot: one fetch, then all data-driven widgets ----------
  fetch('data.json').then(r => r.json()).then(data => {
    initTryIt(data);
    initToyStat(data);
    initQuantile(data);
    initTransform(data);
    initGroups(data);
  }).catch(err => {
    const t = document.getElementById('viz-try-it');
    if (t) t.innerHTML = '<p style="color:#b14a2e">Could not load data.json — open this page over http (e.g. <code>python3 -m http.server</code>), not via file://.</p>';
    console.error(err);
  });

  // ============================================================
  // Inline glossary (contract from CLAUDE.md) — verbatim pattern
  // ============================================================
  const GLOSSARY = {
    schema: {
      title: 'Schema',
      body: '<p>The organization of a dataset: what tables exist, what variables (columns) they contain, and what type each variable is. Checking the schema is always the first step, before any statistic is trusted.</p>',
    },
    'type-cast': {
      title: 'Type casting (coercion)',
      body: '<p>Forcing a variable into a different data type than the one it was loaded as — turning the text "$1,320.15" into the number 1320.15, or turning "2 days left" into the number 48 (hours). Real data is almost never typed correctly on arrival.</p>',
    },
    'disguised-missing': {
      title: 'Disguised missing value',
      body: '<p>A missing observation that is not stored as a blank or <code>NaN</code>, but as a valid-looking value that actually means "unknown" — a price of exactly 0, a color of "no_color", or a 9999 used as a sentinel. These slip past a naive <code>isna()</code> check.</p>',
    },
    'robust-statistic': {
      title: 'Robust statistic',
      body: '<p>A summary statistic whose value barely changes when a small number of observations are extreme or wrong. The median and the IQR are robust; the mean and the variance are not — a single huge value can move them arbitrarily far.</p>',
    },
    quantile: {
      title: 'Quantile',
      body: '<p>The value below which a given fraction f of the sorted data falls. The .25 quantile has 25% of the data at or below it; the median is the .5 quantile. Quantiles generalize "the middle" to any split point.</p>',
    },
    iqr: {
      title: 'Interquartile range (IQR)',
      body: '<p>The gap between the 75th and 25th percentiles, q(.75) − q(.25). It captures the spread of the middle half of the data and, like the median, is nearly unaffected by extreme values at either end.</p>',
    },
    arcsinh: {
      title: 'Inverse hyperbolic sine (arcsinh)',
      body: '<p>A transformation that behaves like a logarithm for large values — compressing a long right tail — but, unlike the logarithm, is defined at zero and for negative numbers. Useful exactly when a skewed variable also contains zeros.</p>',
    },
    'contingency-table': {
      title: 'Contingency table',
      body: '<p>A cross-tabulation of two categorical variables: one row per label of the first, one column per label of the second, and a count in every cell. It shows how two categoricals vary together.</p>',
    },
  };

  window.GLOSSARY = GLOSSARY;

})();
