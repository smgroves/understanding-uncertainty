# Week 6, Tuesday (Sep 29) — Standard Errors and Z-Statistics

- **Schedule focus (F26_scheduling):** SE, Z-stats · source listed as `CLASS_11/10_1_bootstrap_inference`
- **Day type:** Quiz / Math Day — quiz on Week 5; **HW5 given**
- **Source:** `uu_fa26/class_11/10_1_bootstrap_inference.ipynb` (7 cells, all markdown)
- **Problem set:** `uu_fa26/class_11/homework_11_clt_bootstrap.md` — **already written**, 15 paper exercises + 5 simulation prompts
- **Widgets:** `labs/class-11-clt/clt.html`; `labs/activity-standard-error/`
- **Also:** html `labs/class-11-clt/lecture.html` covers this material in prose

> **This session is one idea with a large payoff: put every estimate on the same scale.** Sep 24 produced intervals and p-values in the units of whatever you happened to be measuring. Today divides by the standard error, and suddenly a result about wages, a result about drug efficacy, and a result about engine lifetimes are all readable on one axis. That common scale is what makes Thursday's Central Limit Theorem possible — you cannot notice that everything has the same shape until everything is measured the same way.
>
> There is also a demonstration available today that justifies the entire bootstrap, and it takes two minutes. See §2's "two routes."

---

## 1. What students actually see

| Artifact | File | Status |
|---|---|---|
| Quiz | — | On Week 5: sampling distributions, the bootstrap, CI interpretation |
| **HW5** | `class_11/homework_11_clt_bootstrap.md` | **written and substantial** — see §11 |
| Pre-class video | `class_11/10_1_bootstrap_inference` (7 cells) | ⚠ two cells truncated mid-sentence |
| In-class | same notebook | **all markdown, no code** — third session running |
| Instructor cells | — | to build; §8 has exact numbers |
| Board | — | `SE`, `Z_b`, `Ŝ ± q × SE` |

---

## 2. The content, from scratch

### The standard error

One definition, and it is worth writing on the board exactly this way:

> **The standard error is the standard deviation of the sampling distribution.**

Not of the data. Of the *estimate*. The notebook's aside — *"statisticians are people who professionally compute standard errors"* — is closer to literal truth than it sounds; most of applied inference is working out how much an estimate would wobble.

For the sample mean, Sep 3 already did the work. `V[X̄ₙ] = σ²/n`, so taking the square root and substituting the sample standard deviation for the unknown `σ`:

```
SE(X̄ₙ) = √(V[X̄ₙ]) = s / √n
```

**Standard deviation vs. standard error is the confusion to pre-empt.** `s` describes how spread out *the data* are — it doesn't shrink as you collect more. `SE` describes how spread out *your estimate* is — it shrinks like `1/√n`. Collecting more data doesn't make people's wages more similar; it makes your estimate of the average wage more precise. Same units, completely different objects.

### Two routes to the same number — and why one of them wins

This is the demonstration to build, and it settles the bootstrap's legitimacy in two minutes.

Take the 92 Charlottesville car prices from the built lab (`labs/class-10-bootstrap/data.json`; mean **8.590**, `s` **8.171**).

```
Route 1 — formula:     s/√n            = 8.171/√92  = 0.8518
Route 2 — bootstrap:   sd of B replicates            = 0.8456      (B = 20,000)
```

They agree to within 0.7%. **Two completely different arguments — one algebraic from Sep 3, one computational from Sep 22 — land on the same number.** That is the moment the bootstrap stops being a trick.

Now the part that matters. Ask for the standard error of the **median**:

```
Route 1 — formula:     there isn't one (not an elementary one)
Route 2 — bootstrap:   0.7343
```

**The formula route runs out and the bootstrap doesn't.** That is the whole argument for the method: `s/√n` works for exactly one statistic, and resampling works for any statistic you can compute. Note also that on this skewed data the median's standard error is *smaller* than the mean's — the median is the more stable estimator here, which is Sep 1's robustness lesson showing up as a number rather than an assertion.

### Standardizing: the Z-statistic

Take each bootstrap replicate, subtract the estimate, divide by the standard error:

```
Z_b = (Ŝ_b − Ŝ) / SE(Ŝ)
```

Read it literally: **how many standard errors away from my estimate is the `b`-th resample?**

Two properties, and the second is the point:

- **Ranks don't change.** Standardizing is monotone, so the percentile interval selects the same replicates it always did. You have not changed any answer.
- **Units disappear.** `Z` has no units. A `Z` of 2.5 means the same thing for wages in dollars, survival in cycles, and proportions in percent.

That second property is what makes results *comparable across studies*, and it is the only reason to bother.

### The standardized confidence interval

The `Z_b` approximate the distribution of the quantity you actually care about, `Z = (Ŝ − S)/SE(Ŝ)`. Take its `α/2` and `1−α/2` quantiles and rearrange:

```
( Ŝ − q_{α/2} × SE(Ŝ) ,  Ŝ + q_{1−α/2} × SE(Ŝ) )
```

The notebook flags this correctly: **`Ŝ ± q × SE(Ŝ)` is the shape every confidence interval takes from here on.** Estimate, plus or minus some number of standard errors. Everything later in statistics is a variation on choosing `q`.

On the car data:

```
percentile CI (Sep 24):   (7.010, 10.308)
Ŝ ± 1.96 × SE:            (6.932, 10.247)
```

Close, not identical — and the gap is *information*. It exists because the bootstrap distribution of the mean is still slightly skewed at `n = 92`. Which leads directly to:

### Why the bell curve keeps appearing

The notebook's cell 6 asks the right question — *"why do we keep seeing that shape?"* — and today you can make the observation sharp instead of vague.

Standardize the replicates and look at the quantiles:

```
Z quantiles at 2.5% / 97.5%:   −1.868 , +2.032
standard normal:               −1.960 , +1.960
```

Close, and **visibly not symmetric**. That asymmetry is the skew of the car prices surviving into the sampling distribution. Two things to say:

1. The standardized bootstrap distribution is *nearly* standard normal, and it gets nearer as `n` grows.
2. It is not there yet at `n = 92` with data this skewed.

Leave it there. **Thursday's theorem explains both halves** — why it converges at all, and why "large enough `n`" depends on the shape of the data. Setting up a puzzle you can measure is much better than asserting a theorem a day early.

---

### Reading

*Key in `README.md`. From `Reading-Roadmap.md` unless marked [Map] (= `prep/ds5030_syllabus_reading_map.pdf`).*

- **Primary** — **AoS Ch. 8**, where the SE and Z-statistic are defined operationally. **B&H has no dedicated SE section** — it states the CLT in Ch. 10 §10.3 but never isolates "standard error" as a named object the way applied texts do.
- **Supporting** — **AoS Ch. 10**: the Wald test is the formal home of the z-statistic.
- **Fuller treatment** — **CASI Ch. 10, §10.1**, *"The Jackknife Estimate of Standard Error"* — a full named section on exactly this. **CASI Ch. 2, §2.1** names and works the **four devices frequentists actually use to get a standard error** — the plug-in principle, the delta method, parametric MLE, and the bootstrap — which is a clean map of everything this course touches. **C&B Ch. 10** for the delta-method justification.
- **Intuition first** — **CASI §2.1, the plug-in principle**: the SE formula is just the true variance formula with an estimate substituted for the unknown variance. No more mysterious than that, and it defuses §6 Q5. Also **CASI around §10.3/Fig. 10.2**, where the chapter's own bootstrap histogram is deployed to show a case where the assumed normal shape quietly fails.
- **Visuals for class** — **CASI Fig. 1.1**, the very first figure in the book: a real kidney-function dataset with ±2 SE bars, right where SE is first defined. **CASI Figs 10.1 & 10.3**, jackknife and bootstrap SEs visibly disagreeing — a good honesty check. **Spiegelhalter (full book)** Ch. 9 Table 9.1.

---

## 3. The optimization view

- **Objective:** interval width, subject to `1 − α` coverage — the same objective as Sep 24
- **Argmin:** now expressed as `Ŝ ± q × SE`, where `q` is chosen from the standardized replicates. Under symmetry, equal tails; under skew, still not
- **Solved by:** grid search over the sorted `Z_b`, exactly as before

Standardizing does not change the argmin — it changes the *coordinates* it's expressed in. That's worth one sentence, because students reasonably suspect that dividing by `SE` must have done something. It did: it made `q` a pure number, which is what lets Thursday replace the bootstrap with a table lookup.

---

## 4. Assumptions that make it work

| Claim | Assumption |
|---|---|
| `SE(X̄ₙ) = s/√n` | **i.i.d.**, and `s²` estimates `σ²` reasonably. Fails under clustering or dependence |
| The bootstrap `SE` is valid | Sep 22's bootstrap assumptions — representative sample, `n` not tiny, smooth statistic |
| Both routes agree | Both are valid for the mean. For anything else only the bootstrap is available |
| `Z_b` has mean 0, sd 1 | True by construction. **Verifying it is a bug-check, not a result** |
| `Ŝ ± q × SE` has `1−α` coverage | `q` from the standardized bootstrap: yes. `q = 1.96` from the normal table: **only asymptotically** — that's Thursday |
| Standardizing makes studies comparable | Mechanically always; *interpretably* only when the sampling distributions have similar shape |

Row 5 is the seam of the whole week. Today's `q` comes from your own replicates and needs no theory. Thursday's `q = 1.96` comes from a theorem, and it's the CLT that licenses the swap.

---

## 5. Concrete failure cases

**SD reported where SE was meant.** Endemic in published work. "Mean 8.59 ± 8.17" and "mean 8.59 ± 0.85" describe wildly different levels of confidence, and the second is what a standard error gives you. Make students say which is which out loud.

**`s/√n` under dependence.** Clustered or serially correlated data make `s/√n` too small, so every interval built from it is too narrow. Fourth appearance of this issue — it was `PWGTP` on Sep 1, correlated samples on Sep 8, dependent bootstrap draws on Sep 22, and now here. Worth naming as a recurring theme rather than a new caveat.

**Standardizing a statistic whose SE is itself unstable.** `SE` is an estimate with its own error. For small `n`, dividing by a noisy `SE` inflates the tails of `Z` — which is precisely why the **t-distribution** exists, and why the schedule notes *"maybe need to add in t-test formalization"* for Thursday.

**Assuming `q = 1.96` today.** Nothing this session justifies it. The `Z` quantiles on real data are `−1.868, +2.032`, not `±1.960`. Using the normal table before Thursday is borrowing a result that hasn't been proved.

**`Z` for a statistic with no finite variance.** Then `SE` is meaningless and standardizing produces a number with no interpretation. Sep 10's Cauchy again.

---

## 6. Five questions students will ask

**Q1. "What's the difference between the standard deviation and the standard error?"** The standard deviation describes the spread of *the data*; the standard error describes the spread of *your estimate*. Concretely: `s = 8.17` says car prices vary a lot from car to car, and that number does not change if you collect more listings — it's a fact about the market. `SE = 0.85` says your estimate of the *average* price would wobble by about 0.85 across repeated samples, and that number shrinks like `1/√n` — it's a fact about your study. Same units, different objects, and `SE = s/√n` is the bridge. If you remember one thing: more data makes your estimate more precise; it doesn't make the world less variable.

**Q2. "If we have the formula `s/√n`, why bootstrap at all?"** Because the formula exists for the mean and almost nothing else. There is no elementary `s/√n` for the median, the IQR, a ratio of two means, a regression coefficient, or a 90th percentile. The bootstrap computes a standard error for **any statistic you can write code for**. Today's demonstration is the proof: for the mean both routes give ≈0.85, and for the median only the bootstrap answers at all — 0.73. Once you've seen the two routes agree where both are available, you can trust the one that works everywhere.

**Q3. "Why divide by `SE` if it doesn't change the interval?"** It doesn't change *which replicates* the interval picks — standardizing is monotone, so ranks are preserved. What changes is the units: `Z` is dimensionless, so "2.5 standard errors from the estimate" means the same thing in every study ever conducted. That comparability is worth something on its own, but the real payoff is Thursday: once everything is on a common scale, you can notice that the standardized pictures all have the *same shape*, and then look `q` up in a table instead of resampling for it.

**Q4. "The `Z` quantiles are `−1.87` and `+2.03`, not `±1.96`. Is something wrong?"** Nothing is wrong; you're seeing the truth. Car prices are strongly right-skewed and some of that skew survives into the sampling distribution of the mean at `n = 92`. The standard normal's `±1.96` is what you get in the *limit*, and 92 observations of skewed data isn't the limit yet. This is the most useful thing on the screen today, because it shows that the normal approximation is an approximation — and it makes Thursday's question ("how large does `n` need to be?") a real one with an answer that depends on the data.

**Q5. "Is `SE` itself uncertain?"** Yes, and it matters more than students expect. `SE` is computed from the same sample as `Ŝ`, so it's an estimate with its own sampling variability. When `n` is large this is negligible. When `n` is small, dividing by a noisy denominator makes extreme `Z` values more likely than the normal would predict — the distribution gets heavier tails. Correcting for exactly this is what the t-distribution does, which is why t rather than z is the right tool for small samples. That's Thursday, if the t-tests get added.

---

## 7. Bugs and simplifications in the material

### Verified

- **Cell 0 is truncated.** "We will be normalizing" — the sentence stops there, and it's the cell that defines the standard error.
- **Cell 6 is truncated.** "…this is called the Central Limit " — it stops mid-name, in the cell that sets up Thursday.
- **Cell 3 has a doubled word**: "no one one runs a million dollar clinical trials".
- **Cell 4 silently switches to "t-values"** — *"What proportion of the time are the bootstrapped `t`-values further from 0…"* — where every other cell says `Z`. Two names for one object, and `t` denotes something genuinely different arriving on Thursday. Rename to `Z`.
- **No code anywhere.** Seven markdown cells, third session in a row with nothing runnable.

### Correct

The definitions are all right: `SE(X̄ₙ) = ŝ/√n`, the `Z_b` construction, the `Ŝ ± q × SE` interval, and both equivalent forms of the bootstrap p-value in cell 5. The equivalence in cell 5 — `|Z_b| > |Z_0|` is the same event as `|Ŝ_b − Ŝ| > |Ŝ − S₀|` — is genuinely worth showing, because it means you never have to form `Z` at all to get a p-value.

### Simplifications

- **`s` versus `σ` is glossed.** The formula is written with `ŝ`, which quietly introduces "we don't know `σ`, so we plug in an estimate" — the substitution that makes the t-distribution necessary. One sentence would set Thursday up properly.
- **The `n−1` question finally has a home and isn't used.** Sep 1 raised the divisor question and deferred it. `SE = ŝ/√n` is where the unbiased `s²` actually earns its correction. Worth closing the loop, since it's been open for a month.
- **Cell 6 asserts the bell curve without measuring it.** §2's `Z` quantiles turn a vague "notice the ubiquity" into a number that is *almost* but not quite `±1.96`, which is a much better hook.
- **"Every CI corresponds to a statistical test"** (cell 3) is asserted again without demonstration. One line.

---

## 8. Delivery plan

**Modes:** 🟦 notebook (student copy) · 🟩 instructor cells (pre-written, never live) · ⬛ board · 🟨 HTML widget

| # | Step | Mode | Time | Notes |
|---|---|---|---|---|
| 1 | **Quiz** | — | 10 min | Week 5: sampling distribution, bootstrap, CI interpretation |
| 2 | SE = sd of the sampling distribution | ⬛ board | 4 min | One line. Then `SE(X̄ₙ) = s/√n` from Sep 3, square-rooted |
| 3 | **SD vs SE** | ⬛ board | 4 min | `s = 8.17` vs `SE = 0.85` on the car data. More data ⇒ better estimate, not a less variable world |
| 4 | **Two routes, and the median** | 🟩 instructor cells | 8 min | **Build this.** Formula 0.8518 vs bootstrap 0.8456 for the mean; then the median, where only the bootstrap answers (0.7343). **The best two minutes available today** |
| 5 | `Z_b = (Ŝ_b − Ŝ)/SE` | ⬛ board | 4 min | Ranks unchanged, units gone. Verify mean 0, sd 1 as a bug-check |
| 6 | `Ŝ ± q × SE` | ⬛ board | 4 min | The shape every interval takes from here on. Say that explicitly |
| 7 | Percentile CI vs `Ŝ ± 1.96·SE` | 🟩 instructor cells | 4 min | `(7.010, 10.308)` vs `(6.932, 10.247)`. The gap is skew, and it is *information* |
| 8 | **The `Z` quantiles aren't ±1.96** | 🟩 instructor cells | 5 min | `−1.868, +2.032`. Leave the puzzle open — Thursday answers it |
| 9 | HW5 handed out | 🟦 — | 2 min | `homework_11_clt_bootstrap.md` |

**Build cost: steps 4, 7, 8 (~30 min)** — one script covers all three, and §2 has every number it should produce.

**If you build only one thing, build step 4.** The bootstrap has been asserted to work since Sep 22; this is the first time students see it *checked against an independent answer*, and then see the independent answer run out.

**Cut first:** step 7. **Do not cut** steps 3, 4, or 8.

---

## 9. Look ahead

- **Thursday is the payoff.** Today ends with standardized replicates that are *nearly* standard normal. The CLT says why, and it licenses replacing your own quantiles with `1.96` from a table — which means no bootstrap at all for the mean.
- **`Ŝ ± q × SE` is the template for the rest of statistics.** Regression coefficients, proportions, differences of means: all the same shape with a different `SE`.
- **The `Z` asymmetry is Thursday's "how large is large enough?"** — you have a measured example of the approximation not having arrived. Do not resolve it today.
- **`SE` is itself an estimate (§6 Q5)** — that's the motivation for the t-distribution, which the schedule flags as *"maybe need to add"* for Thursday. If it gets added, today is where the need for it is created.
- **Midterm (Oct 8).** SD vs SE is the most examinable distinction of the week, and `homework_11` problems 1–3 are already in that form.

## 10. Looking back

- **Sep 3 supplies the formula.** `V[X̄ₙ] = σ²/n`, square-rooted with `s` for `σ`, *is* the standard error. Today is that derivation collecting its interest.
- **Sep 22 supplies the object.** The standard error is the standard deviation of the sampling distribution, and Sep 22 is where that distribution was first drawn.
- **Sep 24 supplies the interval** that today rewrites in standard-error units. Same interval, new coordinates.
- **Sep 8's `p(1−p)/n`** is a standard error too — for a proportion. Worth mentioning; it's the same idea two weeks earlier and it makes `SE` feel like a general concept rather than a formula for means.
- **Sep 1's `n` vs `n−1`** finally matters, since `SE` uses `ŝ`. Close the loop.

---

## 11. Source map

- `class_11/10_1_bootstrap_inference.ipynb` — 7 cells, all markdown. Standard errors (0, **truncated**), **Z-statistics (1)**, percentile CI normalized (2), hypothesis tests (3, doubled word), p-values (4, **"t-values" slip**), bootstrap p-values (5), bell curves (6, **truncated**).
- `class_11/homework_11_clt_bootstrap.md` — **HW5, already written.** 15 paper exercises (CLT statement, SE computation, z-tests, CIs) plus 5 simulation prompts explicitly designed to connect the bootstrap ECDF of standardized statistics to `Φ`. Supplies its own critical-value table (1.645 / 1.96 / 2.576) and `Φ` values. Problems 1–3 are today's material; the rest is Thursday's.
- Data for the demonstrations: `labs/class-10-bootstrap/data.json` — 92 car prices, mean 8.590, median 5.650, `s` 8.171. Every number in §2 and §8 comes from it.
- html `labs/class-11-clt/lecture.html` — standard errors, Z-statistics, the normalized percentile CI, hypothesis tests, and p-values in prose, with the bell-curve lead-in.
- `labs/activity-standard-error/` — standalone widget, "how bad is my estimator?"

## 12. Open questions

- **Was the Z-statistic material already spent on Sep 24?** This file assumes option (a) from session 10 §12 — Sep 24 did percentile-only, and standardization is today. If you took `10_1` cells 0–2 last Thursday, today is much lighter and should probably absorb some of Thursday's CLT material.
- **Does the t-distribution get added Thursday?** The spreadsheet says *"maybe need to add in t-test formalization"*. §6 Q5 and §5 create the need for it today; if it isn't added, that thread stays open and `homework_11` has problems that assume it.
- **Fix the two truncated cells before recording.** Cell 0 defines the standard error and cell 6 sets up the CLT — both stop mid-sentence.
- **Rename the "t-values" in cell 4 to `Z`** before Thursday introduces real t-values.
- **Is HW5 this homework?** The spreadsheet shows HW5 given today, and `homework_11_clt_bootstrap.md` spans today and Thursday. If it's assigned today, roughly a third of it covers material students haven't seen yet.
