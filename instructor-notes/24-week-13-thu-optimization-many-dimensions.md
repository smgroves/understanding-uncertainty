# Week 13, Thursday (Nov 19) — Optimization in Many Dimensions

- **Syllabus topic (tentative):** *"In many dimensions"* · week theme *"Optimization"*
- **Day type:** Lab / Coding Day
- **Source material:** 🔴 **none.** Third of four consecutive from-scratch sessions
- **Worked example:** the full logistic model on `metabric.csv` — four parameters, so the Hessian is a real matrix
- **Everything in §2 is written from scratch.** All numbers computed on that model

> **Two things happen when you go from one dimension to several, and only one of them is bookkeeping.** The bookkeeping: `f′ = 0` becomes `∇f = 0`, and `f″ < 0` becomes "the Hessian is negative definite." The genuinely new thing: **saddle points** — places where you're at a maximum in one direction and a minimum in another. They don't exist in one dimension and they dominate high-dimensional optimization.
>
> **And the session's best result ties the whole block back to inference.** The Hessian at the optimum is the observed information, so `√diag(−H⁻¹)` *is* the standard error. I checked it against `statsmodels` on the metabric fit: **they agree to 1.28e-15.** The matrix that makes the optimizer fast is the same matrix that tells you how precise your estimate is.

---

## 1. What students actually see

| Artifact | File | Status |
|---|---|---|
| Pre-class video | — | 🔴 to write |
| In-class | — | 🔴 to write; §8 is a full plan |
| Instructor cells | — | 🔴 to build; all numbers reproducible from the metabric fit |
| Lab | — | 🔴 none. §8 proposes one — implement Newton, compare to `statsmodels` |
| Board | — | `∇f = 0`, the Hessian, definiteness, saddles, Newton's step |

---

## 2. The content, from scratch

### The conditions, generalized

Tuesday's two conditions carry over with the obvious substitutions.

**First-order necessary condition.** At an interior maximum, *no direction improves*:

```
∇f(θ*) = 0
```

That's `p` equations — every partial derivative vanishes simultaneously. Geometrically it's Nov 12's statement: the steepest-ascent direction has zero length, so there's nowhere to go.

**Second-order.** In one dimension you asked whether the curve bends down. In `p` dimensions it can bend differently in different directions, so you need the whole **Hessian**:

```
H(θ) = [ ∂²f/∂θᵢ∂θⱼ ]      a p × p matrix of second partials
```

It's **symmetric** — mixed partials commute for smooth functions — which is why its eigenvalues are real and the classification below works cleanly.

### Negative definite, and what it actually means

The condition for a maximum is that `H` be **negative definite**:

```
uᵀ H u  <  0     for every direction u ≠ 0
```

Read it as: *whichever way you step, the function curves downward.* `uᵀHu` is the curvature in direction `u`, so the condition says every direction is a peak-like direction.

The practical test is eigenvalues:

```
all eigenvalues of H  <  0     ⟺   negative definite  ⟺   local maximum
all eigenvalues       >  0     ⟺   positive definite  ⟺   local minimum
mixed signs                    ⟺   indefinite         ⟺   SADDLE POINT
```

On the metabric logistic fit (four parameters, standardized features), the eigenvalues at the optimum are

```
[ −311.21, −248.04, −183.37, −117.45 ]
```

All negative. **Negative definite, so this is a maximum** — and since the logistic log-likelihood is concave everywhere, it's *the* maximum.

### Saddle points — the new phenomenon

In one dimension a stationary point was a peak, a trough, or an inflection. In several dimensions there's a genuinely new possibility: **up in one direction and down in another.**

The canonical picture is `f(x,y) = x² − y²` at the origin. Walk along `x` and you're in a valley; walk along `y` and you're on a ridge. The gradient is zero, so `∇f = 0` is satisfied — and it is neither a maximum nor a minimum. A horse's saddle, hence the name.

**Why this matters more than it sounds.** For a stationary point to be a maximum, *all* `p` eigenvalues must be negative. If they were independently random, that's a `2⁻ᵖ` proposition — so in high dimensions, **the overwhelming majority of stationary points are saddles**. Modern optimization worries far more about saddles than about local maxima, because there are exponentially more of them.

And a plain gradient method behaves badly near one: the gradient is small (you're near stationarity), so steps are tiny, and the method crawls for a long time on a surface that isn't even an answer.

### Newton in many dimensions

The update generalizes exactly as you'd guess:

```
θ  ←  θ  −  H⁻¹ ∇f
```

Same idea as Tuesday: fit a quadratic locally using slope *and* curvature, and jump to its peak. In one dimension you divided by `f″`; here you solve a linear system with `H`.

Note nobody actually inverts `H` — you solve `H s = ∇f` for the step `s`. Inverting a matrix to multiply by a vector is slower and less stable, and it's the sort of thing that separates textbook formulas from what libraries do.

On the metabric model: **6 iterations to machine precision**, from a cold start at zero, with no tuning.

### Newton doesn't care about scaling; gradient descent is wrecked by it

This is the demonstration I'd build the session around, because it explains something students were *told* on Nov 12 without being shown why.

The **condition number** of `H` — the ratio of its largest to smallest eigenvalue magnitude — measures how stretched the surface is. A condition number near 1 means roughly spherical contours; a large one means long thin valleys.

Same model, same data, two versions of the features:

| features | condition number of `H` | Newton | gradient ascent |
|---|---|---|---|
| standardized | **2.6** | 6 iterations | converges — 56 iterations at `α = 1e-3` |
| raw | **127,892** | **6 iterations** | **did not converge at any step size tried** |

The gradient row searched eleven step sizes from `1e-1` down to `1e-11`, allowing 300,000 iterations each. On raw features **none of them reached the optimum**: the large ones diverge, the small ones are still crawling.

**Newton takes exactly the same six iterations either way.** It is *affine invariant* — rescaling the features rescales `∇f` and `H` in exactly compensating ways, and the step comes out identical. Gradient ascent has no such property: with a condition number of 128,000 it zig-zags across a long thin valley and creeps along the floor, and no step size tried gets it there at all.

So "standardize your features," which was practical advice on Nov 12, is now a statement about the geometry of the objective — and it's advice that Newton-type methods simply don't need.

### What it costs, and why nobody does this at scale

The Hessian is `p × p`:

- **Building it** is `O(p²)` entries — for logistic regression, `H = −XᵀWX` with `W = diag(pᵢ(1−pᵢ))`, so `O(np²)` work.
- **Solving `Hs = ∇f`** is `O(p³)`.
- **Storing it** is `p²` numbers.

At `p = 4`, trivial. At `p = 10,000`, the Hessian has `10⁸` entries and the solve is `10¹²` operations — per iteration. At the scale of a modern neural network, `p` is in the billions and `p²` numbers cannot exist.

That's the whole reason gradient methods dominate despite being slower per unit of progress: they need `p` numbers per step, not `p²`.

### The middle ground: quasi-Newton

**BFGS** builds an approximation to `H⁻¹` from the sequence of gradients you're computing anyway — successive gradients tell you how the gradient is changing, which is what curvature is. You get most of Newton's convergence at close to gradient cost, with no second derivatives.

Worth naming because `scipy.optimize.minimize` defaults to it, so students will meet the string `BFGS` the first time they optimize anything, and `L-BFGS` (the limited-memory variant) is what fits large problems.

### The Hessian is the information matrix

Here is the result that makes this session more than a computing lecture.

At the maximum of a log-likelihood, `−H` is the **observed Fisher information**, and standard maximum-likelihood theory gives

```
SE(θ̂)  =  √ diag( (−H)⁻¹ )
```

I checked this on the raw-feature metabric fit:

```
√diag(−H⁻¹)          = [0.324590, 0.004923, 0.005243, 0.022380]
statsmodels .bse     = [0.324590, 0.004923, 0.005243, 0.022380]
max difference        = 1.28e-15
```

**The same matrix that makes Newton fast is the one that produces the standard errors in every regression table students have ever seen.**

The intuition is worth stating: **sharp curvature means a well-determined parameter.** If the log-likelihood drops off steeply as you move away from `θ̂`, nearby values explain the data much worse, so you know `θ̂` precisely — large `|H|`, small standard error. A flat likelihood means many values fit almost equally well — small `|H|`, large standard error.

This also closes a thread from Sep 29. That session said some statistics have a standard-error formula and most don't, and the bootstrap was the general answer. **This is the other general answer**: any MLE has an asymptotic standard error, and it falls out of the second derivative you computed to fit the thing.

---

### Reading

*Key in `README.md`. This session has no assigned text; these are the closest available.*

- **No coverage in the six statistics texts** for the optimization method. Third consecutive session where the course's reading list has nothing.
- **The standard reference** — Boyd & Vandenberghe, *Convex Optimization* (free at `stanford.edu/~boyd/cvxbook/`): **§9.5** for Newton's method in many dimensions, **§9.4** for steepest descent and condition number, **Appendix A** for definiteness. The figures on condition number and zig-zagging are exactly §2's demonstration.
- **For the statistical half** — **AoS Ch. 9** covers Fisher information and the asymptotic normality of the MLE, which is where `SE = √diag(−H⁻¹)` comes from. That's the one part of today with a home in the course's own reading list.
- **Applied companion** — **QE, "Maximum Likelihood Estimation"** (`intro.quantecon.org/mle.html`) implements Newton by hand for an MLE in Python.

---

## 3. The optimization view

- **Objective:** any twice-differentiable `f(θ)`, `θ ∈ ℝᵖ`
- **Argmax:** `∇f(θ*) = 0` with `H(θ*)` negative definite; **global** if `f` is concave everywhere
- **Solved by:** Newton (`θ ← θ − H⁻¹∇f`), quasi-Newton at moderate `p`, gradient methods at large `p`

**This completes the spine.** Every objective since August now has a name for its conditions and a method for finding its argmin, and the whole course's worth of "solved by" entries are instances of one framework:

| Objective | Solved by | Which is really… |
|---|---|---|
| `Σ(xᵢ−c)²` | closed form | `∇f = 0`, solvable |
| MISE over `h` | plug-in rule | an approximation to `∇f = 0` |
| log-likelihood, normal/Bernoulli | set score to zero | `∇f = 0`, solvable |
| SSE | `(XᵀX)⁻¹Xᵀy` | `∇f = 0`, solvable |
| logistic log-likelihood | numerical | `∇f = 0`, **not** solvable |
| anything | Newton / gradient | `∇f = 0`, approached iteratively |

---

## 4. Assumptions that make it work

| Claim | Assumption |
|---|---|
| `∇f(θ*) = 0` at a maximum | Interior optimum, `f` differentiable |
| `H` symmetric | Mixed partials commute — needs `f` twice continuously differentiable |
| Negative definite ⟹ local max | `f` twice differentiable at `θ*` |
| Local max = global max | **Concavity** — `H` negative semi-definite *everywhere*, not just at `θ*` |
| Newton's step is defined | `H` **invertible**. Singular at a saddle-adjacent flat direction, and the step blows up |
| Newton converges | Started close enough; damping needed otherwise |
| `SE = √diag(−H⁻¹)` | The **asymptotic** MLE theory: large `n`, correct model, interior optimum |
| The reported SE is trustworthy | Same, plus `n` actually large. Bootstrap instead if it isn't |

**Row 4 is the load-bearing one all block.** For the logistic model `H = −XᵀWX` with positive weights, which is negative semi-definite for every `θ` — that's why concavity holds and why six Newton iterations is the whole story. Nothing this semester has needed a restart.

---

## 5. Concrete failure cases

**Saddle points.** `∇f = 0` and mixed eigenvalue signs. In high dimensions these vastly outnumber genuine optima, and gradient methods stall near them because the gradient is small. Newton is worse in one respect — it converges *to* stationary points of any type, so it can find a saddle and stop.

**Ill-conditioning wrecks gradient methods.** Verified above: condition number 127,892 versus 2.6. On the standardized version gradient ascent converges in 56 iterations; on the raw version **no step size across eleven orders of magnitude reaches the optimum in 300,000 iterations**. Newton takes 6 either way.

**Singular or near-singular Hessian.** If `XᵀX` is rank-deficient — perfectly collinear features, the dummy trap from Nov 5 and Nov 10 — `H` isn't invertible and the Newton step is undefined. Near-singular is worse: the step is enormous and the standard errors explode. **That's the same failure surfacing as an optimization problem, an inference problem, and a modelling problem simultaneously**, which is worth pointing out.

**Newton diverging from a cold start.** Far from the optimum the local quadratic can be a poor fit. Damped Newton — take `α·(−H⁻¹∇f)` with `α ≤ 1`, backtracking if the objective got worse — is what real implementations do.

**Trusting `√diag(−H⁻¹)` on small samples.** It's an asymptotic result. With small `n` or a badly specified model it can be wildly optimistic, and the bootstrap from September is the honest alternative.

**Confusing `H⁻¹`'s diagonal with independent uncertainties.** The off-diagonal entries are covariances between coefficient estimates. Two correlated features give two coefficients that trade off against each other, and looking only at the diagonal hides that.

---

## 6. Five questions students will ask

**Q1. "What does 'negative definite' actually mean?"** That the function curves downward in *every* direction. `uᵀHu` is the curvature along direction `u`, so requiring it to be negative for all `u` says there's no direction you could step that curves upward — which is what being at a peak means when you have more than one way to move. The practical test is the eigenvalues: they're the curvatures along the special directions where the surface bends purely, and if all of them are negative then every other direction is a mixture of downward-bending ones and is downward-bending too.

**Q2. "What's a saddle point and why should I care?"** It's a stationary point that's a maximum in some directions and a minimum in others — `x² − y²` at the origin, shaped like a horse's saddle. You should care because in high dimensions they're almost everywhere. A stationary point is a maximum only if *all* `p` eigenvalues are negative, and the more parameters you have the less likely that is to happen by accident, so the vast majority of points where the gradient vanishes are saddles. That's why modern optimization research worries about escaping saddles rather than about local optima, and why "the gradient is zero" is a much weaker piece of news than it sounds.

**Q3. "Why does standardizing features matter so much?"** Because it changes the *shape* of the objective, and gradient descent is sensitive to shape. With raw features on wildly different scales, the surface is a long thin valley — condition number 127,892 on our data — and a gradient step that's sensible along the narrow direction is far too small along the long one, so you zig-zag. Standardizing made the condition number 2.6 and the same optimizer converged. The striking part is that **Newton took six iterations either way**: it rescales itself automatically, because rescaling the features changes `∇f` and `H` in exactly offsetting ways. So the advice is really advice about gradient methods specifically.

**Q4. "If Newton is so much better, why is everything trained with gradient descent?"** Size. Newton needs the Hessian, which is `p × p` — you have to compute `p²` entries and solve a `p³` linear system every iteration. At four parameters that's nothing. At ten thousand it's a hundred million entries per step. At a billion parameters, `p²` numbers cannot be stored on any hardware that exists. Gradient methods need `p` numbers. The compromise is quasi-Newton — BFGS builds an approximation to `H⁻¹` out of the gradients you're computing anyway — which is what `scipy.optimize.minimize` uses by default, and its limited-memory version `L-BFGS` is what handles large problems.

**Q5. "Where do the standard errors in a regression table come from?"** From this Hessian. At the optimum, `−H` is the observed Fisher information, and the standard errors are `√diag((−H)⁻¹)`. I checked it against `statsmodels` on our model and they match to fifteen decimal places — the software is doing exactly this. The intuition is that curvature *is* precision: if the log-likelihood falls off steeply around `θ̂`, then nearby parameter values explain the data much worse and you've pinned the parameter down; if it's flat, many values fit about as well and you haven't. It's also the second general answer to a question from September — the bootstrap works for any statistic, and this works for any MLE.

---

## 7. What has to be built

No source material, so this replaces the usual bug audit.

- [ ] **A saddle-point surface** — `f(x,y) = x² − y²`, drawn as a 3-D surface *and* a contour plot with the gradient zero at the origin. Static images are fine; the contour plot is the one that makes it click.
- [ ] **The eigenvalue classification demo** — three small `2 × 2` Hessians (negative definite, positive definite, indefinite), their eigenvalues, and the corresponding contour pictures side by side.
- [ ] **The condition-number table** — §2's four-cell result. This is the session's centrepiece: same model, same data, one preprocessing choice, and gradient descent goes from converging to missing by 43.
- [ ] **Newton implemented in ten lines**, converging on metabric in 6 iterations, with the eigenvalues printed at the optimum.
- [ ] **The standard-error check** — `√diag(−H⁻¹)` against `statsmodels.bse`, agreeing to `1.28e-15`. Short, and it reframes the whole block.

**Reusable:** the metabric logistic model from Nov 10 — four parameters, so the Hessian is a real matrix rather than a scalar, and it's the same model used on Nov 12 and Nov 17.

**Deliberately out of scope:** trust regions, conjugate gradient, the details of BFGS's update. Name BFGS and L-BFGS in a sentence each.

---

## 8. Delivery plan

**Modes:** 🟦 notebook (student copy) · 🟩 instructor cells (pre-written, never live) · ⬛ board · 🟨 HTML widget

| # | Step | Mode | Time | Notes |
|---|---|---|---|---|
| 1 | `f′ = 0` → `∇f = 0` | ⬛ board | 3 min | `p` equations. Nov 12's "no improving direction" |
| 2 | **The Hessian** | ⬛ board | 4 min | Matrix of second partials, symmetric. Curvature now has directions |
| 3 | **Negative definite = curves down every way** | ⬛ board | 5 min | `uᵀHu < 0`. Then the eigenvalue test as the practical version |
| 4 | **Saddle points** | 🟩 instructor cells | 6 min | `x² − y²`, surface and contours. **The genuinely new thing** — and why they dominate in high dimensions |
| 5 | Classify by eigenvalue signs | 🟩 instructor cells | 4 min | Three 2×2 examples with pictures |
| 6 | Newton: `θ ← θ − H⁻¹∇f` | ⬛ board | 4 min | Same as Tuesday, with a solve instead of a division. **Solve, don't invert** |
| 7 | **Run it — 6 iterations** | 🟩 instructor cells | 5 min | Metabric, cold start, no tuning. Print the eigenvalues: all negative |
| 8 | **The condition-number table** | 🟩 instructor cells | 7 min | **The session's centrepiece.** Newton 6 iterations either way; gradient converges in 56 or **not at all** |
| 9 | Why not Newton at scale | ⬛ board | 4 min | `p²` to build, `p³` to solve. Then BFGS and L-BFGS in a sentence each |
| 10 | **The Hessian *is* the information matrix** | 🟩 instructor cells | 6 min | `√diag(−H⁻¹)` vs `statsmodels.bse`, agreeing to `1e-15`. **Curvature is precision** |
| 11 | **Lab** | 🟦 notebook | rest | See below |

**Build cost: the whole session (~2 hours).** Everything runs on the Nov 10 model.

**Steps 8 and 10 are the two to protect.** Step 8 turns Nov 12's "standardize your features" from advice into geometry. Step 10 is the only place the optimization block connects back to statistics, and without it these three sessions read as a computing detour.

### The lab

1. Implement Newton for logistic regression — about ten lines, given `∇ℓ = Xᵀ(y − p)` and `H = −XᵀWX`.
2. Confirm it converges in a handful of iterations and matches `statsmodels`' coefficients.
3. Compute `√diag(−H⁻¹)` and match `statsmodels`' standard errors.
4. Re-run on unstandardized features. **Newton is unaffected — still 6 iterations.** Then try gradient ascent on both: 56 iterations on one, and no step size that works on the other.
5. Print the Hessian's eigenvalues and confirm negative definiteness.

Step 3 is the one worth building around: having computed the standard errors from the optimizer's own matrix, students understand what a regression table is.

---

## 9. Look ahead

- **Nov 24 drops "unconstrained."** Today's conditions all assume the optimum is interior; Lagrange multipliers handle the case where it isn't, and Tuesday's boundary discussion was the preview.
- **Regularization** adds a penalty that changes `H` — a ridge penalty adds `λI`, which *improves* the condition number and fixes the near-singular case from §5. That's a satisfying connection: the same fix cures the optimization problem and the inference problem.
- **Concavity is about to matter more**, because constrained problems need it for the KKT conditions to be sufficient.
- **The information matrix** links back to Oct 29's MLE inference and forward to any Bayesian session, where curvature at the posterior mode gives the Laplace approximation.
- **Dec 1's dynamic programming** optimizes by value iteration — a different mechanism entirely, worth flagging so students don't think all optimization is derivative-based.

## 10. Looking back

- **Tuesday is the direct parent** — every condition today is its one-dimensional version with a matrix in place of a number.
- **Nov 12's "standardize your features"** is explained today by the condition number, and step 8 is the payoff.
- **Nov 12's step-size problem** is finally resolved: Newton eliminates the step size by computing the curvature that the step size was implicitly approximating.
- **Nov 10's `H = −XᵀWX`** is where today's matrix comes from, and its negative semi-definiteness is why the model is concave.
- **Nov 5's `XᵀX` singularity** is §5's non-invertible Hessian — the dummy trap, now visible as an optimization failure.
- **Sep 29's standard errors** get their second general derivation. Bootstrap for any statistic; `−H⁻¹` for any MLE.
- **Sep 3's inner product** is `uᵀHu` — a quadratic form, which is the inner product with a matrix in the middle. Same object as Oct 13's Mahalanobis distance.

---

## 11. Source map

- 🔴 **Nothing exists.** No notebook in either repo, no HTML lecture, no lab.
- `data/metabric.csv` — the worked example throughout. Four parameters; at the optimum on standardized features the Hessian eigenvalues are `[−311.21, −248.04, −183.37, −117.45]`, condition number 2.6; on raw features, condition number 127,892.
- `sp26/02_modeling_simulation_inference/01_models_and_regression.ipynb` §2 — Nov 10, source of the model, the gradient, and the Hessian.
- **Boyd & Vandenberghe §9.4–9.5** — the textbook treatment, free online.
- **AoS Ch. 9** — Fisher information and asymptotic MLE normality, the statistical half of §2.

## 12. Open questions

- 🔴 **Everything in §7 needs building.** Third of four; the block is now about six hours of build with one session to go.
- **Is the Fisher-information connection in scope?** I'd argue strongly yes — it's the only thing making these three sessions feel like statistics rather than numerical methods, and the `1e-15` agreement with `statsmodels` is a memorable demonstration. But it needs Oct 29's MLE material to be solid.
- **How much linear algebra can be assumed?** Eigenvalues appear in Sep 3's reading (B&H Appendix A.3) but were never taught. §2 uses them only as "the curvatures along special directions," which may be enough — but if not, the definiteness test needs a different framing.
- **Does the lab happen here or does Nov 24 need it?** Nov 24 is a single session before Thanksgiving with a whole new topic; this lab may be the last practical one of the block.
- **Should saddle points get more than one demonstration?** They're the conceptually new thing and the reason high-dimensional optimization is hard, but nothing in this course's models has one. There's a risk of spending time on a phenomenon students won't meet until their ML course — which is an argument for naming it clearly and moving on.
