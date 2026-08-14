"""Generates statistics-zoo.ipynb from the section definitions below.

Run `python3 build_notebook.py` after editing a section's code/markdown here;
never hand-edit the .ipynb JSON directly, or the next regeneration will
clobber it.
"""

import nbformat as nbf

nb = nbf.v4.new_notebook()
cells = []

def md(text):
    cells.append(nbf.v4.new_markdown_cell(text.strip()))

def code(text):
    cells.append(nbf.v4.new_code_cell(text.strip()))

# ============================================================
# Title + setup
# ============================================================
md("""
# The Statistics Zoo — Notebook Edition

Eighteen ideas from *Understanding Uncertainty*, each turned into a small,
self-contained, hands-on demo you can run in a lecture or drop into a
notebook. This mirrors [`statistics-zoo.html`](../statistics-zoo.html):
same math, same pinned toy numbers, now as `ipywidgets` instead of canvas/JS.

Each section is independent — run its cell, play with the slider or button,
move on. `zoo_common.py` (next to this notebook) holds the shared colors,
datasets, and formulas so every section that reuses a dataset (KDE reuses
the same sample as MLE and "Nonparametric → Parametric", for instance) sees
exactly the same numbers.
""")

code("""
import numpy as np
import matplotlib.pyplot as plt
import ipywidgets as widgets
from ipywidgets import interact, interactive_output, VBox, HBox
from IPython.display import display, clear_output
from scipy.stats import binom

from zoo_common import (
    INK, INK_SOFT, TEAL, AMBER, RULE, SEED,
    normal_pdf, normal_cdf, make_rng,
    npp_dataset, bootstrap_sample, fit_line,
    ESTIMATOR_TOY, EXPECTATION_VALUES,
    MARKOV_STATES, MARKOV_P, MARKOV_POS,
    FREQ_MU, FREQ_SIGMA, FREQ_N, FREQ_SE, FREQ_HALF,
    LLN_TRUE_MEAN, covariate_dataset, sampling_population,
)

plt.rcParams["font.family"] = "serif"
plt.rcParams["axes.edgecolor"] = RULE
plt.rcParams["figure.facecolor"] = "white"
""")

# ============================================================
# 1. Random Variable
# ============================================================
md("""
## 1. Random Variable

A random variable is just a rule that turns an outcome into a number.
Flip a coin — "heads" and "tails" aren't numbers, but "heads = 1, tails = 0"
is a random variable. Click **Flip the coin** a few times.
""")

code("""
rv_history = []
rv_out = widgets.Output()

def rv_render():
    with rv_out:
        clear_output(wait=True)
        counts = {0: 0, 1: 0}
        fig, ax = plt.subplots(figsize=(6, 2.2))
        for v in rv_history:
            y = 0.4 + counts[v] * 0.55
            ax.scatter(v, y, s=140, color=TEAL, alpha=0.85, zorder=3)
            counts[v] += 1
        ax.set_xlim(-0.5, 1.5)
        ax.set_ylim(0, 5.5)
        ax.set_yticks([])
        ax.set_xticks([0, 1])
        ax.set_xticklabels(["Tails \\u2192 0", "Heads \\u2192 1"])
        for s in ("top", "right", "left"):
            ax.spines[s].set_visible(False)
        ax.set_title(f"{len(rv_history)} flips \\u00b7 {counts[1]} heads", fontsize=11, color=INK_SOFT)
        plt.show()

def rv_flip(_):
    rv_history.append(int(np.random.randint(0, 2)))
    rv_render()

def rv_reset(_):
    rv_history.clear()
    rv_render()

flip_btn = widgets.Button(description="Flip the coin")
reset_btn = widgets.Button(description="Reset")
flip_btn.on_click(rv_flip)
reset_btn.on_click(rv_reset)
rv_render()
display(HBox([flip_btn, reset_btn]), rv_out)
""")

# ============================================================
# 2. eCDF
# ============================================================
md("""
## 2. Empirical CDF (eCDF)

The eCDF answers: *what fraction of my data is at or below this value?*
Slide `n` and watch the staircase build itself, one step per point, from a
fixed pool of 150 points so the shape is reproducible across runs.
""")

code("""
_ecdf_rng = make_rng(SEED + 10)
_ecdf_pool = np.clip(_ecdf_rng.standard_normal(150), -4, 4)

def ecdf_plot(n):
    fig, ax = plt.subplots(figsize=(6, 3))
    ax.set_xlim(-4, 4)
    ax.set_ylim(0, 1)
    if n > 0:
        pts = np.sort(_ecdf_pool[:n])
        y = np.arange(1, n + 1) / n
        ax.plot([-4, pts[0]], [0, 0], color=TEAL, linewidth=2.2)
        ax.step(pts, y, where="post", color=TEAL, linewidth=2.2)
        ax.plot([pts[-1], 4], [1, 1], color=TEAL, linewidth=2.2)
        ax.scatter(pts, np.full_like(pts, -0.02), s=14, color=INK_SOFT, clip_on=False)
    ax.set_title(f"n = {n} points \\u00b7 eCDF(x) = fraction of data \\u2264 x", fontsize=10, color=INK_SOFT)
    plt.show()

interact(ecdf_plot, n=widgets.IntSlider(min=0, max=150, step=5, value=20, description="n points"));
""")

# ============================================================
# 3. PMF vs PDF
# ============================================================
md("""
## 3. PMF vs. PDF

For a PMF, bar height *is* the probability. For a PDF, height is not a
probability at all — only the shaded **area** between two points is. Toggle
between the discrete Binomial(10, 0.5) and the continuous Normal(0, 1), and
drag `a`, `b` to see the area update.
""")

code("""
def pmfpdf_plot(mode, a, b):
    fig, ax = plt.subplots(figsize=(6, 3))
    if mode == "Discrete (PMF)":
        ks = np.arange(0, 11)
        probs = binom.pmf(ks, 10, 0.5)
        ax.bar(ks, probs, color=TEAL, alpha=0.85, width=0.7)
        for k, p in zip(ks, probs):
            if p > probs.max() * 0.06:
                ax.text(k, p, f"{p:.2f}", ha="center", va="bottom", fontsize=8, color=INK_SOFT)
        ax.set_title("Binomial(n=10, p=0.5) \\u2014 bar height = P(X=k), bars sum to 1", fontsize=10, color=INK_SOFT)
    else:
        a, b = (a, b) if a <= b else (b, a)
        xs = np.linspace(-4, 4, 400)
        ys = normal_pdf(xs)
        ax.plot(xs, ys, color=TEAL, linewidth=2.2)
        mask = (xs >= a) & (xs <= b)
        ax.fill_between(xs[mask], ys[mask], color=AMBER, alpha=0.28)
        for v in (a, b):
            ax.axvline(v, color=AMBER, linewidth=1.4)
        area = normal_cdf(b) - normal_cdf(a)
        ax.set_title(f"height \\u2260 probability \\u2014 P({a:.2f} \\u2264 X \\u2264 {b:.2f}) \\u2248 {area:.3f}", fontsize=10, color=INK_SOFT)
    plt.show()

interact(
    pmfpdf_plot,
    mode=widgets.ToggleButtons(options=["Discrete (PMF)", "Continuous (PDF)"]),
    a=widgets.FloatSlider(min=-4, max=4, step=0.05, value=-1, description="a"),
    b=widgets.FloatSlider(min=-4, max=4, step=0.05, value=1, description="b"),
);
""")

# ============================================================
# 4. CDF
# ============================================================
md("""
## 4. CDF

The CDF answers "what's the probability of this value or less" for the
*whole population* — not just a sample (that's the eCDF's job). Drag the
slider and read the probability straight off the curve.
""")

code("""
def cdf_plot(x):
    fig, ax = plt.subplots(figsize=(6, 3))
    xs = np.linspace(-4, 4, 300)
    ax.plot(xs, normal_cdf(xs), color=TEAL, linewidth=2.2)
    y = normal_cdf(x)
    ax.plot([x, x], [0, y], color=AMBER, linewidth=1.4)
    ax.plot([-4, x], [y, y], color=AMBER, linewidth=1.4)
    ax.scatter([x], [y], color=AMBER, zorder=3)
    ax.set_xlim(-4, 4)
    ax.set_ylim(0, 1)
    ax.set_title(f"x = {x:.2f} \\u00b7 \\u03a6(x) = P(X \\u2264 x) = {y:.3f}", fontsize=11, color=INK_SOFT)
    plt.show()

interact(cdf_plot, x=widgets.FloatSlider(min=-4, max=4, step=0.05, value=0));
""")

# ============================================================
# 5. Nonparametric -> Parametric
# ============================================================
md("""
## 5. Nonparametric \\u2192 Parametric

**Nonparametric**: let the data speak for itself, no assumed shape.
**Parametric**: assume a shape (like Normal) and estimate just a couple of
numbers. Same 160-point data, drawn both ways — slide between them. This
dataset is reused by the MLE and KDE sections below.
""")

code("""
npp_data, npp_mu, npp_sigma, npp_xmin, npp_xmax = npp_dataset()
npp_counts, npp_edges = np.histogram(npp_data, bins=20, range=(npp_xmin, npp_xmax), density=True)

def npp_plot(t):
    fig, ax = plt.subplots(figsize=(6, 3))
    width = npp_edges[1] - npp_edges[0]
    ax.bar(npp_edges[:-1], npp_counts, width=width, align="edge", color=TEAL, alpha=1 - t)
    xs = np.linspace(npp_xmin, npp_xmax, 300)
    ax.plot(xs, normal_pdf(xs, npp_mu, npp_sigma), color=AMBER, linewidth=2.4, alpha=t)
    if t < 0.25:
        msg = "Nonparametric: no assumed shape \\u2014 just the data's own histogram, bin by bin."
    elif t < 0.75:
        msg = "Blending: the same data, fading from 'just count it' toward 'assume a shape.'"
    else:
        msg = f"Parametric: assume Normal(\\u03bc,\\u03c3) \\u2014 \\u03bc \\u2248 {npp_mu:.2f}, \\u03c3 \\u2248 {npp_sigma:.2f}."
    ax.set_title(msg, fontsize=10, color=INK_SOFT)
    plt.show()

interact(npp_plot, t=widgets.FloatSlider(min=0, max=1, step=0.02, value=0, description="\\u2192 parametric"));
""")

# ============================================================
# 6. Bootstrap
# ============================================================
md("""
## 6. Bootstrap

Can't re-run the experiment? Resample your own data *with replacement*
instead — treat the sample you already have as a stand-in population. Draw
resamples and watch the histogram of resampled means take shape.
""")

code("""
boot_sample, boot_mean = bootstrap_sample()
_boot_rng = np.random.default_rng(SEED + 20)  # persists across clicks so resamples keep changing
boot_means = []
boot_out = widgets.Output()

def boot_render():
    with boot_out:
        clear_output(wait=True)
        fig, (ax0, ax1) = plt.subplots(2, 1, figsize=(6, 4.6), gridspec_kw={"height_ratios": [1, 2]})
        jitter = np.random.default_rng(0).random(len(boot_sample)) * 0.6
        ax0.scatter(boot_sample, jitter, color=TEAL, alpha=0.7, s=20)
        ax0.axvline(boot_mean, color=INK, linewidth=1.6)
        ax0.set_yticks([])
        ax0.set_title(f"original sample (n=25), mean = {boot_mean:.1f}", fontsize=10, color=INK_SOFT)
        if boot_means:
            ax1.hist(boot_means, bins=24, color=AMBER, alpha=0.75)
            se = float(np.std(boot_means))
            ax1.set_title(f"B = {len(boot_means)} resamples \\u00b7 bootstrap SE = {se:.3f}", fontsize=10, color=INK_SOFT)
        else:
            ax1.text(0.5, 0.5, "draw resamples to build a histogram of resampled means",
                      ha="center", va="center", transform=ax1.transAxes, color=INK_SOFT)
            ax1.set_xticks([]); ax1.set_yticks([])
        plt.tight_layout()
        plt.show()

def boot_draw(k):
    for _ in range(k):
        rs = _boot_rng.choice(boot_sample, size=len(boot_sample), replace=True)
        boot_means.append(float(rs.mean()))
    boot_render()

b1 = widgets.Button(description="Draw 1 resample")
b200 = widgets.Button(description="Draw 200 resamples")
br = widgets.Button(description="Reset")
b1.on_click(lambda _: boot_draw(1))
b200.on_click(lambda _: boot_draw(200))
br.on_click(lambda _: (boot_means.clear(), boot_render()))
boot_render()
display(HBox([b1, b200, br]), boot_out)
""")

# ============================================================
# 7. MLE
# ============================================================
md("""
## 7. Maximum Likelihood Estimation

Pick the parameter values that make your observed data *least surprising* —
the ones that maximize the probability (or density) of seeing exactly this
data. Drag \\u03bc and \\u03c3 to push the log-likelihood as high as you can,
then compare to the actual MLE.
""")

code("""
def mle_loglik(mu, sigma):
    return float(np.sum(np.log(normal_pdf(npp_data, mu, sigma))))

def mle_plot(mu, sigma):
    fig, ax = plt.subplots(figsize=(6, 3))
    ax.plot(npp_data, np.full_like(npp_data, -0.01), "|", color=INK_SOFT, alpha=0.6, markersize=10)
    xs = np.linspace(npp_xmin, npp_xmax, 300)
    ax.plot(xs, normal_pdf(xs, mu, sigma), color=AMBER, linewidth=2.4)
    ll = mle_loglik(mu, sigma)
    ax.set_title(f"\\u03bc={mu:.2f}, \\u03c3={sigma:.2f} \\u00b7 log-likelihood = {ll:.1f}", fontsize=10, color=INK_SOFT)
    plt.show()

mu_slider = widgets.FloatSlider(min=0, max=8, step=0.05, value=2, description="\\u03bc")
sigma_slider = widgets.FloatSlider(min=0.3, max=4, step=0.05, value=2.5, description="\\u03c3")
mle_out = interactive_output(mle_plot, {"mu": mu_slider, "sigma": sigma_slider})

def mle_snap(_):
    mu_slider.value = round(float(npp_mu), 2)
    sigma_slider.value = round(float(npp_sigma), 2)

snap_btn = widgets.Button(description="Snap to the MLE")
snap_btn.on_click(mle_snap)
display(VBox([mu_slider, sigma_slider, snap_btn, mle_out]))
""")

# ============================================================
# 8. KDE
# ============================================================
md("""
## 8. Kernel Density Estimation (KDE)

The smooth cousin of the histogram: instead of binning, drop a little bump
on top of every data point and add them all up. Same data as the MLE
section above — drag the bandwidth `h` from spiky to oversmoothed.
""")

code("""
def kde_at(xs, h):
    diffs = (xs[:, None] - npp_data[None, :]) / h
    return normal_pdf(diffs).sum(axis=1) / (len(npp_data) * h)

def kde_plot(h):
    fig, ax = plt.subplots(figsize=(6, 3))
    width = npp_edges[1] - npp_edges[0]
    ax.bar(npp_edges[:-1], npp_counts, width=width, align="edge", color=TEAL, alpha=0.32)
    xs = np.linspace(npp_xmin, npp_xmax, 160)
    ax.plot(xs, kde_at(xs, h), color=AMBER, linewidth=2.4)
    if h < 0.3:
        msg = "spiky \\u2014 overfit, chasing individual points"
    elif h > 1.2:
        msg = "oversmoothed \\u2014 real structure erased"
    else:
        msg = "a reasonable bandwidth"
    ax.set_title(f"h = {h:.2f} \\u00b7 {msg} \\u00b7 teal = histogram, amber = KDE", fontsize=10, color=INK_SOFT)
    plt.show()

interact(kde_plot, h=widgets.FloatSlider(min=0.08, max=2.5, step=0.02, value=0.15, description="bandwidth h"));
""")

# ============================================================
# 9. p-value vs CI
# ============================================================
md("""
## 9. p-value vs. Confidence Interval

Both answer the same question — how much does sampling variability alone
explain what I'm seeing — just phrased two ways. A p-value is "how extreme
is this, on a probability scale." A CI is "which null values would I *not*
have rejected." Drag the hypothesized value \\u2074s\\u2080\\u2074 and watch
them agree, every time, right at the CI's edge. Reuses the bootstrap
sample above.
""")

code("""
_pv_rng = np.random.default_rng(SEED + 30)
pv_boot_means = np.array([
    _pv_rng.choice(boot_sample, size=len(boot_sample), replace=True).mean()
    for _ in range(2000)
])
pv_se = float(pv_boot_means.std())
_abs_z_sorted = np.sort(np.abs((pv_boot_means - boot_mean) / pv_se))
_c = _abs_z_sorted[min(len(_abs_z_sorted) - 1, round(0.95 * (len(_abs_z_sorted) - 1)))]
ci_lo, ci_hi = boot_mean - _c * pv_se, boot_mean + _c * pv_se

def pv_plot(s0):
    fig, ax = plt.subplots(figsize=(6, 3))
    counts, edges = np.histogram(pv_boot_means, bins=26)
    centers = (edges[:-1] + edges[1:]) / 2
    colors = [TEAL if ci_lo <= c <= ci_hi else "#B7C1C6" for c in centers]
    ax.bar(edges[:-1], counts, width=edges[1] - edges[0], align="edge", color=colors, alpha=0.85)
    z0 = (boot_mean - s0) / pv_se
    extreme = np.sum(np.abs((pv_boot_means - boot_mean) / pv_se) > abs(z0))
    p = extreme / len(pv_boot_means)
    reject = s0 < ci_lo or s0 > ci_hi
    ax.axvline(s0, color=AMBER if reject else INK, linewidth=2)
    verdict = "REJECT" if reject else "FAIL TO REJECT"
    ax.set_title(
        f"95% CI=({ci_lo:.2f},{ci_hi:.2f}) \\u00b7 s\\u2080={s0:.1f} \\u00b7 p\\u2248{p:.3f} \\u00b7 {verdict} H\\u2080: \\u03bc=s\\u2080 @ \\u03b1=0.05",
        fontsize=9, color=INK_SOFT,
    )
    plt.show()

interact(pv_plot, s0=widgets.FloatSlider(min=40, max=60, step=0.2, value=50, description="s\\u2080"));
""")

# ============================================================
# 10. Sampling
# ============================================================
md("""
## 10. Sampling

Sampling is just drawing some observations out of a much bigger population
or process — the sample is the small part you actually got to see. Move `n`
or click **Draw a new sample** to see a fresh subset highlighted.
""")

code("""
sampling_pop = sampling_population()
_samp_rng = np.random.default_rng(SEED + 40)
samp_out = widgets.Output()

def sampling_render(n):
    idx = _samp_rng.permutation(len(sampling_pop))[:n]
    mask = np.zeros(len(sampling_pop), dtype=bool)
    mask[idx] = True
    with samp_out:
        clear_output(wait=True)
        fig, ax = plt.subplots(figsize=(5, 5))
        ax.scatter(sampling_pop[~mask, 0], sampling_pop[~mask, 1], color="#C7CDD3", s=18, alpha=0.7)
        ax.scatter(sampling_pop[mask, 0], sampling_pop[mask, 1], color=TEAL, s=36, alpha=0.9)
        ax.set_xticks([]); ax.set_yticks([])
        n_pop = len(sampling_pop)
        ax.set_title(f"n = {n} sampled out of a population of {n_pop} ({100 * n / n_pop:.0f}%)", fontsize=10, color=INK_SOFT)
        plt.show()

n_slider = widgets.IntSlider(min=5, max=150, step=5, value=20, description="n")
redraw_btn = widgets.Button(description="Draw a new sample")
n_slider.observe(lambda ch: sampling_render(n_slider.value), names="value")
redraw_btn.on_click(lambda _: sampling_render(n_slider.value))
sampling_render(n_slider.value)
display(VBox([HBox([n_slider, redraw_btn]), samp_out]))
""")

# ============================================================
# 11. iid
# ============================================================
md("""
## 11. iid

**Independent**: knowing one draw tells you nothing about the next.
**Identically distributed**: every draw comes from the exact same process.
Toggle between an iid sequence and a sequence that breaks one of those two
rules.
""")

code("""
_iid_rng = np.random.default_rng(SEED + 50)
iid_state = {"mode": "iid"}
iid_out = widgets.Output()

def gen_iid():
    return _iid_rng.standard_normal(60)

def gen_noniid():
    vals = np.zeros(60)
    y = 0.0
    for i in range(60):
        y = 0.92 * y + 0.35 * _iid_rng.standard_normal()
        vals[i] = y
    return vals

iid_data = {"vals": gen_iid()}

def iid_render():
    with iid_out:
        clear_output(wait=True)
        vals = iid_data["vals"]
        fig, ax = plt.subplots(figsize=(6, 3))
        if iid_state["mode"] == "non-iid":
            ax.plot(vals, color=AMBER, linewidth=1.6)
            color = AMBER
            msg = "non-iid: each point is 92% of the last plus a nudge \\u2014 the path drifts instead of scattering."
        else:
            color = TEAL
            msg = "iid: each point drawn fresh from Normal(0,1) \\u2014 knowing one tells you nothing about the next."
        ax.scatter(range(len(vals)), vals, color=color, s=20, alpha=0.85, zorder=3)
        ax.set_title(msg, fontsize=9, color=INK_SOFT)
        plt.show()

def iid_toggle(_):
    iid_state["mode"] = "non-iid" if iid_state["mode"] == "iid" else "iid"
    iid_data["vals"] = gen_noniid() if iid_state["mode"] == "non-iid" else gen_iid()
    toggle_btn.description = "Switch to an iid sequence" if iid_state["mode"] == "non-iid" else "Switch to a non-iid sequence"
    iid_render()

def iid_redraw(_):
    iid_data["vals"] = gen_noniid() if iid_state["mode"] == "non-iid" else gen_iid()
    iid_render()

toggle_btn = widgets.Button(description="Switch to a non-iid sequence")
redraw_btn2 = widgets.Button(description="Redraw")
toggle_btn.on_click(iid_toggle)
redraw_btn2.on_click(iid_redraw)
iid_render()
display(HBox([toggle_btn, redraw_btn2]), iid_out)
""")

# ============================================================
# 12. Expectation
# ============================================================
md("""
## 12. Expectation

Expectation is a probability-weighted average — not the middle of your
data, the middle of the process generating it. Drag any slider and the
probabilities are renormalized live so they still sum to 1.
""")

code("""
def expectation_plot(p0, p1, p2, p3, p4):
    raw = np.array([p0, p1, p2, p3, p4], dtype=float)
    probs = raw / raw.sum() if raw.sum() > 0 else np.full(5, 0.2)
    fig, ax = plt.subplots(figsize=(6, 3))
    ax.bar(EXPECTATION_VALUES, probs, width=0.6, color=TEAL, alpha=0.8)
    for v, p in zip(EXPECTATION_VALUES, probs):
        ax.text(v, p, f"{p:.3f}", ha="center", va="bottom", fontsize=9, color=INK_SOFT)
    ex = float(np.sum(EXPECTATION_VALUES * probs))
    ax.axvline(ex, color=AMBER, linewidth=2)
    ax.set_ylim(0, 1)
    ax.set_title(f"E[X] = {ex:.2f} (sliders renormalized so probabilities sum to 1)", fontsize=10, color=INK_SOFT)
    plt.show()

exp_sliders = {
    f"p{i}": widgets.FloatSlider(min=0.02, max=1, step=0.02, value=0.2, description=f"P(X={v})")
    for i, v in enumerate(EXPECTATION_VALUES)
}
exp_out = interactive_output(expectation_plot, exp_sliders)
display(VBox(list(exp_sliders.values()) + [exp_out]))
""")

# ============================================================
# 13. Estimator
# ============================================================
md("""
## 13. Estimator

An estimator is just a recipe — a function of your data — for guessing
something you can't observe directly. Different recipes applied to the same
data give different answers. Drag any point and watch mean, median, and
midrange move differently.
""")

code("""
def estimator_plot(x0, x1, x2, x3, x4, x5, x6):
    X = np.array([x0, x1, x2, x3, x4, x5, x6])
    fig, ax = plt.subplots(figsize=(6, 2.6))
    ax.scatter(X, np.zeros_like(X), s=80, facecolor="none", edgecolor=TEAL, linewidth=1.6, zorder=3)
    mean, median, midrange = X.mean(), float(np.median(X)), (X.min() + X.max()) / 2
    for v, c, lbl in [(mean, AMBER, "mean"), (median, INK, "median"), (midrange, "#3a6ea5", "midrange")]:
        ax.axvline(v, color=c, linestyle="--", linewidth=1.6)
        ax.text(v, 1.15, lbl, color=c, ha="center", fontsize=8)
    ax.set_xlim(0, 10)
    ax.set_ylim(-0.3, 1.5)
    ax.set_yticks([])
    ax.set_title(f"mean={mean:.2f} \\u00b7 median={median:.2f} \\u00b7 midrange={midrange:.2f} \\u2014 three recipes, three answers", fontsize=9, color=INK_SOFT)
    plt.show()

est_names = [f"x{i}" for i in range(7)]
est_sliders = {
    n: widgets.FloatSlider(min=0, max=10, step=0.25, value=float(v), description=n)
    for n, v in zip(est_names, ESTIMATOR_TOY)
}
est_out = interactive_output(estimator_plot, est_sliders)
display(VBox(list(est_sliders.values()) + [est_out]))
""")

# ============================================================
# 14. Likelihood
# ============================================================
md("""
## 14. Likelihood

A likelihood is the same density formula as a PDF, just read backwards: fix
the data you actually saw, and ask how the probability of seeing it changes
as you vary the unknown parameter. Toggle the view — same formula, swapped
axis.
""")

code("""
THETA, SIGMA_L = 2.0, 1.0

def likelihood_plot(mode, x0):
    fig, ax = plt.subplots(figsize=(6, 3))
    if mode == "PDF view (x varies)":
        xs = np.linspace(-3, 7, 300)
        ax.plot(xs, normal_pdf(xs, THETA, SIGMA_L), color=TEAL, linewidth=2.2)
        fx0 = normal_pdf(x0, THETA, SIGMA_L)
        ax.axvline(x0, color=AMBER, linewidth=2)
        ax.scatter([x0], [fx0], color=AMBER, zorder=3)
        ax.set_title(f"PDF view: \\u03b8={THETA} fixed \\u00b7 f(x\\u2080={x0:.1f}; \\u03b8) = {fx0:.3f}", fontsize=10, color=INK_SOFT)
    else:
        ths = np.linspace(-3, 7, 300)
        ys = normal_pdf(x0, ths, SIGMA_L)
        ax.plot(ths, ys, color=AMBER, linewidth=2.2)
        ax.axvline(x0, color=TEAL, linestyle="--", linewidth=1.4)
        ax.set_title(f"Likelihood view: x\\u2080={x0:.1f} fixed \\u00b7 L(\\u03b8) peaks at \\u03b8={x0:.1f}, the MLE", fontsize=10, color=INK_SOFT)
    plt.show()

interact(
    likelihood_plot,
    mode=widgets.ToggleButtons(options=["PDF view (x varies)", "Likelihood view (\\u03b8 varies)"]),
    x0=widgets.FloatSlider(min=-3, max=7, step=0.1, value=2),
);
""")

# ============================================================
# 15. LLN
# ============================================================
md("""
## 15. Law of Large Numbers

As you collect more data, your sample average settles down and converges to
the true population average — reliably, not just by luck. This is the "weak
law" (WLLN); draw more die rolls and watch the running mean stop wandering.
""")

code("""
_lln_rng = np.random.default_rng(SEED + 60)
lln_state = {"draws": []}
lln_out = widgets.Output()

def lln_render():
    with lln_out:
        clear_output(wait=True)
        draws = lln_state["draws"]
        fig, ax = plt.subplots(figsize=(6, 3))
        cur = LLN_TRUE_MEAN
        if draws:
            running = np.cumsum(draws) / np.arange(1, len(draws) + 1)
            ax.plot(range(1, len(draws) + 1), running, color=TEAL, linewidth=2)
            cur = running[-1]
        ax.axhline(LLN_TRUE_MEAN, color="#3a6ea5", linestyle="--", linewidth=1.4)
        ax.set_ylim(1, 6)
        ax.set_title(f"n = {len(draws)} die rolls \\u00b7 running mean = {cur:.3f} \\u00b7 true mean = {LLN_TRUE_MEAN}", fontsize=10, color=INK_SOFT)
        plt.show()

def lln_draw(k):
    lln_state["draws"].extend(_lln_rng.integers(1, 7, size=k).tolist())
    lln_render()

lln_b1 = widgets.Button(description="Draw 1 more")
lln_b100 = widgets.Button(description="Draw 100 more")
lln_br = widgets.Button(description="Reset")
lln_b1.on_click(lambda _: lln_draw(1))
lln_b100.on_click(lambda _: lln_draw(100))
lln_br.on_click(lambda _: (lln_state["draws"].clear(), lln_render()))
lln_draw(1)
display(HBox([lln_b1, lln_b100, lln_br]), lln_out)
""")

# ============================================================
# 16. Covariate
# ============================================================
md("""
## 16. Covariate

A covariate is a variable you measure alongside your outcome, hoping it
helps explain or predict it — the X in "predict Y from X." Click **Draw new
points** and watch the fitted line and correlation change with the data.
""")

code("""
_cov_rng = np.random.default_rng(SEED + 70)
cov_state = {}

def cov_new():
    x = 1 + _cov_rng.random(12) * 8
    y = np.clip(1 + 0.7 * x + _cov_rng.standard_normal(12) * 1.1, 0, 10)
    cov_state["x"], cov_state["y"] = x, y

cov_new()
cov_out = widgets.Output()

def cov_render():
    with cov_out:
        clear_output(wait=True)
        x, y = cov_state["x"], cov_state["y"]
        slope, intercept, r = fit_line(x, y)
        fig, ax = plt.subplots(figsize=(5, 5))
        ax.scatter(x, y, color=TEAL, s=60, alpha=0.8, zorder=3)
        xs = np.array([0, 10])
        ax.plot(xs, intercept + slope * xs, color=AMBER, linewidth=2)
        ax.set_xlim(0, 10)
        ax.set_ylim(0, 10)
        ax.set_title(f"Y \\u2248 {intercept:.2f} + {slope:.2f}\\u00b7X \\u00b7 correlation r = {r:.2f}", fontsize=10, color=INK_SOFT)
        plt.show()

resample_btn = widgets.Button(description="Draw new points")
resample_btn.on_click(lambda _: (cov_new(), cov_render()))
cov_render()
display(resample_btn, cov_out)
""")

# ============================================================
# 17. Markov Chain
# ============================================================
md("""
## 17. Markov Chain

A Markov chain is a sequence of random states where the future depends only
on where you are right now — not on the path you took to get here. Step
through it and watch time-in-each-state settle into a stable long-run
split.
""")

code("""
_mk_rng = np.random.default_rng(SEED + 80)
mk_state = {"current": 0, "visits": [1, 0, 0]}
mk_out = widgets.Output()

def mk_step():
    row = MARKOV_P[mk_state["current"]]
    nxt = int(_mk_rng.choice(3, p=row))
    mk_state["current"] = nxt
    mk_state["visits"][nxt] += 1

def mk_render():
    with mk_out:
        clear_output(wait=True)
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(7.5, 3.2))
        pos = MARKOV_POS
        for i in range(3):
            for j in range(3):
                if i != j:
                    ax1.plot([pos[i, 0], pos[j, 0]], [pos[i, 1], pos[j, 1]], color=RULE, linewidth=1, zorder=1)
        cur = mk_state["current"]
        for i, st in enumerate(MARKOV_STATES):
            face = TEAL if i == cur else "white"
            edge = TEAL if i == cur else INK_SOFT
            ax1.scatter([pos[i, 0]], [pos[i, 1]], s=1100, color=face, edgecolor=edge, linewidth=2, zorder=2)
            ax1.text(pos[i, 0], pos[i, 1], st, ha="center", va="center", fontsize=13, fontweight="bold",
                      color="white" if i == cur else INK)
        ax1.set_xlim(-0.15, 1.15)
        ax1.set_ylim(-0.15, 1.15)
        ax1.axis("off")
        visits = np.array(mk_state["visits"])
        total = visits.sum()
        frac = visits / total
        ax2.bar(MARKOV_STATES, frac, color=AMBER, alpha=0.75)
        for i, f in enumerate(frac):
            ax2.text(i, f, f"{f * 100:.0f}%", ha="center", va="bottom", fontsize=9, color=INK_SOFT)
        ax2.set_ylim(0, 1)
        ax2.set_title("long-run visit share", fontsize=9, color=INK_SOFT)
        fig.suptitle(
            f"{total - 1} steps taken \\u00b7 currently in state {MARKOV_STATES[cur]} \\u00b7 converging toward 33/33/33",
            fontsize=9, color=INK_SOFT,
        )
        plt.tight_layout()
        plt.show()

mk_b1 = widgets.Button(description="Step once")
mk_b100 = widgets.Button(description="Step 100 times")
mk_br = widgets.Button(description="Reset")
mk_b1.on_click(lambda _: (mk_step(), mk_render()))
mk_b100.on_click(lambda _: ([mk_step() for _ in range(100)], mk_render()))

def mk_reset(_):
    mk_state["current"] = 0
    mk_state["visits"] = [1, 0, 0]
    mk_render()

mk_br.on_click(mk_reset)
mk_render()
display(HBox([mk_b1, mk_b100, mk_br]), mk_out)
""")

# ============================================================
# 18. Frequentist
# ============================================================
md("""
## 18. Frequentist

Frequentist is a stance on what a probability statement *means*: not "how
confident am I," but *how often would this procedure be right if I repeated
it many times*. A 95% CI isn't "95% chance the true value is in this one
interval" — it's "run this whole draw-a-sample-and-build-an-interval recipe
over and over, and about 95% of the resulting intervals contain the truth."
Run more experiments and watch the long-run capture rate settle in.
""")

code("""
_fr_rng = np.random.default_rng(SEED + 90)
fr_state = {"experiments": []}
fr_out = widgets.Output()

def fr_run():
    sample = FREQ_MU + FREQ_SIGMA * _fr_rng.standard_normal(FREQ_N)
    m = float(sample.mean())
    contains = (m - FREQ_HALF <= FREQ_MU) and (FREQ_MU <= m + FREQ_HALF)
    fr_state["experiments"].append((m, contains))

def fr_render():
    with fr_out:
        clear_output(wait=True)
        exps = fr_state["experiments"][-25:]
        fig, ax = plt.subplots(figsize=(6, 4.5))
        ax.axvline(FREQ_MU, color=INK, linestyle="--", linewidth=1.5)
        for i, (m, c) in enumerate(exps):
            color = TEAL if c else AMBER
            ax.plot([m - FREQ_HALF, m + FREQ_HALF], [i, i], color=color, linewidth=3)
            ax.scatter([m], [i], color=INK, s=10, zorder=3)
        ax.set_xlim(35, 65)
        ax.set_yticks([])
        total = len(fr_state["experiments"])
        contained = sum(c for _, c in fr_state["experiments"])
        pct = 100 * contained / total if total else 0.0
        ax.set_title(f"{contained} of {total} intervals ({pct:.1f}%) contain the true \\u03bc = 50", fontsize=10, color=INK_SOFT)
        plt.show()

fr_b1 = widgets.Button(description="+1 experiment")
fr_b40 = widgets.Button(description="+40 experiments")
fr_br = widgets.Button(description="Reset")
fr_b1.on_click(lambda _: (fr_run(), fr_render()))
fr_b40.on_click(lambda _: ([fr_run() for _ in range(40)], fr_render()))
fr_br.on_click(lambda _: (fr_state.__setitem__("experiments", []), fr_render()))
fr_render()
display(HBox([fr_b1, fr_b40, fr_br]), fr_out)
""")

nb["cells"] = cells
nb["metadata"] = {
    "kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
    "language_info": {"name": "python", "version": "3"},
}

with open("statistics-zoo.ipynb", "w") as f:
    nbf.write(nb, f)

print(f"wrote statistics-zoo.ipynb with {len(cells)} cells")
