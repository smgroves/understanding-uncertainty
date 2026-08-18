# Week 13, Tuesday (Nov 17) — Unconstrained Optimization in One Dimension

- **Syllabus topic (tentative):** Unconstrained optimization in one dimension · week theme *"Optimization"*
- **Day type:** Quiz / Math Day
- **Source material:** 🔴 **none.** Second of four consecutive from-scratch sessions
- **Worked example:** the intercept-only logistic model on `metabric.csv` — one parameter, closed-form answer, so every method can be checked against the truth
- **Everything in §2 is written from scratch.** All numbers were computed on that model

> **Thursday showed you how to walk uphill. Today asks what you're walking toward, and how you know when you've arrived.** Those are the first- and second-order conditions, and they're what turns "run the optimizer until it stops" into a statement you can defend.
>
> It also answers Thursday's open question. The step size was fiddly because the right step depends on **curvature**, and the gradient doesn't measure curvature. The second derivative does — and once you have it, **Newton's method needs no step size at all**. On the worked example it converges in three iterations with the error *squaring* each time: `2.0e-03 → 2.9e-07 → 5.8e-15`.

---

## 1. What students actually see

| Artifact | File | Status |
|---|---|---|
| Quiz | — | On Week 12: logistic regression, AME vs MEM, gradients |
| Pre-class video | — | 🔴 to write |
| In-class | — | 🔴 to write; §8 is a full plan |
| Instructor cells | — | 🔴 to build; all numbers in §2 are reproducible |
| Lab | — | 🔴 none (Tuesday is the math day; Thursday takes the lab) |
| Board | — | FONC, SOSC, the classification of stationary points, Newton |

**One parameter is the point of this session.** Everything here generalizes to many dimensions on Thursday, and doing it in one dimension first means every claim can be drawn on a whiteboard as a curve.

---

## 2. The content, from scratch

### The problem, stated

```
maximize   f(θ)     over θ ∈ ℝ,  with no restrictions on θ
```

**Unconstrained** means exactly that: `θ` may be anything. Nov 24's constrained optimization is what happens when it may not.

Two things to want: a **characterization** of the answer (what's true at the optimum?) and a **method** for finding it. The first half of the session is the characterization, the second the method.

### First-order necessary condition

If `θ*` is an interior maximum and `f` is differentiable there, then

```
f′(θ*) = 0
```

The argument is the one from Thursday: if the slope were nonzero, stepping in the uphill direction would increase `f`, so `θ*` wasn't a maximum. **The FONC is Thursday's "there is no improving direction," written as an equation.**

It is also Oct 29's "set the score to zero" — the same condition, now with a name and a justification rather than a recipe.

**"Necessary" is doing real work in that sentence.** It means every interior maximum satisfies it. It does **not** mean everything satisfying it is a maximum. `f(θ) = −θ³` has `f′(0) = 0` and no maximum there at all.

### Second-order sufficient condition

To rule out the impostors, look at curvature:

```
f′(θ*) = 0  and  f″(θ*) < 0     ⟹   θ* is a local maximum
f′(θ*) = 0  and  f″(θ*) > 0     ⟹   θ* is a local minimum
f′(θ*) = 0  and  f″(θ*) = 0     ⟹   inconclusive — could be any of the three
```

Reading: `f″ < 0` means the slope is *decreasing* as you pass through, so the function is bending downward — a peak. `f″ > 0` bends upward — a trough.

**Necessary vs. sufficient is the vocabulary worth installing properly**, because it recurs everywhere:

- **Necessary** — must hold at any solution. Fails ⟹ not a solution. Holds ⟹ *maybe*.
- **Sufficient** — if it holds, you have a solution. Fails ⟹ *maybe*.

FONC is necessary and not sufficient. FONC + strict SOSC is sufficient and not necessary (a maximum can have `f″ = 0`, e.g. `f(θ) = −θ⁴` at 0).

On the worked example: at the optimum `f″ = −328.8 < 0`. **A maximum, confirmed** — and this is the check Oct 29 never made.

### The three kinds of stationary point

A **stationary point** is any `θ` with `f′(θ) = 0`. In one dimension there are three:

| | `f′` | `f″` | picture |
|---|---|---|---|
| local maximum | 0 | < 0 | peak |
| local minimum | 0 | > 0 | trough |
| inflection / saddle | 0 | 0 | flattens and keeps going |

`f(θ) = −θ³` at `θ = 0` is the third: the slope hits zero, the curve pauses, and then continues downward. **Solving `f′ = 0` and stopping is how you end up reporting one of these as an answer.**

### Boundary solutions — where the whole framework fails

The FONC assumes the optimum is **interior**. If the maximum sits at the edge of the allowed region, the derivative need not vanish there — the function is still climbing when it runs out of room.

Students met this on Oct 29 without a name: observe zero successes in `n` Bernoulli trials, and the MLE is `p̂ = 0`. The likelihood is increasing all the way down to the boundary, `ℓ′` is never zero, and the calculus recipe silently produces nothing.

**Any time a parameter is naturally restricted — a probability in `[0,1]`, a variance `> 0`, a rate `> 0` — the boundary is real and the FONC may not apply.** That's a genuine limitation of "set the derivative to zero," and it's the honest bridge to Nov 24, where constraints become the topic.

### Concavity: what makes local answers global

Everything above is **local**. A stationary point with `f″ < 0` is a peak *in its neighbourhood*; there may be a higher one elsewhere.

The property that removes the worry:

```
f is concave  ⟺  f″(θ) ≤ 0 for all θ
```

**If `f` is concave, any local maximum is the global maximum**, and any stationary point is it. Nothing to check, no restarts, no worrying about where you started.

This is why every model in this course has been safe: the normal log-likelihood, the Bernoulli log-likelihood, the logistic log-likelihood, and OLS's negative SSE are all concave. Say so explicitly, because it is the assumption doing the quiet work, and it is exactly what a neural network lacks.

### Methods, in increasing sophistication

**Grid search.** Evaluate `f` on a grid, take the biggest. Students have done this since Week 1 — it's how the sample mean was found before any calculus. It needs no derivatives, it can't diverge, and it finds the *global* max on the grid. It costs one evaluation per grid point and gets hopeless past two or three dimensions.

**Bisection on the derivative.** If `f′` is continuous and changes sign between `a` and `b`, a root sits between them. Halve the interval, keep the side where the sign flips, repeat. Each step buys one bit of precision, guaranteed. Needs `f′` but not `f″`, and cannot diverge — the trade is that it's slow and needs a bracketing interval.

**Newton's method.** The one that matters:

```
θ ← θ − f′(θ)/f″(θ)
```

Read it as: *fit a parabola to `f` at your current point, using the slope and the curvature, and jump straight to that parabola's peak.* If `f` really were quadratic you'd land exactly on the answer in one step. It isn't, so you iterate — but near the optimum most smooth functions look quadratic, which is why it becomes so fast.

### Newton versus gradient ascent, measured

On the intercept-only logistic model (`n = 1,343`, true `β* = −0.28942`, known in closed form):

**Newton**, from `β = 0`, no tuning:

| iteration | `\|β − β*\|` |
|---|---|
| 1 | 2.003e-03 |
| 2 | 2.871e-07 |
| 3 | 5.829e-15 |
| 4 | 2.220e-16 |

**The error squares each step** — roughly, the number of correct digits doubles. That's **quadratic convergence**, and three iterations is all it takes.

**Gradient ascent**, iterations needed to reach `|β − β*| < 1e-8`:

| step size | iterations |
|---|---|
| 0.01 | **did not converge** (stopped at 2,000,000) |
| 0.001 | 44 |
| 0.0001 | 514 |
| 0.00001 | 5,212 |

Two things to draw from this. **Gradient ascent's performance depends entirely on a number you have to guess**, spanning three orders of magnitude across these rows. And **there's a threshold** — convergence requires roughly

```
α  <  2 / |f″|  =  6.08e-03
```

which is why `α = 0.01` fails. **The bound is stated in terms of the second derivative** — so the quantity that tells you whether your step size is safe is precisely the quantity Newton uses to remove the step size entirely. That's the session's punchline, and it's the honest answer to Thursday's "how do I choose `α`?": *you're implicitly estimating curvature by trial and error; Newton computes it.*

### What Newton costs

It isn't free, and the trade-offs preview Thursday:

- **It needs `f″`.** In one dimension that's one more derivative. In `p` dimensions it's a `p × p` matrix — the Hessian — with `p²` entries to compute and a linear system to solve each step. That's Thursday's topic and the reason nobody runs pure Newton on a large model.
- **It can diverge.** Far from the optimum the local parabola may be a bad fit, and the jump can land somewhere worse. Practical implementations use a *damped* step, `θ ← θ − α·f′/f″` with `α ≤ 1`, backing off when the objective doesn't improve.
- **It finds stationary points, not maxima.** With `f″ > 0` the update walks *toward a minimum*. On a concave objective this can't happen; in general it can.

---

### Reading

*Key in `README.md`. This session has no assigned text; these are the closest available.*

- **No coverage in the six statistics texts.** None of Wasserman, B&H, G&S, C&B, or CASI treats optimization method — all assume it, and all use "set the derivative to zero" without stating the second-order condition.
- **The standard reference** — Boyd & Vandenberghe, *Convex Optimization*, free at `stanford.edu/~boyd/cvxbook/`. **§9.1–9.3** cover descent methods and Newton's method; **Ch. 3** covers convexity. Pitched above this cohort but the right place to send a strong student, and the figures are excellent.
- **Applied companion** — **QE, "Maximum Likelihood Estimation"** (`intro.quantecon.org/mle.html`) implements Newton's method by hand for an MLE, in Python, which is close to exactly this session.
- **Gap worth naming** — this is the second consecutive session with no reading in the course's own list. The optimization block is where the six-book reading list runs out entirely.

---

## 3. The optimization view

Today the box *is* the theory:

- **Objective:** any differentiable `f(θ)`, `θ ∈ ℝ`
- **Argmax:** characterized by `f′(θ*) = 0` (necessary) together with `f″(θ*) < 0` (sufficient); **global** if `f` is concave
- **Solved by:** grid search, bisection on `f′`, or Newton — `θ ← θ − f′/f″`

Every optimization box since August named an objective and an argmin. **This session names the conditions that make "argmin" a well-defined thing to have written**, and retroactively justifies eleven weeks of them.

Worth putting the retrospective on the board — it's the spine, complete:

| Session | Objective | Argmin found by |
|---|---|---|
| Aug 25 | `Σ(xᵢ − c)²` | grid, then closed form |
| Sep 15 | MISE over `h` | plug-in formula |
| Oct 29 | log-likelihood | FONC — *unjustified at the time* |
| Nov 5 | SSE | closed form |
| Nov 12 | any differentiable `f` | walk uphill |
| **Nov 17** | — | **the conditions themselves** |

---

## 4. Assumptions that make it work

| Claim | Assumption |
|---|---|
| `f′(θ*) = 0` at a maximum | `θ*` is **interior** and `f` is differentiable there. Both fail in real cases |
| `f″(θ*) < 0` ⟹ local max | `f` twice differentiable at `θ*` |
| Local max = global max | **Concavity.** The single most important assumption in the block |
| Newton converges | Started close enough, and `f″ ≠ 0` along the way |
| Newton converges *quadratically* | `f″` continuous and nonzero at the optimum |
| Bisection converges | `f′` continuous and a sign change bracketed. Slow but **guaranteed** |
| Grid search finds the max | Only to grid resolution. Immune to everything else |

**Row 3 is the one to say aloud.** Concavity is why nothing has gone wrong all semester, and losing it is what makes optimization a research area rather than a recipe.

---

## 5. Concrete failure cases

**A stationary point that isn't a maximum.** `f(θ) = −θ³` at `θ = 0`: `f′ = 0`, `f″ = 0`, and it's an inflection. Solving `f′ = 0` and reporting the root gives a non-answer. This is exactly what Oct 29's material does by omission — it sets the score to zero and never checks.

**Boundary optima.** `p̂ = 0` from zero successes. The likelihood never has a zero derivative; it's still climbing at the edge. Any parameter with a natural range has this failure mode.

**Newton diverging.** Start far out on a flat stretch where `f″ ≈ 0` and the step `−f′/f″` is enormous. The method leaps somewhere useless. Damping — take a fraction of the Newton step, backtrack if the objective got worse — is the standard fix.

**Newton walking to a minimum.** The update solves `f′ = 0` without caring which kind of stationary point it finds. On a convex region of a non-concave function it converges happily to a trough.

**Gradient ascent above the stability threshold.** Verified: `α = 0.01` against a bound of `6.08e-03` never converges. And the bound depends on `f″`, which you don't have unless you compute it.

**Flat likelihoods.** If `f″ ≈ 0` near the optimum the peak is a plateau — the parameter is barely identified, Newton's step blows up, and the standard error (which is built from `f″`) is enormous. That's not an optimizer problem; it's the data telling you the parameter isn't pinned down.

---

## 6. Five questions students will ask

**Q1. "What's the difference between necessary and sufficient? They sound the same."** Necessary means *every* solution has this property — so if it fails, you definitely don't have a solution, but if it holds you might still not. Sufficient means *anything* with this property is a solution — so if it holds you're done, and if it fails you might still be fine. `f′(θ*) = 0` is necessary for an interior maximum: every peak has zero slope, but so does every trough and every inflection point. Adding `f″(θ*) < 0` makes it sufficient: nothing with zero slope and downward curvature is anything other than a peak. It's the difference between a test that never misses and a test that never falsely accuses.

**Q2. "Why isn't `f′ = 0` enough? We used it all through October."** Because it's satisfied by minima and inflection points too. `f(θ) = −θ³` has zero derivative at the origin and no maximum there. In October it happened to be fine, because every objective in this course is concave — one peak, no troughs, no ambiguity — so the only stationary point was the answer. That was luck arising from the models chosen, not a general fact, and the second-order condition is what turns it from luck into a check. It costs one derivative.

**Q3. "Why does Newton converge so much faster?"** Because it uses more information. Gradient ascent knows the slope and has to be *told* how far to go; Newton also knows the curvature, so it can work out how far to go. Concretely, it fits a parabola through your current point matching the slope and the curvature and jumps to that parabola's peak. Near an optimum, smooth functions look almost exactly quadratic, so the jump is almost exactly right — which is why the error squares each step. On the worked example that's `2e-03 → 3e-07 → 6e-15` in three iterations, against thousands for gradient ascent at a poorly chosen step size.

**Q4. "If Newton is better, why does anyone use gradient descent?"** Cost and scale. In one dimension `f″` is one extra derivative. In `p` dimensions it's a `p × p` matrix, which takes `O(p²)` to build and `O(p³)` to solve with, per iteration — and modern models have `p` in the millions, so the Hessian doesn't fit in memory, let alone invert. Gradient methods need only `p` numbers per step. There's also robustness: Newton can diverge far from the optimum, while a small gradient step reliably improves. So the field uses gradient methods with clever step-size rules — which are, in effect, cheap approximations to the curvature information Newton uses directly.

**Q5. "How do I know I found the global maximum and not just a local one?"** In general you don't, and that's an honest answer rather than a gap in the course. What you can do: check whether the objective is **concave**, in which case any local maximum is global and the question dissolves. Every model you fit this semester is concave — the normal, Bernoulli, and logistic log-likelihoods all are — which is why nobody has had to worry. When concavity fails, the standard practice is to run the optimizer from many random starting points and compare, which is a heuristic rather than a guarantee. That's the situation for neural networks and for mixture models.

---

## 7. What has to be built

No source material, so this replaces the usual bug audit.

- [ ] **A picture of the three stationary points** — a peak, a trough, and `−θ³`'s inflection, with `f′` and `f″` annotated at each. This is the whole first half in one figure.
- [ ] **The Newton-vs-gradient table** — §2's convergence comparison. Runs on the intercept-only metabric model in about twenty lines, and the closed-form answer means every row can be checked against the truth.
- [ ] **A Newton animation, or three static frames** — the parabola fitted at the current point, and the jump to its peak. This is what makes "why so fast?" obvious rather than asserted.
- [ ] **The stability-bound demonstration** — `α = 0.01` failing against `2/|f″| = 6.08e-03`, with the bound printed alongside. Connects Thursday's tuning problem to today's curvature.
- [ ] **A boundary example** — the Bernoulli likelihood with zero successes, plotted, showing it climbing to the edge with no interior stationary point.

**Reusable:** the intercept-only logistic model on `metabric.csv` — one parameter, known answer, real data, and it's Nov 10's model with the covariates dropped.

**Deliberately out of scope:** line search, trust regions, quasi-Newton/BFGS. Name BFGS in one sentence, since `scipy.optimize.minimize` defaults to it and students will see the name.

---

## 8. Delivery plan

**Modes:** 🟦 notebook (student copy) · 🟩 instructor cells (pre-written, never live) · ⬛ board · 🟨 HTML widget

| # | Step | Mode | Time | Notes |
|---|---|---|---|---|
| 1 | **Quiz** | — | 10 min | Week 12: logistic regression, AME vs MEM, gradients |
| 2 | The problem, stated | ⬛ board | 2 min | Maximize, unconstrained. Flag that Nov 24 removes the second word |
| 3 | **FONC, with its argument** | ⬛ board | 4 min | If the slope isn't zero you can still climb. **This is Thursday's statement as an equation** |
| 4 | **Necessary vs sufficient** | ⬛ board | 4 min | Install the vocabulary properly — it recurs for the rest of their education |
| 5 | **The three stationary points** | 🟩 instructor cell | 5 min | Peak, trough, `−θ³`. One figure, `f′` and `f″` labelled |
| 6 | SOSC | ⬛ board | 4 min | `f″ < 0` ⟹ peak. **Then apply it to Oct 29's MLE** — the check never made |
| 7 | Boundary solutions | ⬛ board + 🟩 cell | 5 min | `p̂ = 0` from zero successes, plotted. The framework's honest limit, and the bridge to Nov 24 |
| 8 | **Concavity: local becomes global** | ⬛ board | 4 min | Why nothing has gone wrong all semester. **And what neural networks lack** |
| 9 | Methods: grid, bisection | ⬛ board | 3 min | Grid is Week 1. Bisection is slow and cannot fail — worth having |
| 10 | **Newton: fit a parabola, jump to its peak** | ⬛ board + 🟩 cell | 6 min | The update, then the picture. This is the session's method |
| 11 | **The convergence table** | 🟩 instructor cells | 6 min | §2's two tables side by side. Error squaring vs. three orders of magnitude of tuning |
| 12 | **The stability bound** | ⬛ board | 3 min | `α < 2/\|f″\|`. **The step size was always about curvature** — Thursday's question, answered |
| 13 | What Newton costs | ⬛ board | 3 min | Needs `f″`; in `p` dimensions that's a matrix. Sets up Thursday |

**Build cost: the whole session (~2 hours)**, steps 5, 7, 10, 11 being the artifacts. All run on one model with a known answer.

**Steps 4 and 12 are the ones to protect.** Step 4 because necessary-vs-sufficient is vocabulary they'll use for years and this is the natural place to install it. Step 12 because it closes Thursday's loop and makes the whole block feel like one argument instead of two techniques.

**Cut first:** step 9's bisection, then step 13. **Do not cut** steps 4, 6, 8, or 12.

---

## 9. Look ahead

- **Thursday generalizes all of it.** `f′ = 0` becomes `∇f = 0`; `f″ < 0` becomes "the Hessian is negative definite"; Newton becomes `θ ← θ − H⁻¹∇f`. The one-dimensional pictures are the ones to carry.
- **The Hessian's cost** (§2, step 13) is why Thursday has to discuss quasi-Newton methods, and why gradient methods survive at scale.
- **Nov 24 drops "unconstrained."** Today's boundary discussion is the honest preview: when the optimum sits where the parameter isn't allowed to go, the FONC doesn't apply and you need Lagrange multipliers.
- **Concavity** is the property that will be assumed all through Nov 24 and quietly lost afterwards.
- **`f″` at the optimum is the Fisher information**, up to sign — so the same second derivative that governs step sizes also gives the asymptotic standard error of an MLE. Worth one sentence if the group is strong; it ties Oct 29's inference thread to today's method.
- **Dec 1's dynamic programming** optimizes by a different route — value iteration rather than derivatives — which is worth flagging as a genuinely different kind of method.

## 10. Looking back

- **Thursday Nov 12 is the direct parent.** FONC is its "no improving direction," and the stability bound is its unanswered question.
- **Oct 29's "set the score to zero"** was the FONC without the name or the second-order check. Today supplies both, and applying SOSC to that MLE closes the gap.
- **Oct 29's `p̂ = 0` boundary case** is step 7, now with an explanation.
- **Aug 27's grid search** was the first optimization method in the course, and it's still the one that can't fail.
- **Nov 5's closed form** was the last problem that didn't need any of this.

---

## 11. Source map

- 🔴 **Nothing exists.** No notebook in either repo, no HTML lecture, no lab.
- `data/metabric.csv` — the worked example. Intercept-only logistic: `n = 1,343`, `ȳ = 0.428146`, closed-form MLE `β* = logit(ȳ) = −0.2894197`, `f″(β*) = −328.82`.
- `sp26/02_modeling_simulation_inference/01_models_and_regression.ipynb` §2 — Nov 10's session, which is where the objective comes from.
- **Boyd & Vandenberghe §9.1–9.3** (free) is the closest thing to a textbook treatment of this session.

## 12. Open questions

- 🔴 **Everything in §7 needs building.** Second of four from-scratch sessions; the block now needs roughly six hours of build across Nov 12–24.
- **Is Tuesday's quiz the right place for this material?** Necessary vs. sufficient and the stationary-point classification are unusually well suited to a handwritten, concept-driven quiz — the format the syllabus specifies. Worth writing next week's quiz off today's §6.
- **How much Newton to expect students to implement?** Thursday's lab is the natural place; today could stay conceptual.
- **Does BFGS get named?** `scipy.optimize.minimize` defaults to it, so students will see the string. One sentence: it approximates the Hessian from successive gradients, getting most of Newton's speed at gradient cost.
- **Is the Fisher-information connection wanted?** It links this block back to inference and would make the optimization sessions feel less like a detour. It also needs care, since it's the one place the second derivative means something statistical rather than computational.
