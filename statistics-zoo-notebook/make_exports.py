"""Renders a static PNG (and a GIF for the demos that are naturally animated)
for each of the 18 Statistics Zoo cards, for pasting straight into slides.

Run: python3 make_exports.py
Output: exports/<NN>_<slug>.png (and _.gif for the animated ones)

Uses the exact same data/formulas as statistics-zoo.ipynb via zoo_common.py,
so a number you see in a slide matches the number in the notebook.
"""

import matplotlib
matplotlib.use("Agg")

import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import binom
import imageio.v2 as imageio

from zoo_common import (
    INK, INK_SOFT, TEAL, AMBER, RULE, SEED,
    normal_pdf, normal_cdf,
    npp_dataset, bootstrap_sample, fit_line,
    ESTIMATOR_TOY, EXPECTATION_VALUES,
    MARKOV_STATES, MARKOV_P, MARKOV_POS,
    FREQ_MU, FREQ_SIGMA, FREQ_N, FREQ_HALF,
    LLN_TRUE_MEAN, covariate_dataset, sampling_population,
)

plt.rcParams["font.family"] = "serif"
plt.rcParams["axes.edgecolor"] = RULE
plt.rcParams["figure.facecolor"] = "white"
plt.rcParams["figure.dpi"] = 200  # sharpens GIF frames too, since those are captured off the canvas buffer

OUT = "exports"


def save_png(fig, name, dpi=300):
    fig.tight_layout()
    fig.savefig(f"{OUT}/{name}.png", dpi=dpi, facecolor="white")
    plt.close(fig)


def fig_to_frame(fig):
    fig.canvas.draw()
    buf = np.asarray(fig.canvas.buffer_rgba())
    return buf[:, :, :3].copy()


def save_gif(frames, name, fps=6):
    imageio.mimsave(f"{OUT}/{name}.gif", frames, fps=fps, loop=0)


# ============================================================
# 1. Random Variable — GIF of flips accumulating + final PNG
# ============================================================
def export_rv():
    rng = np.random.default_rng(SEED)
    history = []
    frames = []

    def render():
        counts = {0: 0, 1: 0}
        fig, ax = plt.subplots(figsize=(6, 2.2))
        for v in history:
            y = 0.4 + counts[v] * 0.55
            ax.scatter(v, y, s=140, color=TEAL, alpha=0.85, zorder=3)
            counts[v] += 1
        ax.set_xlim(-0.5, 1.5); ax.set_ylim(0, 5.5); ax.set_yticks([])
        ax.set_xticks([0, 1]); ax.set_xticklabels(["Tails → 0", "Heads → 1"])
        for s in ("top", "right", "left"):
            ax.spines[s].set_visible(False)
        ax.set_title(f"{len(history)} flips · {counts[1]} heads", fontsize=11, color=INK_SOFT)
        return fig

    for _ in range(12):
        history.append(int(rng.integers(0, 2)))
        frames.append(fig_to_frame(render()))
        plt.close("all")
    save_gif(frames, "01_random_variable")
    save_png(render(), "01_random_variable")


# ============================================================
# 2. eCDF — GIF of the staircase building + final PNG
# ============================================================
def export_ecdf():
    rng = np.random.default_rng(SEED + 10)
    pool = np.clip(rng.standard_normal(150), -4, 4)
    frames = []

    def render(n):
        fig, ax = plt.subplots(figsize=(6, 3))
        ax.set_xlim(-4, 4); ax.set_ylim(0, 1)
        if n > 0:
            pts = np.sort(pool[:n])
            y = np.arange(1, n + 1) / n
            ax.plot([-4, pts[0]], [0, 0], color=TEAL, linewidth=2.2)
            ax.step(pts, y, where="post", color=TEAL, linewidth=2.2)
            ax.plot([pts[-1], 4], [1, 1], color=TEAL, linewidth=2.2)
            ax.scatter(pts, np.full_like(pts, -0.02), s=14, color=INK_SOFT, clip_on=False)
        ax.set_title(f"n = {n} points · eCDF(x) = fraction of data ≤ x", fontsize=10, color=INK_SOFT)
        return fig

    for n in range(0, 151, 5):
        frames.append(fig_to_frame(render(n)))
        plt.close("all")
    save_gif(frames, "02_ecdf")
    save_png(render(60), "02_ecdf")


# ============================================================
# 3. PMF vs PDF — two PNGs
# ============================================================
def export_pmf_pdf():
    fig, ax = plt.subplots(figsize=(6, 3))
    ks = np.arange(0, 11)
    probs = binom.pmf(ks, 10, 0.5)
    ax.bar(ks, probs, color=TEAL, alpha=0.85, width=0.7)
    for k, p in zip(ks, probs):
        if p > probs.max() * 0.06:
            ax.text(k, p, f"{p:.2f}", ha="center", va="bottom", fontsize=8, color=INK_SOFT)
    ax.set_title("Binomial(n=10, p=0.5) — bar height = P(X=k)", fontsize=10, color=INK_SOFT)
    save_png(fig, "03_pmf")

    fig, ax = plt.subplots(figsize=(6, 3))
    a, b = -1, 1
    xs = np.linspace(-4, 4, 400)
    ys = normal_pdf(xs)
    ax.plot(xs, ys, color=TEAL, linewidth=2.2)
    mask = (xs >= a) & (xs <= b)
    ax.fill_between(xs[mask], ys[mask], color=AMBER, alpha=0.28)
    for v in (a, b):
        ax.axvline(v, color=AMBER, linewidth=1.4)
    area = normal_cdf(b) - normal_cdf(a)
    ax.set_title(f"height ≠ probability — P({a} ≤ X ≤ {b}) ≈ {area:.3f}", fontsize=10, color=INK_SOFT)
    save_png(fig, "03_pdf")


# ============================================================
# 4. CDF — one PNG
# ============================================================
def export_cdf():
    fig, ax = plt.subplots(figsize=(6, 3))
    xs = np.linspace(-4, 4, 300)
    ax.plot(xs, normal_cdf(xs), color=TEAL, linewidth=2.2)
    x = 1.0
    y = normal_cdf(x)
    ax.plot([x, x], [0, y], color=AMBER, linewidth=1.4)
    ax.plot([-4, x], [y, y], color=AMBER, linewidth=1.4)
    ax.scatter([x], [y], color=AMBER, zorder=3)
    ax.set_xlim(-4, 4); ax.set_ylim(0, 1)
    ax.set_title(f"x = {x:.2f} · Φ(x) = P(X ≤ x) = {y:.3f}", fontsize=11, color=INK_SOFT)
    save_png(fig, "04_cdf")


# ============================================================
# 5. Nonparametric -> Parametric — GIF sweep + 3 PNG snapshots
# ============================================================
def export_npp():
    data, mu, sigma, xmin, xmax = npp_dataset()
    counts, edges = np.histogram(data, bins=20, range=(xmin, xmax), density=True)

    def render(t):
        fig, ax = plt.subplots(figsize=(6, 3))
        width = edges[1] - edges[0]
        ax.bar(edges[:-1], counts, width=width, align="edge", color=TEAL, alpha=1 - t)
        xs = np.linspace(xmin, xmax, 300)
        ax.plot(xs, normal_pdf(xs, mu, sigma), color=AMBER, linewidth=2.4, alpha=t)
        if t < 0.25:
            msg = "Nonparametric: no assumed shape"
        elif t < 0.75:
            msg = "Blending"
        else:
            msg = f"Parametric: Normal(μ≈{mu:.2f}, σ≈{sigma:.2f})"
        ax.set_title(msg, fontsize=10, color=INK_SOFT)
        return fig

    frames = []
    for t in np.linspace(0, 1, 25):
        frames.append(fig_to_frame(render(t)))
        plt.close("all")
    save_gif(frames, "05_nonparam_to_param")
    for t, tag in [(0.0, "nonparametric"), (0.5, "blend"), (1.0, "parametric")]:
        save_png(render(t), f"05_{tag}")


# ============================================================
# 6. Bootstrap — GIF building the resample histogram + final PNG
# ============================================================
def export_bootstrap():
    sample, sample_mean = bootstrap_sample()
    rng = np.random.default_rng(SEED + 20)
    means = []
    frames = []

    def render():
        fig, (ax0, ax1) = plt.subplots(2, 1, figsize=(6, 4.6), gridspec_kw={"height_ratios": [1, 2]})
        jitter = np.random.default_rng(0).random(len(sample)) * 0.6
        ax0.scatter(sample, jitter, color=TEAL, alpha=0.7, s=20)
        ax0.axvline(sample_mean, color=INK, linewidth=1.6)
        ax0.set_yticks([])
        ax0.set_title(f"original sample (n=25), mean = {sample_mean:.1f}", fontsize=10, color=INK_SOFT)
        if means:
            ax1.hist(means, bins=24, color=AMBER, alpha=0.75)
            ax1.set_title(f"B = {len(means)} resamples · bootstrap SE = {np.std(means):.3f}", fontsize=10, color=INK_SOFT)
        else:
            ax1.set_xticks([]); ax1.set_yticks([])
        return fig

    for step in range(30):
        for _ in range(5):
            means.append(float(rng.choice(sample, size=len(sample), replace=True).mean()))
        frames.append(fig_to_frame(render()))
        plt.close("all")
    save_gif(frames, "06_bootstrap")
    save_png(render(), "06_bootstrap")


# ============================================================
# 7. MLE — two PNGs (off guess vs snapped)
# ============================================================
def export_mle():
    data, mu, sigma, xmin, xmax = npp_dataset()

    def render(m, s):
        fig, ax = plt.subplots(figsize=(6, 3))
        ax.plot(data, np.full_like(data, -0.01), "|", color=INK_SOFT, alpha=0.6, markersize=10)
        xs = np.linspace(xmin, xmax, 300)
        ax.plot(xs, normal_pdf(xs, m, s), color=AMBER, linewidth=2.4)
        ll = float(np.sum(np.log(normal_pdf(data, m, s))))
        ax.set_title(f"μ={m:.2f}, σ={s:.2f} · log-likelihood = {ll:.1f}", fontsize=10, color=INK_SOFT)
        return fig

    save_png(render(2.0, 2.5), "07_mle_off")
    save_png(render(mu, sigma), "07_mle_snapped")


# ============================================================
# 8. KDE — GIF sweeping bandwidth + 3 PNG snapshots
# ============================================================
def export_kde():
    data, mu, sigma, xmin, xmax = npp_dataset()
    counts, edges = np.histogram(data, bins=20, range=(xmin, xmax), density=True)

    def kde_at(xs, h):
        diffs = (xs[:, None] - data[None, :]) / h
        return normal_pdf(diffs).sum(axis=1) / (len(data) * h)

    def render(h):
        fig, ax = plt.subplots(figsize=(6, 3))
        width = edges[1] - edges[0]
        ax.bar(edges[:-1], counts, width=width, align="edge", color=TEAL, alpha=0.32)
        xs = np.linspace(xmin, xmax, 160)
        ax.plot(xs, kde_at(xs, h), color=AMBER, linewidth=2.4)
        msg = "spiky" if h < 0.3 else ("oversmoothed" if h > 1.2 else "a reasonable bandwidth")
        ax.set_title(f"h = {h:.2f} · {msg}", fontsize=10, color=INK_SOFT)
        return fig

    frames = []
    for h in np.linspace(0.08, 2.5, 30):
        frames.append(fig_to_frame(render(h)))
        plt.close("all")
    save_gif(frames, "08_kde")
    for h, tag in [(0.15, "spiky"), (0.55, "reasonable"), (2.0, "oversmoothed")]:
        save_png(render(h), f"08_kde_{tag}")


# ============================================================
# 9. p-value vs CI — two PNGs (fail to reject / reject)
# ============================================================
def export_pvalue_ci():
    sample, sample_mean = bootstrap_sample()
    rng = np.random.default_rng(SEED + 30)
    boot_means = np.array([rng.choice(sample, size=len(sample), replace=True).mean() for _ in range(2000)])
    se = float(boot_means.std())
    abs_z_sorted = np.sort(np.abs((boot_means - sample_mean) / se))
    c = abs_z_sorted[min(len(abs_z_sorted) - 1, round(0.95 * (len(abs_z_sorted) - 1)))]
    ci_lo, ci_hi = sample_mean - c * se, sample_mean + c * se

    def render(s0):
        fig, ax = plt.subplots(figsize=(6, 3))
        counts, edges = np.histogram(boot_means, bins=26)
        centers = (edges[:-1] + edges[1:]) / 2
        colors = [TEAL if ci_lo <= cc <= ci_hi else "#B7C1C6" for cc in centers]
        ax.bar(edges[:-1], counts, width=edges[1] - edges[0], align="edge", color=colors, alpha=0.85)
        z0 = (sample_mean - s0) / se
        extreme = np.sum(np.abs((boot_means - sample_mean) / se) > abs(z0))
        p = extreme / len(boot_means)
        reject = s0 < ci_lo or s0 > ci_hi
        ax.axvline(s0, color=AMBER if reject else INK, linewidth=2)
        verdict = "REJECT" if reject else "FAIL TO REJECT"
        ax.set_title(
            f"95% CI=({ci_lo:.2f},{ci_hi:.2f}) · s₀={s0:.1f} · p≈{p:.3f} · {verdict}",
            fontsize=9, color=INK_SOFT,
        )
        return fig

    save_png(render(sample_mean), "09_pvci_fail_to_reject")
    save_png(render(ci_lo - 2), "09_pvci_reject")


# ============================================================
# 10. Sampling — one PNG
# ============================================================
def export_sampling():
    pop = sampling_population()
    rng = np.random.default_rng(SEED + 40)
    n = 30
    idx = rng.permutation(len(pop))[:n]
    mask = np.zeros(len(pop), dtype=bool)
    mask[idx] = True
    fig, ax = plt.subplots(figsize=(5, 5))
    ax.scatter(pop[~mask, 0], pop[~mask, 1], color="#C7CDD3", s=18, alpha=0.7)
    ax.scatter(pop[mask, 0], pop[mask, 1], color=TEAL, s=36, alpha=0.9)
    ax.set_xticks([]); ax.set_yticks([])
    ax.set_title(f"n = {n} sampled out of a population of {len(pop)}", fontsize=10, color=INK_SOFT)
    save_png(fig, "10_sampling")


# ============================================================
# 11. iid — two PNGs
# ============================================================
def export_iid():
    rng = np.random.default_rng(SEED + 50)
    iid_vals = rng.standard_normal(60)
    non_vals = np.zeros(60)
    y = 0.0
    for i in range(60):
        y = 0.92 * y + 0.35 * rng.standard_normal()
        non_vals[i] = y

    fig, ax = plt.subplots(figsize=(6, 3))
    ax.scatter(range(60), iid_vals, color=TEAL, s=20, alpha=0.85, zorder=3)
    ax.set_title("iid: fresh draws from Normal(0,1) — no memory between points", fontsize=9, color=INK_SOFT)
    save_png(fig, "11_iid")

    fig, ax = plt.subplots(figsize=(6, 3))
    ax.plot(non_vals, color=AMBER, linewidth=1.6)
    ax.scatter(range(60), non_vals, color=AMBER, s=20, alpha=0.85, zorder=3)
    ax.set_title("non-iid: each point is 92% of the last plus a nudge — the path drifts", fontsize=9, color=INK_SOFT)
    save_png(fig, "11_non_iid")


# ============================================================
# 12. Expectation — two PNGs (uniform vs skewed)
# ============================================================
def export_expectation():
    def render(probs, tag):
        probs = np.array(probs)
        fig, ax = plt.subplots(figsize=(6, 3))
        ax.bar(EXPECTATION_VALUES, probs, width=0.6, color=TEAL, alpha=0.8)
        for v, p in zip(EXPECTATION_VALUES, probs):
            ax.text(v, p, f"{p:.2f}", ha="center", va="bottom", fontsize=9, color=INK_SOFT)
        ex = float(np.sum(EXPECTATION_VALUES * probs))
        ax.axvline(ex, color=AMBER, linewidth=2)
        ax.set_ylim(0, 1)
        ax.set_title(f"E[X] = {ex:.2f}", fontsize=10, color=INK_SOFT)
        save_png(fig, f"12_expectation_{tag}")

    render([0.2, 0.2, 0.2, 0.2, 0.2], "uniform")
    render([0.05, 0.05, 0.1, 0.3, 0.5], "skewed")


# ============================================================
# 13. Estimator — two PNGs (toy data, then with an outlier)
# ============================================================
def export_estimator():
    def render(X, tag):
        X = np.array(X)
        fig, ax = plt.subplots(figsize=(6, 2.6))
        ax.scatter(X, np.zeros_like(X), s=80, facecolor="none", edgecolor=TEAL, linewidth=1.6, zorder=3)
        mean, median, midrange = X.mean(), float(np.median(X)), (X.min() + X.max()) / 2
        for v, c, lbl in [(mean, AMBER, "mean"), (median, INK, "median"), (midrange, "#3a6ea5", "midrange")]:
            ax.axvline(v, color=c, linestyle="--", linewidth=1.6)
            ax.text(v, 1.15, lbl, color=c, ha="center", fontsize=8)
        ax.set_xlim(0, 12)
        ax.set_ylim(-0.3, 1.5)
        ax.set_yticks([])
        ax.set_title(f"mean={mean:.2f} · median={median:.2f} · midrange={midrange:.2f}", fontsize=9, color=INK_SOFT)
        save_png(fig, f"13_estimator_{tag}")

    render(ESTIMATOR_TOY, "toy")
    render(np.append(ESTIMATOR_TOY[:-1], 11.5), "outlier")


# ============================================================
# 14. Likelihood — two PNGs
# ============================================================
def export_likelihood():
    THETA, SIGMA_L, x0 = 2.0, 1.0, 4.0

    fig, ax = plt.subplots(figsize=(6, 3))
    xs = np.linspace(-3, 7, 300)
    ax.plot(xs, normal_pdf(xs, THETA, SIGMA_L), color=TEAL, linewidth=2.2)
    fx0 = normal_pdf(x0, THETA, SIGMA_L)
    ax.axvline(x0, color=AMBER, linewidth=2)
    ax.scatter([x0], [fx0], color=AMBER, zorder=3)
    ax.set_title(f"PDF view: θ={THETA} fixed · f(x₀={x0:.1f}) = {fx0:.3f}", fontsize=10, color=INK_SOFT)
    save_png(fig, "14_likelihood_pdf_view")

    fig, ax = plt.subplots(figsize=(6, 3))
    ths = np.linspace(-3, 7, 300)
    ax.plot(ths, normal_pdf(x0, ths, SIGMA_L), color=AMBER, linewidth=2.2)
    ax.axvline(x0, color=TEAL, linestyle="--", linewidth=1.4)
    ax.set_title(f"Likelihood view: x₀={x0:.1f} fixed · peaks at θ={x0:.1f}", fontsize=10, color=INK_SOFT)
    save_png(fig, "14_likelihood_view")


# ============================================================
# 15. LLN — GIF of running mean converging + final PNG
# ============================================================
def export_lln():
    rng = np.random.default_rng(SEED + 60)
    draws = []
    frames = []

    def render():
        fig, ax = plt.subplots(figsize=(6, 3))
        cur = LLN_TRUE_MEAN
        if draws:
            running = np.cumsum(draws) / np.arange(1, len(draws) + 1)
            ax.plot(range(1, len(draws) + 1), running, color=TEAL, linewidth=2)
            cur = running[-1]
        ax.axhline(LLN_TRUE_MEAN, color="#3a6ea5", linestyle="--", linewidth=1.4)
        ax.set_ylim(1, 6)
        ax.set_title(f"n = {len(draws)} · running mean = {cur:.3f} · true mean = {LLN_TRUE_MEAN}", fontsize=10, color=INK_SOFT)
        return fig

    for step in range(30):
        draws.extend(rng.integers(1, 7, size=10).tolist())
        frames.append(fig_to_frame(render()))
        plt.close("all")
    save_gif(frames, "15_lln")
    save_png(render(), "15_lln")


# ============================================================
# 16. Covariate — one PNG
# ============================================================
def export_covariate():
    x, y = covariate_dataset()
    slope, intercept, r = fit_line(x, y)
    fig, ax = plt.subplots(figsize=(5, 5))
    ax.scatter(x, y, color=TEAL, s=60, alpha=0.8, zorder=3)
    xs = np.array([0, 10])
    ax.plot(xs, intercept + slope * xs, color=AMBER, linewidth=2)
    ax.set_xlim(0, 10); ax.set_ylim(0, 10)
    ax.set_title(f"Y ≈ {intercept:.2f} + {slope:.2f}·X · r = {r:.2f}", fontsize=10, color=INK_SOFT)
    save_png(fig, "16_covariate")


# ============================================================
# 17. Markov Chain — GIF stepping + final PNG
# ============================================================
def export_markov():
    rng = np.random.default_rng(SEED + 80)
    current = 0
    visits = [1, 0, 0]
    frames = []

    def render():
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(7.5, 3.2))
        pos = MARKOV_POS
        for i in range(3):
            for j in range(3):
                if i != j:
                    ax1.plot([pos[i, 0], pos[j, 0]], [pos[i, 1], pos[j, 1]], color=RULE, linewidth=1, zorder=1)
        for i, st in enumerate(MARKOV_STATES):
            face = TEAL if i == current else "white"
            edge = TEAL if i == current else INK_SOFT
            ax1.scatter([pos[i, 0]], [pos[i, 1]], s=1100, color=face, edgecolor=edge, linewidth=2, zorder=2)
            ax1.text(pos[i, 0], pos[i, 1], st, ha="center", va="center", fontsize=13, fontweight="bold",
                      color="white" if i == current else INK)
        ax1.set_xlim(-0.15, 1.15); ax1.set_ylim(-0.15, 1.15); ax1.axis("off")
        v = np.array(visits)
        frac = v / v.sum()
        ax2.bar(MARKOV_STATES, frac, color=AMBER, alpha=0.75)
        for i, f in enumerate(frac):
            ax2.text(i, f, f"{f * 100:.0f}%", ha="center", va="bottom", fontsize=9, color=INK_SOFT)
        ax2.set_ylim(0, 1)
        fig.suptitle(f"{v.sum() - 1} steps · state {MARKOV_STATES[current]}", fontsize=9, color=INK_SOFT)
        return fig

    for step in range(60):
        row = MARKOV_P[current]
        current = int(rng.choice(3, p=row))
        visits[current] += 1
        frames.append(fig_to_frame(render()))
        plt.close("all")
    save_gif(frames, "17_markov")
    save_png(render(), "17_markov")


# ============================================================
# 18. Frequentist — GIF building intervals + final PNG
# ============================================================
def export_frequentist():
    rng = np.random.default_rng(SEED + 90)
    experiments = []
    frames = []

    def render():
        fig, ax = plt.subplots(figsize=(6, 4.5))
        ax.axvline(FREQ_MU, color=INK, linestyle="--", linewidth=1.5)
        for i, (m, c) in enumerate(experiments[-25:]):
            color = TEAL if c else AMBER
            ax.plot([m - FREQ_HALF, m + FREQ_HALF], [i, i], color=color, linewidth=3)
            ax.scatter([m], [i], color=INK, s=10, zorder=3)
        ax.set_xlim(35, 65)
        ax.set_yticks([])
        total = len(experiments)
        contained = sum(c for _, c in experiments)
        pct = 100 * contained / total if total else 0.0
        ax.set_title(f"{contained} of {total} intervals ({pct:.1f}%) contain the true μ = 50", fontsize=10, color=INK_SOFT)
        return fig

    for step in range(40):
        sample = FREQ_MU + FREQ_SIGMA * rng.standard_normal(FREQ_N)
        m = float(sample.mean())
        contains = (m - FREQ_HALF <= FREQ_MU) and (FREQ_MU <= m + FREQ_HALF)
        experiments.append((m, contains))
        frames.append(fig_to_frame(render()))
        plt.close("all")
    save_gif(frames, "18_frequentist")
    save_png(render(), "18_frequentist")


if __name__ == "__main__":
    import os
    os.makedirs(OUT, exist_ok=True)
    exporters = [
        export_rv, export_ecdf, export_pmf_pdf, export_cdf, export_npp,
        export_bootstrap, export_mle, export_kde, export_pvalue_ci,
        export_sampling, export_iid, export_expectation, export_estimator,
        export_likelihood, export_lln, export_covariate, export_markov,
        export_frequentist,
    ]
    for fn in exporters:
        fn()
        print("done:", fn.__name__)
