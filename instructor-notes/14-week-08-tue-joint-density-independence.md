# Week 8, Tuesday (Oct 13) — Joint Density and Independence

- **Syllabus topic (tentative):** Joint density, independence · week theme *"Two+ RVs"*
- **Day type:** Quiz / Math Day — first session after the midterm
- **Primary source:** `uu_sp26/.../01_probability/02_moments_and_likelihood.ipynb` §2, cells 19–33
- **Secondary:** `uu_sp26/.../04_conditioning_and_bayes/00_bayes.ipynb` — the joint density/mass function and marginal distributions
- **Widgets:** `labs/class-02-vectors/vectors.html` — `viz-zero-cov`, `viz-covariance`
- **Status:** the schedule for this half is the syllabus's tentative plan; the spreadsheet has the dates but blank topics

> **The whole second half of the course lives on this session.** Every remaining topic — conditional expectation Thursday, Markov chains next week, likelihood the week after, regression, and the Bellman equation in December — is about more than one random variable at a time. Today is where "more than one" gets defined.
>
> It is also the session where a half-remembered fact gets corrected. Sep 3 showed that zero covariance does **not** imply independence. Today supplies the exception everyone half-remembers — for *jointly normal* variables it does — and being precise about which is which is most of the value here.

---

## 1. What students actually see

| Artifact | File | Status |
|---|---|---|
| Quiz | — | First after the midterm; may be worth skipping or making light |
| Pre-class video | `sp26` 02_moments §2 cells 20–26 | needs porting into `Week 8/` |
| In-class | same, plus the bivariate normal plots (cells 27–30) | **has real code** — three plotting cells that run |
| Instructor cells | — | mostly exist; see §8 |
| Lab | none listed | — |
| Board | — | Joint CDF/density, marginals, independence as factorization, covariance |

**Unlike almost everything in the first half, this source has working code.** Cells 27–30 generate multivariate normal data with a chosen `ρ` and draw joint KDE plots, scatter-with-contours, and a side-by-side comparison. That's `seaborn.jointplot`, and it's exactly the picture the session needs.

---

## 2. The content, from scratch

### Random vectors

Everything so far has been `X : 𝒵 → ℝ` — one number per outcome. Now:

```
X : 𝒵 → ℝⁿ
```

Each outcome produces `n` numbers at once. A patient yields blood pressure *and* age *and* cholesterol; a listing yields price *and* mileage.

The source is honest about the difficulty and worth quoting: *"this is much harder than one dimension: we want to track how random variables move together… we're mainly interested in the boring cases."* That is a fair description of where this ends up — the tractable multivariate families are few, and most of the session is spent on the one that matters.

### Joint distribution and density

The definitions are exactly what you'd write down by analogy:

```
F(x₁,…,x_N) = p[X₁ ≤ x₁ and X₂ ≤ x₂ and … and X_N ≤ x_N]

f(x₁,…,x_N) = ∂^N F / ∂x₁∂x₂⋯∂x_N
```

Two honest observations to make immediately. First, the joint CDF is the same "probability of being below a threshold" from Sep 8, with several thresholds at once. Second — and the notebook says this outright — **these objects are not very expressive.** Nobody reasons about a five-dimensional mixed partial derivative. They exist so that the things you *do* reason about (marginals, independence, covariance) have a foundation.

For a calculus-shy cohort, do not dwell on the mixed partial. State it, say it's the `n`-dimensional version of `f = F′`, and move to the picture.

### Marginals: throwing a variable away

Given a joint density, recover the distribution of one variable by **integrating out** the others:

```
f_X(x) = ∫ f(x,y) dy
```

Intuition worth giving: the joint density is a hill over the `(x,y)` plane. The marginal of `X` is the shadow it casts on the `x`-axis — you've collapsed the `y` direction by summing everything at each `x`. `seaborn.jointplot` draws exactly this: the joint density in the centre, both marginals along the edges. Point at the plot when you say it.

**Marginals lose information.** Two very different joint densities can have identical marginals — one where the variables move together and one where they don't. That's the whole reason joint distributions are a topic.

### Independence is factorization

Here is the definition, and it is the most important line of the session:

```
X₁,…,X_n are independent  ⟺  f(x₁,…,x_n) = f₁(x₁) × f₂(x₂) × ⋯ × f_n(x_n)
```

The joint density is the product of the marginals. Nothing more.

Read it as: **knowing some of the variables tells you nothing about the others**, so the joint contains no information beyond what the marginals already carry. Flip a coin, flip it again — independent.

Three things to draw out:

- **This is the definition students should carry**, not "uncorrelated." Factorization is a statement about the *entire* joint distribution; correlation is one number summarizing one aspect of it.
- **It is the third version of "independent" this course has given.** Sep 1 defined it for *events* (`p[A∩B] = p[A]p[B]`), Sep 3 used it for *samples* (the i.i.d. assumption behind `V[X̄ₙ] = σ²/n`), and today defines it for *random variables*. Same idea escalating; naming the sequence prevents the sense that a familiar word keeps changing meaning.
- **The i.i.d. assumption finally has a formal definition.** Every result since Sep 3 has assumed it. Today is when it stops being a phrase.

### Covariance, and the implication that runs one way

```
cov(X,Y) = E[(X − μ_X)(Y − μ_Y)] = ∫∫ (x − μ_X)(y − μ_Y) f(x,y) dx dy
```

Sep 3 computed this on data as a centered dot product. Today is the population version, and the sample one is its estimate.

**If `X` and `Y` are independent, `cov(X,Y) = 0`.** The proof is one line once the density factorizes — the double integral separates into a product of two integrals, each of which is a centered mean, hence zero.

**The converse is false**, and Sep 3 already showed why. Take `X` symmetric about 0 and `Y = X²`: I checked on 400,000 draws and the covariance is `+0.0013` — zero to sampling error — while `Y` is a *deterministic function* of `X`. Total dependence, no correlation. The source poses this as an exercise; have the answer ready.

The reason: **covariance detects only linear co-movement.** A U-shaped relationship has as much positive as negative co-movement and they cancel exactly.

### The bivariate normal — and the exception

Now the family that actually gets used. The scalar form is ugly and the matrix form is the one to teach:

```
f(z) = 1/√((2π)² det Σ) · exp{ −½ (z−μ)ᵀ Σ⁻¹ (z−μ) }

  z = [x, y]ᵀ,   μ = [μ_X, μ_Y]ᵀ,   Σ = ⎡ σ_X²        ρσ_Xσ_Y ⎤
                                        ⎣ ρσ_Xσ_Y     σ_Y²    ⎦
```

**The "if you squint" observation in the source is the key to the whole thing**, and it's a direct callback to Sep 3. Compare with the one-dimensional normal:

```
one dimension:   exp{ −½ ((x−μ)/σ)² }
n dimensions:    exp{ −½ (z−μ)ᵀ Σ⁻¹ (z−μ) }
```

The multivariate exponent is the one-dimensional squared standardized distance, generalized. `(z−μ)ᵀΣ⁻¹(z−μ)` is a **squared distance measured in units of the covariance** — its square root is the **Mahalanobis distance**. That is Sep 3's inner product with a weighting matrix in the middle, and it is why the level sets are ellipses rather than circles: directions with more variance are "closer" in these units.

**And now the exception.** For jointly normal variables:

```
ρ = 0   ⟺   X and Y are independent
```

If `ρ = 0` then `Σ` is diagonal, `Σ⁻¹` is diagonal, the exponent splits into a sum, and `exp` turns a sum into a product — the density factorizes. I checked numerically: with `ρ = 0`, `p[X<0, Y<0] = 0.2500` against `p[X<0]p[Y<0] = 0.2497`.

**This is the fact students half-remember and misapply.** The precise statement is: zero correlation implies independence *only under joint normality*, and it is false in general. Give them both the counterexample and the exception in the same five minutes, or they'll keep exactly one of them.

The source's exercise set makes the general version: `Σ` diagonal ⟹ all the `Xᵢ` independent; `Σ` diagonal with equal `σᵢ²` and equal `μᵢ` ⟹ i.i.d. **That last one is the formal definition of the i.i.d. assumption the course has been using since Sep 3.**

### How little else there is

The source closes with something unusually honest: *"Besides multivariate Normal and multivariate Dirichlet… there's not much else out there."* Real high-dimensional dependence gets handled with Gaussian mixture models or copulas — data-driven tools, not named densities.

Worth saying, because it explains a pattern students will otherwise find suspicious: the normal keeps appearing not only because the CLT makes it show up, but because in more than one dimension it is nearly the only thing anyone can write down.

---

### Reading

*Key in `README.md`. From `Reading-Roadmap.md` unless marked [Map] (= `prep/ds5030_syllabus_reading_map.pdf`).*

*Beyond 10/1 the detailed `Reading-Roadmap.md` stops; these come from [Map].*

- **Primary** — **AoS Ch. 14** (Multivariate Models), the direct match for the bivariate and multivariate normal and for correlation estimation.
- **Supporting** — **AoS Ch. 15** (Inference About Independence), which covers contingency-table independence testing — the discrete counterpart of §2's factorization criterion, and the bridge to next week's transition matrix.
- **Worth knowing** — [Map] flags that the *"conditioning as projection"* framing — that under bivariate normality the conditional expectation is literally a linear projection — is **a beautiful and under-taught result that neither G&S nor AoS spells out geometrically.** That is exactly §3 of this file, and it means the board derivation is doing something the textbooks don't. It is also the direct bridge back to Sep 3's inner product.

---

## 3. The optimization view

- **Objective:** expected squared prediction error using a straight line in `X`: `E[(Y − a − bX)²]`
- **Argmin:** for jointly normal `(X,Y)`, `b* = ρ σ_Y/σ_X` and `a* = μ_Y − b*μ_X`, giving

```
E[Y | X = x] = μ_Y + ρ (σ_Y/σ_X) (x − μ_X)
```

- **Solved by:** closed form — and it is a *straight line in `x`*

I verified this on 800,000 draws with `ρ = −0.6`, `σ_X = 1`, `σ_Y = 2`: at `x = 3` the empirical conditional mean is `−0.996` against the formula's `−1.000`, and the conditional variance is `2.58` against `σ_Y²(1−ρ²) = 2.56`.

**This is the single most valuable thing you can put on the board today**, and it isn't in the source. Three payoffs at once:

1. **It's Thursday's session, previewed.** Conditional expectation is `E[Y|X]`, and here is a closed form for it.
2. **It's the regression line** — Nov 5's topic, arriving three weeks early as a consequence of joint normality rather than as a new technique.
3. **It explains why regression is linear so often.** Not because the world is linear, but because if two variables are jointly normal then the conditional expectation *is exactly* a straight line. The linear model isn't an approximation in that case — it's the truth.

Also note `V[Y | X = x] = σ_Y²(1 − ρ²)`: the conditional variance **doesn't depend on `x`**. That's homoskedasticity, and it's an assumption Nov 5 will make and this session can justify.

---

## 4. Assumptions that make it work

| Claim | Assumption |
|---|---|
| `f = ∂ⁿF/∂x₁⋯∂xₙ` | `F` is differentiable in every argument. Fails for discrete or mixed variables |
| Marginals by integrating out | None beyond the joint density existing |
| Independence ⟹ `cov = 0` | The covariance exists — needs finite variances |
| `cov = 0` ⟹ independence | **False in general.** True *only* under joint normality |
| `Σ` diagonal ⟹ independence | **Joint normality.** For other families a diagonal `Σ` says only "uncorrelated" |
| `E[Y\|X=x]` is linear in `x` | **Joint normality.** In general the conditional expectation is any shape at all |
| `V[Y\|X=x]` is constant | Joint normality again |
| Σ⁻¹ exists | `Σ` non-singular — no variable is an exact linear combination of the others |

**Rows 4 through 7 all say the same thing: joint normality is doing enormous work.** It's worth naming that explicitly, because the pleasant results of the next month (linear conditional expectation, constant conditional variance, uncorrelated meaning independent) are consequences of one strong assumption, not general facts. Thursday's nonparametric estimator exists precisely because that assumption often fails.

---

## 5. Concrete failure cases

**`cov = 0` read as independence.** The `Y = X²` counterexample: covariance `0.001`, and `Y` is a function of `X`. Do it as a number, not a claim.

**Marginals don't determine the joint.** Two datasets with identical marginals in both variables can have `ρ = +0.9` and `ρ = −0.9`. Concretely: run the source's plotting code at `ρ = 0.6` and `ρ = −0.6` and note the edge marginals are indistinguishable while the centres are mirror images. **This is the argument for why joint distributions need studying at all**, and it's four lines of existing code.

**Correlation is not the whole dependence structure** even when it isn't zero. Two variables can have the same `ρ` and completely different joint behaviour — one with a tight middle and independent tails, another that moves together only in crashes. Copulas exist for this. Worth thirty seconds; financial risk models failed in 2008 partly on this point.

**Σ singular.** If one variable is an exact linear combination of others, `Σ⁻¹` doesn't exist and the density is undefined — the distribution lives on a lower-dimensional slice. This is the dummy-variable trap from Sep 8 in its multivariate form, and it returns as a rank condition in Nov 5's regression.

**Assuming joint normality because each margin looks normal.** Marginal normality does *not* imply joint normality. There are joint distributions with perfectly normal margins and wildly non-normal dependence. The `jointplot` picture is the check: look at the middle, not just the edges.

---

## 6. Five questions students will ask

**Q1. "What's the difference between independent and uncorrelated?"** Independence says the *entire* joint density factorizes — knowing `X` tells you nothing whatsoever about `Y`. Uncorrelated says one specific number is zero: the average product of centered deviations. Independence implies uncorrelated; the reverse is false, because covariance only measures *linear* co-movement. `Y = X²` with symmetric `X` has covariance zero and total dependence, since the upward and downward co-movements cancel exactly. The one place they coincide is joint normality, which is exactly why the confusion is so persistent — the case everyone works with is the case where the distinction vanishes.

**Q2. "Why is the multivariate normal density so ugly?"** It isn't, in the right notation. `(z−μ)ᵀΣ⁻¹(z−μ)` is just `((x−μ)/σ)²` from one dimension, written for vectors: a squared distance from the mean, measured in units of the spread. In one dimension "units of the spread" means dividing by `σ`; in `n` dimensions it means multiplying by `Σ⁻¹`, because spread is now a matrix — it differs by direction. The square root of that quantity is the Mahalanobis distance, and it's why the contours are ellipses tilted along the direction of correlation instead of circles.

**Q3. "If `ρ = 0` means independent, why did you spend Week 1 telling us it doesn't?"** Because both are true, of different things. In general, `ρ = 0` does **not** imply independence — `Y = X²` is the standing counterexample. **Under joint normality it does**, because a diagonal `Σ` makes the exponent split into a sum, and `exp` of a sum is a product, which is factorization. So the correct statement carries its condition: *for jointly normal variables*, zero correlation is equivalent to independence. Drop the condition and the claim is false. Almost everyone who half-remembers this drops the condition.

**Q4. "Do I need to be able to compute an `n`-fold mixed partial derivative?"** No. That definition exists so the theory is well-founded, and essentially nobody computes one. What you actually use is the factorization criterion for independence, the covariance matrix, and — for the normal — the matrix formula, which is a one-liner in NumPy. The definition is the foundation; the tools are what you handle.

**Q5. "Why is the normal distribution everywhere?"** Two separate reasons, and they're often conflated. The **CLT** (Oct 1) says averages become normal regardless of what you averaged — that's why sampling distributions are normal. The reason today is different and more mundane: **in more than one dimension, the normal is nearly the only tractable family anyone can write down.** The source says so directly — besides the multivariate normal and the Dirichlet, there isn't much. So the normal appears partly by theorem and partly for lack of alternatives, and it's worth knowing which is which.

---

## 7. Bugs and simplifications in the material

### Verified

- **Cell 27 uses `np.random.multivariate_normal` with no seed**, so the plots differ on every run. Add a seed before this becomes teaching material — you want the same picture you rehearsed.
- **Cell 13's ECDF derivation has swapped indicators.** It writes `𝟙{xᵢ ≤ X}` in the first line and `𝟙{X ≤ x}` in the last, with a mid-derivation note that "the `xᵢ` is the RV here, so swap notation." The result is right and the presentation is confusing. (This is in §1 of the notebook, which is recap material — flag it if you assign the whole notebook.)
- **Cell 16's Taylor expansion is wrong.** It writes `F(x+h) = F(x) + (x+h−x)f′(x) + (h²/2)f′(x) + O(h³)`, where the first-order term must be `h·f(x)` — the *density*, not its derivative — and only the second-order term carries `f′`. As printed, `f'` appears in both terms and `f` in neither. The conclusion it asks students to derive (KDE bias is `O(h²)`) is correct; the route given won't get there.
- **Cell 8's transformation exercise says `f_Y(y) = f_X((y−a)/b)/b, if b>0`** — correct as stated, with the `b>0` condition doing the work that `|b|` does in the general case. Fine, but Sep 10 taught the `1/|b|` version, so the two differ cosmetically.

### Simplifications

- **No marginal-density formula is written down.** Independence is defined by factorization into marginals, but `f_X(x) = ∫f(x,y)dy` never appears explicitly. Add it — it's one line and the definition of independence is opaque without it.
- **Conditional distributions are absent**, correctly — they're Thursday's. But it means today defines independence without the "knowing `Y` doesn't change `X`" formulation, which is the more intuitive one. `00_bayes` has that treatment if you want it.
- **The i.i.d. connection is only implicit.** The exercise about diagonal `Σ` with equal `μᵢ` and `σᵢ²` *is* the definition of i.i.d., and saying so closes a loop that's been open since Sep 3.
- **Cell 24's AR(1) exercise is a genuine aside** — a continuous-state Markov chain, one week before Markov chains. Nice foreshadowing; don't let it eat time.
- **The Dirichlet is named and never defined.** Fine as a "there is one other thing" remark.

---

## 8. Delivery plan

**Modes:** 🟦 notebook (student copy) · 🟩 instructor cells (pre-written, never live) · ⬛ board · 🟨 HTML widget

| # | Step | Mode | Time | Notes |
|---|---|---|---|---|
| 1 | Random vectors; joint CDF and density | ⬛ board | 4 min | State the mixed partial, say nobody computes one, move on |
| 2 | **Marginals as shadows** | 🟩 instructor cells | 5 min | `seaborn.jointplot` (cell 28) — joint in the centre, marginals on the edges. The picture *is* the definition |
| 3 | **Same marginals, opposite joints** | 🟩 instructor cells | 4 min | Run cell 27 at `ρ = +0.6` and `−0.6`. Identical edges, mirror-image centres. **The argument for the whole topic** |
| 4 | **Independence = factorization** | ⬛ board | 5 min | The definition to carry. Name it as the third version of "independent" (events → samples → variables) |
| 5 | Independence ⟹ `cov = 0` | ⬛ board | 3 min | One line once the density factorizes |
| 6 | **`cov = 0` ⇏ independence** | 🟨 widget | 4 min | `class-02-vectors/vectors.html#viz-zero-cov` — drag the points into a curve and watch covariance stay flat. **The session's one widget**, and a Week 1 callback |
| 7 | The bivariate normal, matrix form | ⬛ board | 6 min | `(z−μ)ᵀΣ⁻¹(z−μ)` as the squared standardized distance. Mahalanobis. Ellipses, not circles |
| 8 | **The exception: `ρ=0` ⟺ independence** | ⬛ board | 4 min | Diagonal `Σ` ⇒ exponent splits ⇒ `exp` of a sum is a product. **Give this with step 6, not apart from it** |
| 9 | `Σ` diagonal + equal parameters = i.i.d. | ⬛ board | 2 min | Closes a loop open since Sep 3 |
| 10 | **`E[Y\|X=x]` is a straight line** | ⬛ board | 5 min | §3. Thursday's session and Nov 5's regression, both previewed. Not in the source |
| 11 | How little else exists | 🟦 notebook | 2 min | MVN, Dirichlet, then copulas and GMMs. Explains a pattern they'll notice anyway |

**Build cost: seeding and parameterizing cells 27–30 (~20 min).** The plotting code exists; it needs a seed and a `ρ` loop.

**Steps 6 and 8 must be adjacent.** The counterexample and the exception delivered together is the only way both survive; separated, students keep exactly one.

**Cut first:** step 11, then step 9. **Do not cut** steps 3, 6+8, or 10.

---

## 9. Look ahead

- **Thursday is conditional distributions**, and today's `f(x,y)` is what gets divided: `f(y|x) = f(x,y)/f_X(x)`. Today builds the numerator and the denominator.
- **Step 10 is Thursday's punchline delivered early.** Under joint normality `E[Y|X]` is a line; Thursday's LCLS estimator exists for when that assumption fails. Framing it that way makes the nonparametric machinery feel motivated instead of arbitrary.
- **Nov 5's linear regression is step 10 again**, with coefficients estimated instead of known. The reason the linear model is the default is on the board today.
- **Homoskedasticity** — `V[Y|X=x]` independent of `x` — is an assumption Nov 5 makes and today derives for the normal case.
- **Oct 20's Markov chains** are about dependence *through time*, and cell 24's AR(1) is a one-week-early example.
- **Oct 27's likelihood** multiplies densities across observations, which is legitimate *only* because of the factorization defined today. The i.i.d. assumption is what turns a joint density into a product, and that product is the likelihood.
- **Σ singularity** returns as the rank condition on the design matrix in Nov 5.

## 10. Looking back

- **Sep 3 is the direct ancestor.** Covariance as a centered dot product, the `y = x²` zero-covariance counterexample, and the inner product that `(z−μ)ᵀΣ⁻¹(z−μ)` generalizes. Today is that session's population version.
- **Sep 1 defined independence for events.** Today does random variables. Say it's the same idea at a higher level.
- **Sep 3's i.i.d.** finally gets a formal definition (step 9).
- **Sep 10's `f = F′`** becomes the mixed partial.
- **Oct 1's CLT** explains why the normal shows up in sampling distributions; today explains why it shows up in *models*. Different reasons, worth separating.

---

## 11. Source map

- `sp26/01_probability/02_moments_and_likelihood.ipynb` §2 — cells 19–33. Random vectors (20), **joint distribution and density (21)**, **independence (22)**, covariance exercise (23), AR(1) aside (24), **bivariate normal (25–26)**, **working plot code (27–30)**, multivariate normal + Mahalanobis (31), **the `ρ=0` exercises (32)**, non-trivial multivariate distributions (33).
- §1 of the same notebook (cells 3–17) is **recap** of expectation, variance, indicators, ECDF→CDF and KDE→PDF — all already covered Sep 3 through Sep 15. Useful as review before the post-midterm restart; note the two bugs in §7.
- `sp26/04_conditioning_and_bayes/00_bayes.ipynb` — "The Joint Density/Mass Function" and "Marginal Distributions" ×2. A gentler treatment than 02_moments, and the natural pre-class video.
- `labs/class-02-vectors/vectors.html` — `viz-zero-cov` and `viz-covariance`, both directly reusable.
- **No `uu_fa26` material exists for this session.** Everything here is `sp26` and needs porting.

## 12. Open questions

- **Which notebook is the video?** `00_bayes`'s joint/marginal cells are gentler and better paced for a pre-class video; `02_moments` §2 is denser and better for class. My recommendation: `00_bayes` for the video, `02_moments` §2 for the lecture — but `00_bayes` then gets split across today, Thursday, and (if it happens) Dec 3's Bayesian session.
- **Is there a quiz the first session back from the midterm?** Tuesday is the quiz slot, and the midterm was five days earlier.
- **Does a lab or activity get built for this week?** Nothing is listed for either day. The `jointplot` code is the obvious basis — give students a `ρ` slider and the marginals-don't-determine-the-joint demonstration.
- **Seed cells 27–30** before they're used in class.
- **How much of §1 gets re-taught?** It's a full recap of a month of material, arriving right after the midterm. Skimming it is a reasonable use of the first ten minutes back; teaching it again is not.
