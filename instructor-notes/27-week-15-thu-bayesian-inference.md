# Week 15, Thursday (Dec 3) — Bayesian Inference

- **Syllabus:** *blank.* This slot has no assigned topic
- **Day type:** Lab / Coding Day
- **Proposed source:** `uu_sp26/.../04_conditioning_and_bayes/00_bayes.ipynb` **§2, cells 37–49** — a complete, written Bayesian lecture
- **Script:** `00_bayes_pymc.py` in the same folder — the housing-prices example
- **Dependency:** `pymc` for the computational half ⚠ not a standard install
- **This is the last content session.** Dec 8 is review; Dec 10 is the final

> **The strongest available use of an empty slot: the lecture is already written.** `00_bayes.ipynb` §2 is thirteen cells covering priors and posteriors, Bayes' rule for densities, the Beta–Bernoulli conjugate case, PyMC, MLE-versus-Bayesian, and a genuine course conclusion. Almost nothing needs authoring.
>
> **And three threads close here.** Sep 1 derived Bayes' rule for events and promised it would return. Oct 29's optional MAP step was the bridge. Nov 24 showed ridge regression *is* a Gaussian prior. Today those become one thing — and the source's own cell 46 supplies the best callback in the course: computational Bayes gives you a *sample* from the posterior, and then **"it's KDE/ECDF all the way down."**

---

## 1. What students actually see

| Artifact | File | Status |
|---|---|---|
| Pre-class video | `00_bayes` §2 cells 38–43 | needs porting; otherwise complete |
| In-class | cells 44–49 + `00_bayes_pymc.py` | ⚠ needs `pymc` |
| Instructor cells | `00_bayes_pymc.py` | exists; verify it runs |
| Lab | — | none. §8 proposes the conjugate updater |
| Board | — | Prior → posterior, the Beta–Bernoulli update, MAP as the mode |

**Unusually well-resourced for a from-scratch slot.** §1 of the same notebook (joint, marginal, conditional distributions) was already used on Oct 13–15, so students have met the machinery; today is §2 only.

---

## 2. The content, from scratch

### The one difference that generates everything else

**Frequentist:** parameters like `μ` and `p` are **fixed unknowns**. Randomness lives in the data, and you reason about parameters by asking what data they'd produce — which is the sampling distribution, and why a confidence interval is a statement about the *procedure*.

**Bayesian:** parameters are **random variables**. You have beliefs about them before seeing data (the **prior**), and data updates those beliefs (the **posterior**).

That single move changes what you're allowed to say. Sep 24 was emphatic that a 95% confidence interval does *not* mean "95% chance the parameter is in here." **A Bayesian credible interval does mean that** — because in that framework the parameter has a distribution. Worth putting the two side by side; it's the cleanest way to show the frameworks answer different questions rather than one being a better version of the other.

### Bayes' rule for densities

Sep 1 derived it for events. The density version is the same two steps, and the source's cell 40 makes a nice observation — **you use the definition of conditional probability twice**: once to write the posterior as a ratio, once to turn the joint into the reverse conditional.

```
                  L(x, β) · f_β(β)
f[β | X = x]  =  ──────────────────
                      f_X(x)
```

with the parts named:

```
posterior  =  likelihood × prior / marginal
```

The **marginal** `f_X(x) = ∫ L(x,β')f_β(β')dβ'` is just the probability of the data averaged over every possible parameter value. It doesn't depend on `β`, so it's a normalizing constant — which is why so much Bayesian work is done with `posterior ∝ likelihood × prior` and the denominator quietly ignored.

**Notice what's carried over unchanged: the likelihood.** Oct 27 built it, Oct 29 maximized it, and today it appears again — multiplied by a prior instead of maximized alone. The source's framing is right: *"we're combining our frequentist approach with an additional piece."*

### The Beta–Bernoulli example, worked

The classic, and worth doing by hand because the algebra is genuinely short.

Data are `{0,1}` draws with `p[y] = p^y(1−p)^{1−y}`. Now `p` is random with a **Beta prior**:

```
π(p) = c · p^{α−1}(1−p)^{β−1}
```

Multiply prior by likelihood, with `k = Σyᵢ` successes in `n` trials:

```
posterior  ∝  p^{k}(1−p)^{n−k} · p^{α−1}(1−p)^{β−1}
           =  p^{α+k−1}(1−p)^{β+n−k−1}
```

**Stare at the exponents and you're done** — that's a Beta density with new parameters:

```
posterior = Beta(α + k,  β + n − k)
```

**The update is just addition.** Add your successes to `α`, your failures to `β`. That's what **conjugacy** means: prior and posterior in the same family, so updating is arithmetic instead of integration.

I verified it against a brute-force grid computation: `max |grid posterior − Beta(α+k, β+n−k)| = 3.4e-14`.

### Watching the prior lose

The most useful thing to show. Prior `Beta(2, 8)` — mean 0.2, deliberately wrong — against data with true `p = 0.3`:

| `n` | `k` | MLE `p̂` | posterior mean | posterior mode (MAP) | 95% credible |
|---|---|---|---|---|---|
| 5 | 3 | 0.600 | **0.333** | 0.308 | (0.128, 0.581) |
| 20 | 5 | 0.250 | 0.233 | 0.214 | (0.103, 0.397) |
| 100 | 32 | 0.320 | 0.309 | 0.306 | (0.227, 0.398) |
| 1,000 | 302 | 0.302 | 0.301 | 0.301 | (0.273, 0.330) |
| 10,000 | 3,046 | 0.3046 | 0.3045 | 0.3045 | (0.296, 0.314) |

**Read the first row aloud.** Three successes in five trials, and the MLE says `p̂ = 0.60` — which is a terrible estimate from five observations. The posterior mean says 0.333, because the prior is pulling it back toward 0.2. **The prior is doing exactly the job it exists for**: with almost no data, it stops you overreacting to noise.

**And read the last row.** At `n = 10,000` the MLE and the posterior mean agree to four decimal places. The prior has been overwhelmed.

That convergence has a name — **Bernstein–von Mises** — and the source states it correctly: as `n` grows, Bayesian estimates converge to the MLE, and the posterior comes to look like the CLT-based sampling distribution. **The two frameworks disagree most when you have least data**, which is also when the disagreement matters most.

### MAP is the bridge to November

The **maximum a posteriori** estimate is the posterior mode — the single most probable parameter value:

```
MAP  =  argmax  [ ℓ(θ) + log π(θ) ]
```

That is precisely Oct 29's optional fifteen minutes, and precisely Nov 24's regularized objective. I checked on the Beta–Bernoulli case: numerically maximizing `loglik + logprior` gives `0.25000009`, and the closed-form posterior mode `(α'−1)/(α'+β'−2)` gives `0.25000000`.

So the chain to draw on the board:

```
ridge regression  =  MAP with a Gaussian prior
lasso             =  MAP with a Laplace prior
```

**Regularization was Bayesian all along**, and `λ = σ²/τ²` from Nov 24 is the ratio of noise to prior confidence. Students who found the penalty arbitrary in November get the reason here.

**And the honest caveat:** MAP is a *point* summary of a distribution. Taking only the mode throws away everything Bayesian inference produces — the spread, the shape, the credible interval. It's the frequentist habit applied to a Bayesian object.

### The hardest part, and the best callback in the course

Cell 46 is the most valuable cell in the notebook and deserves its own beat:

> **Computational Bayesian methods do not solve or optimize. They sample.**

Outside conjugate cases the posterior has no closed form, so PyMC and Stan don't compute it — they *draw* from it, using Markov Chain Monte Carlo. What you get back is a pile of parameter draws.

And then what do you do with a pile of draws? **You do non-parametric statistics on them.** The posterior density is estimated by KDE. The posterior CDF by the ECDF. A credible interval is a percentile of the sample — exactly Sep 24's percentile interval, computed on posterior draws instead of bootstrap replicates.

The source's line is the one to say: *"if you thought the beginning of the class was a digression, I sympathize, but it's **KDE/ECDF all the way down**."*

That single sentence retroactively justifies September, and it's the right note for the last content session.

**Also worth noticing:** MCMC is a **Markov chain** — Oct 20's object — engineered so its stationary distribution *is* the posterior. Run it long enough and where it spends its time is where the probability is. Oct 22's convergence-to-a-steady-state is the mechanism, used deliberately.

### When Bayes actually helps

The source's list is good and honest:

- **Small `n`, strong prior** — the `n = 5` row above.
- **Hierarchical models** — data with nested layers: students in classes in schools in districts. Bayesian machinery handles the layers naturally, and this is the strongest practical argument.
- **Decision support** — the posterior feeds straight into expected-loss calculations without needing a point estimate.
- **Empirical Bayes** — estimate the prior's parameters from the data and don't dwell on the philosophy.

And the source's closing assessment is worth reading aloud, because students will encounter the tribal version: *"like most holy wars in academia, the differences between frequentist and Bayesian are slight, once you master both frameworks."*

---

### Reading

*Key in `README.md`.*

- **Primary** — **AoS Ch. 11** (Bayesian Inference), which covers the prior/posterior mechanics and the frequentist comparison directly. This is one of the few second-half sessions with a real home in the course's reading list.
- **Supporting** — **B&H Ch. 2, §2.3** (Bayes' rule) for the discrete version students met on Sep 1.
- **Fuller treatment** — **Gelman et al., *Bayesian Data Analysis* (BDA3)**, which the source names explicitly. Free PDF at `stat.columbia.edu/~gelman/book/`. Ch. 1–2 are the readable entry point.
- **Applied companion** — **ROS Ch. 9** (Gelman, Hill & Vehtari) for Bayesian regression with the same prior-as-regularization framing as Nov 24.
- **Worth knowing** — [Map] flags **naive Bayes** as an AoS Ch. 22 topic that this course never reaches; it's the classification application students may meet in ML.

---

## 3. The optimization view

- **Objective:** none — **and that is the point**
- **What you get:** the whole posterior distribution, not an argmax
- **Solved by:** conjugate algebra in special cases; **MCMC sampling** otherwise

**This is the only session all semester whose box has no argmax**, and closing the course on it is deliberate. Every previous session found a single best value. Bayesian inference declines to, and returns a distribution over values instead.

MAP is the exception that proves it — take the argmax of `ℓ + log π` and you're back in November's world, having discarded everything the posterior knew about uncertainty.

The final version of the spine, worth putting on the board as the last slide of the semester:

| Approach | Question | Answer |
|---|---|---|
| Aug 27 – Nov 24 | what single value is best? | an argmin, found by formula or algorithm |
| Sep 22 – Oct 1 | how much would that value wobble? | a sampling distribution, by resampling or theory |
| **Dec 3** | **what do I believe about the value?** | **a posterior distribution, by sampling** |

---

## 4. Assumptions that make it work

| Claim | Assumption |
|---|---|
| Bayes' rule as stated | `f_X(x) > 0`. Just conditioning, from Sep 1 |
| The posterior is Beta | **Conjugacy** — a Beta prior with a Bernoulli likelihood. A convenience, not a general fact |
| The posterior means anything | **The prior is an honest statement of belief.** Garbage prior, garbage posterior |
| Bayes ≈ MLE for large `n` | Bernstein–von Mises: regularity conditions, and the true parameter not on a boundary |
| MCMC draws represent the posterior | The chain **converged** — and diagnosing that is a real skill this course won't teach |
| A credible interval means what it says | Conditional on the model *and* the prior being right |
| MAP summarizes the posterior | Only if the posterior is roughly symmetric and unimodal. Otherwise the mode can be unrepresentative |

**Row 3 is the honest cost of the framework.** The prior is a genuine input, and a bad one produces a confident wrong answer. That's the real objection to Bayesian methods, and it deserves stating rather than defending.

**Row 5 is where practice diverges from theory.** Everything in the notebook assumes the sampler worked. Convergence diagnostics — trace plots, R̂, effective sample size — are the daily reality of applied Bayesian work and are out of scope here. Say so.

---

## 5. Concrete failure cases

**A prior that's confidently wrong.** With `Beta(50, 50)` — a sharp prior at 0.5 — and true `p = 0.1`, it takes a great deal of data to overcome. The prior is not a neutral technical choice.

**"Uninformative" priors that aren't.** A flat prior on `p` is not flat on the log-odds of `p`. Uniformity is not preserved under reparameterization, so "I used a non-informative prior" is a weaker claim than it sounds.

**MAP reported as though it were the analysis.** It's one number from a distribution. On a skewed posterior the mode can sit far from the mean and be a poor summary — and reporting it alone discards the credible interval, which is the thing Bayesian inference gives you that frequentist inference doesn't.

**Unconverged MCMC.** The sampler returns draws regardless. They may not be from the posterior. Without diagnostics you cannot tell, and the output looks identical either way.

**Credible read as confidence, or vice versa.** They mean genuinely different things, and this session is the one place both are on the table. A credible interval is a probability statement about the parameter *given your prior*; a confidence interval is a frequency statement about the procedure. Neither is the other.

**Conjugacy treated as the normal case.** It's a small set of lucky pairs. The source is right to warn against *"distribution/density games"* — real work is computational.

---

## 6. Five questions students will ask

**Q1. "What actually changes between frequentist and Bayesian?"** Whether the parameter is treated as random. Frequentists hold `p` fixed and unknown, and put the randomness in the data — so they ask what data various `p` values would produce, which gives a sampling distribution and a confidence interval about the *procedure*. Bayesians treat `p` as random, start from a prior, and update to a posterior — so they can say "given my prior and this data, here's my probability distribution over `p`." Everything else follows: the likelihood is identical in both, and it's the extra prior term and the change in what's random that differ.

**Q2. "Isn't the prior just making things up?"** It's an input you have to state, which is different from not having one. The frequentist alternative isn't neutrality — it's an implicit commitment (roughly, that all parameter values are equally worth considering) that never gets written down. And you saw the prior earning its keep in the `n = 5` row: three successes out of five gives an MLE of 0.60, which is a bad estimate, and the prior pulled it to 0.33. That's the prior preventing an overreaction to noise. The honest cost is that a confidently wrong prior gives you a confidently wrong answer, so the choice deserves defending.

**Q3. "So which one should I use?"** For most problems in this course it barely matters — with reasonable `n` they agree, which is Bernstein–von Mises, and the table shows them matching to four decimals by `n = 10,000`. Bayesian methods earn their keep with small samples and real prior information, with hierarchical data, and when you need a full distribution over parameters to feed a decision. Frequentist methods are simpler, faster, and need no prior to defend. The source's line is right: the differences are slight once you know both, and the tribalism mostly comes from people who know one.

**Q4. "How is the credible interval different from the confidence interval?"** A **credible** interval says: given my prior and this data, there's a 95% probability the parameter lies in here. That's a statement about the parameter. A **confidence** interval says: if I repeated this whole procedure many times, 95% of the intervals I built would contain the truth. That's a statement about the method — and it's why September insisted you can't say "95% chance it's in this one." The Bayesian interval means the thing everybody wants a confidence interval to mean, and the price is that you had to supply a prior.

**Q5. "If the posterior is just a pile of samples, what do I do with it?"** Exactly what you did in September. You have a sample from a distribution, so you estimate its density with a KDE, its CDF with the ECDF, and its intervals with percentiles. A 95% credible interval is the 2.5th and 97.5th percentile of the draws — the same computation as the bootstrap percentile interval, on different draws. That's why the first month of this course wasn't a digression: computational Bayesian inference *ends* in non-parametric statistics on a sample.

---

## 7. Bugs and simplifications in the material

### Verified

- **Cell 43 mixes `Σᵢ yᵢ` and `k` for the same quantity** in one expression — the posterior exponent is written `p^{α+Σᵢyᵢ−1}(1−p)^{β+n−k−1}`. Correct, but pick one symbol.
- **Cell 43 says "many edge cases are possible"** where it means *conjugate pairs* — the sentence describes choosing prior and likelihood so the posterior stays in the prior's family, which isn't an edge case.
- **`pymc` is required for cells 44–45 and `00_bayes_pymc.py`**, and it isn't a standard scientific-Python install. ⚠ **Verify it's available before planning the computational half**, or run the housing example as pre-computed output.
- **Cell 45 defers entirely to the script** — *"the 00_bayes_pymc.py file in the repo has the results"* — so the notebook itself shows no Bayesian regression output.

### Correct — verified numerically

The Beta–Bernoulli derivation in cell 43 is right: I checked the posterior against a brute-force grid at `n=20, k=6` and it matches `Beta(α+k, β+n−k)` to **3.4e-14**. The Bernstein–von Mises claim in cell 47 holds — posterior mean and MLE agree to four decimals by `n = 10,000`. And the MAP identity checks out: numerical `argmax[ℓ + log π] = 0.25000009` against the closed-form mode `0.25000000`.

### Simplifications

- **No mention of MCMC convergence diagnostics.** Cell 46 explains that sampling is what happens and stops there. Trace plots and R̂ are the practical reality; one sentence would flag that a sampler can fail silently.
- **Credible vs. confidence intervals are never contrasted**, though the notebook has both frameworks in hand and September spent a session on the confidence-interval interpretation. **This is the single best addition available** — see §6 Q4.
- **The regularization connection isn't drawn.** The notebook never says ridge is MAP with a Gaussian prior, which is Nov 24's payoff and one line.
- **The prior's failure modes aren't discussed** — §5's confidently-wrong prior and the non-invariance of "uninformative" priors.
- **Conjugacy is presented before the computational reality**, which risks leaving students thinking Bayesian analysis is algebra. Cell 46 corrects it; make sure that cell lands.

---

## 8. Delivery plan

**Modes:** 🟦 notebook (student copy) · 🟩 instructor cells (pre-written, never live) · ⬛ board · 🟨 HTML widget

| # | Step | Mode | Time | Notes |
|---|---|---|---|---|
| 1 | The one difference: is the parameter random? | ⬛ board | 4 min | Everything else follows from this |
| 2 | **Credible vs. confidence** | ⬛ board | 5 min | **Not in the source, and the best addition.** Sep 24 said you *can't* say "95% chance"; here you can, and here's the price |
| 3 | Bayes' rule for densities | ⬛ board | 4 min | Sep 1's rule with densities. Name the four parts; note the marginal is a constant |
| 4 | **Beta–Bernoulli, by hand** | ⬛ board | 6 min | Multiply, stare at the exponents, read off `Beta(α+k, β+n−k)`. **The update is addition** |
| 5 | **Watch the prior lose** | 🟩 instructor cells | 7 min | §2's table. **Read the `n=5` row aloud** — MLE 0.60 vs posterior 0.333 — then the `n=10,000` row |
| 6 | Bernstein–von Mises, named | ⬛ board | 3 min | They disagree most when data is scarcest |
| 7 | **MAP = ridge = a Gaussian prior** | ⬛ board | 5 min | Oct 29 → Nov 24 → today. **Regularization was Bayesian all along** |
| 8 | **"It's KDE/ECDF all the way down"** | ⬛ board | 5 min | Cell 46. Sampling, not solving — then non-parametric statistics on the draws. **The course's best callback** |
| 9 | MCMC is a Markov chain | ⬛ board | 3 min | Oct 20–22's object, engineered so its steady state is the posterior |
| 10 | PyMC on housing prices | 🟩 instructor cells | 6 min | ⚠ needs `pymc`; pre-computed output is a fine fallback |
| 11 | **Course conclusion** | ⬛ board | 5 min | Cell 49, plus §3's three-row table. *"You can always just bootstrap"* |
| 12 | **Lab** | 🟦 notebook | rest | See below |

**Build cost: low (~45 min)** — steps 5 and 7 are the only new cells, and step 10 exists if `pymc` does.

**Steps 2, 7, and 8 are the ones to protect.** Each closes a thread from earlier in the semester, and none of the three is in the source.

### The lab

Nothing exists. The natural one, and it needs no new machinery:

1. Implement the conjugate updater — five lines, `α += k`, `β += n − k`.
2. Plot prior, likelihood, and posterior on one axis, then slide `n` up and watch the posterior detach from the prior and settle on the likelihood.
3. Compute the 95% credible interval as posterior percentiles, and put it beside Sep 24's bootstrap percentile interval on the same data. **Note how similar they look and how differently they read.**
4. Vary the prior — flat, weak, strongly wrong — and see how much data each takes to overcome.
5. *(if `pymc` is available)* Fit the housing model and confirm the posterior means sit near the OLS coefficients from Nov 5.

Step 3 is the one worth building around: it's the whole frequentist/Bayesian contrast in one plot, computed on data they've used since September.

---

## 9. Look ahead

- **Dec 8 is review**, and §3's three-row table is the natural closing frame for the whole semester.
- **The final (Dec 10, 9–12)** — worth deciding whether Bayesian material is examinable, given it lands one week before.
- **Beyond the course:** hierarchical models are the strongest practical argument for Bayesian methods and are entirely out of scope; BDA3 Ch. 5 is where interested students should go.
- **MCMC** connects to any later course on computational statistics, and to the Bellman-equation machinery from Tuesday via the shared Markov-chain foundation.

## 10. Looking back

- **Sep 1 derived Bayes' rule** for events and said it would return. It does, for densities.
- **Sep 15's KDE and Sep 8's ECDF** are what you do to posterior draws — cell 46's payoff, and the reason the first month wasn't a detour.
- **Sep 24's confidence-interval interpretation** is the foil for step 2. Without that session, the credible-interval contrast has nothing to push against.
- **Oct 13–15's joint and conditional densities** are §1 of this same notebook, and Bayes' rule is conditioning applied twice.
- **Oct 20–22's Markov chains** are the mechanism inside MCMC.
- **Oct 27–29's likelihood** is unchanged here — multiplied by a prior instead of maximized alone. **Oct 29's optional MAP step** is step 7.
- **Nov 24's ridge** is MAP with a Gaussian prior, and `λ = σ²/τ²` finally has a name.

---

## 11. Source map

- `sp26/04_conditioning_and_bayes/00_bayes.ipynb` §2 — cells 37–49. Bayesian inference (38), setup (39), **Bayes' rule (40)**, the labelled version (41), the modelling recipe (42), **Beta–Bernoulli (43)**, PyMC (44), housing prices (45), **"the hardest part to understand" (46)**, MLE vs Bayesian (47), when Bayes helps (48), **course conclusion (49)**.
- §1 of the same notebook (cells 1–36) was Oct 13–15's material — joint, marginal, and conditional distributions, plus the confusion-matrix motivation. Students have seen it.
- `00_bayes_pymc.py` — the housing-prices model: `ln(pᵢ) = β₀ + β₁·age + σεᵢ`, with `Normal(0, 10)` priors on the coefficients and a half-normal on `σ`.
- `00_bayes.slides.html` — a rendered version, if useful for presenting.
- Verified numbers: conjugacy to `3.4e-14`; posterior mean vs MLE agreeing to four decimals at `n = 10,000`; MAP `0.25000009` vs closed-form mode `0.25000000`.

## 12. Open questions

- **Is this the right use of the slot?** My view: yes. The lecture is written, three threads close, and it gives the course a genuine ending rather than a fifteenth topic. The alternatives are a review session (but Dec 8 is already that) or spilling Tuesday's DP into a second day.
- ⚠ **Is `pymc` installed?** Steps 10 and lab step 5 depend on it. Everything else runs on `scipy` alone, so the session survives without it — but decide in advance rather than discovering it live.
- **Does the final exam cover this?** One week before the exam is late for new examinable material. Declaring it non-examinable and framing it as "where this goes next" is a defensible and honest choice.
- **How much of §1 needs recapping?** Oct 13–15 used it, but that's seven weeks earlier. Budget five minutes for conditional densities if the group looks blank.
- **Is the credible-vs-confidence contrast worth more than five minutes?** It's the most examinable idea in the session and the one students will carry furthest — arguably it deserves ten.
