#!/usr/bin/env python3
"""
Understanding Uncertainty - ECDF + inverse-transform sampler
-------------------------------------------------------------
A cumulative distribution function is two things at once:
  1. an ESTIMATOR of F(x) = P(X <= x)   -> evaluate the ECDF on a grid
  2. a GENERATOR you can sample from     -> invert it at a uniform draw

The inverse probability transform: if U ~ Uniform(0,1) then F^{-1}(U)
has distribution F. With only a sample in hand we use the EMPIRICAL
CDF F_hat and its inverse (the empirical quantile), so F_hat^{-1}(U)
resamples the observed data - the bootstrap.

This mirrors sampler.js line-for-line, including the seeded RNG, so
both files print the identical sample given the same seed. No numpy:
every formula is spelled out.

Usage:
  python3 sampler.py ecdf   [gridPoints]      # print x, F_hat(x)
  python3 sampler.py sample [n] [seed]        # draw n inverse-transform values
  python3 sampler.py quantile <u>             # print F_hat^{-1}(u), u in [0,1]
Reads the sample from data.json sitting next to this file.
"""
import sys, os, json, math

# ---- The empirical CDF --------------------------------------
# F_hat(x) = (1/n) * sum_i 1{ x_i <= x } : the proportion at or below x.
# It is a non-decreasing staircase climbing from 0 to 1 by 1/n a step.
def ecdf_at(x, X):
    return sum(1 for xi in X if xi <= x) / len(X)

# ---- The empirical quantile (inverse ECDF) ------------------
# F_hat^{-1}(u) = smallest observed x with F_hat(x) >= u, which is the
# order statistic at rank k = ceil(n*u). This is the value the
# inverse-transform "reads off" when a horizontal line at height u
# meets the staircase. Expects a pre-sorted list.
def quantile_sorted(u, sorted_X):
    n = len(sorted_X)
    k = math.ceil(n * u)          # 1-indexed rank
    if k < 1:
        k = 1
    if k > n:
        k = n
    return sorted_X[k - 1]

# ---- Inverse-transform sampling -----------------------------
# Draw U ~ Uniform(0,1), return F_hat^{-1}(U). Because each order
# statistic is equally likely, this resamples the data uniformly.
def sample(X, n, rand):
    sorted_X = sorted(X)
    return [quantile_sorted(rand(), sorted_X) for _ in range(n)]

# ---- Seeded RNG (matches LabBase.makeLcg and sampler.js) -----
def make_lcg(seed):
    s = seed & 0xffffffff
    def rand():
        nonlocal s
        s = (s * 1103515245 + 12345) & 0x7fffffff
        return s / 0x7fffffff
    return rand

# ---- CLI ----------------------------------------------------
def main():
    here = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(here, "data.json")) as f:
        data = json.load(f)
    X = data["values"]
    sorted_X = sorted(X)
    argv = sys.argv[1:]
    cmd = argv[0] if argv else "ecdf"

    if cmd == "ecdf":
        g = int(argv[1]) if len(argv) > 1 else 120
        lo, hi = sorted_X[0], sorted_X[-1]
        pad = (hi - lo) * 0.05
        sys.stderr.write(f"# n={len(X)}  variable={data['variable']} ({data['unit']})\n")
        for i in range(g):
            x = (lo - pad) + (hi - lo + 2 * pad) * i / (g - 1)
            print(f"{x:.4f}\t{ecdf_at(x, X):.6f}")
    elif cmd == "sample":
        n = int(argv[1]) if len(argv) > 1 else 10
        seed = int(argv[2]) if len(argv) > 2 else 6042
        for v in sample(X, n, make_lcg(seed)):
            print(f"{v:.4f}")
    elif cmd == "quantile":
        u = float(argv[1])
        if not (0 <= u <= 1):
            sys.stderr.write("u must be in [0,1]\n"); sys.exit(1)
        print(f"{quantile_sorted(u, sorted_X):.6f}")
    else:
        sys.stderr.write("usage: python3 sampler.py [ecdf|sample|quantile] ...\n")
        sys.exit(1)

if __name__ == "__main__":
    main()
