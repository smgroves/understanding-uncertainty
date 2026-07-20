#!/usr/bin/env python3
"""
Class 10 assignment - build the bootstrap
=========================================

You will implement the bootstrap from scratch, with no numpy: just the
recipe from lecture. The scaffolding (data loading, a reproducible
random generator, the summary statistics, and the stdin/stdout protocol
the autograder speaks) is already written. You fill in the two functions
in the YOUR JOB zone.

THE RECIPE
----------
  1. Treat your sample X as the population.
  2. Resample it WITH REPLACEMENT to the same size n = len(X).
  3. Recompute the statistic on that resample.
  4. Repeat B times. The 2.5th and 97.5th percentiles of those B
     numbers are a 95% confidence interval for the statistic.

DATA (data.json, sitting next to this file)
-------------------------------------------
  {
    "variable": "price_k",              # what the numbers mean
    "unit": "thousands of USD",
    "source": "...",
    "observed_mean": 8.589674,          # the statistic on the full sample
    "observed_median": 5.65,
    "values": [1.0, 1.0, 1.0, ...]      # the 1-D sample X, length n = 92
  }

I/O PROTOCOL (how the autograder talks to you)
----------------------------------------------
The grader launches `python3 bootstrap.py` and sends one query per line
on stdin. Each line is:

    ci <B> <seed> <stat>

  B      number of bootstrap resamples  (int)
  seed   seed for the random generator  (int, makes runs reproducible)
  stat   "mean" or "median"

For every query line you print exactly one line to stdout:

    OK: <lo> <hi>          # the 95% percentile CI, 4 decimals each

If the statistic name is not recognised, print:

    ERR: unknown statistic

Anything off-protocol confuses the grader, so do not print extra lines,
banners, or debug text to stdout (use stderr for debugging).

RUN
---
  echo "ci 2000 42 mean" | python3 bootstrap.py   # -> OK: 7.0059 10.4083
  python3 test_bootstrap.py                        # local autograder
"""
import sys, os, json, math


# ---- provided: reproducible randomness ---------------------
# A linear congruential generator. make_lcg(seed)() returns a float in
# [0, 1). Seeding it makes the whole stream of resamples reproducible,
# which is how the autograder checks your answer. It matches the page's
# JavaScript generator bit-for-bit (the float multiply reproduces the
# same IEEE-754 rounding), so your CI equals the one in the widget.
# Use exactly this rng.
def make_lcg(seed):
    s = float(seed & 0xffffffff)
    def rng():
        nonlocal s
        p = s * 1103515245.0 + 12345.0
        s = float(int(p) % 2147483648)   # ToInt32(p) & 0x7fffffff
        return s / 2147483647.0
    return rng


# ---- provided: summary statistics --------------------------
def mean(X):
    return sum(X) / len(X)

def quantile(sorted_X, p):
    # linear-interpolation quantile (same as numpy's default)
    k = (len(sorted_X) - 1) * p
    lo = math.floor(k); hi = min(lo + 1, len(sorted_X) - 1)
    return sorted_X[lo] + (sorted_X[hi] - sorted_X[lo]) * (k - lo)

def median(X):
    return quantile(sorted(X), 0.5)

def statistic(X, name):
    """The statistic you want a CI for. Raises ValueError for a bad name."""
    if name == "mean":
        return mean(X)
    if name == "median":
        return median(X)
    raise ValueError(name)


# ============================================================
# YOUR JOB starts here.
# ============================================================

def resample(X, rng):
    """Return ONE bootstrap resample of X: a list of len(X) values drawn
    WITH REPLACEMENT, using rng() (a float in [0, 1)) to pick indices.

    Hint: an index into X is  int(rng() * len(X)).
    """
    # TODO: draw len(X) values from X with replacement and return them.
    raise NotImplementedError


def bootstrap_ci(X, B, seed, name):
    """Return the 95% percentile confidence interval (lo, hi) for the
    statistic `name`, built from B bootstrap resamples.

      1. rng = make_lcg(seed)
      2. For t in 1..B: draw a resample, compute statistic(resample, name),
         collect the number.
      3. lo = 2.5th percentile of the collection, hi = 97.5th percentile.
         (Use quantile(sorted_stats, 0.025) and quantile(sorted_stats, 0.975).)

    statistic(...) raises ValueError for an unknown name; let it propagate.
    """
    # TODO: build the bootstrap distribution and return its (2.5%, 97.5%)
    #       percentiles.
    raise NotImplementedError

# ============================================================
# YOUR JOB ends here. Leave everything below unchanged.
# ============================================================


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(here, "data.json")) as f:
        X = json.load(f)["values"]
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        parts = line.split()
        # parts: ["ci", B, seed, stat]
        B, seed, name = int(parts[1]), int(parts[2]), parts[3]
        try:
            lo, hi = bootstrap_ci(X, B, seed, name)
        except ValueError:
            print("ERR: unknown statistic", flush=True)
            continue
        print(f"OK: {lo:.4f} {hi:.4f}", flush=True)


if __name__ == "__main__":
    main()
