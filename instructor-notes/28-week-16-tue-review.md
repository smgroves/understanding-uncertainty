# Week 16, Tuesday (Dec 8) — Review / Wrap-up

- **Syllabus:** week 16, *"Wrap-up · Review/wrap-up"* — the last class meeting
- **Day type:** neither. **No quiz, no lab.** The last quiz was Dec 1; the last lab was Dec 3
- **Final exam:** Thursday **Dec 10, 9am–12pm** — 20% of the grade
- **Source material:** 🔴 **none for a review session.** `sp26/.../exam_topics.ipynb` exists but covers only three topics and stops at MLE
- **This file is a session plan, not new content.** §2 is the synthesis to deliver; every claim in it is developed in an earlier notes file, cited inline

> **The one thing this session should do that no other session can: show them the course was one idea.** Fourteen weeks of apparently separate topics — ECDF, bootstrap, CLT, Markov chains, MLE, regression, Newton's method, ridge, Bellman — are three questions asked over and over. What's the best single value? How much would it wobble? What do I believe about it? Students who leave with that will remember the course; students who leave with a topic list will remember a topic list.
>
> **The practical problem: the final is two days later and the last new content landed five days before it.** Bayesian inference (Dec 3) is almost certainly not fair game. Decide that *before* class and say it out loud, because the alternative is thirty students asking it individually by email on Dec 9.

---

## 1. What students actually see

| Artifact | File | Status |
|---|---|---|
| Quiz | — | **none.** Dec 1 was the last one |
| Pre-class video | — | none, and none needed |
| In-class | — | 🔴 to build; §8 is a full plan |
| Instructor cells | — | 🔴 optional; §8 step 6 is the only one that wants live output |
| Lab | — | **none.** Dec 3 was the last one |
| Board | — | The three questions; the spine table; the exam-topic map |
| Handout | — | 🔴 **build this** — a one-page formula sheet. See §8 |

**Nothing is due today and nothing is graded today**, which changes the room. Attendance will be driven entirely by whether students believe the session helps them on Thursday. Make that obvious in the first two minutes: open with the exam format, not with a retrospective.

---

## 2. The content: the course in one hour

### The frame: three questions, asked fourteen times

Put this on the board first and leave it there. Everything else hangs off it.

| Question | Sessions | The machinery |
|---|---|---|
| **What single value is best?** | Aug 27 – Nov 24 | argmin, found by formula, grid, or algorithm |
| **How much would it wobble?** | Sep 22 – Oct 1 | sampling distribution, by resampling or by theory |
| **What do I believe about it?** | Dec 3 | posterior distribution, by sampling |

The second question is the one that makes it a statistics course rather than a numerical-methods course, and it's the one students undervalue. **An estimate without a sense of its variability is not an answer.**

### The optimization spine, assembled

Every estimator in this course is the solution to a minimization problem. The `.callout.optview` box appeared on every lecture page; today is when the boxes get read side by side. This table is the single most valuable artifact of the session.

| Estimator | Minimizes | Over | Solved by |
|---|---|---|---|
| sample mean | `Σ(xᵢ − m)²` | `m ∈ ℝ` | formula |
| sample median | `Σ\|xᵢ − m\|` | `m ∈ ℝ` | sorting |
| `q`-quantile | `Σ ρ_q(xᵢ − m)` (pinball) | `m ∈ ℝ` | sorting |
| KDE bandwidth | estimated MISE / CV score | `h > 0` | grid search |
| conditional expectation | `E[(Y − g(X))²]` | functions `g` | conditioning |
| MLE | `−ℓ(θ)` | `θ ∈ Θ` | calculus, then Newton |
| OLS | `‖y − Xβ‖²` | `β ∈ ℝᵖ` | normal equations |
| logistic regression | `−ℓ(β)` | `β ∈ ℝᵖ` | **Newton only** — no formula exists |
| ridge | `‖y − Xβ‖² + λ‖β‖²` | `β ∈ ℝᵖ` | formula, always invertible |
| optimal policy | `−E[Σ rewards]` | policies | backward induction |
| MAP | `−ℓ(θ) − log π(θ)` | `θ ∈ Θ` | calculus or sampling |

**Three observations to draw out of it, in this order:**

1. **The mean and the median differ only in the exponent.** Square the errors and you get the mean; take absolute values and you get the median. That's why the mean chases outliers and the median doesn't — squaring makes a distant point expensive. This is the cheapest possible demonstration that a loss function is a *choice*, not a fact.
2. **Three ways of solving, and which one you get is not about the statistics.** A formula (OLS), a grid (bandwidth), an iterative algorithm (logistic). The objective determines which is available. Logistic regression is not harder statistics than linear regression — it's the same idea with an objective whose derivative won't solve.
3. **Regularization is the only row that changes the objective rather than the method.** Ridge adds a term, and in exchange gets an answer where OLS had none. Nov 24's verified numbers: the raw problem threw `LinAlgError` at `λ = 0`, and by `λ = 100` the condition number was 62.7.

### The four things they will have forgotten, and are examinable

Judgment call, but these are the ones that decay fastest and appear most often in exam problems.

**Sampling distribution ≠ data distribution.** The single most confused idea in the course. The data have a distribution; so does the *statistic you compute from them*, and those are different objects with different spreads. `SE = σ/√n` says the second one is narrower, and the `√n` is why quadrupling the sample only halves the error. If a student can't restate this, they can't do inference.

**What a confidence interval means.** It's a statement about the procedure — 95% of intervals built this way contain the truth — not about this interval. Dec 3's credible interval is the thing that *does* mean what everyone wants confidence intervals to mean, and it needed a prior to get there. Worth two minutes, because it is the most commonly examined interpretation question in any statistics course.

**Likelihood is not probability.** `L(θ)` is a function of the *parameter*, with the data held fixed. It doesn't integrate to one over `θ` and isn't a density in `θ`. Oct 27 built this carefully; five weeks later it will have collapsed back into "probability of the data."

**`p̂ = argmax` is not the end of the story.** MLEs can be biased. The verified case from Oct 29: `E[σ̂²] = ((n−1)/n)σ²`, which at `n = 12` gives 3.663 against a true 4.0. Maximum likelihood gives you an estimator, not a guarantee.

### The threads that ran the whole way

Four ideas recur so often they're worth naming as ideas rather than as topics.

**Empirical objects estimate theoretical ones.** ECDF → CDF (Glivenko–Cantelli), KDE → density, empirical transition counts → transition matrix, bootstrap distribution → sampling distribution. **Every one of these is "use the data in place of the distribution you don't have,"** and it is the single most reusable move in the course.

**When you can't solve it, sample it.** The bootstrap when no SE formula exists (Sep 24 — the median's SE was 0.7343 with no formula available), Monte Carlo when an integral is hard, MCMC when a posterior is intractable. All three are the same manoeuvre.

**When you can't solve it, walk downhill.** Gradient ascent, Newton, backward induction. The optimization block is this sentence, elaborated.

**Structure buys you tractability.** Independence factors a joint density into a product. The Markov property makes the future depend only on the present. Both exist to make an otherwise impossible computation possible, and both are assumptions you should be able to state and doubt.

### The exam-topic map

Give students this. It's what they'll actually use tonight.

| Topic | Sessions | Notes file |
|---|---|---|
| Probability spaces, axioms, random variables | Sep 1 | `03` |
| Vectors, inner product, projection | Sep 3 | `04` |
| Categorical variables, indicators, ECDF | Sep 8 | `05` |
| CDF / PDF, expectation, variance | Sep 10 | `06` |
| KDE, bandwidth, bias–variance | Sep 15 | `07` |
| Survival function, hazard rate | Sep 17 | `08` |
| Sampling distribution, SE | Sep 22, Sep 29 | `09`, `11` |
| Bootstrap, CI, p-value | Sep 24 | `10` |
| CLT | Oct 1 | `12` |
| Joint density, independence | Oct 13 | `14` |
| Conditional density and expectation | Oct 15 | `15` |
| Markov chains, transition matrices, forecasting | Oct 20, Oct 22 | `16`, `17` |
| Likelihood, log-likelihood | Oct 27 | `18` |
| MLE | Oct 29 | `19` |
| Linear regression, OLS = MLE | Nov 5 | `20` |
| Logistic regression, marginal effects | Nov 10 | `21` |
| Gradients, gradient ascent | Nov 12 | `22` |
| FONC / SOSC, Newton | Nov 17, Nov 19 | `23`, `24` |
| Constrained optimization, regularization | Nov 24 | `25` |
| Dynamic programming, backward induction | Dec 1 | `26` |
| **Bayesian inference** | Dec 3 | `27` — ⚠ **decide if examinable** |

---

### Reading

*Key in `README.md`.*

No new reading. What's worth telling them:

- **AoS Ch. 1–11** is essentially the frequentist half of this course in one place, and it's the right book to keep.
- **B&H** is the gentler companion for the probability chapters, if they found AoS terse.
- **For where this goes next:** ROS (Gelman, Hill & Vehtari) for regression done properly, BDA3 for the Bayesian direction, and Boyd & Vandenberghe's *Convex Optimization* (free at `stanford.edu/~boyd/cvxbook/`) for the November block. Say which one matches which interest — a list of three books with no guidance gets ignored.
- **The one-sentence version:** they now have the vocabulary to read a methods section. That's the actual deliverable of a first statistics course.

---

## 3. The optimization view

- **Objective:** —
- **This session has no argmin.** It's the session where the previous twenty-six get put in one table

**The spine table in §2 *is* this section**, and today is the only day it can be shown whole. Every earlier session got one row of it; the row was always slightly abstract because the rest of the table hadn't happened yet.

Ask the class to fill in a blank version before showing them the filled one — see §8 step 3. A student who can reconstruct "what does the sample median minimize?" without prompting has the course.

---

## 4. Assumptions that make it work

Not the session's assumptions — **the course's**, collected. This is a genuinely useful board, because assumptions were introduced one at a time and never once seen together.

| Result | Needs |
|---|---|
| ECDF → CDF | i.i.d. sampling. That's all — Glivenko–Cantelli is remarkably cheap |
| `SE = σ/√n` | independence, finite variance |
| CLT | i.i.d., finite variance, `n` large enough — **and how large depends on skew** |
| Bootstrap | the sample represents the population; the statistic is smooth. **Fails for the max** |
| Joint = product of marginals | independence, which is a strong and testable claim |
| Markov forecasting | the Markov property, and **time-homogeneity** — the transition matrix doesn't drift |
| MLE consistency | correct model, regularity, identifiability |
| OLS unbiased | `E[ε\|X] = 0`. Normality is needed for the *inference*, not the estimate |
| `√diag(−H⁻¹)` = SE | the model is right, and the optimum is interior |
| Ridge beats OLS | there is genuine collinearity, and `λ` was chosen honestly (cross-validation, not eyeballing) |
| Backward induction | finite horizon, known transitions, additive rewards |
| Posterior means anything | the prior is an honest statement of belief |

**The pattern worth naming out loud: nearly every row says "i.i.d." or "the model is right."** Those two assumptions carry the entire course, and neither is usually true. That isn't a reason to distrust the methods — it's the reason diagnostics, resampling, and honest reporting of uncertainty exist.

---

## 5. Concrete failure cases

The greatest-hits reel. Each one is a verified number from an earlier session, and each is a plausible exam question.

- **Bootstrap the maximum** and the distribution is a spike with a tail — the resampled max can never exceed the observed max. The bootstrap is not universal.
- **CLT with `n = 5` on skewed data**, and the normal approximation is visibly wrong. "Large `n`" is not a fixed number.
- **MLE of `σ²` is biased** — `((n−1)/n)σ²`, so 3.663 against 4.0 at `n = 12`.
- **Logistic coefficients read as probabilities.** Nov 10's verified case: `β̂ = −0.052` versus an average marginal effect of `−0.011` — a **fivefold** overstatement if you read the coefficient as an effect on probability.
- **Gradient descent on unstandardized features.** Nov 19's table: condition number **127,892**, and gradient ascent failed to converge at *any* of eleven step sizes tried, while Newton took the same six iterations either way.
- **OLS with collinear predictors** throws `LinAlgError`. Ridge at `λ = 100` brings the condition number to 62.7 and returns an answer.
- **The myopic policy loses.** Dec 1's verified numbers: myopic 127 against dynamic 131. Greedy is not optimal when today's action changes tomorrow's state.
- **A confidently wrong prior.** `Beta(50,50)` against a true `p = 0.1` takes a great deal of data to overcome.

---

## 6. Five questions students will ask

**Q1. "What's on the exam?"** Answer this in the first two minutes, in writing, or the session is wasted while they wait for it. Give the §2 topic map, say explicitly how many problems and of what kind, and settle the Bayesian question. The syllabus says the final covers lectures and problem sets and is worth 20%; the practice exams from the previous offering are three long multi-part problems each, so if the format matches, say so.

**Q2. "Is the Bayesian material on it?"** ⚠ **Decide before class.** It was taught on Dec 3, five days before the exam and two days before this session. My recommendation is to declare it non-examinable and frame it as where the subject goes next — new material one week out is late, and the honest version buys goodwill you'll want during the exam period.

**Q3. "Do we need to memorize formulas?"** Also decide before class, and if the answer is no, **hand out the sheet you'll provide** so they can study against it. A formula sheet changes how people revise; giving it out on the day is worth less than giving it out now.

**Q4. "I never really understood the sampling distribution."** The most common honest admission, and it's worth the five minutes even if only one person asks. The data have a distribution and so does the statistic computed from them — different objects, different spreads. Bootstrap it once on the board: resample, recompute, plot the recomputed values. That histogram *is* the sampling distribution, and seeing it built removes most of the confusion.

**Q5. "Where does this go next?"** Their ML course is running concurrently and has already met gradient descent, regularization, and overfitting — say explicitly that those are the same objects from November, because the two courses use different notation and students often don't notice. Beyond that: causal inference for the "does X cause Y" question this course carefully never answered, Bayesian methods for hierarchical data, and stochastic processes for the Markov material.

---

## 7. What has to be built

Nothing exists for this session. In priority order:

1. **The formula sheet** (~1 page). Highest value per minute of effort, and useful to you as an exam-design artifact regardless. Suggested contents: mean/variance/SE; the ECDF; the CDF↔PDF relationship; the normal density; `SE = σ/√n`; the CLT statement; Bayes' rule; joint/conditional/marginal; the Markov update `π' = Pπ`; the log-likelihood of the normal and the Bernoulli; the normal equations; the logistic link; the gradient-ascent and Newton updates; the ridge solution; the Bellman recursion.
2. **The blank spine table** for step 3 — the §2 table with the "Minimizes" column empty.
3. **The exam-topic map** as a handout, not a slide. They will take it home.
4. **A practice problem set.** `sp26`'s two practice exams are usable but **skewed**: of the six problems, most target probability spaces, Markov chains, and MLE, and none touch regression, optimization, or dynamic programming. ⚠ **Two of the three problems in each are MLE/Markov-chain problems** — fine for a final, but they were written against a different schedule, so don't hand them over as a representative preview without saying what they omit.
5. *(optional)* **One live cell** for step 6 — bootstrap a median on the car-price data and plot the resulting distribution. Sep 24's verified number: median SE 0.7343, with no formula available. Thirty seconds of code, and it's the best single image of the whole course.

**Total build cost: ~2 hours**, almost all of it the formula sheet.

---

## 8. Delivery plan

**Modes:** 🟦 notebook · 🟩 instructor cells (pre-written) · ⬛ board · 📄 handout

| # | Step | Mode | Time | Notes |
|---|---|---|---|---|
| 1 | **Exam logistics, in writing** | 📄 handout | 5 min | Format, length, what's allowed, **whether Dec 3 is examinable**. Do this first or nothing else lands |
| 2 | **The three questions** | ⬛ board | 5 min | §2's opening table. The frame for everything after |
| 3 | **Fill in the spine table** | ⬛ board | 12 min | Hand out the blank version, let them work in pairs for 5 min, then fill it in together. **Don't just show the filled table** — reconstructing it is the review |
| 4 | The three observations | ⬛ board | 6 min | Mean vs. median as an exponent; formula/grid/algorithm; ridge changes the objective |
| 5 | **The four forgotten things** | ⬛ board | 10 min | §2. Sampling distribution, CI interpretation, likelihood ≠ probability, MLE bias |
| 6 | **Bootstrap a median, live** | 🟩 instructor cells | 5 min | The picture that fixes step 5's first item. SE 0.7343, no formula exists |
| 7 | The four threads | ⬛ board | 6 min | Empirical→theoretical; sample it; walk downhill; structure buys tractability |
| 8 | **Assumptions, collected** | ⬛ board | 6 min | §4's table. Land the "it's all i.i.d. and model-correctness" point |
| 9 | Greatest-hits failures | ⬛ board | 5 min | §5. Fast, one line each. These are exam questions in disguise |
| 10 | **Open Q&A** | — | 15 min | **Protect this.** It's why they came. If nobody speaks, work a practice problem |
| 11 | Where this goes next | ⬛ board | 3 min | §6 Q5. Name the ML overlap explicitly |
| 12 | Course evaluations | — | 5 min | The syllabus asks for them; the last five minutes is the standard slot |

**Steps 3, 5, and 10 are the session.** If time runs short, cut 7, 9, and 11 — they're satisfying to deliver and less useful to students two days before an exam.

**A note on the room.** No quiz, no lab, nothing due: attendance is voluntary in practice. Step 1 is what makes it worth showing up, so lead with it and don't save the logistics for the end.

---

## 9. Look ahead

- **The final, Dec 10, 9–12.** Three hours is long — the `sp26` practice exams are three multi-part problems each, which is the right scale for that window.
- **Grade breakdown, for the questions you'll get:** labs 30%, problem sets 20%, midterm 20%, final 20%, quizzes 10% with the lowest two dropped.
- **For next year:** the four from-scratch sessions (Nov 12/17/19/24) now have full notes but no built materials. That's the biggest authoring debt in the course, and building them once makes the November block reusable.
- **`BUGS.md` is the other carry-forward.** Anything unfixed by now is a bug the next offering inherits — worth a pass while the term is fresh.

## 10. Looking back

**Everything.** That's the section. Concretely, the sessions that most need refreshing before Thursday, because they're foundational and distant: **Sep 22** (sampling distribution), **Sep 24** (bootstrap and the CI interpretation), **Oct 1** (CLT), and **Oct 27** (likelihood ≠ probability). Those four carry the most weight per exam point and have had the longest to fade.

The most recent material needs the least review and will feel the most urgent to students — resist that pull. **They are more likely to lose points on the sampling distribution than on Newton's method.**

---

## 11. Source map

- **No source notebook.** `sp26/understanding_uncertainty_assignments/exam_topics.ipynb` is the closest thing and covers only three topics — probability spaces, random variables, and MLE — with its second cell empty. It was written against a different schedule and **is not a Fall final-topic list.**
- `practice_exam_1.ipynb` — three problems: a two-day stock-price random walk (outcomes/CDF/expectation/variance, plus an option payoff as a random variable); softmax choice probabilities (axioms, independence of irrelevant alternatives, comparative statics, `σ → 0` and `σ → ∞` limits); Poisson MLE.
- `practice_exam_2.ipynb` — three problems: hospital bed-days (a mixed discrete/continuous CDF, conditional expectation, totals over `n` patients); a two-state weather Markov chain (multi-step forecasting and a stationary distribution); a three-label categorical MLE.
- `practice_exam_solutions.pdf` — solutions for both. **Check before distributing** whether you want them out.
- Schedule: `F26_scheduling.xlsx` sheet `DS5030` has **no Dec 8 row** — it goes Dec 1, Dec 3, then FINAL EXAM Dec 10. The syllabus supplies week 16 as *"Wrap-up · Review/wrap-up."* See §12.
- Every number cited in §5 is verified and traceable to the session file named beside it.

## 12. Open questions

- ⚠ **Is Dec 8 actually a class meeting?** The authoritative spreadsheet skips it; the syllabus lists it as week 16 and gives the course end date as Dec 8. Almost certainly a class, but **confirm against the university calendar** before building a handout for it.
- ⚠ **Is the Bayesian material examinable?** Decide before class. My recommendation is no — see §6 Q2.
- **Is a formula sheet provided?** Changes how students revise, so announce it today either way.
- **Are the `sp26` practice exams distributed?** They're good problems with skewed coverage. If you hand them out, say what they omit; if the solutions PDF goes out too, that's a separate decision.
- **What's the exam format?** Three long multi-part problems, as in `sp26`? Or shorter items with broader coverage — which would suit a Fall syllabus that ran further into optimization and DP than the practice exams reach.
- **Does the final cover the whole course or the post-midterm half?** The syllabus says only "material from the lectures and problem sets." Students will ask in the first minute of this session.
