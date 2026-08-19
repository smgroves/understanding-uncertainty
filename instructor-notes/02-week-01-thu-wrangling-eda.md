# Week 1, Thursday (Aug 27) — Data Wrangling and EDA

- **Schedule focus:** Data wrangling + EDA
- **Day type:** Lab / Coding Day — **the foreign gifts lab starts in class**
- **Sources:** `uu_fa26/Proposed schedule/Week 1/01_Tues_video_01_1_wrangling.ipynb` (12 cells), `02_Tues_guided_01_2_eda.ipynb` (17 cells), `03_Tues_activity_00_lab_filled.ipynb` (30 cells)
- **Also:** `sp26/00_understanding_data/00_pandas_review.ipynb`; html `labs/class-01-wrangling/lecture.html`

> **⚠ Read section 7 before you teach this.** There are three confirmed bugs in the source notebooks, and two of them are in code students will copy. They are present in both the ported Week 1 copies *and* the originals in `class_01/`, so both need fixing.
>
> **Note the day change.** This session moved from Tuesday to Thursday when intro/setup took Aug 25, so it is now a **lab day**: the foreign-gifts material is the lab. There is no quiz — the first is Sep 8.

---

## 1. What students actually see

| Artifact        | File                               | Content                                                               |
| --------------- | ---------------------------------- | --------------------------------------------------------------------- |
| Pre-class video | `01_Tues_video_01_1_wrangling`   | The six-step wrangling workflow, all markdown — no code cells at all |
| Guided notebook | `02_Tues_guided_01_2_eda`        | Statistics on single variables, then pairs. Also all markdown         |
| Activity        | `03_Tues_activity_00_lab_filled` | Foreign Gifts data, 8 questions,`groupby` + plotly/seaborn          |
| Board           | —                                 | The mean, the variance, the median, and why the last one differs      |

**Note both lecture notebooks are markdown-only.** Twelve and seventeen cells, no executable code. That's fine for a video, but it means the *guided* session has nothing to run — you'll be reading slides unless you live-code against the Foreign Gifts data or lift cells from the activity. Decide which before Tuesday.

The activity is the real substance of the hour: Foreign Gifts (foreign donations to US universities), answering which country gives the most in total, which by count, which the largest on average, and the same three by institution. Several code cells in the "filled" version are **empty** (cells 10, 12, 18, 20, 27) — those are the ones students fill in, so "filled" means *scaffolded*, not *solved*.

---

## 2. The content, from scratch

Three ideas, and the third is the only one with any depth.

**The wrangling workflow.** Load → schema → types and casting → missing values → filter → save. The two non-obvious steps are casting and missing values.

*Casting* matters because a CSV has no types. A monetary column arrives as the string `-$1,320.15` and a temperature as `23C`; pandas stores both as `object` and silently refuses to do arithmetic. The fix is strip-then-coerce: remove the offending characters, then `pd.to_numeric(col, errors='coerce')`. Note what `errors='coerce'` does — anything unparseable becomes `NaN` rather than raising. That is convenient and dangerous: it converts a data-quality problem into a missing-data problem silently. Always check `isna().sum()` before and after a coercion.

**Missing values.** The notebook's line — *"Missing data is not an inconvenience: It is information about the data gathering process"* — is the whole lesson, and it's worth knowing the standard taxonomy behind it even though the notebook doesn't name it:

- **MCAR** (missing completely at random): missingness is unrelated to anything. Dropping rows is unbiased, just wasteful. Rare in practice.
- **MAR** (missing at random): missingness depends on *observed* variables — high earners skip the income question, and you observe occupation. Recoverable if you condition on what you have.
- **MNAR** (missing not at random): missingness depends on the *unobserved value itself* — high earners skip the income question and you have nothing else that predicts income. Not recoverable from the data alone.

This is why the notebook creates **missing-value dummies** (`df[f'{var}_NA'] = df[var].isna()`) before imputing. The dummy preserves the fact of missingness as its own variable, so if missingness is informative, a later model can use it. Impute without the dummy and you destroy that information permanently.

And know what imputation costs: filling with the median **shrinks the variance** of that variable and **attenuates its correlations** with everything else, because you've inserted a pile of identical values at the center. Mean/median imputation is a convenience, not a repair. Say that out loud — `fillna(mean)` is the reflex every tutorial teaches, and this may be the only course that tells them what it costs.

**Mean, variance, median, quantiles, IQR.** For a sample `X = (x₁,…,xₙ)`:

```
M(X) = (1/n) Σ xᵢ                       sample mean
V(X) = (1/n) Σ (xᵢ − M(X))²             sample variance     ← note the 1/n, see §7
sd(X) = √V(X)
median                                   the value with half the data on each side
f-th quantile                            the value with proportion f below it
IQR = Q(.75) − Q(.25)                    the robust analogue of variance
```

The depth here is the *pairing*: mean↔variance are the non-robust pair, median↔IQR the robust pair. "Robust" has a precise meaning — an estimator whose value is not driven by a small fraction of extreme observations. One arbitrarily large outlier moves the mean without limit; it cannot move the median past the next data point. That's the content of the Foreign Gifts question 6 ("average vs. median amount — if they are different, why?"), and the answer is: gift amounts have a long right tail, so the mean sits well above the median.

**Two transformations for long tails.** `log(x)` is standard but undefined at 0 and for negatives. The notebook prefers **inverse hyperbolic sine**:

```
arcsinh(x) = ln(x + √(x² + 1))
```

which is defined everywhere, equals 0 at 0, and behaves like `ln(2x)` for large positive `x`, so it compresses tails like a log while tolerating zeros and negative values. **One caveat the notebook doesn't mention:** unlike `log`, arcsinh is *not* scale-invariant — `log(kx) = log k + log x` shifts by a constant, but `arcsinh(kx)` doesn't, so the units you measure in change the answer. This is an active argument in applied economics. Not worth raising unprompted; worth knowing if a sharp student asks whether it's "just a log."

---

### Reading

*Key in `README.md`. From `Reading-Roadmap.md` unless marked [Map] (= `prep/ds5030_syllabus_reading_map.pdf`).*

- **Primary** — none. Neither Wasserman nor B&H teaches data wrangling; it's assumed background everywhere.
- **Supporting** — **AoS Ch. 3** (Expectation), for the mean/variance/covariance formulas EDA leans on.
- **Intuition first** — **Spiegelhalter**, Introduction, *"Turning the World Into Data,"* pp. 7–12. Several pages, before any statistics, on how hard it is to define one countable "thing" — the running example is counting the trees on the planet. The point is that data collection is already a judgment call, which is exactly this session's §2 on casting and missing values.
- **Visuals for class** — **Spiegelhalter (free sample)** Figs 0.1–0.2, pp. 3 & 5: the Harold Shipman case, a scatter of victims' ages against year of death and a time-of-day line graph, both patterns obvious with zero formal analysis. **Fig 0.3**, p. 14, the PPDAC cycle. **Table 1.1 & Fig 1.1**, pp. 23 & 26 — real 13-hospital child-heart-surgery data replotted with a truncated axis to show how that one choice exaggerates differences. That last pair is a ready-made opening.

---

## 3. The optimization view

- **Objective:** total squared distance from the data to one summary number `c`: `Σ(xᵢ − c)²`
- **Argmin:** the sample mean. Swap to absolute distance `Σ|xᵢ − c|` and the argmin becomes the median.
- **Solved by:** closed form, and also by grid search — scan `c` and watch it bottom out.

This is the first vertebra of the course-long spine, and stating it here is what makes Week 8's conditional expectation and Week 11's regression feel inevitable rather than new. It also *explains* robustness rather than asserting it: squaring makes one distant point enormously expensive, so the mean moves to appease it, while absolute distance charges every point the same rate and the median doesn't budge.

The `labs/activity-min-sum-squares/` widget in this repo does exactly this interactively if you want it.

---

## 4. Assumptions that make it work

| Claim                                     | Assumption                                                                                         |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------- |
| The mean is a sensible summary            | The distribution has a finite mean, and is not so skewed that "typical" is misleading              |
| `Σ(xᵢ−c)²` has a unique argmin      | Always true — it's a strictly convex parabola in`c`. No conditions needed                       |
| The median is the argmin of`Σ\|xᵢ−c\|` | True, but**not unique** for even `n` — any value between the two middle points works      |
| Median imputation is harmless             | Essentially never. Requires MCAR*and* you accept variance shrinkage                              |
| Dropping incomplete rows is safe          | MCAR only. Under MAR or MNAR it biases everything downstream                                       |
| `df.describe()` is informative          | The variable is already correctly typed. On an`object` column it silently reports nothing useful |

---

## 5. Concrete failure cases

**The silent coercion cascade.** `pd.to_numeric(col, errors='coerce')` on a column where 30% of values have an unexpected format turns 30% of your data into `NaN` and raises nothing. Then `.mean()` skips `NaN` by default, so you get a confident number computed on 70% of the data with no warning. Demonstrate this: coerce before stripping the `$` and watch the count collapse.

**Mean-median divergence on Foreign Gifts.** This is built into activity question 6 and it will be dramatic — a handful of enormous gifts (Qatar, China) drag the mean far above the median. Good; that's the lesson.

**`groupby` and missing keys.** `df.groupby(col)` **silently drops rows where `col` is NaN** (default `dropna=True`). On the Foreign Gifts data, if country or institution has missing values, your "total by country" quietly omits them and the totals won't reconcile with `df['amount'].sum()`. Worth checking live — it's the kind of error that produces a plausible wrong answer.

**Even-`n` median.** The notebook's hand-rolled `median()` averages the two middle values for even `n`. Fine, but it means the median of `[1, 2, 3, 4]` is `2.5`, a value that appears nowhere in the data. Students sometimes object to this on principle.

**Quantile convention mismatch.** See §7 — the hand-rolled `quantile()` will disagree with `np.quantile()`, and a student who checks will find it.

---

## 6. Five questions students will ask

**Q1. "Why divide the variance by `n` and not `n−1`? Pandas gives me a different number."** Both are used and they answer different questions. `(1/n)Σ(xᵢ−x̄)²` is the variance *of the sample you have* — a description. `(1/(n−1))Σ(xᵢ−x̄)²` is the unbiased *estimate of the population variance* — an inference. The `n−1` (Bessel's correction) exists because you used the data twice: once to compute `x̄` and again to measure spread around it, which systematically underestimates spread. The course is doing description this week and inference from Week 4 onward, so it will switch. **Be ready for the concrete trap: `numpy` defaults to `n` (`ddof=0`) and `pandas` defaults to `n−1` (`ddof=1`)**, so `np.var(x)` and `df[col].var()` disagree on the same data. That is a guaranteed question the moment anyone checks. `labs/activity-bessel-correction/` in this repo demonstrates it.

**Q2. "Why not just drop rows with missing data? It's cleaner."** Because you'd be assuming MCAR, and you can't check that assumption from the data. If people with high incomes skip the income question, dropping them doesn't give you a smaller unbiased sample — it gives you a sample of poorer people, and every statistic you compute afterwards is wrong in a direction you can't see. The missing-value dummy is the cheap defence: keep the fact of missingness as data.

**Q3. "Which should I report, the mean or the median?"** Whichever answers the question being asked, and say which one you used. The mean is the right answer for totals-per-capita questions, because `mean × n = total` and the median has no such property — for Foreign Gifts, "average gift × number of gifts" recovers total money and the median cannot. The median is the right answer for "what does a typical case look like." The failure mode is reporting the mean of a long-tailed variable while *describing* it as typical.

**Q4. "Isn't `arcsinh` just a log?"** Nearly, in the right tail — `arcsinh(x) ≈ ln(2x)` for large `x`. The differences: it's defined at 0 and for negative values, which log isn't, and it is *not* scale-invariant, which log is. So it's the right tool for a long-tailed variable containing zeros or negatives (net flows, changes, balances), and the price is that the units matter.

**Q5. "80% of data science is cleaning data — is that really true?"** Mostly, and the useful reframe is *why*: cleaning is where the modelling assumptions actually get made. Every casting decision, every imputation, every dropped row is a substantive claim about the data-generating process, made before any model runs. It's not 80% drudgery-before-the-real-work; it's 80% because that's where the decisions live.

---

## 7. Bugs and simplifications in the material

### Confirmed bugs — verified in the notebook JSON

1. **`import pandas as plt`** — `01_Tues_video_01_1_wrangling` cell 2, in "The Standard Stack" code block. Should be `import pandas as pd`. It also clobbers the `matplotlib.pyplot as plt` import on the line above. Students *will* copy this block. **Also present in `class_01/01_1_wrangling.ipynb` cell 2.**
2. **`df[var].unique_values()`** — `01_Tues_video_01_1_wrangling` cell 7 and `02_Tues_guided_01_2_eda` cell 3, both in the "Getting to Know a Variable" list. **No such pandas method.** Correct is `df[var].unique()` (or `.nunique()` for the count). **Also present in `class_01/01_1_wrangling.ipynb` cell 7 and `class_01/01_2_eda.ipynb` cell 3** — four places total.
3. **IQR computed wrong** — `02_Tues_guided_01_2_eda` cell 10. The prose says *"the difference between the .75 quantile and the .25 quantile"*, and the code says:
   ```python
   IQR  = np.quantile(X,.75)-np.quantile(X,.50)      # ← .50 should be .25
   ```

As written this is `Q3 − median`, roughly *half* the true IQR. **Also present in `class_01/01_2_eda.ipynb` cell 10.** This one matters beyond week 1: the robust Silverman bandwidth in Week 3's KDE uses `IQR/1.34`, so a wrong IQR propagates into a wrong bandwidth.

Fix all three in both the `Week 1/` copies and the `class_01/` originals, or they'll be re-introduced next time someone ports from the originals.

### Simplifications, not errors

- **`V(X) = (1/n)Σ(...)²`** is a deliberate choice, not a mistake — description before inference. But it collides with pandas' default (Q1) and with the estimator language arriving in Week 4. Flag it as a choice rather than letting students discover the inconsistency.
- **The hand-rolled `quantile(X, frac)`** uses `index = max(ceil(n*frac) - 1, 0)`, which is the "lower/inverse-CDF" convention. `np.quantile` defaults to **linear interpolation**. The two give different answers on the same data, and the notebook says *"Of course, `np.quantile(X,f)` will do this for you"* — which slightly overstates it. There are ~9 standard quantile conventions; nothing is wrong here, but the word "this" is doing some work.
- **`df[var].hist(bins=35)`** appears in the variable-inspection list, which only works for numeric columns. On a categorical it errors. Minor, but it's in a list presented as a general recipe.
- **The `.describe()` shortcut** is offered without noting that it behaves completely differently for numeric vs. object dtypes. Worth one sentence, since types are the previous section's topic.

---

## 8. Delivery plan

**Modes:** 🟦 notebook (student copy) · 🟩 instructor cells (pre-written, never live) · ⬛ board · 🟨 HTML widget

| # | Step                                                      | Mode                | Notes                                                                                                                                                   |
| - | --------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 | Recap Tuesday's setup; confirm everyone can import pandas | 🟩 instructor cell  | Thirty seconds. Anyone who failed the Aug 25 checkpoint surfaces here                                                                                   |
| 2 | The six-step wrangling workflow                           | 🟦 notebook         | They watched the video. Skim it, don't re-teach it                                                                                                      |
| 3 | **The casting trap**                                | 🟩 instructor cells | Strip`$`, coerce, `isna().sum()` before and after. From Terry's video; i**mportant to rehighlight**                                                |
| 4 | Mean, variance, median, IQR                               | ⬛ board            | First math of the semester. Write the formulas properly; it sets the tone                                                                               |
| 5 | The optimization view (§3)                               | ⬛ board            | Two lines. The one thing from today that recurs all semester                                                                                            |
| 6 | Long tails: raw vs log vs arcsinh                         | 🟨 widget           | `class-01-wrangling/wrangling.html#viz-transform` — three transforms of the same price data, side by side. Cheaper and clearer than plotting it live |
| 7 | Foreign Gifts activity, in pairs                          | 🟦 notebook         | Reach question 6 (mean vs median) — that's the one with the lesson                                                                                     |

Detail on the sequencing below. **Build cost for this session: the step-3 cells (~20 min).** Everything else exists.

Thursday is a lab day, so board time is short and the lab has to start in class.

1. **Course framing** (whatever you want here — the syllabus's "AI-proof your career" line is a good hook).
2. **The wrangling workflow**, six steps, from the video. Fast — they watched it.
3. **Live-code the casting trap** on Foreign Gifts. Strip `$`, coerce, check `isna().sum()` before and after. This is the highest-value five minutes of the hour and it isn't in either notebook.
4. **Board: the four statistics.** Mean, variance, median, IQR. Write the mean and the variance formulas properly — this is the first math on the board all semester and it sets the tone that formulas get written, not gestured at.
5. **Board: the optimization view** (§3). Mean minimizes squared distance, median minimizes absolute distance. Two lines. This is the single thing from today that recurs all semester.
6. **Activity**, in pairs. Aim to reach question 6 (mean vs. median) — that's the one with the lesson in it. Questions 7–8 (crosstab, alluvial) are nice-to-have.

If short on time, cut the plotly/alluvial cells (21–24), not the mean-vs-median question.

---

## 9. Look ahead

- **The argmin framing (§3) is load-bearing.** It returns in Week 3 (KDE bandwidth), Week 8 (conditional expectation is the argmin over *functions*), Week 11 (regression), and Weeks 13–14 (optimization proper). Plant it today in one sentence — "the mean is the answer to a minimization problem" — and every later session can point back.
- **IQR reappears in Week 3.** The robust Silverman bandwidth is `0.9·min{sd, IQR/1.34}·n^(−1/5)`. Get the IQR bug fixed now or Week 3's bandwidths are wrong.
- **The `1/n` vs `1/(n−1)` choice comes due in Week 4.** Sampling distributions introduce unbiasedness, and that's when `n−1` becomes necessary rather than pedantic. Say today that the divisor is a choice you'll revisit, so it lands as a promise kept rather than an inconsistency.
- **Median → quantiles → Week 3's quantile function.** Today's quantile is a sorted-data index; Week 3 makes it `F⁻¹`. Same object, and Week 3 is easier if today's version was defined carefully.
- **Covariance appears in the EDA notebook (cell 14) but is not developed.** Sep 3 derives it as a centered dot product. Don't spend time on it today — hand it forward.
- **MCAR/MAR/MNAR** never formally returns, but it's the honest foundation for Week 11's omitted-variable bias discussion. Worth naming once so the vocabulary exists.

## 10. Looking back

Nothing — this is session one. The only prerequisite is the pre-course Python/pandas setup (`sp26/00_understanding_data/00_pandas_review.ipynb`, `00_github.ipynb`, and `class_tools/`).

---

## 11. Source map

- `Week 1/01_Tues_video_01_1_wrangling.ipynb` — 12 cells, **all markdown**. Cells 1–11 are the six-step workflow in order.
- `Week 1/02_Tues_guided_01_2_eda.ipynb` — 17 cells, **all markdown**. Cells 2–11 single variables; cells 12–15 pairs of variables; cell 16 empty.
- `Week 1/03_Tues_activity_00_lab_filled.ipynb` — 30 cells. Code in 2, 4, 6, 8, 14–16, 22, 24–25; **empty code cells at 10, 12, 18, 20, 27** (student work); questions in markdown alert boxes.
- Originals: `class_01/01_1_wrangling.ipynb`, `01_2_eda.ipynb`, `00_lab.ipynb` (16 cells).
- Also available: html `labs/class-01-wrangling/lecture.html` — same content, prose form, with an interactive long-tail widget. Not student-facing unless you choose to share it.
- Data: Foreign Gifts. Confirm the CSV path resolves from the `Week 1/` folder before Tuesday.

## 12. Open questions

- **The guided notebook has no code.** Is `02_Tues_guided` meant to be taught as slides, or was it going to get code cells? If slides, consider merging the live-coding from step 3 of §8 into it.
- **What's the Tuesday/Thursday split for the activity?** `03_Tues_activity_00_lab_filled` is named *activity* but derived from `00_lab`, and Week 1 also has `Lab/lab_01_blank.ipynb`, which belongs to Thursday. Confirm with your co-instructor that Foreign Gifts is Tuesday's activity and `lab_01` is Thursday's lab — the naming suggests it but doesn't prove it.
- **Is there a pre-class video recorded**, or is the "video" notebook a script for one still to be made? Affects how much of the six-step workflow you re-cover live.
- **Is `00_lab.ipynb` (16 cells) superseded** by `03_Tues_activity_00_lab_filled.ipynb` (30 cells), or are they different assignments?
