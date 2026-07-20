#!/usr/bin/env python3
"""
Understanding Uncertainty - Binomial sampler (standalone, stdlib only)
----------------------------------------------------------------------
A Binomial(n, p) random variable is two things at once:
  1. a PROBABILITY MODEL  ->  evaluate P(X = k) for every count k
  2. a GENERATIVE PROCESS  ->  flip n Bernoulli(p) coins and count the 1s

This mirrors sampler.js line-for-line so you can compare the two.
No numpy: every formula is spelled out.

Usage:
  python3 sampler.py pmf    [n] [p]        # print k, P(X=k) for k=0..n
  python3 sampler.py sample [m] [n] [p]    # draw m counts of n flips each
With no n / p, the sample size and death rate from data.json are used:
n = 299 patients, p = p_hat (the observed proportion of deaths).
Reads the sample from data.json sitting next to this file.
"""
import sys, os, json, math, random

# ---- The binomial coefficient  C(n, k) = n! / (k! (n-k)!) ----
# math.comb is exact integer arithmetic; we spell out the same
# multiplicative loop the widgets and sampler.js use so the number
# is identical everywhere.
def n_choose_k(n, k):
    if k < 0 or k > n:
        return 0.0
    k = min(k, n - k)              # symmetry: C(n,k) == C(n,n-k)
    c = 1.0
    for i in range(k):
        c = c * (n - i) / (i + 1)
    return c

# ---- The PMF  P(X = k) = C(n,k) p^k (1-p)^(n-k) --------------
def binom_pmf(n, p, k):
    if k < 0 or k > n:
        return 0.0
    if p <= 0.0:
        return 1.0 if k == 0 else 0.0
    if p >= 1.0:
        return 1.0 if k == n else 0.0
    return n_choose_k(n, k) * p ** k * (1 - p) ** (n - k)

# ---- One Bernoulli(p) trial: a single 0/1 flip --------------
def bernoulli(p, rng=random):
    return 1 if rng.random() < p else 0

# ---- One Binomial(n,p) draw: sum of n Bernoulli trials ------
def binom_sample_one(n, p, rng=random):
    return sum(bernoulli(p, rng) for _ in range(n))

def binom_sample(m, n, p, rng=random):
    return [binom_sample_one(n, p, rng) for _ in range(m)]

# ---- CLI ----------------------------------------------------
def main():
    here = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(here, "data.json")) as f:
        data = json.load(f)
    values = data["values"]
    n_default = len(values)             # 299 patients
    p_default = data["p_hat"]           # observed death rate

    argv = sys.argv[1:]
    cmd = argv[0] if argv else "pmf"

    if cmd == "pmf":
        n = int(argv[1]) if len(argv) > 1 else n_default
        p = float(argv[2]) if len(argv) > 2 else p_default
        sys.stderr.write(f"# n={n}  p={p:.6f}  mean=n*p={n * p:.4f}\n")
        for k in range(n + 1):
            print(f"{k}\t{binom_pmf(n, p, k):.6f}")
    elif cmd == "sample":
        m = int(argv[1]) if len(argv) > 1 else 10
        n = int(argv[2]) if len(argv) > 2 else n_default
        p = float(argv[3]) if len(argv) > 3 else p_default
        for v in binom_sample(m, n, p):
            print(v)
    else:
        sys.stderr.write("usage: python3 sampler.py [pmf|sample] ...\n")
        sys.exit(1)

if __name__ == "__main__":
    main()
