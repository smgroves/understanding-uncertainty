#!/usr/bin/env python3
"""
Understanding Uncertainty - Proportions, one-hot encoding & the ECDF
sampler (standalone, stdlib only)
------------------------------------------------------------------
A sample proportion, its standard error, and the ECDF evaluated at a
threshold, computed from scratch. All three reduce to the same
formula: average a 0/1 indicator, then take sqrt(p_hat*(1-p_hat)/n)
for the standard error. Mirrors sampler.js and viz.js's EDA.* core.

Usage:
  python3 sampler.py proportion <label1,label2,...> <target>
  python3 sampler.py ecdf <v1,v2,...> <x>
  python3 sampler.py describe                 # this sample's key numbers

Reads the sample from data.json sitting next to this file.
"""
import sys, os, json, math


def proportion(labels, target):
    return sum(1 for v in labels if v == target) / len(labels)


def se(p, n):
    return math.sqrt(p * (1 - p) / n)


def ecdf_at(values, x):
    return sum(1 for v in values if v <= x) / len(values)


def load():
    here = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(here, "data.json")) as f:
        return json.load(f)


def main():
    argv = sys.argv[1:]
    if not argv:
        sys.stderr.write("usage: python3 sampler.py [proportion|ecdf|describe] ...\n")
        sys.exit(1)
    cmd = argv[0]

    if cmd == "proportion":
        labels = argv[1].split(",")
        target = argv[2]
        p = proportion(labels, target)
        print(f"{p:.6f} {se(p, len(labels)):.6f}")
    elif cmd == "ecdf":
        values = [float(v) for v in argv[1].split(",")]
        x = float(argv[2])
        f = ecdf_at(values, x)
        print(f"{f:.6f} {se(f, len(values)):.6f}")
    elif cmd == "describe":
        data = load()
        n = data["n"]
        p = proportion(data["outcome"], 1)
        print(f"n:              {n}")
        print(f"p_hat(outcome=1): {p:.4f}  se: {se(p, n):.4f}")
        for label in ("1", "2", "3"):
            pl = proportion(data["triage"], label)
            print(f"p_hat(triage={label}):   {pl:.4f}  se: {se(pl, n):.4f}")
        for x in (60, 70, 80, 90, 100):
            f = ecdf_at(data["hr"], x)
            print(f"F_hat(HR<={x}):    {f:.4f}  se: {se(f, n):.4f}")
    else:
        sys.stderr.write("usage: python3 sampler.py [proportion|ecdf|describe] ...\n")
        sys.exit(1)


if __name__ == "__main__":
    main()
