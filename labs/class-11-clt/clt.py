#!/usr/bin/env python3
"""
Class 11 assignment — simulate the Central Limit Theorem
========================================================

You will build the sampling distribution of the mean by hand, with no
numpy: just the math from lecture. The scaffolding (data loading, the
random-number generator, and the stdin/stdout protocol the autograder
speaks) is already written. You only fill in the two functions in the
YOUR JOB zone.

The idea: draw n values WITH REPLACEMENT from the population, average
them to get one sample mean, and repeat m times. The CLT predicts the m
sample means will
  - center on the population mean   mu
  - have spread                     sigma / sqrt(n)   (the standard error)
  - look bell-shaped for large n, even though the population is skewed.

DATA (data.json, sitting next to this file)
-------------------------------------------
  {
    "variable": "price_k",              # what the numbers mean
    "unit": "thousands of USD",
    "source": "...",
    "values": [1.2, 17.5, 9.5, ...],    # the population, length n = 92
    "pop_mean": 8.589707,               # mean of values (divides by len)
    "pop_sd": 8.126018                  # std of values (divides by len)
  }

I/O PROTOCOL (how the autograder talks to you)
----------------------------------------------
The grader launches `python3 clt.py` and sends one query per line on
stdin. Each line is:

    means <n> <m> <seed>

  n     draws per sample mean               (int, must be >= 1)
  m     number of sample means to draw      (int, must be >= 1)
  seed  seed for the random-number generator (int)

For every valid query you draw m sample means (each the mean of n draws
with replacement from the population) and print exactly one line:

    OK: <mean_of_means> <sd_of_means>       # both to 6 decimals

If n < 1 or m < 1, print:

    ERR: bad query

Reproducibility: create the RNG with random.Random(seed) and draw with
rng.choice(population). Same seed must give the same two numbers every
time — the grader checks this.

Anything off-protocol confuses the grader, so do not print extra lines,
banners, or debug text to stdout (use stderr for debugging).

RUN
---
  echo "means 30 5000 1" | python3 clt.py   # -> OK: 8.5xxxxx 1.4xxxxx
  python3 test_clt.py                        # local autograder
"""
import sys, os, json, math, random


# ---- provided: summary statistics ---------------------------
# Population standard deviation (divides by len), matching pop_sd.
def mean(values):
    return sum(values) / len(values)


def std(values):
    m = mean(values)
    return math.sqrt(sum((x - m) ** 2 for x in values) / len(values))


# ============================================================
# YOUR JOB starts here.
# ============================================================

def one_sample_mean(population, n, rng):
    """Return ONE sample mean: the average of n values drawn with
    replacement from population, using rng.choice(population)."""
    # TODO: draw n values with rng.choice(population) and return their mean.
    raise NotImplementedError


def summarize(population, n, m, seed):
    """Draw m sample means and return the pair
        (mean_of_means, sd_of_means)
    where mean_of_means is the mean of the m sample means and sd_of_means
    is their population standard deviation (use the provided std()).

    Create the generator ONCE as random.Random(seed) and reuse it for all
    m sample means, so the whole run is reproducible.
    """
    # TODO: build the list of m sample means, then reduce it to the pair.
    raise NotImplementedError

# ============================================================
# YOUR JOB ends here. Leave everything below unchanged.
# ============================================================


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(here, "data.json")) as f:
        population = json.load(f)["values"]
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        parts = line.split()
        if len(parts) != 4 or parts[0] != "means":
            print("ERR: bad query", flush=True)
            continue
        try:
            n, m, seed = int(parts[1]), int(parts[2]), int(parts[3])
        except ValueError:
            print("ERR: bad query", flush=True)
            continue
        if n < 1 or m < 1:
            print("ERR: bad query", flush=True)
            continue
        mom, som = summarize(population, n, m, seed)
        print(f"OK: {mom:.6f} {som:.6f}", flush=True)


if __name__ == "__main__":
    main()
