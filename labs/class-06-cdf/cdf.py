#!/usr/bin/env python3
"""
Class 06 assignment - build the empirical CDF and invert it
============================================================

You will implement the empirical cumulative distribution function
(ECDF) and its inverse (the empirical quantile) from scratch, with no
numpy: just the math from lecture. The scaffolding (data loading, the
stdin/stdout protocol the autograder speaks, and all input validation)
is already written. You only fill in the two functions in the YOUR JOB
zone.

DATA (data.json, sitting next to this file)
-------------------------------------------
  {
    "variable": "age_at_diagnosis",     # what the numbers mean
    "unit": "years",
    "source": "...",
    "values": [60.2, 45.43, 83.96, ...] # the 1-D sample X, length n
  }

I/O PROTOCOL (how the autograder talks to you)
----------------------------------------------
The grader launches `python3 cdf.py` and sends one query per line on
stdin. Each line is a command and one number:

    cdf <x>          evaluate the ECDF at x        -> OK: <F_hat(x)>
    quantile <u>     invert it at level u in [0,1] -> OK: <F_hat^{-1}(u)>

For a `cdf` line you print the sample proportion at or below x:

    OK: <F_hat(x)>          # a number in [0, 1], 6 decimals

For a `quantile` line you print the inverse-transform sample point,
the smallest observed value x whose ECDF is at least u:

    OK: <F_hat^{-1}(u)>     # an x value from the sample's range, 6 decimals

Any unknown command, a missing/garbled number, or a u outside [0, 1]
is a bad query. For those you print exactly:

    ERR: bad query

Anything off-protocol confuses the grader, so do not print extra
lines, banners, or debug text to stdout (use stderr for debugging).

RUN
---
  echo "cdf 60"       | python3 cdf.py     # -> OK: 0.430000
  echo "quantile 0.5" | python3 cdf.py     # -> OK: 62.360000
  python3 test_cdf.py                        # local autograder
"""
import sys, os, json, math


# ============================================================
# YOUR JOB starts here.
# ============================================================

def ecdf_at(x, X):
    """Return the empirical CDF at x:

        F_hat(x) = (1 / n) * sum_i  1{ x_i <= x }

    i.e. the proportion of the sample X that is at or below x.
    The result is always a number in [0, 1].
    """
    # TODO: count how many points in X are <= x, divide by n.
    raise NotImplementedError


def quantile_at(u, X):
    """Return the empirical quantile (the inverse ECDF) at level u.

    This is the generalized inverse of the staircase:

        F_hat^{-1}(u) = smallest observed x with  F_hat(x) >= u

    Sort X ascending into x_(1) <= x_(2) <= ... <= x_(n). Then, for
    u in (0, 1], the answer is the order statistic at rank k = ceil(n*u):

        F_hat^{-1}(u) = x_(k)          (1-indexed rank)

    For u = 0 return the minimum. You are guaranteed 0 <= u <= 1 here;
    the scaffolding rejects anything out of range before calling you.
    """
    # TODO: sort X, compute rank k = ceil(n*u), clamp into [1, n],
    #       and return that order statistic (mind 0- vs 1-indexing).
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
        # A valid query is exactly a command plus one number.
        if len(parts) != 2:
            print("ERR: bad query", flush=True)
            continue
        cmd, arg = parts[0], parts[1]
        try:
            val = float(arg)
        except ValueError:
            print("ERR: bad query", flush=True)
            continue
        if cmd == "cdf":
            print(f"OK: {ecdf_at(val, X):.6f}", flush=True)
        elif cmd == "quantile":
            if val < 0.0 or val > 1.0:
                print("ERR: bad query", flush=True)
                continue
            print(f"OK: {quantile_at(val, X):.6f}", flush=True)
        else:
            print("ERR: bad query", flush=True)


if __name__ == "__main__":
    main()
