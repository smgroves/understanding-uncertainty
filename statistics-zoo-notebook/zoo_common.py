"""Shared data, colors, and math for every Statistics Zoo demo.

Both statistics-zoo.ipynb and make_exports.py import this module so the
numbers (and the pinned toy examples) never drift apart. Mirrors the
constants and generators in ../statistics-zoo.html's <script> block.
"""

import numpy as np
from scipy import stats

# ---- palette (matches statistics-zoo.html's :root custom properties) ----
INK = "#1B2430"
INK_SOFT = "#4A5568"
TEAL = "#2B7A78"
TEAL_SOFT = "#9FC6C4"
AMBER = "#C9852B"
RULE = "#C7CDD3"
BG = "#F2F4F6"
PAPER2 = "#E7EBEE"

SEED = 42


def normal_pdf(x, mu=0.0, sigma=1.0):
    return stats.norm.pdf(x, loc=mu, scale=sigma)


def normal_cdf(x, mu=0.0, sigma=1.0):
    return stats.norm.cdf(x, loc=mu, scale=sigma)


def make_rng(seed=SEED):
    return np.random.default_rng(seed)


# ---- shared datasets, generated once with a fixed seed so every card that
# reuses a dataset (KDE reuses the nonparametric-vs-parametric sample, MLE
# reuses the same sample, p-value/CI reuses the bootstrap sample) sees the
# exact same numbers here as in the HTML zoo. ----

def npp_dataset(seed=SEED):
    """The 160-point sample shared by 'Nonparametric -> Parametric', MLE, and KDE."""
    rng = make_rng(seed)
    data = 4 + 1.6 * rng.standard_normal(160)
    mu, sigma = data.mean(), data.std()
    xmin, xmax = mu - 4.2 * sigma, mu + 4.2 * sigma
    return data, mu, sigma, xmin, xmax


def bootstrap_sample(seed=SEED + 1):
    """The 25-point sample shared by Bootstrap and p-value/CI."""
    rng = make_rng(seed)
    sample = 50 + 10 * rng.standard_normal(25)
    return sample, sample.mean()


ESTIMATOR_TOY = np.array([1.5, 2.5, 3, 5, 6.5, 7, 9])  # pinned, matches the HTML zoo

EXPECTATION_VALUES = np.array([-2, -1, 0, 2, 4])
EXPECTATION_PROBS0 = np.array([0.2, 0.2, 0.2, 0.2, 0.2])

MARKOV_STATES = ["A", "B", "C"]
MARKOV_P = np.array([
    [0.5, 0.3, 0.2],
    [0.2, 0.5, 0.3],
    [0.3, 0.2, 0.5],
])
MARKOV_POS = np.array([[0.5, 0.92], [0.12, 0.12], [0.88, 0.12]])  # (x, y), y measured up

FREQ_MU, FREQ_SIGMA, FREQ_N = 50.0, 10.0, 25
FREQ_SE = FREQ_SIGMA / np.sqrt(FREQ_N)
FREQ_HALF = 1.96 * FREQ_SE

LLN_TRUE_MEAN = 3.5  # a fair six-sided die


def covariate_dataset(seed=SEED + 2, n=12):
    rng = make_rng(seed)
    x = 1 + rng.random(n) * 8
    y = 1 + 0.7 * x + rng.standard_normal(n) * 1.1
    y = np.clip(y, 0, 10)
    return x, y


def sampling_population(seed=SEED + 3, n=200):
    rng = make_rng(seed)
    return rng.random((n, 2))


def iid_sequence(seed=SEED + 4, m=60, kind="iid"):
    rng = make_rng(seed)
    if kind == "iid":
        return rng.standard_normal(m)
    vals = np.zeros(m)
    y = 0.0
    for i in range(m):
        y = 0.92 * y + 0.35 * rng.standard_normal()
        vals[i] = y
    return vals


def fit_line(x, y):
    slope, intercept, r, p, se = stats.linregress(x, y)
    return slope, intercept, r
