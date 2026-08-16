# Week 10, Thursday (Oct 29) — Maximum Likelihood Estimation

- **Syllabus topic (tentative):** MLE · week theme *"Likelihood & MLE"*
- **Day type:** Lab / Coding Day
- **Primary source:** `uu_sp26/.../01_probability/02_moments_and_likelihood.ipynb` §3, cells 39–45 and 49–54
- **Lab candidate:** `sp26/understanding_uncertainty_assignments/assignment_7.ipynb` **+ solutions** — likelihood/MLE/regression
- **Data:** 🔴 same missing files as Tuesday — fix before this session, since today is where the code cells live

> **Today is where the machine pays out**, and the payout is surprising: maximum likelihood keeps handing back estimators students already use. The normal gives the sample mean and the sample variance. The Bernoulli gives the sample proportion. Last week's transition matrix was one too. **"Count and divide" and "average it" turn out to be what maximizing a likelihood produces**, not folk recipes that happened to work.
>
> It's also where a thread opened in **Week 1** finally closes. The MLE for `σ²` divides by `n`, not `n−1` — and it is **biased**. I checked: `E[σ̂²_MLE] = (n−1)σ²/n`, which at `n = 12` is 0.916 times the truth. The `n−1` correction is a deliberate *departure* from maximum likelihood, not a refinement of it.

---

## 1. What students actually see

| Artifact | File | Status |
|---|---|---|
| Pre-class video | cells 39, 49 — the two maximizations | markdown; `alignat*` again |
| In-class | cells 40–45, 50–52 — fitted model, prediction, simulation, bootstrap | **has real code** — and 🔴 **needs the missing data** |
| Instructor cells | — | mostly exist once data is fixed |
| Lab | `assignment_7` + solutions | exists; scope needs checking (§12) |
| Board | — | Set the derivative to zero, twice; then the recipe |

---

## 2. The content, from scratch

### Maximizing: set the derivative to zero

Tuesday built `ℓ(θ)`. Today finds its peak.

For a smooth log-likelihood the recipe is the one from calculus: differentiate with respect to each parameter, set each derivative to zero, solve. The derivative of the log-likelihood has a name — the **score** — and "setting the score to zero" is the standard phrasing.

**Given this cohort, lead with the picture, not the calculus.** Plot `ℓ(μ)` against a grid of candidate `μ` values with `σ` held fixed, and let them see a curve with one peak. *The MLE is the top of that hill.* Then say that finding the top of a smooth hill means finding where the slope is zero, and only then write the derivative. Grid first, calculus second — the same move as Week 1's sum-of-squares parabola.

### Example 1 — the normal

Differentiate the log-likelihood from Tuesday with respect to each parameter:

```
∂ℓ/∂μ = Σᵢ (yᵢ − μ̂)/σ̂²           = 0
∂ℓ/∂σ = −n/σ̂ + Σᵢ (yᵢ − μ̂)²/σ̂³   = 0
```

Solve:

```
μ̂  = (1/n) Σᵢ yᵢ                    the sample mean
σ̂² = (1/n) Σᵢ (yᵢ − μ̂)²            the sample variance, with 1/n
```

**The first equation is worth reading before solving it.** `Σ(yᵢ − μ̂) = 0` says: *choose `μ̂` so the residuals sum to zero.* That's the same orthogonality condition as Week 1 Thursday's projection, and it's the same equation Week 1 Tuesday's sum-of-squares minimization produced. Three routes, one answer.

### The `1/n` that closes an old thread

Look hard at `σ̂²`. It divides by **`n`**, not `n − 1`.

Week 1 Tuesday raised the divisor question and deferred it. Sep 29 said it would matter for the standard error. Here is the resolution, and it's sharper than students expect:

- **The MLE for `σ²` is `(1/n)Σ(yᵢ − μ̂)²`, and it is biased.** `E[σ̂²_MLE] = ((n−1)/n)·σ²`. I checked numerically at `n = 12`: the MLE averages `3.663` against a true `σ² = 4.0`, a ratio of `0.9158` versus the predicted `0.9167`.
- **The familiar `s² = (1/(n−1))Σ(...)` is *not* the MLE.** It's the MLE multiplied by `n/(n−1)` specifically to remove that bias. Same numerical check: `3.996`.

So the two divisors answer different questions. Maximum likelihood asks *which parameter best explains the data I have*, and its answer is biased. Bessel's correction asks *which estimator is right on average across repeated samples*, and gives up the likelihood interpretation to get it.

**Maximum likelihood does not promise unbiasedness.** That's a genuine and slightly uncomfortable fact, and it's the honest answer to a question that's been sitting open since August. It also connects to Sep 15's KDE — the second deliberately biased estimator in the course.

### Example 2 — the Bernoulli

Differentiate Tuesday's cross-entropy expression:

```
ℓ′(p̂) = Σᵢ [ yᵢ/p̂ − (1−yᵢ)/(1−p̂) ] = 0
```

The source works the algebra in five lines and lands on

```
p̂ = (1/n) Σᵢ yᵢ            the sample proportion
```

### The pattern

Stop and name it, because it is the session's real content:

| Model | MLE | What we already called it |
|---|---|---|
| Normal `μ` | `(1/n)Σyᵢ` | the sample mean |
| Normal `σ²` | `(1/n)Σ(yᵢ−μ̂)²` | the sample variance |
| Bernoulli `p` | `(1/n)Σyᵢ` | the sample proportion |
| Markov transitions | count and divide | **Oct 20's transition matrix** |

**Every estimator this course has used since August turns out to be a maximum likelihood estimator.** They were introduced as sensible-looking things to compute; MLE is the principle that generates them.

**The Markov row is the one to save for the reveal.** Two weeks ago students estimated a transition matrix by counting transitions out of each state and dividing. That is exactly the MLE for a Markov chain, and now they have the machinery to see why: the likelihood of an observed path is the product of the transition probabilities along it, and maximizing it subject to each row summing to 1 gives count-and-divide. Nobody told them they were doing maximum likelihood at the time.

### What a fitted model buys you

Once you have `μ̂` and `σ̂`, you hold a complete probability model, and the source lists what that's worth:

- **Predict** — `F̂(y)` for any threshold. What fraction of the population is below this level?
- **Simulate** — draw from the fitted distribution to generate a synthetic population.
- **Infer** — **bootstrap the MLE** to get its sampling distribution.

That third one deserves emphasis. Sep 29 established that some statistics have a standard-error formula and most don't. **The bootstrap gives you the sampling distribution of *any* MLE without a formula** — resample the data, re-maximize, repeat. The source does it in one line per parameter, and it means the September machinery generalizes to every model built from here on.

### The recipe, and how far it reaches

The source's own summary is the right closing:

1. Model the randomness with a parametric distribution.
2. Compute the joint density of the observed data — the likelihood.
3. Maximize it.

And then the claim worth repeating: *"most of the methods you know of — OLS, logistic regression, k-means clustering — are just the MLEs for particular problems."* For a cohort meeting these in an ML course *this semester*, that reframing is the most valuable thing in the session. Nov 5 and Nov 10 are the demonstration: linear regression is MLE under normal errors, logistic regression is MLE under Bernoulli errors, and neither is a new idea.

### Fifteen minutes on MAP, if you want the Bayes thread

Optional, and cheap now that the log-likelihood is on the board. Add a term:

```
maximize   ℓ(θ) + log π(θ)
```

where `π(θ)` expresses a prior preference over parameter values. The maximizer is the **MAP estimate**, and it's MLE plus a penalty. Two payoffs: it's the honest bridge to any Bayesian session, and **it's what regularization is** — a Gaussian prior gives a squared penalty, a Laplace prior gives an absolute-value penalty. If the optimization block later covers regularization, this is where the idea is cheapest to plant.

---

### Reading

*Key in `README.md`. From [Map] (`prep/ds5030_syllabus_reading_map.pdf`); the detailed `Reading-Roadmap.md` stops at 10/1.*

- **Primary** — **AoS Ch. 9** (Parametric Inference), continuing Tuesday, specifically the **score function and Fisher information** material.
- **Applied companion** — **QE, "Maximum Likelihood Estimation"** (`intro.quantecon.org/mle.html`). [Map] notes it walks exactly the *"define the log-likelihood, hand it to an optimizer"* workflow in Python, which is what any model without a closed form requires.
- **Fuller treatment** — **C&B Ch. 7** (Point Estimation) for MLE properties, and **Ch. 10** (Asymptotic Evaluations) for consistency and asymptotic normality.
- **Worth knowing** — AoS Ch. 9 is also where the **asymptotic standard error of an MLE** comes from (via Fisher information), which is the closed-form alternative to bootstrapping it. Not needed today, but it's the answer to "isn't there a formula?"

---

## 3. The optimization view

- **Objective:** the log-likelihood `ℓ(θ)` built Tuesday
- **Argmax:** the MLE `θ̂`
- **Solved by:** closed form here — set the score to zero — but **numerically in general**, which is the case that matters

This is the session where the optimization spine stops being a framing device and becomes the topic. Every prior box had an argmin available in a line. From here on the objective is a log-likelihood over a model with several parameters, and *"set the derivative to zero and solve"* stops working the moment the model is interesting.

Say that explicitly, because it's the motivation for everything after Nov 10: **you write down the log-likelihood and hand it to an optimizer.** Logistic regression has no closed-form MLE. Neither does a Poisson regression, or almost any model with covariates. The two clean examples today are the last two you get for free.

---

## 4. Assumptions that make it work

| Claim | Assumption |
|---|---|
| Setting the score to zero finds the max | `ℓ` is **differentiable**, and the stationary point is a **maximum** not a minimum or saddle. Nobody checks the second-order condition here |
| A unique maximum exists | `ℓ` is well behaved. Multimodal likelihoods are common in mixtures and give the optimizer a choice of answers |
| `μ̂ = ȳ`, `σ̂² = (1/n)Σ(...)` | i.i.d. **and normality** |
| `p̂ = ȳ` | i.i.d. **and Bernoulli** |
| The MLE is a good estimator | **Asymptotically** — consistent and efficient as `n → ∞`. At finite `n` it can be biased, and for `σ²` it is |
| Bootstrapping the MLE gives valid inference | The bootstrap assumptions from Sep 22, plus a decent `n` |
| Being the MLE makes it unbiased | **False.** See `σ̂²` |

**Row 1 is the calculus gap.** "Set the derivative to zero" locates a stationary point; it takes a second-order check to know it's a maximum. Neither the source nor most first courses do this, and for a calculus-shy cohort the grid picture is the honest substitute — you can *see* it's a peak.

---

## 5. Concrete failure cases

**The MLE for `σ²` is biased**, verified above. This is the session's own best cautionary example and it's sitting in the material rather than needing to be imported.

**No closed form, and this is the normal case.** Logistic regression, Poisson regression, mixtures, almost anything with covariates: the score equations have no algebraic solution. What actually happens is numerical optimization, which introduces starting values, convergence tolerances, and the possibility of finding a local rather than global maximum. Today's two examples are unrepresentatively clean, and saying so prevents a nasty surprise on Nov 10.

**Boundary solutions.** Observe zero successes in `n` Bernoulli trials and the MLE is `p̂ = 0` — on the boundary, where the derivative never equals zero. The maximum is at an endpoint and the calculus recipe silently fails. Same structural issue as the zero-count problem in Oct 20's transition matrix.

**Wrong family, confident answer.** Fit a normal to skewed data and the MLE returns well-behaved estimates of the best *normal* approximation. The source's own example takes `log` of blood lead first, precisely because the raw variable isn't normal — worth pointing at, since it's an honest modelling decision made in public.

**Multimodal likelihoods.** Mixture models routinely have several local maxima, and which one you find depends on where the optimizer started. Not today's problem; very much a real one.

---

## 6. Five questions students will ask

**Q1. "Why does the MLE keep giving us things we already had?"** Because the things you already had were good. The sample mean, the sample variance, and the sample proportion were introduced in August as sensible ways to summarize data, and maximum likelihood is the principle that explains *why* they're sensible — each is the parameter value that makes the observed data most probable under its model. That's the session's real content: not new estimators, but the machine that generates the old ones. Its value shows up when you meet a model where you *can't* guess the right estimator, and the machine still works.

**Q2. "Why does the MLE for the variance divide by `n` when we were told `n−1`?"** Because they answer different questions and only one of them is the MLE. Maximum likelihood asks which `σ²` makes your data most probable, and the answer divides by `n`. That estimator is **biased** — on average across repeated samples it comes out about `(n−1)/n` times too small, because you used the data twice, once to estimate `μ̂` and again to measure spread around it. The familiar `s²` multiplies by `n/(n−1)` to remove exactly that bias, which means `s²` is *not* the maximum likelihood estimator. You're choosing between "best explains this sample" and "right on average across samples," and you can't have both here.

**Q3. "Is the MLE always the best estimator?"** No, and the variance case is the counterexample sitting right in the session. What's true is asymptotic: as `n → ∞` the MLE is consistent and, among a broad class, has the smallest possible variance. At finite `n` it can be biased, it can sit on a boundary, and for some problems a deliberately biased alternative has lower total error. It's the best *default* — a principled way to get an estimator when you don't already have one — rather than a guarantee of optimality.

**Q4. "What if I can't solve the derivative equation?"** That's the normal situation, not the exception. Logistic regression, Poisson regression, and essentially every model with covariates have score equations with no algebraic solution. What you do instead is write the log-likelihood as a function, hand it to a numerical optimizer, and let it climb the hill. The two examples today are clean because they were chosen to be; they're the last two you get for free, and Nov 10 is the first time you'll have to do it numerically.

**Q5. "How do I get a standard error for an MLE?"** Two routes. **Bootstrap it** — resample the data, re-maximize, and take the standard deviation of the resulting estimates. That's what the source does, it works for any MLE, and it needs no new theory beyond September. Or use the **asymptotic formula** based on Fisher information, which is what statistical software reports; it's faster, it's in AoS Ch. 9, and it's an approximation that's good for large `n`. The bootstrap is more honest at small `n` and more expensive. This is Sep 29's "some statistics have a formula and most don't," now with a general answer for the ones that don't.

---

## 7. Bugs and simplifications in the material

### Verified

- 🔴 **The data files are missing** — same as Tuesday, but today it actually blocks, because cells 40–45 and 50–52 are the session's code. `nhanes_data_17_18.csv` doesn't exist in either repo; `metabric.csv` exists in three other directories but not in `01_probability/data/`.
- **`alignat*` in cells 39 and 49** — the two maximizations, i.e. the session's core derivations.
- **Cell 54's conclusion is truncated** mid-sentence: *"The likelihood is a joint density, expressing the relative "*.
- **Cell 53 promises an exponential example** — *"the normal, exponential, and Bernoulli examples"* — that never appears anywhere in §3.
- **Cell 50's recoding maps `'0:LIVING' → 1.0`**, so `p̂` is the survival proportion while the source column's `1:` prefix means deceased. State the convention or `p̂` reads backwards.

### Simplifications

- **No second-order condition anywhere.** Setting the score to zero is presented as *the* method with no check that the stationary point is a maximum. Fine for these two convex-enough cases; worth one sentence, and the grid picture covers it honestly.
- **The `1/n` bias is never flagged.** Cell 39 derives `σ̂² = (1/n)Σ(...)` and moves on. This is the best available closure of a question the course opened in Week 1 and it's left on the table. §2 supplies it.
- **"Set the derivative to zero" assumes calculus fluency** the cohort doesn't have. Lead with a grid plot of `ℓ(μ)`.
- **No numerical optimization appears.** Both examples are closed-form, which makes MLE look easier than it is. QE's MLE lecture is the fix and [Map] recommends it specifically for this.
- **The Markov-chain connection is absent**, though it's the strongest available callback. §2's table makes it.
- **Fisher information / asymptotic SEs are never mentioned**, so "how do I get a standard error" has only the bootstrap answer here. That's a defensible choice for this cohort — just know it's a choice.

---

## 8. Delivery plan

**Modes:** 🟦 notebook (student copy) · 🟩 instructor cells (pre-written, never live) · ⬛ board · 🟨 HTML widget

| # | Step | Mode | Time | Notes |
|---|---|---|---|---|
| 1 | **The likelihood as a hill** | 🟩 instructor cells | 5 min | Plot `ℓ(μ)` over a grid, `σ` fixed. **Grid before calculus** — they should see the peak before differentiating it |
| 2 | Set the score to zero | ⬛ board | 3 min | Now the calculus, as the way to find the top of the hill |
| 3 | **Normal: `μ̂ = ȳ`** | ⬛ board | 5 min | Read `Σ(yᵢ − μ̂) = 0` aloud before solving — residuals sum to zero, i.e. Week 1's orthogonality |
| 4 | **Normal: `σ̂²`, and the `1/n`** | ⬛ board | 6 min | **The Week 1 loop closes here.** MLE is biased; `n−1` is a deliberate departure |
| 5 | Verify the bias numerically | 🟩 instructor cell | 3 min | Simulate at `n = 12`: MLE averages `3.663` vs true `4.0`; corrected gives `3.996` |
| 6 | Bernoulli: `p̂ = ȳ` | ⬛ board | 4 min | Five lines of algebra, or state it and point at the notebook |
| 7 | **The pattern table** | ⬛ board | 4 min | Mean, variance, proportion — **and Oct 20's transition matrix.** The reveal |
| 8 | Fitted model: predict and simulate | 🟩 instructor cells | 5 min | Cells 43–44 |
| 9 | **Bootstrap the MLE** | 🟩 instructor cells | 6 min | Cell 45. **Inference for any parameter with no formula** — the September machinery generalizing |
| 10 | The recipe, and how far it reaches | ⬛ board | 3 min | OLS, logistic, k-means are MLEs. Nov 5 and Nov 10 are the demonstration |
| 11 | *(optional)* MAP in fifteen minutes | ⬛ board | 5 min | `ℓ(θ) + log π(θ)`. The Bayes bridge, and regularization's origin |
| 12 | **Lab** | 🟦 notebook | rest | `assignment_7` — scope needs checking |

**Build cost: steps 1, 5, and fixing the data (~30 min).** Steps 8–9 exist once the CSVs resolve.

**Step 1 is the one that matters for this cohort.** Everything else assumes "set the derivative to zero" is a familiar move; the grid plot is what makes it one.

**Cut first:** step 11, then step 6's algebra. **Do not cut** steps 4, 7, or 9.

---

## 9. Look ahead

- **Nov 5's linear regression is today with `μ = xᵢᵀβ`.** "Least squares = MLE under normality" is Tuesday's step 8 generalized, and AoS Ch. 13 states it directly.
- **Nov 10's logistic regression is today with `p = p(xᵢ)`** — and it's the **first model with no closed-form MLE**, which is exactly why §5 flags that today's examples are unrepresentative.
- **Bootstrapping the MLE (step 9) is the inference tool for the rest of the course.** Every model from here has parameters, and most have no SE formula.
- **Step 11's MAP is where regularization comes from**, if the November optimization block covers it: a Gaussian prior is a squared penalty, a Laplace prior an absolute-value one.
- **The biased-MLE finding pairs with Sep 15's KDE** — two deliberately biased estimators, both defensible, for different reasons.
- **Any Bayesian session** starts from `ℓ(θ) + log π(θ)`, which step 11 plants for free.

## 10. Looking back

- **Tuesday built the objective.** Today maximizes it. If Tuesday's flip landed, today is mechanical.
- **Week 1 Tuesday's `1/n` variance** is finally explained — it's the MLE, and it's biased. That question has been open since August.
- **Week 1 Tuesday's sum-of-squares argmin** and **Week 1 Thursday's orthogonality** both reappear inside `Σ(yᵢ − μ̂) = 0`.
- **Sep 8's sample proportion** is the Bernoulli MLE.
- **Sep 22–29's bootstrap** becomes the general-purpose inference tool for parameters, which is what step 9 demonstrates.
- **Oct 20's transition matrix** was an MLE all along — step 7.

---

## 11. Source map

- `sp26/01_probability/02_moments_and_likelihood.ipynb` §3 — **today: cells 39–45, 49–54.** Normal maximization (39), NHANES fit (40–41), **prediction/simulation/inference framing (42)**, predict (43), simulate (44), **bootstrap the MLE (45)**, Bernoulli maximization (49), metabric fit (50–51), **bootstrap `p̂` (52)**, the recipe (53), conclusion (54, truncated).
- `sp26/understanding_uncertainty_assignments/assignment_7.ipynb` + `assignment_7_solutions.ipynb` — likelihood, MLE, and regression. Likely spans today and Nov 5; scope needs checking.
- `practice_exam_1` problem 3 (Poisson MLE) and `practice_exam_2` problem 3 (multinomial MLE) are both worked MLE problems — good quiz or exam material, and both are *derive the likelihood, then maximize it* in the shape of today's board work.
- Data: `nhanes_data_17_18.csv` 🔴 missing everywhere; `metabric.csv` 🔴 missing from `01_probability/data/` but present in three other directories.
- **No `uu_fa26` material and no HTML lecture exist for this session.**

## 12. Open questions

- 🔴 **Fix the data.** This is the blocking item: five of today's code cells depend on it. `metabric.csv` is a copy; NHANES needs sourcing or substituting (`get_data.py` in `01_probability/` may fetch it — worth checking first).
- **What's in `assignment_7`, and does it belong to today or Nov 5?** It covers likelihood, MLE, *and* regression, so it may span both. If it's regression-heavy it isn't today's lab, and today has none.
- **Is MAP in scope?** Fifteen minutes today makes any later Bayesian session cheap and gives regularization an origin story. It's the cheapest it will ever be to plant.
- **Add the exponential example** cell 53 promises. `λ̂ = 1/ȳ`, one parameter, and it connects to Sep 17's constant hazard.
- **Do asymptotic standard errors get mentioned?** The bootstrap covers today's needs, but students will meet Fisher-information SEs the moment they use `statsmodels`, and it's worth one sentence so the output isn't mysterious.
