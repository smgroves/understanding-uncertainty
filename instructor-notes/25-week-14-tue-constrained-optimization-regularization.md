# Week 14, Tuesday (Nov 24) — Constrained Optimization and Regularization

- **Syllabus topic (tentative):** Constrained optimization / Regularization · **Nov 26 is Thanksgiving — no class**
- **Day type:** Quiz / Math Day · single-session week
- **Source material:** 🔴 **none.** Last of four consecutive from-scratch sessions
- **Worked example:** Ames house prices — `data/ames_prices.csv`, present
- **Everything in §2 is written from scratch.** All numbers computed on that data

> **This session pays off three earlier ones at once.** Oct 29's optional MAP step becomes the *explanation* for regularization. Nov 5's `XᵀX` singularity — the dummy-variable trap that also broke Nov 10's script and Nov 19's Hessian — gets its fix. And Nov 19's condition number is the measure of how well the fix works.
>
> The verified version: on Ames with a deliberately duplicated column, OLS raises `LinAlgError: Singular matrix` and the condition number is `1.6 × 10¹⁶`. Add a ridge penalty of `λ = 100` and it drops to **62.7**. Same data, same model, one added term.

---

## 1. What students actually see

| Artifact | File | Status |
|---|---|---|
| Quiz | — | On Week 13: FONC/SOSC, Hessians, Newton |
| Pre-class video | — | 🔴 to write |
| In-class | — | 🔴 to write; §8 is a full plan |
| Instructor cells | — | 🔴 to build; all numbers reproducible from Ames |
| Lab | — | 🔴 none, and no Thursday to put one on |
| Board | — | Tangency, the Lagrangian, the two equivalent forms, ridge vs lasso |

**Single session before the break**, so there's no Thursday to spill into. §8 is built to fit one class.

---

## 2. The content, from scratch

### The problem changes

Every optimization so far has been unconstrained — `θ` could be anything. Now:

```
maximize   f(θ)      subject to   g(θ) = 0
```

**And the first-order condition breaks immediately.** At a constrained optimum, `∇f` need *not* be zero. You may still be walking uphill; you've simply run out of allowed room. Nov 17's boundary case — `p̂ = 0` from zero successes — was exactly this, met early and without a name.

So the question becomes: what *is* true at a constrained optimum?

### Tangency, and the Lagrangian

Picture the level curves of `f` and the curve `g(θ) = 0` you're confined to. Walk along the constraint. As long as you're *crossing* level curves of `f`, you're still improving — so at the best point you must be moving *along* a level curve of `f` rather than across it.

That means **the constraint curve is tangent to a level curve of `f`** at the optimum. And since gradients are perpendicular to level sets (Nov 12), tangency says the two gradients point along the same line:

```
∇f(θ*) = λ ∇g(θ*)        for some scalar λ
```

That's the **Lagrange condition**. Package it by defining

```
ℒ(θ, λ) = f(θ) − λ·g(θ)
```

and setting `∇_θ ℒ = 0` and `∂ℒ/∂λ = 0` — the first gives the tangency condition, the second gives back the constraint. **A constrained problem in `p` variables becomes an unconstrained problem in `p + 1`**, which is the trick: you already know how to solve those.

### What `λ` means

`λ` is not bookkeeping. If you relax the constraint from `g(θ) = 0` to `g(θ) = c`, then

```
df*/dc = λ
```

**`λ` is the rate at which the optimum improves as the constraint loosens** — the *shadow price* of the constraint. If the constraint is a budget, `λ` is what one more dollar is worth. If it's a data-analysis penalty, `λ` measures how much fit you're giving up per unit of whatever the penalty buys.

Worth saying because it makes the multiplier a quantity with meaning rather than an algebraic device.

### Inequality constraints, briefly

Real constraints are usually `g(θ) ≤ c`. Two cases:

- **The constraint doesn't bind** — the unconstrained optimum already satisfies it. Then `λ = 0` and you ignore the constraint.
- **The constraint binds** — the optimum sits on the boundary. Then it behaves like an equality and `λ > 0`.

Exactly one of `λ` and the slack is zero — **complementary slackness** — and together with the Lagrange condition these are the **KKT conditions**. Name them and move on; the machinery isn't needed today, but the phrase will recur in any optimization course.

### Regularization is a constrained problem

Now the payoff, and it's the reason this session pairs the two topics.

Nov 5 minimized `Σ(yᵢ − xᵢ·β)²` freely. Suppose instead you don't trust large coefficients — because the features are collinear, or `p` is large relative to `n`, or you want a model that generalizes. Constrain them:

```
minimize  Σ(yᵢ − xᵢ·β)²      subject to   Σβₖ² ≤ c
```

Form the Lagrangian and you get an equivalent unconstrained problem:

```
minimize  Σ(yᵢ − xᵢ·β)²  +  λ Σβₖ²
```

**These two are the same problem.** Every `c` corresponds to some `λ` and vice versa — the constrained "budget" view and the penalized "cost" view are one thing seen twice. That equivalence is the single most useful idea in the session, because the penalized form is what software implements and the constrained form is what makes it interpretable.

This is **ridge regression**, and unusually it keeps a closed form:

```
β̂_ridge = (XᵀX + λI)⁻¹ Xᵀy
```

### Ridge repairs the failure from three earlier sessions

Look at what `+λI` does to the matrix that Nov 5 needed to invert.

On the Ames data with `area` deliberately included twice:

| | condition number of `XᵀX + λI` |
|---|---|
| `λ = 0` | **1.6 × 10¹⁶** — and `np.linalg.solve` raises `LinAlgError: Singular matrix` |
| `λ = 1e-6` | 6.2 × 10⁹ |
| `λ = 1` | 6,168.6 |
| `λ = 100` | **62.7** |

The eigenvalues of `XᵀX` are `[0, 2619, 2930, 6168]` — that zero is the collinearity. Adding `λI` adds `λ` to every eigenvalue, so **the zero becomes `λ` and the matrix becomes invertible**. Any `λ > 0` works; larger `λ` conditions it better.

**That is the dummy-variable trap from Nov 5, the commented-out `drop_first` from Nov 10, and the singular Hessian from Nov 19 — all the same failure, all fixed by the same term.** Worth saying explicitly; it's the tidiest connection in the back half of the course.

### What the penalty does to the coefficients

On well-posed standardized Ames data:

| `λ` | area | age | `‖β_slopes‖` |
|---|---|---|---|
| 0 | +0.23682 | −0.19362 | 0.3059 |
| 10 | +0.23614 | −0.19312 | 0.3051 |
| 100 | +0.23013 | −0.18879 | 0.2977 |
| 1,000 | +0.18370 | −0.15391 | 0.2397 |
| 10,000 | +0.06133 | −0.05347 | 0.0814 |

Coefficients **shrink smoothly toward zero** as `λ` grows, and never quite reach it. The intercept doesn't move — it isn't penalized (see §5).

**And this is the bias–variance trade-off, deliberately made.** Shrinking introduces bias — you're no longer at the least-squares solution — in exchange for lower variance, since the estimate moves less when the data change. Sep 15's KDE bandwidth and Oct 20's chain order were the same trade with different knobs. `λ` is the third.

### Ridge is MAP with a Gaussian prior

Oct 29 offered an optional fifteen minutes on MAP: maximize `ℓ(θ) + log π(θ)`. **Here is what that was for.**

Put a `Normal(0, τ²)` prior on each coefficient. Then

```
log π(β) = −Σβₖ²/(2τ²) + const
```

so maximizing `ℓ(β) + log π(β)` under normal errors is exactly minimizing

```
Σ(yᵢ − xᵢ·β)²/(2σ²)  +  Σβₖ²/(2τ²)      ⟺      SSE + λΣβₖ²      with  λ = σ²/τ²
```

I checked it on Ames: with `σ̂² = 0.05037` and `τ² = 0.5`, giving `λ = 0.10074`, the ridge closed form and the numerically-maximized MAP agree to **9.85e-09**.

**So `λ` isn't arbitrary — it's the ratio of noise to prior spread.** A tight prior (small `τ²`) means a big penalty. Noisy data (large `σ²`) also means a big penalty, because the data deserve less trust. That's a genuinely satisfying interpretation of a knob that otherwise looks like a fudge factor.

And the same substitution with a **Laplace** prior gives the absolute-value penalty:

```
Laplace prior  ⟹  minimize  SSE + λΣ|βₖ|      —  the LASSO
```

### Why lasso sets coefficients to exactly zero

The two penalties behave qualitatively differently and the reason is geometric.

The constraint region for ridge is `Σβₖ² ≤ c` — a **circle** (sphere). For lasso it's `Σ|βₖ| ≤ c` — a **diamond**, with corners on the axes.

The solution sits where the SSE contours first touch the constraint region. A circle has no corners, so the touch point almost never has a coordinate exactly zero. **A diamond's corners lie exactly on the axes** — and corners are where an expanding contour is most likely to make first contact. A corner *means* some coefficient is exactly zero.

So **lasso performs variable selection and ridge does not.** That's the whole reason both exist, and it's worth drawing rather than asserting: two axes, elliptical contours, a circle and a diamond.

The cost: `|β|` is not differentiable at zero, so Nov 12's gradient methods don't directly apply and lasso needs different algorithms (coordinate descent, or proximal methods). §5 of Nov 12 flagged this.

---

### Reading

*Key in `README.md`. This session has no assigned text; these are the closest available.*

- **Constrained optimization** — Boyd & Vandenberghe, *Convex Optimization* (free at `stanford.edu/~boyd/cvxbook/`): **Ch. 5** for duality and the Lagrangian, **§5.5** for KKT. This is the standard reference and the Lagrangian material is readable.
- **Regularization** — **AoS §13.4** ("Model Selection") touches ridge and lasso briefly; it's the only mention in the six-book list.
- **ROS Ch. 12** (Gelman, Hill & Vehtari) covers regularization from the Bayesian-prior direction, which is §2's MAP framing — the most aligned treatment available.
- **[Map] gap** — regularization is flagged there as *"not covered in depth by any of these"*; **Hastie, Tibshirani & Friedman, *Elements of Statistical Learning* Ch. 3** is the canonical treatment and is also free (`hastie.su.domains/ElemStatLearn/`). §3.4 has the ridge/lasso geometry figure this session needs.
- **Fourth consecutive session with no home in the course's own reading list.**

---

## 3. The optimization view

- **Objective:** `f(θ)` subject to `g(θ) ≤ c` — or equivalently `f(θ) − λg(θ)` unconstrained
- **Argmax:** where `∇f = λ∇g` (tangency), plus complementary slackness for inequalities
- **Solved by:** closed form for ridge; specialized algorithms for lasso; a general solver otherwise

**This is the last box in the spine**, and it completes it in a specific way: every earlier session optimized over all of parameter space. Today the feasible set itself becomes part of the problem, and the multiplier `λ` prices the restriction.

The retrospective worth putting on the board — the same trade-off, five times:

| Session | Knob | Trades |
|---|---|---|
| Sep 15 | KDE bandwidth `h` | smoothness vs. fidelity |
| Sep 22 | replications `T` | compute vs. resolution |
| Oct 20 | chain order `k` | memory vs. data per state |
| Nov 12 | step size `α` | speed vs. stability |
| **Nov 24** | **penalty `λ`** | **bias vs. variance** |

---

## 4. Assumptions that make it work

| Claim | Assumption |
|---|---|
| `∇f = λ∇g` at the optimum | `f`, `g` differentiable; `∇g ≠ 0` there (a constraint qualification) |
| `λ = df*/dc` | Same, plus the optimum varying smoothly with `c` |
| Constrained and penalized forms are equivalent | **Convexity.** For a convex problem every `c` has a matching `λ`; without it the correspondence can fail |
| `(XᵀX + λI)` is invertible | **Any `λ > 0`.** Guaranteed, since it shifts every eigenvalue up by `λ` |
| Ridge = MAP with a Gaussian prior | Normal errors and a normal prior. Verified to `9.85e-09` |
| Lasso gives sparsity | The `L¹` geometry — corners on the axes |
| The penalty is meaningful | **Features are on comparable scales.** See §5 — this one bites in practice |
| Ridge estimates are unbiased | **No.** Deliberately biased; that's the point |

---

## 5. Concrete failure cases

**Penalizing unstandardized features.** The penalty `Σβₖ²` treats all coefficients alike, but a coefficient's size depends on its feature's units — measure area in square feet versus acres and the coefficient changes by a factor of 43,560, so the penalty hits it 10⁹ times harder. **Standardize before penalizing.** This is not optional, and it's the most common practical error.

**Penalizing the intercept.** Shrinking `β₀` toward zero shrinks predictions toward zero rather than toward the mean of `y`, which is almost never wanted. Every sane implementation excludes it; the §2 table shows the intercept fixed at 12.0210 while the slopes shrink.

**Choosing `λ` by looking at the training fit.** Larger `λ` always fits the training data worse — that's what it does. So training error can't select it. Cross-validation can, and it's the standard method; it's also not in this course, which is worth acknowledging rather than papering over.

**Reading a shrunk coefficient as an effect estimate.** Ridge coefficients are deliberately biased toward zero. They're for *prediction*, and interpreting them as unbiased effect estimates — with the standard errors from Nov 19, which assume the MLE — is a category error.

**Assuming lasso picks the "right" variables.** With correlated features it picks one from a group essentially arbitrarily and zeroes the rest. Re-run on a bootstrap resample and you can get a different set. Sparsity is not the same as identification.

**Using gradient descent on lasso.** `|β|` has no derivative at zero — precisely where the solution lives. Nov 12's machinery doesn't apply.

---

## 6. Five questions students will ask

**Q1. "Why does a Lagrange multiplier work? It looks like a trick."** It's tangency written as algebra. Walking along the constraint, you improve as long as you're crossing level curves of the objective; at the best point you must be moving *along* one instead of across it, so the constraint curve and a level curve are tangent there. Gradients are perpendicular to level sets, so tangency means the two gradients point along the same line — `∇f = λ∇g`. The Lagrangian is just a way of packaging that condition plus the constraint into a single unconstrained problem in one extra variable, which you already know how to solve.

**Q2. "What does `λ` actually mean?"** It's the price of the constraint. Formally `df*/dc = λ`: relax the constraint by one unit and the optimum improves by `λ`. In a budget problem it's what an extra dollar buys. In ridge regression it's how much fit you give up per unit of coefficient shrinkage — and under the MAP reading it's `σ²/τ²`, the ratio of noise variance to prior variance. Noisy data or a confident prior both push `λ` up, and both mean the same thing: trust the data less.

**Q3. "Why does lasso zero things out and ridge doesn't?"** Geometry. The set of allowed coefficients is a circle for ridge and a diamond for lasso, and the solution is where the error contours first touch that set. A circle is smooth, so the touch point almost never sits exactly on an axis — every coefficient stays nonzero, just smaller. A diamond has corners, and its corners lie *on* the axes; an expanding contour is disproportionately likely to hit a corner first, and hitting a corner means some coefficient is exactly zero. So sparsity isn't a special feature bolted onto lasso — it's what a pointy constraint region does.

**Q4. "How do I choose `λ`?"** Not from the training data — larger `λ` always fits it worse, so training error would always pick `λ = 0`. The standard answer is cross-validation: hold out part of the data, fit at several `λ` values, and pick the one predicting held-out data best. That's genuinely outside this course, which is worth naming honestly. The MAP reading gives a principled alternative if you have real prior information: `λ = σ²/τ²`, where `τ` says how large you actually believe coefficients could be.

**Q5. "Is regularization just cheating to make the math work?"** It started that way historically — ridge was invented to fix singular `XᵀX` — but it has two proper justifications. **Statistically**, it's a deliberate bias–variance trade: you accept bias in exchange for estimates that move less when the data change, which usually predicts better. **Bayesianly**, it's exactly a prior, and a prior is a statement of belief rather than a hack: `λ = σ²/τ²` says how large you think coefficients plausibly are, relative to how noisy the data are. Both readings say the same thing — with limited data, pulling estimates toward zero is better than trusting the data completely.

---

## 7. What has to be built

No source material, so this replaces the usual bug audit.

- [ ] **The tangency picture** — level curves of `f`, a constraint curve, the tangent point, and both gradients drawn parallel. One figure and the Lagrange condition is obvious.
- [ ] **The singularity demonstration** — `XᵀX` with a duplicated column, `LinAlgError`, the zero eigenvalue, and the condition number collapsing from `1.6e16` to `62.7` as `λ` grows. **The tidiest connection in the back half; build this one.**
- [ ] **The ridge path** — §2's coefficient table, ideally plotted as coefficients against `log λ`.
- [ ] **The ridge-equals-MAP check** — closed form against numerical MAP, agreeing to `9.85e-09`, with `λ = σ²/τ²` printed.
- [ ] **The circle-versus-diamond figure** — two axes, elliptical SSE contours, the two constraint regions, and the touch point. ESL §3.4 has the canonical version if you'd rather show it than rebuild it.

**Reusable:** `ames_prices.csv` from Nov 5, and Oct 29's MAP framing.

**Deliberately out of scope:** cross-validation (not in this course), elastic net, the algorithms lasso actually needs.

---

## 8. Delivery plan

**Modes:** 🟦 notebook (student copy) · 🟩 instructor cells (pre-written, never live) · ⬛ board · 🟨 HTML widget

| # | Step | Mode | Time | Notes |
|---|---|---|---|---|
| 1 | **Quiz** | — | 10 min | Week 13: FONC/SOSC, Hessian, Newton |
| 2 | The constrained problem; why FONC fails | ⬛ board | 4 min | You can still be climbing and out of room. **Nov 17's `p̂ = 0`, now named** |
| 3 | **Tangency → `∇f = λ∇g`** | ⬛ board + 🟩 cell | 6 min | The picture first, the algebra second. Gradients ⊥ level sets is Nov 12 |
| 4 | The Lagrangian, and what `λ` means | ⬛ board | 4 min | `p` variables → `p+1`. `λ = df*/dc`, the shadow price |
| 5 | Inequalities and complementary slackness | ⬛ board | 3 min | Binds or doesn't. Name KKT and move on |
| 6 | **Regularization is a constrained problem** | ⬛ board | 5 min | Budget form ⟺ penalty form. **The session's hinge** |
| 7 | **Ridge fixes the singularity** | 🟩 instructor cells | 6 min | `LinAlgError` → cond `62.7`. **Nov 5, Nov 10, and Nov 19's failure, all cured by one term** |
| 8 | The ridge path | 🟩 instructor cells | 4 min | Coefficients shrinking; intercept unmoved. Name the bias–variance trade |
| 9 | **Ridge = MAP with a Gaussian prior** | 🟩 instructor cells | 6 min | Agrees to `9.85e-09`. **`λ = σ²/τ²`** — the knob has a meaning. Oct 29's optional step, paid off |
| 10 | **Lasso: circle vs diamond** | ⬛ board | 5 min | Draw both. Corners on the axes ⟹ exact zeros ⟹ variable selection |
| 11 | Practical cautions | ⬛ board | 3 min | Standardize; don't penalize the intercept; `λ` can't come from training error |

**Build cost: the whole session (~2 hours).** Steps 7 and 9 are the two with the strongest payoff per line of code.

**Steps 6, 7, and 9 are the ones to protect.** Step 6 is the idea; step 7 is the demonstration that makes it feel necessary rather than optional; step 9 is what makes `λ` meaningful rather than arbitrary.

**Cut first:** step 5, then step 8. **No lab** — there's no Thursday, and step 11 is a better use of the last three minutes.

---

## 9. Look ahead

- **Dec 1's dynamic programming** is optimization of a different kind — over *sequences of decisions* rather than a parameter vector, solved by backward induction rather than derivatives. Worth flagging so the block doesn't end implying all optimization is calculus.
- **If Dec 3 becomes the Bayesian session**, today's MAP result is the bridge: the prior that produced ridge is the same object a full Bayesian treatment would carry through instead of maximizing over.
- **Cross-validation** is the missing piece for choosing `λ`, and it isn't in this course. Students will meet it in ML this semester — worth pointing at explicitly.
- **The bias–variance trade-off** reaches its fifth and most deliberate appearance today. The retrospective table in §3 is a good closing slide for the whole optimization block.
- **Lasso's non-differentiability** is the honest limit of Nov 12's methods, and the reason a further optimization course exists.

## 10. Looking back

- **Nov 17's boundary case** (`p̂ = 0`) was a constrained optimum met without the vocabulary. Step 2 names it.
- **Nov 12's "gradients are perpendicular to level sets"** is what makes the tangency argument work.
- **Nov 5's `XᵀX` singularity**, **Nov 10's commented-out `drop_first`**, and **Nov 19's non-invertible Hessian** are one failure, fixed by step 7.
- **Nov 19's condition number** is how step 7 measures the fix.
- **Oct 29's optional MAP step** is step 9. If it was skipped, budget four extra minutes.
- **Sep 15's bandwidth** and **Oct 20's order** are the same trade-off; §3's table collects all five.

---

## 11. Source map

- 🔴 **Nothing exists.** No notebook in either repo, no HTML lecture, no lab.
- `data/ames_prices.csv` — the worked example. With `area` duplicated, `XᵀX` has eigenvalues `[0, 2619, 2930, 6168]` and `np.linalg.solve` fails; `λ = 100` gives condition number `62.7`. On standardized well-posed features, `‖β_slopes‖` runs `0.3059 → 0.0814` as `λ` goes `0 → 10,000`. Ridge equals MAP to `9.85e-09` at `λ = σ²/τ² = 0.10074`.
- `sp26/02_modeling_simulation_inference/01_models_and_regression.ipynb` cell 6 already name-drops LASSO and ridge as reason 4 for linear regression's popularity — the only mention anywhere in the course material.
- **ESL Ch. 3** (free) — the canonical treatment, including the circle-vs-diamond figure.
- **Boyd & Vandenberghe Ch. 5** (free) — Lagrangian duality and KKT.

## 12. Open questions

- 🔴 **Everything in §7 needs building** — and this completes roughly eight hours of build across the four-session block (Nov 12, 17, 19, 24).
- **Does the course want lasso at all, or just ridge?** Ridge alone gives the singularity fix, the MAP connection, and the bias–variance trade in a closed form. Lasso adds sparsity and needs a non-differentiable objective and algorithms this course hasn't built. **If time is short, ridge is the one that earns its place.**
- **Is cross-validation mentioned?** It's the honest answer to "how do I choose `λ`," it isn't in this course, and students are meeting it concurrently in ML. One sentence pointing there seems right.
- **No lab and no Thursday.** This is the only single-session week of the semester. If anything from the optimization block needs practical time, Nov 19's lab is the last chance.
- **Is this the right place to close the optimization spine?** §3's five-row table is a natural end-of-block summary, and after Thanksgiving the course changes topic entirely.
