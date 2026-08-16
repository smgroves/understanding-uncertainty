# Week 2, Thursday (Sep 3) — Learning from Data

- **Schedule focus (F26_scheduling):** Learning from Data · concepts listed as *"RNG, sample mean as an estimator"*
- **Day type:** Lab / Coding Day
- **Pre-class video:** Learning from data → `uu_fa26/class_04/04_1_learning_from_data.ipynb` (18 cells)
- **Lab:** *"BUILD A LAB ON WAGES FROM TUESDAY"* — **does not exist.** Full spec in §8
- **Schedule margin notes:** *"variance of the sample mean derivation"*, *"unbiased estimators vs consistent estimators"*
- **Widgets:** `labs/activity-min-sum-squares/` (`viz-min-ss`), `labs/activity-unbiased-consistent/`, `labs/activity-standard-error/`
- **Also:** html `labs/class-04-rng/lecture.html` — covers both halves of `class_04`

> **This is the session everything from here to the midterm leans on, and it currently has no lab.** Sep 8 uses *unbiased estimator* five times without defining it and cites `V[X̄ₙ] = V[X]/n` as already derived. Sep 22 (the Sampling Distribution) *is* this material. Sep 29's standard error is `√(V[X̄ₙ])`. Oct 1's CLT is a theorem about the distribution of `X̄ₙ`. Four later sessions spend what today deposits.
>
> The video is eighteen cells of abstract estimator theory with no data and no code. That is a dry hour, and it is the reason the session was nearly cut. **The lab is the fix** — it makes every abstraction in the video something students watch happen on the wage data they already know.

---

## 1. What students actually see

| Artifact | File | Status |
|---|---|---|
| Pre-class video | `class_04/04_1_learning_from_data` (18 cells, all markdown) | exists; **cell 2 has a formula error (§7)** |
| In-class | walkthrough of the video's results, then straight into the lab | needs porting into `Week 2/` |
| Instructor cells | — | to build; the lab doubles as these |
| **Lab** | **none** | **the main build task of this session — §8 has a full spec** |
| Board | — | `E[X̄ₙ] = μ`, `V[X̄ₙ] = σ²/n`, unbiased vs. consistent |

**On RNG.** The schedule lists "RNG" among the concepts, and `class_04` has a second notebook (`04_2_random_number_generation`, 29 cells) covering seeding, generating from a uniform, die rolls, and simulation speed. Nothing between here and the midterm requires it. What the *lab* needs is only that students can call a sampler — `rng.choice`, `df.sample` — which is a two-minute demonstration, not a session. **Recommendation: use `04_2` as optional pre-class reading, and spend class time on the estimator material and the lab.** The one piece worth lifting into the lab is seeding, so their results reproduce.

---

## 2. The content, from scratch

The video answers one question — *why do we compute the sample mean at all?* — and in doing so installs the vocabulary the rest of the course runs on.

### Parameter, statistic, estimate

Three words that students routinely blur, and the distinction is the whole session:

- A **parameter** is a fixed, unknown property of the *process*. `E[X] = Σ p(x)·x` is a number that exists out in the world whether or not you ever collect data. Conventionally Greek: `μ`, `σ²`, `p`.
- A **statistic** is any function of the *data*. `X̄ₙ = (1/n)Σxᵢ` is computable from your sample and would come out differently with a different sample.
- An **estimate** is a statistic you're using to *target* a parameter. `X̄ₙ` as an estimate of `μ`. The hat notation — `μ̂` — means "this statistic is aimed at that parameter."

The move that makes it click: **a parameter is a constant you can't see, and a statistic is a random variable you can.** Every question in the rest of the course is about the relationship between the two.

### Why the sample mean?

The video's cell 4 answers this properly rather than by appeal to habit. Suppose you must predict the next draw of `X` with a single number `x̂`, and you're charged squared error `(X − x̂)²`. You don't know the process, but you have the sample, so minimize mean squared error *on the sample*:

```
minimize over x̂:   (1/n) Σᵢ (xᵢ − x̂)²
```

Setting the derivative to zero, `(1/n) Σᵢ 2(xᵢ − x̂) = 0`, gives

```
x̂ = (1/n) Σᵢ xᵢ = X̄ₙ
```

**The sample mean is not a definition — it is the answer to a minimization problem.** This is Week 1 Tuesday's box arriving with a purpose, and the video is explicit that it won't always work out this conveniently: *"this won't be true for everything we want to estimate."*

Given the cohort, do this as a **grid search first** (§8 lab, §5) — scan candidate `x̂` values, plot the parabola, watch it bottom out — and only then show the derivative. The picture is the proof they'll remember.

### i.i.d.

**Independent and identically distributed.** Two separate claims: each observation comes from the same process (identical), and no observation tells you anything about another (independent). It's worth separating them today because they do different work — unbiasedness needs only *identical*, and the variance formula needs *both*. That split recurs on Sep 8.

### The two results

**Unbiasedness.** By linearity of expectation, which they have from Tuesday:

```
E[X̄ₙ] = E[(1/n) Σ Xᵢ] = (1/n) Σ E[Xᵢ] = (1/n) · n · μ = μ
```

Three lines and it needs no independence. In words: **across repeated samples, the sample mean lands on the truth on average.**

**Variance — "the grueling part."** The video's own phrase, cells 12–15. The route:

```
V[X̄ₙ] = E[X̄ₙ²] − (E[X̄ₙ])² = E[X̄ₙ²] − μ²
```

The work is `E[X̄ₙ²]`. Expanding the square gives `n` terms where `i = j` and `n² − n` terms where `i ≠ j`. Independence makes the cross terms factor, `E[XᵢXⱼ] = E[Xᵢ]E[Xⱼ] = μ²`:

```
E[X̄ₙ²] = (1/n²)( n·E[X²] + (n² − n)·μ² )
        = (1/n)( E[X²] − μ² ) + μ²
        = V[X]/n + μ²
```

Subtract `μ²` and you're done:

```
V[X̄ₙ] = V[X]/n = σ²/n
```

**This is the single most-used result in the first half of the course.** It says the spread of the sample mean shrinks like `1/n`, so its standard deviation shrinks like `1/√n`.

Worth saying out loud, because it's the practical form: **quadruple the sample, halve the error.** And it's why the counting step in the lab matters — the formula is easy to nod at and hard to believe until you watch it hold.

### Unbiased vs. consistent

The schedule's margin note asks for this explicitly, and the video doesn't cover it. Two different promises:

- **Unbiased**: `E[θ̂] = θ` for *every* `n`. Correct on average, at any sample size.
- **Consistent**: `θ̂ → θ` as `n → ∞`. Correct eventually, in the limit.

Neither implies the other. `X̄ₙ` happens to be both. But an estimator can be:

- **unbiased and not consistent** — "just use `x₁`" has `E[x₁] = μ` for every `n`, and its variance never shrinks. It is right on average and useless.
- **biased and consistent** — Week 4's KDE, whose bias vanishes only as `h → 0`.

The pairing to give them: unbiasedness is about the *centre* of the sampling distribution, consistency is about its *width* collapsing. `X̄ₙ` is centred at `μ` (unbiased) with width `σ/√n` → 0 (consistent). `labs/activity-unbiased-consistent/` is built for exactly this contrast.

### What learning is

The video's cell 10 gives a four-step framing worth putting on the board, because the lab walks it end to end:

1. Observe a process.
2. Posit a model of it.
3. Find a loss function whose minimizer is a statistic. *(squared error → the sample mean)*
4. Analyze how that statistic behaves as a function of the data. *(unbiased; variance `σ²/n`)*

*"The rest of ML is just making the model more complicated."* That's an overstatement, and it's a productive one — with ML running concurrently rather than before, this may be the first time these students see the shape of the whole enterprise.

---

### Reading

*Key in `README.md`. From `Reading-Roadmap.md` unless marked [Map] (= `prep/ds5030_syllabus_reading_map.pdf`).*

- **Primary** — **AoS Ch. 6** (Models, Statistical Inference and Learning). **B&H Ch. 6, §6.3**, *"Sample moments"* (p. 252) — defines the sample mean and variance explicitly *as estimators of the true moments*, which is precisely this session's framing.
- **Supporting** — **AoS Ch. 3** (Expectation): the variance-of-the-mean proof this session walks through is exactly Ch. 3's machinery. **B&H Ch. 10, §10.2**, law of large numbers (p. 431).
- **Fuller treatment** — **C&B Ch. 5**, *Properties of a Random Sample*, §5.1–5.2 — proves the sample mean's unbiasedness and variance from first principles. If the "grueling part" needs a second pass, this is it.
- **Intuition first** — **G&S Ch. 8**, organized around its own guiding question: *why does long-run averaging work?* — asked ahead of any variance-of-the-mean algebra.
- **Visuals for class** — **G&S Fig. 8.1** (Bernoulli trials distributions) and **Fig. 8.2** (Law of Large Numbers, uniform case): the sample mean's own distribution narrowing as `n` grows. That is the wages lab's §3 and §4 in a textbook figure — worth showing *after* they build it, as confirmation.

---

## 3. The optimization view

- **Objective:** mean squared prediction error on the sample, `(1/n) Σᵢ (xᵢ − x̂)²`
- **Argmin:** the sample mean `X̄ₙ`
- **Solved by:** closed form (set the derivative to zero) or grid search (scan `x̂` and watch it bottom out)

Week 1 Tuesday had this same box for describing data. Today it's for **predicting** — and that reframing is what makes the mean an estimator rather than a summary. Same argmin, different job.

The second half of §6 in the lab does the companion move: swap squared error for absolute error and the argmin becomes the median. On wage data the two are far apart, which makes the choice of loss function visibly consequential rather than cosmetic.

---

## 4. Assumptions that make it work

| Claim | Assumption |
|---|---|
| `X̄ₙ` is the argmin of sample MSE | None. Pure algebra on the sample |
| `E[X̄ₙ] = μ` | **Identically distributed** only. Independence not needed |
| `V[X̄ₙ] = σ²/n` | **Independent *and* identically distributed.** The cross-term step is where independence enters |
| `μ` and `σ²` exist | Finite mean and variance. Not automatic — see §5 |
| `X̄ₙ` is consistent | Finite variance plus i.i.d. (formally the WLLN, which arrives later) |
| Unbiased ⟹ good | **False.** See §5 and §6 Q4 |

The i.i.d. split in rows 2 and 3 is the most teachable line in the table, and it is the first time in the course that the two halves of "i.i.d." do visibly different jobs. Point at exactly where independence gets used — the `E[XᵢXⱼ] = μ²` step — so the phrase stops being an incantation.

---

## 5. Concrete failure cases

**Correlated observations break the variance formula but not unbiasedness.** Survey five people in one household and `X̄ₙ` is still unbiased, but its variance is far larger than `σ²/n`. Every standard error built on the formula is then too small, and every confidence interval too narrow. This is *exactly* the ACS `PWGTP` clustering issue from Tuesday, seen from the variance side, and the lab's §7 makes it concrete.

**Unbiased and useless.** The estimator "report `x₁`, ignore the rest" is perfectly unbiased and has variance `σ²` regardless of `n`. It shows that unbiasedness alone is a weak guarantee, and it takes ten seconds to state.

**No mean to estimate.** A Cauchy-distributed variable has no finite mean, and `X̄ₙ` never settles — averaging more data doesn't help at all. Worth thirty seconds because everything today assumes `μ` and `σ²` exist, and Week 4's CDF/PDF session meets the counterexample properly.

**Wage data has a long right tail**, so `X̄ₙ` on a small sample is unstable and skewed — the sampling distribution at `n = 10` is visibly not symmetric. That's a feature for the lab: it means students *see* that "the sampling distribution is bell-shaped" is a claim that needs `n`, which is precisely what the CLT will assert on Oct 1.

**Unbiased for the wrong parameter.** The unweighted `X̄ₙ` is a flawless estimator of the unweighted population mean — which, because ACS oversamples by design, is not the average wage in DC. An estimator can be perfect and still answer the wrong question. This is the most sophisticated idea available in the first month and the data is already on their laptops.

---

## 6. Five questions students will ask

**Q1. "What's the difference between the sample mean and the expectation? They look like the same formula."** They are the same *shape* and different *objects*. `E[X] = Σ p(x)·x` weights each possible value by its probability — it's a property of the process, a fixed number you can never compute because you don't know `p`. `X̄ₙ = (1/n)Σxᵢ` weights each *observed* value by `1/n` — it's a property of your data, computable, and different every time you sample. The `1/n` is the giveaway: it's the empirical stand-in for "each observation was equally likely." One is the truth; the other is your best guess at it.

**Q2. "Why does the variance have `n` in the denominator but the mean doesn't?"** Because averaging cancels errors. Individual observations scatter with variance `σ²`; when you average `n` of them, the ones above `μ` partly offset the ones below, and the offsetting is what shrinks the spread. It requires independence — that's exactly where the derivation uses it, at the `E[XᵢXⱼ] = μ²` step. If observations were perfectly correlated, averaging would cancel nothing and the variance would stay `σ²`. The centre doesn't move because averaging unbiased things is still unbiased; only the *spread* improves.

**Q3. "If it's unbiased, why is my answer wrong?"** Because unbiased is a statement about the *average across many hypothetical samples*, not about yours. Your `X̄ₙ` is one draw from a distribution centred on `μ` with standard deviation `σ/√n`. Being unbiased means the distribution is centred correctly; it says nothing about how far your particular draw fell from the centre. That's what `σ/√n` is for, and it's why reporting an estimate without a standard error is reporting half the answer.

**Q4. "Is unbiased always what we want?"** No, and this is the question worth planting today even though it pays off later. Consider "always report `x₁`" — unbiased for every `n`, and its error never shrinks. Or the sample median on skewed data — biased for `μ`, but much less variable. What you actually care about is total error, `MSE = bias² + variance`, and a little bias buys a lot of variance reduction surprisingly often. Week 4's KDE is the first estimator in this course that is deliberately biased. §6 of the lab has them find this empirically rather than take it on faith.

**Q5. "If we need `σ²` to compute `σ²/n`, and we don't know `σ²`, what good is the formula?"** Correct catch, and it's the right instinct. In practice you estimate it: replace `σ²` with the sample variance `s²` and get `s²/√n`, the **standard error**. That's Sep 29's topic. Two things follow: the standard error is itself an estimate with its own uncertainty, and the `n−1` question from Week 1 finally has a reason to exist — using `s²` to estimate `σ²` is where the correction earns its keep.

---

## 7. Bugs and simplifications in the material

### Verified

- **`m(X) = Σᵢ xᵢ` is missing its `1/n`** — cell 2, inside the definition of a *statistic*. As written the "sample mean" is the sum. It's in the cell that defines parameter/statistic/estimate, i.e. the cell the next four sessions depend on.
- **Cell 3 conflates two different objects.** It asks for the relationship between "sample variance `V[X̄ₙ]`" and "process variance `V[X]`". But `V[X̄ₙ]` is the variance *of the sample mean*, not the sample variance `s²`. Those are different — one shrinks with `n`, one doesn't — and both matter within three weeks.
- **Cell 16 is an unfinished exercise.** "Sample Covariance Exercise?" opens `E[s_xy]`, expands one line, and stops. Cell 17 is empty.
- **`alignat*` blocks** in cells 13–15 — the same MathJax fragility as Weeks 1–3. These wrap the grueling derivation; check they render before recording.

### Simplifications

- **i.i.d. is used before it's isolated.** The derivation invokes independence at the cross-term step without flagging that unbiasedness didn't need it. One sentence fixes it and sets up Sep 8.
- **"The rest of ML is just making the model more complicated"** (cell 10) is a useful overstatement. Fine to say; don't defend it.
- **Consistency is never defined**, though the schedule's margin note asks for unbiased vs. consistent. §2 has the contrast; it needs to go somewhere in the material.
- **The MSE minimization uses a derivative** (cell 4) with the parenthetical "this is just a discrete version of finding the minimum, which is where the derivative = 0". For this cohort that parenthetical is doing far too much work. Lead with the grid search.

---

## 8. Delivery plan

**Modes:** 🟦 notebook (student copy) · 🟩 instructor cells (pre-written, never live) · ⬛ board · 🟨 HTML widget

| # | Step | Mode | Time | Notes |
|---|---|---|---|---|
| 1 | Parameter / statistic / estimate | ⬛ board | 5 min | Three words, one line each. **A parameter is a constant you can't see; a statistic is a random variable you can** |
| 2 | Why the sample mean? | 🟨 widget | 4 min | `activity-min-sum-squares/index.html#widget` — scan `c`, watch the sum of squares bottom out. Grid search *before* the derivative |
| 3 | i.i.d., both halves named | ⬛ board | 2 min | Identical vs. independent. Flag that they'll do different jobs |
| 4 | `E[X̄ₙ] = μ`, derived | ⬛ board | 4 min | Three lines of linearity. Note: no independence used |
| 5 | `V[X̄ₙ] = σ²/n`, derived | ⬛ board | 10 min | The grueling part. **Point at the exact step where independence enters.** Say "quadruple the sample, halve the error" |
| 6 | Unbiased vs. consistent | ⬛ board | 4 min | Centre vs. width. The "always report `x₁`" example |
| 7 | The four steps of learning | ⬛ board | 2 min | Cell 10. Then say the lab is these four steps |
| 8 | **Lab** | 🟦 notebook | rest | Spec below |

**Build cost: the lab (~2–3 hours), and it is the whole build task for this session.**

### The lab — "If the Census had knocked on different doors"

Extends Tuesday's DC PUMS wage activity. Ship as `lab_04_blank.ipynb` / `lab_04_filled.ipynb`, matching the Week 1 convention.

**Hook.** On Tuesday you computed the average wage in DC from a sample. If the survey had reached different households, would you have gotten a different number — and how different?

**§0 — Setup.** Reload Tuesday's extract; restrict to actual earners (`ESR ∈ {1,2}`, `WAGP > 0`). Reuses Tuesday's conditioning discovery rather than re-explaining it. Set a seed and say why.

**§1 — Manufacture a world where you know the truth.** Treat the full extract as *the population*. Compute `μ = WAGP.mean()` and `σ² = WAGP.var()` over every row; label them **parameters**. This is the move the lab rests on: normally `μ` is invisible, so you can never check an estimator. Here you build a world where you can.

**§2 — One sample.** Draw `n = 100` rows, compute `X̄`. It misses `μ`. Change the seed, draw again — different answer. *The statistic has a distribution.*

**§3 — Two thousand samples.** Loop, collect 2000 values of `X̄`, histogram them. Then check both board results against the picture, printing each side of each equation next to the other:
- centre of the histogram ≈ `μ` → **unbiasedness, verified**
- variance of the 2000 values ≈ `σ²/n` → **the grueling derivation, verified**

This comparison is the point of the lab. It is also, though nobody says so yet, a **sampling distribution** — built three weeks before the session named after one.

**§4 — The `1/√n` law.** Repeat §3 at `n = 10, 25, 100, 400, 1600`. Plot `sd(X̄)` against `n`, then against `1/√n` — a straight line. Quadruple the sample, halve the spread.

**§5 — Why the mean at all?** Grid-search the argmin: scan candidate `c`, plot `(1/n)Σ(xᵢ−c)²`, watch it bottom out at `X̄`. Then swap in `Σ|xᵢ−c|` and watch it land on the **median** instead. On wage data the two are far apart — long right tail — so Week 1's lesson pays off visibly, with no calculus anywhere.

**§6 — An estimator that fails.** Run the sample *median* through §3's machinery as an estimator of the population *mean*. On skewed wage data it is badly biased — and has **lower variance**. Compute `MSE = bias² + variance` for both and let them discover that unbiased ≠ better.

**§7 — Unbiased for the wrong thing (optional).** `PWGTP`. The unweighted `X̄` is unbiased for the unweighted population mean, which is not DC's average wage. An estimator can be flawless and answer the wrong question.

**Why this lab.** It walks the video's own four steps on one dataset students already know, and it front-loads four later sessions: Sep 22's sampling distribution is a callback, Sep 24's bootstrap is "do §3 when you *can't* resample the population," Sep 29's standard error is §4's slope, and Oct 1's CLT is a claim about §3's histogram shape.

---

## 9. Look ahead

- **§3's histogram is Sep 22's entire topic.** Build it today and that session opens with "you already made one of these."
- **Sep 24's bootstrap is §3 with a constraint.** The bootstrap resamples *your sample* precisely because you can't resample the population — which is only a meaningful move once §1's "pretend we know `μ`" trick has been seen and then taken away.
- **Sep 29's standard error is `√(V[X̄ₙ])`** — this derivation, square-rooted, with `s` in place of `σ`. §4's plot is what it means.
- **Oct 1's CLT** is a theorem about the *shape* of §3's histogram. Notice today that at `n = 10` on skewed wage data it is visibly not symmetric, and at `n = 1600` it is. That observation is the CLT, four weeks early and undeclared.
- **Sep 8 spends this immediately**: `E[p̂] = p` and `V[p̂] = p(1−p)/n` are today's two results with indicators substituted in, and `E[F̂ₙ] = F`, `V[F̂ₙ] = F(1−F)/n` are the same again for the ECDF.
- **Unbiased vs. consistent separates properly at Sep 15's KDE**, the first deliberately biased estimator in the course. Today defines the pair; Sep 15 needs it.
- **The `n` vs `n−1` question from Week 1 finally has a reason** — see §6 Q5. It becomes necessary at Sep 29, not before.

## 10. Looking back

- **Tuesday (Sep 1) supplies every tool.** Linearity of expectation gives unbiasedness; `V[X] = E[X²] − E[X]²` is the first move of the variance derivation. Today is Tuesday's algebra pointed at a new question.
- **Tuesday's census activity is the lab's dataset**, and its `PWGTP` discussion is §7. The lab is a direct extension, which is the whole reason it works — no new data, no new domain, all the effort on the new idea.
- **Week 1 Tuesday's mean-as-argmin** returns in §5 with a different purpose: describing data becomes predicting the next draw.
- **Week 1 Tuesday's mean-vs-median on long tails** is §5's second half, now as a choice of loss function rather than a choice of summary.

---

## 11. Source map

- `class_04/04_1_learning_from_data.ipynb` — 18 cells, all markdown. Generating processes (1), **parameter/statistic/estimate (2, formula bug)**, learning from data (3, conflation bug), **sample mean as MSE argmin (4)**, i.i.d. (5), `E[X̄ₙ]` (6), `V[X̄ₙ]` (7), behaviour of the estimator (8), what is learning (10), **the full `V[X̄ₙ] = V[X]/n` derivation (12–15)**, unfinished covariance exercise (16), empty (17).
- `class_04/04_2_random_number_generation.ipynb` — 29 cells. Optional; see §1.
- Widgets: `activity-min-sum-squares/` (`viz-min-ss`), `activity-unbiased-consistent/`, `activity-standard-error/`, `activity-bessel-correction/` — all standalone pages, all relevant today.
- html `labs/class-04-rng/lecture.html` — both halves of `class_04` in prose, with `viz-mse` (minimize squared error on 40 patient ages) and `viz-speed`.
- Data: Tuesday's PUMS extract. **Ship `data.csv` in the repo** rather than re-fetching — the lab draws 2000 samples and nobody should be hitting the Census API for that.

## 12. Open questions

- **Who builds the lab, and by when?** It's the only unbuilt artifact between here and Sep 15, and four later sessions lean on it. §8 has a complete spec; ~2–3 hours.
- **Does `04_2` (RNG) get assigned at all?** Recommendation in §1: optional pre-class, with only seeding lifted into the lab. Worth confirming, since the schedule lists RNG as a concept for this date.
- **Is the video re-recorded or reused?** Cell 2's missing `1/n` and cell 3's conflation are both in cells the next four sessions depend on. Fix before recording either way.
- **Should consistency be added to the video or held for class?** The schedule's margin note asks for unbiased vs. consistent, and the video doesn't have it. §2 has the contrast; `activity-unbiased-consistent` is built for it.
- **How big is the PUMS extract?** §1's "treat the full extract as the population" needs enough rows that sampling 1600 from it is still meaningfully a sample. DC-only PUMS should be tens of thousands, which is fine — worth confirming before the lab is written.
