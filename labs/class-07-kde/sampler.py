#!/usr/bin/env python3
"""
Understanding Uncertainty - KDE sampler (standalone, stdlib only)
-----------------------------------------------------------------
A kernel density estimate is two things at once:
  1. an ESTIMATOR of the density f(x)  -> evaluate on a grid
  2. a GENERATIVE MODEL you can sample from -> draw new x values

This mirrors sampler.js line-for-line so you can compare the two.
No numpy: every formula is spelled out.

Usage:
  python3 sampler.py grid   [bandwidth] [kernel]     # print x, f_hat(x)
  python3 sampler.py sample [n] [bandwidth] [kernel] # draw n values
kernel is "gaussian" (default) or "uniform".
With no bandwidth, Silverman's rule-of-thumb is used.
Reads the sample from data.json sitting next to this file.
"""
import sys, os, json, math, random

# ---- Kernels ------------------------------------------------
# Each kernel k(z) integrates to 1 and is centered at 0. The KDE
# places one copy of (1/h)*k((x - x_i)/h) on every data point.
def gaussian_kernel(z):
    return math.exp(-(z * z) / 2) / math.sqrt(2 * math.pi)

def uniform_kernel(z):
    # The "moving window": 1/2 inside |z| < 1, zero outside.
    return 0.5 if abs(z) < 1 else 0.0

def kernel_for(name):
    return uniform_kernel if name == "uniform" else gaussian_kernel

# ---- Summary statistics -------------------------------------
def mean(X):
    return sum(X) / len(X)

def std(X):
    m = mean(X)
    return math.sqrt(sum((x - m) ** 2 for x in X) / len(X))

def quantile(sorted_X, p):
    k = (len(sorted_X) - 1) * p
    lo = math.floor(k)
    hi = min(lo + 1, len(sorted_X) - 1)
    return sorted_X[lo] + (sorted_X[hi] - sorted_X[lo]) * (k - lo)

def iqr(X):
    s = sorted(X)
    return quantile(s, 0.75) - quantile(s, 0.25)

# ---- Silverman's rule-of-thumb bandwidth --------------------
# The constant depends on the kernel:
#   uniform  -> 1.84 * sd * n^(-1/5)
#   gaussian -> 0.9  * min(sd, IQR/1.34) * n^(-1/5)  (robust form)
def silverman(X, kernel):
    n = len(X)
    if kernel == "uniform":
        return 1.84 * std(X) * n ** (-0.2)
    return 0.9 * min(std(X), iqr(X) / 1.34) * n ** (-0.2)

# ---- The estimator ------------------------------------------
# f_hat(x) = (1 / n h) * sum_i k((x - x_i) / h)
def kde_at(x, X, h, kernel):
    k = kernel_for(kernel)
    return sum(k((x - xi) / h) for xi in X) / (len(X) * h)

def kde_grid(X, h, kernel, grid_points=120):
    lo = min(X) - h
    hi = max(X) + h
    step = (hi - lo) / (grid_points - 1)
    return [(lo + i * step, kde_at(lo + i * step, X, h, kernel))
            for i in range(grid_points)]

# ---- Sampling from the KDE ----------------------------------
# The KDE is a mixture: pick a data point uniformly, then jitter it
# by the kernel. For the Gaussian that jitter is Normal(0, h); for
# the uniform kernel it is Uniform(-h, h).
def kde_sample(X, h, kernel, n, rng=random):
    out = []
    for _ in range(n):
        base = X[rng.randrange(len(X))]
        if kernel == "uniform":
            jitter = (rng.random() * 2 - 1) * h
        else:
            jitter = rng.gauss(0, 1) * h
        out.append(base + jitter)
    return out

# ---- CLI ----------------------------------------------------
def main():
    here = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(here, "data.json")) as f:
        X = json.load(f)["values"]
    argv = sys.argv[1:]
    cmd = argv[0] if argv else "grid"

    if cmd == "grid":
        kernel = argv[2] if len(argv) > 2 else "gaussian"
        h = float(argv[1]) if len(argv) > 1 else silverman(X, kernel)
        sys.stderr.write(f"# n={len(X)}  kernel={kernel}  h={h:.4f}\n")
        for x, fx in kde_grid(X, h, kernel):
            print(f"{x:.4f}\t{fx:.6f}")
    elif cmd == "sample":
        n = int(argv[1]) if len(argv) > 1 else 10
        kernel = argv[3] if len(argv) > 3 else "gaussian"
        h = float(argv[2]) if len(argv) > 2 else silverman(X, kernel)
        for v in kde_sample(X, h, kernel, n):
            print(f"{v:.4f}")
    else:
        sys.stderr.write("usage: python3 sampler.py [grid|sample] ...\n")
        sys.exit(1)

if __name__ == "__main__":
    main()
