# Week 15, Tuesday (Dec 1) — Dynamic Programming and Backward Induction

- **Syllabus topic (tentative):** Dynamic programming; backwards induction · week theme *"Dynamic Programming"*
- **Day type:** Quiz / Math Day
- **Primary source:** `uu_fa26/class_08/06_02_optimal_stopping.ipynb` (**10 cells, thin, three of them broken or empty**)
- **Lab source:** `labslop/08_optimal_stopping/lab_08_optimal_stopping.ipynb` **§5–6** — the half deliberately cut from Sep 17
- **Data:** 🔴 C-MAPSS still missing — same blocker as Sep 17
- **Applied companion:** QE, *"Discrete State Dynamic Programming"* (`python.quantecon.org/discrete_dp.html`)

> **Sep 17 set this up eleven weeks ago and left it open.** That session ran the jet-engine lab through §4 — myopic stopping — and stopped there deliberately, on a policy that *visibly leaves value on the table*. `06_02` cell 3 says why: the myopic rule *"ignores the option value of waiting."* Today closes it.
>
> **And the method is genuinely different from everything in November.** No gradients, no Hessians, no step sizes. You optimize over *sequences of decisions* rather than a parameter vector, and you solve it by starting at the end. Worth saying explicitly so the optimization block doesn't leave students thinking all optimization is calculus.

---

## 1. What students actually see

| Artifact | File | Status |
|---|---|---|
| Quiz | — | On Week 14: Lagrangian, ridge, MAP |
| Pre-class video | `class_08/06_02` (10 cells) | ⚠ **thin; cells 1, 4, 6 broken or empty** |
| In-class | same + the lab's §5 | needs porting |
| Instructor cells | lab cells 18–19 exist | 🔴 **but the data doesn't** |
| Lab | `labslop/08` §5–6 | **written** — 🔴 blocked on C-MAPSS data |
| Board | — | The value function, the Bellman equation, backward induction |

**The material is thin and the code is good.** `06_02` is ten markdown cells with three of them unusable (§7). The lab's §5–6, by contrast, is complete and well-written — `solve_dynamic_policy` is a clean twelve-line backward induction, and §6's comparative statics is a genuine correctness check.

---

## 2. The content, from scratch

### A different kind of optimization problem

Everything in November optimized over a **parameter vector**: pick the `β` maximizing a function. Today you optimize over a **sequence of decisions made through time**, where each decision changes what you face next.

The engine problem from Sep 17: each cycle, keep running or replace. Running earns operating value and risks catastrophic failure at rate `h(t)`. Replacing costs a known amount and resets the clock.

**Why you can't just decide each period separately.** The naive move is to compare this period's costs and benefits — and that's the *myopic* rule from Sep 17. It's wrong because continuing doesn't only earn you one more cycle; it also **preserves the option to stop later, with better information about how the engine is aging**. That option has value, and a one-period comparison can't see it.

### The value function

Define the thing you wish you knew:

```
V(t) = the best achievable value from state t onward, assuming you behave optimally from here
```

`V` isn't a decision — it's the *consequence* of deciding well. `06_02` calls it "a fictional function that encodes the consequences of future decisions," which is a good description of why it feels circular at first: to know the best action now you need `V` of tomorrow, and to know `V` of tomorrow you need the best action tomorrow.

### The principle of optimality

The observation that breaks the circle, and the source's epigraph is the right one — *"life must be lived forwards, but can only be understood backwards."*

> **Whatever your first decision, the remaining decisions must be optimal for the state that decision leaves you in.**

So an optimal plan is an optimal first move followed by an optimal plan *from wherever that lands you*. This lets you write today's value in terms of tomorrow's:

```
V(t) = max {  stop:      the payoff to stopping now
              continue:  this period's payoff + (expected) V(t+1)  }
```

That's the **Bellman equation**. It's not a formula you solve for a number; it's a *relationship between adjacent time periods*, and the whole method is exploiting it.

For the engine problem, with hazard `h(t)`, maintenance cost `m`, operating value `v`, and catastrophe cost `L`:

```
V(t) = min {  m ,                                    replace now
              −v + h(t)·L + (1 − h(t))·V(t+1)  }     keep running
```

(A minimization, since these are costs. Same idea.) **Note the expectation over next states**: with probability `h(t)` it fails and you pay `L`; otherwise you survive into `V(t+1)`. That is Oct 15's conditional expectation and Oct 20's transition probabilities, appearing inside an optimization.

### Backward induction: start at the end

The recursion refers to the *future*, so you can't evaluate it forward — `V(t)` needs `V(t+1)`, which needs `V(t+2)`, and so on.

But at the **last** period there's no future to worry about, so `V` is known outright. Then work backwards: knowing `V(T)`, compute `V(T−1)`; knowing that, compute `V(T−2)`. Each step is a single comparison, and after `T` steps you have the whole value function *and* the optimal action at every state.

That's the whole algorithm, and it's twelve lines:

```python
V = np.zeros(max_age + 2)
V[max_age + 1] = maintenance_cost              # terminal condition
for age in range(max_age, 0, -1):              # BACKWARD
    f = h(age)
    stop     = maintenance_cost
    cont     = -operating_value + f*catastrophe_cost + (1-f)*V[age+1]
    V[age]   = min(stop, cont)
    action[age] = "stop" if stop <= cont else "continue"
```

**The direction of the loop is the entire idea.** Say it aloud: `range(max_age, 0, -1)` is what makes this dynamic programming rather than a simulation.

### What you get: a policy, not an answer

Backward induction doesn't return a single decision — it returns an **action for every state**. That's a *policy*, and it's a strictly more useful object: whatever age your engine turns out to be, you can look up what to do.

The value function is also informative on its own. Plotted against age it shows expected future cost rising as the engine ages, and the point where "stop" takes over is where the two branches of the max cross.

### Myopic versus dynamic, measured

This is the comparison Sep 17 set up. On a rising-hazard example (**synthetic — the real C-MAPSS data is still missing**, §7):

```
myopic rule  — stop when h(a)·L ≥ v      →  stop at age 127
dynamic rule — full backward induction   →  stop at age 131
```

The two policies differ, and **the difference is exactly the option value the myopic rule can't see.** Four cycles here; the size depends on the cost structure, and the *existence* of a gap is the point.

Worth being honest with students: the gap is often modest. Dynamic programming isn't magic, and the lab's own closing line is the right note — *"the point of dynamic programming is not magic. It is careful accounting over a grid."*

### Comparative statics as a correctness check

The lab's §6 varies the costs and asks whether the policy moves sensibly. I verified all three claims:

| change | claim | verified |
|---|---|---|
| higher catastrophe cost | replace **earlier** | 250→168, 500→131, 1000→97, 2000→65 ✅ |
| higher operating value | replace **later** | 0→1, 2→100, 4→131, 8→163, 12→181 ✅ |
| higher maintenance cost | replace **later** | 10→127, 50→131, 100→137, 200→150 ✅ |

**This is a genuinely good teaching move and worth naming as a method.** You can't check a dynamic program against a closed form — there usually isn't one. What you *can* do is verify the answer moves the right way when you perturb the inputs. That's how you debug an optimization whose answer you don't know, and it generalizes far beyond this problem.

### Finite versus infinite horizon

Backward induction needs a last period. If the problem runs forever there's nowhere to start — so instead you **iterate the Bellman equation to a fixed point**: guess `V`, apply the recursion to get a better `V`, repeat until it stops changing. That's **value iteration**.

Two things worth connecting. It's the same "repeat until it stops moving" structure as Oct 22's forecast converging to a steady state — and it's a different flavour of optimization from November's: no derivatives, just repeated application of an improvement operator.

---

### Reading

*Key in `README.md`. From [Map] (`prep/ds5030_syllabus_reading_map.pdf`).*

- **No coverage in the six statistics texts.** Fifth consecutive session outside the course's reading list.
- **Applied companion** — **QE, "Discrete State Dynamic Programming"** (`python.quantecon.org/discrete_dp.html`), which [Map] recommends directly. It builds the Bellman operator on exactly the objects from Oct 20–22 — a state space and a transition matrix — with runnable Python.
- **The canonical worked example** — **QE, "Job Search I: The McCall Search Model"** (`python.quantecon.org/mccall_model.html`), flagged by [Map] back at Sep 17. It's an optimal-stopping problem solved by backward induction, and it's a cleaner first example than the engine problem because the state space is small.
- **Worth knowing** — the Bellman equation is also the foundation of reinforcement learning, which is where students will meet it again if they continue.

---

## 3. The optimization view

- **Objective:** total expected value (or cost) over a sequence of decisions
- **Argmax:** a **policy** — an action for every state — characterized by the Bellman equation
- **Solved by:** **backward induction** from a terminal condition, or value iteration if there's no terminal period

**This box is deliberately different from every previous one**, and that's the pedagogical point of putting it after November. There is no gradient, no Hessian, no step size, and no differentiability requirement. The state space can be discrete, the value function can be a lookup table, and the method still works.

What it shares with the block: it's still `argmax` of something, and the "solved by" column is still a real algorithm rather than a formula. What it doesn't share: the mechanism.

---

## 4. Assumptions that make it work

| Claim | Assumption |
|---|---|
| The principle of optimality holds | The problem is **separable over time** — the future depends on the past only through the current state. **That is the Markov property**, from Oct 20 |
| `V(t)` is well defined | Finite horizon, or discounting that makes the infinite sum converge |
| Backward induction terminates | A **terminal condition**. Without a last period you need value iteration |
| The expectation over next states is right | The transition probabilities are known — here, the hazard `h(t)` |
| The state space is enumerable | Every state must be visited. **This is the binding constraint in practice** |
| The estimated `h(t)` is accurate | It's an *estimate* from 100 engines (Sep 17), so the policy inherits that sampling error |

**Row 1 is the connection worth drawing.** Dynamic programming *requires* the Markov property — if the future depended on the whole history, `V` would need to be a function of the entire path and the recursion would collapse. Oct 20 introduced that assumption for describing sequences; today it's what makes optimizing over them tractable.

**Row 5 is the curse of dimensionality**, and it's why this method is beautiful on a one-dimensional age grid and infeasible on a large state space. Same wall as Oct 15's LCLS, for the same reason.

---

## 5. Concrete failure cases

**The myopic trap.** Optimizing each period separately ignores option value and gives a different — worse — policy. Sep 17 ended on exactly this, and today quantifies it.

**Curse of dimensionality.** Backward induction visits every state. One engine age: 200 states, trivial. Add temperature, load, and maintenance history, and the grid multiplies out to something unenumerable. This is *the* practical limit of exact DP and the reason approximate methods exist.

**No terminal condition.** Infinite-horizon problems have nothing to work backward *from*. Value iteration fixes it, and needs discounting to converge.

**Estimated transitions treated as known.** The hazard came from 100 engines. A different fleet gives a different `ĥ`, hence a different policy — and the policy is a *statistic*, with all the sampling variability of Sep 22. Nothing in the DP machinery knows this.

**Non-Markov dynamics.** If failure risk depends on the whole operating history rather than current age, the state is misspecified and the whole recursion is invalid. The fix — enlarge the state — is Oct 20's "raise the order," with the same exponential cost.

**Reading the policy as optimal in the real world.** It's optimal *for the model*: this hazard, these costs, this horizon. All three are estimates or assumptions.

---

## 6. Five questions students will ask

**Q1. "Why work backwards? That feels inside out."** Because the Bellman equation defines today's value in terms of tomorrow's, so you can't evaluate it until you know tomorrow's. Going forward you'd need `V(1)`, which needs `V(2)`, which needs `V(3)` — you never get a foothold. At the *last* period there's no future left, so `V` is known outright, and from there each backward step is a single comparison using something you already computed. It's the same reason you solve a maze more easily from the exit: the end is the only place where the answer is unambiguous.

**Q2. "What is the value function, exactly? It seems circular."** It's the best total value achievable from a state onward, assuming you play optimally from that point. The circularity is real and it's what backward induction resolves: `V(t)` genuinely does depend on `V(t+1)`, but `V(t+1)` depends only on things *further ahead*, never on `V(t)`. So the dependency runs strictly one way in time, and starting from the end unrolls it. The circularity would be fatal only if today's value depended on today's — which is what happens in infinite-horizon problems, and why those need iteration to a fixed point instead.

**Q3. "How is this different from what we did in November?"** Almost entirely. November optimized over a parameter vector, using derivatives to decide which way to move, with the answer a point in `ℝᵖ`. Today optimizes over decision rules, using the recursive structure of time, with the answer a *policy* — an action for every state. There's no gradient, nothing needs to be differentiable, and the state space can be discrete. What's shared is only the framing: something is being maximized, and there's an algorithm rather than a formula. It's worth seeing both, because the November methods would be useless here and this method would be useless there.

**Q4. "Is the dynamic policy always better than the myopic one?"** Never worse, by construction — the dynamic rule considers every policy the myopic rule could pick, plus more. But the *gap* is often modest, and on the example here it's four cycles. The honest framing is that dynamic programming buys you a guarantee and an exact accounting rather than a dramatic improvement. Where the gap grows large is when the future differs sharply from the present — a rapidly changing hazard, or a decision that forecloses options later.

**Q5. "How do I know my implementation is right?"** You usually can't check against a closed form, because there generally isn't one. What you can do is **comparative statics**: change an input and verify the answer moves the way it must. Raise the catastrophe cost and the optimal replacement age must fall; raise the value of operating and it must rise. I checked all three on this problem and they hold. If a sign comes out backwards, you have a bug — and this is a general technique for testing any optimization whose answer you don't know in advance.

---

## 7. Bugs and simplifications in the material

### Verified

- 🔴 **The C-MAPSS data is still missing**, so the lab's §5–6 cannot run — the same blocker as Sep 17. `prep_optimal_stopping.py` expects a zip that isn't in the repo. **Every number in §2 was computed on a synthetic rising hazard**, not the real data, and that substitution is the reason.
- **`06_02` cell 1 is truncated mid-sentence** — *"The fundamental insight is that you can"* — and it's the cell that would motivate the whole method.
- **`06_02` cell 4 is an empty heading** — `## Dynamic Decision-Making` with nothing under it.
- **`06_02` cell 6 is truncated with an empty math block** — *"Then waiting is better than replacement if $$"* and nothing follows.
- **`06_02` cell 7 divides an inequality by a bracket that may be negative.** Going from
  `h[dV(0) − dV(t+1) − dR] ≥ d(V(0) − V(t+1)) − c` to `h ≥ [d(V(0)−V(t+1)) − c] / [dV(0) − dV(t+1) − dR]`
  requires the bracket to be **positive**; if it's negative the inequality flips. The sign isn't checked, and with `−dR` in it the bracket is plausibly negative. **Verify before teaching this line**, or drop it — the lab's code doesn't use this form.
- **`06_02` cell 8 writes the Bellman equation as `\begin{cases}`**, which presents "replace" and "wait" as *cases* rather than as branches of a **max/min**. The optimization is the whole point and the notation hides it. It should be `V(t) = min{ … , … }`.
- **Notation drifts between `06_02` and the lab.** The notebook uses `L`, `R`, `c`, `d`; the lab uses `catastrophe_cost`, `maintenance_cost`, `operating_value`, and no discounting at all. Reconcile before teaching them together.

### Correct — verified

The lab's `solve_dynamic_policy` (cell 18) is a clean, correct backward induction with a proper terminal condition, and **all three comparative-statics claims in cell 23 hold** — I checked each direction on a synthetic hazard. The myopic rule in `06_02` cell 3 rearranges correctly to `h(t) ≤ c/(dR)`.

### Simplifications

- **The Markov assumption is never named here**, though it's what licenses the whole recursion (§4 row 1). Oct 20 defined it — if that fix was made, this is a one-line callback.
- **Discounting appears in `06_02` and not in the lab.** Worth picking one; the lab's undiscounted finite-horizon version is simpler and sufficient.
- **The curse of dimensionality is never mentioned**, though it's the reason this method doesn't scale.
- **Value iteration and the infinite-horizon case** aren't covered anywhere. §2 gives it in a paragraph; it's the bridge to QE's material and to reinforcement learning.
- **The policy is treated as exact**, with no acknowledgement that `ĥ(t)` was estimated from 100 engines (§5).

---

## 8. Delivery plan

**Modes:** 🟦 notebook (student copy) · 🟩 instructor cells (pre-written, never live) · ⬛ board · 🟨 HTML widget

| # | Step | Mode | Time | Notes |
|---|---|---|---|---|
| 1 | **Quiz** | — | 10 min | Week 14: Lagrangian, ridge, MAP |
| 2 | **Reopen Sep 17** | ⬛ board | 3 min | The myopic rule and the sentence it ended on: *it ignores the option value* |
| 3 | Why period-by-period fails | ⬛ board | 4 min | Continuing preserves an option. That's the whole gap |
| 4 | **The value function** | ⬛ board | 4 min | The best achievable from here on. Name the circularity — it's about to be resolved |
| 5 | **The principle of optimality** | ⬛ board | 5 min | An optimal plan = an optimal first move + an optimal plan from where it lands you |
| 6 | **The Bellman equation** | ⬛ board | 5 min | Write it as a `min{…}`, **not** as cases. The expectation over next states is Oct 20's transitions |
| 7 | **Backward induction** | ⬛ board + 🟩 cell | 6 min | Terminal condition, then walk back. **Point at `range(max_age, 0, -1)`** — the loop direction is the idea |
| 8 | The value function and policy, plotted | 🟩 instructor cells | 5 min | Lab cell 19. Two panels: `V` rising, and where "stop" takes over |
| 9 | **Myopic vs dynamic** | 🟩 instructor cells | 4 min | The two stopping ages side by side. The gap *is* the option value |
| 10 | **Comparative statics as a debugging method** | 🟩 instructor cells | 5 min | All three directions. **Name it as a general technique** for testing an optimization with no known answer |
| 11 | Infinite horizon, in one paragraph | ⬛ board | 3 min | No terminal period ⟹ iterate to a fixed point. Same shape as Oct 22's steady state |

**Build cost: low *if the data existed* (~30 min)** — lab cells 18–19 do most of it. 🔴 **As things stand the session's code cannot run**, so either source the C-MAPSS zip or substitute a synthetic hazard as I did for §2.

**Steps 5, 7, and 10 are the ones to protect.** Step 10 in particular is a transferable skill, not just a check on this problem.

**Cut first:** step 11, then step 3. **Do not cut** step 2 — reopening Sep 17 is what makes this a payoff instead of a new topic.

---

## 9. Look ahead

- **Dec 3 is blank in the syllabus.** If it becomes the Bayesian session, `sp26/00_bayes.ipynb` §2 is fully written and Nov 24's MAP result is the bridge.
- **Value iteration** connects forward to reinforcement learning, where the Bellman equation is the foundation and the transition probabilities are *learned* rather than given.
- **Dec 8's review** could use §3's contrast — two genuinely different kinds of optimization in one semester — as a closing frame.

## 10. Looking back

- **Sep 17 is the direct parent**, and this session only works if that one ran and ended where it was supposed to.
- **Oct 20's Markov property** is what licenses the recursion (§4 row 1) — the single most important connection here.
- **Oct 22's transition probabilities** are the expectation inside the Bellman equation, and its fixed-point convergence is value iteration's shape.
- **Oct 15's conditional expectation** is what `E[V(t+1)]` is.
- **Sep 17's hazard `h(t)`** is the input that drives the whole policy.
- **The November block** is the contrast: derivatives over parameters, versus recursion over time.

---

## 11. Source map

- `uu_fa26/class_08/06_02_optimal_stopping.ipynb` — 10 cells. Dynamic optimization (1, **truncated**), the problem setup (2), **the myopic rule (3)**, empty heading (4), **the principle of optimality and the value function (5)**, truncated (6), the replacement algebra (7, **sign issue**), **the Bellman equation (8, written as cases)**, applications (9).
- `uu_fa26/labslop/08_optimal_stopping/lab_08_optimal_stopping.ipynb` §5–6 — cells 17–19 (backward induction, value function and policy plots) and 20–23 (comparative statics). **Correct and well-written; blocked only on data.**
- `labs/activity-optimal-stopping/index.html` — prose walkthrough with `#dynamic` and `#statics` sections matching the lab.
- **QE `discrete_dp.html`** and **`mccall_model.html`** — the applied treatments [Map] recommends.
- 🔴 C-MAPSS data — still absent. Same item as Sep 17 in `BUGS.md`.

## 12. Open questions

- 🔴 **The data blocker is now two sessions deep.** Sep 17 needed it and Dec 1 needs it again. If it isn't sourced, both sessions need a synthetic hazard — which works (§2 is built on one) but loses the real-data grounding.
- **Fix or cut `06_02` cells 1, 4, 6, and the cell 7 sign.** Four of ten cells are broken; the lab's code is the trustworthy version.
- **Rewrite cell 8's Bellman equation as a `min`**, not as cases. The optimization is the content.
- **Reconcile the notation** between `06_02` (`L`, `R`, `c`, `d`) and the lab (named cost variables, no discounting).
- **Is Dec 3 decided?** It's blank in the syllabus and `sp26/00_bayes.ipynb` §2 is a complete, written Bayesian lecture. That's the strongest available option and Nov 24 sets it up.
- **Does value iteration get taught?** It's a paragraph, it's the bridge to RL, and it reuses Oct 22's fixed-point intuition.
