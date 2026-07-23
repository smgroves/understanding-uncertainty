#!/usr/bin/env python3
"""
Class 01 assignment - robust statistics from scratch
======================================================

You will implement two robust statistics with no numpy and no
`statistics` module: the recipes from lecture, spelled out by hand.
The scaffolding (the mean and variance, and the stdin/stdout protocol
the autograder speaks) is already written. You fill in the two
functions in the YOUR JOB zone: median and quantile.

WHY THESE TWO
-------------
The mean and the variance use every observation's exact magnitude, so
one extreme or erroneous value can move them arbitrarily far. The
median and the quantile only use RANK - "which value sits in the
middle" - so a single outlier, however extreme, cannot drag them past
their neighbors. See the "Median" and "Quantiles and the IQR" sections
of the lab page for the derivation and a live widget.

DATA (data.json, sitting next to this file)
--------------------------------------------
  {
    "variable": "USA used-car listings",
    "source": "...",
    "n": 250,
    "price":   [6300.0, 2899.0, ...],   # listing price ($), length n
    "mileage": [274117.0, 190552.0, ...], # odometer reading (mi), length n
    "rows": [ {"brand": ..., "year": ..., "title_status": ...,
               "price": ..., "mileage": ..., "color": ..., "state": ...,
               "condition_raw": ..., "hours_left": ...}, ... ]
  }
This template only ever reads "price" and "mileage" from data.json.

I/O PROTOCOL (how the autograder talks to you)
------------------------------------------------
The grader launches `python3 wrangling.py` and sends one query per
line on stdin. Values are a single comma-separated list with no
spaces:

    median <v1,v2,...>
    quantile <frac> <v1,v2,...>

For every query line you print exactly one line to stdout:

    OK: <value>          # 6 decimals

If the query keyword is not recognised, print:

    ERR: unknown query

Anything off-protocol confuses the grader, so do not print extra
lines, banners, or debug text to stdout (use stderr for debugging).

RUN
---
  echo "median 12,34,41,58,1018" | python3 wrangling.py        # -> OK: 41.000000
  echo "quantile 0.25 12,34,41,58,1018" | python3 wrangling.py  # -> OK: 34.000000
  python3 test_wrangling.py                                     # local autograder
"""
import sys


# ---- provided: statistics that trust every value equally ----
def sample_mean(X):
    return sum(X) / len(X)


def sample_variance(X):
    m = sample_mean(X)
    return sum((x - m) ** 2 for x in X) / len(X)


# ============================================================
# YOUR JOB starts here.
# ============================================================

def median(X):
    """Return the median of X: the middle value of the sorted list, or
    the average of the two middle values if len(X) is even.

    Hint: sort first. Let n = len(values) and mid = n // 2.
      - If n is odd, mid is the middle index: return values[mid].
      - If n is even, average the two values that straddle the
        center: values[mid - 1] and values[mid].
    """
    # TODO: sort X, then return the median using the rule above.
    raise NotImplementedError


def quantile(X, frac):
    """Return the frac-th quantile of X, for frac in [0, 1].

    Hint: sort X, then read off the value at
      index = max(ceil(len(X) * frac) - 1, 0)
    Use math.ceil. This is the SAME index rule the lab page uses, and
    it does not average two entries the way median() can - so
    quantile(X, 0.5) and median(X) can differ slightly when len(X) is
    even. That is expected; the autograder checks them separately.
    """
    # TODO: sort X, compute the index above, and return values[index].
    raise NotImplementedError

# ============================================================
# YOUR JOB ends here. Leave everything below unchanged.
# ============================================================


def main():
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        parts = line.split()
        try:
            if parts[0] == "median":
                X = [float(v) for v in parts[1].split(",")]
                print(f"OK: {median(X):.6f}", flush=True)
            elif parts[0] == "quantile":
                frac = float(parts[1])
                X = [float(v) for v in parts[2].split(",")]
                print(f"OK: {quantile(X, frac):.6f}", flush=True)
            else:
                print("ERR: unknown query", flush=True)
        except (IndexError, ValueError):
            print("ERR: unknown query", flush=True)


if __name__ == "__main__":
    main()
