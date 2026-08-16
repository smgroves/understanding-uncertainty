# Week 10, Tuesday (Oct 27) — The Likelihood Function

- **Syllabus topic (tentative):** The likelihood function · week theme *"Likelihood & MLE"*
- **Day type:** Quiz / Math Day
- **Primary source:** `uu_sp26/.../01_probability/02_moments_and_likelihood.ipynb` §3, cells 34–38 and 46–48
- **Thursday:** the maximization half — cells 39, 49–54
- **Data:** `./data/nhanes_data_17_18.csv` 🔴 **not in either repo** · `./data/metabric.csv` 🔴 **missing from `01_probability/data/`** (copies exist elsewhere — see §12)

> **Today defines the object; Thursday maximizes it.** That split is worth protecting, because the conceptual work is all here and the calculus is all there. A likelihood is a joint density read backwards — data held fixed, parameters varying — and if that flip lands today, Thursday is mechanical.
>
> **Students have already computed a maximum likelihood estimate and don't know it.** Oct 20's transition matrix — count the transitions from each state, divide by the total — *is* the MLE for a Markov chain. "Count and divide" isn't a convenient heuristic; it's what maximizing the likelihood produces. Worth saving for Thursday, once the machinery exists to show why.

---

## 1. What students actually see

| Artifact | File | Status |
|---|---|---|
| Quiz | — | On Week 9: Markov chains, transition matrices, forecasting |
| Pre-class video | `02_moments_and_likelihood` §3, cells 34–37 | needs porting; the derivations are `alignat*` again |
| In-class | cells 38, 46–48 — the normal and Bernoulli likelihoods | markdown; code cells belong to Thursday |
| Instructor cells | — | to build; the data paths need fixing first |
| Lab | none listed | — |
| Board | — | Product → log, the normal log-likelihood, the Bernoulli switching trick |

---

## 2. The content, from scratch

### Where models come from

The source opens well: *"OK, we have arrived: where do models come from?"* Everything until now has estimated things — a mean, a density, a transition matrix — by writing down a formula that seemed reasonable and checking it behaved. Maximum likelihood is the general machine that *produces* those formulas.

The recipe, stated once and repeated on Thursday:

1. Model the randomness explicitly with a parametric distribution.
2. Compute the joint density of observing the data you actually got — **the likelihood**.
3. Choose the parameters that maximize it.

Today is steps 1 and 2.

### The flip: probability read backwards

This is the conceptual centre of the session and everything else is bookkeeping around it.

A density `f(y; θ)` has two slots. Fix `θ` and let `y` vary, and it answers *"which data are likely?"* — that's a **probability** statement, and it's what the whole course has done so far. Now **fix `y` at the data you actually observed and let `θ` vary**:

```
L(θ) = f(y₁, …, yₙ ; θ)      — same formula, read as a function of θ
```

That's the **likelihood**. Same expression, opposite reading.

Say plainly what it is not: `L(θ)` is **not** the probability that `θ` is correct. `θ` isn't random in this framework — it's a fixed unknown. `L(θ)` measures how well each candidate `θ` explains the data you have. Making that explicit now prevents a whole class of confusion later, and it's the precise distinction a Bayesian treatment would relax.

### Why a product

If the observations are independent, the joint density factorizes:

```
L(θ) = f(y₁,…,yₙ; θ) = ∏ᵢ f(yᵢ; θ)
```

**That factorization is Oct 13's definition of independence, cashed in.** It isn't an approximation or a convenience — independence *is* the statement that the joint density is the product of the marginals, and it is the only reason a likelihood can be written down at all. Without it you'd need the full joint density of `n` dependent variables, which nobody has.

Worth flagging: this is where the i.i.d. assumption, carried since Sep 3, finally does visible work.

### Why the log

Take logs and the product becomes a sum:

```
ℓ(θ) = log L(θ) = Σᵢ log f(yᵢ; θ)
```

Two reasons, and the second is the one students don't anticipate:

- **Analytically**, derivatives of sums are easy and derivatives of products are miserable. Thursday needs derivatives.
- **Numerically**, a product of `n` numbers each below 1 underflows fast. With `n = 1000` and typical densities you are multiplying a thousand small numbers, and the result is `0.0` in floating point long before you finish. **The log-likelihood isn't a convenience — for real `n` it's the only version that survives.**

Since `log` is strictly increasing, the `θ` maximizing `ℓ` is the same `θ` maximizing `L`. Nothing is lost.

### The mean–error decomposition

The source's route into the normal case, and it generalizes: any random variable with mean `μ` and scale `σ` can be written

```
yᵢ = μ + σ εᵢ      ⟺      εᵢ = (yᵢ − μ)/σ
```

where `εᵢ` is a standardized shock. So the log-likelihood in terms of the shock density is

```
ℓ(μ, σ) = Σᵢ log f((yᵢ − μ)/σ)
```

This framing pays off later: it separates *the systematic part* (`μ`, which becomes `xᵢᵀβ` in regression) from *the noise part* (`σε`, whose distribution you choose). Nov 5's "least squares is MLE under normality" is exactly this decomposition with `μ` replaced by a line.

### Example 1 — the normal log-likelihood

Substitute the normal density and expand:

```
ℓ(μ,σ) = Σᵢ log[ (1/(√(2π)σ)) exp{ −(yᵢ−μ)²/(2σ²) } ]
       = Σᵢ [ −log√(2π) − log σ − (yᵢ−μ)²/(2σ²) ]
       = −n log√(2π) − n log σ − Σᵢ (yᵢ−μ)²/(2σ²)
```

**Look at the last term.** Everything that depends on `μ` sits in `−Σ(yᵢ−μ)²/(2σ²)` — a *negative* sum of squares. Maximizing the log-likelihood over `μ` therefore means **minimizing the sum of squared deviations**, which is Week 1 Tuesday's box.

That connection deserves a moment. Least squares was introduced in August as a reasonable-looking thing to minimize. It turns out to be what maximum likelihood produces when you assume normal errors. **Sum-of-squares was never arbitrary; it was a normality assumption in disguise.**

### Example 2 — the Bernoulli likelihood, and the switching trick

For binary `yᵢ ∈ {0,1}` with `p[yᵢ = 1] = p`, you need one expression covering both cases. The trick:

```
p^{yᵢ} (1 − p)^{1−yᵢ}
```

When `yᵢ = 1` this is `p¹(1−p)⁰ = p`. When `yᵢ = 0` it's `p⁰(1−p)¹ = 1−p`. **The exponents switch the terms on and off.** The source says *"this trick gets used so very often, please make sure you understand it,"* which is right — it recurs in logistic regression, in multinomial models, and anywhere a categorical outcome enters a likelihood.

So:

```
L(p) = ∏ᵢ p^{yᵢ}(1−p)^{1−yᵢ}
ℓ(p) = Σᵢ [ yᵢ log p + (1−yᵢ) log(1−p) ]
```

**That second line has another name.** Computer scientists call it the **binary cross-entropy**, and it is the standard loss function for binary classification in every ML framework. Negated, it's what a neural network minimizes.

For this cohort — ML concurrent, not prior — this is worth ten seconds of explicit signposting: *if your ML course tells you to minimize binary cross-entropy, it is telling you to maximize a Bernoulli likelihood. Same object, opposite sign, different vocabulary.* That's the kind of connection the syllabus means by "foreshadow."

---

### Reading

*Key in `README.md`. From [Map] (`prep/ds5030_syllabus_reading_map.pdf`); the detailed `Reading-Roadmap.md` stops at 10/1.*

- **Primary** — **AoS Ch. 9** (Parametric Inference). [Map] calls this *"the essential reading — the chapter that formalizes everything in writing your own likelihood function."*
- **Applied companion** — **QE, "Maximum Likelihood Estimation"** (`intro.quantecon.org/mle.html`), which hand-derives likelihoods for several distributions against real economic data (a wealth-tax revenue example). [Map] rates it *"about as close a match to this specific week as anything in the whole reading list."*
- **Also relevant** — **C&B Ch. 6–7** for the fuller treatment of likelihood and point estimation, if you want more derivation than Wasserman gives.
- **Worth knowing** — [Map]'s Markov-chain entry observes that empirical transition proportions **are** the MLE for a transition matrix. That's last week's session, retroactively explained by this one.

---

## 3. The optimization view

- **Objective:** the log-likelihood `ℓ(θ) = Σᵢ log f(yᵢ; θ)` — *how well does each candidate `θ` explain the data I have?*
- **Argmax:** Thursday's topic. Today only builds the objective.
- **Solved by:** Thursday — closed form where it exists, numerically where it doesn't

**Today is the first session where the objective is the whole content and the argmax is deferred**, and that's a good shape for it. Every previous optimization box in this course had an argmin students could compute in a line. Here the objective takes a full session to construct.

Note the sign convention students will meet in their ML course: **maximizing a log-likelihood is minimizing a loss.** Negative log-likelihood *is* the loss function. Same optimization, flipped.

---

## 4. Assumptions that make it work

| Claim | Assumption |
|---|---|
| `L(θ) = ∏ᵢ f(yᵢ; θ)` | **Independence.** Without it the joint density doesn't factorize and there's no likelihood to write |
| All `yᵢ` share the same `f` | **Identically distributed.** The other half of i.i.d. |
| The parametric family is right | **A modelling assumption, and the biggest one here.** MLE finds the best member of the family you chose; it cannot tell you the family was wrong |
| `log L` and `L` have the same argmax | `log` is strictly increasing. Always true |
| `ℓ` is differentiable | Needed Thursday, not today. Fails for some families |
| `L(θ)` measures belief in `θ` | **False.** `θ` is fixed and unknown; the likelihood is not a probability over it |

**Row 3 is the one to say out loud.** Every likelihood in this course starts *"assume the data are normal"* or *"assume Bernoulli,"* and MLE optimizes within that assumption with no ability to question it. Comparing against a nonparametric alternative — the KDE from September — is how you check, and the source's own conclusion lists exactly that.

---

## 5. Concrete failure cases

**Numerical underflow.** With `n = 1000` and per-observation densities around 0.1, `L` is about `10⁻¹⁰⁰⁰` and evaluates to exactly `0.0` in double precision. Every candidate `θ` gives zero, and the optimizer has nothing to work with. This is not a corner case — it's the default outcome of computing `L` rather than `ℓ`, and it's worth demonstrating in two lines because it makes "take logs" a necessity rather than a stylistic preference.

**Dependent data.** Time series, repeated measures, clustered samples: the product form is simply wrong. The likelihood you write down isn't the likelihood of your data, and every estimate and standard error inherits the error. Fifth appearance of this theme.

**Zero likelihood from a single impossible observation.** One `yᵢ` with `f(yᵢ; θ) = 0` sets the entire product to zero regardless of how well `θ` explains everything else. It's the same structural fragility as an unseen transition in Oct 20's chain, and it's why smoothing exists.

**Wrong family, confident answer.** Fit a normal to visibly skewed data and MLE returns a perfectly well-behaved `μ̂` and `σ̂` with no complaint. The estimates are the best *normal* description of non-normal data. The source's NHANES example is honest about this — it takes `log` of blood lead first, precisely because the raw variable isn't normal.

**Reading the likelihood as a probability distribution over `θ`.** It doesn't integrate to 1 over `θ` and isn't meant to. See §6 Q1.

---

## 6. Five questions students will ask

**Q1. "What's the difference between likelihood and probability?"** They're the same formula read in opposite directions. `f(y; θ)` with `θ` fixed and `y` varying is a probability density: it tells you which data are likely, and it integrates to 1 over `y`. The *likelihood* fixes `y` at the data you actually observed and lets `θ` vary: it tells you which parameter values explain what you saw. It does **not** integrate to 1 over `θ`, and it is not the probability that `θ` is correct — in this framework `θ` isn't random at all, it's a fixed unknown. "The likelihood of `θ`" is shorthand for "the probability of my data, if `θ` were true."

**Q2. "Why multiply the densities together?"** Because that's what independence means. Oct 13 defined independent random variables as those whose joint density factorizes into the product of the marginals — and the joint density of your whole dataset is exactly what a likelihood is. So the product isn't a simplification; it's the definition, applied. If the observations aren't independent, you can't write the likelihood this way, and most of what makes MLE tractable disappears.

**Q3. "Why take the log? Doesn't that change the answer?"** It doesn't, because `log` is strictly increasing — whatever maximizes `L` also maximizes `log L`, since the ordering of values is preserved. The reasons to do it are that derivatives of sums are far easier than derivatives of products, which matters on Thursday, and that products of many small numbers underflow to exactly zero in floating point. With a thousand observations the raw likelihood is often `10⁻¹⁰⁰⁰`, which a computer stores as `0`. The log-likelihood is the only version that's computable.

**Q4. "Where does `p^y (1−p)^(1−y)` come from? It looks like a trick."** It is a trick, and a good one. You need a single algebraic expression that gives `p` when `y = 1` and `1−p` when `y = 0`, because a likelihood is a product over all observations and you can't write an `if` statement inside a product. Exponents do the switching: anything to the power 0 is 1, so the "wrong" factor disappears each time. The same device handles any categorical outcome — `∏ₗ pₗ^{𝟙{y=ℓ}}` for `L` labels — and you'll see it again in logistic and multinomial models.

**Q5. "Is this related to the loss functions in my ML course?"** Directly, and it's worth knowing before your ML course tells you otherwise. The Bernoulli log-likelihood `Σ[y log p + (1−y)log(1−p)]` is exactly what's called **binary cross-entropy**, and minimizing negative log-likelihood is what "minimizing the loss" usually means. Squared-error loss is the normal likelihood; cross-entropy is the Bernoulli likelihood. So most standard loss functions aren't arbitrary design choices — they're likelihoods under a distributional assumption, with the sign flipped. That's a much better mental model than treating them as a menu.

---

## 7. Bugs and simplifications in the material

### Verified

- 🔴 **Both data files are missing from where the notebook expects them.** Cell 40 loads `./data/nhanes_data_17_18.csv` and cell 50 loads `./data/metabric.csv`, but `01_probability/` has no `data/` directory. **`nhanes_data_17_18.csv` does not exist anywhere in either repo.** `metabric.csv` exists in three other places (`uu_fa26/class_02/`, `sp26/00_understanding_data/data/`, `sp26/02_modeling_simulation_inference/data/`) and just needs copying. There's a `get_data.py` in `01_probability/` that may fetch NHANES — worth checking.
- **`alignat*` again**, in cells 38, 39, and 49 — the three main derivations. Same MathJax fragility as every prior session; check they render before recording.
- **Cell 54's conclusion is truncated**: *"The likelihood is a joint density, expressing the relative "* — it stops mid-sentence, in the summary cell.
- **Cell 36 says "standard error `σ`"** where it means standard *deviation*. Given Sep 29 spent a session distinguishing those two, this will land badly. It's `σ`, the scale of the shock, not the standard error of an estimate.
- **Cell 50's recoding looks inverted.** It maps `'0:LIVING' → 1.0` and `'1:DECEASED' → 0.0`, so `p̂` is the proportion *surviving* while the column is named "Overall Survival Status" with a 1-prefix meaning deceased. Defensible, but the sign convention should be stated or a student will read `p̂` backwards.

### Simplifications

- **"Likelihood vs. probability" is never stated explicitly.** The source builds the likelihood correctly but never pauses on the flip, which is the session's central idea. §2 supplies it.
- **The underflow motivation for logs is absent.** The source takes logs "because addition is more convenient than multiplication" — true, and it undersells the real reason. See §5.
- **The connection to least squares isn't drawn.** Cell 38 derives the normal log-likelihood and its `μ`-dependent term *is* a negative sum of squares, but the notebook doesn't say so. That's the single best available link back to Week 1, and it's one sentence.
- **Cross-entropy is named and dropped** (cell 48). For a cohort taking ML concurrently this is worth thirty seconds rather than a parenthetical.
- **The exponential example is promised and missing.** Cell 53 refers to *"the normal, exponential, and Bernoulli examples"*, but only normal and Bernoulli appear. The exponential is a clean third case — one parameter, `λ̂ = 1/ȳ` — and it connects to Sep 17's hazard material.

---

## 8. Delivery plan

**Modes:** 🟦 notebook (student copy) · 🟩 instructor cells (pre-written, never live) · ⬛ board · 🟨 HTML widget

| # | Step | Mode | Time | Notes |
|---|---|---|---|---|
| 1 | **Quiz** | — | 10 min | Week 9: transition matrices, forecasting, steady state |
| 2 | Where models come from | ⬛ board | 3 min | The three-step recipe. Today is steps 1–2 |
| 3 | **The flip: `f(y;θ)` read backwards** | ⬛ board | 6 min | **The session's whole idea.** Same formula, fix `y`, vary `θ`. And say what it is *not* |
| 4 | Independence ⟹ product | ⬛ board | 4 min | Oct 13's factorization, cashed in. i.i.d. finally does visible work |
| 5 | **Why logs — including underflow** | 🟩 instructor cell | 4 min | Compute `L` for `n = 1000` and print `0.0`. Two lines, and it makes logs necessary rather than tidy |
| 6 | The mean–error decomposition | ⬛ board | 3 min | `yᵢ = μ + σεᵢ`. Sets up Nov 5 |
| 7 | **The normal log-likelihood** | ⬛ board | 7 min | Expand it fully. Then stop at the `μ` term: **maximizing it is minimizing a sum of squares** |
| 8 | **Least squares was a normality assumption** | ⬛ board | 3 min | Not in the source. Best callback available to Week 1 |
| 9 | **The Bernoulli switching trick** | ⬛ board | 5 min | `p^y(1−p)^(1−y)`. Check both cases explicitly, as the source insists |
| 10 | **Cross-entropy is this** | ⬛ board | 3 min | For a cohort in ML *right now*: minimize BCE = maximize Bernoulli likelihood |
| 11 | Set up Thursday | ⬛ board | 2 min | We have the objective. Thursday we maximize it |

**Build cost: step 5 (~10 min).** Everything else is board work.

**Do not cut** steps 3, 7, or 8. **Cut first:** step 6, then step 10 if time is gone — though step 10 is cheap and lands hard with this cohort.

---

## 9. Look ahead

- **Thursday maximizes today's objective**, and the answers are all sample analogues: `μ̂ = ȳ`, `σ̂² = (1/n)Σ(yᵢ−ȳ)²`, `p̂ = ȳ`.
- **Thursday closes the `n` vs `n−1` loop** that Week 1 opened. The MLE for `σ²` uses `1/n` and is *biased* — the `n−1` correction is a deliberate departure from maximum likelihood. That thread has been open since August.
- **Nov 5's linear regression is step 6 with `μ` replaced by `xᵢᵀβ`.** "Least squares = MLE under normality" is step 8 generalized, and AoS Ch. 13 states it directly.
- **Nov 10's logistic regression is step 9 with `p` replaced by a function of `x`.** The switching trick and cross-entropy both carry over unchanged.
- **Oct 20's transition matrix was already an MLE.** Save the reveal for Thursday, when maximizing is on the board.
- **Bootstrapping the MLE** (Thursday) is how you get standard errors for parameters with no closed-form SE — Sep 29's §6 Q2, answered in general.

## 10. Looking back

- **Oct 13's independence** is what makes the product legitimate. This is its payoff.
- **Sep 3's i.i.d.** finally does visible work: identical distribution gives one `f`, independence gives the product.
- **Week 1 Tuesday's sum of squares** reappears inside the normal log-likelihood — step 8.
- **Sep 8's indicator trick** is the ancestor of the Bernoulli switching device: both encode a categorical outcome arithmetically so it can be summed or multiplied.
- **Sep 10's named densities** are the raw material — the normal, exponential, and logistic all get likelihoods.
- **Sep 15's KDE** is the nonparametric alternative the source's conclusion recommends comparing against.

---

## 11. Source map

- `sp26/01_probability/02_moments_and_likelihood.ipynb` §3 — cells 34–54. **Today: 34–38, 46–48.** Estimating models (35), **the likelihood with mean–error decomposition (36–37)**, **the normal log-likelihood (38)**, binary outcomes (46), **the Bernoulli switching trick (47)**, **the likelihood and cross-entropy (48)**. Thursday: 39–45, 49–54.
- §1 of the same notebook (cells 3–17) is recap — expectation, variance, indicators, ECDF→CDF, KDE→PDF. Cell 12's *"the expectation of an indicator is the probability"* is the identity underneath both today's Bernoulli case and Sep 8.
- Data: `./data/nhanes_data_17_18.csv` and `./data/metabric.csv` — see §7 and §12.
- **No `uu_fa26` material and no HTML lecture exist for this session.**

## 12. Open questions

- 🔴 **Fix the data before Thursday, since Thursday's code cells need it.** Copy `metabric.csv` into `01_probability/data/` (three copies exist elsewhere). For NHANES, check whether `01_probability/get_data.py` fetches it; if not, the blood-lead example needs a substitute — any right-skewed continuous variable will do, and `cville_cars.csv` prices would work with the same `log` transform.
- **Add the exponential example** promised by cell 53 and never delivered. One parameter, `λ̂ = 1/ȳ`, and it links back to Sep 17's constant hazard.
- **Is there a lab or activity this week?** Nothing listed either day. Thursday's fitted-model material (predict, simulate, bootstrap) is the natural basis.
- **Does the quiz cover Markov chains?** They were taught the week before with a broken simulation demo — worth checking what students actually saw before quizzing it.
- **Fix cell 36's "standard error"** → standard deviation, and state cell 50's survival recoding explicitly.
