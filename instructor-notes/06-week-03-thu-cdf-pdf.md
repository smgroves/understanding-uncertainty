# Week 3, Thursday (Sep 10) — CDF and PDF

- **Schedule focus (F26_scheduling):** CDF/PDF
- **Day type:** Lab / Coding Day
- **Pre-class video:** CDF/PDF → `class_06/04_1_cdf.ipynb` (11 cells)
- **In-class:** *"Generating CDFs walkthrough (06)"* → `class_06`, plus `class_06/07_1_pdf.ipynb` (**4 cells, two formulas wrong**)
- **Lab:** *"Outages lab (05 lab)"* — see §12
- **Widgets:** `labs/class-06-cdf/cdf.html` — `viz-grid-limit`, `viz-converge`, `viz-inverse`, `viz-sample`
- **Also:** html `labs/class-06-cdf/lecture.html`

> **`class_06/04_1_cdf` opens with *"In the last lecture, we introduced the ECDF `F̂(x)` and the CDF `F(x)`"* — and under this schedule that sentence is finally true.** Tuesday built the ECDF. Today differentiates it. Budget one minute of recap, not fifteen of construction.
>
> The schedule calls today a *"generating CDFs walkthrough"*, which matches the design memo sitting in `class_06/04_lab.ipynb`: simple random mechanisms produce stable population-level shapes, and a distribution is the description of that stability. That framing is better than "here are three named distributions" — see §12.

---

## 1. What students actually see

| Artifact         | File                                                      | Status                                                                                         |
| ---------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Quiz             | —                                                        | On Week 2: probability spaces, random variables, expectation, variance, Bernoulli, proportions |
| Pre-class video  | `class_05/02_numeric_variables` (13 cells) — the ECDF  | needs porting into`Week 3/`. **Its one code cell is broken — see §7**                |
| In-class lecture | `class_06/04_1_cdf` (11 cells, all markdown) — CDF/PDF | needs porting; opens by recapping the video                                                    |
| PDF material     | `class_06/07_1_pdf` (**4 cells**)                 | normal, Poisson, log-normal as bare formulas.**Two of the three have errors**            |
| Instructor cells | —                                                        | to build                                                                                       |
| Lab              | `class_06/04_lab.ipynb` — **not a lab**          | It's a one-cell design memo. See §7                                                           |
| Board            | —                                                        | The grid limit,`f = F′`, and the sum-becomes-integral derivation                            |

**`class_06/04_lab.ipynb` is a single markdown cell containing a design conversation, not a lab.** It reads *"Yes. That is much better…"* and sketches a class called **"Where distributions come from"** — simulate a mechanism, plot a small sample, plot the ECDF, increase `n`, compare with the theoretical CDF, explain why that shape arose. **That design is genuinely good** and it belongs to Thursday's lab slot. It just hasn't been built, and the file name makes it look like it has.

---

## 2. The content, from scratch

Today has one real idea with a long approach to it: **the CDF is the object that a proportion converges to, and the density is its derivative.** Everything else is bookkeeping around that.

### Part A — Recap: the ECDF (Tuesday, in one minute)

Tuesday built `F̂ₙ(x) = (1/n) Σᵢ 𝟙{xᵢ ≤ x}` — the proportion of the sample at or below `x` — and showed it is unbiased for `F(x) = p[X ≤ x]` with variance `F(x)(1−F(x))/n`. Today starts from `F` and asks what it is the *integral* of.

The one line to re-put on the board: **`F(x) = p[X ≤ x]`, and `F̂ₙ` estimates it by counting.** Everything today is about differentiating that object.

### Part B — The puzzle, and where the density comes from

The notebook motivates the density with a genuine paradox. Draw a value uniformly from the grid `{1/K, 2/K, …, K/K}`, each with probability `1/K`. The expected value is `1/2 + 1/(2K)`, which tends to `1/2`. But the probability of *any particular value* is `1/K`, which tends to **0**. So in the limit, the average is `1/2` and every individual outcome has probability zero. What is going on?

The resolution is that **probability stops living on points and starts living on intervals**, and the object that measures it is a *rate* rather than a mass.

Here is the derivation, and it's the centre of the session. Put `X` on a grid `{x₁,…,x_J}` with spacing `h`. The probability that `X` lands in the cell around `x_j` is

```
p[x_j − h/2 ≤ X < x_j + h/2] = F(x_j + h/2) − F(x_j − h/2)
```

Approximating `X` by `x_j` inside each cell gives a discretized version with an honest PMF, and the expectation is

```
E[X] ≈ Σⱼ x_j · [F(x_j + h/2) − F(x_j − h/2)]
```

Now the move: **multiply and divide by `h`.**

```
E[X] ≈ Σⱼ  x_j · [F(x_j + h/2) − F(x_j − h/2)]/h · h
        ↓         ↓                                 ↓
        ∫         F′(x)                             dx
```

Each piece converges to something: the sum becomes an integral, the difference quotient becomes a derivative, and `h` becomes `dx`. So

```
E[X] = ∫ x F′(x) dx
```

and we name `f(x) = F′(x)` the **probability density function**.

**That difference quotient is the whole lesson.** The density is not "the probability of `x`" — it's the *rate at which probability accumulates* as you sweep past `x`. Which is exactly why individual points can have zero probability while intervals have positive probability: `f(x)·h` is the probability of a small interval of width `h`, and it goes to zero with `h`.

Given the cohort's calculus, do not assume "difference quotient → derivative" is familiar. Draw it: two points on the CDF, the chord between them, and the chord tilting to a tangent as they close. That picture *is* the density.

### Part C — Continuous expectation and variance

Same two principles as always, with `f(x)` where the probabilities used to be:

```
E[X] = ∫ x f(x) dx
V[X] = ∫ (x − E[X])² f(x) dx
```

Worth saying plainly: **this is the third time these have been defined** (Week 1 for a sample, Week 2 for a discrete random variable, now for a continuous one) and it is the *same* definition each time — weight each value by how likely it is, and add. Only the weighting object changes: `1/n`, then `pₗ`, now `f(x)dx`.

### Part D — The quantile function

Run the CDF backwards. Pick a height `u` between 0 and 1, find the `x` where `F(x) = u`:

```
q = F⁻¹(u)
```

This is Aug 27's quantile — the value with proportion `u` below it — now as a *function* rather than a sorted-array index. It is also the engine of simulation: feeding uniform random numbers into `F⁻¹` produces draws from `F`. That's inverse-transform sampling, and it's what `viz-sample` demonstrates.

### Part E — Three distributions, worked

The notebook poses each as an exercise: *what are its density, quantile function, expectation, and variance?*

|                           | CDF`F(x)`                    | Density`f(x)`                                 | Quantile`F⁻¹(u)`      | `E[X]` |
| ------------------------- | ------------------------------ | ----------------------------------------------- | ------------------------- | -------- |
| **Uniform(0,1)**    | `x` on `[0,1]`             | `1` on `[0,1]`                              | `u`                     | `1/2`  |
| **Exponential(λ)** | `1 − e^(−λt)`, `t ≥ 0` | `λe^(−λt)`                                 | `−ln(1−u)/λ`         | `1/λ` |
| **Logistic(μ,σ)** | `1/(1 + e^(−(x−μ)/σ))`   | `e^(−z)/(σ(1+e^(−z))²)`, `z=(x−μ)/σ` | `μ + σ·ln(u/(1−u))` | `μ`   |

The uniform is the one to do live — its density is the constant `1`, which makes "the density is a rate, not a probability" concrete: the rate is flat, so probability accumulates linearly. The exponential is the one to assign. The logistic is worth doing only because its quantile function is the **log-odds**, which returns in Week 12 as logistic regression.

### Part F — Transformations

If `Y = a + bX` and you know `X`'s distribution, substitute `X = (Y−a)/b`:

```
F_Y(y) = F_X((y − a)/b)
f_Y(y) = f_X((y − a)/b) · 1/|b|
```

**The `1/|b|` is the part worth explaining rather than stating.** Stretching the axis by `b` spreads the same total probability over `b` times as much room, so the density — a rate per unit of `x` — must fall by a factor of `b` to keep the area at 1. The absolute value handles `b < 0`, which flips the axis without making probability negative. Students who accept `F_Y` and then trip on `f_Y` have not internalized that a density is per-unit.

---

### Reading

*Key in `README.md`. From `Reading-Roadmap.md` unless marked [Map] (= `prep/ds5030_syllabus_reading_map.pdf`).*

- **Primary** — **AoS Ch. 2** (CDF/PDF as objects, and the quantile function). **B&H Ch. 3, §3.6**, *"Cumulative distribution functions"* (p. 108) and **Ch. 5, §5.1**, *"Probability density functions"* (p. 195).
- **Supporting** — **AoS Ch. 7** (Estimating the CDF), carrying the empirical side over from Tuesday.
- **Fuller treatment** — **C&B Ch. 1** (distribution functions defined rigorously) and **Ch. 3** (the named continuous distributions this session works through — uniform, exponential, logistic).
- **Intuition first** — **G&S Ch. 1 vs. Ch. 2**, deliberately paired around parallel questions, discrete and then continuous, so a CDF/density pair reads as one idea worked twice. That pairing is the cleanest antidote to the grid puzzle feeling like a trick.
- **[Map] adds** — **G&S Ch. 2** (Continuous Probability Densities) is the cleanest introduction to deriving one of `F`/`f` from the other.

---

## 3. The optimization view

- **Objective:** expected absolute error, *tilted* — undershooting costs `τ` per unit, overshooting costs `1 − τ`
- **Argmin:** the `τ`-th quantile, `F⁻¹(τ)`. At `τ = ½` the penalties are equal and the argmin is the median — Aug 27's absolute-distance box
- **Solved by:** closed form (invert `F`) or grid search (scan candidates) when `F` has no clean inverse

This reframes the quantile as more than a cut point in sorted data: **each quantile is the best single guess under one specific asymmetric cost.** It's why a delivery service promises the 90th percentile of its delivery times rather than the mean — being an hour late costs far more than being an hour early, so `τ` is set high and the optimal promise moves into the tail.

Neither notebook has this. It's three lines, and it connects Aug 27's median to today's `F⁻¹` as two instances of one thing.

---

## 4. Assumptions that make it work

| Claim                                 | Assumption                                                                                                         |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `F̂ₙ(x)` is unbiased for `F(x)` | Identically distributed. Independence not needed                                                                   |
| `V[F̂ₙ(x)] = F(x)(1−F(x))/n`     | **i.i.d.** — same split as Sep 8                                                                            |
| `f(x) = F′(x)` exists              | `F` is **differentiable** at `x`. Fails at any jump — a discrete or mixed variable has no density there |
| `E[X] = ∫ x f(x) dx`               | The integral**converges**. It does not always (see §5)                                                      |
| `F⁻¹` is well defined             | `F` is **strictly increasing**. Flat stretches make the inverse ambiguous; jumps make it undefined         |
| `f_Y(y) = f_X((y−a)/b)/\|b\|`        | `b ≠ 0`, and the map is monotone. Non-monotone transforms need a sum over branches                              |
| A density is a probability            | **It is not.** `f(x)` can exceed 1 — see §5                                                              |

The third row is the one to state out loud: **every result today assumes the CDF is smooth**, and Week 2's variables (coin flips, labels) had CDFs that are pure staircase. Continuous and discrete are genuinely different objects sharing one notation.

---

## 5. Concrete failure cases

**A density is not a probability, and can exceed 1.** Uniform on `[0, 0.1]` has `f(x) = 10`. Students read `f(x) = 10` as "probability 10" and conclude something has gone wrong. The fix is the units: `f` is probability **per unit of x**, so on a narrow interval the rate is high while the total stays 1. This is the single most common misconception about densities and it is worth heading off before it appears.

**Expectations that don't exist.** The Cauchy density `f(x) = 1/(π(1+x²))` is a perfectly good density — smooth, positive, integrates to 1 — and `∫ x f(x) dx` **diverges**. It has no mean. Sample means from a Cauchy don't settle down no matter how large `n` gets. Worth one minute, because everything in Weeks 4–6 assumes a finite mean and variance, and this is the counterexample that shows the assumption has content. It also foreshadows why the WLLN needs hypotheses.

**`F⁻¹` on a step function.** The ECDF is a staircase, so `F̂⁻¹` is ambiguous at every jump — which is exactly why there are ~9 different quantile conventions in NumPy and why the hand-rolled `quantile()` from Week 1 disagrees with `np.quantile`. The abstract issue and the Week 1 annoyance are the same issue.

**The grid puzzle itself.** It is a genuine paradox at the level students have, not a trick, and the resolution — probability lives on intervals, density is a rate — is the day's content. Don't resolve it too fast.

**Non-monotone transformations.** `Y = X²` with `X` symmetric around 0: two values of `X` map to each `Y`, so the substitution rule needs a sum over both branches. The notebook says non-linear transforms "generalize" and are "typically easier computationally," which is true but skips that the naive formula is *wrong* rather than just hard.

**`E[g(X)] ≠ g(E[X])`.** Not in the notebook, and today is where it becomes bitable, since transformations are the topic. `E[X²] ≠ E[X]²` — they already know this from the variance shortcut — is the same fact. Jensen's inequality is the general statement and it appears on the syllabus in Week 13; naming the pattern now costs a sentence.

---

## 6. Five questions students will ask

**Q1. "If every individual value has probability zero, how can anything happen?"** Because probability attaches to intervals, not points, and there are uncountably many points in any interval. The useful analogy is mass: a steel rod has positive total mass, but any single cross-section — a plane of zero thickness — has zero mass. Density is mass *per unit length*; you get actual mass only by integrating over a length. Probability density works identically. The grid puzzle is this exact phenomenon caught mid-limit: as `K` grows, each point's probability shrinks to zero while the total stays 1.

**Q2. "So `f(x)` is the probability of `x`?"** No, and this is the misconception to kill on sight. `f(x)` is a **rate**: probability per unit of `x`. The probability of a small interval is `f(x)·h`, and the probability of a single point is `f(x)·0 = 0`. The tell that it's not a probability: `f(x)` can be greater than 1 (uniform on `[0, 0.1]` has `f = 10`). What must integrate to 1 is the *area*, not the height.

**Q3. "Why do we need the CDF at all when we have the density?"** Three reasons. The CDF always exists — every random variable has one, including discrete ones with no density at all. The CDF is what you can *estimate directly* by counting, which is the ECDF, and counting requires no bins, no bandwidth, and no smoothness assumption. And the CDF answers the questions people actually ask — "what fraction is below this threshold?" — without integrating anything. The density is often more convenient and more familiar, but it's the derived object, not the primary one.

**Q4. "Where does the `1/|b|` in the transformation come from?"** From the density being per-unit. Stretch the `x`-axis by a factor of `b` and the same total probability now occupies `b` times as much room, so the rate per unit must drop by a factor of `b` for the area to stay 1. Check it on the uniform: `X ~ U(0,1)` has `f = 1`; then `Y = 2X` is uniform on `(0,2)` and must have `f = 1/2`, which is exactly `1/|b|`. The absolute value covers `b < 0`, where the axis flips but probability can't go negative.

**Q5. "Why does the same distribution get described two different ways?"** Because different distributions are *specified* more naturally from different ends. The uniform and exponential have clean CDFs and messier densities; the normal has a clean density and a CDF with no closed form at all — `Φ(x)` is defined as an integral and computed numerically. So you start from whichever end is simpler and get the other by differentiating or integrating. They carry identical information; only convenience differs.

---

## 7. Bugs and simplifications in the material

### Verified — two of these are wrong numerically, and I checked

- **The ECDF code does not work and returns wrong values** — `class_05/02_numeric_variables` cell 7:

  ```python
  def ecdf( x )                                  # ← missing colon: SyntaxError
      grid = sorted( x.unique() )                # ← sorted() returns a list; lists have no .reshape
      n = len(x)
      I = grid.reshape(-1,1) <= x.reshape(1,-1)  # ← comparison is backwards
      F_hat = I.sum(axis=0)/n                    # ← sums over the wrong axis
  return F_hat, grid                             # ← dedented: return outside function
  ```

  Five separate problems. Beyond the syntax, the logic is wrong: it computes `𝟙{gridⱼ ≤ xᵢ}` and sums over the grid, when the ECDF needs `𝟙{xᵢ ≤ gridⱼ}` summed over the data. On the sample `{2,4,5,5,9}` the notebook version returns `[0.2, 0.4, 0.6, 0.6, 0.8]` — length 5 instead of 4, and **it never reaches 1**, contradicting the property stated two cells later. The correct answer is `[0.2, 0.4, 0.8, 1.0]`. Working version:
  ```python
  def ecdf(x):
      x = np.asarray(x)
      grid = np.unique(x)                        # already sorted
      I = x.reshape(1, -1) <= grid.reshape(-1, 1)
      return I.sum(axis=1) / len(x), grid
  ```
- **The normal density is missing the factor of 2 in the exponent** — `class_06/07_1_pdf` cell 1 gives `f(x) = (1/(√(2π)σ))·e^(−(x−μ)²/σ²)`. It should be `e^(−(x−μ)²/(2σ²))`. **As written it integrates to `1/√2 ≈ 0.707`, not 1** — I checked numerically. This is the most important density in the course and it appears in Week 3, Week 6 (CLT), Week 8, and Week 10.
- **The log-normal formula has three errors** — `07_1_pdf` cell 3: the exponent is `−(log(y)−μ)²/2σ` (should be `/(2σ²)`), the integration variable is `dz` while the integrand is in `y`, and the upper limit is `x` where it should be `y`. Also `1/y` is missing from the density — the log-normal picks up a Jacobian, which is precisely the `1/|b|` idea from cell 10 of `04_1_cdf`. Ironic, since the notebook introduces it as "a chance to use our transformation analysis skills."
- **`class_06/04_lab.ipynb` is a design memo, not a lab.** One markdown cell of planning conversation. The design in it is good; the lab does not exist.
- **`alignat*` again** — `02_numeric_variables` cell 11. Same MathJax fragility as Week 2; check it renders.
- **Cell 12 of `02_numeric_variables` says "above `x` and `I=1` or below"** — the indicator is defined as `𝟙{xᵢ ≤ x}`, so `I = 1` means *at or below*. Reversed.

### Simplifications

- **`07_1_pdf` is four cells for three distributions.** Normal, Poisson, log-normal, each a bare formula with no derivation, no plot, no worked expectation. This is the thinnest source in the first half of the course, and the Poisson is doubly odd — it's a *mass* function in a notebook about densities, with nothing said about why it's there.
- **`E[X] = ∫ x F′(x) dx` is written with no bounds** (cell 4), then with `∫ₓ` (cell 5). Should be `∫₋∞^∞`. Minor but this is the cohort that will wonder what `∫ₓ` means.
- **The discretization derivation glides over "→".** Three separate limits happen at once (sum→integral, difference quotient→derivative, `h`→`dx`). For a calculus-shaky cohort, name them as three things, not one arrow.
- **The quantile function assumes `F` is invertible** without saying so. See §4.
- **The uniform, exponential, and logistic are posed as questions and never answered** in the notebook. The answers need to exist somewhere — §2 Part E has them.

---

## 8. Delivery plan

**Modes:** 🟦 notebook (student copy) · 🟩 instructor cells (pre-written, never live) · ⬛ board · 🟨 HTML widget

| #  | Step                                                               | Mode                     | Time   | Notes                                                                                                                                                                       |
| -- | ------------------------------------------------------------------ | ------------------------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1  | **Quiz**                                                     | —                       | 10 min | On Week 2                                                                                                                                                                   |
| 2  | **ECDF recap from the video**                                | 🟨 widget                | 4 min  | `class-05-eda/lecture.html#viz-ecdf-drag` — *drag the sample, watch the ECDF move*. Fastest possible re-anchor of something they watched, and it beats re-deriving     |
| 3  | `E[F̂ₙ] = F`, `V[F̂ₙ] = F(1−F)/n`                         | ⬛ board                 | 4 min  | Three lines each, both inherited from Week 2 Thu. Do these live even though the video states them — they're the payoff of the Bernoulli work                               |
| 4  | `F̂ₙ → F`: the empirical thing estimates the population thing | 🟨 widget*or* ⬛ board | 3 min  | `class-06-cdf/cdf.html#viz-converge` — more data, the steps close in on the curve. **The hinge of the whole day.** Use one widget here or at step 6, not both      |
| 5  | **The grid puzzle**                                          | 🟨 widget                | 4 min  | `class-06-cdf/cdf.html#viz-grid-limit` — "the grid, made finer." Let them watch each point's probability vanish while the mean holds. **The session's one widget** |
| 6  | **Sum → integral, `f = F′`**                             | ⬛ board                 | 8 min  | The centre of the day. Multiply and divide by`h`; name the three limits separately. Draw the chord tilting to a tangent                                                   |
| 7  | `E[X] = ∫ x f dx`, `V[X] = ∫ (x−E)² f dx`                  | ⬛ board                 | 3 min  | Third definition of the same two things. Say so                                                                                                                             |
| 8  | Density is a rate, not a probability                               | ⬛ board                 | 3 min  | Uniform on`[0, 0.1]` has `f = 10`. Kill the misconception here                                                                                                          |
| 9  | Quantile function`F⁻¹`, + the optimization view                | ⬛ board                 | 4 min  | §3. Connects Aug 27's median to today's`F⁻¹`                                                                                                                           |
| 10 | Uniform worked; exponential assigned                               | 🟦 notebook              | 5 min  | Do the uniform live — flat density makes "rate" concrete                                                                                                                   |
| 11 | Transformations and`1/\|b\|`                                       | ⬛ board                 | 4 min  | Check it on`Y = 2X` uniform. Don't just state the formula                                                                                                                 |
| 12 | Normal / Poisson / log-normal                                      | 🟦 notebook              | —     | **Fix the formulas first** (§7). Thin material; consider pushing to Thursday                                                                                         |

**Build cost: near zero for the lecture** — the ECDF construction moved into the video, and steps 2 and 4 use existing widgets. **But the video itself needs the broken ECDF cell fixed before it's recorded** (§7); that's the real build task for this session, and it belongs to the video, not the lecture.

**Cut first:** step 12 (broken and thin anyway), then step 10's logistic. **Do not cut** step 6 — everything else today is scaffolding around it.

---

## 9. Look ahead

- **The ECDF is Thursday's foundation.** KDE is introduced three ways in the html lecture, and one of them is *"the slope of the ECDF."* Today builds the ECDF; Thursday differentiates it. That's the same `f = F′` move, applied to the empirical object.
- **`F(x)(1−F(x))/n` is the standard-error band** on Thursday's and Week 4's plots. It's already derivable today.
- **Inverse-transform sampling (`F⁻¹` of a uniform) is how simulation works** — Week 9's Monte Carlo and Week 9 Thursday's Markov chains both rest on it. If RNG (`class_04/04_2`) is being dropped, **this is where students learn that random draws come from somewhere**, and step 10 becomes more important than it looks. `viz-sample` demonstrates it directly.
- **The exponential returns in Week 4 Tuesday** as the constant-hazard distribution — it is the survival/hazard session's worked example, and that session is the thinnest in the first half (5 cells). Doing the exponential properly today makes Week 4 Tuesday cheaper.
- **The logistic quantile is the log-odds**, which is Week 12's logistic regression. Long fuse; light it in one sentence.
- **`E[g(X)] ≠ g(E[X])`** (§5) is Jensen's inequality, on the syllabus for Week 13 Tuesday. Naming the pattern today costs nothing.
- **The Cauchy counterexample** is the reason the WLLN (Week 9) needs finite variance as a hypothesis. Mention it today and Week 9's assumptions land as necessary rather than decorative.
- **"Three definitions of expectation, one idea"** (step 8) is worth saying because Week 8 adds a fourth — conditional expectation — and it will feel like a continuation rather than a new object.

## 10. Looking back

- **Sep 8 is doing all the work today.** `F̂ₙ` is a sample proportion, `E[𝟙{A}] = p(A)` is the bridge from ECDF to CDF, and both the unbiasedness and the variance are the Bernoulli results with a new event. **Frame the whole first half of today as "Thursday's results, applied to `≤ x`"** and the ECDF costs almost nothing to teach.
- **Week 2 Tuesday's `E[X] = Σ pₗ xₗ`** becomes `∫ x f(x) dx` today by the same discretization argument. Same definition, finer grid.
- **Aug 27's quantiles and IQR** become `F⁻¹` today — the sorted-array index becomes a function. Also: the ~9 quantile conventions that made the hand-rolled function disagree with NumPy are explained today by `F̂⁻¹` being ambiguous at jumps.
- **Aug 27's `1/n` variance convention** is now fully consistent: the population objects have no `n−1` anywhere.

---

## 11. Source map

- `class_05/02_numeric_variables.ipynb` — 13 cells. Numeric variables (0), why rugplots fail (1–2), indicator `𝟙{xᵢ ≤ x}` (3), indicator→proportion (4), **the ECDF defined (5)**, computing it (6), **the broken code (7)**, properties (8), what it estimates (9), **the CDF (10)**, unbiasedness (11), variance (12).
- `class_06/04_1_cdf.ipynb` — 11 cells, all markdown. Recap (0), **the grid puzzle (1)**, discretizing (2), **the sum→integral derivation (3)**, `f = F′` (4), continuous `E` and `V` (5), quantile function (6), uniform (7), exponential (8), logistic (9), transformations (10).
- `class_06/07_1_pdf.ipynb` — **4 cells**: density-first framing (0), normal (1, **wrong**), Poisson (2), log-normal (3, **wrong**).
- `class_06/04_lab.ipynb` — 1 cell, a design memo. The "Where distributions come from" sketch belongs to Thursday.
- Widgets in `labs/class-06-cdf/cdf.html`: `viz-grid-limit` (the grid made finer), `viz-converge` (more data, steps close in on the curve), `viz-inverse` (inverse-transform mapper: pick a height, get an age), `viz-sample` (draw uniforms, invert, watch the distribution reappear).
- html `labs/class-06-cdf/lecture.html` — the full CDF→PDF development in prose, including all three worked distributions with their densities and quantile functions answered.

## 12. Open questions

- ~~Where does the ECDF live?~~ **Resolved: the ECDF is this session's pre-class video, CDF/PDF is the lecture.** Two consequences. First, `class_05/02_numeric_variables` needs porting into `Week 3/` as the video notebook, and **its ECDF code must be fixed first** (§7) — a broken function is worse in a video than in class, because nobody can ask. Second, in-class time treats the ECDF as recap: §8 budgets four minutes and a widget, not a construction.
- **Should `07_1_pdf` merge into Thursday?** Four cells, two of them with wrong formulas, on a day that's already full. The normal density matters enormously; the Poisson sits oddly in a densities lecture. Consider fixing the normal, moving it to Thursday alongside the Gaussian kernel (where it's needed anyway), and dropping the Poisson until Week 12's Poisson regression.
- **Who writes Thursday's lab?** The "Where distributions come from" design in `04_lab.ipynb` is good and unbuilt.
- **Are the uniform/exponential/logistic exercises answered anywhere for students?** They're posed and never resolved in the notebook. The html lecture has them.
- **Does the quiz cover Sep 8?** It was a Thursday coding session with no lab, so there may be less to quiz than usual.
