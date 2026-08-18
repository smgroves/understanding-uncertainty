# Week 9, Thursday (Oct 22) — Simulating Markov Chains

- **Syllabus topic (tentative):** Simulating Markov Chains · week theme *"Markov Chains"*
- **Day type:** Lab / Coding Day
- **Primary source:** `uu_sp26/.../00_understanding_data/04_dynamics.ipynb` §3, cells 31–44
- **Lab:** `sp26/understanding_uncertainty_assignments/assignment_5.ipynb` (18 cells) **+ `assignment_5_solutions.ipynb` (49 cells)** — both exist
- **Data:** `tuna.csv` ✅, `cville_weather.csv` ✅ (412 rows, Charlottesville precipitation) · `taxicab.pkl` 🔴 **missing**

> 🔴 **Both demonstrations in this session are broken, and it's one bug.** `04_dynamics` cell 17 normalizes the transition matrix along the wrong axis. The consequence: **cell 33's simulation raises `ValueError: probabilities do not sum to 1` for every state**, and **cell 40's forecast converges to `[0.2799, 0.2799, 0.2799, 0.2799]`, which sums to 1.12 and isn't a distribution.**
>
> Cell 41 then *states* the correct answer — `[0.27991017, 0.21300387, 0.21395731, 0.29312865]` — which the code cannot produce. That printed output was evidently pasted from a working version.
>
> **The fix is one line**, and I verified it: the simulation runs and the forecast converges to exactly the numbers cell 41 claims. Details in §7.

---

## 1. What students actually see

| Artifact | File | Status |
|---|---|---|
| Pre-class video | `04_dynamics` §3 (cells 31–41) | 🔴 **two broken cells — fix first** |
| In-class | same, plus the order-1 revisit | code exists |
| Instructor cells | — | mostly exist once fixed |
| **Lab** | `assignment_5` + **full solutions** | ✅ exists · ⚠ part 4 needs missing data |
| Board | — | Simulation vs forecast, `T^k π₀`, the steady state |

**The lab is the best-resourced artifact in the second half.** Four parts: a matrix-multiplication warm-up (basis vectors select columns, `u` sums rows, identity, permutation, then a transition matrix), a two-state chain worked by hand, real Charlottesville weather data, and taxicab trajectories. A 49-cell solutions notebook covers all of it.

**Part 4 can't run** — it loads `taxicab.pkl`, which isn't in the repo. Parts 1–3 are fine, and `cville_weather.csv` is present.

---

## 2. The content, from scratch

Tuesday built the transition matrix. Today does the two things you can do with one, and the whole session turns on keeping them apart.

### Simulation: one path

Each column of the matrix is a distribution over the next state given the current one. So:

```
pick a starting state
repeat:
    sample the next state from the current state's column
    move there
```

Out comes a sequence. With the fixed matrix and the notebook's seed, the tuna chain generates:

```
agccaaaactagggaataac
```

Plausible-looking DNA that appears nowhere in the genome. **The source's framing is the one to use:** *"the more recent term for this is generative modeling."* This is a next-token predictor sampling from its own predictions — the same loop a language model runs, with a lookup table where the network would be.

### Forecasting: the distribution over paths

Instead of *picking* a next state, carry the whole distribution forward. Represent the current knowledge as a vector `π₀` — a 1 at the current state, 0 elsewhere — and multiply:

```
π₁ = T π₀,    π₂ = T π₁ = T² π₀,    …,    π_k = T^k π₀
```

Because `π₀` is a basis vector, `T π₀` just **selects the column** for the current state — the conditional distribution over the next state. Multiply again and you get two steps ahead, and so on.

**Simulation and forecasting are different questions and this is the distinction to protect.** Simulation answers *"what might happen?"* and gives you one realization. Forecasting answers *"what is likely to happen?"* and gives you the distribution. Running the simulation many times and tabulating the results would reproduce the forecast — the same relationship as Monte Carlo to an exact calculation.

### The forecast decays into the marginal

Watch `π_k` as `k` grows. Early on it's concentrated: knowing you're at `a` tells you a lot about the next letter. By five or six steps it has spread out, and the source says it plainly — *"by period 5, things are relatively noisy, and the process could be anywhere."*

Where does it settle? Run it to convergence on the tuna chain (I checked, with the fixed matrix):

```
forecast limit:        [0.27991, 0.21301, 0.21396, 0.29313]
marginal proportions:  [0.27991, 0.21300, 0.21396, 0.29313]
```

**The long-run forecast is the marginal state proportions** — the overall frequency of each letter in the genome. That's the source's "where have you seen these before?" and it deserves a beat of silence.

The interpretation is worth stating carefully: **knowing the current state helps, and the help decays to nothing.** Far enough ahead, your best forecast is just "how often does each state occur," which is what you'd have said without observing anything. The chain forgets where it started.

This limiting distribution is the **steady state** (or stationary distribution), and it satisfies

```
π = T π
```

— a distribution that maps to itself. `assignment_5` part 2 has students find it by iterating to a tolerance, which is the right first exposure: it's a fixed point you can reach by repeated multiplication rather than an equation you solve.

### When the forecast doesn't settle

Two conditions, and Tuesday supplied the first:

- **Connected** — every state reachable from every other. A disconnected chain has separate regions, and where you end up depends on where you started. Tuesday's key-signature example: a chorale never leaves its key.
- **Aperiodic** — the chain doesn't cycle deterministically. A chain that alternates strictly between two states never settles; it oscillates forever.

`assignment_5`'s solutions state the general property well: *"the long run distribution doesn't depend on the initial condition (if all states communicate)."*

---

### Reading

*Key in `README.md`. From `Reading-Roadmap.md` unless marked [Map] (= `prep/ds5030_syllabus_reading_map.pdf`).*

*From [Map]; the detailed `Reading-Roadmap.md` stops at 10/1.*

- **Primary** — **G&S §11.1–11.4**, through the Fundamental Limit Theorem — the formal version of §2's "the forecast converges to the marginal, regardless of where you started."
- **Applied companion** — **QE, "Markov Chains: Irreducibility and Ergodicity"** (`intro.quantecon.org/markov_chains_II.html`), which is the long-run-behaviour side with code. Irreducibility is the formal name for Tuesday's *connected*, and ergodicity is the condition under which the steady state is unique.
- **Forward** — [Map] notes that whichever DP treatment you eventually use will lean on this same machinery, and that **QE's "Discrete State Dynamic Programming"** (`python.quantecon.org/discrete_dp.html`) builds the Bellman operator on exactly these objects.

---

## 3. The optimization view

- **Objective:** squared error of a `k`-step-ahead prediction
- **Argmin:** the conditional expectation `E[X_{t+k} | X_t]`, computed from `π_k = T^k π₀`
- **Solved by:** repeated matrix multiplication — no calculus, no closed form needed

The chain of connections is worth drawing explicitly, because it ties three sessions together:

**Oct 15** established that `E[Y|X]` is the MSE-optimal predictor. **Today** computes exactly that object for a sequence, `k` steps ahead, by multiplying a matrix. And the **steady state** is where that argmin stops depending on the conditioning variable — where `E[X_{t+k} | X_t]` collapses to `E[X]` and knowing the present buys you nothing.

So the decay of the forecast is the **value of information decaying to zero**, measured. That framing is not in the source and it's the most useful thing you can add.

---

## 4. Assumptions that make it work

| Claim | Assumption |
|---|---|
| Sampling from a column is valid | **The column sums to 1.** Currently false — see §7 |
| `π_k = T^k π₀` | The Markov property (Tuesday) and time-homogeneity |
| The forecast converges | **Connected and aperiodic.** Both fail in real cases |
| The limit is unique | Same conditions. A disconnected chain has one limit per component |
| The limit equals the marginal proportions | The empirical chain estimated from one long stationary sequence. Not a general identity |
| Simulation ≈ forecast, run many times | Enough replications — Sep 22's `T` again |

**Row 5 deserves care.** The steady state matching the observed letter frequencies is not a theorem you can apply anywhere; it holds because the transition matrix was *estimated from* that same sequence, which is assumed stationary. It's a consistency check on the estimation, and it's a good one — if they disagree badly, something is wrong with your counting.

---

## 5. Concrete failure cases

**Zero-probability traps.** A state whose column is all zeros — never observed as a source — halts the simulation. And with a high-order chain, most states are like this. Tuesday's smoothing discussion is the fix.

**Periodic chains never settle.** A chain that alternates strictly A→B→A→B has forecasts that oscillate between two vectors forever. The average converges; the forecast doesn't. Worth thirty seconds so "it always converges" doesn't get filed as a fact.

**Disconnected chains converge to different places.** Start in one component, stay there. Tuesday's connectivity check is precisely the test for whether the steady state is meaningful.

**Confusing one simulated path with a forecast.** A single generated sequence is one draw. Students will read a simulation as a prediction; it's a sample from the prediction.

**Reading generated text or DNA as meaningful.** The tuna simulation produces strings that look like DNA and are not from any organism. It's the same failure mode as reading fluency in generated text as knowledge — a good, concrete version of a point students will meet all year in their ML course.

**Order-3 states must overlap.** In an order-3 chain, `aga` can only be followed by states beginning `ga`. The estimated matrix enforces this automatically — non-overlapping transitions were never observed, so they have probability zero — but it's worth pointing out, because it explains why those matrices are so sparse.

---

## 6. Five questions students will ask

**Q1. "What's the difference between simulating and forecasting?"** Simulation gives you *one* possible future: at each step you actually pick a state and commit to it, so you end up with a single sequence. Forecasting gives you the *distribution* over futures: you never pick, you carry the whole probability vector forward. One answers "what might happen," the other "what's likely." They're connected — simulate ten thousand times, tabulate where you ended up at step `k`, and you recover the forecast. That's Monte Carlo from Sep 22, applied to a chain.

**Q2. "Why does multiplying by the matrix give the forecast?"** Because a basis vector selects a column. If you're certainly in state `k`, then `π₀` is all zeros with a 1 in position `k`, and `T π₀` picks out column `k` — which is exactly the conditional distribution over the next state. Multiply again and each possible next state contributes its own column, weighted by how likely you were to be there. Matrix multiplication *is* "average over all the ways of getting there," which is why the same operation iterated gives you `k` steps.

**Q3. "Why does the forecast stop being useful?"** Because information about the present decays. One step out, knowing you're at `a` genuinely narrows things down. Each additional step mixes in more paths, and by five or six steps the chain could have gone almost anywhere. In the limit your best forecast is the overall frequency of each state — exactly what you'd have guessed knowing nothing. That's not a defect; it's the honest answer, and it's why weather forecasts have a horizon.

**Q4. "Why does the long-run forecast equal the letter frequencies?"** Because the chain spends its time in each state at the rate the steady state specifies, and you estimated the matrix from a long run of that same chain — so the observed frequencies *are* the long-run frequencies. The two agreeing is a consistency check on your estimation rather than a coincidence. It works because the sequence is long and its behaviour is stable over its length; on non-stationary data, they'd disagree, and that disagreement would be telling you something.

**Q5. "Is this actually how language models work?"** It's the honest ancestor. A Markov chain *is* a next-token predictor: given the current state, sample from the distribution over what comes next, append, repeat. That's the generation loop, unchanged. The difference is how the conditional distribution is obtained — a lookup table indexed by the last `k` tokens versus a network that learns which earlier positions matter. That difference is what breaks the order barrier: a Markov chain needs `S^k` states to remember `k` tokens back, which is impossible past small `k`, while attention learns where to look instead of enumerating histories. So the loop is the same and the estimator is not.

---

## 7. Bugs and simplifications in the material

### 🔴 The transition matrix is normalized along the wrong axis

Cell 17 builds counts as `tr_counts[index_to, index_from]` — **rows are the destination, columns the source.** That's the column-stochastic layout, and it's consistent with how cells 33, 37 and 40 use the matrix, and with `assignment_5` (*"its columns sum to 1"*). Good.

But the normalization is:

```python
sums = tr_counts.sum(axis=1, keepdims=True)     # ← row sums = ARRIVALS into each state
tr_pr = np.divide(tr_counts, sums, ...)          # ← broadcasts row-wise: makes ROWS sum to 1
```

For a column-stochastic matrix each **column** must sum to 1, so the normalizer must be the **column** sums — departures *from* each state.

I ran it on `tuna.csv`. The resulting columns sum to:

```
[1.1169, 0.8291, 0.8672, 1.1869]
```

Two consequences, both verified:

1. **Cell 33's simulation crashes.** `np.random.choice(len(states), p=tr_pr[:, state_index])` raises `ValueError: probabilities do not sum to 1` — for **all four** starting states.
2. **Cell 40's forecast is wrong.** It converges to `[0.27991, 0.27991, 0.27991, 0.27991]`, summing to **1.12**. All four entries are equal, which should itself be a red flag.

And **cell 41 asserts** the forecast converges to `[0.27991017, 0.21300387, 0.21395731, 0.29312865]` — the true marginal proportions, and exactly what the *correct* normalization produces. The prose is right; the code cannot produce it.

**The fix:**

```python
sums = tr_counts.sum(axis=0, keepdims=True)     # departures, broadcast column-wise
tr_pr = np.divide(tr_counts, sums, out=np.zeros_like(tr_counts), where=sums!=0)
```

Verified after the change: columns sum to exactly 1, the simulation runs (`agccaaaactagggaataac`), and the forecast converges to `[0.27991043, 0.21300510, 0.21395713, 0.29312734]` — cell 41's numbers.

**Why this went unnoticed:** arrivals and departures differ by at most one (a boundary effect — `[224589, 170907, 171671, 235194]` vs `[224589, 170906, 171671, 235195]`), so the normalizer *values* are nearly identical. Only the axis they're applied along is wrong. The resulting matrix is off by up to **0.0996** in absolute terms, which is large.

**Apply the same fix at cell 24** (the order-3 matrix), which has the same `axis=1` normalization and additionally drops `keepdims`.

### Other verified issues

- **Cell 23 drops `keepdims`**, so `sums` is 1-D and cell 24's broadcast differs from cell 17's. Two normalizations, two behaviours.
- 🔴 **`taxicab.pkl` is missing**, so `assignment_5` part 4 (cells 39–48 of the solutions, the largest section) cannot run. Same missing dataset as Tuesday's Exercises 1–3.
- **Cell 39 reloads `tuna.csv` and rebuilds the order-1 matrix** because `tr_pr` was overwritten by the order-3 version. That's why cell 17 saves `tr_pr_1`. Fragile but functional — just don't reorder cells.
- **Cell 42 (Exercise 4)** asks for taxicab simulation. Missing data again.

### Simplifications

- **The steady state is never named.** The notebook shows the forecast converging and says "where have you seen these before?", but doesn't give the term *stationary distribution* or the defining equation `π = Tπ`. `assignment_5` gets closer. Add both — it's the concept the session is building toward.
- **Aperiodicity is never mentioned.** Connectivity was covered Tuesday; periodicity is the other condition and takes one sentence.
- **`np.random.seed(100)`** is the legacy API. `np.random.default_rng(100)` is current, and `assignment_5` already uses it — a small inconsistency between lecture and lab.
- **The simulation/forecast relationship is never stated.** That running the simulation many times reproduces the forecast is the cleanest link to Sep 22's Monte Carlo, and it's absent.

---

## 8. Delivery plan

**Modes:** 🟦 notebook (student copy) · 🟩 instructor cells (pre-written, never live) · ⬛ board · 🟨 HTML widget

| # | Step | Mode | Time | Notes |
|---|---|---|---|---|
| 1 | Recap: each column is a conditional distribution | ⬛ board | 2 min | Tuesday's matrix is today's input |
| 2 | **Simulation: sample, move, repeat** | ⬛ board | 3 min | Three lines of pseudocode |
| 3 | **Generate DNA** | 🟩 instructor cells | 5 min | Cell 33, **fixed**. `agccaaaactagggaataac` — plausible, and in no organism. Say "generative modeling" |
| 4 | *(optional)* Generate Bach | 🟩 instructor cells | 3 min | `bach.py`, `music.mid`. If it plays audio, it's the most memorable thirty seconds of the month |
| 5 | **Simulation ≠ forecast** | ⬛ board | 4 min | One path vs the distribution over paths. **The distinction to protect** |
| 6 | `T π₀` selects a column | ⬛ board | 5 min | Basis vector picks the column. Then `T² π₀`, `T^k π₀`. This is `assignment_5` part 1, previewed |
| 7 | **Watch the forecast spread** | 🟩 instructor cells | 5 min | Cell 35's bar plots, steps 0→5. Concentrated, then flat |
| 8 | **The limit is the marginal** | 🟩 instructor cells | 5 min | Cell 40, **fixed**. Print the limit and the letter frequencies side by side. Let it land |
| 9 | Name it: the steady state, `π = Tπ` | ⬛ board | 3 min | **Not in the source.** The definition the session has been building to |
| 10 | When it fails: periodic, disconnected | ⬛ board | 3 min | Tuesday's connectivity check was the setup |
| 11 | The optimization view | ⬛ board | 3 min | §3 — the forecast is `E[X_{t+k}\|X_t]`, and its decay is information dying |
| 12 | **Lab** | 🟦 notebook | rest | `assignment_5` parts 1–3 |

**Build cost: ~15 minutes, all of it fixing.** Apply the §7 patch at cells 17 and 24, re-run, confirm the numbers match cell 41.

**Step 8 is the payoff of two sessions.** Don't rush it, and put the two vectors on the screen together.

**Cut first:** step 4 if `bach.py` doesn't cooperate, then step 11. **Do not cut** steps 5, 8, or 9.

### The lab

`assignment_5`, parts 1–3. Part 1 is a matrix-multiplication warm-up that earns its place — basis vectors select columns, `u = (1,1,1)` sums rows, identity, permutation, then a transition matrix iterated five times from three different starts, converging to the same place. **That's the steady state discovered by hand before it's named.**

Part 2 is a two-state chain iterated to a tolerance, landing on `[0.4, 0.6]` from any start. Part 3 uses `cville_weather.csv` (412 rows, present): threshold `PRCP > 0` into a rain indicator, build the chain, find the steady state, and compare it against the raw fraction of rainy days.

**Part 4 needs `taxicab.pkl` and it doesn't exist.** Cut it, or substitute — the Bach chorale data is present and would work for a state-space-and-connectivity question.

---

## 9. Look ahead

- **Oct 27's likelihood is built from these entries.** The probability of an observed sequence under a Markov chain is the product of the transition probabilities along its path — which makes a Markov chain an unusually clean first likelihood, with the parameters right there in a matrix.
- **Dec 1's dynamic programming runs on transitions.** The Bellman equation takes an expectation over next states using exactly this matrix. Today's `T π` is one step of that machinery without the optimization on top.
- **The steady state returns as the long-run behaviour of a policy** in any DP treatment.
- **Generative modeling** connects forward to whatever students are seeing in their concurrent ML course. Saying "this loop is the loop" once is worth the time.
- **Zero-probability traps** motivate smoothing, which motivates regularization (Nov 24, if it happens).

## 10. Looking back

- **Tuesday built the matrix.** Today uses it. The connectivity check from Tuesday is the condition for today's steady state to exist and be unique.
- **Sep 3's matrix multiplication** is what `T π` and `T^k π` are, and `assignment_5` part 1 is an explicit callback — basis vectors selecting columns is the same "row times column" fact from August.
- **Sep 22's Monte Carlo** is the relationship between simulation and forecast: run the sample many times and you recover the distribution.
- **Oct 15's `E[Y|X]`** is what the forecast computes, `k` steps out.
- **Oct 13's independence** is the limiting case: once the forecast has converged, the future is independent of the present.

---

## 11. Source map

- `sp26/00_understanding_data/04_dynamics.ipynb` §3 — cells 31–44. Simulation prose (32), **simulation code (33, broken)**, forecasting prose (34), forecast plots (35), commentary (36), **the `T π₀` math (37)**, order-1 revisit (38–39), **forecast iteration (40, broken)**, "where have you seen these before?" (41, **states the correct answer**), Exercise 4 (42, **needs missing data**), conclusion (43), Exercise 5 (44 — build a Markov chain class).
- `sp26/understanding_uncertainty_assignments/assignment_5.ipynb` — 18 cells. Part 1 matrix warm-up (1–13), part 2 two-state chain (14–15), part 3 weather (16), part 4 taxicabs (17, **missing data**).
- `assignment_5_solutions.ipynb` — 49 cells, complete worked solutions including the weather chain and the taxi section.
- Data: `tuna.csv` ✅, `bach.data` / `bach.py` / `music.mid` ✅, `cville_weather.csv` ✅ (412 rows, 2024 Charlottesville precipitation), `taxicab.pkl` 🔴.
- `practice_exam_2.ipynb` problem 2 is a two-state weather chain with a forecast-and-steady-state question — good quiz material, and it uses the same column-stochastic convention.

## 12. Open questions

- 🔴 **Apply the normalization fix (§7) before anything else.** Cells 17 and 24 of `04_dynamics`. Both demonstrations depend on it, and the fix is verified.
- 🔴 **`taxicab.pkl` is missing**, breaking `assignment_5` part 4 and `04_dynamics` Exercises 1–4. This is the same gap as Tuesday. Either source the data, substitute the Bach chorales, or cut the taxi thread entirely — it currently runs through both sessions.
- **Add the term "stationary distribution" and the equation `π = Tπ`.** The session builds to a concept it never names.
- **Does `bach.py` generate playable audio?** `music.mid` suggests yes. Worth five minutes of checking, because generated Bach played aloud is the most memorable demonstration available this month.
- **Is Exercise 5 (build a Markov chain class) the lab, or extra?** It's a good capstone — state space, transition matrix, simulate — and it overlaps `assignment_5`.
- **Which convention gets taught?** The material is column-stochastic (`T π`), which is consistent across the lecture, the assignment, and practice exam 2. Much of the outside world writes row-stochastic (`π T`). Worth one sentence so students aren't confused by other sources.
