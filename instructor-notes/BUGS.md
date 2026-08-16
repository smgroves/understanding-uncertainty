# Course Material — Bug Checklist

Every verified defect found while writing the session notes, deduplicated by **source file** so you can open one notebook and fix everything in it at once. Each item links back to the session file that explains it.

**Nothing here is speculative.** Anything involving a number or a code path was run; where a claim rests on a computation, the observed value is quoted.

**Status:** 0 of 104 fixed.

---

## Fix these first

Ordered by teaching date. These either crash, or teach a wrong number, or block a session that has no fallback.

- [ ] **`class_01/01_1_wrangling` cell 2** — `import pandas as plt` (Aug 25, first code students copy)
- [ ] **`class_01/01_2_eda` cell 10** — IQR computed as `Q3 − median`; propagates into Week 3's KDE bandwidth
- [ ] **`class_05/02_numeric_variables` cell 7** — the ECDF function doesn't run and returns wrong values (Sep 8)
- [ ] **`class_06/07_1_pdf` cell 1** — the normal density is missing its factor of 2; integrates to **0.707** (Sep 10)
- [ ] **`class_07/05_2_gaussian_kernel` cell 11** — the Gaussian KDE returns negative numbers; integrates to **−37** (Sep 15)
- [ ] **`class_08/06_01_survival_and_hazard` cell 0** — the survival function is defined as `F(t)`, its own opposite (Sep 17)
- [ ] **`class_10/08_01_sampling_distribution` cell 3** — `rng` undefined; the first code cell of the session raises `NameError` (Sep 22)
- [ ] **`class_11/10_2_CLT` cell 3** — 95% critical value given as **1.995**; it is **1.960**, and `homework_11` already disagrees with it (Oct 1)
- [ ] **`sp26/04_dynamics` cells 17 & 24** — transition matrix normalized on the wrong axis; breaks *both* demonstrations (Oct 20–22)
- [ ] **Missing data** — C-MAPSS (Sep 17), `taxicab.pkl` (Oct 20–22), `nhanes` + `metabric` paths (Oct 27–29)

---

## Missing or empty artifacts

- [ ] **`class_05/03_lab.ipynb` is 0 bytes** — the Sep 8 lab doesn't exist · *[05]*
- [ ] **`Week 2/` has no `Lab/` folder**, unlike `Week 1/` · *[05]*
- [ ] **`class_05/01_categorical_variables` cell 9** — `## Simulation Example`, a heading with nothing under it, in a coding session · *[05]*
- [ ] **`class_06/04_lab.ipynb` is a design memo, not a lab** — one markdown cell of planning conversation. The "Where distributions come from" design in it is good and unbuilt · *[06]*
- [ ] **C-MAPSS turbofan data missing** — `labslop/08_optimal_stopping/prep_optimal_stopping.py` expects a zip that isn't in the repo; the lab's first data cell fails · *[08]*
- [ ] **`taxicab.pkl` missing** — breaks `04_dynamics` Exercises 1–4 *and* all of `assignment_5` part 4 · *[16, 17]*
- [ ] **`nhanes_data_17_18.csv` does not exist anywhere** — check whether `01_probability/get_data.py` fetches it · *[18, 19]*
- [ ] **`metabric.csv` missing from `01_probability/data/`** — three copies exist elsewhere; this is a `cp` · *[18, 19]*
- [ ] **`sp26/02_using_information` cell 38** — loads `./data/ames_prices.csv`, but that folder has no `data/`; the file is in `02_modeling_simulation_inference/data/` · *[15]*
- [ ] **No cell numbered `05`** between `04_Thurs_video` and `06_Thurs_guided` in `Week 1/` — confirm nothing is missing · *[02]*

---

## Wrong mathematics

Each of these teaches something false.

### `class_01/01_2_eda` — Aug 25
- [ ] **cell 10** — `IQR = np.quantile(X,.75) - np.quantile(X,.50)`. The prose correctly says *.25*. As written it's `Q3 − median`, roughly half the true IQR. **Propagates into Silverman's robust bandwidth in Week 3.** · *[01]*

### `class_04/04_1_learning_from_data` — Sep 3
- [ ] **cell 2** — `m(X) = Σᵢ xᵢ` is missing its `1/n`, inside the definition of a *statistic*. The next four sessions depend on this cell · *[04]*
- [ ] **cell 3** — conflates `V[X̄ₙ]` (variance of the sample mean) with the sample variance `s²`. Different objects; both matter within three weeks · *[04]*

### `class_05/01_categorical_variables` — Sep 8
- [ ] **cell 7** — states `E[p̄ₙ] = V[I]/n = p(1−p)/n`. Should be `V[p̂]`. As written it **contradicts cell 6**, which correctly derives `E[p̂] = p` · *[05]*

### `class_05/02_numeric_variables` — Sep 8
- [ ] **cell 7 — the ECDF function, five separate bugs.** Missing colon (`SyntaxError`); `sorted()` returns a list, which has no `.reshape`; the comparison is backwards; the sum is over the wrong axis; `return` is dedented outside the function. On `{2,4,5,5,9}` it returns `[0.2, 0.4, 0.6, 0.6, 0.8]` — wrong length, and **never reaches 1**, contradicting the property stated two cells later. Correct is `[0.2, 0.4, 0.8, 1.0]`. Working replacement in *[06] §7* · *[06]*
- [ ] **cell 12** — "above `x` and `I=1` or below" is reversed; the indicator is `𝟙{xᵢ ≤ x}`, so `I = 1` means *at or below* · *[06]*

### `class_06/07_1_pdf` — Sep 10
- [ ] **cell 1 — the normal density** is `e^(−(x−μ)²/σ²)`; must be `e^(−(x−μ)²/(2σ²))`. **As written it integrates to 1/√2 ≈ 0.707, not 1.** This density recurs in Weeks 3, 6, 8, and 10 · *[06]*
- [ ] **cell 3 — the log-normal**, three errors: exponent `/2σ` should be `/(2σ²)`; integration variable is `dz` while the integrand is in `y`; upper limit is `x` where it should be `y`. The `1/y` Jacobian is also absent — ironic, since the cell introduces itself as *"a chance to use our transformation analysis skills"* · *[06]*

### `class_07/05_2_gaussian_kernel` — Sep 15
- [ ] **cell 11 — the Gaussian KDE, three bugs.** `h_u` is undefined (`NameError`); `K` — the grid-size parameter — is overwritten by a matrix of raw differences with **no kernel applied**; the `2` in the normalizer belongs to the uniform kernel only. Result **integrates to −37.17** and ranges from −6.4 to +5.4. Working replacement in *[07] §7* · *[07]*
- [ ] **cell 8 — `h` where `h²` is needed.** Exponent written `(x−xᵢ)²/(2h)`; since `z = (x−xᵢ)/h` it must be `(x−xᵢ)²/(2h²)`. **As written the estimate integrates to 0.56** · *[07]*
- [ ] **cell 8 — wrong argument to `φ`.** Writes `φ(−(x−xᵢ)²/(2h))`; `φ` takes the standardized distance `z`, not the exponent · *[07]*
- [ ] **cell 9 — measurement-error density inconsistent.** Says "a Gaussian with variance `h`" but writes `1/(√(2π)h)`, the normalizer for standard deviation `h`. Pick one; variance `h²` matches the kernel formula · *[07]*

### `class_08/06_01_survival_and_hazard` — Sep 17
- [ ] **cell 0 — the survival function is defined backwards.** Writes `S(t) = 1 − F(T) = p[t ≥ T]`. `F(T)` should be `F(t)`, and `p[t ≥ T]` **is `F(t)`** — the opposite of the survival function. On exponential draws with λ=2.3 at t=0.5: the written expression gives **0.684**; `S(t)` is **0.316**. Should read `p[T > t]` · *[08]*
- [ ] **cell 3** — Weibull hazard written `βk(βx)^(k−1)`; should be `(βt)` · *[08]*

### `class_10/08_01_sampling_distribution` — Sep 22
- [ ] **cell 3 (also 6, 8) — `rng` is never defined.** `expon.rvs(..., random_state=rng)` raises `NameError`. Add `rng = np.random.default_rng(20260922)` · *[09]*
- [ ] **cell 12 — the CLT divides by the variance, not the standard deviation.** Denominator must be `√V[S]`. Checked on the notebook's own exponential: correct standardization has sd **0.999**, the notebook's has **1.999**. Also an unbalanced parenthesis after `E[S]` · *[09]*
- [ ] **cell 12 — states the theorem over the wrong index.** As written it's a CLT about the average of the `T` statistics, which nobody computes; the bell curves on screen are a CLT **in `N`**. Consider deleting rather than fixing — the puzzle is better left open for Oct 1 · *[09]*
- [ ] **cell 5 — `λ` and `scale` inconsistent.** Prose says λ = 0.5; code uses `expon.rvs(scale=0.5)`, and scipy's `scale` is the *mean*, so the code runs λ = 2. Verified: sample mean 0.500 · *[09]*
- [ ] **cell 5 says `T = 100`; cell 6 uses `T = 50`** · *[09]*

### `class_11/10_2_CLT` — Oct 1
- [ ] **cell 3 — the 95% critical value is 1.995; it is 1.960.** `Φ(1.995) = 0.9770` where `0.9750` is needed; `norm.ppf(0.975) = 1.95996`. **`homework_11_clt_bootstrap.md` already has 1.96**, so the lecture and the problem set currently contradict each other. 90% (1.645) and 99% (2.576) are correct · *[12]*

### `sp26/01_probability/02_moments_and_likelihood` — recap §1, and Oct 27–29
- [ ] **cell 16 — the Taylor expansion is wrong.** Writes `F(x+h) = F(x) + (x+h−x)f′(x) + (h²/2)f′(x) + O(h³)`. The first-order term must be `h·f(x)` — the *density*, not its derivative. As printed `f′` appears in both terms and `f` in neither. The conclusion students are asked to derive (KDE bias is `O(h²)`) is correct; the route given won't reach it · *[14]*
- [ ] **cell 13 — ECDF derivation swaps its indicators**, `𝟙{xᵢ ≤ X}` in line 1 and `𝟙{X ≤ x}` in the last, with a mid-derivation note about swapping notation. Result is right, presentation is confusing · *[14]*
- [ ] **cell 36 — says "standard error `σ`"** where it means standard *deviation*. Sep 29 spends a session distinguishing those · *[18]*

### `sp26/02_modeling_simulation_inference/01_models_and_regression` — Nov 5
- [ ] **cell 6 — the coefficient interpretation is wrong as stated.** Says *"a 1% change in `x_ik` leads to a `β_k`% change in `y_i`"*, which is the **log-log (elasticity)** reading and holds only when both `y` and `x` are logged. For `y = x·β` a one-**unit** change in `x_k` gives a `β_k`-**unit** change in `y`; the case study logs price but not the features, making it **log-level**, where a one-unit change gives roughly `100·β_k` **percent**. Three readings, one stated as general — and coefficient interpretation is exactly what applied readers get wrong · *[20]*
- [ ] **cell 12 is an empty stub** — *"Case: now let's predict who survives in the breast cancer data set"* with nothing after it. `metabric.csv` is present; it's Nov 10's logistic example · *[20]*

### `sp26/02_modeling_simulation_inference/01_logistic_reg.py` — Nov 10
- [ ] 🔴 **loads `./data/nhanes_data_17_18.csv`, which doesn't exist** in either repo. The folder has only `ames_prices.csv` and `metabric.csv`. **Cheapest fix: switch the worked example to metabric**, which is present and gives 1,343 usable rows · *[21]*
- [ ] 🔴 **dummy-variable trap** — three of four `get_dummies` calls use `drop_first=True`; the race one has it **commented out**. With an intercept the full dummy set is linearly dependent. Sep 8's `drop_first` note and Nov 5's rank condition, live in a script · *[21]*
- [ ] **imports `skimpy`**, not a standard dependency. Confirm installed or drop the `skim(df)` call · *[21]*

### `sp26/.../01_models_and_regression` §2 — Nov 10
- [ ] **cell 16 — "two nodes in the output layer"** is imprecise; binary logistic regression has *one* output with a sigmoid. Two-with-softmax is the multi-class form and is overparameterized here. The aside is doing real work for this cohort, so it should be right · *[21]*
- [ ] **§2 contains no executable cells** — six markdown cells; all code lives in the separate `.py` · *[21]*

### `sp26/00_understanding_data/04_dynamics` — Oct 20–22
- [ ] **cells 17 & 24 — the transition matrix is normalized along the wrong axis.** Counts are stored `[to, from]` (column-stochastic intent, matching cells 33/37/40 and `assignment_5`), but normalized by `sum(axis=1)` — arrivals — which makes *rows* sum to 1. Columns come out `[1.117, 0.829, 0.867, 1.187]`. **Consequences: cell 33's simulation raises `ValueError: probabilities do not sum to 1` for all four states; cell 40's forecast converges to `[0.2799 × 4]`, summing to 1.12.** Cell 41 states the *correct* limit, which the code can't produce. Fix: `sums = tr_counts.sum(axis=0, keepdims=True)`. Verified — simulation runs, forecast matches cell 41 · *[17]*
- [ ] **cell 22 — order-`k` slicing is off by one.** Builds strings ending at `t−2` rather than `t−1`. The chain is internally consistent but misaligned against the sequence; matters once Thursday generates from it · *[16]*

---

## Missing definitions

Not errors, but load-bearing concepts the material never states.

- [ ] **The Markov property** — `04_dynamics` never defines `p[Xₜ | Xₜ₋₁,…,X₁] = p[Xₜ | Xₜ₋₁]`, the assumption that makes a transition matrix sufficient, despite the topic being Markov chains · *[16]*
- [ ] **Time-homogeneity** — also never mentioned; a chain estimated over a long sequence assumes the dynamics didn't change · *[16]*
- [ ] **The stationary distribution** — `04_dynamics` §3 shows the forecast converging but never gives the term or the equation `π = Tπ` · *[17]*
- [ ] **Aperiodicity** — the second condition for convergence; connectivity is covered, this isn't · *[17]*
- [ ] **Consistency** — `04_1_learning_from_data` never defines it, though the schedule's own margin note asks for *"unbiased estimators vs consistent estimators"* · *[04]*
- [ ] **The `1/n` MLE bias** — `02_moments` cell 39 derives `σ̂² = (1/n)Σ(...)` and moves on. `E[σ̂²] = ((n−1)/n)σ²`; verified at n=12 as 3.663 vs a true 4.0. This is the best available closure of the Week 1 divisor question · *[19]*
- [ ] 🔴 **That logistic regression has no closed form** — never stated anywhere, though it is the entire motivation for the Nov 12–24 optimization block. The score `Σ(yᵢ−pᵢ)xᵢ = 0` has the same shape as OLS's but can't be solved, and neither the score nor that fact appears · *[21]*
- [ ] **Concavity of the logistic log-likelihood** — never mentioned, so "will the optimizer find the right answer?" is unanswered (yes, here) · *[21]*
- [ ] **The log-odds interpretation** `log(p/(1−p)) = x·β` — absent, though it's the one interpretation that's constant and the one clinical literature reports · *[21]*
- [ ] **Perfect separation** — the failure mode unique to logistic regression, never mentioned · *[21]*
- [ ] **The exponential MLE example** — `02_moments` cell 53 refers to *"the normal, exponential, and Bernoulli examples"*; the exponential never appears · *[18, 19]*

---

## Rendering — check before recording

`\begin{alignat*}{2}` needs `amsmath` with an argument, and **MathJax in Jupyter frequently drops these blocks silently.** Every instance below wraps a derivation that matters. `\begin{aligned}` is the safe swap.

- [ ] `class_03/03_1_probability` cell 8 — complementary events · *[03]*
- [ ] `class_03/03_2_random_variables` cells 8, 9, 10 — linearity, the variance shortcut, variance of transforms · *[03]*
- [ ] `class_04/04_1_learning_from_data` cells 13–15 — the `V[X̄ₙ] = V[X]/n` derivation · *[04]*
- [ ] `class_05/02_numeric_variables` cell 11 — ECDF unbiasedness · *[06]*
- [ ] `class_07/05_1_kde` cell 4 — the ECDF-secant derivation · *[07]*
- [ ] `class_07/05_2_gaussian_kernel` cell 8 — the Gaussian swap · *[07]*
- [ ] `sp26/02_moments_and_likelihood` cells 38, 39, 49 — the three likelihood derivations · *[18, 19]*
- [ ] `sp26/01_models_and_regression` cells 8, 17 — the two likelihood derivations · *[20, 21]*
- [ ] **`class_03/03_1_probability` cell 12 — brace typo.** `\underbrace{p[\text{data}}_\text{marginal}]` should be `\underbrace{p[\text{data}]}_{\text{marginal}}`. In the most-photographed formula of the day · *[03]*
- [ ] **`class_07/05_2_gaussian_kernel` cell 7 — unbalanced braces.** `\frac{ \mathbb{I} \{ | (x-x_i)/h |<1}{2}` is missing a `}`; will not render · *[07]*
- [ ] **`class_10/08_01` cell 12** — unbalanced parenthesis after `E[S]` · *[09]*

---

## Naming and notation

- [ ] **`class_11/10_1` cell 4 and `10_2` cells 1, 2, 4 — "t-statistics" used where `Z` is meant**, and then `10_2` cell 5 introduces the *actual* t-distribution. One word, two meanings, four cells apart, on the day both arrive. Global find-and-replace to `Z` before cell 5 · *[10, 11, 12]*
- [ ] **`class_05/01_categorical_variables` — `p̂` (cell 6) vs `p̄ₙ` (cell 7)** for the same object. Prefer `p̂` · *[05]*
- [ ] **`class_04/04_1_learning_from_data` cell 2 (also `Week 1/04_Thurs_video` cell 26)** — `a_{r,:}` written with row-2 subscripts `[a_{21} a_{22} …]`, presented as the general `r`-th row · *[02]*
- [ ] **`class_11/10_2_CLT` cell 5 — `G()` for the gamma function** where `Γ` is standard, and `G` is never defined · *[12]*
- [ ] **`sp26/02_moments` cell 50 — survival recoding is inverted.** Maps `'0:LIVING' → 1.0`, so `p̂` is the *survival* proportion while the column's `1:` prefix means deceased. State the convention or `p̂` reads backwards · *[18, 19]*
- [ ] **`sp26/04_dynamics` cell 16 — malformed heading**, `- ## Transition Proportions` renders as a bullet containing a heading · *[16]*
- [ ] **`class_10/08_01` cell 0 is a note-to-self**, not a title: "USE SIMULATION TO EXPLORE SAMPLING DISTRIBUTIONS" · *[09]*

---

## Truncated and unfinished cells

Each of these stops mid-sentence or is an empty heading.

- [ ] `class_04/04_1_learning_from_data` cell 16 — "Sample Covariance Exercise?" expands one line and stops; **cell 17 empty** · *[04]*
- [ ] `class_07/05_1_kde` cell 10 — "But to describe the local" · *[07]*
- [ ] `class_07/05_2_gaussian_kernel` cell 3 — "…but also that $", dangling · *[07]*
- [ ] `class_08/06_02_optimal_stopping` cells 1, 6 — "the fundamental insight is that you can"; an empty `$$` block. *(Cut from the schedule, but still in the folder)* · *[08]*
- [ ] `class_10/08_01` cell 9 — "it's hard to "; **cell 10 is a bare `##`**; **cell 11** is a "Confidence Intervals" heading with the fragment "Our overall estimate" · *[09]*
- [ ] `class_10/09_2` cell 2 — "## Sampling with Replacement" followed by a lone dash · *[09, 10]*
- [ ] `class_11/10_1` cell 0 — "We will be normalizing", in the cell defining the standard error · *[10, 11]*
- [ ] `class_11/10_1` cell 6 — "this is called the Central Limit ", in the cell setting up the CLT · *[10, 11]*
- [ ] `sp26/01_models_and_regression` cell 12 — empty case study, see above · *[20]*
- [ ] `sp26/02_moments` cell 54 — "The likelihood is a joint density, expressing the relative ", in the summary cell · *[18, 19]*

---

## Typos

- [ ] `class_01/01_1_wrangling` cell 7 **and** `01_2_eda` cell 3 — `df[var].unique_values()`; no such pandas method. Correct: `.unique()`. **Four locations** counting the `Week 1/` ported copies · *[01]*
- [ ] `class_03/03_1_probability` cell 7 — "addivity" → additivity · *[03]*
- [ ] `class_08/06_01` cell 1 — "termiantes" · *[08]*
- [ ] `class_11/10_1` cell 3 — "no one one runs a million dollar clinical trials" · *[10, 11]*
- [ ] `class_11/10_2` cell 1 — "independently and identically distribution sample"; "estaimtes". cell 2 — "subsitute" · *[12]*

---

## Reproducibility and environment

- [ ] **`sp26/02_moments` cell 27** — `np.random.multivariate_normal` with no seed; the bivariate-normal plots differ every run · *[14]*
- [ ] **`sp26/04_dynamics` cell 28** — `networkx` imported for the connectivity check and not in any environment file. Confirm it's installed · *[16]*
- [ ] **`04_dynamics` uses `np.random.seed(100)`** (legacy) while `assignment_5` uses `np.random.default_rng(100)`. Inconsistent between lecture and lab · *[17]*
- [ ] **Ship `data.csv` for the Sep 1 census activity** rather than re-fetching from the Census API — thirty students hitting it simultaneously is a bad first minute, and the Sep 3 lab draws 2000 samples from it · *[03, 04]*

---

## Notes-side follow-up

Not course-material bugs; gaps in these notes.

- [ ] **Session 15 predates the schema** — it has no *"content from scratch"* section (its §2 is the optimization view). Backfill before October · *[15]*
- [ ] **The midterm (Oct 8) isn't written**, and two of the three `sp26` practice-exam problems cover MLE and Markov chains, which fall *after* the Fall midterm date
- [ ] **`class_05/scraps.ipynb` is 622 KB and unexamined** — may contain the missing Sep 8 simulation and lab · *[05]*
- [ ] **`bach.py` unexamined** — `04_dynamics` promises Bach content §2 doesn't deliver; `music.mid` suggests playable audio · *[16]*

---

*Session file references in italics, e.g. `[07]`, point to the numbered notes file where the finding is explained with its verification.*
