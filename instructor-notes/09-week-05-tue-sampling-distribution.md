# Week 5, Tuesday (Sep 22) — The Sampling Distribution

- **Schedule focus (F26_scheduling):** The Sampling Distribution
- **Day type:** Quiz / Math Day — quiz on Week 4 (KDE, survival & hazard)
- **Pre-class video:** `uu_fa26/class_10/08_01_sampling_distribution.ipynb` (13 cells)
- **In-class:** `uu_fa26/class_10/09_2_intro_to_bootstrap.ipynb` (10 cells, **all markdown, zero code**)
- **Widgets:** `labs/class-10-bootstrap/bootstrap.html` — `viz-sim-matrix`, `viz-try-it`; `labs/activity-standard-error/`, `activity-two-distributions{,-skewed,-variance}`
- **Also:** html `labs/class-10-bootstrap/lecture.html`

> **Sep 3's lab already built one of these.** If the wages lab happened, students have drawn 2000 samples, histogrammed the sample means, and checked that the spread matches `σ²/n`. **That histogram was a sampling distribution and nobody called it one.** Open today by naming the thing they already made — it converts the hardest abstraction of the first half into a callback.
>
> The session also does something unusual: the video is simulation, and the in-class half pivots to the bootstrap, which is what you do when simulation is impossible. That contrast is the day's real content.

---

## 1. What students actually see

| Artifact | File | Status |
|---|---|---|
| Quiz | — | On Week 4: KDE bandwidth, bias/consistency, survival & hazard |
| Pre-class video | `class_10/08_01_sampling_distribution` (13 cells) | ⚠ **first code cell crashes; the CLT formula is wrong — §7** |
| In-class | `class_10/09_2_intro_to_bootstrap` (10 cells) | **all markdown, no code at all** |
| Instructor cells | — | to build; the video's simulation needs a working version |
| Lab | none Tuesday | Thursday has the clinical-trials bootstrap lab |
| Board | — | The `N × T` matrix, the frequentist thought experiment, the CI interpretation |

**The in-class notebook has no executable content.** Ten markdown cells covering resampling, the bootstrap algorithm, confidence intervals, hypothesis testing, and interpretation — all correct, all prose. On a day that is nominally board-math this is survivable, but the bootstrap is a *procedure* and students should watch one run. §8 has what to build.

---

## 2. The content, from scratch

### A statistic is a random variable

Everything today follows from one sentence: **a statistic is a function of the sample, so a different sample gives a different value, so the statistic has a distribution.**

That distribution is the **sampling distribution**. Not the distribution of the data — the distribution of the *thing you computed from the data*.

The distinction is the hardest idea in the first half of the course and it is worth being heavy-handed about. Two distributions are now in play:

- `X` has a distribution. Lightbulb lifetimes are exponential; wages are right-skewed.
- `X̄ₙ` has a *different* distribution, and it is not the same shape as `X`'s.

Sep 3 already established the first two facts about that second distribution — `E[X̄ₙ] = μ` and `V[X̄ₙ] = σ²/n`. Today asks the remaining question: **what shape is it?**

### The simulation matrix

The video's central device, and it's a good one. Draw `N` values, `T` times:

```
        ┌ X₁₁  X₁₂  …  X₁T ┐        each COLUMN is one sample of size N
        │ X₂₁  X₂₂  …  X₂T │        each ROW is a draw index
        │  ⋮    ⋮    ⋱   ⋮  │
        └ X_N1 X_N2 …  X_NT ┘        S_t = S(X₁t, …, X_Nt) — one statistic per column
```

Two knobs doing completely different jobs, and conflating them is the standard confusion:

- **`N` — the sample size.** How much data one experiment collects. Bigger `N` makes each `S_t` *more accurate*, and Sep 3's `σ²/n` is exactly that statement.
- **`T` — the number of replications.** How many times you imagine repeating the whole study. Bigger `T` does **not** make your estimate better. It makes your *picture of the sampling distribution* sharper.

`T` is fictional. You run the study once. `T` is the thought experiment.

### Frequentism, stated plainly

That thought experiment has a name. **Frequentist statistics asks: if I repeated this entire analysis many times, what would typically happen?** Every standard error, confidence interval, and p-value in the rest of the course is an answer to that question.

Worth saying explicitly that this is a *choice of framework*, not a mathematical necessity — it is why a confidence interval means what §2's last section says it means, and not the thing everyone wants it to mean.

### The lightbulb example

The video runs it well. Lifetimes are exponential — quality-testing bulbs until they burn out. Test `N = 10` bulbs, repeat `T` times, and plot the density of the `T` sample means.

**The point is in the parenthetical: "nothing is normal here."** The data are exponential — hard right skew, no symmetry. And yet the sampling distribution of `X̄₁₀` comes out looking like a bell curve. That is not a coincidence and it is not an assumption anyone made. It's the CLT arriving unannounced, and Oct 1 will name it.

Then cell 8 sweeps `T = 10, 100, 1000, 10⁴, 10⁵` with `R = 10` repeats of each. At `T = 10` the ten curves scatter wildly; at `T = 10⁵` they lie on top of each other. **That is a picture of `T` doing its job** — more replications don't change the sampling distribution, they just resolve it.

### The bootstrap: what to do when you can't replicate

Now the pivot, and it's the best-motivated idea in the course so far.

The simulation above required drawing fresh samples from the true process `T` times. **You cannot do that.** You are a data scientist; you have one dataset, collected once. `T = 1`.

The bootstrap's move: *your sample came from the true process, so treat it as a stand-in for the process and draw from it instead.*

```
For b = 1, …, B:
    draw n observations from your data WITH REPLACEMENT  →  D_b
    compute Ŝ_b = S(D_b)
Then [Ŝ_1, …, Ŝ_B] approximates the sampling distribution of Ŝ.
```

Structurally identical to the simulation matrix, with one substitution: **resampling the data replaces sampling the process.** Same `N × B` picture, same column-wise statistic. Only the source of the draws changed.

**With replacement is not optional.** Without it, every "resample" of size `n` from `n` rows is just the original dataset reordered, and every `Ŝ_b` is identical. Replacement is what creates variation.

### Why there is enough variation

The video's answer is a good one and worth keeping. How many ways can you resample `n` rows with replacement? `n` choices for the first slot, `n` for the second, and so on: **`nⁿ`**.

For `n = 100` that's `100¹⁰⁰ = 10²⁰⁰`. There are roughly `10⁸⁰` atoms in the observable universe. You could not exhaust the resamples of a hundred-row dataset with every computer that will ever exist. **The bootstrap is not recycling a small amount of information; it is sampling from an unimaginably large space.**

### Confidence intervals

Once you have `[Ŝ_1, …, Ŝ_B]`, report an interval covering most of it:

- **90%** — the .05 and .95 quantiles
- **95%** — the .025 and .975 quantiles
- **99%** — the .005 and .995 quantiles

Generally: pick a **level** `α` (0.10, 0.05, 0.01) and report `(q_{α/2}, q_{1−α/2})`. It's the quantile function from Sep 10, applied to the bootstrap replicates.

### What a confidence interval means

The video's last cell gets this right and it is the single most-misstated idea in statistics, so take the time:

> **It means:** if you repeat this entire procedure many times, 90/95/99% of the time the interval you construct will contain the true value.
>
> **It does not mean:** the true value lies in *this* interval with probability 0.95.

The true `S` either is or isn't in your interval — it's a fixed number, and there's no randomness left once you've computed the endpoints. The randomness lives in the *procedure*, not the parameter. As the video puts it: **a statistical reliability procedure, not a truth machine.**

### Hypothesis testing, in one line

Is a hypothesized value (usually 0) inside the interval? Inside → fail to reject the null. Outside → reject it. That's the whole mechanic, and Thursday builds on it.

Worth flagging the honest bit the video raises: researchers usually *want* to reject the null. Nobody runs an expensive trial hoping the effect is zero. Naming that incentive out loud is better than pretending the analysis is disinterested.

---

### Reading

*Key in `README.md`. From `Reading-Roadmap.md` unless marked [Map] (= `prep/ds5030_syllabus_reading_map.pdf`).*

- **Primary** — **AoS Ch. 5** (Convergence of Random Variables). **B&H has no dedicated section** — Ch. 10 covers the limit theorems underneath but never names "the sampling distribution" as its own object.
- **Supporting** — **AoS Ch. 6** (point estimation) for the "sampling distribution of a statistic" framing. **B&H Ch. 10, §10.2** (p. 431).
- **Fuller treatment** — **CASI §10.2**, *"The Nonparametric Bootstrap,"* which defines the sampling distribution as a repeatable thought experiment more concretely than either primary text. **CASI Ch. 2, §2.1** sets up hypothetical repeated datasets and the resulting ensemble of estimates on a real 211-patient kidney dataset.
- **Intuition first** — the same CASI passage, in its own words: imagine redrawing a fresh sample and recomputing the statistic thousands of times; the sampling distribution is the spread you would see if you actually could. That is §2's `N × T` matrix in prose.
- **Visuals for class** — **G&S Figs 9.5–9.6**, a simulated poll and the resulting 100 confidence intervals side by side — **the single best picture of what "95% of intervals cover" means**, and worth holding for Thursday. **CASI Fig. 2.1**, the kidney-dataset histogram. **Spiegelhalter (full book)** Ch. 7 Figs 7.1–7.3. **ROS Ch. 5**, `ProbabilitySimulation/probsim`.

---

## 3. The optimization view

- **Objective:** interval width, subject to covering `1 − α` of the bootstrap replicates
- **Argmin:** the equal-tailed `(q_{α/2}, q_{1−α/2})` interval — **but only when the sampling distribution is symmetric.** If it's skewed, the shortest interval is off-centre, pulled toward the peak
- **Solved by:** grid search — slide the left endpoint along the sorted replicates and keep the narrowest window that still covers `1 − α`

The percentile interval is a **convention, not a theorem.** It's the argmin of the objective above only under symmetry, and today's lightbulb example is exponential — genuinely skewed at small `N`. That's worth knowing before reporting one on a skewed statistic. `activity-two-distributions-skewed/` is built to show it, and Oct 1 explains why the equal-tailed convention is nevertheless defensible so often.

---

## 4. Assumptions that make it work

| Claim | Assumption |
|---|---|
| The simulation reveals the sampling distribution | You can draw from the true process. **True in simulation, false in life** — hence the bootstrap |
| `E[X̄ₙ] = μ`, `V[X̄ₙ] = σ²/n` | i.i.d., from Sep 3. Applies to each column of the matrix |
| Larger `T` improves the picture | Always — but it does **not** improve your estimate |
| Larger `N` improves the estimate | i.i.d. and finite variance |
| The bootstrap approximates the sampling distribution | Your sample is representative, and `n` is not tiny. The empirical distribution stands in for the true one |
| Resampling creates variation | **With replacement.** Without it there is none |
| The percentile CI is shortest | Symmetry of the sampling distribution. See §3 |
| The CI covers `1−α` of the time | The bootstrap approximation is good — which is a statement about `n`, not about `B` |

The last two rows carry the honest caveats. Note that **`B` and `n` do different things**: raising `B` sharpens your estimate of the sampling distribution, but it cannot fix a small `n`. That's the same `T` vs `N` distinction wearing bootstrap clothes, and students conflate them constantly.

---

## 5. Concrete failure cases

**The bootstrap fails for maxima and minima.** Estimate `max(X)` by bootstrap and the replicates can never exceed the largest value you observed — the bootstrap distribution piles mass on a handful of points and badly understates the uncertainty. Extremes are the standard counterexample and it takes thirty seconds. The general rule: the bootstrap works for statistics that are *smooth* functions of the data, and the max is not smooth.

**Small `n` cannot be rescued by large `B`.** With `n = 5`, running `B = 100,000` replicates gives you a beautifully resolved picture of a bad approximation. Students read a smooth bootstrap histogram as evidence of reliability; it's evidence of a large `B` and nothing else.

**Without replacement gives zero variance.** Worth demonstrating in one line — resample `n` from `n` without replacement, compute the statistic, and every replicate is identical.

**Heavy tails break everything upstream.** If the process has no finite variance, `σ²/n` is meaningless and the sampling distribution never settles. Sep 10's Cauchy is the example.

**Dependent data.** Time series, clustered surveys, repeated measures — resampling rows independently destroys the dependence structure and understates the variance. This is Sep 1's `PWGTP` clustering problem yet again, and it's the third time it's come up.

**Reading a CI as a probability statement about the parameter.** The most common error in the entire course. See §2 and §6 Q4.

---

## 6. Five questions students will ask

**Q1. "What is the difference between `N` and `T`? They both make the picture better."** They don't. `N` is how much data one study collects, and increasing it makes each individual estimate more accurate — that's `σ²/n` from Sep 3. `T` is how many times you *imagine* repeating the study, and increasing it doesn't improve any estimate; it just resolves the picture of how estimates vary. In real life `T = 1`: you ran the study once. The whole reason `T` appears at all is that frequentist statistics defines its guarantees in terms of a repetition that never happens. Keeping these apart is most of understanding this session.

**Q2. "The data are exponential — why does the sampling distribution look like a bell curve?"** Because averaging washes out the shape of the original distribution. That's the Central Limit Theorem, and it's remarkable precisely because it doesn't care what `X` looks like: skewed, bimodal, discrete, it doesn't matter, as long as the variance is finite. Oct 1 states it properly. For now the honest answer is: this is a real and surprising phenomenon, you're seeing it empirically, and we'll name it in two weeks. Watch what happens at small `N` though — at `N = 3` the skew is still visible. The bell shape needs `N` to be large enough, and "large enough" depends on how skewed the data are.

**Q3. "Isn't the bootstrap cheating? You're making up data."** No data is invented — every bootstrap value is an actual observation from your dataset. What's being simulated is the *sampling process*, not the data. The logic: your sample was drawn from the true process, so the empirical distribution of your sample is your best available estimate of that process; drawing from it is the closest thing you have to drawing from the process again. It's a substitution, and it's only as good as the substitution — which is why it needs a decent `n` and fails for statistics that depend on the extremes.

**Q4. "So there's a 95% chance the true value is in my interval?"** No, and this is the one to be pedantic about. Your interval is a pair of computed numbers; the true value is a fixed number. Either it's inside or it isn't — there's no probability left. What's 95% is the **procedure**: if you repeated the whole study-and-interval construction many times, 95% of the intervals so constructed would contain the truth. Yours is one draw from that collection and you don't get to know which kind you got. The probability is a property of the method, not of your particular answer.

**Q5. "How many bootstrap replicates do I need?"** Enough that your answer stops moving — run `B = 1000` twice with different seeds and see whether the interval endpoints agree to the precision you plan to report; if not, raise `B`. Typical practice is 1000–10,000, and it's cheap. But the important point is that `B` only controls the *Monte Carlo* error of your approximation, not the *statistical* error from having `n` observations. No value of `B` fixes a small sample. It's the `T` versus `N` distinction again.

---

## 7. Bugs and simplifications in the material

### Verified

- 🔴 **The first code cell crashes.** `08_01` cell 3 calls `expon.rvs(..., random_state=rng)`, but `rng` is never defined — the imports are `numpy`, `scipy.stats.expon`, `matplotlib`, `seaborn`, and nothing else. `NameError` on the video's first executable cell, and cells 6 and 8 repeat the same call. Add `rng = np.random.default_rng(20260922)`.
- 🔴 **The CLT formula in cell 12 divides by the variance instead of the standard deviation.** It writes `Z_T = √T((1/T)ΣŜ_t − E[S]))/V[S]`; the denominator must be `√V[S]`. I checked numerically on the notebook's own exponential: the correct standardization has sd 0.999, the notebook's has sd **1.999** — off by exactly `1/σ`. There's also an unbalanced parenthesis after `E[S]`.
- ⚠ **Cell 12 also states the theorem over the wrong index.** As written it's a CLT about the average of the `T` statistics — a quantity nobody in the notebook computes. The phenomenon on screen is the shape of the distribution of `X̄_N` itself, which is a CLT **in `N`**: `√N(X̄_N − μ)/σ → Normal(0,1)`. Since the cell's whole purpose is to explain the bell curves in cell 8, stating it over `T` explains the wrong picture.
- ⚠ **`λ` and `scale` are inconsistent.** Cell 5 says "λ = 0.5" and the code uses `expon.rvs(scale=0.5)`. In scipy, `scale` is the **mean**, i.e. `1/λ` — so `scale=0.5` means `λ = 2`. I checked: the sample mean is 0.500, so the rate is 2.0. Either the prose or the code needs changing, and given the prose also says "N=10 lightbulbs" this is worth getting right.
- **Cell 5 says `T = 100`; cell 6 uses `T = 50`.**
- **Cells 9, 10, 11 are broken stubs.** Cell 9 ends mid-sentence ("it's hard to "), cell 10 is a bare `##`, cell 11 is a "Confidence Intervals" heading with the fragment "Our overall estimate" and nothing else. CIs are covered properly in `09_2`, so cell 11 should be deleted rather than finished.
- **Cell 0 is a note-to-self**, not a title: "USE SIMULATION TO EXPLORE SAMPLING DISTRIBUTIONS".
- **`09_2` cell 2 has an empty bullet** — "## Sampling with Replacement" followed by a lone dash.
- **`09_2` has no code whatsoever.** Ten markdown cells.

### Correct — verified

The `nⁿ` argument in `09_2` cell 5 checks out: `100¹⁰⁰ = 10²⁰⁰`, against roughly `10⁸⁰` atoms in the observable universe. The confidence-interval definitions (cell 7) and the interpretation (cell 9) are both right, and cell 9 is unusually well put.

### Simplifications

- **`T` and `N` are never contrasted explicitly**, though the matrix makes the distinction visible. It's the session's main confusion and deserves a named paragraph.
- **The bootstrap's assumptions are never stated.** The material presents the algorithm and the interpretation but not when it fails (extremes, tiny `n`, dependence). §5 supplies them.
- **`B` versus `n`** is not distinguished — see §6 Q5.
- **"Suspiciously bell-shaped"** (cell 1 of `09_2`) is a nice phrase that promises an explanation the notebook never gives. Point forward to Oct 1.

---

## 8. Delivery plan

**Modes:** 🟦 notebook (student copy) · 🟩 instructor cells (pre-written, never live) · ⬛ board · 🟨 HTML widget

| # | Step | Mode | Time | Notes |
|---|---|---|---|---|
| 1 | **Quiz** | — | 10 min | Week 4: KDE, bias/consistency, hazard |
| 2 | "You already built one of these" | ⬛ board | 3 min | Sep 3's lab histogram **was** a sampling distribution. Name it. Best possible opening |
| 3 | A statistic is a random variable | ⬛ board | 4 min | Two distributions now in play: `X` and `X̄ₙ`. Be heavy-handed |
| 4 | **The `N × T` matrix** | ⬛ board | 6 min | Draw it. Columns are samples, rows are draws. **Then contrast `N` and `T` explicitly** — this is the session's crux |
| 5 | **The lightbulb simulation** | 🟩 instructor cells | 8 min | Fix the `rng` bug first. Show exponential data → bell-shaped means. Say "nothing is normal here" |
| 6 | `T` sweep: 10 → 10⁵ | 🟩 instructor cells | 4 min | Cell 8's `R = 10` overlay. Ten scattered curves collapsing onto one. `T` resolves, it doesn't improve |
| 7 | Frequentism, named | ⬛ board | 2 min | "If I repeated this many times…" — the framework behind everything that follows |
| 8 | **The pivot: you can't replicate** | ⬛ board | 3 min | `T = 1` in real life. This is the motivation for everything after the break |
| 9 | The bootstrap algorithm | ⬛ board | 4 min | Same matrix, one substitution. Replacement is not optional |
| 10 | **Run a bootstrap** | 🟩 instructor cells | 6 min | **Must build — `09_2` has no code.** Resample, histogram, overlay the simulated version from step 5. *They should coincide* |
| 11 | `nⁿ` | ⬛ board | 2 min | `100¹⁰⁰ = 10²⁰⁰` vs `10⁸⁰` atoms. Cheap and memorable |
| 12 | Confidence intervals | ⬛ board | 4 min | Quantiles of the replicates. It's Sep 10's `F⁻¹` again |
| 13 | **What a CI is not** | ⬛ board | 4 min | The reliability-procedure framing. Do not rush this |

**Build cost: steps 5, 6, 10 (~45 min)** — and step 10 is genuinely new, since the in-class notebook has no code at all.

**The single best thing you can build** is step 10 overlaid on step 5: simulate the sampling distribution by drawing fresh exponentials, then bootstrap it from *one* sample, and plot both on the same axes. When they land on top of each other, the bootstrap stops looking like a trick.

**Cut first:** step 11, then step 6. **Do not cut** step 4 or step 13.

---

## 9. Look ahead

- **Thursday (9/24) is the bootstrap lab** — clinical trials. Today's algorithm, applied. Everything in `09_2` after cell 5 is really Thursday's material; consider how much to front-load.
- **Sep 29's standard error is the standard deviation of the bootstrap replicates.** `09_2` cell 3 already says so. Today builds the collection; Thursday and Sep 29 summarize it.
- **Oct 1's CLT explains the bell curves seen today.** The video's cell 12 tries to state it and gets it wrong (§7). Better to leave it as an open observation — *"why does this keep happening?"* — and pay it off on Oct 1.
- **The skew of the exponential's sampling distribution at small `N`** is the CLT's rate of convergence. Notice it today; it makes Oct 1's "how large is large enough?" a real question rather than a formality.
- **The percentile interval's asymmetry problem (§3)** returns on Oct 1, where symmetry makes equal tails optimal.

## 10. Looking back

- **Sep 3 is the direct prerequisite and today is its payoff.** `E[X̄ₙ] = μ` and `V[X̄ₙ] = σ²/n` describe the centre and width of the object today finally draws. If the wages lab happened, §3 of it *was* today's session and students don't know it yet.
- **Sep 8's ECDF is the tool** — the video says the sampling distribution is estimated by "an ECDF of the values the statistic takes." That's Sep 8's estimator applied to a new sample.
- **Sep 10's quantile function `F⁻¹`** is what a confidence interval is made of.
- **Sep 15's KDE** is how the video plots the sampling *density* (`sns.kdeplot` in cells 6 and 8), and `09_2` cell 3 names it directly. Bandwidth matters here too — a jagged or over-smoothed sampling density is the same trade-off.
- **Sep 17's `K*`** was a statistic computed from 100 engines. "How much would it move with a different fleet?" is exactly today's question, and it's a good callback if the jet-engine lab ran.

---

## 11. Source map

- `class_10/08_01_sampling_distribution.ipynb` — 13 cells. Sampling distributions defined (1), **the `N × T` matrix (2)**, code (3, **crashes**), frequentist framing (4), lightbulbs (5), simulation (6), `T` sweep (8), the lesson (9, truncated), stubs (10, 11), **CLT (12, wrong)**.
- `class_10/09_2_intro_to_bootstrap.ipynb` — 10 cells, all markdown. Simulating the sampling distribution (1), sampling with replacement (2), **the algorithm (3)**, bootstrap vs simulation matrix (4), **`nⁿ` (5)**, communicating results (6), **confidence intervals (7)**, hypothesis testing (8), **interpretation (9)**.
- html `labs/class-10-bootstrap/` — `bootstrap.html` and `lecture.html`. The lecture covers the simulation matrix, the frequentist thought experiment, and "how many replications is enough?" with a non-normal example.
- Activity pages, all directly relevant today: `activity-standard-error/`, `activity-two-distributions/`, `-skewed/`, `-variance/`.

## 12. Open questions

- **Fix `08_01` before recording.** Three items: the undefined `rng`, the CLT formula's denominator, and the `λ`/`scale` mismatch. The first makes the video's code unrunnable and the second teaches a wrong formula.
- **Should cell 12's CLT be restated or deleted?** It explains the wrong picture (§7). My recommendation: delete it from the video and leave the bell curves as an open puzzle for Oct 1 — a question students carry for a week is worth more than a formula they can't yet parse.
- **Does `09_2` get code, and how much moves to Thursday?** It has none, and its last five cells (CIs, hypothesis testing, interpretation) arguably belong with Thursday's lab. Splitting it would give Tuesday a cleaner shape: simulation → the pivot → the algorithm, with inference on Thursday.
- **Did the Sep 3 wages lab get built?** Step 2 of the delivery plan assumes it did. If not, the opening changes and this session gets noticeably harder — it would be the first time students meet "a statistic is a random variable" with nothing concrete behind it.
