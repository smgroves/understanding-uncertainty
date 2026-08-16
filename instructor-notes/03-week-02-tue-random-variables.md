# Week 2, Tuesday (Sep 1) — Probability & Random Variables

- **Syllabus topic:** Random Variables
- **Day type:** Quiz / Math Day — **first quiz of the semester**, on Week 1 material
- **Sources:** `uu_fa26/Proposed schedule/Week 2/01_Tues_video_03_1_probability.ipynb` (13 cells), `03_Tues_guided_03_2_random_variables.ipynb` (11 cells), `04_Tues_activity_census_blank.ipynb` (25 cells)
- **Also:** `sp26/01_probability/00_probability.ipynb` (66 cells, much deeper); html `labs/class-03-probability/lecture.html`

> **This is the densest math day in the first half of the course**, and the guided notebook contains four full multi-line derivations (linearity of expectation, the variance shortcut, variance of a linear transform, and Bayes' rule). It is also the day the first quiz eats ten minutes. Plan the time deliberately — see §8.

---

## 1. What students actually see

| Artifact | File | Content |
|---|---|---|
| Quiz | — | First quiz, on Week 1 (wrangling, EDA, vectors, inner product). Handwritten, concept-driven |
| Pre-class video | `01_Tues_video_03_1_probability` | Dice, sets, probability spaces, events, additivity, complements, conditional probability, independence, conditional expectation, Bayes' rule |
| Guided notebook | `03_Tues_guided_03_2_random_variables` | Coin flip as a gamble, random variables, PMF, expectation, linearity, variance, variance of transforms |
| Activity | `04_Tues_activity_census_blank` | DC census wage data (PUMS). Compute E[X], V[X], then confront survey weights and conditioning |
| Board | — | The four derivations, and the `E[X] = p · X` connection back to Thursday |

**Both lecture notebooks are markdown-only again** (13 and 11 cells, zero code). Third session in a row. The activity has the code.

**The activity is the strongest artifact in Week 2 and it is genuinely well-built.** It uses real ACS PUMS microdata for DC — `WAGP` (wages), `ESR` (employment status), `AGEP`, `SEX`, `SCHL`, `MAR`, `OCCP`, `INDP`, `WKHP`, `WKWN` — and it walks students into four traps in sequence:

1. Compute a naive mean wage, then discover `ESR` means the denominator includes people who don't work.
2. Discover `PWGTP`, the survey weight — *"this one row stands in for approximately 47 real people in DC"* — so the unweighted mean is not a population estimate at all.
3. Notice that "filter to a subgroup, then average" **is** `p(A|B)`. Cell 13 says it outright: *"restrict to an event, renormalize, recompute expectation."*
4. Cells 21 and 23 ask for the male/female wage difference, then immediately ask whether it's a fair comparison and what else differs between the groups.

That last one is a conditional-expectation-versus-causation question landing in Week 2, seven weeks before Week 8 teaches it. Good — but know that you're opening it, and see §9 for how to close it honestly today.

---

## 2. The content, from scratch

### Probability spaces

A **probability space** is a triple `(𝒮, ℰ, p)`:

- `𝒮` — the **sample space**, the set of possible outcomes. For two dice, the 36 ordered pairs.
- `ℰ` — the set of **events**, which are subsets of `𝒮`. "The sum is even" is an event: it's a set of outcomes.
- `p` — a function from events to `[0,1]`.

`ℰ` isn't an arbitrary collection; it's closed under the operations you'd want: it contains `∅` and `𝒮`, and if `E` is an event so is `Eᶜ`, and if `E` and `F` are events so are `E ∪ F` and `E ∩ F`. (The formal name is a *σ-algebra*; the notebook doesn't use the term and doesn't need to. What matters is the intuition: **events are the questions you're allowed to ask.**)

Why the fuss? Because it separates two things students conflate: *outcomes* are what happens, *events* are what you can observe or bet on. That distinction is the entire content of the "Key Idea" cell later, and it's what makes random variables useful.

### The three rules

**Additivity.** Union becomes sum, minus the double-count:

```
p(E ∪ F) = p(E) + p(F) − p(E ∩ F)
```

If `E ∩ F = ∅` the correction vanishes. In general `p(E ∪ F) ≤ p(E) + p(F)`, so `p` is **sub-additive**.

**Finite additivity.** Iterate: for mutually disjoint `E₁,…,Eₙ`, `p(⋃Eᵢ) = Σp(Eᵢ)`.

**Complements.** `E` and `Eᶜ` are disjoint and cover `𝒮`, so `p(E) + p(Eᶜ) = 1`, giving `p(Eᶜ) = 1 − p(E)`. Trivial-looking and constantly useful — "at least one" problems are almost always easier as `1 − p(none)`.

### Conditioning

```
p[A | B] = p[A ∩ B] / p[B]
```

The framing to use is the notebook's: **information is renormalization.** Learning `B` happened doesn't change the world; it shrinks the set of possibilities from `𝒮` to `B`, and you rescale by `p[B]` so probabilities still sum to 1. The activity's cell 13 is the same operation in pandas: filter, then average.

**Independence.** `A` is independent of `B` if `p[A ∩ B] = p[A]·p[B]`. Equivalently `p[A|B] = p[A]` — knowing `B` tells you nothing about `A`. The multiplication form is better because it's symmetric and doesn't divide by zero.

**Bayes' rule.** Two lines: conditional probability gives `p[A∩B] = p[B|A]p[A]`; substitute into the numerator of `p[A|B]`:

```
p[A|B] = p[B|A] · p[A] / p[B]
```

Read as `posterior = likelihood × prior / marginal`. Note this is the *whole* derivation — Bayes' rule is not a new axiom, it's the definition of conditioning rearranged. Say that, because students often treat it as a separate mystical object.

### Random variables

A **random variable** is a function `X : 𝒮 → ℝ`. That's it. It assigns numbers to outcomes.

The notebook's device — and it's a good one — is **the gamble**. Flip a coin; heads pays +1, tails pays −1. Then `X(H) = +1`, `X(T) = −1`. The follow-up question in cell 1 is worth actually asking the room: *would you take the gamble at ±1? ±10? ±100? ±1000?* Expected value is 0 for all four, so anyone whose answer changes has just discovered that expected value isn't the whole story — that's risk aversion, and it's the honest motivation for why variance gets its own section.

**Why random variables help** (the "Key Idea" cell, and the conceptual heart of the day): the sample space is raw reality — outcomes can be temperatures, ice cream flavors, zebras. Once you fix `X`, you no longer have to track every conceivable event, only the events that produce distinct values of `X`. `X` **pushes the probability space forward onto the numbers.** The die example makes it concrete: betting on even-vs-odd means the only events you need are `∅`, `{1,3,5}`, `{2,4,6}`, `{1,…,6}` — four events instead of 2⁶ = 64.

**Probability mass function.** `p[X = x] = p[{s ∈ 𝒮 : X(s) = x}]` — the probability of the event that produces value `x`. If `X` takes values `x₁,…,x_L` then `Σₗ p[X = xₗ] = 1`.

Notation to say out loud: **capital `X` is the random variable, lowercase `x` is a value it takes.** Same relationship as `f` and `f(x)`. Students conflate these for weeks if nobody says it.

### Expectation and variance

```
E[X] = Σₗ pₗ xₗ           the population average, μ
```

Weight each value by its probability and sum. The physical image: if the values are masses on a line, `E[X]` is the center of mass. The notebook's pessimist/optimist framing (min vs max vs something between) is a nice way in.

**Linearity.** `E[a + bX] = a + b·E[X]`. The derivation is four lines and worth doing at the board because it's the first real proof of the semester and it's entirely mechanical: expand, split the sum, factor out constants, use `Σpₗ = 1`. Every step is one of those four moves.

A corollary the notebook flags: `E[X]` is *a number*, so `E[E[X]] = E[X]`. Trivial here; it's the seed of the tower property in Week 8.

**Variance.**

```
V[X] = E[(X − E[X])²] = Σₗ pₗ (xₗ − E[X])²
```

*Why squared?* The notebook's answer is good and worth reproducing: you want one number for "how spread out around the center," it must treat deviations above and below symmetrically, and it must not let positive and negative deviations cancel — which is exactly what raw deviations do (they sum to zero identically). Squaring or absolute value both fix the cancellation; squaring wins because it's smooth and differentiable, which matters once you start optimizing.

**The computational shortcut.**

```
V[X] = E[X²] − E[X]²
```

Derivation: expand `(X − E[X])²`, apply linearity, simplify. Four lines. Worth the board time — this identity gets used constantly, including in the derivation of `V[X̄ₙ] = V[X]/n` that Week 4 needs.

**Variance of a transform.** `V[a + bX] = b²·V[X]`. Two things to draw out: the `a` **cancels** (shifting doesn't change spread) and the `b` comes out **squared** (variance is in squared units). The notebook's closing line — `V[Y] ≠ a + b·V[X]` — is making exactly this point: variance is *not* linear, and that asymmetry with `E` is the thing to remember.

---

### Reading

*Key in `README.md`. From `Reading-Roadmap.md` unless marked [Map] (= `prep/ds5030_syllabus_reading_map.pdf`).*

- **Primary** — **AoS Ch. 1 + Ch. 2.** **B&H Ch. 1**, *"Probability and counting"* (naive vs. non-naive definitions, §1.3/§1.6) and **Ch. 3**, *"Random variables and their distributions."*
- **Supporting** — **B&H Ch. 2**, §2.3, Bayes' rule and the law of total probability.
- **Fuller treatment** — **C&B Ch. 1** (Probability Theory): the same axioms and conditional probability, slower and more rigorous.
- **Intuition first** — **G&S §1.1**, *"Simulation of Discrete Probabilities."* The book opens with simulation rather than axioms — build a weighted-outcomes model, run it, and only state the axioms afterward in §1.2. That ordering matches this cohort better than the axiom-first route.
- **Visuals for class** — **Spiegelhalter (full book)** Ch. 8: a simulation of the Chevalier de Méré dice problem, then expected-frequency trees for coin flips and for breast-cancer screening. The screening tree is the best available illustration of §6 Q4 (why `p[A|B] ≠ p[B|A]`).

---

## 3. The optimization view

- **Objective:** expected squared error of a single-number prediction `c` for random `X`: `E[(X − c)²]`
- **Argmin:** `c* = E[X]`, and the value at the minimum is exactly `V[X]`
- **Solved by:** closed form, via `E[(X − c)²] = V[X] + (E[X] − c)²`

This is Week 1 Tuesday's objective with the *process* in place of the *sample*, and it is worth two minutes at the board because of what the identity says: **variance is not merely "spread" — it is the best achievable mean squared error when you must predict `X` with one number.** The leftover `(E[X] − c)²` is the price of guessing the wrong center, and it is a squared bias.

That split — irreducible variance plus squared bias — is the bias–variance decomposition, arriving in Week 2 rather than Week 7, and it's the same decomposition that governs Week 3's bandwidth choice and Week 4's estimator quality. Neither notebook has it; it's three lines and it pays off four times.

---

## 4. Assumptions that make it work

| Claim | Assumption |
|---|---|
| `p(E ∪ F) = p(E) + p(F)` | `E ∩ F = ∅`. Without disjointness you must subtract the intersection |
| `p[A\|B]` is defined | `p[B] > 0`. Conditioning on a probability-zero event is undefined here (and needs real machinery in general) |
| `E[X] = Σ pₗ xₗ` | `X` takes **finitely many** values. Everything today is discrete; Week 3 replaces the sum with an integral |
| `E[X]` exists at all | The sum converges. For finitely many values it always does — the ways this fails arrive in Week 3 |
| `E[a + bX] = a + b E[X]` | Nothing. Linearity needs no independence and no assumptions whatsoever |
| `V[X] = E[X²] − E[X]²` | Nothing beyond both expectations existing. Pure algebra |
| `V[a + bX] = b²V[X]` | Nothing. `a` and `b` are constants — **not** random |
| Independence ⟹ `p[A∩B] = p[A]p[B]` | This is the *definition*, not a consequence |

The pattern worth naming: **almost nothing today requires assumptions.** Linearity and the variance shortcut are algebra. That changes in Week 4, where results start requiring i.i.d. Flag the contrast — it makes "i.i.d." land as a real restriction later rather than a ritual phrase.

---

## 5. Concrete failure cases

**Expected value is not what you should expect.** Roll a fair die: `E[X] = 3.5`, a value the die cannot produce. Students accept this in the abstract and then reason as if `E[X]` were a typical outcome. The ±1000 gamble question makes the same point from the other direction: `E[X] = 0` for all four gambles, and yet nobody is indifferent between them.

**Variance's units are uninterpretable.** `V[wage]` on the census data is in dollars-squared. This is why `sd` exists, and it's the same problem covariance has (Week 1 Thursday). Worth connecting.

**The census activity's real trap: the unweighted mean is wrong.** Cell 5 explains `PWGTP`, and it means the naive `df['WAGP'].mean()` is not an estimate of the average DC wage — PUMS oversamples some groups by design. The correct estimate is `(df.WAGP * df.PWGTP).sum() / df.PWGTP.sum()`. This is a **weighted expectation**, i.e. `Σ pℓ xℓ` with unequal `pℓ` — the day's formula applied to real data. Do this one live; it is the single best illustration in the activity of what `E[X] = Σ pℓ xℓ` actually means.

**Zero wages contaminate the mean.** `WAGP` includes people not in the labour force (`ESR = 6`), whose wage is 0. The mean of "wages" over everyone answers a different question than the mean over workers. This is cell 10's prompt and it's a conditioning problem, which is cell 12's point.

**`E[X] = 0` does not mean `X = 0`.** Comes up when someone tries to argue the fair coin gamble is "the same as" not playing.

**The male/female comparison (cells 21, 23).** The raw difference in mean wage conflates sex with occupation, hours, employment rate, and age. See §9 — this needs a deliberate answer today, not a deferral.

---

## 6. Five questions students will ask

**Q1. "Why do we need sample spaces and events? Can't we just assign probabilities to numbers?"** You can, and after today you mostly will — that's precisely what the random variable does for you. The reason to build the space first is that the *interesting* objects are events, not outcomes: "the sum is even" is a set of eleven outcomes, and you can't assign it a probability unless sets are the things probabilities attach to. The payoff is the "Key Idea" cell: once you have `X`, you can forget the space and work with the PMF. The scaffolding gets removed, but you need it once to see why the PMF is legitimate.

**Q2. "Why is variance squared instead of using absolute deviations?"** Both are real measures of spread, and mean absolute deviation is a perfectly respectable statistic. Squaring wins for three reasons: it's differentiable at zero (absolute value isn't, which matters the moment you optimize — Week 13), it makes the algebra work out so that `V[X] = E[X²] − E[X]²` and variances of independent variables add, and it corresponds to the squared-error loss that already gave you the mean. The honest summary: absolute deviation is more robust, squared deviation is more tractable, and the field standardized on tractable. Week 1's median/IQR pair is the robust alternative.

**Q3. "Why does `a` disappear from the variance but not the expectation?"** Because expectation is about *location* and variance is about *spread*, and shifting everything by `a` moves the location without changing any distance between points. Draw it: slide the whole distribution right by 5, and every deviation from the mean is unchanged. The `b²` has the same explanation from the other side — stretching by `b` multiplies every deviation by `b`, and variance measures *squared* deviations.

**Q4. "Is `p[A|B] = p[B|A]`?"** No, and this is the most consequential 'no' in the session. The standard example: `p[positive test | disease]` is high for a good test, but `p[disease | positive test]` can be low if the disease is rare. That gap is exactly what Bayes' rule quantifies, and the prior `p[A]` is what does the work. Worth a worked number if there's time — a test with 99% sensitivity and 99% specificity on a disease with 0.1% prevalence gives a positive predictive value of about 9%. Students find this genuinely startling, and it's the best possible advertisement for the formula.

**Q5. "Is the wage gap in the census data real?"** The difference in conditional means is real — it's in the data and you just computed it. What it *means* is a separate question, and the honest answer is that `E[wage | female] − E[wage | male]` compares two groups that also differ in occupation, hours worked, employment rate, and age, so it does not isolate the effect of sex. That is not a reason to dismiss the number: "women in DC earn less on average" is a true and important statement about the world. It's a reason to be precise about which claim you're making. The tools to separate these arrive in Week 8 (conditioning on more variables) and Week 11 (regression) — and even then, only partially.

---

## 7. Bugs and simplifications in the material

### Verified

- **`\begin{alignat*}{2}` is used throughout and it is fragile.** It appears in the video cell 8 (complements) and guided cells 8, 9, 10 (linearity, variance shortcut, variance of transforms). `alignat*` requires the `amsmath` extension and an argument; **MathJax in Jupyter often renders this as an error or drops the block silently.** Check every one of these cells renders before class — if they don't, switch to `\begin{aligned}...\end{aligned}`, which is the safe choice and needs no argument. Four of the day's most important derivations are inside these blocks.
- **`p[\text{data}}_\text{marginal}]` — brace typo**, video cell 12 (Bayes' rule). The closing brace is inside the bracket: `\underbrace{p[\text{data}}_\text{marginal}]` should be `\underbrace{p[\text{data}]}_{\text{marginal}}`. This will render wrong or fail. It's in the single most-photographed formula of the day.
- **`m(X) = \sum_{i=1}^n x_i` is missing its `1/n`** — `05_Thurs_video_04_1_learning_from_data` cell 2, in the definition of a *statistic*. Written as-is, the "sample mean" is the sum. That notebook is Thursday's (and may be scrapped — see the Week 2 Thursday file), but the same cell defines *parameter*, *statistic*, and *estimate*, so if you lift those definitions, fix this.
- **"Additivity" is misspelled "addivity"** in video cell 7. Cosmetic.
- **`\mathbb{V}[\bar{X}_n] $ vs process variance` phrasing**, `05_Thurs_video` cell 3, asks for the relationship between "sample variance `V[X̄ₙ]`" and "process variance `V[X]`" — but `V[X̄ₙ]` is the variance *of the sample mean*, not the sample variance `s²`. Two different objects, and the sentence conflates them. Relevant because Week 4 needs both.

### Simplifications

- **Everything is finite and discrete.** `E[X] = Σₗ pₗ xₗ` assumes finitely many values. This is the right choice for a first pass, and Week 3 replaces sums with integrals. Say it's a temporary restriction, or the integral looks like a new definition instead of the same one.
- **`p[A|B]` is defined without requiring `p[B] > 0`.** Fine at this level; just don't get caught claiming it always works.
- **Independence is defined for *events* only.** Independence of random variables — the version needed in Week 4 for i.i.d. and in Week 8 for joint densities — is not defined today. It's a genuine extension, not an obvious one.
- **Conditional expectation appears in video cell 11** as `E[X|B]` where `B` is an *event*. Week 8's `E[Y|X]` conditions on a *random variable*, which is a much bigger idea (the result is itself random). Today's version is the easy case. Don't let the shared notation hide that.
- **The variance "why squared" cell has a stray `θ`** — it says "deviations above and below θ" where everything else uses `E[X]` or `μ`. Minor, but it's an unintroduced symbol in a conceptual explanation.

---

## 8. Delivery plan

**Modes:** 🟦 notebook (student copy) · 🟩 instructor cells (pre-written, never live) · ⬛ board · 🟨 HTML widget

| # | Step | Mode | Time | Notes |
|---|---|---|---|---|
| 1 | **Quiz** | — | 10 min | First quiz, on Week 1 |
| 2 | Probability space, events | 🟦 notebook | 5 min | Video covered it. One line for `(𝒮, ℰ, p)`, one for why events matter, move on |
| 3 | `X : 𝒮 → ℝ`, die even/odd | ⬛ board | 4 min | 64 events collapse to 4. The day's conceptual payoff, and it's cheap |
| 4 | **The ±1 / ±1000 gamble** | 🟨 widget | 3 min | `class-03-probability/lecture.html#viz-coin-flip` — flip it, watch the average settle to 0. Then ask whether they'd play at ±1000. The session's one widget |
| 5 | `E[X] = Σ pₗ xₗ`, then linearity **derived** | ⬛ board | 5 min | First real proof of the semester. Four lines, four mechanical moves |
| 6 | `V[X]`, then `E[X²] − E[X]²` **derived** | ⬛ board | 5 min | Same four moves. Needed again in Week 4 |
| 7 | `V[a+bX] = b²V[X]` | ⬛ board | 3 min | State it, show the `a` cancelling. Don't do all five lines |
| 8 | The optimization view (§3) | ⬛ board | 3 min | `argmin E[(X−c)²] = E[X]`, minimum `= V[X]`. Three lines, four future payoffs |
| 9 | **Census activity — the `PWGTP` weighting** | 🟩 instructor cells | 35 min | The weighted mean must be pre-written; it's the step that must happen. Students fill the empty cells (9, 22, 24) |
| 10 | Wrap: the disease-test number (§6 Q4) | ⬛ board | 5 min | If it fits |

**Build cost: the `PWGTP` weighted-mean cells (~15 min), plus testing the census fetch.**

**Cut first:** step 7's full derivation, then the activity's male/female comparison — but cut that *cleanly* rather than raising it and running out of time. **Do not cut:** linearity, the variance shortcut, or the weighting.

**Time is tight: the quiz takes ten minutes off a 75-minute class, and there are four derivations plus an activity.** Recommended split: 10 quiz / 25 board / 35 activity / 5 wrap.

1. **Quiz** (10 min). Week 1 material.
2. **Board: probability space, then straight to random variables** (5 min). Do *not* re-teach the video. One line for `(𝒮, ℰ, p)`, one for why events matter, then move.
3. **Board: `X : 𝒮 → ℝ` and the die even/odd example** (4 min). 64 events collapse to 4. This is the day's conceptual payoff and it's cheap.
4. **Board: `E[X] = Σ pₗ xₗ`, then linearity, derived** (5 min). Do the four-line derivation properly. It's the first proof of the semester; how you treat it sets expectations for the rest.
5. **Board: `V[X]`, then the shortcut `E[X²] − E[X]²`, derived** (5 min). Also four lines, same four moves.
6. **Board: `V[a+bX] = b²V[X]`** (3 min). State it, show the `a` cancelling, don't do all five lines — refer them to the notebook.
7. **Board: the optimization view** (§3, 3 min). `argmin E[(X−c)²] = E[X]`, minimum value `= V[X]`. Three lines, four future payoffs.
8. **Activity** (35 min). Priority order: histogram → naive `E[X]`, `V[X]` → **the `PWGTP` weighted mean** (this is the one that must happen) → `groupby('ESR')` → the conditioning connection in cell 13.
9. **Wrap** (5 min): the ±1000 gamble question, and Q4's disease-test number if it fits.

**Cut first:** the full `V[a+bX]` derivation (step 6), then the male/female comparison (activity cells 21–23) — but if you cut that, cut it *cleanly* rather than raising it and running out of time.

**Do not cut:** the linearity derivation, the variance shortcut, or the `PWGTP` weighting.

---

## 9. Look ahead

- **`V[X] = E[X²] − E[X]²` is needed in three weeks.** Week 4's derivation of `V[X̄ₙ] = V[X]/n` uses it as its first move, and that derivation is already the "grueling part" by the source notebook's own admission. Make sure the shortcut is solid today.
- **Linearity of expectation is the workhorse of the entire back half.** It's the first step in `E[X̄ₙ] = E[X]` (Week 4), in `E[p̂] = p` (Thursday), and in every unbiasedness proof after. Today is the only day it gets derived.
- **`E[X] = p · X` is a dot product.** Thursday of Week 1 listed this as an application of the inner product before expectation existed. Today it exists — close the loop explicitly, one sentence. It costs nothing and it makes the course feel like one object.
- **The bias–variance seed (§3) pays off in Weeks 3, 4, and 7.** Plant the phrase "squared bias plus variance" today.
- **Bayes' rule returns in Week 15 Thursday**, in the open slot, as full Bayesian inference — and `sp26/04_conditioning_and_bayes/00_bayes.ipynb` already has that lecture written. Today is the only prior exposure. Tell them it's coming back; it makes the derivation feel like an investment.
- **Conditional expectation on an *event* (today) becomes conditional expectation on a *random variable* (Week 8).** That is a genuine jump — the answer stops being a number and becomes a random variable. Don't oversell today's version as the general case.
- **Independence of events (today) → independence of random variables (Week 4, for i.i.d.) → joint densities (Week 8).** Three escalating versions of one word. Naming the sequence now saves confusion in Week 4.
- **The census activity's conditioning question (cell 12–13) is Week 8's entire topic in embryo.** "Filter, then average" = `E[Y|X=x]`. Say the words "conditional expectation" today so October is a callback.

## 10. Looking back

- **Week 1 Tuesday** gave the *sample* mean and variance, `M(X)` and `V(X)`, as descriptions of data. Today gives the *population* `E[X]` and `V[X]` as properties of a process. **This is the single most important connection to draw**, and neither notebook draws it: same formulas, different objects — one computed from `n` observations with weights `1/n`, one defined over outcomes with weights `pₗ`. The `1/n` in the sample mean *is* the "each observation equally likely" probability. Say this explicitly and Week 4's estimator language has somewhere to attach.
- **Week 1 Tuesday's `1/n` variance convention** now looks deliberate: the population `V[X]` has no `n−1` anywhere, so the sample analogue with `1/n` is the natural match. The `n−1` correction arrives in Week 4 for a reason that doesn't exist yet.
- **Week 1 Thursday's inner product** is what `E[X] = Σ pₗ xₗ` is. See §9.
- **Week 1 Thursday's `cov = 0` ≠ independence** connects to today's definition of independence for events. Today's is the event version; the covariance version is Week 4 onward.

---

## 11. Source map

- `Week 2/01_Tues_video_03_1_probability.ipynb` — 13 cells, **all markdown**. Dice (2), sets (3), probability spaces (4), events (5), additivity (6), finite additivity (7), complements (8), conditional probability (9), independence (10), conditional expectation (11), Bayes' rule (12).
- `Week 2/03_Tues_guided_03_2_random_variables.ipynb` — 11 cells, **all markdown**. Coin flip (1), random variables (2), RVs over a probability space (3), PMF (4), **Key Idea (5)**, die example (6), expectation (7), linearity derivation (8), variance + shortcut derivation (9), variance of transforms (10).
- `Week 2/04_Tues_activity_census_blank.ipynb` — 25 cells. Code at 3 (data fetch, 34 lines), 7, 14, 15; **empty code cells at 9, 22, 24**; questions in markdown alert boxes at 6, 8, 10, 12, 16, 18, 20, 21, 23. Variable dictionary at cell 4, `PWGTP` explanation at cell 5.
- Originals: `class_03/03_1_probability.ipynb` (13 cells), `03_2_random_variables.ipynb`, `03_lab.ipynb`.
- **Much deeper source:** `sp26/01_probability/00_probability.ipynb` (66 cells) and `01_zoo.ipynb` (51 cells, named distributions). Use `00_probability` for your own reading — it's the same material at greater depth.
- Also: html `labs/class-03-probability/lecture.html` — same content in prose, with the Bayes' rule prior/likelihood/posterior annotation rendered cleanly (useful as a check on the broken LaTeX in video cell 12).
- Data: the activity **fetches census data over the network** on first run (cell 3 checks for `data.csv`, then downloads). Run it before class — if the endpoint is slow or down, thirty students hitting it simultaneously is a bad first minute.

## 12. Open questions

- **Does the census fetch in cell 3 still work?** It's a live network call to a Census endpoint. Test it, and consider shipping `data.csv` in the repo so the activity doesn't depend on the API being up.
- **Is there a Week 2 lab?** The `Week 2/` folder has video, guided, and activity but **no `Lab/` directory**, unlike Week 1. The syllabus promises a lab every Thursday. See the Week 2 Thursday file — this connects to the class_04/class_05 question.
- **Check every `alignat*` block renders.** Four key derivations depend on it. This is a five-minute check that prevents a bad twenty minutes.
- **Is the first quiz written?** It's Sep 1 and covers Week 1. `quizzes/` in the html repo is empty. Conventions for building it are in this repo's `CLAUDE.md` if useful.
- **How much of the video do you re-cover?** Thirteen cells of probability foundations is a lot to assume they absorbed. My recommendation in §8 assumes five minutes; if the cohort's set-theory background is weak, that's optimistic.
