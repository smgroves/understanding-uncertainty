# Week 4, Thursday (Sep 17) — Survival Function and Hazard Rate

- **Schedule focus (F26_scheduling):** Survival Function and Hazard Rate
- **Learning objective (verbatim from the spreadsheet):** *"slowing down to spend time with CDF KDE etc"*
- **Day type:** Lab / Coding Day
- **Pre-class video:** *"survival and hazard with analytical and data examples"* → `uu_fa26/class_08/06_01_survival_and_hazard.ipynb` (**5 cells**)
- **In-class:** *"advanced examples + lab tie-in"*
- **Lab:** `uu_fa26/labslop/08_optimal_stopping/lab_08_optimal_stopping.ipynb` (24 cells) — **§1–4 only.** The spreadsheet says *"fixed horizons instead of doing optimal stopping — Cut"*
- **Companion page:** `labs/activity-optimal-stopping/index.html` — a prose walkthrough of the same lab, sections `#raw`, `#survival-hazard`, `#fixed-age`, `#myopic`, `#dynamic`, `#statics`
- **Schedule margin note:** *"censoring — how to deal with it? 5 year survival"*
- **Widget:** `labs/activity-hazard-shapes/index.html` — **built for this session**: one slider on the Weibull shape `k`, hazard and survival side by side, three regime presets

> **Read the learning objective literally: this is a consolidation session.** Five source cells looks alarmingly thin, and it isn't, because almost nothing here is new. `S(t) = 1 − F(t)` is the complement rule from Sep 1. `h(t) = f(t)/S(t)` is a conditional density — Sep 10's `f` over Sep 1's conditioning. The empirical survival function is `1 − F̂ₙ`, which is Sep 8's ECDF with the axis flipped. And the lab's empirical hazard has to be smoothed, which is Sep 15's KDE problem wearing a different hat.
>
> The session's job is to make four weeks of machinery pay off on one real dataset. Judge it by whether students recognize the parts, not by how much is new.

---

## 1. What students actually see

| Artifact | File | Status |
|---|---|---|
| Pre-class video | `class_08/06_01_survival_and_hazard` (5 cells, all markdown) | **cell 0's definition is wrong — §7** |
| In-class | "advanced examples + lab tie-in" | not written; §2 and §8 supply it |
| Instructor cells | — | to build |
| **Lab** | `labslop/08_optimal_stopping/lab_08_optimal_stopping.ipynb` §1–4 | **built and good — but its data is missing (§12)** |
| Board | — | `S`, `h`, the three worked hazards, Weibull, censoring |

**The lab is the strongest artifact of the week and it is already written.** Twenty-four cells on NASA C-MAPSS turbofan run-to-failure data: 100 simulated engines, each observed cycle by cycle until failure. Its six sections split cleanly, and the spreadsheet's "cut optimal stopping" instruction lands exactly at the seam:

| § | Content | Needs | This session? |
|---|---|---|---|
| 1 | Run-to-failure trajectories, failure-time histogram | nothing | ✅ |
| 2 | **Empirical survival function and hazard** | today's board | ✅ |
| 3 | **Fixed-age replacement**: scan `K`, minimize mean cost | grid search | ✅ ← "fixed horizons" |
| 4 | Myopic stopping: `h(age) × catastrophe ≥ operating value` | one-step algebra | ✅ |
| 5 | Dynamic stopping on an age grid | backwards induction | ✂ cut |
| 6 | Comparative statics | same | ✂ cut |

§1–4 need **no dynamic programming at all**. Cutting at §5 is the right call and it costs nothing today.

---

## 2. The content, from scratch

### The survival function

The CDF answers "what fraction have failed by `t`?" For lifetimes the more natural question is the complement — "what fraction are *still going*?" So define the **survival function**:

```
S(t) = p[T > t] = 1 − F(t)
```

That's it. It is the complement rule from Sep 1 applied to a time-to-event variable, and every property follows by flipping the CDF's: `S` is non-increasing, `S(0) = 1`, `S(∞) = 0`. It is also, read empirically, *the proportion of the population still alive at time `t`*.

**The empirical version is free.** `Ŝ(t) = 1 − F̂ₙ(t)` — Sep 8's ECDF, subtracted from one. Nothing new is estimated, so its unbiasedness and its `F(1−F)/n` variance transfer directly. Say this out loud; it's the clearest instance all semester of a new-looking object being an old one relabelled.

### The hazard rate

Now the genuinely new idea, and it's the reason survival analysis exists as a subject.

Ask: *given that it has survived to `t`, what is the chance it fails right now?* That's a **conditional** question, and conditioning means renormalizing by the probability of what you've conditioned on:

```
h(t) = f(t) / S(t) = f(t) / (1 − F(t))
```

Numerator: the density of failing at `t`. Denominator: the probability of being around to fail. Precisely,

```
h(t)·dt ≈ p[fail in (t, t+dt] | survived past t]
```

**Why this is the right object.** The density `f(t)` tells you how failures are distributed across *all* units from the start. The hazard tells you the risk faced by a unit *that is actually still running* — which is the only population you can act on. If you own a five-year-old engine, `f(5)` is not your risk; `h(5)` is.

That distinction is the whole session. It's also why `h` is the quantity the lab uses to make a decision.

### Three worked hazards

The video does these as questions. All three are correct as printed — I checked them numerically.

| Distribution | `F(t)` | `h(t) = f/S` | Shape |
|---|---|---|---|
| **Uniform** on `[0,1]` | `t` | `1/(1−t)` | increasing, → ∞ at `t=1` |
| **Exponential(λ)** | `1 − e^(−λt)` | `λ` | **constant** |
| **Logistic** | `1/(1+e^(−x))` | `F(x)` | increasing |

The uniform is the sanity check: if failure is certain by `t = 1` and you've survived to `0.99`, your instantaneous risk is enormous. The logistic works because `f = F(1−F)` for the standard logistic, so the `(1−F)` cancels — a pleasant piece of algebra worth showing.

**The exponential is the one that matters.** Its hazard is constant: `λ`, forever, regardless of age. That is **memorylessness** — a used component is exactly as good as a new one. Nothing wears out, nothing settles in. It's why the exponential is the null model for lifetimes, and why departures from a flat hazard are the interesting finding. Ask the room whether they'd expect a jet engine to be memoryless; the answer is obviously no, and that's the motivation for the next distribution.

### The Weibull

One parameter turns the hazard into any of the three stories:

```
F(t) = 1 − e^(−(βt)^k)        h(t) = kβ(βt)^(k−1)
```

- `k > 1` — **increasing** hazard. Wear-out. Engines, bearings, people past middle age.
- `k = 1` — **constant**. Reduces exactly to the exponential.
- `k < 1` — **decreasing** hazard. Infant mortality: manufacturing defects fail early, survivors are sturdy.

That's a lot of modelling range from one exponent, and it's why the Weibull is the default parametric lifetime model. Worth naming the real-world composite: many systems show a **bathtub curve** — decreasing hazard early (defects), flat in the middle (random shocks), increasing late (wear-out). No single Weibull does all three.

### Censoring

The schedule flags this: *"censoring — how to deal with it? 5 year survival."*

When the study ends, some units haven't failed. You don't know their lifetime `T`; you know only that `T > r`, where `r` is when you stopped looking. That's **right-censoring**, and it is **missing data** — the same MCAR/MAR/MNAR problem from Sep 1's wrangling, in a new costume.

The two obvious fixes are both wrong, and in the same direction:

- **Drop the censored units.** You keep only the ones that failed during the window, i.e. the short lifetimes. Your estimated survival is **too pessimistic**.
- **Treat `r` as the failure time.** You record every survivor as failing at the moment you stopped watching. Also **too pessimistic**.

Dropping data and keeping data both bias downward, which is a good moment to point out that "handle the missing values somehow" is not a strategy.

The correct move splits the information by what you actually observed: a unit that **failed** at `tᵢ` contributes its density `f(tᵢ)`; a unit still running at `r` contributes `S(r)` — the probability of lasting at least that long. That's the notebook's "two pieces," and it's genuinely all there is to it. (Assembling those pieces into an estimate is a likelihood, which this course reaches later if the second half schedules it. Naming the shape now is enough.)

**"5-year survival"** is exactly this: the reported statistic is `Ŝ(5 years)`, and it's reported *because* it's estimable from censored data — you don't need anyone's full lifetime to know they made it past five years.

---

### Reading

*Key in `README.md`. From `Reading-Roadmap.md` unless marked [Map] (= `prep/ds5030_syllabus_reading_map.pdf`).*

- **Primary** — **not in Wasserman, B&H, or Casella & Berger.** None of the three has a survival-analysis chapter. This is the roadmap's second flagged gap.
- **Fuller treatment** — **CASI Ch. 9**, *"Survival Analysis and the EM Algorithm,"* §9.1–9.4: life tables, Kaplan–Meier, the log-rank test, proportional hazards. A genuine full chapter, and the strongest reading for this session in any of the six books.
- **Intuition first** — **CASI §9.1's opening**, which starts from an actuary's plain problem — an insurance company must set rates for new policyholders without waiting fifty years to see how long people actually live — and lets the hazard rate fall out of that need *before* any formula. That is a better motivation than the one in the notebook.
- **Visuals for class** — **CASI Table 9.1**, a real insurance life table with hazard estimates `ĥ` and survival estimates `Ŝ` by age; **Fig. 9.1**, NCOG Kaplan–Meier curves; **Fig. 9.2**, the hazard function `h(t)` itself. **Spiegelhalter (full book) Fig. 6.7** — real post-surgery breast-cancer survival rates.
- **[Map] adds, for the lab** — **QE, "Job Search I: The McCall Search Model"** (`python.quantecon.org/mccall_model.html`) is the canonical worked optimal-stopping problem built by backward induction, with runnable Python. Relevant only if lab §5–6 are ever restored; it also makes any later DP session much easier.

---

## 3. The optimization view

- **Objective:** expected cost per engine as a function of a fixed replacement age `K` — planned maintenance, plus wasted remaining life if you replace early, plus catastrophe cost if it fails first
- **Argmin:** `K*`, the best fixed-age policy
- **Solved by:** **grid search** — scan `K` over the observed age range and take the minimum

This is §3 of the lab, and it's the purest grid-search argmin in the course so far: no calculus, no closed form, just evaluate the objective at every candidate and look at the curve. For a calculus-shy cohort that's not a compromise, it's the honest method — the objective is a messy expectation over an empirical distribution and has no closed form anyway.

It also makes the hazard *actionable* rather than descriptive. The whole point of `h(t)` is that it's the input to this decision.

---

## 4. Assumptions that make it work

| Claim | Assumption |
|---|---|
| `S(t) = 1 − F(t)` | None. The complement rule |
| `h(t) = f(t)/S(t)` is defined | `S(t) > 0`. Undefined once everything has failed |
| `Ŝ(t) = 1 − F̂ₙ(t)` is unbiased | Identically distributed — inherited from the ECDF |
| The empirical hazard is reliable at `t` | **Enough units still at risk at `t`.** Fails in the tail, always |
| Exponential ⟺ constant hazard | An exact equivalence, both directions. Memorylessness *is* constant hazard |
| Dropping censored units is OK | **Essentially never.** Biases survival downward |
| The fixed-age `K*` generalizes | The 100 observed engines represent future engines. It's an empirical optimum, so it inherits all the sampling variability of Sep 3 |

The last row is worth a sentence in class: `K*` is a **statistic**, computed from 100 engines, and a different fleet would give a different `K*`. That's Sep 3's whole lesson pointing at a decision rather than an estimate — and it's a natural bridge into Sep 22.

---

## 5. Concrete failure cases

**The empirical hazard falls apart in the tail, and the lab shows it.** Cell 9 says outright: *"The raw hazard is jagged because only 100 engines are observed."* By the oldest ages only a handful are still at risk, so the denominator is tiny and the estimate swings wildly. Cell 10's fix is a 15-wide centred rolling mean — **which is a smoothing bandwidth**. Same trade-off as Sep 15: too little smoothing and the hazard is noise, too much and you erase the wear-out trend you're trying to find. Point at this explicitly; it's an unplanned callback that lands perfectly two days later.

**The hazard is not a probability and can exceed 1.** The uniform's `h(t) = 1/(1−t)` passes 1 at `t = 0.5` and diverges. Same lesson as the density on Sep 10: it's a **rate**, per unit time. Students who accepted that for `f` will trip on it again for `h`.

**Censoring biases in one direction.** See §2 — both naive fixes make survival look worse than it is.

**Memorylessness is usually false.** Fitting an exponential to engine lifetimes asserts that a 200-cycle engine is as healthy as a new one. The lab's own data contradicts it — the empirical hazard rises with age. Good; that's the finding.

**`K*` is fit on the same data it's evaluated on.** The lab scans `K` over the 100 observed failure times and reports the minimizing cost, so the reported cost is optimistic. Nobody has taught train/test yet and it isn't on the schedule, but if a sharp student raises it, the answer is: yes, and that's a real problem with a name.

---

## 6. Five questions students will ask

**Q1. "Why not just use the density? Why do I need a hazard?"** Because they answer different questions and only one of them is actionable. `f(t)` describes how failures are spread across the *whole original population*, including units that already died. `h(t)` describes the risk faced by the units *still running* — which is the only group you can make a decision about. Concretely: if 90% of engines have already failed by cycle 300, `f(300)` is small simply because few are left to fail, while `h(300)` can be enormous. Owning a 300-cycle engine, the second number is yours.

**Q2. "Is the hazard a probability? Can it be bigger than 1?"** Not a probability, and yes it can. It's a rate per unit time: `h(t)·dt` is approximately a probability for small `dt`, but `h(t)` itself has units of 1/time and is unbounded. The uniform hazard `1/(1−t)` blows up as `t → 1`. This is exactly the density lesson from Sep 10 — the thing that must be bounded is a probability, and neither `f` nor `h` is one.

**Q3. "What's so special about the exponential having constant hazard?"** It means the process has **no memory**: the chance of failing in the next hour is the same whether the unit is brand new or ten years old. Nothing accumulates, nothing wears in. That's a strong claim, it's testable, and for most physical systems it's false — which is precisely why it's the useful null model. When you plot an empirical hazard and it isn't flat, you've learned something real about the mechanism: rising means wear-out, falling means defects burning off.

**Q4. "Why can't I just drop the units that hadn't failed yet?"** Because "hadn't failed yet" is not a random subset — it's exactly the long-lived ones. Dropping them keeps only the short lifetimes, and your survival curve comes out too pessimistic. Recording them as failing at the end of the study does the same thing for the same reason. The information a censored unit carries is real but partial: not *when* it failed, only that it lasted at least until `r`. The fix is to use that partial information rather than discard or fabricate it — failures contribute `f(tᵢ)`, survivors contribute `S(r)`.

**Q5. "How is this different from the ECDF we already did?"** Mostly it isn't, and noticing that is the point. `Ŝ(t) = 1 − F̂ₙ(t)` is literally the ECDF flipped, so unbiasedness and the `F(1−F)/n` variance carry over with no new work. **The hazard is the genuinely new object**, because it conditions on survival — and conditioning is the one operation the ECDF doesn't perform. That's the seam: same estimator, new question.

---

## 7. Bugs and simplifications in the material

### Verified

- **The survival function is defined incorrectly** — cell 0 writes `S(t) = 1 − F(T) = p[t ≥ T]`. Two problems. `F(T)` should be `F(t)` (capital `T` is the random variable). And `p[t ≥ T]` is `p[T ≤ t]`, which **is `F(t)`** — the opposite of the survival function, which is `p[T > t]`. I checked on exponential draws with `λ = 2.3`, `t = 0.5`: the notebook's expression gives **0.684**, the survival function is **0.316**. As written, the cell says `S(t) = F(t)` in the same line it defines `S(t) = 1 − F(t)`. It should read `S(t) = 1 − F(t) = p[T > t]`.
- **`(βx)^(k−1)` should be `(βt)^(k−1)`** — cell 3's Weibull hazard uses `x` where everything else uses `t`. The formula is otherwise correct (verified numerically).
- **"termiantes"** — typo in cell 1.

### Correct — verified numerically

All three worked hazards in cell 2 check out: uniform `1/(1−t)`, exponential constant at `λ`, and logistic `h = F` (which relies on `f = F(1−F)`, also true). The Weibull hazard is right apart from the `x`/`t` slip, and the `k > 1` / `k = 1` / `k < 1` reading of the shape is right.

### Simplifications

- **Five cells for five topics** means each is a paragraph. That is *appropriate* given the stated objective — but "advanced examples" and the lab tie-in are the schedule's own additions and neither exists yet. §2 and §8 supply them.
- **The hazard is never connected back to conditional probability explicitly.** It is `f(t)` renormalized by `p[survived]` — the same renormalization from Sep 1's `p[A|B] = p[A∩B]/p[B]`. Making that link is one sentence and it converts a new formula into an old operation.
- **The empirical survival function is never defined**, only the population one. The lab computes it in §2, so the definition should exist before students meet the code: `Ŝ(t) = 1 − F̂ₙ(t)`.
- **Censoring is named and then deferred** — "eventually, we'll break estimation into two pieces." Given the second half isn't scheduled yet, "eventually" may never arrive. §2 gives the two pieces in three lines; that's enough to close the loop honestly.
- **`06_02_optimal_stopping` is cut**, per the schedule. Worth knowing what's in it in case a student asks: value functions, the principle of optimality, and a Bellman equation. Two of its cells are truncated mid-sentence and one derivation divides an inequality by a bracket that may be negative without flipping the sign — so cutting it also avoids a broken derivation.

---

## 8. Delivery plan

**Modes:** 🟦 notebook (student copy) · 🟩 instructor cells (pre-written, never live) · ⬛ board · 🟨 HTML widget

| # | Step | Mode | Time | Notes |
|---|---|---|---|---|
| 1 | `S(t) = 1 − F(t)`, and `Ŝ = 1 − F̂ₙ` | ⬛ board | 4 min | **Lead with the consolidation.** Two lines, and one of them is Sep 8's ECDF flipped |
| 2 | `h(t) = f(t)/S(t)` as a **conditional** density | ⬛ board | 6 min | Link it explicitly to `p[A\|B] = p[A∩B]/p[B]` from Sep 1. The renormalization *is* the conditioning |
| 3 | Hazard is a rate, not a probability | ⬛ board | 2 min | `1/(1−t)` passes 1 at `t = 0.5`. Same lesson as the density |
| 4 | The three worked hazards | 🟦 notebook | 4 min | All correct as printed. Do the logistic live — the `(1−F)` cancellation is satisfying |
| 5 | **Exponential ⟺ memorylessness** | ⬛ board | 4 min | The session's one genuinely new conceptual idea. "Would you expect a jet engine to be memoryless?" |
| 6 | **Weibull: one exponent, three stories** | 🟨 widget | 5 min | `activity-hazard-shapes/index.html#widget` — drag `k`, watch the hazard tilt and the survival curve respond. Presets for the three regimes; the tint marks rising (orange) vs falling (green). **The session's one widget** |
| 7 | Censoring, and why both naive fixes fail | ⬛ board | 6 min | The schedule asks for this. Both biases point the same way — say why. Land on "5-year survival" |
| 8 | **Lab §1–4** | 🟦 notebook | rest | See below |

**Build cost: zero.** Step 6's widget is built; everything else is board work or the existing lab.

### The lab — jet engines, §1–4 only

1. **§1 Raw failure clock.** Run-to-failure trajectories for six engines, then a histogram of failure cycles. Concrete grounding: these are machines aging.
2. **§2 Empirical survival and hazard.** `Ŝ(t)` as a step function — *point out that it's the ECDF flipped* — then the empirical hazard, which is jagged. Cell 10 smooths it with a rolling mean. **Stop and name that as a bandwidth choice.**
3. **§3 Fixed-age replacement.** Scan `K`, plot mean cost against `K`, mark the argmin. This is §3 of these notes made real.
4. **§4 Myopic stopping.** Continue one more cycle if `operating_value > h(age) × catastrophe_cost`. One line of algebra, and it uses the hazard as a decision input.

**Stop at §4.** If anyone asks what §5 does, the honest answer is worth giving: the myopic rule ignores that continuing preserves the *option* to stop later, and accounting for that needs machinery this course hasn't built. That's a good place to leave a question open.

---

## 9. Look ahead

- **`K*` is a statistic, and Sep 22 is about the distribution of statistics.** A different fleet of 100 engines gives a different `K*`. Saying that today makes the sampling distribution feel necessary rather than academic — you've just made a *decision* out of an estimate, and you don't know how stable it is.
- **The bootstrap (Sep 24) answers the question this session raises.** "How much would `K*` move with different engines?" is precisely a bootstrap question, and the jet-engine data is a natural example to carry forward.
- **Censoring foreshadows likelihood.** Splitting the contribution into `f(tᵢ)` for failures and `S(r)` for survivors *is* building a likelihood. If the second half schedules MLE, this is the concrete case that motivates it.
- **The empirical-hazard smoothing is the KDE bandwidth problem**, two days after the KDE session. Unplanned, and free.
- **Weibull `k` is the first shape parameter** students meet — a parameter that changes the *qualitative* behaviour rather than the location or scale.

## 10. Looking back

- **Sep 1 gives two things**: the complement rule, which is `S = 1 − F` entire; and conditional probability, which is what the hazard's denominator does.
- **Sep 8 gives the ECDF**, and `Ŝ = 1 − F̂ₙ` inherits its unbiasedness and variance with no new derivation. This is the single clearest consolidation point of the session.
- **Sep 10 gives `f` and the "rate, not a probability" lesson** — both reused directly, the second one for `h`.
- **Sep 10 also gives the exponential distribution**, worked as one of the three named distributions. Today it becomes the memoryless one. If the exponential was done properly then, today is cheaper.
- **Sep 15 gives the smoothing problem** that §2 of the lab hits within ten minutes.
- **Sep 3 gives "a statistic is a random variable"**, which is what makes `K*` interesting rather than final.

---

## 11. Source map

- `class_08/06_01_survival_and_hazard.ipynb` — 5 cells, all markdown: survival function (0, **definition bug**), hazard rate (1), three worked examples (2, all correct), Weibull (3, `x`/`t` slip), censoring (4).
- `class_08/06_02_optimal_stopping.ipynb` — 10 cells. **Cut per the schedule.** Value functions, principle of optimality, Bellman equation; two cells truncated mid-sentence.
- `labslop/08_optimal_stopping/lab_08_optimal_stopping.ipynb` — 24 cells. §1 cells 4–6, §2 cells 7–10, §3 cells 11–13, §4 cells 14–16, §5 cells 17–19, §6 cells 20–23.
- `labslop/08_optimal_stopping/prep_optimal_stopping.py` — expects a C-MAPSS zip; see §12.
- `labs/activity-optimal-stopping/index.html` — a prose walkthrough of the same six sections (`#raw`, `#survival-hazard`, `#fixed-age`, `#myopic`, `#dynamic`, `#statics`). No interactive widgets, but it has presentation mode and reads well as a companion.
- **No HTML lecture exists for this class** — `labs/` has no `class-08`. This is the only session in the first four weeks without one.

## 12. Open questions

- 🔴 **The lab's data does not exist.** `prep_optimal_stopping.py` reads a NASA C-MAPSS zip from `data/`, and there is no `data/` directory anywhere in `uu_fa26`. The lab's first data cell (`pd.read_parquet(DATA / "fd001_train.parquet")`) will fail. Someone has to source the FD001 dataset and run the prep script before Sep 17. **This is the blocking item for this session.**
- **What are the "advanced examples"?** The schedule lists them for in-class time and none exist. The bathtub curve and the Weibull shape family (step 6) are my proposal; there may be a domain example you'd rather use.
- **Does censoring get more than one board pass?** The schedule flags it as an open question — *"how to deal with it? 5 year survival"* — and §2 gives the honest three-line answer. Whether it deserves a worked example depends on whether survival analysis returns later, which depends on the unplanned second half.
- ~~Should a hazard widget be built?~~ **Built:** `labs/activity-hazard-shapes/`. There is still no full `class-08` HTML lecture — the only session in Weeks 1–4 without one — but the widget covers the beat that needed it.
- **Is `06_02` deleted or archived?** If it stays in `class_08/` with that name, whoever ports Week 4 next will assume it's in scope.
