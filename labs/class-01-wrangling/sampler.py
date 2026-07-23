#!/usr/bin/env python3
"""
Understanding Uncertainty - Wrangling & robust statistics sampler
(standalone, stdlib only)
------------------------------------------------------------------
Four statistics computed from scratch on the real 250-listing used-car
sample: the mean and variance (which trust every observation equally),
and the median and quantile (which only care about rank, so a single
extreme value cannot move them far). This mirrors sampler.js and
viz.js's WR.* core line-for-line, and the assignment template
(wrangling.py) implements median() and quantile() the same way.

Usage:
  python3 sampler.py describe <price|mileage>          # mean/var/sd/median/IQR
  python3 sampler.py mean     <price|mileage>
  python3 sampler.py variance <price|mileage>
  python3 sampler.py median   <price|mileage>
  python3 sampler.py quantile <price|mileage> <frac>   # frac in [0, 1]

Reads the sample from data.json sitting next to this file.
"""
import sys, os, json, math


# ---- Statistics of a sample ----------------------------------
def mean(X):
    return sum(X) / len(X)


def variance(X):
    m = mean(X)
    return sum((x - m) ** 2 for x in X) / len(X)


def std(X):
    return math.sqrt(variance(X))


def median(X):
    values = sorted(X)
    n = len(values)
    mid = n // 2
    if mid != n / 2:
        return values[mid]
    return (values[mid - 1] + values[mid]) / 2


def quantile(X, frac):
    values = sorted(X)
    n = len(values)
    index = max(math.ceil(n * frac) - 1, 0)
    return values[index]


def arcsinh(x):
    return math.log(x + math.sqrt(x * x + 1))


# ---- CLI -------------------------------------------------------
def load(var):
    here = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(here, "data.json")) as f:
        data = json.load(f)
    if var not in ("price", "mileage"):
        sys.stderr.write("variable must be 'price' or 'mileage'\n")
        sys.exit(1)
    return data[var]


def main():
    argv = sys.argv[1:]
    if not argv:
        sys.stderr.write("usage: python3 sampler.py [describe|mean|variance|median|quantile] <price|mileage> [frac]\n")
        sys.exit(1)
    cmd = argv[0]

    if cmd == "describe":
        X = load(argv[1])
        q25, q75 = quantile(X, 0.25), quantile(X, 0.75)
        sys.stderr.write(f"# n={len(X)}  variable={argv[1]}\n")
        print(f"mean:     {mean(X):.4f}")
        print(f"variance: {variance(X):.4f}")
        print(f"sd:       {std(X):.4f}")
        print(f"median:   {median(X):.4f}")
        print(f"q25:      {q25:.4f}")
        print(f"q75:      {q75:.4f}")
        print(f"IQR:      {q75 - q25:.4f}")
    elif cmd == "mean":
        print(f"{mean(load(argv[1])):.4f}")
    elif cmd == "variance":
        print(f"{variance(load(argv[1])):.4f}")
    elif cmd == "median":
        print(f"{median(load(argv[1])):.4f}")
    elif cmd == "quantile":
        X = load(argv[1])
        frac = float(argv[2])
        print(f"{quantile(X, frac):.4f}")
    else:
        sys.stderr.write("usage: python3 sampler.py [describe|mean|variance|median|quantile] <price|mileage> [frac]\n")
        sys.exit(1)


if __name__ == "__main__":
    main()
