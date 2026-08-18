# Instructor Notes — DS 5030 Understanding Uncertainty, Fall 2026

Instructor-facing prep notes, one file per teaching session, keyed to **`_Teaching/F26_scheduling.xlsx`, sheet `DS5030`** — the authoritative schedule. Not the `class-NN` numbering in the HTML repo, not the `class_NN/` folders in `uu_fa26`, and — for **weeks 1–7** — not `DS5030_Syllabus Fall 2026.docx`, which is superseded there: the docx dropped Learning from Data and its week-1 dates are off by a day (it says Aug 26 & 28; Aug 25 is the Tuesday). Where the two disagree on the first half, the spreadsheet wins.

**For weeks 8–15 the syllabus is the plan.** The spreadsheet has the dates but blank topics; the syllabus has the topics, and its second-half dates match the spreadsheet exactly. So the second half below is **the syllabus's tentative schedule**, merged onto the spreadsheet's dates, and marked *tentative* until the spreadsheet fills in.

These are **not** student-facing. Students see notebooks (`uu_fa26`), board math, pre-class videos, and labs. These notes are the layer underneath: the assumption behind each result, the concrete case where it breaks, the questions a sharp student asks, and which later week collapses if this session is shaky.

> ### Material existing ≠ knowing the material
>
> Most of these notebooks were written by the co-instructor. That reduces the **authoring** burden and not the **learning** burden — the two are separate problems, and the coverage map below only speaks to the first one. Every session file therefore carries a section called **The content, from scratch**: a self-contained statement of what the session actually teaches, written so it can be learned from the notes alone, without reverse-engineering someone else's cells. Read that section first and the notebook second.

> ### Week 1–2 was reordered (Aug 2026)
>
> Aug 25 became a dedicated **intro + setup** session, pushing wrangling to Aug 27 and vectors to Sep 3. The old *Learning from Data* session dissolved: the vocabulary later weeks need (parameter/statistic/estimator, unbiasedness, `V[X̄ₙ] = σ²/n` as a **result**) folded into Sep 1 §2E, and the `V[X̄ₙ]` **derivation** plus the wages simulation deferred to **Sep 22**, where a sampling distribution is the actual topic.
>
> Two things improved for free: `E[X] = p · X` on Sep 3 is now a *callback* to Tuesday rather than a forward reference, and the wages simulation gives **Sep 24 the lab it was missing** (the clinical-trials lab that doesn't exist). One cost: there is no quiz on Sep 1, so the first quiz is **Sep 8** — a week later than the syllabus's "weekly Tuesday quizzes" implies.

**File naming:** `NN-week-WW-{tue,thu}-slug.md`, where `NN` is the session number from the build-order table below. The numeric prefix exists so the files sort chronologically — without it "thu" sorts before "tue" and every week reads backwards.

## Who the students are

**First semester of a one-year master's program. ML is a *concurrent* course, not a prerequisite.** Some students arrive from computer science, some from elsewhere; none of them have taken the ML courses this material feeds into.

Three consequences that shape every file here:

- **Do not assume ML vocabulary.** Loss functions, gradient descent, train/test split, regularization, overfitting, embeddings, bias–variance — this course *introduces* these, or at best meets them the same week the ML course does. The syllabus says the goal is to "complement and foreshadow" those courses; foreshadow is the operative word.
- **Do not assume calculus fluency.** Lead with the numerical or geometric version — a grid search, a picture, a simulation — and derive the closed form second.
- **Timing matters for the concurrent overlap.** By late October a student nine weeks into an ML course may well have seen gradient descent there. That's a bonus to exploit, never a prerequisite to rely on. Earlier in the semester, assume nothing.

This is also why the course-long **optimization spine** (§ "The optimization view" in each file) is worth the effort: it gives students a single organizing idea that requires no prior ML vocabulary, and it means that when the ML course says "minimize the loss," they have already met the sentence.

## How a session actually gets delivered

The co-instructor live-codes off the markdown-only guided notebooks, improvising from prior experience and the `sp26` versions. **That is not the plan here.** The preference is: show students the markdown notebook, and keep an **instructor version** alongside it with the would-be-live-coded cells already written. That artifact doesn't exist yet for any session, and building it is a real piece of the remaining work — but it's also the piece that makes the rest of the anxiety go away, because a pre-written instructor notebook turns "improvise at the board under time pressure" into "run the next cell."

So every session has **four possible delivery modes** for each step of material, and choosing among them is a decision per step, not per session:

| Mode | When it's right | Cost to build |
|---|---|---|
| **Notebook (student copy)** | Definitions, lists, reference material students will re-read | Zero — already written |
| **Instructor cells (pre-written)** | Anything that would otherwise be live-coded: a computation, a plot, a simulation | ~20–40 min per session, once |
| **Board** | Derivations, and anything where the *order of writing* is the explanation | Zero to build, but needs rehearsal |
| **HTML widget** | One idea that only lands if it moves: a slider, a drag, an animation | Zero — already built, see the index below |

**The default I'd suggest:** derivations on the board (they're linear and students need to see them assembled), computations and plots as pre-written instructor cells (never live), and *at most one* HTML widget per session, at the moment the idea would otherwise stay abstract. More than one widget per session and the session becomes a demo reel.

Each session file's §8 is now a **delivery plan** that assigns a mode to every step, so the decision is already made and reviewable rather than open.

### Using the HTML widgets in class

The lab pages in `labs/` already have **presentation mode** built in, which is exactly the "show one interactive plot" tool: it hides the prose, keeps every widget live, bumps the font, and `←`/`→` jump section to section. Press `P` to toggle, `Esc` to exit.

The pages fetch their data, so they need to be served over http, not opened as files:

```bash
python3 -m http.server 8137
```

Then e.g. `http://localhost:8137/labs/class-05-eda/eda.html`, and you can deep-link straight to a widget with its anchor: `...eda.html#viz-onehot`.

**Widgets are split across two pages per class** — the lab page (`wrangling.html`, `vectors.html`, `binomial.html`, `eda.html`, …) and the `lecture.html`. The index below names the page for each one; check it rather than guessing, since the split is not consistent.

### Widget index

| Session | Page | Widgets available |
|---|---|---|
| 02 · Thu 8/27 | `class-01-wrangling/wrangling.html` | `viz-toystat` (five cars, one slider), `viz-quantile`, `viz-transform` (raw/log/arcsinh), `viz-tail-transform`, `viz-groups` |
| 04 · Thu 9/3 | `class-02-vectors/vectors.html` | `viz-dot-product` (drag two vectors), `viz-zero-cov` (**drag points, curve it, covariance stays flat**), `viz-covariance` (centering), `viz-scatter`, `viz-four-numbers` |
| 03 · Tue 9/1 | `class-03-probability/lecture.html` | `viz-coin-flip` (flip the gamble, average settles), `viz-paths` (running proportion), `viz-hist` (empirical vs exact PMF), `viz-try-it` (binomial PMF) |
| 05 · Tue 9/8 | `class-05-eda/eda.html` + `lecture.html` | `viz-ecdf-drag` (**drag the sample, watch the ECDF**), `viz-ecdf` (+ standard-error band), `viz-onehot` (one-hot encoding, 8 patients) |
| 06 · Thu 9/10 | `class-06-cdf/cdf.html` + `lecture.html` | `viz-grid-limit` (the grid made finer), `viz-converge` (steps close in on the curve), `viz-inverse` (inverse-transform mapper), `viz-sample` |
| 08 · Thu 9/17 | `activity-hazard-shapes/index.html` | `viz-hazard-shapes` (**built for session 08**: Weibull shape slider, hazard + survival panels, three regime presets) |
| 07 · Tue 9/15 | `class-07-kde/kde.html` + `lecture.html` | `viz-window` (moving window: counting is estimating), `viz-stack` (five points, five bumps), `viz-biasvar` (under/well/over-smoothed), `viz-kernel-compare` |
| 09 · Tue 9/22 | `activity-min-sum-squares`, `activity-unbiased-consistent`, `activity-standard-error`, `activity-bessel-correction` | one widget each — **the estimator-properties set; they follow the wages simulation to Sep 22** |
| 10 · Thu 9/24 | `activity-two-distributions{,-skewed,-variance}` | one widget each |
| unscheduled | `class-09-monte-carlo` | `viz-pi` (darts), `viz-rate` (error vs n, log–log), `viz-try-it` |
| 04 · Thu 9/3 | `class-04-rng` | `viz-mse` (**minimize squared error, 40 patient ages — the argmin, session 04**); `viz-lcg-step`, `viz-seed`, `viz-urn`, `viz-speed` only if RNG is assigned |
| 02 · Thu 8/27 | `activity-min-sum-squares` | `viz-min-ss` — the mean-as-argmin widget |

## Bug checklist

**`BUGS.md`** collects every verified defect from all session files, deduplicated by source notebook so you can open one file and fix everything in it. Markdown checkboxes — tick them off as you go. It opens with a *"fix these first"* list ordered by teaching date: things that crash, teach a wrong number, or block a session with no fallback.

Anything in it involving a number or a code path was actually run, and the observed value is quoted.

## Reading — source key

Every session file carries a **Reading** block at the end of §2, so the books sit next to the content rather than in a separate document. Two sources feed those blocks:

- **`Understanding Uncertainty/Reading-Roadmap.md`** — detailed, verified against actual copies, and keyed to **8/25 – 10/1**, which maps exactly onto sessions 01–12. Gives Primary / Supporting / fuller-treatment / intuition-first / visuals per session.
- **`prep/ds5030_syllabus_reading_map.pdf`** — broader coverage including the second half, but keyed to an *older* schedule, so entries are matched **by topic, not by date**. Marked `[Map]` wherever used.

| Abbrev. | Book |
|---|---|
| **AoS** | Wasserman, *All of Statistics* (2004) |
| **B&H** | Blitzstein & Hwang, *Introduction to Probability* (2nd ed., 2019) |
| **G&S** | Grinstead & Snell, *Introduction to Probability* (free: `math.dartmouth.edu/~prob/prob/prob.pdf`) |
| **C&B** | Casella & Berger, *Statistical Inference* |
| **CASI** | Efron & Hastie, *Computer Age Statistical Inference* |
| **ROS** | Gelman, Hill & Vehtari, *Regression and Other Stories* (companion site: `avehtari.github.io/ROS-Examples`) |
| **Spiegelhalter** | *The Art of Statistics* — for in-class visuals, not assigned reading. Entries marked *(free sample)* are inside the official Penguin preview; *(full book)* entries sit past it |
| **QE** | QuantEcon lectures, Sargent & Stachurski (free, Python: `quantecon.org/lectures`) |

**Three sessions have no textbook at all**, per the roadmap's own gap analysis — worth knowing before a student asks for a second source:

- **02 · vectors and inner product** — all six texts assume linear algebra. B&H Appendix A.3 is mechanical only. Strang is the honest recommendation.
- **07 · KDE** — Wasserman Ch. 20 is the *only* source among the six; nothing else covers density estimation.
- **08 · survival & hazard** — not in Wasserman, B&H, or Casella & Berger. CASI Ch. 9 is a full chapter and the only real option.

## The structure the schedule locks in

Every week is two sessions with different jobs:

- **Tuesday — Quiz / Math Day.** Quiz on prior weeks' material, handwritten and concept-driven. Board math.
- **Thursday — Lab / Coding Day.** Lab starts in class, finishes as homework, due Sunday midnight.

Plus a **pre-class video for nearly every lecture**, and a **weekly problem set** (out Tuesday, due the following Tuesday). So each session has up to four artifacts, which matches the naming convention already in use in `uu_fa26/Proposed schedule/Week N/`:

```
01_Tues_video_<source>.ipynb      ← pre-class video notebook
02_Tues_guided_<source>.ipynb     ← what you walk through live
03_Tues_activity_<name>.ipynb     ← in-class activity
04_Thurs_video_<source>.ipynb
06_Thurs_guided_<source>.ipynb
Lab/lab_NN_blank.ipynb + lab_NN_filled.ipynb
```

Weeks 1 and 2 are partially built in that format. Everything else is still in the old flat `class_NN/` folders and needs porting.

## Coverage map: session → source

From `F26_scheduling.xlsx` (`DS5030`). `sp26` = `uu_sp26/understanding_uncertainty/`, `fa26` = `uu_fa26/`, `html` = this repo's `labs/`. **Weeks 8–15 are blank in the spreadsheet** and are not planned yet.

| # | Date | Focus | Video | In class | Lab | State |
|---|---|---|---|---|---|---|
| 01 | Tue 8/25 | **Intro + setup** | — | course framing, environment, GitHub, run-a-notebook checkpoint | — | **no quiz, no lab** |
| 02 | Thu 8/27 | Data wrangling + EDA | Intro to Python + wrangling (2 videos) | EDA, basic stats; foreign-gifts activity | cars dataset lab ✅ | ⚠ 3 code bugs |
| 03 | Tue 9/1 | Probability & RVs **+ estimator vocabulary** | probability | 4 derivations, §2E, census activity | — | **no quiz**; ⚠ LaTeX fragile |
| 04 | Thu 9/3 | Vectors and inner product | vectors, matrices, inner product | inner-product applications, covariance | Taylor Swift similarity (Terry built) | ⚠ needs adapting |
| 05 | Tue 9/8 | Categorical variables / indicator | Bernoulli, one-hot | **ECDF lecture + activity** | — | ⚠ 1 formula bug |
| 06 | Thu 9/10 | CDF / PDF | CDF/PDF | generating-CDFs walkthrough | Outages lab (05 lab) | ⚠ 2 formulas wrong |
| 07 | Tue 9/15 | KDE: windowing/bandwidth, uniform kernel | `05_1_kde` | KDE properties, over/under-fitting activity | *(opt.)* `05_2_gaussian_kernel` | 🔴 Gaussian code broken |
| 08 | Thu 9/17 | Survival function & hazard rate | survival + hazard, analytical & data | advanced examples + lab tie-in | jet engines §1–4, **fixed horizons** | ⚠ 5 cells (deliberate); 🔴 **lab data missing** |
| 09 | Tue 9/22 | The sampling distribution | `class_10/08_01` | `class_10/09_2` intro to bootstrap | — | 🔴 **video code crashes; CLT formula wrong** |
| 10 | Thu 9/24 | Bootstrap hypothesis testing | — | `09_2` cells 6–9 | 🔴 **clinical-trials lab does not exist** | ⚠ Z-stat ordering — see file §12 |
| 11 | Tue 9/29 | SE, Z-stats | `class_11/10_1` (7c, all markdown) | same | **HW5 = `homework_11` — already written** | ⚠ 2 cells truncated |
| 12 | Thu 10/1 | CLT | `class_11/10_2` (7c, all markdown) | same | `homework_11` simulation prompts | 🔴 **95% critical value wrong (1.995)** |
| — | Tue 10/6 | **FALL BREAK** | | | | |
| 13 | Thu 10/8 | **MIDTERM** | | | sp26 practice exams exist | source exists |
| 14 | Tue 10/13 | Joint density, independence | — | — | — | `sp26` 02_moments §2 |
| 15 | Thu 10/15 | Conditional density, conditional expectation | — | — | — | `sp26` 02_using_information (77c) |
| 16 | Tue 10/20 | Empirical Markov chains | `04_dynamics` §1 | `04_dynamics` §2 (**working code**) | — | ⚠ taxi data missing (3 exercises) |
| 17 | Thu 10/22 | Simulating Markov chains | `04_dynamics` §3 | same | `assignment_5` + **full solutions** | 🔴 **normalization bug breaks both demos** |
| 18 | Tue 10/27 | The likelihood function | — | — | — | `sp26` 02_moments §3 |
| 19 | Thu 10/29 | MLE | — | — | `sp26` assignment_7 | + 15 min of MAP |
| — | Tue 11/3 | **ELECTION DAY — no class** | | | | |
| 20 | Thu 11/5 | Linear regression (inference, bootstrapping) | — | — | — | `sp26` 01_models §1 |
| 21 | Tue 11/10 | Logistic regression | — | — | `sp26` assignment_6 | `sp26` 01_models §2 |
| 22 | Thu 11/12 | Gradients | — | — | — | 🔴 **no source — notes written from scratch** |
| 23 | Tue 11/17 | Unconstrained optimization, 1-D | — | — | — | 🔴 **no source — written from scratch** |
| 24 | Thu 11/19 | …in many dimensions | — | — | — | 🔴 **no source — written from scratch** |
| 25 | Tue 11/24 | Constrained optimization; regularization | — | — | — | 🔴 **no source — written from scratch** |
| — | Thu 11/26 | **THANKSGIVING** | | | | |
| 26 | Tue 12/1 | Dynamic programming; backwards induction | `class_08/06_02` (**4 of 10 cells broken**) | same | jet engines §5–6 (**written**) | 🔴 **C-MAPSS data still missing** |
| 27 | Thu 12/3 | *(blank)* → **Bayesian inference** | — | — | — | **`sp26` 00_bayes §2 is a complete Bayesian lecture**; ⚠ needs `pymc` |
| 28 | Tue 12/8 | Review / wrap-up | — | — | — | 🔴 no source; ⚠ **no Dec 8 row in the spreadsheet** — confirm it's a class day |
| — | Thu 12/10 | **FINAL EXAM** 9–12 | | | | |

### What this schedule fixed

Two problems I'd flagged against the old docx **no longer exist**:

- **The ECDF is no longer homeless.** Session 05 covers categorical variables *and* the ECDF, so `class_06`'s opening line — *"In the last lecture, we introduced the ECDF"* — is true. It was only broken because the shifted docx split `class_05` down the middle.
- **Learning from Data is back**, so `class_05`'s five undefined uses of "unbiased estimator" and its citation of `V[X̄ₙ] = V[X]/n` now have a source two days earlier.

### What still needs building

1. 🔴 **Session 04 — the wages lab.** Unbuilt, and four later sessions lean on it. Full spec in the session file, §8. ~2–3 hours.
1b. 🔴 **Session 10 — the clinical-trials lab.** Doesn't exist, and neither does clinical-trials data. Cheapest fix: reuse `labs/class-10-bootstrap/` with a swapped `data.json` (~1 hour, mostly sourcing). It is a complete lab with a working autograder.
1c. 🔴 **Session 17 — the transition-matrix normalization.** One-line fix at `04_dynamics` cells 17 and 24; verified. Until then the simulation raises `ValueError` and the forecast isn't a distribution.
1d. 🔴 **`taxicab.pkl` is missing**, breaking exercises across sessions 16 and 17 and all of `assignment_5` part 4.
2. 🔴 **Session 07 — the Gaussian KDE code and formulas.** Broken; the schedule marks it optional, which contains the damage.
3. ⚠ **Session 08 — survival & hazard** is 5 cells. The schedule's own note calls this a place to *"slow down and spend time with CDF, KDE etc"*, so thin is partly deliberate — but the jet-engine lab needs its C-MAPSS data sourced.
4. ~~Session 12 — t-tests~~ **already in the material.** `10_2` cells 5–6 cover the t-distribution and a complete two-sample recipe, and they're the strongest cells in the notebook. Keep them.
4b. 🔴 **The midterm (Oct 8) is not written.** `sp26` has `practice_exam_1`, `practice_exam_2`, and `exam_topics`; `quizzes/` in this repo is empty. `CLAUDE.md` has printable scantron conventions if that's the format.
4c. 🔴 **The Dec 8 review session — a one-page formula sheet and a blank optimization-spine table.** ~2 hours, and the sheet is worth building early because it constrains how you write the final. Contents listed in session file `28`, §7.
5. 🔴 **The optimization block — sessions 22–25 (Nov 12 – Nov 24).** Four consecutive sessions with no source material anywhere: gradients, unconstrained optimization in 1-D and in many dimensions, and constrained optimization/regularization. This is the only remaining desert in the whole semester, and it is the block you flagged as your own weakest. Everything else in the second half is substantially written in `uu_sp26` and needs porting, not authoring.

### Optimal stopping — resolved

The spreadsheet says *"fixed horizons instead of doing optimal stopping — Cut"*, which matches where the jet-engine lab naturally splits. Its six sections divide at the right seam: §1–4 (failure clock, empirical survival & hazard, fixed-age replacement, myopic stopping) need **no dynamic programming**; §5–6 need backwards induction. Session 08 takes §1–4; §5–6 wait for a DP session if the second half gets one. **Blocker:** `labslop/08_optimal_stopping/prep_optimal_stopping.py` expects a NASA C-MAPSS zip that isn't in the repo, so the lab's first data cell will fail without it.

## Build order — calendar order

Notes are written in the order you'll teach them. Each file carries a **Look ahead** section flagging what to plant now because a later session needs it.

| # | Session | Date | Status |
|---|---|---|---|
| 01 | **Intro + setup** | Aug 25 | ✅ written |
| 02 | Data wrangling + EDA | Aug 27 | ✅ written |
| 03 | Probability & RVs + estimator vocabulary | Sep 1 | ✅ written |
| 04 | Vectors and inner product | Sep 3 | ✅ written |
| 05 | Categorical variables / indicator + ECDF | Sep 8 | ✅ written |
| 06 | CDF / PDF | Sep 10 | ✅ written |
| 07 | KDE: windowing/bandwidth, uniform kernel | Sep 15 | ✅ written |
| 08 | Survival function & hazard rate | Sep 17 | ✅ written |
| 09 | The sampling distribution | Sep 22 | ✅ written |
| 10 | Bootstrap hypothesis testing | Sep 24 | ✅ written |
| 11 | SE, Z-stats | Sep 29 | ✅ written |
| 12 | CLT (+ t-tests?) | Oct 1 | ✅ written |
| 13 | Midterm | Oct 8 | **not written** — see below |
| 14 | Joint density, independence | Oct 13 | ✅ written |
| 15 | Conditional density & expectation | Oct 15 | ✅ written |
| 16 | Empirical Markov chains | Oct 20 | ✅ written |
| 17 | Simulating Markov chains | Oct 22 | ✅ written |
| 18 | The likelihood function | Oct 27 | ✅ written |
| 19 | MLE | Oct 29 | ✅ written |
| 20 | Linear regression | Nov 5 | ✅ written |
| 21 | Logistic regression | Nov 10 | ✅ written |
| 22 | Gradients 🔴 | Nov 12 | ✅ written **from scratch** |
| 23 | Unconstrained optimization, 1-D 🔴 | Nov 17 | ✅ written **from scratch** |
| 24 | …in many dimensions 🔴 | Nov 19 | ✅ written **from scratch** |
| 25 | Constrained optimization; regularization 🔴 | Nov 24 | ✅ written **from scratch** |
| 26 | Dynamic programming; backward induction | Dec 1 | ✅ written |
| 27 | *(blank slot)* — Bayesian inference | Dec 3 | ✅ written |
| 28 | Review / wrap-up | Dec 8 | ✅ written |

**All 27 teaching sessions now have notes.** The only unwritten item is the midterm (13), which is an assessment rather than a session — see *What still needs building*, item 4b.


## Notes file schema

Every session file carries these sections, in this order:

1. **What students actually see** — video / guided notebook / activity / lab, and what goes on the board
2. **The content, from scratch** — the session's actual material, learnable from the notes alone, closing with a **Reading** block (see the source key above)
3. **The optimization view** — objective, argmin, how it's solved (the course-long spine)
4. **Assumptions that make it work** — each result paired with the assumption it needs
5. **Concrete failure cases** — where it breaks, with specific data or numbers
6. **Five questions students will ask** — with real answers, not gestures
7. **Bugs and simplifications in the material** — verified errors first, then approximations vs. falsehoods
8. **Delivery plan** — every step assigned a mode: notebook, pre-written instructor cells, board, or HTML widget, in sequence
9. **Look ahead** — what to plant now because a later week needs it, and what this session must set up
10. **Looking back** — what earlier session this leans on, so a shaky prerequisite is traceable
11. **Source map** — notebook and cell numbers this is built from
12. **Open questions** — honest flags to resolve with the co-instructor

Section 7 is worth its own warning: **the material has real bugs.** Week 1 alone has three that will break live in class. Every session file gets audited against the actual notebook JSON, and confirmed errors are reported as confirmed, with the cell number.

## Where these live

In this repo, because `CLAUDE.md` designates `~/Documents/GitHub/UU/` read-only and that repo is shared with your co-instructor. They're standalone markdown, so mirroring them into `uu_fa26/Proposed schedule/Week N/NOTES.md` is a `cp` away — say the word and I'll do it there instead.
