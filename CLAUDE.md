# Understanding Uncertainty — Fall 2026
## Schema & Operating Instructions for Claude Code

This file governs how Claude operates in this course folder. It defines the directory layout, where the source content lives, the interactive-web-lab authoring style, and the pedagogy the labs follow. The single most important section is **Interactive Web Lab Style** — the labs are the deliverable, and they must stay visually and pedagogically coherent.

Understanding Uncertainty is a first probability/statistics course for data-science students: wrangling and linear algebra, then probability and random variables, densities (CDF/PDF/KDE), expectation and the WLLN, Monte Carlo, the bootstrap, the CLT, then conditioning, Markov chains, likelihood/MLE, regression, optimization, and dynamic programming. Students come in fluent in Python, ML, and statistics; they are newer to measure-flavored probability theory and to lower-level numerical/systems detail.

---

## Common Commands

There is no build step, package manager, or CI here — it's a set of vanilla HTML/CSS/JS lab pages plus their Python assignment templates. The routine commands:

- **Run a lab's local autograder** — `cd labs/class-NN-slug && python3 test_<name>.py`. Each lab that ships a Python assignment template (`kde.py`, …) ships a matching `test_<name>.py` that spawns the template as a subprocess and pipes stdin/stdout test cases through it. Use it as the fast feedback loop while iterating on a lab's reference solution; passing locally is necessary but not sufficient (the Gradescope autograder runs a superset).
- **Serve the labs** — `python3 -m http.server` from this folder, then open `/labs/class-NN-slug/<lab>.html`. **The labs must be served over http**, not opened via `file://` — every lab loads its data with `fetch('data.json')`, which a `file://` origin blocks. A `.claude/launch.json` (`uu-static`) is set up for the preview tools.
- **Syntax-check a widget file** — `node --check labs/class-NN-slug/viz.js` after edits, if Node is installed. Node may be absent on this machine; when it is, verify widget logic by mirroring it in the lab's `sampler.py` and running that, and by driving the page in the browser preview (see **Verification before declaring done**).
- **Cache-bust** — after editing any CSS/JS, bump the `?v=N` query string on the changed file (see the Interactive Web Lab Style section) so cached assets don't mask changes.

For dates in filenames or footers: use the date from the `currentDate` block in `MEMORY.md` (loaded into every conversation), not file timestamps or guesses.

---

## Directory Layout

```
Understanding Uncertainty/
├── CLAUDE.md              ← this file (schema + instructions)
├── index.html             ← course home (hero, lab cards, link to schedule)
├── schedule.html          ← the 14-week Fall 2026 schedule
├── .claude/               ← launch.json (uu-static server) + settings
└── labs/
    ├── shared/           ← shared base linked by EVERY lab (do not fork per-lab)
    │   ├── lab-base.css    ← design tokens, chrome, widget primitives, presentation mode, glossary
    │   └── lab-base.js     ← presentation toggle, TOC tracking, prev/next nav (LAB_SEQUENCE)
    └── class-07-kde/       ← one folder per built lab: class-NN-slug
        ├── kde.html        ← the lab page (single file, all sections inline)
        ├── styles.css      ← lab-specific widget CSS only (NOT palette/chrome)
        ├── viz.js          ← lab-specific widgets, one IIFE each
        ├── data.json       ← the data the widgets fetch
        ├── sampler.js/.py  ← standalone, downloadable, pure-stdlib implementations
        ├── kde.py          ← assignment template (student-edit zone marked)
        ├── test_kde.py     ← local autograder (spawns the template as a subprocess)
        └── NOTES.md         ← instructor notes: solution, expected outputs, common errors
```

### Source content (read-only, elsewhere on disk)

The course material originates from the instructor's content repo at
`~/Documents/GitHub/UU/uu_fa26/` — one `class_NN/` folder of Jupyter notebooks per class, plus `uu_fa26.ods` (the schedule) and `cville_cars.csv` and other datasets under `class_02/`. **Treat that repo as read-only source.** A lab is built by reading the relevant notebook(s), lifting the math and a real dataset, and re-expressing them as an interactive page in the style below. `class-NN` in a lab folder name matches the class number in the source repo and the `/class-NN/` route in `lab-base.js`.

---

## Interactive Web Lab Style

When you produce or extend a lab page, match the style of `labs/class-07-kde/kde.html`. That lab is the canonical reference and the only fully built example — read it before generating new lab pages so the visual identity, widget patterns, and pedagogy stay coherent across the course.

### Output: vanilla HTML/CSS/JS, no build step

- **Shared base files** live in `labs/shared/` and MUST be linked by every lab page **before** the lab-local files:
  - `shared/lab-base.css` — design tokens (`:root`), base typography, page chrome (TOC + header + footer), generic widget primitives (`.viz`, `.callout`, `.chat-downloads`, `.btn`, `.exercise`), the presentation-mode contract, and the inline-glossary widget.
  - `shared/lab-base.js` — the presentation-mode toggle (`P`/`Esc`/arrow keys + `localStorage`), TOC active-link tracking, the course index link, the prev/next nav strip, and a small `LabBase` namespace (`makeLcg`, `softmax`, `downloadBlob`). **Adding a lab means adding one entry to `LAB_SEQUENCE`** (in class order); only list labs that exist on disk, since the prev/next strip links straight to those files.
- Per-lab files live in `labs/class-NN-slug/`:
  - `<lab>.html` — single page, all sections inline. Link the shared sheet first, then the lab sheet; same for scripts.
  - `styles.css` — lab-specific widget rules only. **Don't redefine the palette, typography, or `.viz` / `.callout` chrome here** — they live in `lab-base.css`. The per-lab sheet is purely additive.
  - `viz.js` — lab-specific widgets, every widget in its own IIFE. The presentation toggle, TOC tracking, and nav are owned by `lab-base.js`; do not reimplement.
- Required link order in the HTML:
  ```html
  <link rel="stylesheet" href="../shared/lab-base.css?v=N">
  <link rel="stylesheet" href="styles.css?v=N">
  ...
  <script src="../shared/lab-base.js?v=N"></script>
  <script src="viz.js?v=N"></script>
  ```
- No bundler, no transpiler, no framework. The reader opens one HTML file (served over http) and everything Just Works. If a widget needs data, ship it as a sibling file (`data.json`, `data.csv`).
- Prism (CDN) for syntax highlighting of code blocks (`class="language-python"` etc.).
- **Math is first-class — never replace an equation with prose.** Use MathJax. **Set inline math to `\( … \)` and display math to `$$ … $$`, and keep `$` OUT of the delimiter set**, because the labs are full of literal currency and dollar amounts (`$5k`) that a `$`-delimiter would eat. Put display equations in `<pre class="equation">$$ … $$</pre>` (no inner `<code>` — MathJax skips `code`, and `pre.equation` in `lab-base.css` gives the styled treatment). Keep `code` in `skipHtmlTags` so Prism owns code blocks.
- **Cache-bust on every CSS/JS edit.** Bump the `?v=N` query string on the changed file. Never reuse a version number. Shared base files and per-lab files version independently.

### File layout inside the HTML

In order, top to bottom:

1. **Sticky TOC** (`<aside class="toc">`) with anchor links to every `<h2 id="...">`. Update the TOC and heading IDs in lockstep.
2. **Header** (`<header class="hero">`): eyebrow (course · class · date), `<h1>` title, one-sentence subtitle, byline.
3. **Lede paragraph** (`<p class="lede">`) — two or three sentences positioning the lab.
4. **Citation block** (`<div class="cite">`) — the source notebook(s) and dataset the lab builds on.
5. **Glossary hint + panel** (`.glossary-hint` + empty `#glossary-panel`) between the citation and the first widget.
6. **Demo widget** ("Try it" — `<div class="viz" id="viz-try-it">`) — the motivating thing the reader interacts with immediately, before any explanation. Load data via `fetch('data.json')` and run the computation in browser JS. Provide download buttons for the data and the standalone samplers at the bottom.
7. **Presentation-mode toggle** — a single `#present-toggle` button; `lab-base.js` does the rest.
8. **Body sections** — `<h2 id="...">` per major step. Interleave prose with widgets, code, and equations; never two dense paragraphs in a row without an artifact between them. Open each major section with a **Think · Pair · Share** block at the discovery moment before the section pays off.
9. **Assignment** (`<h2 id="assignment">`) — student deliverable, I/O spec, data-structure table, run commands, downloads, rubric.
10. **FAQ** (`<h2 id="faq">`) — `<h3>` per question.
11. **Footer** — short credit line.

### Visual identity (in `lab-base.css`)

- **Palette**: `--bg: #fbfaf7` cream, `--ink: #1f1d1a` charcoal, `--accent: #b14a2e` warm red used sparingly (active states, curve strokes, highlighted edges).
- **Sign / magnitude coloring inside widgets**: positive uses `#fde0d2` orange tint, negative uses `#d5e6dc` green tint, near-zero uses `#f0eee5` gray. In the KDE lab the accent-red is the estimate curve, the orange tint is the query window, green is the per-point kernel components. Preserve these conventions.
- **Type**: serif (Iowan Old Style / Charter / Georgia) for body text, sans-serif for chrome and labels, monospace (JetBrains Mono / SF Mono) for code and numbers.
- **Neurons vs. data** (when a lab draws a network): circles render the output of a learned projection; rectangles render data vectors. Not relevant to most UU labs, but apply it if you ever draw one.

### Widget patterns to reuse

These are validated in `class-07-kde` and are the reusable vocabulary. Reuse the *principles*; the specific widgets are examples.

- **Toy walkthrough principle.** Alongside the real-data demo, pin one minimal hand-traceable example and use its exact numbers everywhere. KDE uses the toy sample `{2, 4, 5, 5, 9}` with pinned bandwidth `h = 1.5` in the kernel-stacking widget, and those same five numbers reappear in the assignment. The reader recognizing a number they hand-traced is the lesson.
- **Live demo playground** (`#viz-try-it`): real data + the single knob the lab is about (KDE's bandwidth), driving a live recompute of an SVG plot. Include a kernel/variant toggle and a "reset to the principled default" button (KDE's *Silverman's h*). This is the motivating artifact at the top of the page.
- **Slider-driven recompute**: a slider on a key input drives a full recompute through fixed math and redraws the SVG on every `input` event. Keep the per-frame work small (KDE is O(grid × n) ≈ 12k ops — fine for drag).
- **Direct-manipulation / draggable region** (KDE's moving-window widget): a slider (or drag) moves a highlighted region over the data, and a live readout shows the arithmetic (`count / (2·n·h) = …`) so the formula and the picture update together.
- **Regime presets** (KDE's bias–variance widget): two or three buttons that jump the knob to qualitatively different settings (under-/well-/over-smoothed), each with a one-line note naming the failure mode. The cheapest way to make a trade-off visible.
- **Component-decomposition view** (KDE's "show the 5 kernels"): draw the individual contributions faintly and their sum boldly, so the reader sees the aggregate is literally the sum of parts.
- **Annotated code blocks**: when a code block deserves per-line explanation, wrap each line in `<div class="code-step" data-step="X" data-explain="…">` and render a `<div class="code-explain-panel">` below; hovering a line lights up peers and shows the explanation. (Use Prism for plain code blocks; use the custom highlighter only when you need the per-line wrappers Prism would clobber.)
- **Think · Pair · Share** (`<div class="callout tps">`): the required in-class collaboration beat, one before each major `<h2>`, at the discovery moment *before* the section pays off. Fixed structure (Think visible; Pair/Share gated behind `<details>` so students commit an answer first):
  ```html
  <div class="callout tps">
    <span class="label">Think · Pair · Share · <em>short topic tag</em></span>
    <ul class="tps-steps">
      <li><span class="tps-phase">Think · 2 min</span>A solo prompt that makes the reader predict the mechanism or failure the section is about to reveal.</li>
    </ul>
    <details class="tps-reveal">
      <summary>I've done the Think step — reveal Pair &amp; Share</summary>
      <ul class="tps-steps">
        <li><span class="tps-phase">Pair · 3 min</span>Compare with a neighbour — what did each of you miss?</li>
        <li><span class="tps-phase">Share · 2 min</span>As a table, commit to one answer and carry it into <a href="#next-section">the section below</a>.</li>
      </ul>
    </details>
  </div>
  ```
  Phrase the Think prompt so its answer is exactly what the upcoming section reveals — a prediction the section then confirms or refutes. Styling lives in `shared/lab-base.css`; no per-lab CSS, no JS.
- **Inline glossary explainer** (`.gloss` + `data-gloss="…"` + `#glossary-panel`): wrap the first canonical use of unfamiliar vocabulary in `<span class="gloss" data-gloss="key">term</span>`; hold a `GLOSSARY = { key: { title, body } }` dict in `viz.js`. On hover/focus/click the panel re-parents itself under the term's nearest block-level container and fades in — it **pushes content down, never overlays**, so the reader's eye stays put. Close button and `Esc` dismiss (Esc suppressed while an input/textarea is focused). Canonical implementation: `class-07-kde/viz.js`. See **Jargon awareness** for which terms to mark.

### Pedagogical structure

- **The lab arc is Touch → Derive → Build.** *Touch*: interact with the live demo before any explanation. *Derive*: build the central formula up from intuition, ideally more than one way (KDE derives the same estimator three ways — moving window, slope of the ECDF, stacked measurement-error bumps — then unifies them in a callout). *Build*: the reader implements the thing themselves against an autograder. Lead with the cleanest possible version, then add nuance (uniform kernel first, then Gaussian).
- **Every concept gets at least three views**: a prose paragraph, an equation or code block, and an interactive widget. Three modalities of the same idea — readers pick the one they need.
- **Toy walkthroughs are first-class.** Never present an abstract concept without a concrete example the reader can hand-trace.
- **Callouts** (`<div class="callout insight">`, `<div class="callout note">`) hold worked numerical examples, the "same formula, three views" syntheses, and "scaling up" comparisons. Keep them visually distinct from body prose.
- **Exercises** (`<div class="exercise">`) have a `<details><summary>Show answer</summary>` block. One per major section, not one per concept. An exercise checks understanding *after* a concept; a TPS provokes a prediction *before* it — use both, for different moments.
- **Think · Pair · Share is required on every lab** — roughly one per major `<h2>`.

### Readability — optimize for the reader who has to get through it

A lab a student *finishes* beats an exhaustive one they abandon. The default failure mode of a technical walkthrough is the **wall**: stacked bullet lists and tables, paragraphs that pack three ideas each, sections that open cold. Optimize hard for readability so a first-week student moves through the page without stalling. This is a quality bar, not a license to fictionalize — no invented narrator or story arc, just clear, well-ordered prose.

- **One idea per paragraph, and lead with it.** Open each paragraph with its point; put elaboration after.
- **Break up walls.** No two dense paragraphs in a row without an artifact between them. Reserve `<ul>`/`<table>` for genuine reference material the reader will scan back to; if items have a natural order, write them as connected sentences.
- **Signpost, don't surprise.** Give each section a one-sentence opener that says what it covers and how it follows from the previous one — a plain factual bridge, not a cliffhanger.
- **Plain, direct, concrete.** Short concrete sentences; a worked example over a bare definition; active second person when it's clearer.
- **Respect the reader's time and prior knowledge.** Don't re-explain what a DS reader already knows (see Jargon awareness); don't pad.

Readability never means dropping a required widget, equation, worked example, callout, or the per-section Think · Pair · Share, and never means softening precision. **The test:** could a first-week student read the page top to bottom without re-reading a sentence or skipping a wall?

### Precision of language

Every sentence should say exactly what it means, in the fewest exact words — a first-class quality bar, not a copy-edit afterthought.

- **Prefer the precise, concrete verb over the vague or cute one.** "the model just knows the density" hides the mechanism; "the estimator averages a bump centered on every data point" names it.
- **One meaning per phrase.** If a sentence could be read two ways, rewrite it. Ambiguity a domain expert resolves automatically is exactly what trips the reader who is new to the vocabulary.
- **Cut filler, hedges, and throat-clearing.** "It's worth noting that basically…", "in order to", "a variety of different" — delete or tighten.
- **Name things by their real name.** The exact function, parameter, or value — `Silverman's rule`, `h`, `1/(2nh)` — not "the relevant setting".
- **Precision coexists with a warm voice; it never coexists with fudging.** When precision and flair conflict, precision wins — then find a precise sentence that also reads well.

The self-check: reread each sentence and ask "is this the exact word, and can it be read only one way?" This applies to every artifact — lab prose, glossary entries, quiz questions, commit messages.

### Jargon awareness — auto-gloss for DS readers

Students come from data science. They know the **ML / statistics** vocabulary cold — *gradient, softmax, train/test split, embedding, dropout, regularization, F1, AUC, precision, recall, overfitting, bias–variance* (the phrase), *hyperparameter*. They have **not** necessarily seen the **measure-flavored probability theory** or the **lower-level numerical/computing** vocabulary the labs lean on. Treat that gap as a first-class authoring concern: a term a reader doesn't recognize is a term they skip, and the skipped word is often *the* word.

**The rule.** When body prose introduces a term from the categories below, wrap the **first canonical use** in `<span class="gloss" data-gloss="key">term</span>` and add a matching entry to the lab's `GLOSSARY`. Aim for **5–10 marked terms across the lede and opening sections** — enough that a first-week student reads front-to-back without a tab full of searches, not so many the dotted underlines crowd the prose. Each entry is 2–4 sentences of plain language; add a small inline SVG mini-diagram when it helps.

**Mark these (assume unfamiliar):**

- **Probability-theory / statistics terms not in the DS intro curriculum** — ECDF, CDF vs. PDF as objects, indicator function, quantile/IQR as formal objects, kernel, bandwidth, Silverman's rule, consistent vs. unbiased estimator, bias of an estimator, sampling distribution, standard error of the mean (SEM), WLLN, CLT (as a theorem, not a vibe), Monte Carlo, bootstrap resampling, Glivenko–Cantelli, likelihood vs. probability, MLE, delta method, Markov chain / transition matrix, joint vs. conditional density, conditional expectation, order statistics.
- **Numerical / computing detail** — broadcasting, vectorization, `np.linspace`/grid, floating-point vs. integer, RNG seeding, subprocess / stdin-stdout autograder protocol, `flush`, JSON structure, why `fetch` needs http.
- **Occasional systems/tooling terms** a lab touches (Docker, venv, ssh) — gloss on first use if the lab actually uses them.

**Don't mark these (the reader already knows them):**

- ML/DS vocabulary they came in with — loss, gradient, softmax, dropout, embedding, fine-tuning, train/test/validation split, AUC, F1, precision, recall, regularization, hyperparameter, overfit.
- Basic programming primitives — function, variable, loop, list, dict, class, import, regex, exception.
- Anything already defined adequately inline (an equation, a `<pre class="equation">`, a labeled diagram). Don't double-explain — pick one channel.

**One judgement call:** a term fully defined in the same sentence it appears in doesn't need a `.gloss` wrap. Mark it only if the reader would still need more context than that sentence provides.

### Presentation mode (required on every lab)

Every lab MUST include the presentation-mode control — a small fixed bar in the **top-left** for live teaching. The lab HTML needs only a single `#present-toggle` button; `lab-base.js` wraps it in `.present-controls`, adds the course-index link and the Back/Forward slide-nav buttons, and wires the keyboard shortcuts.

```html
<button type="button" id="present-toggle" class="present-toggle" title="Toggle presentation mode (P)">
  <span class="present-icon">◧</span>
  <span class="present-label">Present</span>
</button>
```

Contract (all implemented in `shared/`):
- Clicking `#present-toggle` flips `body.presentation-mode`, swaps the label Present/Exit, persists to `localStorage` (`lab.presentationMode`).
- Back/Forward scroll to the previous/next `main h2[id]` ("one slide per major section").
- Keys: `P` toggle, `Esc` exit, `←`/`PageUp` back, `→`/`PageDown` forward; `↑`/`↓` scroll normally; shortcuts suppressed while an input/textarea/contenteditable has focus.
- `body.presentation-mode` CSS: hides narrative `<p>` (except `.keep-in-present`, `.viz-description`, `.viz-caption`), TOC, footer, byline, lede; keeps every `.viz`, `svg`, `pre`/`code`, heading, table, and `.callout`; keeps every interaction live; bumps fonts ~1.2× with more whitespace. Mark equation paragraphs, punch-lines, and critical context with `class="keep-in-present"`.

### Try-it demo + downloads

The motivating demo at the top of every lab:

1. Real data lives in `data.json` next to the HTML.
2. The compute logic is inlined in `viz.js` in plain JS (no numeric libraries) so a reader can read it and port it to Python.
3. The demo is small and immediate — the reader produces output within five seconds of arriving, before reading anything.
4. Below the demo, download buttons for the data and two standalone samplers — a JS one and a Python one. The samplers are short (~150 lines), pure stdlib, accept the same arguments, and **mirror each other and the widget's math line-for-line** so all three agree on every number. **Verify the generated samplers actually run against `data.json` before declaring done** (KDE's `sampler.py` reproduces the widget's densities and its KDE integrates to ≈1).

### Assignment + autograder pattern

When a lab includes a student deliverable:

- The assignment is its own `<h2 id="assignment">` just before the FAQ.
- Provide a template Python file (`kde.py`, …) that implements everything except the one or two functions the student writes. Mark the student-edit zone with a clear `# YOUR JOB starts here.` banner and `TODO`s inside the stubs.
- **Document the data-file structure in the template's header docstring** — every top-level key of `data.json` and what `values` contains — and repeat the table inside the HTML assignment section.
- I/O protocol: stdin/stdout, one request per line, one response per line, clear response prefixes (`OK:` / `ERR:` for the KDE lab; pick analogous prefixes per task). Anything off-protocol confuses the autograder; debugging goes to stderr; `print(..., flush=True)`.
- Ship a `test_<name>.py` that spawns the student's file as a subprocess, pipes batched queries through stdin, and prints pass/fail per case, comparing against a reference computed the same way, within tolerance. Group the cases (e.g. per kernel) and include a protocol case (unknown input reported, not crashed).
- The HTML assignment section includes: what-you-build list, I/O spec, data-structure table, run commands, downloads row, and a rubric table that rewards more than one dimension (KDE weights both kernels, an area/normalization check, and protocol handling) so a degenerate all-one-answer solution fails.
- Keep a reference solution and common-error list in the lab's `NOTES.md` (instructor-facing), not in the student folder root.

### Quizzes & exams (printable, scantron-ready)

Quizzes and exams (when built) live in `quizzes/`. Conventions:

- **Single source of truth.** Author questions as data in a generator script and emit the student exam *and* the instructor key from the same data in one run, so they can't drift. Balance the key (~equal A/B/C/D) and shuffle the correct-letter sequence with a fixed seed.
- **Test concepts, not memorization.** Favor Think·Pair·Share-style questions — "why does this work", "what would happen if", "which is the structural reason", "spot the bug". Mine each lab's TPS blocks and insight callouts. Avoid recall of exact constants or API trivia.
- **Make answers un-guessable.** All four options parallel in grammar and within ~30% length of each other; the correct one must NOT be the longest or only detailed one (put the justification in the answer-key rationale). Every distractor is a real misconception, wrong only on reflection. Audit: flag any question where the correct option is the single longest and ≥1.4× the average distractor length, and drive that count to near-zero. Re-verify the keyed answer's meaning is unchanged after any bulk rewrite.
- **Print conventions.** Printable HTML with `@page { size: letter }` and `page-break-inside: avoid`. **No em-dashes** in question text (reads as minus in math-heavy exams; use colons/commas/parentheses). **Spell arrows as "to"** rather than `→`. Worked problems get inline grayscale SVG diagrams; ship a one-page formula reference sheet. All questions multiple-choice with `<ol type="A">` for scantron grading; Name/Computing-ID blanks; scratch-paper note.

### Verification before declaring done

Whenever you author or edit a widget that does real numerics (a forward pass, an estimator, an autograder), test it end-to-end before declaring success:

- **JS widgets:** run `node --check viz.js` if Node is installed. Node is often absent here — in that case, verify the math through the lab's `sampler.py` twin (run it against the real `data.json` and check specific values plus a sanity invariant, e.g. the density integrates to ≈1), and **drive the page in the browser preview**: start the `uu-static` server, navigate to the lab, check the console for errors, confirm each widget rendered an `svg`, and exercise the controls at their extremes (checking for `NaN` in generated SVG paths).
- **Python templates:** run `python3 test_<name>.py` against a completed reference solution (kept out of the student folder) and confirm all cases pass; confirm the unedited template fails cleanly (its stub raises), which is expected.
- **Visual SVG widgets:** confirm no two elements overlap and nothing is clipped before declaring layout done — sample coordinates in the viewBox by hand if unsure.
- **Math rendering:** confirm MathJax actually rendered (no raw `$$` left in the DOM, `mjx-container` elements present) and that literal currency (`$5k`) was left untouched by the delimiter config.

---

## Reminders

- The source content repo (`~/Documents/GitHub/UU/`) is read-only. Build labs *from* it; never edit it.
- Labs must be served over http; `file://` breaks `fetch`.
- The shared base is shared on purpose — extend `shared/` for anything reused; keep per-lab sheets additive.
- `class-NN` in a folder name, the source `class_NN/`, and the `/class-NN/` route in `lab-base.js` all refer to the same class — keep them aligned, and add each new lab to `LAB_SEQUENCE`.
- Never reuse a `?v=N` cache-bust number.
