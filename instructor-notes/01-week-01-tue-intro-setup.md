# Week 1, Tuesday (Aug 25) — Introduction and Setup

- **Schedule focus:** Introduction to the course; environment and tooling setup
- **Day type:** Tuesday — but **no quiz** (first quiz is Sep 8) and **no lab**
- **Sources:** `_Teaching/DS5030_Understanding_Uncertainty/Pre-course/01-Intro_to_course.pptx` and `Intro to GitHub.pptx`; `uu_fa26/class_tools/` (`github`, `conda`, `virtual_environments`, `linux`, `docker`); `sp26/00_understanding_data/00_github.ipynb`, `00_pandas_review.ipynb`
- **Nothing is due, nothing is assessed.** The only deliverable is that every student leaves with a working environment

> **This session exists because the cohort's backgrounds diverge more than any other week will expose.** Some students arrive from computer science with git, virtualenvs, and a terminal already in muscle memory. Others have used Python only inside a notebook someone else configured. Every subsequent session assumes the second group has caught up, and no subsequent session has time to help them.
>
> **Treat "everyone can run a notebook and push to GitHub by Thursday" as the actual learning objective.** The course content starts Aug 27.

---

## 1. What students actually see

| Artifact                | File                                                                                           | Status                                         |
| ----------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Slides                  | `Pre-course/01-Intro_to_course.pptx`                                                         | exists                                         |
| GitHub walkthrough      | `Pre-course/Intro to GitHub.pptx`, `class_tools/github.ipynb`, `sp26/00_github.ipynb`    | exists, two overlapping versions               |
| Environment setup       | `class_tools/conda.ipynb`, `virtual_environments.ipynb`, `linux.ipynb`, `docker.ipynb` | exists;**more than one session's worth** |
| Python/pandas refresher | `sp26/00_pandas_review.ipynb`                                                                | exists                                         |
| Quiz                    | —                                                                                             | **none.** First quiz is Sep 8            |
| Lab                     | —                                                                                             | none                                           |

**There is more setup material than time.** `class_tools/` has five notebooks and Docker is almost certainly out of scope for a first-semester course that never containerizes anything. §8 proposes a cut.

---

## 2. The content, from scratch

There's no mathematics today, so this section is about what the session has to accomplish rather than what it has to teach.

### What the course is, said once and plainly

The syllabus's own framing is the right one and it's worth reading nearly verbatim, because it answers the question students actually have:

> *"We pick up the threads of your math and probability education and provide a foundation for later developments in machine learning… you will take multiple classes on machine learning, so the goal is not to compete with those courses, but to complement and foreshadow what will happen in them."*

**"Foreshadow" is the word to land on.** These students are taking ML concurrently, and the single most common failure mode for a course like this is that it feels like a slower, more theoretical version of the thing they're already doing. It isn't. It's the layer underneath — and the specific promise worth making is that by December they will know *why* the loss function in their ML course is the loss function.

The syllabus's other line is worth using too: **"AI-proof your career."** It's blunt, students respond to it, and it's honest about the motivation.

### The shape of the semester, in one slide

Worth giving explicitly, because the course is genuinely long and the destination isn't obvious from week 3:

1. **Describing data** — wrangling, summaries, and the vector algebra underneath them (Weeks 1–2)
2. **Probability** — random variables, densities, and estimating them (Weeks 2–4)
3. **Uncertainty about estimates** — sampling distributions, the bootstrap, the CLT (Weeks 5–6)
4. **Models** — likelihood, MLE, regression (Weeks 8–12)
5. **Finding the answer** — optimization (Weeks 12–14)

And the one-sentence spine, which recurs in every session file: **almost everything this course estimates is the answer to a minimization problem.** The mean, a density, a regression line, a maximum-likelihood estimate. Saying it on day one means every "optimization view" box later is a callback rather than a novelty.

### The logistics that matter

Three things students need to actually retain from the syllabus, as opposed to the twenty things it contains:

- **Tuesdays are math days with a quiz; Thursdays are lab days.** The lab starts in class and is due Sunday at midnight. That rhythm governs everything and is worth putting on a slide.
- **There's a pre-class video for most sessions.** The course assumes it was watched. This is worth being direct about — the guided sessions are built on it, and a student who skips it will be lost rather than merely behind.
- **Collaboration is allowed on labs; cite who you worked with.** The syllabus's framing is unusually good — *"the difference between collaboration and cheating comes down to intent"* — and reading that section aloud does more than a policy slide.

### The setup, which is the real work

Four things, in dependency order:

1. **Python and an environment manager.** conda or venv — pick one and have everyone on it. `class_tools/conda.ipynb` and `virtual_environments.ipynb` both exist; using both will confuse people.
2. **The packages.** `numpy`, `pandas`, `matplotlib`, `seaborn`, `scipy`, `statsmodels`. Later sessions add `networkx` (Oct 20) and possibly `plotly` (Aug 27's activity).
3. **GitHub.** Clone the course repo, and be able to pull updates. Whether students *push* depends on how labs are submitted — the syllabus says Canvas, so pushing may not be required at all. Worth deciding before the session rather than during it.
4. **Run one notebook end to end.** This is the actual test. Not "is it installed" but "did a cell execute and produce a plot."

**The failure mode to design against** is the student who nods through the walkthrough and discovers on Thursday that nothing works. The fix is to make step 4 a checkpoint everyone visibly clears in the room.

---

### Reading

*Key in `README.md`.*

- **No assigned reading.** The reading roadmap begins with Aug 27.
- **Optional, for students who want a gentler on-ramp** — `sp26/00_understanding_data/00_pandas_review.ipynb` for pandas, and `00_math_review.ipynb` for notation. The math review is genuinely useful for this cohort: it covers sets, functions, summation notation, and vector spaces, all of which get assumed from Aug 27 onward.
- **Worth mentioning once** — `Reading-Roadmap.md` lists Wasserman's *All of Statistics* and Blitzstein & Hwang's *Introduction to Probability* as the two default tracks, and **Grinstead & Snell is free** (`math.dartmouth.edu/~prob/prob/prob.pdf`). Students who want a textbook should know there's a no-cost option.

---

## 3. The optimization view

None today — but **plant the sentence.** Say once, without proof, that almost everything the course estimates will turn out to be the answer to a minimization problem, and that they'll see the same box a dozen times. Thursday's mean-minimizes-squared-error is the first instance, two days later.

---

## 4. Assumptions that make it work

| Claim                               | Assumption                                                                       |
| ----------------------------------- | -------------------------------------------------------------------------------- |
| Students can read Python            | The one safe assumption for this cohort — loops, functions, dicts, classes      |
| Students have used a terminal       | **Not safe.** Backgrounds diverge most here                                |
| Students have used git              | **Not safe**, and the ones who haven't often won't say so                  |
| One walkthrough is enough           | **False.** See §5                                                         |
| Everyone's machine behaves the same | Windows, macOS, and institutional laptops with restricted permissions all differ |

---

## 5. Concrete failure cases

**Silent setup failure.** A student follows along, nothing errors visibly, and on Thursday `import seaborn` fails. The only defence is making a working notebook run a visible checkpoint in the room, not a homework instruction.

**Multiple Pythons.** A system Python, an Anaconda Python, and a VS Code interpreter pointing at a fourth. Packages install into one and the notebook uses another. This is the single most common setup problem and it costs students hours.

**Restricted machines.** Institutional laptops may block installs. Worth knowing before Thursday whether there's a browser-based fallback.

**Git configured but not authenticated.** Cloning a public repo works; anything else fails later with an opaque error.

**Over-teaching the tooling.** Docker, Linux, and containerization are in `class_tools/` and none of them is needed this semester. Time spent there is time not spent on the checkpoint that matters.

---

## 6. Five questions students will ask

**Q1. "How is this different from the ML course I'm taking right now?"** That course teaches you to build models that make predictions. This one teaches you what a prediction *is* — what it means for an estimate to be uncertain, why the loss function you're minimizing over there has the form it does, and what your model is assuming when it reports a number. Concretely, in November you'll derive the fact that minimizing squared error is exactly assuming normally-distributed errors, and that binary cross-entropy is a Bernoulli likelihood. Those aren't alternative techniques; they're the reasons behind the defaults.

**Q2. "How much math do I need?"** More than you'd need for a tools course and less than a theory course would demand. You'll see derivatives, integrals, and matrix notation, and the course is built so that the picture or the simulation comes first and the formula second — you'll usually see a thing work numerically before you see it proved. If your calculus is rusty, that's expected and accounted for. `00_math_review.ipynb` is the refresher if you want one.

**Q3. "Do I need to buy a textbook?"** No. There's no required text. If you want one, Grinstead & Snell's *Introduction to Probability* is free online and is the gentlest of the standard options; Wasserman's *All of Statistics* is the more common graduate reference and is faster-paced.

**Q4. "What's the pre-class video for?"** The in-class session assumes it. Tuesdays build on it with board work and an activity; Thursdays build on it with a lab. Skipping it doesn't put you slightly behind — it means the session you attend is the second half of a conversation.

**Q5. "Can I work with other people?"** On labs, yes, and you should — cite who you worked with at the top. The line the syllabus draws is about intent: sharing a line of code to explain something is collaboration, and copying to hit a deadline isn't. Quizzes and problem sets are individual.

---

## 7. What has to be built

There's no mathematical content to audit. What needs deciding:

- [X] **Pick one environment path** — **decided: conda**, and the students work in **VS Code**, not bare JupyterLab. Use `class_tools/conda.ipynb` and leave `virtual_environments.ipynb` out of the session; two overlapping walkthroughs is what confuses people.
- [X] **Decide whether students push to GitHub** — **decided: pull only.** Labs are submitted on Canvas, so nobody needs push, and push is where most of the setup pain lives. The checklist says so explicitly ("you only ever pull here, never push"), which also heads off the students who try to commit their lab into the course repo.
- [X] **Write the setup checklist** — **built, front and back of one sheet: [`setup/setup-checklist.docx`](../setup/setup-checklist.docx) (Word), [`.pdf`](../setup/setup-checklist.pdf) (printing), [`.html`](../setup/setup-checklist.html) (screen).** `setup/build_docx.py` regenerates the Word and PDF versions, so edit the source and re-run rather than hand-patching the `.docx`.
  - **Page 1 — steps 1 to 5:** make the class folder (with a `data/` subfolder), open it in VS Code and add the Python + Jupyter extensions, create the conda env, **select the interpreter**, then **fork the repo, clone the fork, and add `smgroves` as `upstream`**. Steps 5 and 7 each give two paths, **GitHub Desktop** (marked recommended) and command line.
  - **Page 2 — steps 6 to 7 and the fixes:** run `Day_1_python_test.ipynb` and check the kernel says `uu`, then **commit and push to their own fork**. Then symptom-by-symptom troubleshooting, the Colab fallback, and how to pull your updates all term.
  - **19 tick-boxes**, and **two** finish lines rather than one: the setup code `UU-92-5650` on screen, *and* their commit visible on their own fork. Both are things you can check at a glance while circulating.
  - Verified: both pages fit with 25 to 56 px of headroom across four font substitutions, the `.docx` passes OOXML schema validation, and the `conda create` line dry-run-solves onto pandas 2.3.3.
- [X] **Build the day-one notebook** — **[`setup/Day_1_python_test.ipynb`](../setup/Day_1_python_test.ipynb)**, with [`cville_cars.csv`](../setup/cville_cars.csv) beside it. Both go at the root of `UU_F26`. Thirteen cells: a kernel warning up top, a name/username cell so the pushed copy identifies the student, the six imports plus the `interpreter` line, the CSV read and a price histogram, then the setup code. **Verified by executing it**: runs clean with the name cell blank *and* filled, no errors, histogram renders, last line is `SETUP CODE: UU-92-5650`. Ships unrun so the student's first commit is their own output.
- [X] **Prepare a fallback** — **decided: Google Colab.** It's a panel on the checklist: `!git clone https://github.com/ds4e/UU.git`, then `%cd UU`, then the same paste-in cell. Colab ships all six packages, so a Colab student reaches the same `UU-92-5650`. **Ask Colab students to identify themselves today** so you can check the labs work for them before Thursday.
- [X] **Cut Docker and Linux** from the session unless there's a reason to keep them.

---

## 8. Delivery plan

**Modes:** 🟦 notebook (student copy) · 🟩 instructor cells (pre-written, never live) · ⬛ board/slides · 🟨 HTML widget

| # | Step                                        | Mode        | Time   | Notes                                                                                                                                                  |
| - | ------------------------------------------- | ----------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1 | Who's in the room                           | ⬛ talk     | 5 min  | Quick show of hands: prior Python, prior git, prior stats.**Calibrates everything else, and tells you who needs help at step 6**                 |
| 2 | What the course is                          | ⬛ slides   | 8 min  | `01-Intro_to_course.pptx`. Land on *foreshadow* and *AI-proof your career*                                                                       |
| 3 | The shape of the semester                   | ⬛ slides   | 5 min  | §2's five-phase arc.**Then plant the optimization sentence**                                                                                    |
| 4 | Logistics that matter                       | ⬛ slides   | 7 min  | Tue/Thu rhythm, pre-class videos, the collaboration policy read aloud                                                                                  |
| 5 | **Environment setup, walked through** | 🟩 live     | 20 min | **conda only.** Work the checklist's step 1 on screen while they follow on paper                                                                        |
| 6 | **GitHub: clone and pull**            | 🟩 live     | 15 min | Scope to what's actually needed (§7)                                                                                                                  |
| 7 | **The checkpoint**                    | 🟦 notebook | 12 min | Checklist step 3. Everyone runs the cell, gets a histogram, and shows you `UU-92-5650`.**Do not skip this; circulate.** The students who need help are the ones who won't ask |
| 8 | What to do before Thursday                  | ⬛ talk     | 3 min  | Watch the wrangling video; finish setup if stuck; where to get help                                                                                    |

**Build cost: none left.** The checklist is built and verified — see §7. Everything else exists in some form.

**Step 7 is the session.** Steps 2–4 could be compressed onto a slide and emailed; step 7 cannot be done remotely for the students who most need it.

**Cut first:** step 3, then step 1. **Do not cut** step 7.

---

## 9. Look ahead

- **Thursday (Aug 27) starts immediately** with wrangling and the cars lab. It assumes a working pandas.
- **Sep 3's vectors session needs `numpy`**, and the broadcasting material there is what Sep 15's KDE runs on.
- **Sep 1's census activity fetches data over the network** — worth confirming today that institutional networks won't block it, or shipping the CSV.
- **Oct 20 needs `networkx`**, which isn't in any environment file. Add it to the setup list now rather than discovering it in October.
- **The optimization sentence planted in step 3** is the course's spine; every session file has an "optimization view" box that pays into it.

## 10. Looking back

Nothing — this is session one.

---

## 11. Source map

- `_Teaching/DS5030_Understanding_Uncertainty/Pre-course/` — `01-Intro_to_course.pptx`, `Intro to GitHub.pptx`.
- `uu_fa26/class_tools/` — `github.ipynb`, `conda.ipynb`, `virtual_environments.ipynb`, `linux.ipynb`, `docker.ipynb`. **More than one session's worth; see §7.**
- `sp26/00_understanding_data/00_github.ipynb` — a second GitHub treatment, overlapping the pptx.
- `sp26/00_understanding_data/00_pandas_review.ipynb` — optional refresher.
- `sp26/00_understanding_data/00_math_review.ipynb` — sets, functions, summation, vector spaces. **The best optional pre-reading for this cohort**, and relevant to Sep 3.
- `DS5030_Syllabus Fall 2026.docx` — the collaboration and AI-use sections are worth reading aloud rather than summarizing.

## 12. Open questions

- **Is a full session on intro and setup the right call?** It's a real cost — one of 26 sessions. The argument for it is that the cohort's backgrounds diverge most here and no later session has slack to fix it. The argument against is that setup could be a pre-course assignment with office hours. Worth deciding on the basis of how many students you expect to arrive without a terminal.
- **Push or pull only?** Determines how much of step 6 is needed.
- ~~**Which environment manager?**~~ **conda.** ~~**Is there a Colab fallback?**~~ **Yes**, and it's on the checklist.
- **Is there a pre-class video for this session?** Every other session has one; a "get set up before you arrive" video would make step 5 a check rather than a walkthrough, and would buy back fifteen minutes.
- **Does the first quiz being Sep 8 need announcing?** The syllabus says weekly Tuesday quizzes; with Sep 1 skipped, the first one is a week later than that implies.
