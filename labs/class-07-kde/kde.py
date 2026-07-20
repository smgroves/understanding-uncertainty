#!/usr/bin/env python3
"""
Class 07 assignment — build a kernel density estimator
======================================================

You will implement the KDE from scratch, with no numpy: just the
math from lecture. The scaffolding (data loading, the stdin/stdout
protocol the autograder speaks, and Silverman's rule) is already
written. You only fill in the two functions in the YOUR JOB zone.

DATA (data.json, sitting next to this file)
-------------------------------------------
  {
    "variable": "price_k",              # what the numbers mean
    "unit": "thousands of USD",
    "source": "...",
    "values": [1.0, 1.0, 1.2, ...]      # the 1-D sample X, length n
  }

I/O PROTOCOL (how the autograder talks to you)
----------------------------------------------
The grader launches `python3 kde.py` and sends one query per line on
stdin. Each line is three whitespace-separated fields:

    <x> <h> <kernel>

  x       grid point at which to evaluate the density  (float)
  h       bandwidth                                     (float)
  kernel  "gaussian" or "uniform"

For every query line you print exactly one line to stdout:

    OK: <f_hat(x)>          # the estimated density, 6 decimals

If the kernel name is not recognised, print:

    ERR: unknown kernel

Anything off-protocol confuses the grader, so do not print extra
lines, banners, or debug text to stdout (use stderr for debugging).

RUN
---
  echo "5.0 3.5 gaussian" | python3 kde.py      # -> OK: 0.067...
  python3 test_kde.py                            # local autograder
"""
import sys, os, json, math


# ---- provided: summary stats + Silverman's rule ------------
def mean(X):
    return sum(X) / len(X)

def std(X):
    m = mean(X)
    return math.sqrt(sum((x - m) ** 2 for x in X) / len(X))

def iqr(X):
    s = sorted(X)
    def q(p):
        k = (len(s) - 1) * p
        lo = math.floor(k); hi = min(lo + 1, len(s) - 1)
        return s[lo] + (s[hi] - s[lo]) * (k - lo)
    return q(0.75) - q(0.25)

def silverman(X, kernel):
    n = len(X)
    if kernel == "uniform":
        return 1.84 * std(X) * n ** (-0.2)
    return 0.9 * min(std(X), iqr(X) / 1.34) * n ** (-0.2)


# ============================================================
# YOUR JOB starts here.
# ============================================================

def kernel(z, name):
    """Return the kernel weight k(z).

    The Gaussian kernel is   phi(z) = exp(-z^2 / 2) / sqrt(2*pi).
    The uniform kernel is     1/2  when |z| < 1, else 0.
    Raise ValueError for any other name.
    """
    # TODO: implement the gaussian and uniform kernels.
    raise NotImplementedError


def kde_at(x, X, h, name):
    """Return the KDE estimate f_hat(x).

        f_hat(x) = (1 / (n * h)) * sum_i kernel((x - x_i) / h, name)

    Loop over the sample X and accumulate the kernel weights.
    """
    # TODO: implement the estimator using kernel() above.
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
        x, h, name = float(parts[0]), float(parts[1]), parts[2]
        try:
            fx = kde_at(x, X, h, name)
        except ValueError:
            print("ERR: unknown kernel", flush=True)
            continue
        print(f"OK: {fx:.6f}", flush=True)


if __name__ == "__main__":
    main()
