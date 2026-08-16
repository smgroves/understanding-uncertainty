# Week 12, Tuesday (Nov 10) — Logistic Regression

- **Syllabus topic (tentative):** Logistic regression · week theme *"Regression"*
- **Day type:** Quiz / Math Day
- **Primary source:** `uu_sp26/.../02_modeling_simulation_inference/01_models_and_regression.ipynb` §2, cells 13–18 — **all markdown, no code**
- **Script:** `01_logistic_reg.py` in the same folder — a full worked NHANES fit ⚠ **has a dummy-variable bug (§7)**
- **Data:** `data/metabric.csv` ✅ present · `data/nhanes_data_17_18.csv` 🔴 **missing** — same file as Oct 27–29
- **Lab candidate:** `sp26` `assignment_6` + solutions (logistic)

> **This is the session where the closed forms run out**, and that is its most important content. The logistic score equation has *exactly* the same shape as OLS's — I verified it, `Xᵀ(y − p̂) = 0` — but `p̂` depends on `β` nonlinearly, so there is no algebra that solves it. You write the log-likelihood and hand it to an optimizer.
>
> **The source never says this.** It says the derivative `f = F(1−F)` "dramatically simplifies calculations" and moves on. But the no-closed-form fact is the entire motivation for Nov 12's gradients and the three optimization sessions after it. Without it, November looks like a detour.

---

## 1. What students actually see

| Artifact | File | Status |
|---|---|---|
| Quiz | — | On Week 11: linear regression as MLE, bootstrapped SEs |
| Pre-class video | cells 14–17 | needs porting; `alignat*` in cell 17 |
| In-class | cell 18 — interpretation, AME and MEM | markdown; the exercise is the session's substance |
| Instructor cells | `01_logistic_reg.py` | exists, but 🔴 loads missing data and has a dummy bug |
| Lab | `assignment_6` + solutions | exists |
| Board | — | The squash, the substitution, the score that won't solve, AME vs MEM |

**§2 contains no executable cells.** Six markdown cells, and the code lives in a separate `.py` file that loads a dataset which isn't in the repo.

---

## 2. The content, from scratch

### The problem with using OLS

Nov 5's model predicts any real number. That's fine for house prices and wrong for probabilities: fit a line to a 0/1 outcome and it will happily predict `1.3` or `−0.2`. There is no way to interpret those, and no amount of care with the features prevents it — the model has no mechanism to stay in range.

So you need a model whose predictions *are* probabilities by construction.

### The fix: squash the linear predictor

Keep the inner product `xᵢ·β` — it's still doing the work of combining features — and pass it through a function that maps all of `ℝ` into `(0,1)`:

```
pᵢ = F(xᵢ·β) = 1 / (1 + e^(−xᵢ·β))
```

That `F` is the **logistic function**, and students have met it twice already:

- **Sep 10** worked it as one of three named CDFs. It's a distribution function, so it maps into `(0,1)` *by definition* — that's what CDFs do. Nothing about the choice is arbitrary.
- **Sep 17** used it as a hazard example, where the algebra `f = F(1−F)` first appeared.

Worth naming the connection: **the reason the logistic function is the right shape is that it's a CDF**, and you need something whose range is exactly `(0,1)`.

### The likelihood, by substitution again

Same recipe as Nov 5, and only step 1 changes. Oct 27's Bernoulli log-likelihood was

```
ℓ(p) = Σᵢ [ yᵢ log p + (1−yᵢ) log(1−p) ]        with MLE  p̂ = ȳ
```

That model gives *every* observation the same `p`. Now let `p` depend on the observation:

```
ℓ(β) = Σᵢ [ yᵢ log pᵢ + (1−yᵢ) log(1−pᵢ) ],      pᵢ = 1/(1 + e^(−xᵢ·β))
```

That's it. **Nov 5 replaced `μ` with `xᵢ·β`; today replaces `p` with `F(xᵢ·β)`.** Same machine, different density in step 1 — exactly what the four-step recipe promised.

And the name to carry over from Oct 27: this is **binary cross-entropy**, negated. When their ML course says "minimize BCE," it means "maximize this."

### The score that looks solvable and isn't

Here is the session's real content, and it isn't in the source.

Differentiate the logistic log-likelihood with respect to `β`. Using `f = F(1−F)`, the algebra collapses beautifully:

```
∂ℓ/∂β = Σᵢ (yᵢ − pᵢ) xᵢ  =  Xᵀ(y − p̂)  =  0
```

**Compare that to Nov 5.** OLS gave `Xᵀ(y − Xβ̂) = 0`. Logistic gives `Xᵀ(y − p̂) = 0`. *The same statement* — the residual is orthogonal to every feature — with the fitted value changed from `Xβ̂` to `F(Xβ̂)`.

I verified it on the metabric data: after fitting, `Xᵀ(y − p̂)` comes out `[2.7e-05, 4.5e-03, 4.5e-03, −3.2e-04]`, zero to the optimizer's tolerance.

**And yet it cannot be solved.** In OLS, `Xβ̂` is linear in `β`, so `Xᵀ(y − Xβ) = 0` rearranges to `β̂ = (XᵀX)⁻¹Xᵀy`. Here `p̂ = F(Xβ)` sits inside a nonlinear function, `β` won't come out, and no rearrangement exists.

So you do the only remaining thing: **write `ℓ(β)` as a function, hand it to a numerical optimizer, and let it climb.** That is what `statsmodels` does when you call `Logit().fit()`, and it is what every model from here on requires.

Say this explicitly, because it reframes the rest of the semester:

> **Nov 5 was the last model that solves. From here on, fitting a model *is* running an optimization** — which is why the next three sessions are about how optimizers work.

### Interpreting the coefficients — where it gets genuinely harder

In linear regression a one-unit change in `x_k` moves `ŷ` by `β_k`, for every observation, always. **That is false here**, and the source is right to make it an exercise.

Differentiate the fitted probability:

```
∂pᵢ/∂x_ik = β_k · pᵢ(1 − pᵢ)
```

The effect on the probability depends on `pᵢ` — which depends on *all* of that observation's features. A one-unit change matters most for observations near `p = 0.5` (where `p(1−p) = 0.25` is largest) and hardly at all for observations already near 0 or 1. **The same coefficient produces a different effect for every person in your data.**

That's not a defect; it's the model being honest. Pushing someone from a 50% chance to a 60% chance is a real change; pushing someone from 0.1% to 0.12% is not, even if the underlying "score" moved identically.

So to report one number, you have to choose which one:

```
AME_k = (1/n) Σᵢ β_k pᵢ(1−pᵢ)         average marginal effect — compute the effect for everyone, then average
MEM_k = β_k p̄(1−p̄)                    marginal effect at the mean — build an average person, compute their effect
```

**These genuinely differ.** On the metabric fit:

| Feature | `β̂` | AME | MEM |
|---|---|---|---|
| Age at diagnosis | −0.0518 | −0.0109 | −0.0125 |
| Tumor size | −0.0236 | −0.0050 | −0.0057 |
| Positive lymph nodes | −0.0995 | −0.0210 | −0.0241 |

MEM runs about 15% larger than AME here. **AME is the better default** — it averages a quantity that's meaningful for each individual, whereas MEM evaluates at a hypothetical "average person" who may not resemble anyone in the data (and with dummy variables, an average person is 0.4 married, which is nobody).

The exercise's closing instruction is a good one: fit both logistic regression and OLS to the same binary outcome and compare. OLS on a 0/1 outcome — the *linear probability model* — gives coefficients that are directly readable as probability changes, and it predicts outside `[0,1]`. Seeing both is the honest way to understand what each buys.

### The log-odds reading

There's a second interpretation that *is* constant, and it's why the logistic function is used rather than any other squashing function. Rearranging:

```
log( pᵢ / (1 − pᵢ) ) = xᵢ · β
```

The **log-odds** are linear in the features. So `β_k` is the change in log-odds per unit of `x_k`, the same for everyone — and `e^{β_k}` is the **odds ratio**, which is what medical literature reports.

That's the same function students met on **Sep 10 as the logistic quantile function `F⁻¹(u) = μ + σ·log(u/(1−u))`**. The link function of logistic regression was worked as an inverse CDF two months earlier.

### "The simplest neural network"

Cell 16's aside is worth keeping for this cohort: logistic regression is a single-layer network with no hidden units and a sigmoid output. That's accurate, and it means the students' ML course is building on this rather than replacing it — a network is this model with layers of learned features inserted between `x` and the inner product, trained by minimizing the same cross-entropy with the same kind of optimizer.

---

### Reading

*Key in `README.md`. From [Map] (`prep/ds5030_syllabus_reading_map.pdf`); the detailed `Reading-Roadmap.md` stops at 10/1.*

- **Primary** — **AoS §13.7–13.8** (logistic regression), the direct match.
- **Supporting** — **AoS Ch. 9** for the MLE machinery being reused, and **Ch. 8** if the lab bootstraps the coefficients as Nov 5 did.
- **Applied companion** — **ROS Ch. 13–14** (Gelman, Hill & Vehtari) is the best available treatment of *interpreting* logistic coefficients, which is this session's hard part. Companion site: `avehtari.github.io/ROS-Examples`.
- **Gap flagged by [Map]** — **multinomial logit and discrete choice** aren't covered by AoS at all, and QE has no intro lecture on them either. If the lab extends past binary outcomes, that part is lecture-notes-only.
- **Worth knowing** — [Map] notes that once a model has no closed-form MLE, *"you're writing the log-likelihood and handing it to an optimizer,"* and points to **QE's MLE lecture** (`intro.quantecon.org/mle.html`) for that workflow in Python. That's this session's punchline with runnable code.

---

## 3. The optimization view

- **Objective:** the logistic log-likelihood `ℓ(β) = Σᵢ [yᵢ log pᵢ + (1−yᵢ)log(1−pᵢ)]` — equivalently, negative binary cross-entropy
- **Argmax:** `β̂`, characterized by `Xᵀ(y − p̂) = 0` — the same orthogonality condition as OLS
- **Solved by:** **numerically. There is no closed form, and this is the first time in the course that's true.**

Every optimization box since August has ended with an argmin you could write down: the mean, the median, a quantile, a bandwidth from a formula, `(XᵀX)⁻¹Xᵀy`. **Today the box ends with "run an optimizer," and that changes what the rest of the semester is about.**

The good news is that this objective is *concave*, so there's a single maximum and any sensible optimizer finds it. That won't always be true either — but it makes today's numerical fit trustworthy in a way that a general optimization isn't, and it's worth saying so before students meet a problem with local optima.

---

## 4. Assumptions that make it work

| Claim | Assumption |
|---|---|
| `pᵢ ∈ (0,1)` always | Automatic — `F` is a CDF. That's the whole reason for it |
| `Xᵀ(y − p̂) = 0` at the optimum | `ℓ` differentiable, and the optimizer converged |
| The optimizer finds *the* maximum | `ℓ` is **concave** in `β` for logistic regression, so a unique maximum exists. Not true in general |
| `β̂` is identified | `XᵀX` full rank **and no perfect separation** — see §5 |
| `β_k` is the effect on the probability | **False.** The effect is `β_k pᵢ(1−pᵢ)`, different for every observation |
| `β_k` is the effect on the log-odds | **True**, and constant. This is the interpretation that survives |
| Reported standard errors are right | Asymptotic, from the Fisher information. Bootstrap them if `n` is small or the model is shaky |

**Rows 5 and 6 together are the session's practical content.** Something *is* constant — the log-odds effect — and it isn't the thing people want to talk about. AME exists to translate back into the units anyone cares about.

---

## 5. Concrete failure cases

**Perfect separation.** If some feature perfectly predicts the outcome — every patient over 80 died, no exceptions — the likelihood has no maximum: pushing that coefficient toward infinity keeps improving the fit. The optimizer runs to a huge value and the standard error explodes. This is the failure mode with no analogue in OLS, it happens routinely with small samples and many dummies, and the symptom is a coefficient of 15 with a standard error of 4,000.

**The dummy-variable trap, and it's in the script.** `01_logistic_reg.py` builds four dummy sets and uses `drop_first=True` on three of them — the fourth has it **commented out**. With an intercept and a full set of race dummies, the columns are linearly dependent. That's Nov 5's rank condition and Sep 8's `drop_first` note, biting in a live script. See §7.

**AME reported as if it were the coefficient.** The `β̂` from `statsmodels` is a log-odds effect. Reporting it as "a one-unit increase raises the probability by 0.05" is simply wrong, and it's the most common misreading of logistic output in applied work.

**MEM at an average that describes nobody.** With dummy variables the "average person" is 0.4 married and 0.6 employed. AME averages over real people; MEM evaluates a fiction.

**Extrapolating the marginal effect.** Because `∂p/∂x = β p(1−p)`, the effect near the middle of the probability range is many times larger than at the edges. A marginal effect computed on one population doesn't transfer to another with a different baseline rate.

**Class imbalance.** With 2% positives, a model predicting "no" for everyone is 98% accurate and useless. Accuracy is the wrong metric; the likelihood itself is a better one. Not in the source, and worth thirty seconds since students meet accuracy everywhere.

---

## 6. Five questions students will ask

**Q1. "Why not just run OLS on a 0/1 outcome?"** You can, and it's called the linear probability model — it's legitimate, it's easy to interpret, and people use it. Its problems are that it predicts values outside `[0,1]`, which are uninterpretable, and its errors are necessarily heteroskedastic since a binary outcome's variance is `p(1−p)`, which varies with `x`. Logistic regression fixes both by construction. The honest comparison is the source's own exercise: fit both to the same data. Coefficients will often tell a similar story in the middle of the range and diverge at the extremes, which is exactly where the linear model's predictions stop making sense.

**Q2. "Why the logistic function specifically — why not any S-shaped curve?"** Two reasons, one principled and one practical. Principled: you need a function mapping all real numbers into `(0,1)`, and **any CDF does that by definition** — which is why the logistic works and why the normal CDF works too (that's probit, and it gives nearly identical fits). Practical: the logistic has the derivative identity `f = F(1−F)`, which makes the score collapse to `Σ(yᵢ − pᵢ)xᵢ` — clean enough to reason about and cheap to compute. It also gives the log-odds interpretation, which no other choice does as neatly.

**Q3. "So `β_k` is the effect on the probability?"** No, and this is the thing to get right. `β_k` is the effect on the **log-odds**, and that one is constant across observations. The effect on the *probability* is `β_k · pᵢ(1−pᵢ)`, which differs for every observation — largest near `p = 0.5`, nearly zero out in the tails. That's why the average marginal effect exists: it computes the probability effect for each person and averages, giving one number in the units you actually want. On the metabric fit, age has `β̂ = −0.052` but an AME of `−0.011`, so quoting the coefficient as a probability change would overstate it fivefold.

**Q4. "Why can't we just solve for `β̂` like we did last week?"** Because the equation you'd solve has `β` trapped inside a nonlinear function. Both models give the same condition — residual orthogonal to the features — but OLS's fitted value `Xβ` is *linear* in `β`, so it rearranges to `(XᵀX)⁻¹Xᵀy`. Here the fitted value is `F(Xβ)`, and there's no way to isolate `β`. So you write the log-likelihood as a function and let a numerical optimizer climb it. That's not a shortcoming of logistic regression — it's the normal situation, and last week was the exception.

**Q5. "Is this really the same as a neural network?"** It's the simplest one: an input layer, no hidden layers, and a sigmoid output. The generation loop is identical — combine inputs with weights, squash, produce a probability — and the training objective is the same cross-entropy minimized by the same kind of gradient-based optimizer. What a deep network adds is layers of learned intermediate features between `x` and the final inner product, so the model can represent relationships that no fixed set of columns could. The estimation *principle* doesn't change at all; it's maximum likelihood the whole way up.

---

## 7. Bugs and simplifications in the material

### Verified

- 🔴 **`01_logistic_reg.py` loads missing data.** `pd.read_csv('./data/nhanes_data_17_18.csv')` — that folder contains only `ames_prices.csv` and `metabric.csv`, and **NHANES doesn't exist anywhere in either repo.** Same missing file as Oct 27–29. The metabric case study works; the NHANES one doesn't.
- 🔴 **`01_logistic_reg.py` has the dummy-variable trap.** Three of four `get_dummies` calls use `drop_first=True`; the race one has it **commented out**: `pd.get_dummies(df['RacehispanicOriginWNhAsian'], dtype=int)#drop_first=True,dtype=int)`. With an intercept, the full dummy set is linearly dependent — the exact rank condition from Nov 5 §5 and Sep 8's `drop_first` note.
- **`01_logistic_reg.py` imports `skimpy`**, which is not a standard dependency. Confirm it's installed or drop the `skim(df)` call.
- **The notebook contradicts itself on linear-regression interpretation.** Cell 18 correctly says a small change in `x_ik` gives *"a `β_k` change in the prediction `ŷᵢ` for every `i`"* — the level-level reading. **Cell 6 says a 1% change gives a `β_k`% change** — the log-log reading. Cell 18 is right; cell 6 is the one to fix (already in `BUGS.md` from Nov 5).
- **`alignat*` in cell 17** — the log-likelihood derivation.
- **§2 has no code at all.** Six markdown cells; everything runnable is in the separate `.py`.
- **Cell 16's "two nodes in the output layer"** is imprecise for binary logistic regression, which has *one* output with a sigmoid. Two outputs with a softmax is the equivalent multi-class form, and it's overparameterized in the binary case. Minor, but the aside is doing real work for this cohort so it should be right.

### Correct — verified by fitting it

The algebra is sound. Cell 17's rewrite of `p` and `1−p` into `e^{xβ}/(1+e^{xβ})` and `1/(1+e^{xβ})` is correct, cell 18's derivative `∂pᵢ/∂x_ik = β_k pᵢ(1−pᵢ)` is correct, and both AME and MEM are correctly defined. I fitted the metabric model (n = 1,343): the score `Xᵀ(y − p̂)` vanishes at the optimum, and AME and MEM differ by roughly 15%.

### Simplifications

- 🔴 **The absence of a closed form is never stated.** This is the most consequential omission in the second half: it's the reason gradients and optimization occupy the next four sessions. §2 supplies it.
- **The score equation is never written.** `Σ(yᵢ − pᵢ)xᵢ = 0` is the cleanest possible bridge from Nov 5 — same form, unsolvable — and it's exactly what `f = F(1−F)` "simplifies" *to*. The notebook mentions the simplification without showing the result.
- **Concavity is never mentioned**, so "will the optimizer find the right answer?" has no answer here. It's yes for this model, and worth saying because it won't always be.
- **The log-odds interpretation is absent.** Cell 18 covers AME and MEM but never gives `log(p/(1−p)) = x·β`, which is the interpretation that's *constant* and the one clinical literature reports as an odds ratio.
- **Perfect separation is never mentioned**, though it's the failure mode unique to this model.
- **Standard errors don't appear at all.** Nov 5 bootstrapped its coefficients; today's session drops inference entirely, despite the syllabus theme being "Regression" both weeks.

---

## 8. Delivery plan

**Modes:** 🟦 notebook (student copy) · 🟩 instructor cells (pre-written, never live) · ⬛ board · 🟨 HTML widget

| # | Step | Mode | Time | Notes |
|---|---|---|---|---|
| 1 | **Quiz** | — | 10 min | Week 11: regression as MLE, SSE identity, bootstrapped SEs |
| 2 | Why OLS fails on a 0/1 outcome | 🟩 instructor cell | 4 min | Fit a line to binary metabric survival; print a prediction above 1 |
| 3 | **The squash, and why a CDF** | ⬛ board | 4 min | `pᵢ = F(xᵢ·β)`. **Sep 10 already worked this function as a CDF** — that's why its range is right |
| 4 | Substitute into the Bernoulli likelihood | ⬛ board | 4 min | Oct 27's `ℓ(p)` with `p → F(xᵢ·β)`. Only step 1 of the recipe changed |
| 5 | **The score: same form, unsolvable** | ⬛ board | 7 min | `Xᵀ(y − p̂) = 0` beside last week's `Xᵀ(y − Xβ̂) = 0`. **The session's centre** |
| 6 | Verify it numerically | 🟩 instructor cells | 4 min | Fit metabric, print the score, watch it vanish. Then say: no algebra gets you here |
| 7 | **"The last closed form was last week"** | ⬛ board | 3 min | Reframes Nov 12 onward as a consequence, not a detour |
| 8 | `β_k` is not the effect on `p` | ⬛ board | 5 min | `∂pᵢ/∂x_ik = β_k pᵢ(1−pᵢ)`. Largest at `p = 0.5`, vanishing in the tails |
| 9 | **AME vs MEM, computed** | 🟩 instructor cells | 6 min | The metabric table from §2 — they differ by ~15%. Say why AME is the better default |
| 10 | The log-odds reading | ⬛ board | 4 min | `log(p/(1−p)) = x·β`. Constant, and it's Sep 10's quantile function |
| 11 | The simplest neural network | 🟦 notebook | 2 min | Cell 16, with the output-layer wording fixed |
| 12 | **Lab** | 🟦 notebook | rest | `assignment_6` + solutions |

**Build cost: steps 2, 6, 9 (~35 min)** — plus deciding what to do about NHANES, since `01_logistic_reg.py` can't run as written. **Everything above works on `metabric.csv`, which is present**, so switching the worked example to metabric costs nothing and unblocks the session.

**Steps 5 and 7 are the ones to protect.** They're the only place the November optimization block gets motivated.

**Cut first:** step 11, then step 2. **Do not cut** steps 5, 7, or 9.

---

## 9. Look ahead

- **Nov 12's gradients exist because of step 5.** Once the argmax has no algebraic solution, you need a method for climbing a surface — that's the whole motivation, and today is where the need is created.
- **Nov 17–19's optimization sessions** generalize it: one dimension, then many.
- **Nov 24's regularization** adds a penalty to today's objective, and Oct 29's optional MAP step is where the penalty comes from. It's also the fix for perfect separation (§5) — a penalty stops coefficients running to infinity.
- **Concavity** is the property that makes today's fit safe; the optimization sessions will meet objectives that lack it.
- **AME** is the pattern for interpreting *any* nonlinear model, including the neural networks students meet next semester.

## 10. Looking back

- **Nov 5 is the direct parent** — same recipe, one substitution, and the score comparison in step 5 only works if last week's `Xᵀ(y − Xβ̂) = 0` is fresh.
- **Oct 27's Bernoulli likelihood** and the `p^y(1−p)^{1−y}` switching trick are what today parameterizes.
- **Oct 29's `p̂ = ȳ`** is today's model with no features — the intercept-only case.
- **Sep 10's logistic distribution** is the link function, worked as a CDF two months early; its quantile function is the log-odds.
- **Sep 17's `f = F(1−F)`** for the logistic hazard is the identity that makes the score collapse.
- **Sep 8's `drop_first=True`** is §5's dummy trap, live in the script.

---

## 11. Source map

- `sp26/02_modeling_simulation_inference/01_models_and_regression.ipynb` §2 — cells 13–18, all markdown. Predicting probabilities (14), the two cases (15), **Bernoulli likelihood / BCE, and "the simplest neural network" (16)**, **the logistic log-likelihood (17)**, **AME and MEM exercise (18)**.
- `01_logistic_reg.py` — a full NHANES workflow: dummy construction, `statsmodels` fit. 🔴 Missing data and a `drop_first` bug; also imports `skimpy`.
- `sp26/assignment_6.ipynb` + `assignment_6_solutions.ipynb` — the logistic lab, both present.
- Data: `data/metabric.csv` ✅ (1,343 usable rows with age, tumour size, positive nodes). `data/nhanes_data_17_18.csv` 🔴 absent.
- §3 of the same notebook is **Poisson regression** — the third instance of the recipe, unscheduled but available if a session needs filling.
- **No `uu_fa26` material and no HTML lecture exist for this session.**

## 12. Open questions

- 🔴 **Switch the worked example to metabric, or source NHANES.** `01_logistic_reg.py` can't run as written, and metabric is present and works. Switching is the cheap fix and keeps continuity with Nov 5's second case study, which is already stubbed in cell 12.
- 🔴 **Fix the `drop_first` bug in `01_logistic_reg.py`** before anyone runs it.
- **Add the score equation and the no-closed-form statement** to the material, not just the board. It's the hinge between the regression weeks and the optimization weeks.
- **Does this session do inference?** Nov 5 bootstrapped coefficients; today's source has nothing on standard errors. If the "Regression" theme is meant to cover inference both weeks, that needs building.
- **What's in `assignment_6`?** It's the natural lab and I haven't opened it. Worth checking whether it uses NHANES too.
- **Is Poisson regression (§3) wanted anywhere?** It's written, it's the same recipe a third time, and the second half has no session assigned to it.
