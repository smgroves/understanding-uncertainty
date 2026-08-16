# Week 9, Tuesday (Oct 20) — Empirical Markov Chains

- **Syllabus topic (tentative):** Empirical Markov Chains · week theme *"Markov Chains"*
- **Day type:** Quiz / Math Day
- **Primary source:** `uu_sp26/.../00_understanding_data/04_dynamics.ipynb` §1–2, cells 0–30 (45 cells total)
- **Data — all present:** `tuna.csv` (802,282 nucleotides), `bach.data`, `bach.py`, `music.mid`, `src/piano-keys-chart.jpg`, all in `00_understanding_data/`
- **Dependency:** `networkx`, for the connectivity check (cell 28)
- **Thursday:** §3 of the same notebook — simulation and forecasting — plus `sp26` `assignment_5` **and its solutions**

> **This is the best-resourced session in the second half.** The notebook has working code throughout, the data is actually in the repo, and Thursday's lab already exists with solutions. After four straight sessions of markdown-only material and missing datasets, this one mostly needs porting.
>
> **It also sits exactly between Oct 13 and Oct 15.** A transition matrix is a table of *conditional* proportions — `p̂[Xₜ = z′ | Xₜ₋₁ = z]` — so this is Sep 1's conditioning and Oct 15's conditional distribution, estimated by counting. Nothing new is being invented; a familiar object is being applied to a sequence.

---

## 1. What students actually see

| Artifact | File | Status |
|---|---|---|
| Quiz | — | On Week 8: joint density, independence, conditional expectation |
| Pre-class video | `04_dynamics` §1 (cells 0–13) | needs porting into `Week 9/` |
| In-class | `04_dynamics` §2 (cells 14–30) | **working code throughout** — counts, heatmaps, connectivity |
| Instructor cells | — | mostly exist; §8 lists what to add |
| Lab | Thursday's | `assignment_5` + solutions exist |
| Board | — | State space, the Markov property, the transition matrix, order |

**Two datasets, deliberately different.** The **tuna genome** — 802,282 nucleotides from `{a, c, g, t}` — is the clean case: a tiny state space, enormous `T`, and a transition matrix you can print and read. **Bach chorales** are the messy case: the state space is chords, which have to be constructed before anything can be counted.

The genome is where the mechanics land. Bach is where "what *is* a state?" becomes a real question.

---

## 2. The content, from scratch

### Sequences and stochastic processes

A **sequence** is values ordered by a time index. A **stochastic process** is a sequence `{Xₜ}` whose values are random — given what you know, you cannot perfectly predict what comes next.

The source's examples are worth keeping because they're deliberately varied: stock prices, EEG and EKG traces, chord progressions, and text as a sequence of tokens. And it makes a forward-looking claim worth repeating to this cohort: *these non-parametric models foreshadow attention, transformers, recurrent networks, and hidden Markov models.* Given ML is running concurrently, that's a genuine hook — a transition matrix is the simplest possible next-token predictor, which is what a language model is.

### The state space

**What values can the sequence take?** For DNA, `{G, C, A, T}`. For music, chords in a key. For text, a chunk of words.

This sounds like bookkeeping and it is the substantive modelling decision of the whole topic. The source is right that enumerating the state space is often the hard part — *"many of the advances that made LLMs possible concern the best way to enumerate the state space."* Tokenization is exactly this problem.

The genome makes the point by contrast: four letters, no ambiguity, no judgment calls. Bach requires deciding what counts as a chord before you can count anything.

### The Markov property — the definition the notebook doesn't state

**This is missing from the source and it is the assumption everything rests on.** Add it:

```
p[Xₜ = z′ | Xₜ₋₁, Xₜ₋₂, …, X₁]  =  p[Xₜ = z′ | Xₜ₋₁]
```

**The future depends on the past only through the present state.** Given where you are now, how you got here is irrelevant.

That is what makes a transition *matrix* sufficient. Without it you would need a rule for every possible history, and there are exponentially many. With it, one table describes the whole process. The name for it is the **Markov property**, and a sequence that has it is a **Markov chain**.

It's also a strong and frequently false assumption — which is exactly what "order" is about, below.

### The transition matrix

Estimate the conditional probabilities by counting:

```
                   (1/T) Σₛ 𝟙{Xₛ = z′ and Xₛ₋₁ = z}
p̂[Xₜ = z′ | Xₜ₋₁ = z] = ────────────────────────────────
                   (1/T) Σₛ 𝟙{Xₛ₋₁ = z}
```

**Look at the shape of that.** It is a joint proportion over a marginal proportion — `p̂(A ∩ B)/p̂(B)`. That is Sep 1's definition of conditional probability with sample proportions substituted for probabilities, and it is Oct 15's conditional density in the discrete case. The source says it plainly: *"this is just a contingency table"* — Week 1's `pd.crosstab`, normalized by row.

Tabulate over all pairs and you get an `S × S` matrix: rows are the current state, columns the next.

**Every row sums to 1.** Each row is a probability distribution over where you go next, so a transition matrix is a stack of `S` conditional distributions, one per starting state.

Here is the real order-1 matrix from `tuna.csv` (I ran it; row sums are exactly 1):

```
        to a     to c     to g     to t
from a  0.3109   0.2008   0.2146   0.2737
from c  0.3924   0.2016   0.1259   0.2800
from g  0.2446   0.2478   0.2251   0.2826
from t  0.1944   0.2076   0.2692   0.3289

marginal proportions:  a 0.2799   c 0.2130   g 0.2140   t 0.2931
```

**The most valuable thing on this slide is the comparison between the rows and the marginal.** If nucleotides were drawn independently, every row would be identical and equal to the marginal. They aren't: after a `c`, an `a` follows 39.2% of the time; after a `t`, only 19.4%. The marginal says 28.0%.

That gap **is** the dependence, measured. It's also a direct callback: Oct 13 defined independence as factorization, and a Markov chain with identical rows is exactly a factorizing (memoryless) sequence. **The transition matrix is a test of independence you can read off a heatmap.**

### Order: how much memory

The **order** is how many previous tokens make up a state. Order 1 uses `{a, c, g, t}`; order 2 uses `{aa, ac, ag, at, ca, …}`; order 3 uses triples.

Raising the order buys realism — the source notes computational biologists find structure emerging around order 3 — and it costs you exponentially:

| order | states (`4^k`) | observations per state |
|---|---|---|
| 1 | 4 | ~200,570 |
| 2 | 16 | ~50,142 |
| 3 | 64 | ~12,535 |
| 5 | 1,024 | ~783 |

**This is the bias–variance trade-off again**, in its clearest form yet. Low order: the model is too simple to capture real dependence — **bias**. High order: each transition probability is estimated from a handful of observations, so the estimates are noisy — **variance**. And unlike the KDE, there is no Silverman's rule; you choose by judgment or by held-out performance.

Say the connection out loud. Students met this as a bandwidth in September; it's the same problem with an integer knob.

### Sparse versus dense

Raise the order enough and most cells are zero — most triples are never followed by most other triples. A matrix that is mostly zeros is **sparse**, and there are storage and computation methods that track only the non-zeros.

The source's aside is worth keeping for this cohort: with a large state space and real dependence — text especially — transition matrices are *inherently* sparse, and a lot of LLM engineering is about exploiting that.

### Connected chains

A chain is **connected** (strongly connected, formally) if from every state you can reach every other state through some sequence of non-zero-probability transitions.

The source's contrast is good: any short nucleotide string eventually appears in a genome, so the genome chain is connected. But a chorale in a given key will simply never visit most chords — **key signature is a disconnection**. Disconnected chains have clusters of states that communicate internally but not across.

Cell 28 checks this with `networkx.is_strongly_connected`. This matters Thursday: connectivity is the condition under which a chain has a unique steady-state distribution, so today's check is the setup for Thursday's forecasting.

---

### Reading

*Key in `README.md`. From `Reading-Roadmap.md` unless marked [Map] (= `prep/ds5030_syllabus_reading_map.pdf`).*

*From [Map]; the detailed `Reading-Roadmap.md` stops at 10/1.*

- **Primary** — **G&S Ch. 11** (Markov Chains), §11.1 — the exact match for transition matrices and for estimating transition proportions from data.
- **Applied companion** — **QE, "Markov Chains: Basic Concepts"** (`intro.quantecon.org/markov_chains_I.html`), with runnable Python.
- **The observation worth stealing** — [Map] points out that the empirical transition proportions are **literally the maximum likelihood estimate** of a Markov chain's transition matrix. *"Count and divide" is not a coincidence, it's MLE.* That is a strong forward link to Oct 27, and it means this session quietly hands students their first non-trivial MLE a week before the topic is named. Worth saying out loud on Oct 27 rather than here.

---

## 3. The optimization view

- **Objective:** predictive error on held-out sequence, as a function of the **order `k`**
- **Argmin:** the `k` balancing bias (too little memory to capture real structure) against variance (too few observations per state to estimate anything)
- **Solved by:** grid search over `k` — and unlike the KDE, **there is no plug-in rule**

Same trade-off as Sep 15's bandwidth, with an integer knob and a state space that grows like `S^k`. The source's "order 3 is where structures start to emerge" is a domain heuristic, not a formula, and saying that plainly is honest: some tuning parameters have theory behind them and some are judgment.

Within each row, the transition probabilities are just sample proportions — the argmin of squared error on indicators, from Sep 8. So the session has an argmin at two levels: the entries (closed form, by counting) and the order (grid search, by judgment).

---

## 4. Assumptions that make it work

| Claim | Assumption |
|---|---|
| A transition matrix describes the process | **The Markov property.** Never stated in the source; it's the whole foundation |
| `p̂[z′\|z]` estimates `p[z′\|z]` | Enough observations of state `z`. Fails for rare states — see §5 |
| Rows sum to 1 | Always, by construction — unless a state is never visited, giving `0/0` |
| The chain is time-homogeneous | **The transition probabilities don't change over time.** Also never stated, and often false |
| Order `k` is enough memory | A modelling choice, not a fact. Testable on held-out data |
| A unique steady state exists | **Connectivity** (plus aperiodicity). Thursday's material |
| Independence would mean identical rows | True, and it's the diagnostic — see §2 |

**Rows 1 and 4 are both unstated in the source and both essential.** Time-homogeneity is the sneakier one: a chain estimated over a long sequence assumes the dynamics were the same at the start and the end. For a genome that's roughly defensible. For financial data or user behaviour it usually isn't.

---

## 5. Concrete failure cases

**Rare states give garbage rows.** With 64 states at order 3 the tuna data has ~12,500 observations each — fine. Push to order 8 and you have 65,536 states over 800,000 tokens, so most states appear a handful of times and their rows are estimated from almost nothing. Some are never visited at all, giving `0/0`. The source's cell 24 guards against this with `np.divide(..., where=sums!=0)`, which is the right defensive move and worth pointing at.

**Zero counts are not zero probabilities.** A transition never observed gets `p̂ = 0`, which asserts it is *impossible*. For a language model that means assigning probability zero to any unseen word pair — and one zero in a product kills the entire sequence probability. Smoothing exists for exactly this. Worth a minute; it's the most practically important gap in the naive estimator.

**The Markov assumption is often just false.** Text has dependencies far longer than any tractable order — which is precisely why attention exists. Naming that connects the session to what students are seeing in their concurrent ML course.

**Non-stationarity.** Estimating one matrix over a period when the dynamics changed gives you an average of two different processes and a description of neither.

**Reading the heatmap without the marginal.** A row that's high on `a` may just reflect `a` being common overall. **The comparison is against the marginal, not against uniform** — and the tuna numbers make that concrete: `c → a` at 0.392 is genuinely elevated against a 0.280 marginal, while `g → a` at 0.245 is slightly *below* it.

---

## 6. Five questions students will ask

**Q1. "What makes it a *Markov* chain rather than just a sequence?"** The Markov property: the next state depends on the current one and on nothing earlier. Formally `p[Xₜ | Xₜ₋₁, …, X₁] = p[Xₜ | Xₜ₋₁]`. That assumption is what makes a single table sufficient — without it you'd need a rule for every possible history, and there are exponentially many. It's also a strong claim that's often false, which is what raising the order partially fixes: an order-3 chain is still Markov, just over a state space of triples. You never escape the assumption; you enlarge the state until it's tolerable.

**Q2. "How is a transition matrix different from the contingency table we made in Week 1?"** It isn't, structurally — the source says so. The differences are what the two axes mean and how you normalize. A contingency table cross-tabulates two *different* variables; a transition matrix cross-tabulates a sequence against *itself, shifted by one*. And you divide each row by its total, so every row becomes a conditional distribution summing to 1 rather than a joint distribution summing to 1 overall. Same machinery, applied to a lag.

**Q3. "How do I choose the order?"** There's no formula, which is worth being honest about. Higher order captures more real dependence but splits your data across exponentially more states — at order `k` you have `S^k` states, so the tuna data goes from 200,000 observations per state at order 1 to under 800 at order 5. Judgment and domain knowledge get you a starting point (the source's "order 3 for genomes"), and held-out predictive performance settles it. It's the same trade-off as the KDE bandwidth from September, with an integer knob and no Silverman's rule.

**Q4. "What if a transition never happens in my data?"** You estimate `p̂ = 0`, and that's a much stronger claim than your data supports — it says the transition is *impossible*, not merely unobserved. It matters because probabilities of sequences are products: one zero anywhere and the whole sequence gets probability zero. The standard fix is smoothing — add a small count to every cell before normalizing, so unobserved transitions get small positive probability rather than none. Every practical language model does some version of this.

**Q5. "Is this really related to language models?"** Directly, and it's the honest version of a claim students hear loosely. A transition matrix *is* a next-token predictor: given the current state, here's the distribution over what comes next. Order-`k` chains are `n`-gram models, which were the state of the art until roughly 2015. What changed is the handling of long-range dependence — a Markov chain must fit all memory into the state, so capturing a dependency 50 tokens back needs `S⁵⁰` states, which is impossible. Attention sidesteps that by learning which earlier positions matter instead of enumerating histories. So this is the right ancestor, and its limitation is exactly what the modern architecture is built to escape.

---

## 7. Bugs and simplifications in the material

### Verified

- 🔴 **The Markov property is never defined.** The notebook goes from "sequences" straight to "transition proportions" without stating the assumption that makes a transition matrix sufficient, and never names it despite the topic being Markov chains. §2 supplies it; it belongs on the board first.
- 🔴 **The taxicab data does not exist.** Exercises 1, 2, and 3 all ask students to work with "taxicab trajectory data" for Manhattan — determine the state space, compute and plot the transition matrix, and reason about order and connectivity. **There is no taxi data anywhere in either repo.** Three of the notebook's five exercises are currently unusable.
- **Cell 16 has a malformed heading** — `- ## Transition Proportions` renders as a bullet containing a heading rather than as a section title.
- **Cell 22's slicing is off by one.** `sq = [''.join(seq[(t-order-1):(t-1)]) for t in range(order+1, T)]` builds `order`-length strings ending at `t-2`, not at `t-1`. The resulting chain still works — the states are consistent with each other — but the alignment between "state at time `t`" and the underlying sequence is shifted, which matters if you ever compare against the order-1 results or try to generate from it. Worth checking before Thursday's simulation builds on it.
- **`networkx` is imported only in cell 28** and isn't in any environment file I can see. Confirm it's installed before class.
- **Time-homogeneity is never mentioned** — see §4.

### Correct — verified by running it

The core pipeline works. I loaded `tuna.csv` (802,282 tokens), built the order-1 counts, and normalized: row sums are exactly 1 and the matrix shows genuine structure against the marginal. Cell 24's `np.divide(..., out=..., where=sums!=0)` correctly guards the never-visited-state case.

### Simplifications

- **Smoothing is never mentioned**, though the zero-count problem is immediate at any interesting order. See §5 and §6 Q4.
- **The independence connection is left implicit.** "Identical rows ⟺ memoryless" is the cleanest possible link back to Oct 13 and it's one sentence.
- **"Order 3 is where structures start to emerge"** is attributed to computational biologists, i.e. it's a domain heuristic. Fine — just don't let it read as a rule.
- **The Bach material is thin in §2** — cell 20 is "let's look at Bach as a noise machine" and cell 30 is "this is where rules of harmony come from," neither developed. `bach.py` and `bach.data` exist, so the chord-state construction is presumably in there; check what it actually does before promising it in class.

---

## 8. Delivery plan

**Modes:** 🟦 notebook (student copy) · 🟩 instructor cells (pre-written, never live) · ⬛ board · 🟨 HTML widget

| # | Step | Mode | Time | Notes |
|---|---|---|---|---|
| 1 | **Quiz** | — | 10 min | Week 8: joint density, independence, conditional expectation |
| 2 | Sequences and stochastic processes | 🟦 notebook | 3 min | The examples list. Name the LLM connection once — it buys attention |
| 3 | **The state space** | ⬛ board | 4 min | DNA is four letters; music needs a decision. The modelling choice, not bookkeeping |
| 4 | **The Markov property** | ⬛ board | 5 min | **Not in the source.** The future depends on the past only through the present. This is what makes one table enough |
| 5 | The transition matrix as conditional proportions | ⬛ board | 5 min | Write the ratio. Point at `p(A\|B) = p(A∩B)/p(B)` from Sep 1 and the contingency table from Week 1 |
| 6 | **The tuna matrix, and the marginal comparison** | 🟩 instructor cells | 7 min | Print the 4×4 with the marginal underneath. `c→a = 0.392` vs marginal `0.280`. **The dependence, measured** |
| 7 | Heatmap | 🟩 instructor cells | 3 min | Cell 18. Seed nothing — it's deterministic |
| 8 | **Order, and the cost of memory** | ⬛ board + 🟩 cell | 7 min | The `4^k` table from §2. **Say "this is the bandwidth problem with an integer knob"** |
| 9 | Sparse vs dense | 🟦 notebook | 2 min | One line, plus the LLM aside |
| 10 | Zero counts ≠ impossible | ⬛ board | 3 min | Not in the source, and the most practically important gap |
| 11 | Connected chains | 🟩 instructor cells | 4 min | Cell 28. Genome connected, chorale not — key signature *is* disconnection. Sets up Thursday |

**Build cost: ~20 min.** The code exists; it needs the marginal-comparison print (step 6) and the order/state-count table (step 8), neither of which the notebook has.

**Step 6 is the one to protect.** Everything else is definitions; that slide is where students see dependence as a number rather than a claim.

**Cut first:** step 9, then step 7. **Do not cut** steps 4, 6, or 8.

---

## 9. Look ahead

- **Thursday is §3 of the same notebook** — simulation, forecasting, steady state — plus `assignment_5` and its solutions. Today's matrix is Thursday's input, and today's connectivity check is the condition for Thursday's steady state to be unique.
- **Generating from the chain** is Thursday's most memorable moment: sample from a row, move, repeat, and out comes plausible-looking DNA or Bach. `music.mid` suggests the chorale version gets played aloud.
- **Oct 27's likelihood** is built from products of conditional probabilities — exactly the entries of today's matrix. A Markov chain's likelihood is the product of the transition probabilities along the observed path, which makes it an unusually clean first example.
- **Dec 1's dynamic programming** operates on state spaces and transitions. The Bellman equation takes an expectation over next states, using a transition matrix. Today's vocabulary is that session's vocabulary.
- **The order trade-off is the bias–variance trade-off**, third appearance (KDE bandwidth, estimator MSE, now model order).
- **Smoothing** foreshadows regularization (Nov 24), if that session happens: adding a prior count to avoid zero estimates is the same instinct as penalizing extreme parameters.

## 10. Looking back

- **Sep 1's conditional probability** is the transition matrix's definition — `p(A∩B)/p(B)`, estimated by counting.
- **Week 1's contingency table** is the transition matrix's structure. The source says so directly; make sure students hear it, because it defuses the topic's apparent novelty.
- **Sep 8's sample proportion** is every entry in the matrix.
- **Oct 13's independence** is the null case: identical rows means memoryless. The tuna matrix is the rejection of that null, visible by eye.
- **Oct 15's conditional distribution** is what a row *is* — today is the discrete, empirical version of Thursday-before-last's continuous object.
- **Sep 15's bandwidth** is the order choice, with the same trade-off and less theory.

---

## 11. Source map

- `sp26/00_understanding_data/04_dynamics.ipynb` — 45 cells. **Today: cells 0–30.** Intro (2), roadmap (3), sequences (5), **state space (6)**, tuna example + loading code (7–9), Exercise 1 (10, **needs missing data**), Bach chorales (11–13), **transition proportions (16)**, counting code (17), heatmap (18), Exercise 2 (19, **needs missing data**), Bach (20), **order (21–25)**, sparse/dense (26), **connected chains (27–28)**, Exercise 3 (29, **needs missing data**), Bach (30). Thursday: cells 31–44.
- **Data, all present** in `00_understanding_data/`: `tuna.csv` (802,282 tokens), `bach.data`, `bach.py`, `music.mid`, `src/piano-keys-chart.jpg`. There is also a duplicate `data/tuna.csv`.
- `sp26/understanding_uncertainty_assignments/assignment_5.ipynb` (18 cells) **and `assignment_5_solutions.ipynb` (49 cells)** — Markov chains and transition matrices. Thursday's lab, already written, with solutions.
- `sp26/understanding_uncertainty_assignments/practice_exam_2.ipynb` also covers Markov chains and transition matrices.
- **No `uu_fa26` material and no HTML lecture exist for this session.** Everything is `sp26`.

## 12. Open questions

- 🔴 **The taxicab data is missing and three exercises depend on it.** Either source Manhattan taxi trajectory data (the NYC TLC trip records are public and large), rewrite the exercises against the tuna or Bach data, or cut them. Rewriting is cheapest — the same three questions work on the chorale data, where the state space *is* a real decision and connectivity genuinely fails.
- **Add the Markov property to the material**, not just to the board. It's the definition of the topic and the notebook never gives it.
- **Check `bach.py`.** Cells 20 and 30 promise Bach content that §2 doesn't deliver, and the chord-state construction presumably lives in that script. Worth knowing what it produces before promising it.
- **Verify `networkx` is installed** in whatever environment students use.
- **Check cell 22's off-by-one** before Thursday's simulation builds on the order-`k` states.
- **Is there a Tuesday activity?** Nothing listed. The marginal-vs-row comparison (step 6) is a natural small-group task: hand them the matrix and the marginal, and ask which transitions are surprising.
