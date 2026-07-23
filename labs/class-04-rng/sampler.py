#!/usr/bin/env python3
"""
Understanding Uncertainty - Random numbers & the sample mean sampler
(standalone, stdlib only)
------------------------------------------------------------------
Two things computed from scratch: the mean-squared-error curve over a
range of guesses (mirrors viz.js's RNGL.mse), and a linear congruential
generator identical to LabBase.makeLcg / lab-base.js, so a seed here
reproduces the exact same numbers as the browser widget.

Usage:
  python3 sampler.py mse <xhat>              # MSE(xhat) on the 40 ages
  python3 sampler.py lcg <seed> <n>          # print n uniforms from this seed
  python3 sampler.py choice <k> <seed> <0|1> # draw k of the 40 ages, 0=without/1=with replacement

Reads the sample from data.json sitting next to this file.
"""
import sys, os, json


# ---- Linear congruential generator (matches lab-base.js exactly) ----
# Reproduces LabBase.makeLcg(seed): each call advances the state and
# returns a float in [0, 1). The float multiply below reproduces the
# IEEE-754 double rounding JavaScript's `*` performs on numbers this
# size, so a given seed yields the identical stream in JS and Python.
def make_lcg(seed):
    s = float(seed & 0xffffffff)
    def rng():
        nonlocal s
        p = s * 1103515245.0 + 12345.0
        s = float(int(p) % 2147483648)  # ToInt32(p) & 0x7fffffff
        return s / 2147483647.0
    return rng


# ---- Mean squared error -------------------------------------
def mean(X):
    return sum(X) / len(X)


def mse(X, xhat):
    return sum((x - xhat) ** 2 for x in X) / len(X)


# ---- Sampling with / without replacement ---------------------
def choice(items, k, seed, replace):
    rng = make_lcg(seed)
    if replace:
        return [items[int(rng() * len(items))] for _ in range(k)]
    pool = list(items)
    out = []
    for _ in range(k):
        idx = int(rng() * len(pool))
        out.append(pool.pop(idx))
    return out


# ---- CLI ------------------------------------------------------
def load_ages():
    here = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(here, "data.json")) as f:
        return json.load(f)["age"]


def main():
    argv = sys.argv[1:]
    if not argv:
        sys.stderr.write("usage: python3 sampler.py [mse|lcg|choice] ...\n")
        sys.exit(1)
    cmd = argv[0]

    if cmd == "mse":
        ages = load_ages()
        xhat = float(argv[1])
        print(f"{mse(ages, xhat):.4f}")
    elif cmd == "lcg":
        seed, n = int(argv[1]), int(argv[2])
        rng = make_lcg(seed)
        print(" ".join(f"{rng():.6f}" for _ in range(n)))
    elif cmd == "choice":
        ages = load_ages()
        k, seed, replace = int(argv[1]), int(argv[2]), argv[3] == "1"
        print(" ".join(str(v) for v in choice(ages, k, seed, replace)))
    else:
        sys.stderr.write("usage: python3 sampler.py [mse|lcg|choice] ...\n")
        sys.exit(1)


if __name__ == "__main__":
    main()
