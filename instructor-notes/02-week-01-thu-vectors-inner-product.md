# Week 1, Thursday (Aug 28) — Vectors, Matrices, and the Inner Product

- **Syllabus topic:** Vectors, matrices, and inner product
- **Day type:** Lab / Coding Day
- **Sources:** `uu_fa26/Proposed schedule/Week 1/04_Thurs_video_02_1_vectors_and_matrices.ipynb` (29 cells), `06_Thurs_guided_02_2_ortho.ipynb` (6 cells), `Lab/lab_01_blank.ipynb` + `lab_01_filled.ipynb`
- **Also:** `sp26/00_understanding_data/00_math_review.ipynb` §5 (Vector Spaces); html `labs/class-02-vectors/`

> **The one thing to get right today:** the inner product is not five topics (length, distance, covariance, correlation, matrix multiplication) — it is one operation wearing five costumes. If students leave with that, the session worked. If they leave with five formulas, it didn't.

---

## 1. What students actually see

| Artifact | File | Content |
|---|---|---|
| Pre-class video | `04_Thurs_video_02_1_vectors_and_matrices` | 29 cells: vectors, transpose, indexing, NumPy, reshape, mean/variance, addition, matrices, Hadamard, broadcasting, inner product, matmul |
| Guided notebook | `06_Thurs_guided_02_2_ortho` | 6 cells, **all markdown**: length, distance, covariance, orthogonality, DS applications |
| Lab | `Lab/lab_01_blank.ipynb` / `lab_01_filled.ipynb` | First graded lab — starts in class, due Sunday midnight |
| Board | — | The inner product, then length/distance/covariance as three instances of it |

**There is no cell numbered 05** in the Week 1 folder — the sequence runs `04_Thurs_video`, `06_Thurs_guided`. Either a file is missing or the numbering just skips; worth confirming.

The video notebook has real code (cells 4–8 load `cville_cars.csv` and `CardiacPatientData.csv` and make scatterplots; 12, 14, 16, 18, 23 do NumPy operations). The **guided notebook is markdown-only again** — six cells, no code. Same decision as Tuesday: live-code it or read slides.

---

## 2. The content, from scratch

**A vector is an indexed list of `n` numbers you can do arithmetic on.** A matrix is `ℓ` vectors of length `n` stacked. The pedagogical point the notebook leads with: *a dataframe is already a matrix* — rows are observations, columns are variables. Nothing new is being introduced, only notation for what they already use.

Row vs. column and the transpose are pure bookkeeping: `xᵀ` flips a row to a column. It changes no numbers. For a data scientist "row" always means observation and "column" always means variable.

**Indexing from 0.** Math writes `x₁,…,xₙ`; Python writes `x[0],…,x[n-1]`. Worth the thirty seconds — it's the single most common source of off-by-one errors, and students from R or MATLAB are actively mis-trained.

**NumPy and reshape.** Vanilla Python has no vector type. NumPy's arrays are internally 1-D and don't track row-vs-column until you force it: `x.reshape(1,-1)` or `x[None,:]` for a row, `x.reshape(-1,1)` or `x[:,None]` for a column. This matters only because broadcasting depends on it.

**Broadcasting** is the genuinely useful computational idea. Subtract a length-`n` row vector from a length-`m` column vector and NumPy expands both into an `m×n` grid of all pairwise results:

```
x.reshape(1,-1) - y.reshape(-1,1)   →   m×n matrix of (xⱼ − yᵢ)
```

That's a double `for` loop with no loop written, and it's how you compute an entire pairwise distance matrix in one line. It's also the mechanism behind Week 3's KDE and Week 8's LCLS estimator, both of which are `(data − grid)` broadcasts.

**The Hadamard product** `A * B` multiplies matching entries, requires identical shapes, and is **not** matrix multiplication. The notebook is explicit about this, correctly, because `A * B` is the mistake everyone makes once.

### The inner product, and why it's the whole session

For two `n`-vectors:

```
x · y = x₁y₁ + x₂y₂ + ⋯ + xₙyₙ = Σᵢ xᵢyᵢ
```

In NumPy: `x @ y` (or `np.inner(x,y)`). One number out. Now watch it generate everything:

| Object | Built from the inner product | Meaning |
|---|---|---|
| **Length** | `‖x‖ = √(x · x)` | generalizes `\|x\| = √(x²)` from one number to `n` |
| **Distance** | `‖x − y‖ = √((x−y)·(x−y))` | length of the difference |
| **Covariance** | `cov(X,Y) = (c_X · c_Y)/N`, where `c_X = X − m(X)` | a **centered** inner product |
| **Correlation** | `cov/(σ_X σ_Y)` | a centered **and normalized** inner product |
| **Cosine similarity** | `(X·Y)/(‖X‖‖Y‖)` | normalized, **not** centered |
| **Expectation** | `E[X] = Σ p(x)·x = p · X` | probabilities dotted against values |
| **Matrix multiplication** | entry `(r,c)` of `AB` is `a_{r,:} · b_{:,c}` | many dot products at once |

That table *is* the lecture. The notebook's own closing line is the right framing: *"The inner product creates the shape of space"* — length, angle, and distance are not separate axioms, they're consequences of this one operation.

**Orthogonality.** `x · y = 0`. The notebook flags it as *"one of the key mathematical concepts you return to over and over,"* which is correct, and it's worth knowing exactly where it returns: independence of random variables (Week 8), the optimality condition for regression coefficients `Xᵀ(y − Xβ) = 0` (Week 11), and PCA.

**The distinction worth being precise about:** covariance, correlation, and cosine similarity differ only in what they're invariant to.

- *Covariance* centers, so it's invariant to **shifts** but not scaling.
- *Correlation* centers and normalizes, so it's invariant to shifts **and** scaling.
- *Cosine similarity* normalizes only, so it's invariant to scaling but **not** shifts — it only sees direction from the origin.

All three are built from a dot product, so all three see **only linear structure**. A perfectly deterministic curved relationship can have zero covariance.

---

### Reading

*Key in `README.md`. From `Reading-Roadmap.md` unless marked [Map] (= `prep/ds5030_syllabus_reading_map.pdf`).*

- **Primary** — none, and this is one of the roadmap's two flagged gaps: all six reference texts assume linear algebra as prerequisite.
- **Supporting** — **B&H Appendix A.3**, *"Matrices"* (p. 550). Matrix addition/multiplication, transpose, eigenvalues. A compact mechanical reference that **never builds length, distance, or covariance from the dot product** the way this session does — so it's a partial match at best.
- **If you want a real second source** — Strang, rather than any of the six. [Map] suggests **QE, "Linear Equations and Matrix Algebra"** (`intro.quantecon.org/linear_equations.html`) as an applied refresher, useful because eigenvalues return for Markov chains and the multivariate normal.

---

## 3. The optimization view

- **Objective:** squared distance from `y` to the nearest multiple of `x`: `min_c ‖y − cx‖²`
- **Argmin:** `c* = (x·y)/(x·x)` — the projection coefficient. At `c*`, the residual `y − c*x` is **orthogonal** to `x`.
- **Solved by:** closed form — and with **no calculus at all**, because the shortest path from a point to a line is the perpendicular one.

This is the most valuable thing you can put on the board today, and it's not in either notebook. It gives you, in week one and with only Pythagoras, the exact result that Week 11's linear regression and Week 8's conditional expectation both rest on: **minimizing squared error makes the residual orthogonal.** Regression is this picture with more directions to project onto. Say that today and Week 11 becomes a callback instead of a new topic.

Given the cohort is calculus-shy, the geometric route matters: they can *see* this one. Draw the point, the line, the perpendicular. No derivatives.

---

## 4. Assumptions that make it work

| Claim | Assumption |
|---|---|
| `x · y` is defined | `x` and `y` have the **same length**. Nothing else |
| `‖x‖ = √(x·x)` is a length | Needs `x·x ≥ 0`, which holds for real vectors. (Fails for complex ones — irrelevant here) |
| `c* = (x·y)/(x·x)` | Requires `x ≠ 0`. Projecting onto the zero vector is undefined |
| `cov = 0` means no relationship | **False.** It means no *linear* relationship |
| Independence ⟹ zero covariance | True, and the converse is false. See Q3 |
| `AB` is defined | Inner dimensions match: `A` is `n×m`, `B` is `m×ℓ`. Hadamard needs *identical* shapes instead |
| Broadcasting does what you meant | It does what the **shapes** say. A stray 1-D array silently produces the wrong shape rather than erroring |

---

## 5. Concrete failure cases

**`A * B` vs `A @ B`.** The Hadamard/matmul confusion, and the reason it's nasty: on **square** matrices both are legal and return the same shape, so you get a wrong answer with no error. Demonstrate on two 2×2 matrices where the results differ — that's the only way it lands.

**Broadcasting silently doing the wrong thing.** `x - y` where both are 1-D of the same length gives elementwise subtraction (length `n`). Reshape one to a column and you get an `n×n` matrix. Both run. If a student forgets a reshape, they get a scalar-ish answer instead of a matrix, or vice versa, and NumPy never complains. This is the most common lab bug you'll see on Sunday.

**Zero covariance with perfect dependence.** Take `x = (−2,−1,0,1,2)` and `y = x²= (4,1,0,1,4)`. Then `cov(x,y) = 0` exactly, and `y` is a deterministic function of `x`. This example is worth doing on the board; it inoculates against "uncorrelated means unrelated" for the rest of the semester.

**Covariance's units are uninterpretable.** `cov(price, miles)` is in dollar-miles. Its magnitude means nothing on its own, which is the entire reason correlation exists. Students routinely try to read covariance magnitudes as effect sizes.

**Cosine similarity on un-centered data.** Two vectors of all-positive values (word counts, prices) have cosine similarity near 1 almost regardless of their pattern, because they're both in the positive quadrant. It's a real trap in embedding work.

**Numerical: `np.inner` on 2-D arrays** does not do what most people expect (it contracts the last axes, not matrix multiplication). Prefer `@` uniformly. The notebook offers both as if interchangeable — they are, for 1-D vectors only.

---

## 6. Five questions students will ask

**Q1. "Why is matrix multiplication defined that way? It seems arbitrary."** Because it's function composition, not a formula someone chose. A matrix represents a linear map; `AB` represents "do `B`, then do `A`." The row-times-column rule is what makes that work, and it's why the inner dimensions must match — `B`'s output lives in the space `A` takes as input. The Hadamard product is the "obvious" definition and it composes nothing, which is exactly why nobody uses it for this.

**Q2. "What's the difference between covariance, correlation, and cosine similarity?"** Only what each one ignores. All three are `x · y` with different preprocessing: covariance centers, correlation centers and scales, cosine scales only. So covariance survives shifting, correlation survives shifting and scaling, cosine survives scaling but is destroyed by shifting. Pick by asking which transformations of your data shouldn't change the answer.

**Q3. "If covariance is zero, are the variables independent?"** No, and this is the most important 'no' of the session. Zero covariance means no *linear* association. `y = x²` on a symmetric `x` has exactly zero covariance and total dependence. The implication runs one way: independence ⟹ zero covariance, never the reverse. (The one exception worth knowing, because it's the source of the confusion: for **jointly normal** variables, zero covariance *does* imply independence. That's Week 8's bivariate normal, and it's why the folklore feels true.)

**Q4. "Why do I keep having to reshape? Why doesn't NumPy know what I mean?"** Because a 1-D NumPy array genuinely has no row-or-column identity — it's a single axis, and "row vector" vs "column vector" is a 2-D concept. NumPy chose to keep 1-D arrays cheap rather than guess. The upside is broadcasting: once you *do* specify shapes, `(1,n)` against `(m,1)` producing `(m,n)` is unambiguous and replaces a double loop. The reshape is you telling NumPy which loop you wanted.

**Q5. "Why does everyone care about the dot product this much?"** Because it's the operation hardware is built to do. The notebook's own list is the answer: covariance, correlation, expectations, regression coefficients, predictions `ŷᵢ = xᵢ·β`, cosine similarity of embeddings, word2vec, attention as scaled dot products, and every layer of a neural net being stacked dot products with a nonlinearity between them. GPUs exist to compute these in parallel. The practical upshot for them: **translating an ML idea into fast code is usually the problem of rewriting it as a dot product.**

---

## 7. Bugs and simplifications in the material

### Verified

- **`x.var()` is correct here, but the pandas twin is not.** Cell 17 states `s² = (1/n)Σ(xᵢ−x̄)²` and says *"to implement that in numpy, you `x.var()`"*. That's right — `numpy` defaults to `ddof=0`. Cell 18 prints the loop result and `x.var()` side by side and they'll match. **But `df[col].var()` in pandas defaults to `ddof=1`** and will not match. Since Tuesday used pandas throughout and today uses NumPy, students will cross the boundary. See Week 1 Tuesday §6 Q1.
- **Cell 26's row-vector example has a typo.** `a_{r,:}` is written as `[a_{21} a_{22} … a_{2m}]` — those are row-2 subscripts, presented as the general `r`-th row. Should be `a_{r1}, a_{r2}, …, a_{rm}`. Cosmetic, but it's the cell that *defines* the shorthand used in the next two cells.
- **No cell 05 in the folder.** `04_Thurs_video` → `06_Thurs_guided`. Confirm nothing is missing.

### Simplifications

- **"The inner product creates the shape of space"** (cell 24) is a lovely line and slightly overstated — an inner product induces *one* geometry; there are others (any norm gives a distance, e.g. `L¹`). Fine as said; just don't defend it as the only possibility if challenged.
- **Covariance is defined dividing by `N`** (guided cell 3), consistent with Tuesday's `1/n` variance and inconsistent with `df.cov()`, which uses `N−1`. Same issue as the variance; same fix (name it as a choice).
- **`np.inner(x,y)` and `x @ y` are presented as equivalent.** True for 1-D; false for 2-D. Recommend `@` and don't mention `np.inner` at all, or the lab will produce confusing results for anyone who tries it on matrices.
- **Correlation is never actually defined** in either notebook. Covariance is (guided cell 3), and correlation appears only in cell 5's applications list as "a normalized dot product." Given Q2 above will come up, consider adding the one-line formula `corr = cov/(σ_X σ_Y)` to the board.
- **Cosine similarity is not in the notebooks at all**, but it's in the DS-applications list (embeddings, word2vec, attention). Some students will arrive from CS backgrounds and ask about embeddings anyway; most will not have met them yet, since ML is a *concurrent* course, not a prerequisite. The html `labs/class-02-vectors/lecture.html` has the full treatment including the invariance comparison.

---

## 8. Delivery plan

**Modes:** 🟦 notebook (student copy) · 🟩 instructor cells (pre-written, never live) · ⬛ board · 🟨 HTML widget

| # | Step | Mode | Notes |
|---|---|---|---|
| 1 | The inner product, `x · y = Σ xᵢyᵢ` | ⬛ board | One line. The whole session's content |
| 2 | The costume table (§2) | ⬛ board | Length, distance, covariance — *derived from* the dot product, three lines each. Not three topics |
| 3 | The optimization view (§3) | ⬛ board | Point, line, perpendicular. Two minutes, no calculus, pays off in Week 11 |
| 4 | **`cov = 0` with perfect dependence** | 🟨 widget | `class-02-vectors/vectors.html#viz-zero-cov` — *"drag the points, make it curve, keep the covariance flat."* **Strictly better than the board here**: they get to try to break it and fail. This is the session's one widget |
| 5 | **Broadcasting → pairwise distance matrix** | 🟩 instructor cells | One line for the distance matrix, then **run it again with a missing reshape** so they see the silent wrong shape. This is the bug they will hit in the lab |
| 6 | Matrix multiplication | 🟦 notebook | Video cells 25–28. Not load-bearing until Week 11 — let them read it |
| 7 | Start `lab_01` | 🟦 notebook | First graded lab. Leave real time; reshape errors will be frequent |

**Build cost: the step-5 cells (~15 min).** Time yourself through `lab_01_blank` before Thursday.

Thursday is Lab/Coding day, so board time is short and the lab must start in class.

1. **Board: the inner product.** One line: `x · y = Σ xᵢyᵢ`. That's the whole session's content.
2. **Board: the costume table** (§2). Length, distance, covariance — derive each *from* the dot product, in that order, three lines each. Do not present them as three topics.
3. **Board: the optimization view** (§3). Point, line, perpendicular. `c* = (x·y)/(x·x)`, residual orthogonal. Two minutes, no calculus, enormous payoff in Week 11.
4. **Board: `cov = 0` with `y = x²`.** The five-point example from §5. Ninety seconds, permanent immunity.
5. **Live-code broadcasting** — the pairwise distance matrix in one line, from video cell 23. Then run it with a missing reshape so they see the silent wrong shape. This is the bug they'll hit in the lab.
6. **Start the lab** (`lab_01_blank.ipynb`). Leave real time — it's the first graded lab and the first time they'll hit reshape errors with a deadline attached.

If short: cut matrix-times-matrix (video cells 27–28). They can read it; it isn't load-bearing until Week 11.

---

## 9. Look ahead

- **Orthogonality is the single most important plant of the week.** It returns as independence (Week 8), as the regression optimality condition `Xᵀ(y − Xβ) = 0` (Week 11), and in PCA. Say explicitly: "we'll see this equation again three times."
- **Projection ⟹ Week 8 and Week 11.** `E[Y|X]` is the projection of `Y` onto functions of `X`; OLS is the projection onto linear functions. Today's picture is literally those results in two dimensions. This is the strongest single reason to spend the two minutes on §3.
- **Broadcasting ⟹ Week 3 (KDE) and Week 8 (LCLS).** Both estimators are `(data − grid)` broadcasts with a kernel applied. Students who don't get broadcasting today will be lost in the Week 3 lab for reasons that look like they're about kernels.
- **`E[X] = p · X` (guided cell 5) is a forward reference to Week 2.** It's listed as an application before expectation has been defined. Either flag it as a preview or skip it — don't let it read as an assumed prerequisite.
- **Zero covariance ≠ independence sets up Week 8's bivariate normal**, where the implication *does* run both ways. That's the payoff for today's counterexample; mention that an exception is coming.
- **Covariance's `1/N` vs `1/(N−1)`** joins Tuesday's variance question and both come due in Week 4.

## 10. Looking back

- **Tuesday (Aug 26)** defined the mean and variance for a data column; today re-derives both as vector operations and adds covariance. If Tuesday's `1/n` convention wasn't flagged as a choice, flag it today.
- Tuesday's EDA notebook (cell 14) introduced `cov(X,Y)` with the summation formula and `df.cov()`. Today gives it the geometric meaning. Explicitly connect the two so it doesn't read as a second definition.
- Pre-course: `sp26/00_math_review.ipynb` §5 covers vector spaces, inner product, matrices, matrix inverse, and even a quick linear-regression example — useful background reading for you, more advanced than today.

---

## 11. Source map

- `Week 1/04_Thurs_video_02_1_vectors_and_matrices.ipynb` — 29 cells. Markdown throughout; **code at 1, 4–8, 12, 14, 16, 18, 23**. Structure: intro (2), vectors (3), data scatterplots (4–8), transpose (9), indexing (10), NumPy (11–12), reshape (13–14), mean (15–16), variance (17–18), addition/scalar (19), matrices (20), Hadamard (21), broadcasting (22–23), **inner product (24)**, matmul (25), notation (26), matrix-vector (27), matrix-matrix (28).
- `Week 1/06_Thurs_guided_02_2_ortho.ipynb` — 6 cells, **all markdown**: length (1), distance (2), covariance (3), orthogonality (4), DS applications (5).
- `Week 1/Lab/lab_01_blank.ipynb` and `lab_01_filled.ipynb` — the graded lab.
- Originals: `class_02/02_1_vectors_and_matrices.ipynb`, `02_2_ortho.ipynb`, plus `02_lab.ipynb`, `group_work.ipynb`, `labs.ipynb`, and `zzz_01_2_ortho.ipynb` (an older ortho draft — check which is current before editing).
- Data: `cville_cars.csv`, `CardiacPatientData.csv` (both in `class_02/`; confirm they resolve from `Week 1/`).
- Also: html `labs/class-02-vectors/lecture.html` — includes a draggable dot-product/projection widget and the full correlation/cosine invariance comparison the notebooks omit.

## 12. Open questions

- **Is a file missing between `04_` and `06_`?** The Tuesday sequence runs 01, 02, 03; Thursday runs 04, 06.
- **`zzz_01_2_ortho.ipynb` vs `02_2_ortho.ipynb`** in `class_02/` — which is canonical? The `zzz_` prefix suggests deprecated, but it's 14 cells against the current 12, so it may contain material that was cut.
- **The guided notebook has no code, again.** Same question as Tuesday: slides, or unfinished?
- **Should correlation and cosine similarity be added?** Neither is defined in the notebooks, correlation is needed for Week 11 regardless; cosine similarity is optional, since most students have not met embeddings yet. My recommendation: add correlation (one line, needed for Week 11), mention cosine only if asked.
- **How long does `lab_01` actually take?** It's the first graded lab and the reshape-error rate will be high. Worth timing yourself through the blank version before Thursday.
