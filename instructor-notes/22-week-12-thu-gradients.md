# Week 12, Thursday (Nov 12) — Gradients

- **Syllabus topic (tentative):** Gradients · week theme *"Regression"*, but this is the pivot into optimization
- **Day type:** Lab / Coding Day
- **Source material:** 🔴 **none.** Nothing in `uu_fa26`, nothing in `uu_sp26`, no HTML lecture. `sp26/00_math_review.ipynb` covers functions and vector spaces but has no calculus of several variables
- **Data:** `metabric.csv` ✅ — Tuesday's fitted model is this session's worked example
- **Everything in §2 is written from scratch.** The numbers in §2 and §8 were computed on the metabric logistic fit

> **Tuesday created the need; today answers it.** Logistic regression has no closed form — the score `Xᵀ(y − p̂) = 0` has the right shape and won't solve — so fitting a model *is* running an optimization. Today is about the object that tells an optimizer which way to go.
>
> **The gradient is already in their hands.** `Xᵀ(y − p̂)` — Tuesday's score — *is* the gradient of the logistic log-likelihood. Nothing new has to be derived to start; the session's first move is recognizing that a thing they already wrote down is the thing they now need.

---

## 1. What students actually see

| Artifact | File | Status |
|---|---|---|
| Pre-class video | — | 🔴 to write |
| In-class | — | 🔴 to write; §8 is a full plan |
| Instructor cells | — | 🔴 to build; every number in §2 is reproducible from the metabric fit |
| Lab | — | 🔴 none. §8 proposes one |
| Board | — | Slope → gradient → steepest ascent → the update rule |

**This is the first of four consecutive sessions with no source material** (Nov 12, 17, 19, 24). The good news is that this one has a natural spine — the model students fitted on Tuesday — so it doesn't need invented examples.

---

## 2. The content, from scratch

### One dimension: the slope tells you which way to move

Start where the intuition is free. For a function of one variable, `f′(θ)` is the slope at `θ`. Two facts, and they're the whole idea:

- **The sign says which way is uphill.** `f′(θ) > 0` means increasing `θ` increases `f`.
- **The magnitude says how steep.** Big slope, big payoff for moving.

So to climb a hill blindfolded: check the slope, take a step in that direction, repeat.

```
θ ← θ + α·f′(θ)
```

`α` is the **step size** (or *learning rate*). That single line is gradient ascent, and everything that follows is generalization and caution.

Worth flagging for the cohort: the students met "set the derivative to zero" on Oct 29 as a way to *solve* for the top. This is the other use of the same object — not solving, but *navigating*. When you can't solve, you can still walk uphill.

### Many dimensions: the gradient

A model has many parameters, so `ℓ(β)` is a surface over `β ∈ ℝᵖ`, and "the slope" isn't one number. Take the partial derivative with respect to each coordinate — how does `ℓ` change if I nudge `β₁` and hold the rest fixed — and stack them:

```
∇ℓ(β) = [ ∂ℓ/∂β₁ , ∂ℓ/∂β₂ , … , ∂ℓ/∂β_p ]ᵀ
```

**The gradient is a vector.** That matters: it has a direction and a magnitude, and both mean something.

### Why the gradient points the steepest way up — and it's Sep 3's inner product

This is the one derivation worth doing properly, because it explains *why* the update rule uses the gradient rather than any other direction, and because the argument is one students already own.

Take a unit direction `u` and ask how fast `ℓ` changes if you move that way. The **directional derivative** is

```
D_u ℓ = ∇ℓ · u
```

An inner product — Sep 3's object. And by Cauchy–Schwarz,

```
∇ℓ · u  ≤  ‖∇ℓ‖ ‖u‖ = ‖∇ℓ‖         with equality exactly when u ∝ ∇ℓ
```

**So among all directions you could step, the gradient is the one with the largest immediate increase**, and the fastest decrease is `−∇ℓ`. That's not a definition or a convention — it falls out of the inner product, which is why the same session that introduced `x·y` in August has been quietly setting this up.

Two consequences worth stating:

- **`‖∇ℓ‖` measures steepness.** At a maximum the gradient is the zero vector: no direction improves anything. That's Oct 29's "set the score to zero," now with a geometric reading.
- **The gradient is perpendicular to the level sets.** Moving along a contour doesn't change `ℓ`, so the directional derivative is zero there, so the gradient is orthogonal to it. Useful for drawing.

### Gradient ascent, and the thing they already have

```
β ← β + α ∇ℓ(β)
```

For maximizing a log-likelihood you ascend; for minimizing a loss you descend, `β ← β − α∇L(β)`. **Same algorithm, opposite sign** — worth saying once, since students will meet the descent form everywhere and this course is maximizing.

And now the payoff. For logistic regression Tuesday derived

```
∇ℓ(β) = Xᵀ(y − p̂)
```

**They already have the gradient.** It's the score, and Tuesday's session ended by observing it can't be set to zero and solved. Today that same expression becomes the thing you *evaluate at your current guess* to decide where to step next. Nothing new is required to start optimizing.

I checked it against finite differences on the metabric fit: analytic and numerical gradients agree to **5.4e-08**.

### The step size is the whole problem

`α` looks like a detail and it decides whether the algorithm works. On the metabric fit (standardized features, 400 steps), the *same* algorithm on the *same* data:

| step size | log-likelihood after 400 steps |
|---|---|
| 0.02 | **−1891.2** — badly failing to converge |
| 0.01 | **−1344.5** — still far off |
| 0.005 | **−817.3** ✅ |
| 0.001 | **−817.3** ✅ |

*(reference optimum: −817.3157)*

The failure is worth understanding rather than just avoiding. **Too large**, and each step overshoots the peak and lands further up the opposite slope — the iterate oscillates and can grow without bound. **Too small**, and you converge, eventually, from a budget you may not have. There's no universal right answer: it depends on the curvature of the surface, which is exactly what **Nov 19's Hessian** measures.

Practical notes worth giving:
- **Scale your features.** These numbers use standardized columns. With raw features on wildly different scales, a step size that suits one coordinate is disastrous for another — the surface has long thin valleys and gradient descent zig-zags down them.
- **Watch the objective, not the parameters.** Print `ℓ` each iteration. It should increase monotonically for ascent; if it doesn't, `α` is too big.
- **Stop on a criterion, not a fixed count** — when `‖∇ℓ‖` is small, or the objective stops improving.

### Checking a gradient you derived by hand

Finite differences:

```
∂ℓ/∂β_k  ≈  [ ℓ(β + ε e_k) − ℓ(β − ε e_k) ] / (2ε)
```

with `ε ≈ 1e-6`. Slow — `p` function evaluations per gradient — but it needs no calculus and it's the standard way to check an analytic derivative. **Every time you hand-derive a gradient, verify it this way before trusting it.** On metabric it matched to 5.4e-08, and if it hadn't, the bug would be in the algebra.

This also matters pedagogically for a calculus-shy cohort: **a gradient is a thing you can compute numerically without doing any calculus at all.** The derivative is an optimization, not a prerequisite.

### The sum structure, and where this goes next

Log-likelihoods are sums over observations, so gradients are too:

```
∇ℓ(β) = Σᵢ ∇ℓᵢ(β)
```

Every step costs a pass over the whole dataset. If `n` is large, use a random subset each step — that's **stochastic gradient descent**, and it's how essentially every large model is trained. Worth thirty seconds: the students' ML course will present SGD as a technique, and it's this same update with a cheaper estimate of the same gradient.

---

### Reading

*Key in `README.md`. This session has no assigned text; these are the closest available.*

- **No coverage in the six statistics texts.** None of Wasserman, B&H, G&S, C&B, or CASI teaches multivariable calculus or optimization method — all assume it.
- **Applied companion** — **QE, "Maximum Likelihood Estimation"** (`intro.quantecon.org/mle.html`) walks the *"write the log-likelihood, hand it to an optimizer"* workflow in Python, including gradient-based fitting. [Map] recommends it precisely for the no-closed-form case.
- **For the geometry** — Strang, *Linear Algebra and Its Applications*, or his MIT OCW lectures, for directional derivatives and the gradient as a vector. This is the same gap flagged for Sep 3: linear algebra and calculus are assumed everywhere and taught nowhere in the reading list.
- **If you want one accessible reference** for students: Boyd & Vandenberghe's *Convex Optimization* Ch. 9 (free at `stanford.edu/~boyd/cvxbook/`) is the standard treatment of descent methods, though it's pitched above this cohort. Sections 9.2–9.3 are the readable part.

---

## 3. The optimization view

This session *is* the optimization view, so the box turns inward:

- **Objective:** any differentiable `ℓ(β)` — today, the logistic log-likelihood
- **Argmax:** wherever `∇ℓ = 0`, found by walking rather than solving
- **Solved by:** iteration. `β ← β + α∇ℓ(β)`, repeated until the gradient is small

Every box since August has named an argmin and a method. **Today names the method itself**, which is why the schedule puts it here: from Tuesday onward, "solved by" means "run this."

Worth drawing the through-line explicitly, because it's the spine's whole arc:

| Session | Objective | How the argmin was found |
|---|---|---|
| Aug 25 | `Σ(xᵢ − c)²` | closed form, or scan a grid |
| Sep 15 | MISE over `h` | a plug-in formula |
| Oct 29 | log-likelihood | set the score to zero |
| Nov 5 | SSE | `(XᵀX)⁻¹Xᵀy` |
| **Nov 12** | anything differentiable | **walk uphill** |

The last row subsumes the others. That's the point.

---

## 4. Assumptions that make it work

| Claim | Assumption |
|---|---|
| `∇ℓ` exists | `ℓ` is **differentiable**. Fails for absolute-value penalties — which is why lasso needs different machinery |
| The gradient is the steepest direction | Cauchy–Schwarz. Always true, no conditions |
| Ascent converges to *the* maximum | **Concavity.** True for logistic regression and OLS; false in general |
| A small step improves the objective | `α` small enough relative to the curvature. **This is the assumption that actually breaks** |
| `∇ℓ = 0` means a maximum | Only with a second-order check — Nov 19. A stationary point could be a minimum or a saddle |
| Finite differences approximate the gradient | `ε` well chosen: too large and you get truncation error, too small and floating-point cancellation dominates |

**Row 3 is the honest caveat for the whole November block.** Everything students fit this semester happens to be concave, so gradient ascent finds the global optimum and there's nothing to worry about. Neural networks are not concave, and the same algorithm finds *a* local optimum with no guarantee it's the best one. Saying that now stops "gradient descent works" from becoming a belief.

---

## 5. Concrete failure cases

**Step size too large.** The verified table in §2: at `α = 0.02` the objective sits at −1891 against an optimum of −817. The iterate overshoots each time and oscillates. The diagnostic is trivial and nobody does it — **print the objective every iteration.**

**Step size too small.** Converges to the right answer from the wrong budget. At `α = 0.001` in the unscaled version it works; drop another order of magnitude and 400 steps won't get there.

**Unscaled features.** With one column in dollars and another in years, the surface is a long thin valley. Gradient descent bounces between the walls and creeps along the floor. Standardizing is not cosmetic — it's often the difference between converging and not.

**Non-concave objectives.** Multiple local maxima mean the answer depends on where you started. Not today's models, very much the ones after this course.

**Saddle points.** `∇ℓ = 0` doesn't mean maximum. In high dimensions saddles are far more common than local maxima, and a plain gradient method slows to a crawl near them. That's Nov 19's material and the reason second-order information matters.

**Non-differentiable objectives.** `|β|` has no derivative at zero, so lasso can't be fitted by plain gradient descent. Worth one sentence, since Nov 24's regularization will raise it.

**Trusting a hand-derived gradient.** The most common practical bug in this whole area is an algebra error in the gradient. Symptoms: the objective decreases when it should increase, or convergence is bizarre. Finite differences catch it in one line.

---

## 6. Five questions students will ask

**Q1. "Why does the gradient point in the steepest direction — why not some other combination of the partials?"** Because of the inner product. The rate of change in a unit direction `u` is `∇ℓ·u`, and Cauchy–Schwarz says that's largest exactly when `u` points along `∇ℓ`. So it isn't a definition or a convention — the steepest-ascent property *follows* from what a directional derivative is. It's also why the gradient is perpendicular to the level curves: moving along a contour changes nothing, so its inner product with the gradient is zero.

**Q2. "We already learned to set the derivative to zero. Why not just do that?"** Because "set it to zero" is only useful when you can then *solve* for the parameter, and that stopped being possible on Tuesday. The logistic score `Xᵀ(y − p̂) = 0` is a perfectly correct equation with no algebraic solution, since `β` sits inside a nonlinear function. Gradient methods use the same derivative for a different purpose: not to characterize the answer, but to walk toward it. The condition `∇ℓ = 0` is still how you know you've arrived — it's the stopping criterion rather than the method.

**Q3. "How do I choose the step size?"** There's no formula, and the honest answer is that you try a few and watch the objective. Too large and the objective jumps around or gets worse; too small and it improves so slowly you run out of patience. The reason it's fiddly is that the right step depends on the *curvature* of the surface — how fast the gradient itself changes — and the gradient alone doesn't tell you that. Measuring curvature is what the Hessian does, and it's why Newton's method (next week) can take much better steps without tuning. In practice people also use line search or adaptive methods, which are automated versions of "try a few."

**Q4. "Do I have to derive the gradient by hand?"** No, and you shouldn't trust yourself if you do. Finite differences approximate any partial derivative with two function evaluations and no calculus, which is enough to optimize and is the standard way to *check* an analytic gradient. Real software uses automatic differentiation, which computes exact derivatives from the code itself — that's what PyTorch and JAX are doing. Hand-derivation matters when you want to understand the structure, as with `Xᵀ(y − p̂)`, whose form tells you something. For getting an answer, let the machine do it.

**Q5. "Will this always find the best answer?"** For the models in this course, yes — the objectives are concave, so there's one peak and any direction of ascent eventually reaches it. In general, no. A non-concave surface has multiple local maxima, and gradient ascent finds whichever one is uphill from where you started; different initializations give different answers. That's the situation for neural networks, and it's why training them involves random restarts, careful initialization, and a lot of empirical folklore. The algorithm is the same; the guarantee is what's lost.

---

## 7. What has to be built

There is no source material, so this section replaces the usual bug audit.

**Needed for this session:**

- [ ] **A worked one-dimensional example** — a single-parameter log-likelihood, plotted, with the iterates marked as they climb. Oct 29's `ℓ(μ)` grid plot is the natural reuse: same picture, now with a walker on it.
- [ ] **The step-size demonstration** — §2's table. Same data, same algorithm, four step sizes, one of them failing. This is the session's most memorable artifact and it's fifteen lines.
- [ ] **The finite-difference check** — analytic `Xᵀ(y − p̂)` against numerical, agreeing to 5.4e-08.
- [ ] **A contour plot with the gradient drawn on it** — two parameters from the metabric fit, level curves, and arrows perpendicular to them. This is what makes "steepest ascent" and "orthogonal to level sets" visible rather than asserted.
- [ ] **A convergence trace** — objective against iteration, for a good and a bad step size on one axis.

**Reusable from elsewhere:** Tuesday's metabric fit gives the objective, the gradient, and the reference optimum. Nothing new needs sourcing, and the data is present.

**Deliberately out of scope:** momentum, Adam, and adaptive methods. They're what students will actually use, and they're a distraction from the one idea. Name them in a sentence at the end.

---

## 8. Delivery plan

**Modes:** 🟦 notebook (student copy) · 🟩 instructor cells (pre-written, never live) · ⬛ board · 🟨 HTML widget

| # | Step | Mode | Time | Notes |
|---|---|---|---|---|
| 1 | Why we're here | ⬛ board | 3 min | Tuesday's score won't solve. Fitting a model *is* optimizing |
| 2 | **One dimension: slope says which way** | 🟩 instructor cells | 5 min | Reuse Oct 29's `ℓ(μ)` plot, now with iterates walking uphill |
| 3 | The gradient as a vector of partials | ⬛ board | 4 min | Direction *and* magnitude, both meaningful |
| 4 | **Why steepest — Cauchy–Schwarz** | ⬛ board | 6 min | `D_u ℓ = ∇ℓ·u`, maximized when `u ∝ ∇ℓ`. **Sep 3's inner product, doing real work** |
| 5 | Orthogonal to level sets | 🟩 instructor cells | 4 min | Contour plot with gradient arrows. Makes step 4 visible |
| 6 | **The update rule** | ⬛ board | 3 min | `β ← β + α∇ℓ`. Note the sign flip for descent, since they'll meet that form everywhere |
| 7 | **You already have the gradient** | ⬛ board | 3 min | `∇ℓ = Xᵀ(y − p̂)` — Tuesday's score. **Nothing new to derive** |
| 8 | **The step-size table** | 🟩 instructor cells | 7 min | §2's four rows. Same algorithm, same data, one number changed, one of them broken |
| 9 | Scaling, and watching the objective | ⬛ board | 3 min | Standardize; print `ℓ` every iteration; stop on `‖∇ℓ‖` |
| 10 | **Finite-difference check** | 🟩 instructor cells | 5 min | Two evaluations per coordinate, no calculus. **Always verify a hand-derived gradient** |
| 11 | Sums → SGD, and what's next | ⬛ board | 3 min | `∇ℓ = Σᵢ∇ℓᵢ`. One sentence on SGD; then: step size depends on curvature, which is Nov 19 |
| 12 | **Lab** | 🟦 notebook | rest | See below |

**Build cost: the whole session (~2 hours)** — steps 2, 5, 8, 10 are all new. Everything runs on Tuesday's model, so there's no data work.

**Steps 4 and 8 are the two to protect.** Step 4 is the only place the geometry gets explained rather than asserted, and it pays off August. Step 8 is the only place the algorithm visibly fails, which is what makes the step size feel like a real decision.

### The lab

Nothing exists. The natural shape, using Tuesday's model throughout:

1. Implement gradient ascent for logistic regression in ten lines, using `Xᵀ(y − p̂)`.
2. Verify the gradient against finite differences.
3. Sweep the step size; plot objective against iteration for each; identify which converge.
4. Compare the final `β̂` against `statsmodels`. They should agree — *you have just written the fitter.*
5. Re-run on **unstandardized** features and watch it struggle. Then standardize and watch it work.

Step 4 is the one worth building the lab around: having implemented from scratch the thing that a library call does, students understand what the library call is.

---

## 9. Look ahead

- **Nov 17–19 formalize this** — unconstrained optimization in one dimension, then many. The first-order condition `∇ℓ = 0` is today's stopping criterion, stated as a theorem.
- **Nov 19's Hessian is the answer to "how do I choose `α`?"** Curvature is exactly what the gradient doesn't tell you, and it's what makes Newton's method take good steps without tuning.
- **The second-order condition** is what distinguishes a maximum from a saddle — §4 row 5, deferred to Nov 19.
- **Nov 24's regularization** adds a penalty to the objective; a squared penalty keeps everything differentiable, an absolute-value penalty does not (§5), which is why lasso needs different machinery.
- **SGD** is step 11 in one sentence, and it's what the students' ML course means by training.
- **Any DP session** (Dec 1) uses a different kind of iteration — value iteration rather than gradient ascent — but the same idea of converging to a fixed point by repeated improvement.

## 10. Looking back

- **Tuesday created the need** and handed over the gradient. Today is unusable without it.
- **Sep 3's inner product** is step 4, and this is the strongest possible payoff for that session: Cauchy–Schwarz is *why* the update rule looks the way it does.
- **Oct 29's "set the score to zero"** is the same derivative used to characterize rather than navigate. Contrasting the two uses is worth a sentence.
- **Aug 27's grid search** was the first argmin-by-scanning; gradient ascent is the same instinct with a better rule for where to look next.
- **Sep 15's bandwidth** and **Oct 20's chain order** were both tuning parameters chosen by judgment; `α` is a third, and this one has a diagnostic.

---

## 11. Source map

- 🔴 **Nothing exists.** No `uu_fa26` notebook, no `uu_sp26` notebook, no HTML lecture, no lab.
- `sp26/00_understanding_data/00_math_review.ipynb` — has sections on functions, transcendental functions, sequences, and vector spaces, but **no multivariable calculus**. Its §5 (Vector Spaces, the inner product) is the prerequisite for step 4 and is worth pointing students at.
- `sp26/02_modeling_simulation_inference/01_models_and_regression.ipynb` §2 — Tuesday's session, which supplies the objective and the gradient.
- `data/metabric.csv` — 1,343 usable rows; every number in §2 and §8 comes from it.
- **QE's MLE lecture** (`intro.quantecon.org/mle.html`) is the closest thing to a ready-made source for the "hand it to an optimizer" workflow.

## 12. Open questions

- 🔴 **Everything in §7 needs building**, and this is the first of four such sessions. If the November block is going to be ready, this is where the work starts — and it's the cheapest of the four, because the example already exists.
- **Is there a pre-class video for a from-scratch session?** The pattern has been video-then-class all semester; this one has no notebook to record against.
- **How much calculus to assume in the room?** The cohort is shaky, so §8 leads with the picture and the numerical check. But the Cauchy–Schwarz argument in step 4 is worth doing properly — it's short, it's geometric, and it reuses August rather than introducing anything.
- **Does the lab replace or precede Nov 17?** Implementing gradient ascent from scratch is a good lab; it may also be the natural *activity* for Nov 17 if that session needs one.
- **Should momentum/Adam get named?** One sentence, at the end, with the honest framing: they're variations on choosing a better step, and the students' ML course will use them by default.
