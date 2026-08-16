# Week 8, Thursday (Oct 15) — Conditional Density & Conditional Expectation

- **Syllabus topic:** Conditional density, conditional expectation
- **Day type:** Lab / Coding Day
- **Primary source:** `uu_sp26/.../00_understanding_data/02_using_information.ipynb` (77 cells)
- **Secondary:** `uu_sp26/.../04_conditioning_and_bayes/00_bayes.ipynb` (conditional distributions, cells ~12–21)

> **Why this session first.** It is the highest-leverage hour in the semester. The conditional expectation function *is* the regression function (Week 11), the Bellman equation *is* a conditional expectation (Week 15), and the law of total variance *is* the bias–variance decomposition — which this course introduces rather than assumes, since ML runs concurrently. If this hour is shaky, three later weeks inherit the shakiness and you won't be able to trace the cause.

---

## 1. What students actually see

The source notebook is a coding notebook, so this is a natural Thursday. Available artifacts:

| Artifact | Content |
|---|---|
| Pre-class video | Conditional probability recap (Week 2's Bayes' rule) → conditional *density*. The definitional step. |
| Guided notebook | `02_using_information.ipynb` §2, cells 36–55: scatterplot → groupby means → sliding-window mean → LCLS |
| Activity | Cell 44's fireplace question — a causality trap, done as a table discussion |
| Lab | Cells 56–57: derive LCLS as a weighted-MSE argmin, then implement the estimator as a class |
| Board | The three definitions, the tower property, and the LCLS ratio |

The dataset is **Ames house prices** (`./data/ames_prices.csv`), conditioning `price` on `Fireplaces`, `age`, and `area`.

**What goes on the board (Thursday board time is short — this is the whole list):**

```
f(y|x) = f(x,y) / f(x)                       [definition; needs f(x) > 0]
E[Y|X=x] = ∫ y f(y|x) dy                     [a NUMBER, for one x]
E[Y|X]                                       [a RANDOM VARIABLE, a function of X]
E[E[Y|X]] = E[Y]                             [tower property / law of iterated expectations]
```

Then the estimator, which is the whole coding half:

```
          (1/N) Σ yᵢ · (1/2h)·1{|xᵢ − z| ≤ h}
ŷ(z)  =  ─────────────────────────────────────
          (1/N) Σ      (1/2h)·1{|xᵢ − z| ≤ h}
```

---

## 2. The optimization view

- **Objective:** kernel-weighted mean squared error at the point `z`: `MSE(ŷ(z)) = (1/N) Σ {yᵢ − ŷ(z)}² · (1/h)k((z−xᵢ)/h)`
- **Argmin:** the LCLS / Nadaraya–Watson estimator — the ratio above.
- **Solved by:** closed form (it's a weighted mean).

This is cell 56's exercise, and it is worth noticing that **the notebook already frames the whole course this way**: *"We showed that the mean and median could be discovered by minimizing various kinds of loss functions; this is what machine learning is."* Same objective as Week 1 (sum of squares → the mean), with kernel weights attached. The population version is the sharper statement:

> Among **all** functions `g(X)`, the one minimizing `E[(Y − g(X))²]` is `g(X) = E[Y|X]`.

That single sentence is why regression exists. Week 11's linear regression is the same argmin restricted to straight lines — an approximation to the CEF, not a different idea.

---

### Reading

*Key in `README.md`. From `Reading-Roadmap.md` unless marked [Map] (= `prep/ds5030_syllabus_reading_map.pdf`).*

*From [Map]; the detailed `Reading-Roadmap.md` stops at 10/1.*

- **Primary** — **G&S Ch. 4** and **AoS Ch. 3, §3.5** (Conditional Expectation).
- **Supporting** — **AoS Ch. 20–21** (Nonparametric Curve Estimation, Smoothing). The curse of dimensionality — why LCLS degrades badly with more conditioning variables — is discussed in the bias–variance sections of those chapters, and it is the honest reason this course pivots to parametric regression in November.
- **Note** — this file predates the notes schema and has no *"content from scratch"* section; its §2 is the optimization view. Worth backfilling before October.

---

## 3. Assumptions that make it work

| Result | Assumption it needs |
|---|---|
| `f(y\|x) = f(x,y)/f(x)` is defined | `f(x) > 0`. No data near `x` → no conditional density at `x`. |
| `E[Y\|X=x]` exists | `E\|Y\| < ∞`. Heavy tails break it — a Cauchy-distributed `Y` has **no** conditional mean. |
| Tower property `E[E[Y\|X]] = E[Y]` | Only that `E\|Y\| < ∞`. It needs no independence and no model. Genuinely free. |
| LCLS is consistent for `E[Y\|X=x]` | `h → 0` **and** `Nh → ∞` as `N → ∞`; `f(x) > 0`; CEF smooth near `x`. |
| LCLS is roughly unbiased at `x` | `x` is in the **interior** of the data range and the CEF is locally flat-ish. |
| Interpreting a CEF difference as an *effect* | Nothing in the data justifies this. Requires an identification argument. |

The last row is the one that matters pedagogically, and §3 of the notebook is entirely about it.

---

## 4. Concrete failure cases

**Boundary bias — the one they'll see on screen.** Cells 48 and 53 ask "where is our estimator reliable? Unreliable?" The answer is: at the **edges of the x-range**. At the left edge, the window `(z−h, z+h]` only has data on one side, so the estimate is pulled toward the interior. On `price ~ age`, the oldest houses show it plainly. This isn't noise you can average away — it's bias, and it doesn't shrink with `N` at the same rate as the interior.

**Sparse support / the 0-0 problem.** `nbhd_mean` (cell 47) uses a uniform kernel. Where no `xᵢ` falls in the window, numerator and denominator are both exactly 0 and you get `NaN`. On Ames `area`, the few enormous houses do this. The Gaussian version (cell 52) never hits exact zero but does hit tiny/tiny, which is numerically unstable and produces wild swings — visible if you run `lcls(x, y, h=2)` in cell 54.

**Bandwidth, both directions.** Cells 54 and 55 are built as the demonstration: `h=2` on `area` is undersmoothed (the curve chases individual houses), `h=500` is oversmoothed (it flattens toward the global mean). Same trade-off as Week 3's KDE, same knob.

**Curse of dimensionality.** LCLS on one conditioning variable is fine. On two it needs dramatically more data for the same accuracy, and on five it is hopeless — the window contains almost nothing. This is the honest reason the course pivots to parametric regression in Week 11, and it's worth saying out loud rather than letting linear regression look like an arbitrary next topic.

**The fireplace trap (cell 44).** `means.diff()` gives roughly `+$72k` for the first fireplace, `+$28.7k` for the second, `+$13.5k` for the third. The notebook then asks: can you add $100k to a house by installing two fireplaces? No. Houses with more fireplaces are bigger, newer, and in nicer neighborhoods. The CEF difference is real; it just isn't the effect of a fireplace.

---

## 5. Five questions students will ask

**Q1. "Is `E[Y|X]` a number or a function?"** Both, and the notation hides which. `E[Y|X=x]` with a specific `x` is a **number**. `E[Y|X]` without a specific value is a **random variable** — it's the function `x ↦ E[Y|X=x]` evaluated at the random `X`, so it has its own distribution, its own mean, and its own variance. This is the single most common confusion in the topic, it is worth two full minutes at the board, and every later use depends on getting it right: the tower property is a statement about the random-variable version.

**Q2. "Why divide by the count in the window? Why not just average the `y`'s in the window?"** You *are* just averaging the `y`'s in the window — that's what the ratio computes. Writing it as a ratio of two kernel sums is what makes the connection visible: the **denominator is exactly a kernel density estimate of `f(x)`**, and the numerator is a KDE-weighted sum of `y`. So `E[Y|X=x] = f(x,y)-weighted mean / f(x)` is the same `f(x,y)/f(x)` from the board, estimated. The division is the renormalization step from the definition of a conditional density, not bookkeeping.

**Q3. "If LCLS estimates `E[Y|X=x]` without assuming a functional form, why would we ever fit a line?"** Four reasons, and give all four because "linear regression is simpler" is not one of them. (a) *Dimension*: LCLS dies with more than two or three conditioning variables; regression doesn't. (b) *Extrapolation*: LCLS cannot say anything outside the data range; a line can, at your own risk. (c) *Inference*: one coefficient with a standard error is a communicable claim; a curve is not. (d) *Interpretability*: `β` is a number you can put in a sentence. The cost is that you've replaced the true CEF with its best linear approximation — and Week 11 should say exactly that.

**Q4. "So the first fireplace is worth $72,000?"** No, and this is the most important thing in the session. `E[price | fireplaces = 1] − E[price | fireplaces = 0]` is a difference between **two different groups of houses**, not the result of changing one house. The houses with a fireplace are also larger and newer, and those variables are doing most of the work. This is omitted-variable bias, and it's the `E[Y|X=x]` versus `E[Y|do(X=x)]` distinction in §3 of the notebook. The honest summary: conditional expectation is a statement about *comparison*, causation is a statement about *intervention*, and no amount of data converts one into the other without an argument.

**Q5. "The curve goes crazy at the right edge — is that real?"** No, it's boundary bias plus thin data. Two distinct problems stacked: the window is one-sided at the edge (bias), and there are few observations out there (variance). Both get worse exactly where students most want to read the plot. Practical rule to give them: don't interpret a nonparametric curve in the outer 5% of the x-range.

**Bonus, if someone is paying close attention:** "the bandwidth formula in `lcls` uses 0.9, but the KDE lecture said 1.06." Both are Silverman. `1.06·sd(X)·n^{−1/5}` uses the standard deviation alone; `0.9·min{sd(X), IQR/1.34}·n^{−1/5}` is the **robust** variant, which guards against an outlier inflating `sd`. The KDE material already gives all three forms (1.84 uniform, 1.06 Gaussian, 0.9 robust), so this is a consistency to point at, not an error to apologize for.

---

## 6. Simplification audit

- **"LCLS is regression."** True but early — the notebook calls it *Local Constant Least Squares regression* before Week 11 defines regression. Fine to use the word; say explicitly that it's regression in the sense of *estimating a CEF*, which is the general meaning, and that Week 11 narrows it to lines.
- **`grid = np.sort(x.unique())`** (cells 47, 52). The estimator is evaluated at the *observed* `x` values, not on a regular grid. Harmless, but it means the plotted curve is denser where data is denser, which slightly flatters the picture. Worth one sentence if anyone asks why the curve looks smooth in the middle.
- **The uniform-kernel formula divides by `2h` in both numerator and denominator** (cell 49). Those cancel. They're written in because the denominator is then literally the uniform-kernel KDE from Week 3. Keep them — the cancellation is the point, not an inefficiency.
- **Not a lie, but an omission:** the notebook never states the population optimality result (`E[Y|X]` minimizes MSE over all functions). Cell 56 asks students to derive the sample version. Consider adding the population sentence to the board — it's the one that makes Week 11 inevitable.

---

## 7. Notebook run order

1. Cells 38–40: load Ames, log-price, scatter `price ~ area` and `price ~ age`. Establishes "the eye seeks `Y|X=x`."
2. Cells 42–43: `groupby('Fireplaces').mean()` and `.diff()`. **Discrete conditioning first** — the CEF as a plain table of group means, no smoothing anywhere. This is the right on-ramp.
3. **Cell 44 — stop here for the activity.** The $100k fireplace question. Let tables argue before you resolve it. Do not answer it yet; §3 answers it.
4. Cells 45–48: `nbhd_mean`, the uniform-kernel sliding window. Ask cell 48's reliability question with the plot on screen and make them point at the edges.
5. Cells 49–50: board the two formulas — uniform, then general kernel. Name Nadaraya–Watson.
6. Cells 51–55: `lcls` with the Gaussian kernel and the plug-in bandwidth, then `h=2` and `h=500` back to back. This is the bias–variance step; it should feel like Week 3.
7. §3 (cells ~58+): return to the fireplaces. `E[Y|X=x]` vs `E[Y|do(X=x)]`, omitted-variable bias.
8. Lab: cells 56–57 — the weighted-MSE derivation, then implement the estimator as a class.

If you run out of time, cut §3's cancer-treatment examples, not the fireplace resolution.

---

## 8. Forward dependencies

| Later session | What it inherits |
|---|---|
| **Week 11 Thu — linear regression** | The regression function *is* the CEF. OLS finds its best linear approximation. If students think regression is "fitting a line to points," they'll never understand why bootstrapped SEs mean anything. |
| **Week 12 Tue — logistic regression** | `E[Y\|X]` for binary `Y` *is* `P(Y=1\|X)`. That identity is the whole reason logistic regression is a conditional-expectation model. |
| **Week 15 Tue — backwards induction** | The Bellman equation is a conditional expectation over next states. No CEF, no DP. |
| **Anywhere R² appears** | Law of total variance: `V[Y] = E[V[Y\|X]] + V[E[Y\|X]]` — "unexplained plus explained." Worth previewing here even though it's not in the notebook. |

---

## 9. Source map

- `sp26/00_understanding_data/02_using_information.ipynb`
- §2 cells **36–57** — the entire coding spine of this session
- §3 cells **~58–77** — causality, do-operator, cancer-treatment examples, OVB exercise
- §1 cells **~5–35** — conditioning on a *categorical* variable; belongs to Week 8 Tue or as recap
- `sp26/04_conditioning_and_bayes/00_bayes.ipynb`
- "The Joint Density/Mass Function", "Marginal Distributions" ×2, "Conditional Distributions" ×4, "Conditional Probability: Events", "Conditional Probability: Densities" — the *definitional* treatment this notebook assumes. Use for the pre-class video.
- `sp26/01_probability/02_moments_and_likelihood.ipynb` §2 — random vectors, joint distribution, independence, bivariate normal. This is **Week 8 Tuesday's** material, not Thursday's.
- **Data — broken path, verified.** Cell 38 loads `./data/ames_prices.csv`, but `00_understanding_data/` has no `data/` directory. The file actually lives at `uu_sp26/understanding_uncertainty/02_modeling_simulation_inference/data/ames_prices.csv`. As it sits, cell 38 raises `FileNotFoundError` and the whole session's notebook fails on the first data cell. Fix when porting: copy the CSV next to the ported notebook, or point at a shared `data/` at the repo root.
- Also present and possibly useful: `sp26/.../02_modeling_simulation_inference/01_linear_reg.py`, `01_logistic_reg.py`, `01_poisson_reg.py`, and `04_conditioning_and_bayes/00_bayes_pymc.py`. Every sp26 lecture also has a rendered `.slides.html` twin, so these were taught as slides.

---

## 10. Open questions

- **Which notebook owns the definitions?** `00_bayes.ipynb` and `02_using_information.ipynb` both introduce conditional distributions. Pick one for Week 8 (probably `00_bayes` §1 as the Tuesday/video material) and have the other reference it, or students will see the definition twice with different notation.
- **Does §3 (causality, the do-operator) fit in this session?** It's marked *(Optional)* in the source. It's also the answer to the fireplace question you'll have already raised, so cutting it entirely leaves a loose end. Suggest keeping the fireplace resolution and OVB, cutting the three therapy examples.
- ~~Is the data path OK?~~ **Answered: no.** See the source map — `./data/ames_prices.csv` doesn't resolve from `00_understanding_data/`. Must be fixed during the port; it's the first data cell in the session.
- **Law of total variance — include or not?** Not in the source. It's the cleanest bridge to R² and to bias–variance, and it's two lines on the board. I'd add it; your call.
