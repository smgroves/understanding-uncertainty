# Understanding Uncertainty — Proposed Weekly Structure

*A planning document, not a change to the site. Synthesizes the Slack discussion between Sarah and her co-instructor, the learning-science reasoning from our chat, and everything actually built so far (lectures, Pre-Labs, and the six in-class activities pulled from `labslop/` and the class folders). Nothing here has been written into `schedule.html` or any lab page — this is a proposal to react to, not a fait accompli.*

---

## 0. The two styles aren't in tension — they're two days

Terence's model: *lecture from a notebook, pop onto the board during class.* Sarah's model: *follow a set of notes with activities mixed in.* The resolution isn't picking one — it's that **Tuesday is Sarah's style and Thursday is Terence's style**, and the reason that isn't arbitrary is that they suit different cognitive work:

- **Tuesday** is where a first-year master's student needs board work, pair-share, and discussion — processing a *new idea* for the first time benefits from talking about it before typing it. Low code load on purpose.
- **Thursday** is where the same student needs to *build something* — a notebook, real data, a lab that doesn't have one clean right answer. Code-heavy on purpose, because by Thursday the concept from Tuesday is no longer brand new.

That's the whole shape. Everything below just fills it in with the content we actually have.

---

## 1. The weekly rhythm (the template)

| | Tuesday | Thursday |
|---|---|---|
| **Opens with** | 5-min quiz on **last week's** material (spaced retrieval, not this week's brand-new video) | New/harder material, building on video 2 |
| **Body** | Discussion + pair-share + board work, anchored to video 1. Low code. Introduce this week's lab as a *framing* problem — what decision are we making, what does the data look like, what's the modeling choice — with little or no code yet. | Code-heavy build-out of the lab, using both days' concepts. Instructor walks a notebook; students extend it. |
| **Closes with** | Lab framing is now "open" for the week | Lab is now mid-flight; class time to work on it together |
| **Homework due** | Video 1 + its autograded floor-practice problem set (MC, ~30 min, done over the weekend) | Video 2 + its floor-practice problem set |
| **Lab due** | — | — (started here) → **due the following Wednesday night** |

### Why the lab is due the *following* Wednesday, not that Friday

This is the fix for the "Tuesday-to-Thursday gap is tight" problem Sarah flagged — but it's tight for a different reason than lab deadlines. The tight part is **video 2 plus its problem set landing in a 2-day window** (Tue class → Thu class). The lab itself gets slack: introduced Thursday, worked over the weekend and into the following week, due Wednesday night — six days, not two.

That timing also solves a problem we found in our own earlier discussion: with two open-ended, ill-posed labs live at once (last week's unfinished, this week's just started), students carry two unresolved "open loops" simultaneously — a real cognitive load, independent of raw hours (the Zeigarnik effect). Wednesday-night-due means last week's lab **closes one day before** this week's opens Thursday. There is only ever one open lab at a time.

### Why the quiz reviews *last* week, not this week

Testing effect plus spacing: retrieving something a week after you learned it is far more durable than retrieving it the day after. It also makes the quiz genuinely low-stakes as a *content* check — nobody's being tested on a video they watched two days ago, they're being asked "did last week's idea stick," which is a fairer and more useful question. Terence's own example prompts already have this shape ("compute the t-ratios for N=50 and N=100 — why is one significant and not the other?" tests standard-error scaling from a week or two back, not that day's video).

### What's near-zero-stakes vs. what's real

This matters for the "too much assessment for master's students" worry from earlier in our conversation. Per week, there are exactly **two** things with real grading weight (the quiz, lightly, and the lab, seriously) and **two** things that are closer to a habit than an assessment (the two floor-practice problem sets, autograded MC, no partial credit to agonize over). The lab is the one place real grading effort goes, and it's produced partly in class, not entirely as homework.

---

## 2. Open decisions (please just pick, per your own note — these are the ones actually left)

1. **One lab per week, or two?** Sarah's message trails off on this ("I like having two labs thoughts?"). Everything below assumes **one**, tied to the pair of videos for that week. If you want a second, smaller lab-like artifact, the natural candidate is making Tuesday's "framing" half itself lightly gradable (e.g., a one-paragraph modeling-choice writeup), rather than a fully separate lab.
2. **Is Tuesday's lab-framing graded at all?** Proposal: no — it's participation/completion, folded into the quiz's low-stakes bucket, not a second grade.
3. **Quiz format**: Terence's examples are short-answer/computation, not multiple choice. That's a heavier grading lift than the autograded homework. Worth deciding if TAs grade these or if they stay ungraded/completion-only, the way the original "commitment device" framing suggested.
4. **Project weeks**: both project days currently eat the *entire* week (no paired Tuesday/Thursday lecture content that week). Recommend explicitly carving 30–45 minutes out of each project day for lightning talks, since that's what got dropped last time and both of you have said students got a lot out of it.

---

## 3. The full semester, week by week

Legend: **✓ built** = a real lecture and/or Pre-Lab already exists on the site. **✓ activity built** = one of the six `labslop`/class-folder notebooks has been turned into a real in-class-activity page this session, with verified real numbers. **GAP** = nothing built yet; this is where development time should go next.

Where a week's pairing changed from the current `schedule.html` order, the reason is in the Change column — nothing moved without a reason tied to Sarah's "does Tuesday actually lead into Thursday" test.

| Wk | Tue | Thu | Lab / activity | Change from current schedule |
|---|---|---|---|---|
| 1 | Aug 25 — Intro, environment setup | Aug 27 — Data wrangling & EDA ✓ built | **Foreign Gifts** ✓ activity built (groupby, sort, Sankey flow) | None — already the natural onboarding pair. No quiz this week (nothing to review yet). |
| 2 | Sep 1 — Vectors & the inner product ✓ built | Sep 3 — Covariance as the statistical dot product (same lecture, Part 2) | **Lyric Vectors** ✓ activity built (dot product vs. cosine, TF-IDF, real MSD data) | **Changed.** Currently Tue=Vectors, Thu=Probability Axioms — the exact mismatch Sarah flagged. Now both days stay inside vectors/inner-product, so the lab (pure linear algebra) actually uses *both* days instead of only Tuesday's. Probability moves to Week 3. |
| 3 | Sep 8 — Probability axioms & random variables ✓ built | Sep 10 — Learning from data: RNG, the sample mean as an estimator ✓ built | Pre-Lab 04 (`rng.html`) ✓ built | **Changed** (pushed back one slot by Week 2's swap). Axioms → "now let's simulate from one" is a clean throughline. |
| 4 | Sep 15 — Categorical variables & the ECDF ✓ built | Sep 17 — The CDF; inverse-transform sampling ✓ built | **Generating CDFs** ✓ activity built (9 mini-labs, ECDF vs. named CDFs) | **Changed** (pushed back one slot). "Indicator → proportion → ECDF" into "the CDF, and how to sample from one" is the same logical step the current lecture pages already make — this just gives it a matching in-class lab. |
| 5 | Sep 22 — KDE: windowing & bandwidth ✓ built | Sep 24 — Survival function & hazard rate | **Optimal Stopping** ✓ activity built (jet-engine hazard rates, myopic vs. dynamic replacement) | **Changed.** Currently these two topics sit five days apart with nothing between them. Hazard-rate estimation *is* a density-estimation problem — KDE Tuesday, hazard/survival Thursday is a tighter conceptual pair than either topic's current neighbor, and it comes with a fully-built lab already. |
| 6 | Sep 29 — WLLN & Monte Carlo ✓ built | Oct 1 — Sampling distributions → Bootstrap → the CLT ✓ built | Pre-Lab 10 (`bootstrap.html`) ✓ built | **Changed.** WLLN moves here from its old Thursday slot; the sampling-distribution/bootstrap/CLT block (already one continuous built lecture) consolidates onto one Thursday instead of spanning two separate class days. |
| 7 | *Oct 6 — Reading Day (no class)* | Oct 8 — **Project 1**: clinical-trials meta-review | Project day | Unchanged. Recommend blocking real talk-time this time. |
| 8 | Oct 13 — Joint density, bivariate normal ✓ built | Oct 15 — Conditional distribution & expectation ✓ built | **Portfolio Optimization** ✓ activity built (CARA-normal, analytic vs. Monte Carlo, real ETF data) | None — already a natural pair, already the current schedule's own lab. |
| 9 | Oct 20 — Empirical Markov chains | Oct 22 — Simulating Markov chains | **VA County Power Outages** ✓ activity built (independent vs. spatial-contagion outage models, early-warning policy) | None — already coherent, already matches. **Note:** neither day has a formal built lecture yet (class_08/Markov content was never written up as its own lecture page) — the activity currently *is* the primary built material for this week. |
| 10 | Oct 27 — The likelihood function ✓ built | Oct 29 — MLE & gradient descent ✓ built | **GAP** | None in pairing (already coherent). No lab built. `labslop/04_censoring_and_identification` (Census wage data, real and present on disk) is a plausible candidate once its narrative is fleshed out — right now it's data + code with no framing. |
| 11 | *Nov 3 — Election Day (no class)* | Nov 5 — Linear regression: inference & bootstrapping | **GAP** | Lone Thursday, no paired Tuesday this week (holiday ate it). No lab built; group-work text ("hedonic pricing") exists only as a description, not a page. |
| 12 | Nov 10 — Logistic regression: inference & bootstrapping | Nov 12 — **Project 2**: epidemiology & ABM | Project day | Unchanged. |
| 13 | Nov 17 — Unconstrained optimization | Nov 19 — Gradient & Hessian, FONC/SOSC | **GAP** | No lab built yet for this pairing. |
| 14 | Nov 24 — Constrained optimization; the Lagrangian | *Nov 26 — Thanksgiving (no class)* | — | Lone Tuesday, no paired Thursday (holiday). |
| 15 | Dec 1 — Dynamic programming: backwards induction | Dec 3 — DP: value functions & Bellman equations | **Callback, not a gap** — revisit **Optimal Stopping**'s own Q5 (the full backward-induction solve) at deeper rigor. No new content needed. | None. |
| 16 | Dec 8 — Bandit problems | *(semester ends)* | **GAP** | Lone Tuesday, no lab built. |
| — | Dec 10–11 — Comprehensive final | | | Unchanged; already designed as a low-effort accountability check, per our earlier discussion — no change recommended. |

---

## 4. What's actually built vs. what still needs development

**Fully built** (lecture + Pre-Lab, or lecture + in-class activity): Weeks 1–6, 8, 9, 15 (via callback). That's 9 of 16 weeks with real, verified material already sitting on the site.

**Partially built** (lecture exists, no lab/activity yet): Week 10 (Likelihood/MLE).

**Needs real development**: Weeks 9's formal Markov-chain lecture (the activity covers the *application*, not the CDF/PMF-style formal treatment the other weeks have), Weeks 11, 13, 16 — linear regression, constrained/unconstrained optimization, and bandit problems have no lecture, Pre-Lab, or in-class activity at all yet. That's the honest gap list: roughly a third of the term's content is schedule placeholder text, not built material.

**Raw material sitting unused**: `labslop/04_censoring_and_identification` (Census wage data, real and on disk, needs narrative) is the one activity notebook we found that's data-ready but not yet a real activity — a natural next build for Week 10's gap.

---

## 5. One-paragraph summary if you just want the decision

Tuesday is discussion/board/pair-share anchored to video 1, low code, and opens that week's lab as a framing problem. Thursday is code-heavy, anchored to video 2, and is where the lab actually gets built. The lab is due the following Wednesday night, which gives six days instead of two and guarantees only one lab is ever open at once. The quiz each Tuesday reviews *last* week, not the new material, because that's the actual spacing/testing-effect mechanism worth using. Five of the eleven original weekly pairings got reordered so that each week's lab uses both days' content instead of only one — vectors no longer gets orphaned next to probability. Nine of sixteen weeks already have real, built material; the rest is the honest to-do list for next.
