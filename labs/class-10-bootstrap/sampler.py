#!/usr/bin/env python3
"""
Understanding Uncertainty - Bootstrap sampler (standalone, stdlib only)
----------------------------------------------------------------------
The bootstrap turns ONE sample into an estimate of how much a statistic
would wobble across many samples. The recipe:

  1. Treat your sample as the population.
  2. Resample it WITH REPLACEMENT to the same size n.
  3. Recompute the statistic on that resample.
  4. Repeat B times. The spread of those B numbers approximates the
     sampling distribution; its middle 95% is a confidence interval.

This mirrors sampler.js line-for-line so you can compare the two.
No numpy: every formula is spelled out. Randomness comes from a small
linear congruential generator (the same one lab-base.js uses), so a
given seed always reproduces the same resamples.

Usage:
  python3 sampler.py boot [B] [seed] [stat]  # print the B bootstrap stats
  python3 sampler.py ci   [B] [seed] [stat]  # print 95% CI + bootstrap SE
stat is "mean" (default) or "median". B defaults to 2000, seed to 42.
Reads the sample from data.json sitting next to this file.
"""
import sys, os, json, math

# ---- Reproducible randomness --------------------------------
# A linear congruential generator that reproduces LabBase.makeLcg
# (lab-base.js) EXACTLY, including the IEEE-754 double rounding of the
# multiply (s * 1103515245 overflows 2**53, so JavaScript loses low
# bits; doing the multiply in float here reproduces that same loss).
# The upshot: the page widget, sampler.js, and this file all draw the
# identical stream from a given seed. Returns a float in [0, 1).
def make_lcg(seed):
    s = float(seed & 0xffffffff)
    def rng():
        nonlocal s
        p = s * 1103515245.0 + 12345.0
        s = float(int(p) % 2147483648)   # ToInt32(p) & 0x7fffffff
        return s / 2147483647.0
    return rng

# ---- Statistics of a sample ---------------------------------
def mean(X):
    return sum(X) / len(X)

def std(X):
    m = mean(X)
    return math.sqrt(sum((x - m) ** 2 for x in X) / len(X))

def quantile(sorted_X, p):
    # linear-interpolation quantile (same as numpy's default)
    k = (len(sorted_X) - 1) * p
    lo = math.floor(k)
    hi = min(lo + 1, len(sorted_X) - 1)
    return sorted_X[lo] + (sorted_X[hi] - sorted_X[lo]) * (k - lo)

def median(X):
    return quantile(sorted(X), 0.5)

def statistic(X, name):
    # The one thing you want a confidence interval for.
    if name == "mean":
        return mean(X)
    if name == "median":
        return median(X)
    raise ValueError(name)

# ---- One bootstrap resample ---------------------------------
# Draw n indices uniformly WITH REPLACEMENT, so the same observation
# can appear several times and others not at all.
def resample(X, rng):
    n = len(X)
    return [X[int(rng() * n)] for _ in range(n)]

# ---- The bootstrap distribution -----------------------------
# B resamples -> B recomputed statistics. That collection is the
# simulated sampling distribution of the statistic.
def bootstrap_stats(X, B, seed, name):
    rng = make_lcg(seed)
    return [statistic(resample(X, rng), name) for _ in range(B)]

# ---- Percentile confidence interval -------------------------
# The (1 - alpha) CI is the alpha/2 and 1 - alpha/2 quantiles of the
# bootstrap statistics. For 95%, that is the 2.5th and 97.5th.
def percentile_ci(stats, alpha=0.05):
    s = sorted(stats)
    return quantile(s, alpha / 2), quantile(s, 1 - alpha / 2)

def bootstrap_se(stats):
    # The standard error is just the spread of the bootstrap stats.
    return std(stats)

# ---- CLI ----------------------------------------------------
def main():
    here = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(here, "data.json")) as f:
        X = json.load(f)["values"]
    argv = sys.argv[1:]
    cmd = argv[0] if argv else "ci"
    B = int(argv[1]) if len(argv) > 1 else 2000
    seed = int(argv[2]) if len(argv) > 2 else 42
    name = argv[3] if len(argv) > 3 else "mean"

    stats = bootstrap_stats(X, B, seed, name)

    if cmd == "boot":
        sys.stderr.write(f"# n={len(X)}  B={B}  seed={seed}  stat={name}\n")
        for s in stats:
            print(f"{s:.6f}")
    elif cmd == "ci":
        lo, hi = percentile_ci(stats, 0.05)
        se = bootstrap_se(stats)
        obs = statistic(X, name)
        sys.stderr.write(f"# n={len(X)}  B={B}  seed={seed}  stat={name}\n")
        print(f"observed {name}: {obs:.4f}")
        print(f"95% CI: ({lo:.4f}, {hi:.4f})")
        print(f"bootstrap SE: {se:.4f}")
    else:
        sys.stderr.write("usage: python3 sampler.py [boot|ci] [B] [seed] [stat]\n")
        sys.exit(1)

if __name__ == "__main__":
    main()
