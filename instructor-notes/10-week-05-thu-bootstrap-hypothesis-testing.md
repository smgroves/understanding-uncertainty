# Week 5, Thursday (Sep 24) — Bootstrap Hypothesis Testing

- **Schedule focus (F26_scheduling), verbatim:** *"Bootstrap Hypothesis Testing (hypothesis/CI/p-value with z-statistics: normalizing the bootstrap analysis illustrates the CLT, basically)"*
- **Day type:** Lab / Coding Day
- **Pre-class video:** *blank in the spreadsheet*
- **In-class:** *blank in the spreadsheet* — content is `class_10/09_2_intro_to_bootstrap.ipynb` cells 6–9, plus `class_11/10_1_bootstrap_inference.ipynb` cells 0–2 if you take the Z-statistics today
- **Lab:** *"bootstrapping lab with some example: clinical trials lab"* — 🔴 **does not exist.** See §8 for what does
- **Widgets:** `labs/class-10-bootstrap/bootstrap.html` — sections `#ci`, `#se`, `#hypothesis-testing`
- **Also:** `labs/class-10-bootstrap/` is a **complete built lab with an autograder** — `bootstrap.py`, `test_bootstrap.py`, `sampler.py`/`.js`, `NOTES.md`

> **There is an ordering problem worth deciding before you build anything.** Today is *"hypothesis testing with z-statistics"*, and Sep 29 is *"SE, Z-stats"* — but the standard error and the Z-statistic are **prerequisites** for the standardized version of a hypothesis test, not consequences of it. As scheduled, today would use machinery that arrives next Tuesday.
>
> **There is a clean fix and it needs no reordering.** Bootstrap hypothesis testing has a percentile form that requires no standardization at all: build the interval, ask whether the null value is inside, count how many replicates are more extreme than your estimate. That's `09_2` cells 6–9 and it needs nothing you don't already have. Then Sep 29 *standardizes* it, which is what makes the CLT visible. §12 lays out both options; this file leads with the percentile form.

---

## 1. What students actually see

| Artifact | File | Status |
|---|---|---|
| Pre-class video | none listed | consider `09_2` cells 6–9 as reading |
| In-class | `09_2` cells 6–9 (CI, hypothesis testing, interpretation) | **all markdown, no code** |
| Instructor cells | — | to build |
| **Lab** | *"clinical trials lab"* | 🔴 **does not exist anywhere in either repo** |
| Board | — | The percentile CI, the null-in-interval test, the bootstrap p-value |

**On the lab.** I searched both repos: there is no clinical-trials lab, and no clinical-trials data. What *does* exist is `labs/class-10-bootstrap/` — a complete Touch→Derive→Build lab with a live demo, a `#hypothesis-testing` section, an assignment template where students implement `resample` and `bootstrap_ci`, and `test_bootstrap.py` as a working local autograder. It runs on 92 Charlottesville used-car prices rather than a clinical trial. §8 discusses using it as-is versus swapping the dataset.

---

## 2. The content, from scratch

Tuesday built the bootstrap distribution. Today turns it into three things people actually report: an interval, a decision, and a p-value. None of it requires new machinery — it's all quantiles and counting.

### The percentile confidence interval

You have `B` replicates `[Ŝ_1, …, Ŝ_B]`. Sort them and cut off the tails:

```
level α        interval
0.10           (q₀.₀₅ , q₀.₉₅)      90%
0.05           (q₀.₀₂₅, q₀.₉₇₅)     95%
0.01           (q₀.₀₀₅, q₀.₉₉₅)     99%
```

In general: report `(q_{α/2}, q_{1−α/2})`. That is Sep 10's quantile function applied to the bootstrap sample, and nothing more. **`α` is called the level.**

### The interpretation, and the thing it is not

This is the most-misstated idea in statistics and it is worth being slow and pedantic about.

> **What it means:** if you repeated this entire procedure many times — collect data, bootstrap, build the interval — then 95% of the intervals you build would contain the true value.
>
> **What it does not mean:** the true value is in *this* interval with probability 0.95.

Once you've computed the endpoints, nothing is random any more. The true `S` is a fixed number; it either is or isn't between them. **The 95% is a property of the procedure, not of your answer.** The notebook's own phrasing is the one to use: *a statistical reliability procedure, not a truth machine.*

The useful analogy: a machine that stamps out intervals, correct 95% of the time. You get one stamped interval. You don't get to know whether yours is one of the 95 or one of the 5.

### Hypothesis testing, in one move

Pick a **hypothesized value** `S₀` — usually 0, because usually the question is "is there any effect at all?"

- **Null hypothesis `H₀`:** the true `S` equals `S₀`.
- **Alternative `H₁`:** it doesn't.

The test is a lookup:

```
S₀ inside the (1−α) interval  →  fail to reject H₀ at level α
S₀ outside                    →  reject H₀ at level α
```

**Every confidence interval is already a hypothesis test**, for every possible null value at once. That's worth saying explicitly, because students meet CIs and tests as separate topics and they are the same object read two ways.

Note the phrasing: *fail to reject*, never *accept*. Not rejecting means the data are consistent with `S₀` — and also with every other value in the interval. It is not evidence that `S₀` is true.

### The p-value

Choosing `α` in advance feels arbitrary, and the material says so — *"kind of confusing and ritualistic."* The p-value dodges it by turning the question around:

> **What is the smallest level `α` at which I could still reject the null?**

Equivalently, and more usefully for computing it: **how often is a bootstrap replicate further from the estimate than the estimate is from the null?**

```
p = (1/B) Σ_b  𝟙{ |Ŝ_b − Ŝ|  >  |Ŝ − S₀| }
```

Read the two distances. `|Ŝ − S₀|` is how far your estimate landed from the null — the thing you observed. `|Ŝ_b − Ŝ|` is how far a *typical resample* wanders from your estimate — the noise. **The p-value is the fraction of the time that noise alone produces a gap bigger than the one you saw.** Small p-value means the observed gap is hard to explain by sampling variation.

And notice the form: it's `(1/B) Σ 𝟙{…}` — a **sample proportion**, which is Sep 8's object again. A p-value is a mean of indicators, so everything known about proportions applies to it, including that it has its own variance of roughly `p(1−p)/B`.

### The standardized version (Sep 29's material, if you take it today)

`10_1` cells 0–2 recast all of this in standard-error units. The **standard error** is just a name for the standard deviation of the sampling distribution:

```
SE(Ŝ) = √V[Ŝ]        and for the mean,  SE(X̄ₙ) = s/√n
```

which is Sep 3's `σ²/n` with `s` in place of `σ`, square-rooted. From the bootstrap you get it for free: **the standard deviation of your replicates is the standard error.**

Then standardize each replicate:

```
Z_b = (Ŝ_b − Ŝ) / SE(Ŝ)
```

This does not change any ranking, so the percentile interval picks out the same replicates it always would. What it buys is **comparability** — `Z` is in units of "how many standard errors," which means the same across variables, datasets, and studies. And the interval takes the shape that recurs for the rest of statistics:

```
Ŝ ± q × SE(Ŝ)
```

**Why this matters for the CLT.** Standardizing is exactly the operation that turns any bell-shaped sampling distribution into *the same* bell — the standard normal. That's the schedule's own note: *"normalizing the bootstrap analysis illustrates the CLT, basically."* Do this on several different statistics and datasets and the standardized pictures all land on top of each other. Oct 1 explains why.

---

### Reading

*Key in `README.md`. From `Reading-Roadmap.md` unless marked [Map] (= `prep/ds5030_syllabus_reading_map.pdf`).*

- **Primary** — **AoS Ch. 8** (The Bootstrap) and **Ch. 10** (Hypothesis Testing and p-values). **B&H does not cover the bootstrap at all.**
- **Supporting** — **AoS Ch. 5** (Convergence), for the CLT connection this session sets up.
- **Fuller treatment** — **CASI Ch. 10** (*The Jackknife and the Bootstrap*) and **Ch. 11** (*Bootstrap Confidence Intervals*) — two full chapters, meaningfully deeper than Wasserman's single one. **CASI §1.2** is the book's first worked two-sample t-test and p-value. **C&B Ch. 10** (Asymptotic Evaluations) for bootstrapping and the delta method.
- **Intuition first** — **CASI §10.2's punchline**: since you cannot redraw from the true population to run the thought experiment, the bootstrap substitutes your own sample as a stand-in and redraws from *that*. One sentence, and it is the whole method.
- **Visuals for class** — **CASI Figs 1.4–1.5**: a real two-sample leukemia gene-expression comparison, its t-statistic and p-value, then that same statistic recomputed across **7,128 genes** and histogrammed against the theoretical null curve. That is the most vivid available picture of what a p-value and a null distribution actually are, and it lands directly on §5's multiple-testing point. **CASI Figs 10.2 & 10.4**, bootstrap-replication histograms. **Spiegelhalter (full book)** Ch. 7 Fig. 7.4 and Ch. 10 Figs 10.3–10.4. **ROS Ch. 4**, `Coop/riverbay`.

---

## 3. The optimization view

- **Objective:** interval width, subject to covering `1 − α` of the replicates
- **Argmin:** the equal-tailed `(q_{α/2}, q_{1−α/2})` interval — **only when the bootstrap distribution is symmetric.** Skewed, and the shortest interval is off-centre, pulled toward the peak
- **Solved by:** grid search — slide the left endpoint along the sorted replicates, keep the narrowest window still covering `1 − α`

The percentile interval is a **convention, not a theorem**, and today is the day to say so, because today is when students start reporting them. `activity-two-distributions-skewed/` demonstrates the failure directly. Oct 1 supplies the defence: under the CLT the sampling distribution becomes symmetric, so equal tails become optimal — asymptotically.

---

## 4. Assumptions that make it work

| Claim | Assumption |
|---|---|
| The replicates approximate the sampling distribution | Tuesday's bootstrap assumptions: representative sample, `n` not tiny, smooth statistic |
| The percentile interval has `1−α` coverage | The bootstrap approximation is good. **`B` does not control this — `n` does** |
| The equal-tailed interval is shortest | Symmetry. See §3 |
| CI and hypothesis test agree | They are the same object. Guaranteed by construction |
| The p-value is meaningful | Same bootstrap assumptions, plus `B` large enough that the proportion is stable |
| `SE = s/√n` | i.i.d., from Sep 3 |
| Standardizing makes things comparable | Always true mechanically; *interpretable* only if the sampling distribution is roughly the same shape |

Row 2 is the one students get wrong. Raising `B` from 1,000 to 100,000 makes the interval endpoints stable to more decimal places; it does **not** make them more correct. Coverage is governed by how well your `n` observations represent the process.

---

## 5. Concrete failure cases

**"Fail to reject" read as "no effect."** The single most consequential misreading in applied statistics. A wide interval containing zero is consistent with zero — and also with a large effect. It means *underpowered*, not *null*. Give the concrete version: an interval of `(−0.1, 12.0)` fails to reject zero and is entirely compatible with an enormous effect.

**p-hacking, in its cheapest form.** Test twenty outcomes at `α = 0.05` and you expect one "significant" result even if nothing is real. Worth sixty seconds because the mechanism is exactly Sep 8's indicator arithmetic: twenty independent tests, each with probability 0.05, gives an expected count of 1.

**Bootstrap p-values are floored by `B`.** With `B = 1000` replicates, the smallest non-zero p-value you can observe is `1/1000`. A reported `p = 0` means "smaller than my resolution," never "impossible." Students report `p = 0` without noticing.

**Skewed bootstrap distributions.** The percentile interval isn't shortest, and worse, for a strongly skewed statistic it can have poor coverage. This is a live issue on the used-car price data in the built lab — prices are right-skewed, and the mean and median behave very differently.

**Testing a null you chose after looking.** If `S₀` is picked after seeing `Ŝ`, the whole frequentist guarantee evaporates — the procedure you're claiming a 95% property for isn't the procedure you ran.

**Reading the CI as a probability statement.** §2, and §6 Q2.

---

## 6. Five questions students will ask

**Q1. "What's the difference between a confidence interval and a hypothesis test?"** Nothing, really — they're the same computation read in two directions. The interval reports every null value you would *fail* to reject; the test picks one value and checks membership. If you have the interval you have the test for free, for every possible null simultaneously. The reason both exist is rhetorical: an interval communicates magnitude and precision, a test communicates a decision. The interval is almost always the more informative report, which is why so much of statistics practice has moved toward reporting intervals rather than just p-values.

**Q2. "Does a 95% CI mean there's a 95% chance the true value is in it?"** No. Once you've computed the endpoints there is no randomness left — the true value is a fixed number and it either is or isn't inside. The 95% describes the *procedure*: build intervals this way many times and 95% of them will capture the truth. You have one of them and can't tell which kind. If you genuinely want "the probability the parameter is in this range," that's a Bayesian credible interval, which is a different object requiring a prior.

**Q3. "My p-value is 0. Is the effect certain?"** No — you've hit the resolution limit of your bootstrap. With `B` replicates the smallest reportable non-zero p-value is `1/B`, so `p = 0` really means `p < 1/B`. Report it that way (`p < 0.001` for `B = 1000`) rather than as zero. And raising `B` will let you resolve further, but past a point you're measuring the precision of your Monte Carlo, not learning anything about the world.

**Q4. "I failed to reject. Does that mean there's no effect?"** No, and this is the error with the worst real-world consequences. Failing to reject means your data can't distinguish the null from the alternative — which happens both when the effect is genuinely zero *and* when your sample is too small to see it. Look at the interval's *width*: if it's `(−0.1, 0.1)` you've learned the effect is small; if it's `(−0.1, 12.0)` you've learned essentially nothing. Same decision, completely different information. This is why reporting the interval beats reporting the verdict.

**Q5. "Why bother standardizing into Z? The interval picks out the same replicates."** It does — standardizing is monotone, so the ranks don't move and the interval endpoints correspond to the same replicates. Two reasons anyway. **Comparability**: `Z` is measured in standard errors, so a `Z` of 2.5 means the same thing whether you're studying wages, drug efficacy, or engine lifetimes, while a raw difference of 2.5 means nothing without units. **And the shape**: once standardized, sampling distributions from wildly different problems land on top of each other, and that shared shape is the standard normal. That coincidence is the CLT, and it's what makes the whole `Ŝ ± q × SE` formula work without a bootstrap at all — which is Oct 1.

---

## 7. Bugs and simplifications in the material

### Verified

- **`09_2` has no code at all** — ten markdown cells, including everything today needs. Second consecutive session with no runnable in-class content.
- **`09_2` cell 2 has an empty bullet** — "## Sampling with Replacement" followed by a bare dash.
- **`10_1` cell 0 is truncated**: "We will be normalizing" and it stops.
- **`10_1` cell 3 has a doubled word**: "no one one runs a million dollar clinical trials".
- **`10_1` cell 4 introduces "t-values" without warning** — "What proportion of the time are the bootstrapped `t`-values further from 0…" — where every other cell says `Z`. Two names for one object, and `t` also means something specific arriving on Oct 1.
- **`10_1` cell 6 is truncated**: "this is called the Central Limit " and it stops mid-phrase.

### Correct

`10_1`'s definitions are right: the standard error as `√V[Ŝ]`, the `Z_b` construction, the `Ŝ ± q × SE` interval, and both equivalent forms of the bootstrap p-value in cell 5. The equivalence in cell 5 — that `|Z_b| > |Z_0|` is the same event as `|Ŝ_b − Ŝ| > |Ŝ − S₀|` — is worth showing, since it's why the p-value can be computed without ever forming `Z`.

### Simplifications

- **One-sided tests are never mentioned.** Everything is two-sided. Fine, and worth saying once so students don't think it's the only option.
- **Multiple testing is never mentioned**, though "test twenty things" is exactly what a data scientist does. §5 covers it in a minute.
- **The `B` floor on p-values** isn't stated anywhere. See §6 Q3.
- **"Every CI corresponds to a statistical test"** (cell 3) is asserted and never demonstrated. It's a one-line demonstration and it's the cleanest idea in the session.
- **The percentile interval's symmetry assumption** is never raised. See §3.

---

## 8. Delivery plan

**Modes:** 🟦 notebook (student copy) · 🟩 instructor cells (pre-written, never live) · ⬛ board · 🟨 HTML widget

| # | Step | Mode | Time | Notes |
|---|---|---|---|---|
| 1 | Recap: you have `B` replicates | ⬛ board | 2 min | Tuesday's output is today's input |
| 2 | The percentile CI | ⬛ board | 4 min | Quantiles of the replicates. Sep 10's `F⁻¹` again |
| 3 | **What a CI is not** | ⬛ board | 5 min | The stamping-machine analogy. **Do not rush this** |
| 4 | **CI ⟺ hypothesis test** | 🟨 widget | 5 min | `class-10-bootstrap/bootstrap.html#hypothesis-testing` — move the null value, watch the verdict flip at the interval edge. Makes "same object, two readings" visible in one gesture |
| 5 | "Fail to reject" ≠ "no effect" | ⬛ board | 4 min | The `(−0.1, 12.0)` interval. Highest-value four minutes in the session |
| 6 | The bootstrap p-value | ⬛ board | 5 min | Both forms. Point out it's a sample proportion — Sep 8 again |
| 7 | **Compute one** | 🟩 instructor cells | 6 min | Must build. Show the `p = 0` floor at `B = 1000` explicitly |
| 8 | *(optional)* SE and `Z_b` | ⬛ board | 6 min | Only if you're taking Z today rather than Sep 29 — see §12 |
| 9 | **Lab** | 🟦 notebook | rest | See below |

**Build cost: step 7 (~20 min)**, plus the lab decision below.

### The lab

The schedule says *"clinical trials lab"* and **no such lab exists** — not in `uu_fa26`, not in `uu_sp26`, and there's no clinical-trials data in either repo. Three options, in the order I'd consider them:

0. **Bootstrap the census wage data**, continuing Tuesday's activity. Tuesday builds the sampling distribution of the mean wage by *resampling the population* (which you can only do because you manufactured a world where the population is visible); Thursday does it by **resampling the sample**, which is what you can actually do in life. Same data, same statistic, and the two histograms land on top of each other. This closes the arc the reordering opened up, needs no new dataset, and the material from §§5–7 of Tuesday's activity spec slots straight in. **This is now my first recommendation.**
1. **Use `labs/class-10-bootstrap/` as-is.** It's complete: a live demo, a `#hypothesis-testing` section, an assignment where students implement `resample` and `bootstrap_ci`, a working autograder (`test_bootstrap.py`), reference samplers in both languages, and instructor solutions in `NOTES.md`. It runs on 92 Charlottesville used-car prices. **Zero build cost**, and the price data is genuinely right-skewed, which makes the mean-vs-median contrast real. Its own `NOTES.md` already says it maps to `09_2` and was scheduled for this week.
2. **Swap the dataset into the same lab.** The lab reads `data.json` — `{variable, unit, source, statistic, observed_mean, observed_median, values}`. Point it at a clinical outcome and the widgets, samplers, template, and autograder all keep working. This is a data-sourcing job, not a lab-building job: perhaps an hour, most of it finding a clean two-arm trial extract.
3. **Build a clinical-trials lab from scratch.** Most faithful to the schedule and by far the most work. The treatment-vs-control ATE framing is a genuinely better vehicle for hypothesis testing than car prices — "is the effect zero?" is the natural question there, and it's artificial for used cars.

**My recommendation is now option 0** — it continues Tuesday, uses data students met on Sep 1, and gives the missing clinical-trials slot a coherent replacement. Option 1 (the built car-price lab, autograder included) remains the zero-effort fallback. Do not build from scratch.

**Cut first:** step 8, then step 6's second form. **Do not cut** steps 3 or 5.

---

## 9. Look ahead

- **Sep 29 standardizes everything from today.** The `Ŝ ± q × SE` shape is the bridge, and `10_1` cell 2 says it will "appear frequently" — it's the template for every interval in the rest of the course.
- **Oct 1's CLT is why standardization works.** Today's bootstrap p-values and intervals are computed by resampling; the CLT replaces the resampling with a lookup. The payoff line: *you will stop needing the bootstrap for the mean, and you'll still need it for everything else.*
- **The percentile interval's symmetry assumption (§3)** gets its defence on Oct 1.
- **The p-value as a sample proportion** means it has a standard error of `√(p(1−p)/B)` — Sep 8's formula applied to today's object. That's how you decide whether `B` is large enough, and it's a nice closing of the loop.
- **Midterm (Oct 8).** Confidence-interval interpretation is the single most examinable idea in the first half — concept-driven, no computation, and it separates understanding from procedure. §6 Q2 and Q4 are the question bank.

## 10. Looking back

- **Tuesday built the replicates.** Today only summarizes them. If Tuesday's `T` vs `N` distinction landed, today's `B` vs `n` (§4) is the same idea and costs nothing.
- **Sep 10's quantile function** is what a percentile interval is.
- **Sep 8's sample proportion** is what a bootstrap p-value is — `(1/B) Σ 𝟙{…}`. Third session where the indicator trick does the work.
- **Sep 3's `σ²/n`** becomes the standard error once you square-root it and swap `s` for `σ`.
- **Sep 1's frequentist framing** is what makes the CI interpretation in §2 the *only* honest reading.

---

## 11. Source map

- `class_10/09_2_intro_to_bootstrap.ipynb` cells 6–9 — communicating results (6), **confidence intervals (7)**, hypothesis testing (8), **interpretation (9)**. All markdown.
- `class_11/10_1_bootstrap_inference.ipynb` — 7 cells: standard errors (0, truncated), **Z-statistics (1)**, percentile CI normalized (2), hypothesis tests (3), p-values (4), **bootstrap p-values (5)**, bell curves (6, truncated). Listed under Sep 29 in the spreadsheet; cells 0–2 are the prerequisites for a standardized test today.
- `class_11/homework_11_clt_bootstrap.md` — **a written problem set already exists**: 15 paper CLT/inference exercises plus 5 simulation prompts, with a critical-value table (1.645 / 1.96 / 2.576) and `Φ` values supplied. Aimed at Sep 29–Oct 1 but the hypothesis-testing problems are today's.
- **`labs/class-10-bootstrap/`** — complete lab. `bootstrap.html` (`#try-it`, `#sampling-dist`, `#one-resample`, `#bootstrap-dist`, `#ci`, `#se`, `#hypothesis-testing`, `#assignment`, `#faq`), `bootstrap.py` (template), `test_bootstrap.py` (autograder), `sampler.py`/`.js`, `data.json` (92 car prices, mean 8.59k, median 5.65k), `NOTES.md` (reference solution + common errors).

## 12. Open questions

- 🔴 **Decide the Z-statistic split before building.** Today is billed as hypothesis testing *with z-statistics*, but Sep 29 is where SE and Z live, and Z depends on SE. Two consistent options:
  - **(a) Percentile today, standardize Tuesday.** Today uses `09_2` cells 6–9 only — interval, membership test, counting p-value, no standardization anywhere. Sep 29 then introduces SE and `Z_b` and *re-derives* the same interval in standard-error units, which is exactly where "normalizing illustrates the CLT" belongs. **This is what I'd do**, and it's how this file is written.
  - **(b) Take `10_1` cells 0–2 today.** Fuller session, and Sep 29 becomes lighter — but it front-loads the standard error onto a day that already has a lab.
- 🔴 **The clinical-trials lab doesn't exist.** §8 has three options; my recommendation is to reuse `labs/class-10-bootstrap/` with a swapped `data.json`.
- **Does `09_2` get split across Tuesday and Thursday?** Cells 1–5 are Tuesday's, 6–9 are today's. Right now it's one notebook covering two sessions.
- **Is `homework_11_clt_bootstrap.md` assigned this week or next?** It exists and it's substantial. The spreadsheet's homework column shows HW5 landing on Sep 29.
- **Are one-sided tests and multiple testing in scope at all?** Neither appears anywhere in the material. Multiple testing in particular is a sixty-second addition with a large practical payoff for data scientists.
