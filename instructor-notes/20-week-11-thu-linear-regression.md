# Week 11, Thursday (Nov 5) — Linear Regression: Inference and Bootstrapping

- **Syllabus topic (tentative):** Linear regression (inference, bootstrapping) · week theme *"Regression"*
- **Day type:** Lab / Coding Day · **Tuesday Nov 3 is Election Day — no class**
- **Primary source:** `uu_sp26/.../02_modeling_simulation_inference/01_models_and_regression.ipynb` §1, cells 0–12
- **Also available:** `01_linear_reg.py` in the same folder
- **Data — present:** `data/ames_prices.csv` (2,930 rows) and `data/metabric.csv`, both alongside the notebook ✅
- **Lab candidate:** `sp26` `assignment_7` + solutions

> **This session has a single job: show that linear regression is not a new method.** It is Oct 29's maximum likelihood with `μ` replaced by `xᵢ·β`. Everything else — the closed form, the standard errors, the interpretation of coefficients — follows from that one substitution.
>
> The source states the payoff plainly and it belongs on the board verbatim: **"whenever you are minimizing SSE, you are essentially assuming normally distributed errors, whether you make it explicit or not."**
>
> After four sessions of missing data, **this one's data is present and the code runs.** I fitted it: OLS via the normal equations and MLE via numerical maximization agree to `1.25e-04`.

---

## 1. What students actually see

| Artifact | File | Status |
|---|---|---|
| Pre-class video | `01_models_and_regression` cells 1–9 | needs porting; `alignat*` in cell 8 |
| In-class | cells 10–12 + the `statsmodels` fit | data present, code runs |
| Instructor cells | `01_linear_reg.py` | exists — check what it does |
| Lab | `assignment_7` + solutions | scope spans MLE and regression; needs splitting |
| Board | — | The substitution, the SSE identity, orthogonality, bootstrapped SEs |

**Two datasets, both present.** Ames house prices (2,930 rows) for the hedonic-pricing case, and `metabric` for the survival outcome that becomes Tuesday's logistic example. The source is candid about `statsmodels` — *"I'm not super fond of StatsModels, but it's quick"* — which is a fair thing for students to hear about a tool.

---

## 2. The content, from scratch

### The substitution

Oct 29 fitted a normal with two parameters, `μ` and `σ`. The model was `yᵢ = μ + σεᵢ`: every observation has the *same* mean.

That's the limitation. Houses don't all have the same expected price — a bigger house costs more. So let the mean depend on the observation:

```
yᵢ = xᵢ·β + σεᵢ            with  εᵢ ~ Normal(0,1)
```

`μ` has become `xᵢ·β`, an inner product of that observation's features with a coefficient vector. **That is the entire modelling step**, and the source's four-step recipe generalizes it:

1. Pick a density whose **support matches your outcome** — any real number, positive only, binary, a count, a duration.
2. **Replace its parameters with functions of the data** — `μ = xᵢ·β`, or `λ = exp(xᵢ·β)`.
3. Choose `β` to maximize the likelihood.
4. Use the fitted model to predict, simulate, and quantify uncertainty.

Step 1 is the choice that varies by problem; steps 2–4 never change. Logistic regression on Tuesday is the same recipe with a Bernoulli in step 1, and Poisson regression is the same again with a Poisson. **Three "different" models, one machine.**

### Deriving the likelihood

Solve the model for the shock and substitute into the normal density, exactly as Oct 27:

```
εᵢ = (yᵢ − xᵢ·β)/σ

contribution of observation i:   (1/σ)·φ((yᵢ − xᵢ·β)/σ)

L(β,σ) = ∏ᵢ (1/(√(2π)σ)) exp{ −½((yᵢ − xᵢ·β)/σ)² }

ℓ(β,σ) = −n log√(2π) − n log σ − Σᵢ ½((yᵢ − xᵢ·β)/σ)²
```

Nothing here is new. It is Oct 27's normal log-likelihood with `μ` swapped for `xᵢ·β`, and it's worth saying that out loud rather than re-deriving from scratch.

### The identity that explains least squares

Pull the `σ` out of the sum:

```
ℓ(β,σ) = −n log√(2π) − n log σ − (1/(2σ²)) · Σᵢ (yᵢ − xᵢ·β)²
                                              └──────┬──────┘
                                            sum of squared error
```

**Everything depending on `β` sits in that one term, multiplied by a negative constant.** So maximizing the log-likelihood over `β` is *exactly* minimizing the SSE — and `σ` doesn't even enter the choice of `β`, since it only scales a term that's already being minimized.

The source's line is the one to put on the board:

> **"Whenever you are minimizing SSE, you are essentially assuming normally distributed errors, whether you make it explicit or not."**

For this cohort that sentence does a lot of work. Their ML course will hand them squared-error loss as a default. This says what the default *assumes* — and it means "use a different loss" is really "assume a different error distribution."

### The closed form, and the orthogonality it hides

Differentiating and setting to zero gives the normal equations, and unlike Oct 29's examples this one solves in matrix form:

```
β̂ = (XᵀX)⁻¹ Xᵀy
```

But write the score before you solve it:

```
Xᵀ(y − Xβ̂) = 0
```

**That is Sep 3's equation.** It appeared in the inner-product session's list of applications — *"solving for the optimal coefficients in a linear regression model is the orthogonality condition"* — eleven weeks before regression. It says the residual vector is orthogonal to every column of `X`: whatever is left over is uncorrelated with everything you used to explain it.

I checked it on the Ames fit — `Xᵀ(y − Xβ̂)` comes out `[0, −1.2e-07, −2.0e-09]`, zero to numerical precision.

So the three routes converge, and it's worth drawing:

| Route | Session | Answer |
|---|---|---|
| Minimize squared error | Aug 27 | `β̂` |
| Make the residual orthogonal | Sep 3 | `β̂` |
| Maximize the normal likelihood | today | `β̂` |

**Verified on the real data:** the normal equations give `[11.5658, 0.000468, −0.006402]` and numerically maximizing the log-likelihood gives the same to `1.25e-04`. Worth running live — it's a two-minute cell and it makes "these are the same thing" a demonstration rather than a claim.

Also: `σ̂ = √(SSE/n) = 0.2244` on that fit — the same `1/n` MLE from Oct 29, still biased, now in a regression.

### Prediction versus simulation

The source separates two things students routinely conflate:

- **Prediction** — `ŷᵢ = xᵢ·β̂`, a single number, the conditional mean.
- **Simulation** — `ŷᵢ = xᵢ·β̂ + σ̂εᵢ`, a *draw*, which includes the noise.

Cell 11's exercise makes this concrete: for each house, draw 1,000 shocks and plot the resulting density of realized prices. **The point estimate is the centre of a distribution, not the answer.** A house predicted at $200k with `σ̂ = 0.224` on the log scale has a genuinely wide range of plausible actual prices, and showing that is more honest than reporting a single number.

That distinction is Oct 15's conditional expectation, arriving in a form students can plot: `E[Y|X=x]` is the prediction, and the spread around it is `V[Y|X=x]`.

### Inference: bootstrap the coefficients

The schedule specifies *"inference, bootstrapping"*, and this is where September pays off.

`statsmodels` reports standard errors from a closed-form formula that assumes homoskedastic normal errors. The bootstrap doesn't need that assumption: resample rows, refit, collect `β̂`, and the spread of those replicates is the sampling distribution of the coefficient.

Two things worth drawing out. **This is Sep 22–29's machinery applied to a new statistic** — `β̂` is a statistic like any other, so it has a sampling distribution, and a percentile interval works on it unchanged. And **the two standard errors can disagree**, which is informative: if the bootstrap SE is much larger than the reported one, the model's assumptions are doing work the data don't support.

There's a modelling choice inside the bootstrap worth naming: **resample rows, or resample residuals?** Row resampling treats the `x` values as random and is robust to heteroskedasticity. Residual resampling holds `X` fixed and assumes the errors are identically distributed. Row resampling is the safer default and the one to teach.

### Why this model is everywhere

The source's five reasons are good and worth keeping, with one correction (§7):

1. **Closed form** — `(XᵀX)⁻¹Xᵀy`, no optimizer needed.
2. **Interpretable coefficients** — but see §7; the stated interpretation is the log-log one.
3. **Flexible despite being "linear"** — linear in `β`, not in `x`. Add `x²`, `log x`, or interactions and you fit curves. "Linear regression" constrains how parameters enter, not the shape of the fit.
4. **Regularizable** — ridge and lasso handle overparameterized models.
5. **Fast** — it's inner products, and hardware is built for those. Sep 3's closing point.

---

### Reading

*Key in `README.md`. From [Map] (`prep/ds5030_syllabus_reading_map.pdf`); the detailed `Reading-Roadmap.md` stops at 10/1.*

- **Primary** — **AoS Ch. 13** (Linear and Logistic Regression), which [Map] calls the direct match, *"including the least squares = MLE under normality equivalence."*
- **Supporting** — **AoS Ch. 8** (The Bootstrap) for the bootstrap-SE half. Same chapter as Sep 24, applied to a coefficient.
- **Fuller treatment** — **C&B Ch. 11–12** for the linear-model derivations at more depth.
- **Applied companion** — **ROS** (Gelman, Hill & Vehtari, *Regression and Other Stories*) is the whole book on this topic, and its companion site (`avehtari.github.io/ROS-Examples`) has runnable examples. Chapters 6–8 are the direct match.
- **Gap flagged by [Map]** — *missing data and imputation* isn't covered in depth by any of these; Little & Rubin is the standard reference. Relevant if the lab touches imputation.

---

## 3. The optimization view

- **Objective:** the normal-linear log-likelihood — equivalently, `Σᵢ (yᵢ − xᵢ·β)²`, the sum of squared errors
- **Argmin:** `β̂ = (XᵀX)⁻¹Xᵀy`, characterized by `Xᵀ(y − Xβ̂) = 0` — the residual orthogonal to every column of `X`
- **Solved by:** closed form, and it's the **last one in the course**

This is the spine's payoff session. Aug 27 minimized squared distance to a single number and got the mean. Sep 3 minimized squared distance to a line and got a projection. Today minimizes squared distance to a *plane spanned by your features* and gets regression. **Same objective, three sessions, increasing dimension** — and the orthogonality condition is identical in all three.

It is also the last closed form. Tuesday's logistic regression has none, and from there on the argmax is found numerically. Worth saying so explicitly: **the era of solving for the answer ends here.**

---

## 4. Assumptions that make it work

| Claim | Assumption |
|---|---|
| `ℓ` is maximized where SSE is minimized | Normal errors. The identity is exact, not approximate |
| `β̂ = (XᵀX)⁻¹Xᵀy` | **`XᵀX` is invertible** — no column of `X` is a linear combination of the others |
| Reported (analytic) standard errors are right | **Homoskedasticity** — `V[εᵢ]` the same for all `i` — plus independence and normality |
| Bootstrap standard errors are right | Independence across rows. **Does not need homoskedasticity or normality** |
| `β̂` is unbiased for `β` | The model is correctly specified and `E[ε|X] = 0` |
| `β_k` is the effect of `x_k` | **Nothing in the data justifies this.** It's a conditional association |
| `σ̂² = SSE/n` is unbiased | **No** — same `1/n` MLE bias as Oct 29. The unbiased version divides by `n − p` |

**Row 3 vs row 4 is the session's practical content.** The analytic SE needs assumptions the bootstrap doesn't, which is exactly why the schedule pairs them. Comparing the two is a specification check you get for free.

**Row 6 is the one with consequences outside the classroom**, and it's Oct 15's fireplace problem in a new costume — see §5.

---

## 5. Concrete failure cases

**`XᵀX` singular.** Include a full set of dummy variables *and* an intercept, and the columns sum to the intercept — the matrix has no inverse and the closed form fails. This is Sep 8's `drop_first=True` finally explained: it isn't a convention, it's a rank condition. Perfectly collinear features do the same thing, and near-collinearity produces enormous standard errors rather than an outright error, which is worse because nothing warns you.

**Heteroskedasticity quietly breaks the reported SEs.** House-price errors are larger for expensive houses. The coefficient estimates stay unbiased, but the analytic standard errors are wrong, so every p-value and interval is off. **The bootstrap is immune to this**, which is the practical argument for the schedule's pairing — and a visible gap between the two SEs is a diagnostic.

**Reading `β_k` as a causal effect.** The regression tells you how `y` differs across observations that differ in `x_k` *and happen to differ in whatever else is correlated with it*. It's Oct 15's fireplaces: the coefficient is real, and it isn't the effect of intervening. Adding controls narrows the comparison; it doesn't make it causal.

**Extrapolation.** The model will happily predict a price for a house four times bigger than anything in the data. Nothing in the fit knows it has left the region where the linear approximation was checked.

**Prediction intervals confused with confidence intervals.** The uncertainty in `x·β̂` (how well do we know the mean?) is much smaller than the uncertainty in a new `y` (which also carries `σε`). Cell 11's simulation exercise is the fix — it shows the second, which is the one a homeowner cares about.

**The `1/n` in `σ̂²`.** Same bias as Oct 29, now with `p` parameters estimated, so the unbiased divisor is `n − p`. Worth one sentence since the thread is now familiar.

---

## 6. Five questions students will ask

**Q1. "Is linear regression the same as least squares, or the same as maximum likelihood?"** Both, and that's the session. Least squares says: pick the `β` minimizing `Σ(yᵢ − xᵢ·β)²`. Maximum likelihood says: assume normal errors and pick the `β` making the data most probable. Those turn out to be the *same optimization*, because the only place `β` appears in the normal log-likelihood is inside a negative sum of squares. Historically least squares came first and the likelihood justification came later — which is why the connection feels like a coincidence and isn't. The practical upshot: minimizing squared error is a distributional assumption, whether or not anyone says so.

**Q2. "Why is it called *linear* if I can fit curves with it?"** Because "linear" describes how the **parameters** enter, not the shape of the fit. `y = β₀ + β₁x + β₂x²` is a parabola in `x` and perfectly linear in `β` — and `β` is what you're solving for. You can include `log x`, interactions, splines, indicator variables, and the model stays linear in the sense that matters, which is that `Xᵀ(y − Xβ) = 0` still has a closed-form solution. What you cannot do is something like `y = β₀ exp(β₁x)`, where a parameter sits inside a nonlinear function.

**Q3. "Why bootstrap the standard errors when `statsmodels` already prints some?"** Because the printed ones assume homoskedasticity — that every observation's error has the same variance — along with independence and normality. Real data routinely violates the first: house-price errors are bigger for expensive houses. The bootstrap needs only independence across rows, so it stays valid where the formula doesn't. Run both and compare: if they agree, the assumptions are doing no harm; if the bootstrap SE is substantially larger, the reported one was over-confident and every interval built from it is too narrow.

**Q4. "Does `β_k` tell me the effect of `x_k`?"** No — it tells you how `y` differs, on average, between observations that differ in `x_k` while the other included variables are held fixed. Whether that difference is *caused* by `x_k` depends on whether anything omitted is correlated with both, and no amount of fitting can check that. It's the fireplace problem from October: houses with more fireplaces are also bigger and newer, and controlling for size and age narrows the comparison without making it an intervention. The regression is a description of a conditional association, and the causal reading is an additional claim you have to defend separately.

**Q5. "What happens if my errors aren't normal?"** Less than you'd fear for the estimates, more than you'd like for the inference. `β̂` remains unbiased and — because it's a weighted average of the `y`'s — the CLT means its own sampling distribution tends toward normal regardless, so large-sample intervals are often fine. What degrades is small-sample inference and anything sensitive to the tails: with heavy-tailed errors, least squares chases outliers badly, since squaring makes one extreme residual enormously expensive. That's Aug 27's mean-versus-median lesson at the level of a whole model, and the fixes are the same in spirit — a different loss, which is a different error distribution.

---

## 7. Bugs and simplifications in the material

### Verified

- **Cell 6's coefficient interpretation is wrong as stated.** It says *"a 1% change in `x_ik` leads to a `β_k`% change in `y_i`."* That's the **log-log** (elasticity) interpretation, which holds only when both `y` and `x` are logged. For the plain model `y = x·β`, a **one-unit** change in `x_k` gives a **`β_k`-unit** change in `y`. The case study logs *price* but not the features, which is a **log-level** model: a one-unit change in `x_k` gives roughly a `100·β_k` **percent** change in `y`. Three different readings, and the notebook states one of them as general. **Coefficient interpretation is exactly what applied readers get wrong**, so this is worth fixing carefully rather than trimming.
- **`alignat*` in cell 8** — the likelihood derivation. Same MathJax fragility as every prior session.
- **Cell 12 is a stub** — *"Case: Now, let's predict who survives in the breast cancer data set"* with nothing following. That's the metabric example, and it's the natural bridge to Tuesday's logistic regression.

### Correct — verified by fitting it

I ran the model on `ames_prices.csv` (2,930 rows, log price on area and age): the normal equations give `[11.5658, 0.000468, −0.006402]`, numerically maximizing the log-likelihood gives the same to `1.25e-04`, `σ̂ = √(SSE/n) = 0.2244`, and `Xᵀ(y − Xβ̂) = [0, −1.2e-07, −2.0e-09]`. The SSE identity in cell 10 and the closed form in cell 6 are both right.

### Simplifications

- **No second-order condition**, same as Oct 29 — setting the score to zero is presented as *the* method.
- **The orthogonality condition is never written.** Cell 6 gives `β̂ = (XᵀX)⁻¹Xᵀy` directly, skipping `Xᵀ(y − Xβ̂) = 0` — which is the form that connects to Sep 3 and the one worth remembering. §2 supplies it.
- **`σ̂²`'s bias isn't mentioned**, and with `p` parameters the correct divisor is `n − p` rather than `n − 1`. Third appearance of this thread.
- **Row vs. residual bootstrap isn't distinguished**, though the schedule asks for bootstrapping specifically. §2 names the choice.
- **Homoskedasticity is never stated as an assumption**, so "why bootstrap at all" has no answer in the material. It's the whole reason the schedule pairs them.
- **The source is explicit about scope** — *"we're not focusing on machine learning best practices today (train-test split, cross validation, feature engineering)"* — which is honest and worth repeating to students, since their ML course is covering exactly those.

---

## 8. Delivery plan

**Modes:** 🟦 notebook (student copy) · 🟩 instructor cells (pre-written, never live) · ⬛ board · 🟨 HTML widget

| # | Step | Mode | Time | Notes |
|---|---|---|---|---|
| 1 | **The substitution: `μ → xᵢ·β`** | ⬛ board | 4 min | One line. Oct 29's model with a mean that varies by observation |
| 2 | The four-step recipe | 🟦 notebook | 3 min | Cell 3. Say that steps 2–4 never change — Tuesday only changes step 1 |
| 3 | The likelihood, by substitution | ⬛ board | 4 min | Don't re-derive; point at Oct 27 and swap `μ` |
| 4 | **The SSE identity** | ⬛ board | 5 min | Pull out `1/(2σ²)`. **Then read the source's line aloud**: minimizing SSE *is* assuming normal errors |
| 5 | **Three routes, one answer** | ⬛ board | 4 min | Aug 27 (squares), Sep 3 (orthogonality), today (likelihood). Write `Xᵀ(y − Xβ̂) = 0` |
| 6 | **Verify it numerically** | 🟩 instructor cells | 5 min | Normal equations vs. numerical argmax on Ames: agree to `1.25e-04`. Print `Xᵀ(y − Xβ̂)` and watch it be zero |
| 7 | Fit it with `statsmodels` | 🟩 instructor cells | 4 min | The workflow they'll actually use |
| 8 | **Prediction vs. simulation** | 🟩 instructor cells | 6 min | Cell 11's exercise: 1,000 shocks per house, plot the density. **The point estimate is the centre of a distribution** |
| 9 | **Bootstrap the coefficients** | 🟩 instructor cells | 7 min | Resample rows, refit, collect `β̂`. **Compare against the reported SE** — a gap is a diagnostic |
| 10 | Why this model is everywhere | 🟦 notebook | 3 min | Cell 6's five reasons — **with the interpretation fixed** (§7) |
| 11 | **Lab** | 🟦 notebook | rest | `assignment_7`, scope permitting |

**Build cost: steps 6, 8, 9 (~40 min).** Step 9 has no source cell at all and is what the schedule explicitly asks for.

**Step 6 is the one I'd protect.** Three sessions have claimed these are the same optimization; this is where it becomes a printed number.

**Cut first:** step 10, then step 7. **Do not cut** steps 4, 5, or 9.

---

## 9. Look ahead

- **Tuesday's logistic regression is step 1 with a Bernoulli.** Same recipe, different density — and **no closed form**, which makes it the first model that genuinely requires an optimizer. Today is the last free lunch, and saying so sets up the optimization block.
- **Nov 12's gradients** exist because of that. Once the argmax has no algebraic solution you need a way to climb the hill, which is the whole motivation for the November optimization sessions.
- **Regularization** (if the Nov 24 session happens) is this objective plus a penalty — and Oct 29's optional MAP step is where that penalty comes from. Cell 6 already name-drops LASSO and ridge.
- **The `XᵀX` singularity** (§5) is where Sep 8's `drop_first=True` gets its real explanation.
- **Bootstrapped coefficient intervals** are the inference tool for every model from here.

## 10. Looking back

- **Oct 29 is the direct parent.** Today is that session with `μ = xᵢ·β`. If the MLE recipe landed, today is a substitution.
- **Sep 3 predicted this exact equation.** The inner-product session listed `Xᵀ(y − Xβ) = 0` among the applications of orthogonality, eleven weeks early. Closing that loop is the most satisfying callback available in the course.
- **Aug 27's sum of squares** is the objective, now in `p` dimensions.
- **Oct 15's conditional expectation** is what `xᵢ·β̂` estimates — and Oct 13 showed that under joint normality the CEF *is* linear, which is why this model is the right shape rather than a convenient one.
- **Sep 22–29's bootstrap** applies unchanged to `β̂`.
- **Sep 8's `drop_first`** is §5's rank condition.

---

## 11. Source map

- `sp26/02_modeling_simulation_inference/01_models_and_regression.ipynb` §1 — cells 0–12. Introduction and the `statsmodels` caveat (1–2), **the four-step recipe (3)**, roadmap (4), **linear regression as MLE + the five reasons (6, interpretation bug)**, hedonic pricing (7), **deriving the likelihood (8)**, the log-likelihood (9), **the SSE identity (10)**, **predictive densities exercise (11)**, metabric stub (12).
- `01_linear_reg.py` in the same folder — check what it contains before rebuilding anything.
- Data: `data/ames_prices.csv` (2,930 rows) and `data/metabric.csv`, both present. **This is also the folder holding the `ames_prices.csv` that session 15's notebook fails to find** — see `BUGS.md`.
- `sp26/assignment_7.ipynb` + solutions — likelihood, MLE, and regression; spans Oct 29 and today.
- **No `uu_fa26` material and no HTML lecture exist for this session.**

## 12. Open questions

- **Split `assignment_7` between Oct 29 and today.** It covers likelihood, MLE, *and* regression. Whichever half lands today is the lab; the other half was Thursday's.
- **What's in `01_linear_reg.py`?** It may already be the instructor-cell version of this session, which would cut the build cost substantially.
- **Fix cell 6's coefficient interpretation** (§7) before recording. Given the case study logs price but not area, the log-level reading is the one students need.
- **Finish cell 12**, or cut it. It's an empty case study, and the metabric data is right there — it's Tuesday's logistic example.
- **Does the lab do row or residual bootstrapping?** Worth deciding deliberately; row resampling is the safer default and the one that justifies the whole exercise.
- **Election Day means no Tuesday class**, so this is a single-session week with no quiz. Worth checking whether the quiz schedule shifts or a quiz is dropped.
