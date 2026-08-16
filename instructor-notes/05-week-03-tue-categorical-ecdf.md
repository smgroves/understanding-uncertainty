# Week 3, Tuesday (Sep 8) — Categorical Variables / Indicator, and the ECDF

- **Schedule focus (F26_scheduling):** Categorical Variables/Indicator
- **Day type:** Quiz / Math Day
- **Pre-class video:** Bernoulli trials, one-hot encoding — *"moving through data types applying probability"* → `class_05/01_categorical_variables.ipynb` (17 cells)
- **In-class:** *"ECDF generating lecture and activity"* → `class_05/02_numeric_variables.ipynb` (13 cells). The schedule note asks: **"why are we starting with ECDF/CDF? Motivate it"**
- **Lab:** none listed for Tuesday
- **Widgets:** `labs/class-05-eda/eda.html` — `viz-onehot`; `lecture.html` — `viz-ecdf-drag`, `viz-ecdf`
- **Also:** html `labs/class-05-eda/lecture.html` covers both halves

> **This session is the payoff of Sep 3.** `class_05` uses *unbiased estimator* five times without ever defining it, and cell 7 says "we have already suffered a lot to derive the formula" about `V[X̄ₙ] = V[X]/n`. Both come from Learning from Data two days earlier — the term, and the result. Nothing here re-derives them; today spends them.
>
> **The two halves split naturally across the day:** the Bernoulli/one-hot material is the pre-class video, and class time goes to the ECDF. The schedule's own margin note is the right framing question — *why are we starting with ECDF/CDF?* — and §2 Part C answers it.

---

## 1. What students actually see

| Artifact | File | Status |
|---|---|---|
| Pre-class video | `Week 2/05_Thurs_video_04_1_learning_from_data` (18 cells) | ✅ in place; supplies estimator vocabulary + `V[X̄ₙ] = V[X]/n` |
| In-class | `class_05/01_categorical_variables` (17 cells, **all markdown**) | needs porting into `Week 2/`; cell 9 is an empty heading |
| Instructor cells | — | **to build.** The natural content is the simulation cell 9 promises |
| Activity | — | none; the simulation can serve as one |
| Lab | **missing** | `class_05/03_lab.ipynb` is 0 bytes |
| Board | — | Bernoulli `E` and `V`, then `p̂` and its variance |

**The video does real work this week.** It is not warm-up: it defines *parameter*, *statistic*, *estimate*, and *unbiased*, derives the sample mean as the argmin of mean squared error, and works all the way through `E[X̄ₙ] = E[X]` and `V[X̄ₙ] = V[X]/n` (cells 12–15, and the notebook itself calls that derivation "the grueling part"). If students skip it, the in-class session has no foundation. Worth saying so when you assign it.

Two concrete holes: **no lab exists**, and **cell 9 of the in-class notebook is a heading with nothing under it** — `## Simulation Example`, which would have been the one executable thing in a coding session. `class_05/scraps.ipynb` is 622 KB and may contain both.

---

## 2. The content, from scratch

The organizing question, and it's a good one: **a categorical variable produces labels, not numbers. How do you do probability to a label?** The answer is the indicator function, and everything else follows from it.

### Part A — The Bernoulli trial

Two outcomes. Assign `I(H) = 1`, `I(T) = 0`, with `p[I = 1] = p`. That assignment *is* a random variable — the simplest possible one — and `I` is called an **indicator function** because it reports whether a condition holds.

As a probability space: `𝒮 = {H, T}`, `ℰ = {∅, {H}, {T}, {H,T}}`, with `p(∅)=0`, `p(H)=p`, `p(T)=1−p`, `p(𝒮)=1`.

**Expectation**, straight from Tuesday's `E[X] = Σ pₗ xₗ`:

```
E[I] = p·1 + (1−p)·0 = p
```

The expectation of an indicator **is the probability of the event it indicates.** That sentence is the most useful thing in the session and it recurs for the rest of the course — every probability can be written as an expectation, which is *why* simulation works at all. Week 9's Monte Carlo is this identity and nothing else.

**Variance.** The notebook expands the definition directly, but there's a two-line route that reuses Tuesday's shortcut and is worth preferring: for a 0/1 variable, `I² = I`, so `E[I²] = E[I] = p`, and

```
V[I] = E[I²] − E[I]² = p − p² = p(1−p)
```

Note `p(1−p)` is maximised at `p = ½` and vanishes at `p = 0` or `1`: a coin you can't predict is the most variable, a certain outcome has no variance. That's a sanity check students can run themselves, and modelling that habit is worth the thirty seconds.

### Part A2 — The sample proportion

Because `I` is 0/1-valued, the sample **mean** of indicators is the sample **proportion**:

```
p̂ = (1/n) Σᵢ Iᵢ
```

This is the identity the whole session turns on: **a proportion is a mean.** Nothing new is being estimated, so every result about means transfers for free.

**Unbiasedness**, by linearity of expectation (Tuesday's derivation, doing work):

```
E[p̂] = E[(1/n) Σ Iᵢ] = (1/n) Σ E[Iᵢ] = (1/n) · n · p = p
```

So `p̂` is an **unbiased estimator** of `p` — on average across repeated samples, it lands on the truth. *Defined in the video, cell 2.*

**Variance**, using `V[X̄ₙ] = V[X]/n`:

```
V[p̂] = V[I]/n = p(1−p)/n
```

*Derived in the video, cells 12–15.* This is what "we have already suffered a lot to derive the formula" refers to.

The two facts together — unbiased, and variance shrinking at rate `1/n` — are the first complete statement in the course of what makes an estimator *good*, and they're the template for Weeks 4 through 6.

### Part B — Multinomial trials and one-hot encoding

Now `L` labels with probabilities `p₁,…,p_L`. The sample space is the set of labels; the event space is every subset, so `2^L` events — a lot. That's the motivation for indicators: you don't want to track `2^L` events.

**The general indicator:** `𝟙{C = ℓ} = 1` if `C = ℓ`, else `0`. A full set of these across all labels is **one-hot encoding** — `pd.get_dummies(df[var], dtype=int)`, or `drop_first=True` when the model has an intercept.

**Sample proportion of a label:** `p̂_ℓ = (1/N) Σᵢ 𝟙{cᵢ = ℓ}`.

And here is the move that collapses everything: **for a fixed label `ℓ`, the variable `𝟙{C = ℓ}` is just a Bernoulli trial** — either `C = ℓ` with probability `p_ℓ`, or it doesn't with probability `1 − p_ℓ`. So with no new derivation at all:

```
E[p̂_ℓ] = p_ℓ                 (unbiased)
V[p̂_ℓ] = p_ℓ(1 − p_ℓ)/n
```

The multinomial case required no new mathematics — only the recognition that collapsing `L` labels into "is it `ℓ` or not" turns any categorical into a Bernoulli. That recognition is the session's payoff, and the notebook flags it with a bare "(why?)" in cell 16 that's worth actually asking the room.

**One thing the notebook omits:** the `p̂_ℓ` across different labels are **not independent** — they sum to 1, so if one rises another must fall. Their covariance is `−p_ℓ p_m / n`. Don't derive it; just don't let students walk away believing the labels are independent Bernoullis jointly.

### Part C — The ECDF: a proportion with a moving event

Categorical variables were easy because every label recurs: count the labels, divide by `n`. Numeric variables break that — a value might occur exactly once, so `𝟙{xᵢ = x}` is almost always zero and a rugplot of raw values tells you nothing.

The fix is to change the question. Instead of *"is `xᵢ` equal to `x`?"* ask *"is `xᵢ` **at most** `x`?"*:

```
𝟙{xᵢ ≤ x} = 1 if xᵢ ≤ x, else 0
```

Average that indicator over the sample and you get the **empirical CDF**:

```
F̂ₙ(x) = (1/n) Σᵢ 𝟙{xᵢ ≤ x}
```

In words: *what proportion of the sample is at or below `x`?* Note what just happened — this is Sep 3 (Learning from Data)'s sample proportion, with the event "≤ x" in place of "= ℓ". Same machinery, new question.

Two properties, both forced by the definition: `F̂ₙ` is **non-decreasing** (moving `x` right can only capture more points) and it runs **from 0 to 1**. It's a step function that jumps by `1/n` at each observation.

**What it estimates.** The empirical question "what fraction of my data is below `x`?" has a population twin: "what is the probability that `X` is below `x`?" That is the **cumulative distribution function**:

```
F(x) = p[X ≤ x]
```

And the bridge between them is the identity from Sep 3 (Learning from Data) — the expectation of an indicator is the probability of its event:

```
E[𝟙{X ≤ x}] = F(x)
```

which makes the ECDF's unbiasedness a three-line calculation, and its variance free from the Bernoulli result:

```
E[F̂ₙ(x)] = F(x)                        (unbiased, by linearity)
V[F̂ₙ(x)] = F(x)(1 − F(x))/n            (it's a Bernoulli, per x)
```

**This is the payoff of Sep 3 (Learning from Data)**, and it's worth saying explicitly: you are not learning a new estimator today. You are applying the proportion results to a new event, and both properties come out for free.


### Why start with the ECDF? (the schedule's own question)

Because it is the **only** density-ish object you can estimate by pure counting — no bins, no bandwidth, no smoothness assumption, nothing to tune. That makes it the honest starting point: every later estimator in the course adds machinery, and the ECDF is the baseline that shows what the machinery buys you.

Three more reasons worth having ready:

1. **It reuses everything from today's first half.** `F̂ₙ` is a sample proportion; its unbiasedness and variance are the Bernoulli results with a new event. Nothing new is being learned, which is exactly why it goes here.
2. **The CDF always exists.** Discrete variables have no density; every random variable has a CDF. Starting from `F` means the definition never needs an exception.
3. **It's the object that converges.** Thursday's density is a derivative of `F`, and Week 4's KDE is a slope of `F̂ₙ`. The whole rest of the month differentiates the thing built today.

---

### Reading

*Key in `README.md`. From `Reading-Roadmap.md` unless marked [Map] (= `prep/ds5030_syllabus_reading_map.pdf`).*

- **Primary** — **AoS Ch. 2** (the Bernoulli/discrete catalog). **B&H Ch. 4, §4.4**, *"Indicator r.v.s and the fundamental bridge"* (p. 151) — the roadmap notes this is the most direct section-title match to a session anywhere in the six books. "The fundamental bridge" is B&H's name for `E[𝟙{A}] = p(A)`, which is this session's central identity.
- **Supporting** — **AoS Ch. 7** (Estimating the CDF), which is the ECDF half. **B&H Ch. 3, §3.3**, Bernoulli and Binomial (p. 100).
- **Fuller treatment** — **C&B Ch. 3**, *Common Families of Distributions* — the Bernoulli/binomial family with more derivation than Wasserman's catalog.
- **Intuition first** — **Spiegelhalter Ch. 1**, *"Getting Things in Proportion,"* pp. 19–28: builds the definitions of binary and categorical data entirely around the Bristol child-heart-surgery inquiry, and covers positive-vs-negative framing rather than starting from set notation.
- **Visuals for class** — **Spiegelhalter (full book)** Figs 1.2–1.3: the same hospital breakdown as a pie chart, then as a bar chart.
- **[Map] adds** — **AoS Ch. 7** is where the *plug-in principle* is introduced, which is the logic underneath most of the nonparametric statistics in this course.

---

## 3. The optimization view

- **Objective:** squared distance from the 0/1 indicator column to a single number `c`: `Σᵢ (𝟙{xᵢ = ℓ} − c)²`
- **Argmin:** the sample proportion `p̂_ℓ`
- **Solved by:** closed form — count the ones, divide by `n`

This is Week 1 Tuesday's box with 0/1 data substituted in, and the point of restating it is that **nothing new is happening.** Once students see `p̂` as a mean of indicators, every mean result transfers: unbiasedness today, the weak law in Week 9, the CLT in Week 6. That's why the indicator trick earns its keep — it stops proportions from needing a separate theory.

The video makes the same argmin point for the sample mean in cell 4, so the two land together: **the sample mean is the argmin of MSE, and a proportion is a sample mean.**

---

## 4. Assumptions that make it work

| Claim | Assumption |
|---|---|
| `E[I] = p` | None beyond the definition — Tuesday's `Σ pₗ xₗ` with two terms |
| `V[I] = p(1−p)` | None. Algebra |
| `E[p̂] = p` | **Identically distributed** — every `Iᵢ` has the same `p`. Independence is *not* needed |
| `V[p̂] = p(1−p)/n` | **Independent *and* identically distributed.** This one genuinely needs both |
| `𝟙{C = ℓ}` is Bernoulli | None. True for any label of any categorical |
| `p̂_ℓ` unbiased for `p_ℓ` | Identically distributed, as above |
| The `p̂_ℓ` are independent across `ℓ` | **False.** They sum to 1; covariance is `−p_ℓp_m/n` |

**Rows 3 and 4 are the most teachable thing in this table.** Unbiasedness needs only identical distribution; the variance formula needs independence too. That's the first time in the course where the two halves of "i.i.d." do different jobs, and one sentence at the board turns "i.i.d." from an incantation into a claim with content.

---

## 5. Concrete failure cases

**Correlated samples destroy `V[p̂] = p(1−p)/n`.** Poll five people in the same household about a voting intention and you don't have five independent draws. `p̂` is still unbiased; its *variance* is far larger than `p(1−p)/n`, so every confidence interval built from it is too narrow. This is the day's most consequential failure, because the formula keeps producing a confident-looking number. It's also Tuesday's census `PWGTP` problem seen from the variance side — ACS sampling is clustered by design, which is *why* survey statisticians compute design-based standard errors.

**`p(1−p)/n` at `p̂ = 0`.** Forty trials, zero successes. Then `p̂ = 0` and the estimated variance is `0·1/40 = 0` — perfect certainty that `p = 0`. Obviously wrong, genuinely well known (the fix is a Wilson or Agresti–Coull interval, not the plug-in one), and a good ninety seconds because it shows a formula failing at a boundary rather than in a contrived case.

**Rare labels.** A label occurring 0.1% of the time has expected count `0.001N`; on `N = 500` that's half an observation, so `p̂_ℓ = 0` in most samples. Immediately relevant — Tuesday's census data has `OCCP` and `INDP` with hundreds of categories.

**One-hot and the dummy trap.** Encoding all `L` labels *and* including an intercept makes the columns linearly dependent — they sum to a column of ones. That's what `drop_first=True` is for. The notebook gives the flag without the reason; the reason won't fully land until Week 11, but naming it now ("the columns would add up to the intercept") plants it.

**`pd.get_dummies` silently drops `NaN`.** By default missing values get no column, so a row with a missing label becomes all-zeros — indistinguishable from the dropped reference category if you also used `drop_first`. Connects straight back to Week 1's missing-value dummies; `dummy_na=True` is the fix.

---

## 6. Five questions students will ask

**Q1. "Why is `E[I]` equal to `p`? That looks like a coincidence."** It isn't, and it's the most useful identity in probability. Mechanically `E[I] = 1·p + 0·(1−p) = p`, but the general statement is what matters: **the expectation of an indicator is the probability of the event it indicates**, `E[𝟙{A}] = p(A)`. So any probability can be computed as an average — which is why you can *estimate* a probability by simulating and counting. That's Week 9's Monte Carlo in one sentence, and it's the bridge between probability as theory and proportion as something you compute from data.

**Q2. "What does 'unbiased' actually mean? Unbiased about what?"** Imagine drawing a fresh sample of size `n` many times, computing `p̂` each time, and averaging those values — that average converges to the true `p`. Unbiasedness is a statement about the estimator's behaviour *across hypothetical repeated samples*, not about the one sample you have; your particular `p̂` can be far from `p` and the estimator is still unbiased. Two additions, because they're the standard misconceptions: unbiased does **not** mean accurate (an estimator can be unbiased with enormous variance), and unbiased does **not** mean best (Week 4 shows a biased estimator can win on total error). The video defines the term; Week 4 interrogates it.

**Q3. "Why divide by `n` in `p(1−p)/n`?"** Because averaging reduces variance. Each `Iᵢ` has variance `p(1−p)`; averaging `n` independent copies gives `p(1−p)/n`. The general result `V[X̄ₙ] = V[X]/n` is in the video, cells 12–15. The consequence worth stating: the rate is `1/n` in variance and therefore `1/√n` in standard deviation, so **quadrupling your sample halves your error** — which is why data helps, and why it helps so slowly.

**Q4. "Why one-hot encode instead of numbering the labels 1, 2, 3, 4?"** Because numbering invents an order and a spacing that aren't in the data. Honda=1, Subaru=2, Ford=3, Audi=4 asserts that Subaru sits between Honda and Ford and that the Honda→Subaru gap equals the Ford→Audi gap. Anything that does arithmetic on that column will use those fabricated facts. One-hot says only "is it this label or not," which is all the data contains. The exception worth naming: if the labels genuinely *are* ordered — Tuesday's census `SCHL`, educational attainment — a single ordered number may be defensible, though the spacing is still an assumption.

**Q5. "If a proportion is just a mean, why does this get its own class?"** Because the fact that it's *just* a mean is the lesson, and it isn't obvious until someone shows you. Before the indicator trick, "what fraction of cars are red" and "what is the average mileage" look like different kinds of question needing different tools. After it, they're the same computation, and every theorem about means — unbiasedness today, the weak law in Week 9, the CLT in Week 6 — applies to proportions with no extra work. The class exists to install one reusable move, not one new formula.

---

## 7. Bugs and simplifications in the material

### Verified

- **Cell 7 states an expectation where it means a variance.** The heading is "Sample Variance," the prose asks "What is the variance of the sample average?", and the formula reads `E[p̄ₙ] = V[I]/n = p(1−p)/n`. It should be `V[p̂]`. As written it **contradicts cell 6**, which correctly derives `E[p̂] = p` — so a student comparing the two cells finds the course asserting both `E[p̂] = p` and `E[p̂] = p(1−p)/n`. Fix before teaching.
- **Notation drifts between `p̂` and `p̄ₙ`** for the same object (cell 6 uses `\hat{p}`, cell 7 uses `\bar{p}_n`). Pick `p̂` — it signals "estimator," which is the concept being introduced.
- **Cell 9 is an empty heading.** `## Simulation Example` with nothing under it, in the one session that's supposed to be a coding day.
- **`class_05/03_lab.ipynb` is 0 bytes**, and `Week 2/` has no `Lab/` folder.
- **In the video, `m(X) = \sum_{i=1}^n x_i` is missing its `1/n`** — cell 2, in the definition of a *statistic*. As written the "sample mean" is the sum. This is in the cell that defines parameter/statistic/estimate, which the in-class session depends on.
- **The video conflates two different objects in cell 3**: it asks for the relationship between "sample variance `V[X̄ₙ]`" and "process variance `V[X]`", but `V[X̄ₙ]` is the variance *of the sample mean*, not the sample variance `s²`. Both objects matter in Week 4, so the conflation is worth correcting now.

### Simplifications

- **i.i.d. is never stated as a condition.** Cells 6 and 7 derive `E[p̂]` and `V[p̂]` without naming what's assumed, and per §4 the two results need *different* assumptions. One line fixes it.
- **The `p̂_ℓ` are treated as separate Bernoullis** without noting they're jointly dependent. Fine for the derivations given; misleading if extrapolated.
- **`drop_first=True` is given without the reason.** See §5.
- **"the variance will very often include a term like `p(1−p)`"** (cell 5) is true and mysterious as phrased. The reason is `I² = I`, which gives `V[I] = p − p²` in one line via Tuesday's shortcut. That derivation is cleaner than the notebook's four-line expansion and it reuses Tuesday — consider swapping it in.

---

## 8. Delivery plan

**Modes:** 🟦 notebook (student copy) · 🟩 instructor cells (pre-written) · ⬛ board · 🟨 HTML widget

Thursday is a coding day, the notebook has no code, and there is no lab — so this session needs the most build work of any so far. What follows assumes you write the instructor cells; the board content works either way.

| # | Step | Mode | Notes |
|---|---|---|---|
| 1 | The indicator function, `E[𝟙{A}] = p(A)` | ⬛ board | 3 min. Two lines. The identity, not just the definition |
| 2 | Bernoulli `E[I] = p`, `V[I] = p(1−p)` | ⬛ board | 5 min. Use the `I² = I` route (§2) — two lines, reuses Tuesday |
| 3 | `p(1−p)` maximised at ½ | 🟩 instructor cell | 2 min. Plot `p(1−p)` on `[0,1]`. One line of matplotlib, far better than asserting it |
| 4 | A proportion is a mean: `p̂ = (1/n)Σ Iᵢ` | ⬛ board | 2 min. The session in one line |
| 5 | `E[p̂] = p`, derived | ⬛ board | 4 min. Pure linearity — say out loud that this is Tuesday's result doing work |
| 6 | `V[p̂] = p(1−p)/n` | ⬛ board | 3 min. Cite the video's derivation; don't redo cells 12–15 |
| 7 | **The missing simulation (cell 9)** | 🟩 instructor cells | **10 min. The highest-value build in this session** — see below |
| 8 | Multinomial collapses to Bernoulli | ⬛ board | 4 min. Ask cell 16's "(why?)" out loud |
| 9 | One-hot encoding | 🟨 widget *or* 🟩 cells | `labs/class-05-eda/eda.html#viz-onehot` shows 8 patients one-hot encoded live. Cheaper than building it, and it's the one idea here that benefits from being seen rather than described |
| 10 | Reference material: definitions, `get_dummies` syntax | 🟦 notebook | Leave in the student copy. Don't read it aloud |
| 11 | Lab | — | **Does not exist.** See below |

### Step 7 — what to build

Simulate `n` Bernoulli draws, compute `p̂`, repeat ~1000 times, histogram the `p̂` values, and overlay `p` and `±√(p(1−p)/n)`. About fifteen lines. It does three jobs at once:

1. Fills the gap cell 9 leaves in the only coding session of the week.
2. Makes "unbiased with variance `p(1−p)/n`" **visible** — the histogram centres on `p` and its spread matches the formula.
3. It *is* a sampling distribution, which is Week 4's entire topic, previewed concretely five weeks early.

Then run it at `n = 10` and `n = 1000` back to back so the `1/n` shrinkage is a picture rather than a claim.

### The lab

Nothing exists. The natural lab is step 7 extended: give them the simulation for a fair coin, then ask them to (a) vary `p` and confirm the variance formula empirically, (b) do the same for a multinomial with four labels and check `p̂_ℓ(1−p̂_ℓ)/n` per label, and (c) one-hot encode a real categorical from Tuesday's census data and interpret the column means. That reuses Tuesday's dataset, exercises today's two formulas, and needs no new material.

**If time runs short:** cut step 3 and step 9 (the widget). Do not cut step 7 — without it this is a lecture on a coding day.

---

## 9. Look ahead

- **Step 7's simulation is Week 4 Thursday's sampling distribution.** Build it today and Week 4 opens with "you already made one of these." That's the cheapest possible on-ramp to the hardest idea in the first half of the course.
- **`E[𝟙{A}] = p(A)` is the bridge to Monte Carlo (Week 9).** Estimating a probability by simulating and counting *is* this identity. Say the sentence today.
- **"Unbiased" is defined in today's video and interrogated in Week 4** (unbiased vs. consistent; when a biased estimator wins). Don't over-claim today that unbiased means good.
- **`p(1−p)` returns in Week 12's logistic regression** as the variance of the Bernoulli likelihood, and it's why logistic regression's weights look the way they do. Long fuse, worth lighting.
- **`p̂ ± z√(p̂(1−p̂)/n)` is Weeks 5–6.** Today supplies both ingredients; the `z` arrives with the CLT. Mention that today's formula is half of a confidence interval.
- **One-hot encoding returns in Weeks 11–12** as the design matrix, where `drop_first` stops being a convention and becomes a rank condition.
- **The i.i.d. split in §4** is the seed of Week 4's whole framework.
- **The video's argmin derivation (cell 4)** is the same optimization spine as Week 1 Tuesday, now applied to prediction rather than description. Two instances of one idea, a week apart — connect them.

## 10. Looking back

- **Sep 1 supplied the probability tools and Sep 3 supplied the estimator vocabulary**: `E[X] = Σ pₗ xₗ` gives `E[I] = p`, linearity gives `E[p̂] = p`, and `V[X] = E[X²] − E[X]²` gives the clean `V[I] = p(1−p)`. Framing today as *Tuesday's machinery applied to the simplest possible random variable* makes it feel like consolidation rather than new load — which is what a Thursday after a dense Tuesday should feel like.
- **Today's video is the bridge**, and it's doing more than a warm-up: parameter/statistic/estimate, unbiasedness, the sample mean as an argmin, and `V[X̄ₙ] = V[X]/n`. Everything in §2 after the Bernoulli basics leans on it.
- **Week 1 Tuesday already computed proportions** with `value_counts(normalize=True)` and `sns.countplot(stat='proportion')`. Today explains what that number *is*. Connect them — they computed it before they knew what it was.
- **Week 1 Tuesday's missing-value dummies are indicator functions.** Same object, name arriving two weeks late. One sentence closes it.
- **Tuesday's `groupby('ESR')`** was a multinomial with six labels, and those group proportions are today's `p̂_ℓ`.

---

## 11. Source map

- `Week 2/05_Thurs_video_04_1_learning_from_data.ipynb` — 18 cells. Generating processes (1), **parameter/statistic/estimate (2)**, learning from data (3), **sample mean as MSE argmin (4)**, the four-step ML framing (10), and **`V[X̄ₙ] = V[X]/n` derived in full (12–15)**. Cell 16 is an unfinished sample-covariance exercise; cell 17 is empty.
- `class_05/01_categorical_variables.ipynb` — 17 cells, **all markdown**. Variable and process (1), categorical variables (2), Bernoulli trial (3), as a probability space (4), `E` and `V` (5), sample average (6), **sample variance — has the bug (7)**, summary (8), **empty "Simulation Example" heading (9)**, multinomial (10–12), indicator variables (13), one-hot (14), sample proportion (15), properties (16).
- `class_05/02_numeric_variables.ipynb` — 13 cells: numeric variables, why raw plots fail, the rugplot. This leads into the ECDF, so it belongs to Week 3, not here.
- `class_05/03_lab.ipynb` — **0 bytes.**
- `class_05/scraps.ipynb` — 622 KB. Open it; the missing simulation and lab may be in there.
- `labs/class-05-eda/` — `viz-onehot` (one-hot encoding, 8 patients), plus `viz-ecdf-drag` and `viz-ecdf` which belong to Week 3.
- html `labs/class-05-eda/lecture.html` — the categorical half in prose, including the Bernoulli/multinomial/indicator development.

## 12. Open questions

- **Confirm the scrapping scope.** `class_04` is two notebooks and they are not interchangeable:
  - `04_2_random_number_generation.ipynb` (29 cells) — the actual RNG content (seeding, uniform generation, die rolls, simulation speed). **Dropping this costs this session nothing.**
  - `04_1_learning_from_data.ipynb` (18 cells) — **not RNG**, and it is this session's pre-class video. Dropping it removes the definition of *unbiased estimator* and the `V[X̄ₙ] = V[X]/n` derivation that the in-class notebook explicitly relies on.

  **Recommendation: drop `04_2`, keep `04_1` exactly where it is.**
- **Does dropping RNG cost anything later?** Two places to check: Week 9's Monte Carlo and Week 9 Thursday's Markov chain simulation both assume students can comfortably generate random draws. Neither needs RNG *theory* (LCGs, seeding internals), but both need the fluency. Worth confirming it comes from somewhere — possibly Week 2's lab, if step 7's simulation becomes it.
- **Who writes the lab, and is step 7 the right basis for it?** §8 has a concrete proposal.
- **What's in `scraps.ipynb`?** 622 KB is a lot to leave unexamined when the session is missing both its simulation and its lab.
- **Does `01_categorical_variables` get ported into `Week 2/` as `06_Thurs_guided_...`?** Week 1 used that numbering. Right now the in-class content still lives only in the old flat folder.
