#!/usr/bin/env python3
"""
Understanding Uncertainty - Central Limit Theorem sampler (stdlib only)
-----------------------------------------------------------------------
The central limit theorem is a statement about the SAMPLE MEAN. Draw n
values with replacement from a population, average them, and you get one
sample mean X-bar. Repeat that m times and you have m sample means. This
script builds that "sampling distribution of the mean" and reports two
numbers the CLT predicts:

  mean_of_means -> should sit on the population mean  mu
  sd_of_means   -> should shrink like  sigma / sqrt(n)   (the standard error)

No numpy: every formula is spelled out. This mirrors sampler.js, which
carries out the same algorithm in JavaScript.

Usage:
  python3 sampler.py means [n] [m] [seed]   # print mean_of_means, sd_of_means
  python3 sampler.py draws [n] [m] [seed]   # print the m sample means, one/line
Defaults: n=30, m=2000, seed=1. The population is data.json next to this file.
"""
import sys, os, json, math, random


# ---- Summary statistics -------------------------------------
# mean and (population) standard deviation: sd divides by len, not len-1,
# so it matches pop_sd stored in data.json.
def mean(X):
    return sum(X) / len(X)


def std(X):
    m = mean(X)
    return math.sqrt(sum((x - m) ** 2 for x in X) / len(X))


# ---- The sampling distribution of the mean ------------------
# One "sample mean" is the average of n draws made WITH REPLACEMENT from
# the population X. rng.choice(X) draws one such value uniformly at random.
def one_sample_mean(X, n, rng):
    return sum(rng.choice(X) for _ in range(n)) / n


# Draw m independent sample means. Seeding random.Random(seed) makes the
# whole run reproducible: same seed -> same list of means.
def sample_means(X, n, m, seed):
    rng = random.Random(seed)
    return [one_sample_mean(X, n, rng) for _ in range(m)]


# ---- CLI ----------------------------------------------------
def main():
    here = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(here, "data.json")) as f:
        data = json.load(f)
    X = data["values"]
    pop_sd = data["pop_sd"]

    argv = sys.argv[1:]
    cmd = argv[0] if argv else "means"
    n = int(argv[1]) if len(argv) > 1 else 30
    m = int(argv[2]) if len(argv) > 2 else 2000
    seed = int(argv[3]) if len(argv) > 3 else 1

    means = sample_means(X, n, m, seed)

    if cmd == "means":
        mom = mean(means)
        som = std(means)                     # spread of the sample means
        se_theory = pop_sd / math.sqrt(n)    # what the CLT predicts
        sys.stderr.write(f"# n={n}  m={m}  seed={seed}  pop_mean={mean(X):.4f}  pop_sd={pop_sd:.4f}\n")
        print(f"mean_of_means {mom:.6f}   (pop_mean = {mean(X):.6f})")
        print(f"sd_of_means   {som:.6f}   (sigma/sqrt(n) = {se_theory:.6f})")
    elif cmd == "draws":
        for v in means:
            print(f"{v:.6f}")
    else:
        sys.stderr.write("usage: python3 sampler.py [means|draws] [n] [m] [seed]\n")
        sys.exit(1)


if __name__ == "__main__":
    main()
