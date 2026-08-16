# Week 6, Thursday (Oct 1) — The Central Limit Theorem

- **Schedule focus (F26_scheduling):** CLT · source listed as `CLASS_11/10_2_CLT`
- **Schedule margin note:** *"maybe need to add in t-test formalization"* — the notebook already has it, see §2
- **Day type:** Lab / Coding Day
- **Source:** `uu_fa26/class_11/10_2_CLT.ipynb` (7 cells, all markdown)
- **Problem set:** `class_11/homework_11_clt_bootstrap.md` — problems 4–15 and all 5 simulation prompts are today's
- **Widgets:** `labs/class-11-clt/clt.html`
- **Also:** html `labs/class-11-clt/lecture.html` — covers the CLT, the t-distribution, and two-sample t-tests in prose
- **Last content session before the midterm** (Oct 6 is fall break; Oct 8 is the exam)

> 🔴 **There is a wrong number in a table students will copy.** Cell 3 lists the 95% critical value as **1.995**. It is **1.960**. I checked: `Φ(1.995) = 0.9770`, and you need `0.9750`. Worse, `homework_11_clt_bootstrap.md` has it right at 1.96, so as it stands the lecture and the problem set contradict each other on the most-used constant in statistics. Fix before Thursday.
>
> The good news: the notebook's framing of the whole session is exactly right, and it's in cell 0. *"If we replace the ECDF/quantiles from the previous lecture with the Standard Normal Distribution, we get the classic z-test. That's all we're doing in this lecture."* Everything today is a substitution into machinery students already have.

---

## 1. What students actually see

| Artifact | File | Status |
|---|---|---|
| Pre-class video | `class_11/10_2_CLT` (7 cells) | 🔴 **wrong critical value in cell 3** |
| In-class | same notebook | **all markdown, no code** — fourth session running |
| Instructor cells | — | to build; §8 has the numbers |
| Lab | none listed | §8 proposes one from `homework_11`'s simulation prompts |
| Board | — | The CLT statement, the substitution, the t-distribution, the two-sample recipe |

---

## 2. The content, from scratch

### The one-sentence version

Tuesday ended with standardized bootstrap replicates whose quantiles were `−1.868` and `+2.032` — *nearly* the standard normal's `±1.960`, and not quite. Today explains both halves of that observation, and then cashes it in:

> **Stop computing your own quantiles. Look them up.**

That is the entire session. The bootstrap gave you `q` by resampling; the CLT gives you `q` from a table, because in large samples the standardized sampling distribution *is* the standard normal.

### The theorem

Let `X₁, …, Xₙ` be i.i.d. with mean `μ` and **finite** variance `σ²`. Then as `n → ∞`:

```
       X̄ₙ − μ
Zₙ =  ─────────   ⟶   Normal(0, 1)
       σ/√n
```

Three things to draw out, because each one is load-bearing:

**It says nothing about the shape of `X`.** Exponential, skewed, bimodal, discrete — irrelevant. That is what makes the theorem remarkable rather than merely useful. Sep 22's lightbulbs were exponential and the sample means came out bell-shaped anyway.

**It is about `X̄ₙ`, not about `X`.** Collecting more data does not make your data normal. It makes the *sampling distribution of your estimate* normal. Students conflate these constantly, and the notebook's own phrasing guards against it well: *"we are using the standard normal to compute quantiles of our Z scores… rather than the ECDF; that's all."*

**Finite variance is a real hypothesis.** Sep 10's Cauchy has none, and its sample means never settle no matter how large `n` gets. The condition isn't decoration.

### The substitution

Tuesday's interval was built from your own replicates:

```
( Ŝ − q_{α/2} × SE(Ŝ) ,  Ŝ + q_{1−α/2} × SE(Ŝ) )       q from [Z₁,…,Z_B]
```

The CLT says that for large `n` those `q` values converge to standard-normal quantiles. So the same formula, with `q` looked up:

| Level | `α` | `±q` |
|---|---|---|
| 90% | .10 | **1.645** |
| 95% | .05 | **1.960** |
| 99% | .01 | **2.576** |

(Verified against `norm.ppf`: 1.6449, 1.9600, 2.5758. **The notebook's 1.995 is wrong** — §7.)

Same for the p-value. Tuesday's was a count:

```
p = (1/B) Σ_b 𝟙{ |Z_b| > |Z₀| }
```

Replace the empirical proportion with a normal probability and you get the classical z-test p-value:

```
p = p[ |Z| > |z₀| ]  =  2(1 − Φ(|z₀|))
```

**The notebook's cell 4 makes the connection precisely** — "taking the expectation, we convert the indicator to a probability." That is worth putting on the board slowly, because it is the exact moment the bootstrap becomes optional.

### What you gain, and what you give up

**Gain:** no resampling. A z-test is arithmetic on a calculator; it works on summary statistics alone, which is why every paper reports mean, SD, and `n`.

**Give up:** the guarantee is asymptotic. `q = 1.96` is exactly right in the limit and approximately right for your `n`. Tuesday's `−1.868, +2.032` on 92 skewed observations is a measurement of exactly how approximate. **And the bootstrap still works when the CLT doesn't** — for the median, the IQR, a ratio, or any statistic without a `σ/√n` formula.

The honest summary to give them: *you will stop needing the bootstrap for the mean, and you will still need it for everything else.*

### The t-distribution

The schedule wonders whether to add t-test formalization. **Cell 5 already has it**, and it fits naturally because Tuesday created the need (§6 Q5 there).

The problem: the CLT is stated with the true `σ`, but you use `s`, which is itself estimated. Dividing by a noisy denominator makes extreme values more likely than the normal predicts — the tails get heavier. The **Student's t-distribution** with `d` degrees of freedom is the correction:

```
f(t) = Γ((d+1)/2) / (√(πd) · Γ(d/2)) · (1 + t²/d)^(−(d+1)/2)
```

Nobody needs to memorize that. What matters is the behaviour, and it's worth showing as numbers rather than a claim — here are the two-sided 95% critical values:

| `df` | t | vs 1.96 |
|---|---|---|
| 5 | 2.571 | 31% wider |
| 10 | 2.228 | 14% wider |
| 20 | 2.086 | 6% wider |
| 32 | 2.037 | 4% wider |
| 100 | 1.984 | 1% wider |

So: **small sample → t, large sample → normal**, and past roughly `d = 32` the difference is under 4%. The notebook's rule of thumb is fine.

### Two-sample t-tests

Cell 6 is the strongest cell in the notebook and it's a complete recipe. Two independent groups, and the question is whether the gap between their means is large relative to the noise.

```
H₀ : μ_A − μ_B = 0

SE(X̄_A − X̄_B) = √( s²_A/n_A + s²_B/n_B )

t = (X̄_A − X̄_B) / SE
```

The recipe: compute the difference, compute the standard error, divide, compare to the normal or t, and/or report `(X̄_A − X̄_B) ± q × SE`.

**Notice the standard errors add in squares, not linearly.** Two independent sources of noise combine as `√(a² + b²)`, which is the same Pythagorean structure as Week 1's vector length — variances add, standard deviations don't.

**And keep the notebook's caution**, which is the most practically important sentence in the session: *if the same units are measured twice, this is not a two-independent-samples problem; it is a paired difference problem.* Before-and-after on the same patients, the same students on two tests, the same cities in two years — treating those as independent is the most common misuse of this test in practice. The fix is to take differences first and run a one-sample test on them.

---

### Reading

*Key in `README.md`. From `Reading-Roadmap.md` unless marked [Map] (= `prep/ds5030_syllabus_reading_map.pdf`).*

- **Primary** — **AoS Ch. 5** (Convergence of Random Variables). **B&H Ch. 10, §10.3**, *"Central limit theorem"* (p. 435) — a full named section and the single most direct chapter-title match to a session anywhere in the six books.
- **Supporting** — **AoS Ch. 10 appendix** (the t-test) and **B&H Ch. 10, §10.4**, *"Chi-Square and Student-t"* (p. 441). Both feed the two-sample extension in §2.
- **Fuller treatment** — **C&B Ch. 5, §5.5**, *Convergence Concepts*, where the CLT is stated and proved. **CASI Ch. 2, §2.1**, *"Pivotal statistics"* — derives the two-sample t-statistic and its 95% interval on real leukemia gene-expression data, mirroring this session's structure.
- **Intuition first** — **G&S Ch. 9**, organized around its own guiding question: *why does the bell curve show up everywhere?*
- **Visuals for class** — **G&S Fig. 9.2**, the canonical histogram-converging-to-a-bell-curve overlay. **ROS Ch. 3**, `CentralLimitTheorem/heightweight`. *(Spiegelhalter has no CLT figure — genuinely not covered there.)*

---

## 3. The optimization view

- **Objective:** the shortest interval with `1 − α` coverage — the same objective as Sep 24 and Sep 29
- **Argmin:** `±1.96` standard errors. **Symmetry is what makes equal tails optimal here**, and the CLT is what supplies the symmetry
- **Solved by:** closed form — read the normal quantile off a table or call `norm.ppf`

This closes a thread left open on Sep 24. The percentile interval was flagged there as a *convention*, optimal only under symmetry, and skewed bootstrap distributions were the counterexample. The CLT is the defence: asymptotically the sampling distribution becomes symmetric, so the equal-tailed convention becomes the right answer — eventually.

It's also the last box in the first half where the argmin has a closed form. Every objective from here on gets harder, which is what makes optimization a topic in its own right later.

---

## 4. Assumptions that make it work

| Claim | Assumption |
|---|---|
| `Zₙ → Normal(0,1)` | **i.i.d.** and **finite variance**. Both are essential |
| `q = 1.96` is right for your `n` | `n` is "large enough" — and that depends on the skew of `X`. See §5 |
| Using `s` for `σ` is harmless | Large `n`. For small `n` this is what the t-distribution corrects |
| The t-distribution applies | The underlying data are roughly **normal** — a stronger assumption than the CLT needs |
| `SE(X̄_A − X̄_B) = √(s²_A/n_A + s²_B/n_B)` | The two groups are **independent**. Paired data breaks this |
| The CLT covers your statistic | It's a theorem about **sums and averages**. It says nothing about the median, the max, or the IQR |

Row 4 is a genuine subtlety and it's worth being straight about: **the t-distribution assumes more than the normal approximation does, not less.** It is exact when the data are normal and `σ` is estimated; it is a small-sample patch, not a robustness upgrade. If the data are skewed *and* `n` is small, neither z nor t is trustworthy and the bootstrap is the honest tool.

Row 6 is the one that keeps the bootstrap alive: the CLT is about averages, so it retires the bootstrap for means and for nothing else.

---

## 5. Concrete failure cases

**"How large is large enough?" has no universal answer.** The folk rule `n > 30` is for mildly skewed data. Tuesday's demonstration is the counterexample sitting right there: `n = 92` car prices, and the standardized quantiles were `−1.868, +2.032` rather than `±1.960` — still visibly asymmetric. Strongly skewed data can need hundreds. **Run the bootstrap and compare** is the only honest check, and today's students can actually do it.

**No finite variance, no theorem.** Cauchy again. Sample means from a Cauchy are as variable at `n = 10⁶` as at `n = 1`.

**Applying the CLT to the wrong statistic.** It licenses `X̄ₙ`, not the median or the max. Students who take "everything becomes normal" as the lesson will apply it to a maximum, where it is badly false.

**Paired data run as two-sample.** See §2. The standard error comes out too large, so the test is conservative and you miss real effects — the opposite failure from the clustering problem, and just as common.

**Reading a t-test as robust.** It corrects for estimating `σ`, not for non-normality. On skewed data with small `n` it is not a fix.

**Trusting the normal in the far tail.** The CLT converges fastest in the middle of the distribution and slowest in the tails. A p-value of 0.04 from a z-test on modest `n` is roughly right; a claimed p-value of `10⁻⁸` is asserting something about a tail region where the approximation has no accuracy at all.

---

## 6. Five questions students will ask

**Q1. "Does the CLT mean my data become normal if I collect enough?"** No, and this is the misconception to kill first. Your data keep whatever distribution they always had — collect a million car prices and they are still right-skewed. What becomes normal is the distribution of the **sample mean** across hypothetical repeated samples. Two different objects: the histogram of your data, and the histogram of estimates you'd get from repeated studies. Only the second one goes bell-shaped.

**Q2. "How large does `n` have to be?"** There's no universal number, and anyone who gives you one is quoting a rule of thumb for mildly skewed data. It depends on how skewed `X` is: nearly symmetric data are fine by `n ≈ 20`, and strongly skewed data can need hundreds. The useful answer for this course is that **you can check** — bootstrap the statistic, standardize, and compare your quantiles to `±1.96`. Tuesday's data did exactly this and came out at `−1.87, +2.03` on 92 observations, meaning the approximation was close but not yet arrived. That's a measurement, not a guess.

**Q3. "If the CLT gives me `1.96`, why did we spend two weeks on the bootstrap?"** Three reasons. **The CLT is about averages** — it says nothing about the median, the IQR, a ratio of means, or a 90th percentile, and the bootstrap handles all of them. **It's asymptotic** — for small or skewed samples the bootstrap is more accurate. And **it needs a formula for the standard error**, which exists for the mean and a handful of other statistics and nowhere else. The CLT retires the bootstrap for one very common case, which is worth a lot, and leaves everything else where it was.

**Q4. "When do I use t instead of z?"** When `n` is small, roughly under 30–40. The reason: the CLT is stated with the true `σ`, but you're using `s`, which is itself noisy — and dividing by a noisy number makes extreme values more likely than the normal predicts. The t-distribution widens the critical values to compensate: 2.571 at `df = 5` versus 1.96, so about 31% wider. By `df = 32` the gap is 4% and by `df = 100` it's 1%, which is why nobody bothers with t for large samples. One caution: t assumes the underlying data are roughly normal, which is a *stronger* requirement than the CLT's. It is a small-sample correction, not a robustness fix.

**Q5. "Why do the standard errors add in squares?"** Because *variances* add for independent quantities, and standard errors are square roots of variances. `V[A − B] = V[A] + V[B]` when `A` and `B` are independent — note the plus sign even though you're subtracting, since subtracting a noisy thing adds noise. Take the square root and you get `√(s²_A/n_A + s²_B/n_B)`. It's the same structure as vector length from Week 1 Thursday: independent components combine by Pythagoras, not by addition. And it's why combining two equally noisy estimates gives `√2 ≈ 1.41` times the noise rather than double.

---

## 7. Bugs and simplifications in the material

### Verified

- 🔴 **The 95% critical value is wrong.** Cell 3's table lists `1.995`; the correct value is `1.960`. I checked: `Φ(1.995) = 0.9770` where `0.9750` is needed, and `norm.ppf(0.975) = 1.95996`. **`homework_11_clt_bootstrap.md` has 1.96**, so the lecture and the problem set currently disagree. The 90% (1.645) and 99% (2.576) entries are correct.
- **"t-statistics" used throughout where `Z` is meant** — cells 1, 2, and 4 all say "t-stats" or "t-statistics" about the standardized bootstrap replicates, and then **cell 5 introduces the actual t-distribution**. So the same word means two different things four cells apart. This is the same slip as `10_1` cell 4 and it matters more here. Rename every pre-cell-5 use to `Z`.
- **Typos**: "independently and identically distribution sample" and "estaimtes" (cell 1); "subsitute" (cell 2).
- **`G()` for the gamma function** (cell 5) where `Γ` is standard. Harmless but unusual, and `G` is not defined anywhere.
- **No code at all.** Seven markdown cells, fourth consecutive session with nothing runnable.

### Correct

The CLT statement in cell 1 is right, and cell 0's framing of the whole session ("that's all we're doing") is exactly the right altitude. Cell 4's derivation of the classical p-value from the bootstrap one — converting an indicator average into a probability — is the cleanest link between the two halves of the course and is worth putting on the board. Cell 6's two-sample recipe is correct throughout, including the standard error and the paired-data caution.

### Simplifications

- **"Around `d ≥ 32`"** is a fine rule of thumb; the conventional folk number is 30. Either is defensible and the table in §2 is better than either.
- **The t-distribution's own assumption is never stated** — it needs approximately normal data. See §4 row 4.
- **One-sided tests still never appear**, across all three inference sessions.
- **Cell 4's `p = p[...]`** uses `p` for both the p-value and the probability function in one line.
- **"Asymptotically approximately exact"** (cell 2) is a nice phrase and slightly self-undermining. It means "exact in the limit, approximate in practice," which is worth saying plainly at least once.

---

## 8. Delivery plan

**Modes:** 🟦 notebook (student copy) · 🟩 instructor cells (pre-written, never live) · ⬛ board · 🟨 HTML widget

| # | Step | Mode | Time | Notes |
|---|---|---|---|---|
| 1 | Tuesday's puzzle, restated | ⬛ board | 3 min | `−1.868, +2.032` vs `±1.960`. Today explains the "nearly" and the "not quite" |
| 2 | **The CLT** | ⬛ board | 6 min | State it. Hammer: it's about `X̄ₙ`, not `X`; the shape of `X` is irrelevant; finite variance is required |
| 3 | **Convergence, watched** | 🟨 widget | 6 min | `class-11-clt/clt.html` — raise `n` and watch a skewed population's sample means go bell-shaped. **The session's one widget** |
| 4 | The substitution | ⬛ board | 5 min | Same interval formula, `q` from a table. **Write 1.960, not the notebook's 1.995** |
| 5 | The p-value substitution | ⬛ board | 4 min | Cell 4's indicator → probability. The moment the bootstrap becomes optional |
| 6 | **What you keep the bootstrap for** | ⬛ board | 3 min | Median, IQR, ratios, small `n`. "You stop needing it for the mean and still need it for everything else" |
| 7 | The t-distribution | 🟩 instructor cell | 5 min | Plot t against the normal at `df = 5, 10, 32`. Show the critical-value table from §2 |
| 8 | **Two-sample t-test** | ⬛ board | 6 min | The five-step recipe. `√(s²_A/n_A + s²_B/n_B)`, and why it's a sum of squares |
| 9 | The paired-data caution | ⬛ board | 3 min | Same units measured twice ⇒ take differences first. Highest practical value in the session |
| 10 | **Lab** | 🟦 notebook | rest | See below |

**Build cost: steps 7 and part of 3 (~25 min).**

### The lab

Nothing is listed, and `homework_11_clt_bootstrap.md`'s **five simulation prompts** are already written for exactly this — they're described as *"designed to make the connection between the bootstrap ECDF of standardized statistics and the standard normal CDF `Φ` explicit."* That is today's session as an exercise.

Natural shape, reusing what students already have:

1. Take the car-price data from Sep 24's lab. Bootstrap the mean, standardize, and plot the ECDF of `Z_b` against `Φ`. They should nearly coincide.
2. Compare the percentile CI against `Ŝ ± 1.96·SE`. Quantify the gap.
3. Repeat for the **median**, where the CLT gives you nothing and the bootstrap still works.
4. Sub-sample to `n = 10, 25, 92` and watch the `Z` quantiles march toward `±1.96` — a measured answer to "how large is large enough?"

Step 3 is the one that matters: it's the concrete demonstration that the two tools are complements, not rivals.

**Cut first:** step 7's plot (keep the table). **Do not cut** steps 2, 6, or 9.

---

## 9. Look ahead

- **Midterm is Oct 8**, one week away, with fall break between. This is the last content session, so leave time to say what's examinable.
- **The most examinable ideas of the first half**, in order: CI interpretation (Sep 24 §6 Q2), SD vs SE (Sep 29 §6 Q1), "the CLT is about `X̄ₙ` not `X`" (today), unbiased vs consistent (Sep 3, Sep 15), and "fail to reject ≠ no effect" (Sep 24). All concept-driven, all handwritable, none requiring computation.
- **`Ŝ ± q × SE` is the template** for every interval in the unplanned second half — regression coefficients most of all.
- **Weeks 8–15 are blank in the spreadsheet.** The old docx sketched two+ RVs, Markov chains, likelihood/MLE, regression, optimization, and DP, and `uu_sp26` has substantial source for most of it. Worth planning before the midterm so the second half doesn't arrive cold.
- **`sp26` has practice exams** — `practice_exam_1.ipynb`, `practice_exam_2.ipynb`, `exam_topics.ipynb`. Those are the midterm's raw material.

## 10. Looking back

- **Tuesday set up the exact puzzle today solves.** If step 1 lands, the whole session is a payoff rather than a new topic.
- **Sep 22's lightbulbs already showed the phenomenon** — exponential data, bell-shaped sample means, and the notebook said "nothing is normal here." Today names why.
- **Sep 24's percentile interval was flagged as a convention needing symmetry.** The CLT is the defence, and §3 closes that thread.
- **Sep 3's `V[X̄ₙ] = σ²/n`** is the `σ/√n` in the CLT's denominator. It's been the same quantity for a month.
- **Sep 10's Cauchy** is why "finite variance" appears in the statement.
- **Week 1 Thursday's Pythagoras** is why standard errors add in squares (§6 Q5).

---

## 11. Source map

- `class_11/10_2_CLT.ipynb` — 7 cells, all markdown. Asymptotic statistics (0, **the best framing in the notebook**), the CLT (1, typos), using the CLT (2), **confidence intervals (3, wrong critical value)**, p-values (4, good derivation), **the t-distribution (5)**, **two-sample t-tests (6, the strongest cell)**.
- `class_11/homework_11_clt_bootstrap.md` — 15 paper problems + 5 simulation prompts. Problems 1–3 were Tuesday's; 4–15 and all simulations are today's. Supplies correct critical values (1.645 / 1.96 / 2.576) and `Φ` values.
- `labs/class-11-clt/` — `clt.html`, `lecture.html`, and the CLT convergence widget.
- Data for the demonstrations: `labs/class-10-bootstrap/data.json` (92 car prices), already used Tuesday.
- `sp26/understanding_uncertainty_assignments/` — `practice_exam_1`, `practice_exam_2`, `exam_topics` for the midterm.

## 12. Open questions

- 🔴 **Fix `1.995 → 1.960` in cell 3 before this is taught or recorded.** The problem set already disagrees with it.
- 🔴 **Rename the pre-cell-5 "t-statistics" to `Z`.** Cell 5 introduces the real t-distribution; having one word mean two things four cells apart is a guaranteed confusion, and it's a global find-and-replace.
- **Is the t-material in or out?** The schedule says *"maybe need to add in t-test formalization"* and cells 5–6 already have it, well written. My view: keep it — Tuesday creates the need, `homework_11` assumes it, and the two-sample recipe is the most immediately useful thing in the first half.
- **Does a lab get built?** `homework_11`'s five simulation prompts are the natural basis and require nothing new. §8 has a four-step shape.
- **Is the midterm written?** It's a week out. `sp26` has two practice exams and a topics list; `quizzes/` in this repo is empty, and `CLAUDE.md` has conventions for printable scantron-ready exams if that's the format.
- **When does second-half planning happen?** Weeks 8–15 are blank. The `uu_sp26` coverage analysis in the README still stands and would make that planning fast.
