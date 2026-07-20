#!/usr/bin/env python3
"""
Class 09 assignment - Monte Carlo and the law of large numbers
==============================================================

You will implement two Monte Carlo estimators from scratch, with no
numpy: just the math from lecture. The scaffolding (data loading, a
seeded random number generator, and the stdin/stdout protocol the
autograder speaks) is already written. You only fill in the two
functions in the YOUR JOB zone.

DATA (data.json, sitting next to this file)
-------------------------------------------
  {
    "variable":  "price_k",             # what the numbers mean
    "unit":      "thousands of USD",
    "source":    "...",
    "values":    [1.2, 17.5, 9.5, ...], # the population, length n = 92
    "true_mean": 8.589706...,           # E[X] over the whole population
    "std":       8.126...,              # population standard deviation
    "n":         92
  }
The `values` list is your POPULATION. "Estimate E[X]" means: draw values
from this list at random (with replacement) and average them.

I/O PROTOCOL (how the autograder talks to you)
----------------------------------------------
The grader launches `python3 montecarlo.py` and sends one query per line
on stdin. Two query shapes:

    mean <n> <seed>     draw n values from the population, print their mean
    pi   <n> <seed>     throw n random points, print a Monte Carlo pi

For every valid query you print exactly one line to stdout:

    OK: <estimate>      # six decimals

Anything you cannot parse (unknown command, or a missing / non-numeric n
or seed) must print, without crashing:

    ERR: bad query

Do not print extra lines, banners, or debug text to stdout (use stderr).

RUN
---
  echo "mean 5000 1" | python3 montecarlo.py     # -> OK: ~8.5
  echo "pi 100000 1" | python3 montecarlo.py      # -> OK: ~3.14
  python3 test_montecarlo.py                       # local autograder
"""
import sys, os, json, math


# ---- provided: seeded random number generator --------------
# A linear-congruential generator (LCG). make_rng(seed) returns a function
# that yields the next uniform value in [0, 1). Same stream every time for a
# given seed, so your answers are reproducible and match the reference.
def make_rng(seed):
    s = int(seed) & 0x7fffffff
    def rng():
        nonlocal s
        s = (s * 1103515245 + 12345) & 0x7fffffff
        return s / 0x7fffffff
    return rng


# ============================================================
# YOUR JOB starts here.
# ============================================================

def estimate_mean(X, n, seed):
    """Monte Carlo estimate of E[X], the population mean.

    Draw n values from the population list X at random WITH REPLACEMENT,
    using the provided RNG, and return their average.

    Hint: rng = make_rng(seed); a random index is int(rng() * len(X)).
    By the weak law of large numbers this average converges to the true
    mean as n grows.
    """
    # TODO: draw n resampled values from X and return their mean.
    raise NotImplementedError


def estimate_pi(n, seed):
    """Monte Carlo estimate of pi.

    Throw n points uniformly into the unit square [0,1] x [0,1] using the
    provided RNG (two calls to rng() per point: x then y). A point is
    inside the quarter circle when x*x + y*y < 1. The quarter circle has
    area pi/4, so 4 * (inside / n) estimates pi.
    """
    # TODO: throw n points and return 4 * inside / n.
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
        try:
            cmd = parts[0]
            n = int(parts[1])
            seed = int(parts[2])
            if cmd == "mean":
                est = estimate_mean(X, n, seed)
            elif cmd == "pi":
                est = estimate_pi(n, seed)
            else:
                raise ValueError("unknown command")
        except (IndexError, ValueError):
            print("ERR: bad query", flush=True)
            continue
        print(f"OK: {est:.6f}", flush=True)


if __name__ == "__main__":
    main()
