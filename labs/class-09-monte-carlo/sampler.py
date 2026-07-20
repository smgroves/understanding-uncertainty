#!/usr/bin/env python3
"""
Understanding Uncertainty - Monte Carlo sampler (standalone, stdlib only)
-------------------------------------------------------------------------
Two ideas, one loop:
  1. The WEAK LAW OF LARGE NUMBERS: the sample mean of iid draws
     converges to the expected value E[X] as n grows.
  2. MONTE CARLO: estimate E[g(X)] (an average, an integral, or pi) by
     drawing random points and averaging g over them. The error shrinks
     like 1/sqrt(n), regardless of the dimension of the problem.

This mirrors sampler.js line-for-line so you can compare the two.
No numpy: every formula is spelled out. All randomness comes from one
seeded linear-congruential generator (make_rng), so every run is
reproducible and matches sampler.js and the web widgets exactly.

Usage:
  python3 sampler.py mean  [n] [seed]   # MC estimate of E[X] from n draws
  python3 sampler.py pi    [n] [seed]   # MC estimate of pi from n points
  python3 sampler.py trace [n] [seed]   # running mean after each of n draws
Reads the population from data.json sitting next to this file.
"""
import sys, os, json, math

# ---- Seeded random number generator -------------------------
# A linear-congruential generator (LCG). Same constants as LabBase.makeLcg
# in the browser, so a given seed produces the same stream in JS and Python.
# Returns a function that yields the next uniform value in [0, 1).
def make_rng(seed):
    s = int(seed) & 0x7fffffff
    def rng():
        nonlocal s
        s = (s * 1103515245 + 12345) & 0x7fffffff
        return s / 0x7fffffff
    return rng

# ---- Summary statistics -------------------------------------
def mean(a):
    return sum(a) / len(a)

def std(a):
    m = mean(a)
    return math.sqrt(sum((x - m) ** 2 for x in a) / len(a))

# ---- WLLN / Monte Carlo estimator of E[X] -------------------
# Treat the data.json values as the population. Draw n values from it with
# replacement and average them: that average estimates the population mean.
def resample_mean(X, n, seed):
    rng = make_rng(seed)
    total = 0.0
    for _ in range(n):
        total += X[int(rng() * len(X))]
    return total / n

# The running mean after each draw (for the convergence plot). Element k-1
# is the average of the first k draws; it should settle toward E[X].
def running_mean(X, n, seed):
    rng = make_rng(seed)
    out, total = [], 0.0
    for k in range(1, n + 1):
        total += X[int(rng() * len(X))]
        out.append(total / k)
    return out

# ---- Monte Carlo estimate of pi -----------------------------
# Throw n points uniformly into the unit square [0,1] x [0,1]. The quarter
# circle x^2 + y^2 < 1 has area pi/4, so the fraction of points inside,
# times 4, estimates pi.
def estimate_pi(n, seed):
    rng = make_rng(seed)
    inside = 0
    for _ in range(n):
        x, y = rng(), rng()
        if x * x + y * y < 1.0:
            inside += 1
    return 4.0 * inside / n

# ---- CLI ----------------------------------------------------
def main():
    here = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(here, "data.json")) as f:
        data = json.load(f)
    X = data["values"]
    truth = data.get("true_mean", mean(X))

    argv = sys.argv[1:]
    cmd = argv[0] if argv else "mean"

    if cmd == "mean":
        n = int(argv[1]) if len(argv) > 1 else 1000
        seed = int(argv[2]) if len(argv) > 2 else 1
        est = resample_mean(X, n, seed)
        se = std(X) / math.sqrt(n)               # standard error of the mean
        sys.stderr.write(f"# n={n} seed={seed} truth={truth:.6f} se={se:.6f}\n")
        print(f"{est:.6f}")
    elif cmd == "pi":
        n = int(argv[1]) if len(argv) > 1 else 1000
        seed = int(argv[2]) if len(argv) > 2 else 1
        est = estimate_pi(n, seed)
        sys.stderr.write(f"# n={n} seed={seed} truth={math.pi:.6f}\n")
        print(f"{est:.6f}")
    elif cmd == "trace":
        n = int(argv[1]) if len(argv) > 1 else 200
        seed = int(argv[2]) if len(argv) > 2 else 1
        sys.stderr.write(f"# k running_mean  (truth={truth:.6f})\n")
        for k, m in enumerate(running_mean(X, n, seed), start=1):
            print(f"{k}\t{m:.6f}")
    else:
        sys.stderr.write("usage: python3 sampler.py [mean|pi|trace] [n] [seed]\n")
        sys.exit(1)

if __name__ == "__main__":
    main()
