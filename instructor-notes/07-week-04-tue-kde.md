# Week 4, Tuesday (Sep 15) — KDE: Windowing / Bandwidth, Uniform Kernel

- **Schedule focus (F26_scheduling):** KDE: Windowing/Bandwidth, Uniform Kernel
- **Day type:** Quiz / Math Day
- **Pre-class video:** `class_07/05_1_kde.ipynb` (13 cells) — the uniform-kernel KDE
- **In-class:** `05_1_kde` walkthrough + *"activity: properties of KDE, over-fitting and under-fitting"*
- **Optional pre-class:** `class_07/05_2_gaussian_kernel.ipynb` (12 cells) — **not required today; its code and two formulas are broken (§7)**
- **Widgets:** `labs/class-07-kde/kde.html` — `viz-window`, `viz-stack`, `viz-biasvar`, `viz-kernel-compare`
- **Also:** html `labs/class-07-kde/` — the most developed material in the repo (lab + autograder)

> **The schedule marks the Gaussian kernel as *optional* pre-class work, and that is the right call — keep it optional.** `05_2_gaussian_kernel` has a completely broken KDE function (it applies no kernel at all and integrates to −37; I ran it) and two wrong formulas. Today is the **uniform kernel**: windowing and bandwidth. Everything in §2 up to "From uniform to Gaussian" is today; the rest is optional enrichment that needs fixing first.
>
> The other thing worth knowing: the HTML lab for KDE is the most developed artifact in the whole repo — three derivations, a working autograder, reference implementations. If any session should lean on that material, it's this one.

---

## 1. What students actually see

| Artifact | File | Status |
|---|---|---|
| Pre-class video | `class_07/05_1_kde` (13 cells) — the uniform-kernel KDE | needs porting into `Week 3/`. **Its code works** |
| In-class | `class_07/05_2_gaussian_kernel` (12 cells) — exp/log, then the Gaussian kernel | **its code does not work**; several formulas are wrong |
| Instructor cells | — | to build |
| Lab | none in `uu_fa26` | **But `labs/class-07-kde/` has a complete one** with an autograder — see §12 |
| Board | — | The window, the ECDF-slope derivation, and the bias–variance trade-off |

Both notebooks are markdown-only apart from the two code blocks quoted inside markdown cells (`05_1` cell 8, `05_2` cell 11). Neither is executable as it stands.

---

## 2. The content, from scratch

The whole session is one estimator arrived at three different ways. The three routes matter more than the formula: a student who sees only one construction has memorized something, and a student who sees all three has understood it.

### Route 1 — The moving window

You want to estimate `f(x)`, the density at `x`. The density is "the probability `X` lands in a small neighbourhood of `x`, per unit width." The sample version of that question is: **what fraction of my observations are within `h` of `x`?**

First, a small piece of machinery the notebook is right to pause on. `|x − xᵢ| < h` means the distance from `x` to `xᵢ` is less than `h`, which unpacks to

```
x − h < xᵢ < x + h
```

so the absolute-value inequality *is* a window centred at `x` with reach `h` on each side. Call `h` the **bandwidth**.

Count what's in the window and divide:

```
(number of xᵢ with |x − xᵢ| < h) / n  =  (1/n) Σᵢ 𝟙{|x − xᵢ| < h}
```

That's a proportion — Sep 8's object again, with a new event. Slide the window across and you get a curve. This is a moving-window histogram.

### Route 2 — The slope of the ECDF

The density is `F′`. We have `F̂ₙ` from Tuesday. So take a **secant** of the ECDF — the difference quotient you'd take before letting the gap close:

```
f̂ₕ(x) = [F̂(x+h) − F̂(x−h)] / 2h
```

Expand both ECDFs and the algebra collapses:

```
       = [ (1/n)Σ 𝟙{xᵢ ≤ x+h} − (1/n)Σ 𝟙{xᵢ ≤ x−h} ] / 2h
       = Σᵢ [𝟙{xᵢ ≤ x+h} − 𝟙{xᵢ ≤ x−h}] / 2nh
```

For each `i`, that bracket is 1 exactly when `x−h < xᵢ ≤ x+h` — when `xᵢ` is in the window. So

```
f̂ₕ(x) = Σᵢ 𝟙{|x − xᵢ| < h} / (2nh)
```

**Route 1 and Route 2 are the same estimator**, and the `2h` in the denominator is what turns a raw proportion into a per-unit rate. Tuesday's lesson — density is a rate, not a probability — is doing the work here, and the `2nh` is where it shows up.

### Route 3 — Measurement error

Suppose each observation `xᵢ` is really a value smeared by measurement noise, so instead of a spike at `xᵢ` you have a small bump centred there. Average the `n` bumps and you get a curve. That average *is* the KDE — with a rectangular bump you get Routes 1 and 2 exactly, and with a Gaussian bump you get the smooth version below.

**This is the construction that makes the estimator feel inevitable**, and it's the one the HTML lab's `viz-stack` widget draws: five points, five bumps, one curve that is literally their sum.

### Why the bandwidth can't go to zero

The density is a limit as the window shrinks, so why not send `h → 0`? Because the data are finite. As `h` shrinks, almost every window contains either nothing or one point, and you get `0/0` everywhere except at spikes on the data — a rugplot, a comb, not a density. **The estimator only exists because you refuse to take the limit.** That tension is the honest content of the bandwidth question.

### Choosing `h`: Silverman's rule

There are data-driven methods (least-squares cross-validation), but the standard default is **Silverman's rule of thumb**. For the uniform kernel:

```
h_u = 1.84 · sd(X) · n^(−1/5)
```

Three things to notice, and the third is the one that pays off. It scales with the spread of the data. It shrinks with `n`, so more data buys a finer resolution. And it shrinks *slowly* — `n^(−1/5)` means you need 32× the data to halve the bandwidth.

### The algorithm

Four steps, and it's genuinely four lines of NumPy:

```python
def kde(X, K=200):
    n = len(X)
    h = 1.84 * X.std() * n ** (-0.2)                  # 1. Silverman
    grid = np.linspace(X.min()-h, X.max()+h, K)       # 2. grid
    I = np.abs(grid[:, None] - X[None, :]) < h        # 3. broadcast → (K, n) indicator
    return grid, I.sum(axis=1) / (2 * n * h)          # 4. count and normalize
```

Step 3 is Week 1 Thursday's broadcasting, doing exactly what it was introduced for. **This version works** — I ran it, and it integrates to 1.000.

### From uniform to Gaussian

Write the estimator with the window expressed as a function of a standardized distance `z = (x − xᵢ)/h`:

```
f̂ₙ,ₕ(x) = (1/n) Σᵢ (1/h) k(z),     with the uniform kernel  kᵤ(z) = 𝟙{|z| < 1} / 2
```

Now `k` is a slot you can put other functions into. The uniform kernel gives a jagged curve because a point either is or isn't in the window — as the window slides past an observation, the estimate jumps. Swap in a smooth kernel and the jumps go away. The standard choice is the **Gaussian kernel**:

```
φ(z) = (1/√(2π)) · exp(−z²/2)
```

which is non-negative, peaks at `1/√(2π) ≈ 0.399` at `z = 0`, decays fast, and integrates to 1. So

```
f̂ₙ,ₕ(x) = (1/(nh)) Σᵢ φ((x − xᵢ)/h) = (1/(nh)) Σᵢ (1/√(2π)) exp(−(x − xᵢ)²/(2h²))
```

**Note the `h²` in the exponent** — it comes from `z² = (x−xᵢ)²/h²`, and the notebook gets this wrong (§7). This is what `seaborn` computes.

Changing the kernel changes the optimal bandwidth constant:

```
h_s = 1.06 · sd(X) · n^(−1/5)                              (Gaussian)
h_s = 0.9 · min{sd(X), IQR/1.34} · n^(−1/5)                (robust variant)
```

The robust form guards against one outlier inflating `sd`. Both are "Silverman's rule"; the constants differ because the kernels differ.

### Biased but consistent

This is the session's real statistical content, and it's the first genuinely *biased* estimator in the course.

Take the expectation of Route 2's estimator. Expectation passes through, and `E[F̂] = F` from Tuesday:

```
E[f̂ₕ(x)] = [F(x+h) − F(x−h)] / 2h
```

That's a difference quotient of the *true* CDF — not `f(x)`, but something that becomes `f(x)` as `h → 0`:

```
lim_{h→0} E[f̂ₕ(x)] = F′(x) = f(x)
```

But Silverman's `h` is **not** zero — it's proportional to `n^(−1/5)`. So for any actual sample, `E[f̂ₕ(x)] ≠ f(x)`: the KDE is **biased**. What saves it is that `h → 0` as `n → ∞`, so the bias vanishes in the limit. The KDE is a **consistent** estimator of `f(x)` but not an unbiased one.

**Unbiased and consistent are different properties**, and this is the first place in the course where they come apart. Sep 8's `p̂` was unbiased for every `n`. The KDE is wrong for every `n` and right in the limit.

### The bias–variance trade-off

Large `h` averages over a wide neighbourhood: the curve barely moves if you resample, but it smooths away real features. **Low variance, high bias.** Small `h` averages over few points: the curve chases individual observations. **High variance, low bias.** Silverman's rule is one particular compromise.

This is the first appearance of a trade-off that recurs for the rest of the course — and given ML is concurrent rather than prior, **this is likely the students' first encounter with the bias–variance idea anywhere.** Treat it as new, not as a callback.

---

### Reading

*Key in `README.md`. From `Reading-Roadmap.md` unless marked [Map] (= `prep/ds5030_syllabus_reading_map.pdf`).*

- **Primary** — **AoS Ch. 20** (Nonparametric Curve Estimation), including bandwidth selection. The roadmap is blunt here: this is **genuinely the only source among the six**. B&H is a pure-probability text with no density estimation; G&S, C&B, and CASI don't cover it either.
- **Supporting / fuller / intuition** — none available. This session has no second reading.
- **Consequence worth noting** — with only one source and no intuition-first passage anywhere, the three constructions in §2 (moving window, ECDF slope, measurement error) carry more weight than usual. There is no book to send a struggling student to.

---

## 3. The optimization view

- **Objective:** mean integrated squared error, `∫ E[(f̂ₕ(x) − f(x))²] dx`, as a function of the bandwidth `h`
- **Argmin:** the `h` balancing squared bias (grows with `h`) against variance (grows as `h` shrinks). Silverman's rule is a closed-form approximation to that argmin, exactly right only if the truth is normal
- **Solved by:** closed form (take Silverman's number) or grid search (cross-validate over a grid of `h`)

**This is the first box whose argmin is a tuning knob rather than an estimate.** It also explains why Silverman is a default and not an answer: it optimizes the wrong objective whenever your data is bimodal or heavy-tailed, because it assumes a normal reference. `viz-biasvar` in the HTML lab has three preset bandwidths with the failure mode named for each.

---

## 4. Assumptions that make it work

| Claim | Assumption |
|---|---|
| `f(x)` exists at all | `F` differentiable at `x`. A discrete variable has no density to estimate |
| `E[f̂ₕ] = [F(x+h) − F(x−h)]/2h` | Identically distributed. Follows from `E[F̂] = F` |
| The KDE is consistent | `h → 0` **and** `nh → ∞` as `n → ∞`. Both, and Silverman's `n^(−1/5)` satisfies both |
| Silverman's `h` is near-optimal | The true density is roughly **normal**. On bimodal or heavy-tailed data it over-smooths |
| `f̂ₕ(x) ≥ 0` and integrates to 1 | The kernel is non-negative and integrates to 1. True for uniform and Gaussian |
| The estimate at `x` is meaningful | There is **data near `x`**. In the tails the window is nearly empty |

Row 3 is worth stating explicitly because it's the same pair of conditions that governs Week 8's LCLS estimator — `h → 0` for the bias, `nh → ∞` for the variance. Shrink the window too fast and you have no data in it.

---

## 5. Concrete failure cases

**`h → 0` gives a comb.** The notebook names this: shrink the bandwidth and you get `0/0` almost everywhere and spikes at the data. Show it — set `h` tiny in the widget. It makes "we refuse to take the limit" concrete rather than hand-wavy.

**Boundary bias.** Near the edge of the data's range the window is half empty, so the density is pulled down. Every KDE understates the density at the boundaries. This is the same failure as Week 8's LCLS boundary bias, and it's why KDEs of strictly-positive quantities (prices, durations) often show impossible mass below zero.

**Silverman on bimodal data.** Two well-separated clusters have a large `sd`, so Silverman returns a large `h`, which smooths the two modes into one. **The rule fails hardest exactly when the interesting feature is the thing it erases.** `viz-kernel-compare` — "same bandwidth, two shapes" — is built for this.

**Silverman with an outlier.** One extreme value inflates `sd(X)`, inflating `h`, over-smoothing everything. This is what the robust `0.9·min{sd, IQR/1.34}` form is for, and it's a concrete payoff for Week 1's IQR — **assuming the Week 1 IQR bug is fixed**, since the notebook computes `Q3 − median` instead of `Q3 − Q1`.

**Negative values from a broken implementation.** Not a statistical failure but the one you'll actually hit: see §7. A density that goes negative is a bug, always, and it's a good diagnostic to teach — *integrate your estimate and check it's 1.*

**The uniform kernel's jagged output.** Not an error, but students often think it is. The curve is genuinely a step function; that's what the kernel does. It's the motivation for the Gaussian, not a bug to fix.

---

## 6. Five questions students will ask

**Q1. "If the density is a limit as the window shrinks, why don't we just make `h` tiny?"** Because you have `n` observations, not infinitely many. As `h` shrinks the window empties out: most windows contain nothing, a few contain a single point, and the estimate becomes a spike-and-zeros comb rather than a curve. The estimator exists precisely because you stop short of the limit. That's also why the consistency condition is two-sided: `h → 0` so the bias vanishes, but `nh → ∞` so the count in each window still grows.

**Q2. "How is this different from a histogram?"** Two differences. A histogram has *fixed* bins, so where you put the bin edges changes the picture — shift them half a bin and features move. A KDE centres a window on **every point you evaluate**, so there are no edges and no arbitrary alignment. Second, a histogram is a step function by construction, while a KDE with a smooth kernel is smooth. The KDE is what a histogram becomes when you let the bin follow the query point instead of the other way round.

**Q3. "Which kernel should I use?"** Almost always it doesn't matter — the bandwidth dominates the kernel choice by a wide margin, which is a genuinely surprising and useful fact. Pick the Gaussian because it's smooth and it's what `seaborn` does. Then spend your effort on `h`, which is the knob that actually changes the answer.

**Q4. "Biased sounds bad. Why would we use a biased estimator?"** Because unbiasedness is not the only thing worth having, and here it's unavailable at any finite `h` anyway. What you get in exchange is a curve instead of a comb — the bias *is* the smoothing. And the bias shrinks as `n` grows, so with enough data the estimator gets arbitrarily close to the truth. The general principle, arriving here for the first time and recurring for the rest of the course: a small amount of bias is often worth a large reduction in variance.

**Q5. "How do I know I picked the right bandwidth?"** Strictly you don't, because "right" depends on the true density you're trying to estimate. Silverman's rule gives a defensible default derived under the assumption that the truth is normal. In practice: start there, then look at the plot at half and double that value. If the three look basically the same, the answer is robust. If they differ dramatically, the data are telling you the bandwidth matters and you need cross-validation or a better reason for your choice. **Never report a KDE without having looked at it at more than one bandwidth.**

---

## 7. Bugs and simplifications in the material

### Verified by running the code

- **The Gaussian KDE function is completely broken** — `05_2_gaussian_kernel` cell 11. Three independent bugs:
  ```python
  def kde(X,K=35):
      n = len(X)
      h_s = 1.06 * X.std() * n ** (-0.2)
      x_grid = np.linspace( X.min()-h_u, X.max()+h_u, K)   # ← h_u undefined: NameError
      K = ( x_grid[:,None] - X[None,:])                    # ← clobbers K, and applies NO kernel
      f_hat = np.sum(K,axis=1)/(2 * n * h_s)               # ← the 2 belongs to the uniform kernel only
      return x_grid, f_hat
  ```
  `h_u` doesn't exist in scope. `K` — the grid-size parameter — is overwritten by a matrix of raw differences with no Gaussian applied. And the `2` in the normalizer is left over from the uniform kernel. **Substituting `h_s` to get past the NameError, the result integrates to −37.17 and takes values from −6.4 to +5.4.** It is not a density. Working version:
  ```python
  def kde(X, K=200):
      n = len(X)
      h = 1.06 * X.std() * n ** (-0.2)
      grid = np.linspace(X.min()-h, X.max()+h, K)
      Z = (grid[:, None] - X[None, :]) / h
      phi = np.exp(-Z**2 / 2) / np.sqrt(2*np.pi)
      return grid, phi.sum(axis=1) / (n * h)
  ```
  I checked: integrates to 0.999.
- **The Gaussian KDE formula has `h` where it needs `h²`** — `05_2` cell 8 writes `exp(−(x−xᵢ)²/(2h))`. Since `z = (x−xᵢ)/h`, the exponent is `z²/2 = (x−xᵢ)²/(2h²)`. **As written the estimate integrates to 0.56, not 1** — I checked. Same error again in cell 9's measurement-error density.
- **Cell 8 passes the wrong thing to `φ`.** It writes `φ(−(x−xᵢ)²/(2h))`, but `φ` takes the *standardized distance* `z = (x−xᵢ)/h`, not the exponent. The argument and the exponent have been conflated.
- **Cell 7 has unbalanced braces** — `\frac{ \mathbb{I} \{ | (x-x_i)/h |<1}{2}` is missing a `}`. It will not render.
- **Cell 8 still says `k_u`** in the general-kernel formula while the text introduces the Gaussian. Should be a generic `k` or `φ`.
- **Cell 9's measurement-error density is internally inconsistent.** It says "a Gaussian with variance `h`" but writes `1/(√(2π)h)` out front, which is the normalizer for standard deviation `h`, i.e. variance `h²`. Pick one — I'd use variance `h²` throughout so it matches the kernel formula.
- **Cell 3 is truncated mid-sentence**: "…but also that $" — the natural-logarithm cell ends with a dangling `$` and no content.
- **`alignat*` again** in `05_1` cell 4 and `05_2` cell 8. Same MathJax fragility as Weeks 2 and 3.

### Works correctly

- **The uniform-kernel KDE in `05_1` cell 8 is right.** I ran it: integrates to 0.9996. The derivation in cells 3–4 is also correct, including the ECDF-secant algebra.
- **Both Silverman constants in `05_2` cell 10 are correct** (1.06 and the robust 0.9 form), and they match the HTML lab.

### Simplifications

- **`X.std()` is pandas (`ddof=1`) or NumPy (`ddof=0`) depending on what `X` is.** With Silverman's constants this is a sub-1% effect and doesn't matter, but it's the same `n` vs `n−1` seam from Week 1 and someone may notice.
- **"This is exactly what Seaborn does"** (cell 8) is nearly true — `seaborn` uses Scott's rule by default rather than Silverman's, so the bandwidths differ slightly. Fine to say; don't defend it if challenged.
- **Least-squares cross-validation is mentioned once and never explained.** Fine, but it's the honest answer to Q5 and it's the alternative to a rule of thumb. One sentence would help.
- **The exponential-function construction** (`05_2` cells 1–3) builds `eˣ` by repeated integration. It's elegant, and it's also a calculus detour on a coding day for a cohort that's shaky on calculus. Consider whether it earns its place — the Gaussian kernel doesn't require it.

---

## 8. Delivery plan

**Modes:** 🟦 notebook (student copy) · 🟩 instructor cells (pre-written, never live) · ⬛ board · 🟨 HTML widget

| # | Step | Mode | Time | Notes |
|---|---|---|---|---|
| 1 | The window: `\|x − xᵢ\| < h` unpacks to an interval | ⬛ board | 3 min | Two lines. Cheap and it makes the indicator readable |
| 2 | **Route 1 — count what's in the window** | 🟨 widget | 5 min | `class-07-kde/kde.html#viz-window` — *"moving window · counting is estimating"*, with the arithmetic `count/(2nh)` shown live as it slides. **The session's one widget**, and the best one in the repo |
| 3 | **Route 2 — the slope of the ECDF** | ⬛ board | 7 min | The full secant derivation. This is the step that connects Tuesday to today; do it properly |
| 4 | Route 1 = Route 2 | ⬛ board | 1 min | Say it out loud. Two questions, one formula |
| 5 | Why `h` can't go to zero | 🟩 instructor cell | 3 min | Run the KDE at `h = 0.01`. The comb has to be *seen* |
| 6 | Silverman's rule, and the `n^(−1/5)` rate | ⬛ board | 3 min | 32× the data to halve the bandwidth. That number lands |
| 7 | **The four-line algorithm** | 🟩 instructor cells | 8 min | Use the working version in §2. Point at its third line as Week 1 Thursday's broadcasting |
| 8 | Route 3 — measurement error, and the Gaussian swap | ⬛ board + 🟩 cell | 6 min | Kernel as a slot: `kᵤ` → `φ`. Then run both and overlay them |
| 9 | Biased but consistent | ⬛ board | 5 min | `E[f̂ₕ] = [F(x+h)−F(x−h)]/2h`, then the limit. **First biased estimator in the course** |
| 10 | Bias–variance trade-off | 🟩 instructor cells | 5 min | Three bandwidths side by side. Treat as new material, not a callback |
| 11 | Lab | 🟦 notebook | rest | See below |

**Build cost: steps 5, 7, 8, 10 (~40 min)** — and step 7's code has to be written from scratch for the Gaussian case because the notebook's version doesn't run.

**Cut first:** the exponential-function construction (`05_2` cells 1–3) — it's a calculus detour and nothing today needs it. Then step 8's measurement-error route. **Do not cut** step 3 or step 9.

### The lab

`uu_fa26` has no KDE lab, but **`labs/class-07-kde/` has a complete one**: a Touch→Derive→Build page with a live playground, an assignment where students implement both kernels against a stdin/stdout protocol, `test_kde.py` as a local autograder, `sampler.py` and `sampler.js` as reference implementations, and instructor solutions in `NOTES.md`. It's the most finished artifact in the repo.

Two options: assign the HTML lab as-is (it's self-contained and served over http), or port the assignment into a notebook to match the format of every other week. The autograder is Python and transfers either way. **Given that nothing else exists, I'd use it as-is this year** and port it later if the format inconsistency grates.

---

## 9. Look ahead

- **KDE machinery *is* Week 8's conditional expectation.** The LCLS/Nadaraya–Watson estimator is a ratio of two kernel sums, and its denominator is literally a KDE. Same bandwidth, same `h → 0` / `nh → ∞` conditions, same boundary bias. Week 8 is much cheaper if today lands.
- **Bias vs. consistency separates today and stays separated.** Week 4 Thursday formalizes unbiasedness and consistency as distinct properties; today is the concrete example that motivates the distinction. Say "we'll name this properly next week."
- **The bias–variance trade-off returns constantly** — Week 4's estimator quality, Week 8's bandwidth, Week 14's regularization. This is its first appearance and, given ML is concurrent, probably its first appearance anywhere for these students.
- **The Gaussian kernel is the normal density**, which is Week 6's CLT limit and Week 10's normal likelihood. Today is where `exp(−z²/2)/√(2π)` first appears; recognizing it later is worth the flag.
- **`n^(−1/5)` vs `n^(−1/2)`.** Week 4's standard error shrinks like `1/√n`; the KDE bandwidth shrinks like `n^(−1/5)`. Nonparametric estimation converges more slowly than parametric, and that's the honest reason Week 11 fits lines instead of curves. Worth one sentence when the `1/√n` rate arrives.
- **The IQR in the robust Silverman form** needs Week 1's IQR bug fixed. If it isn't, the robust bandwidth is wrong.

## 10. Looking back

- **Tuesday is the direct prerequisite and today pays it off twice.** `f = F′` becomes Route 2; the ECDF becomes the thing you take a secant of. If Tuesday's difference-quotient picture landed, Route 2 is easy. If it didn't, today is the second chance.
- **Tuesday's "density is a rate, not a probability"** is what the `2nh` denominator means. Point at it.
- **Sep 8's proportion** is Route 1 — count the events, divide by `n`. Third session running that this identity does the work.
- **Week 1 Thursday's broadcasting** is the third line of the KDE algorithm, and this is the payoff for that whole session: `np.abs(grid[:,None] - X[None,:])` is exactly the pairwise grid from the distance-matrix demo.
- **Week 1 Tuesday's IQR and `sd`** are both inputs to Silverman's robust form.

---

## 11. Source map

- `class_07/05_1_kde.ipynb` — 13 cells. Estimating `f(x)` (1), the absolute-value window (2), the moving-window proportion (3), **the ECDF-secant derivation (4)**, why `h > 0` (5), Silverman (6), the four-step algorithm (7), **working code (8)**, expectation of the KDE (9), the density function (10, **truncated mid-sentence**), **biased but consistent (11)**, over/under-fitting (12).
- `class_07/05_2_gaussian_kernel.ipynb` — 12 cells. Building `eˣ` by integration (1), properties (2), the logarithm (3, **truncated**), the Gaussian kernel (5), its properties (6), the uniform kernel (7, **brace bug**), the Gaussian swap (8, **`h` vs `h²`**), measurement error (9, **same error**), Silverman constants (10, correct), **broken code (11)**.
- **`labs/class-07-kde/`** — `kde.html` (the lab), `lecture.html`, `viz.js`, `data.json`, `sampler.py`, `sampler.js`, `kde.py` (assignment template), `test_kde.py` (autograder), `NOTES.md` (solutions + common errors). Widgets: `viz-window`, `viz-stack`, `viz-biasvar`, `viz-kernel-compare`, `viz-try-it`.
- The HTML lab pins the toy sample **`{2, 4, 5, 5, 9}` with `h = 1.5`** and reuses those exact numbers in the assignment. If you write anything new, use the same numbers.

## 12. Open questions

- **Fix `05_2` before recording anything.** The Gaussian formula (`h` vs `h²`), the `φ` argument, the brace bug, and the code. Four fixes; §7 has all of them. A broken function in a pre-class video is worse than one in class, because nobody can raise a hand.
- **Use the HTML lab, or port it?** It's complete, autograded, and the best thing in the repo, but it's a web page in a course otherwise delivered as notebooks. My recommendation: use it as-is this year.
- **Does the exponential-function construction stay?** `05_2` cells 1–3 build `eˣ` by repeated integration. Elegant, and a calculus detour on a coding day for a calculus-shy cohort. Nothing today depends on it.
- **Which notebook is the video and which is the class?** I've assumed `05_1` (uniform KDE) is the video and `05_2` (Gaussian) is the class, matching the Tuesday pattern of building-block-first. Worth confirming — the alternative reading is that the whole KDE derivation is the video and class time is entirely the lab.
- **Is `07_1_pdf`'s normal density fixed by now?** Today's Gaussian kernel is that same density with `μ = 0`, `σ = 1`. If Tuesday shipped the version missing its factor of 2, students will see two inconsistent normals in three days.
