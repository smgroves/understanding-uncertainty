#!/usr/bin/env python3
"""
Class 05 assignment - proportions and the ECDF from scratch
===============================================================

You will implement a sample proportion and the ECDF-at-a-threshold
from scratch, with no numpy and no `statistics` module. The
scaffolding (the standard-error formula and the stdin/stdout protocol
the autograder speaks) is already written. You fill in the two
functions in the YOUR JOB zone.

WHY THESE TWO
-------------
A sample proportion and the ECDF at one threshold are both averages of
a 0/1 indicator over an iid sample - which is why they share the exact
same standard error formula, sqrt(p_hat*(1-p_hat)/n). See the lab's
"Why the same formula works everywhere" section and the lecture's full
derivation from a single Bernoulli trial.

DATA (data.json, sitting next to this file)
--------------------------------------------
  {
    "variable": "Cardiac patient outcomes, triage, heart rate",
    "source": "...",
    "n": 200,
    "outcome": [1, 1, 0, ...],       # 0/1 survival outcome, length n
    "triage": ["2", "3", "1", ...],  # triage score label, length n
    "hr": [72.0, 88.0, ...],         # heart rate, length n
    "rows": [ {"outcome": ..., "triage": ..., "hr": ...}, ... ]
  }
This template only ever reads "outcome", "triage", and "hr" indirectly,
through the protocol below - the queries themselves carry their own data.

I/O PROTOCOL (how the autograder talks to you)
------------------------------------------------
The grader launches `python3 eda.py` and sends one query per line on
stdin:

    proportion <label1,label2,...> <target>
    ecdf <v1,v2,...> <x>

For every query line you print exactly one line to stdout:

    OK: <estimate, 6 decimals> <standard error, 6 decimals>

The standard error is sqrt(p_hat * (1 - p_hat) / n), using your own
function's p_hat and the number of values in the query.

If the query keyword is not recognised, print:

    ERR: unknown query

Anything off-protocol confuses the grader, so do not print extra
lines, banners, or debug text to stdout (use stderr for debugging).

RUN
---
  echo "proportion 1,1,0,1,1 1" | python3 eda.py    # -> OK: 0.800000 0.178885
  echo "ecdf 3,1,4,1,5,9 4" | python3 eda.py         # -> OK: 0.666667 0.192450
  python3 test_eda.py                                # local autograder
"""
import sys, math


# ============================================================
# YOUR JOB starts here.
# ============================================================

def proportion(labels, target):
    """Return the fraction of `labels` equal to `target`.

    labels is a list of strings; target is a string. Both come
    straight from the protocol, so no type conversion is needed.
    """
    # TODO: count how many entries of labels equal target, divide by len(labels).
    raise NotImplementedError


def ecdf_at(values, x):
    """Return the fraction of `values` that are <= x.

    values is a list of floats; x is a float.
    """
    # TODO: count how many entries of values are <= x, divide by len(values).
    raise NotImplementedError

# ============================================================
# YOUR JOB ends here. Leave everything below unchanged.
# ============================================================


def standard_error(p_hat, n):
    return math.sqrt(p_hat * (1 - p_hat) / n)


def main():
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        parts = line.split()
        try:
            if parts[0] == "proportion":
                labels = parts[1].split(",")
                target = parts[2]
                p = proportion(labels, target)
                print(f"OK: {p:.6f} {standard_error(p, len(labels)):.6f}", flush=True)
            elif parts[0] == "ecdf":
                values = [float(v) for v in parts[1].split(",")]
                x = float(parts[2])
                f = ecdf_at(values, x)
                print(f"OK: {f:.6f} {standard_error(f, len(values)):.6f}", flush=True)
            else:
                print("ERR: unknown query", flush=True)
        except (IndexError, ValueError):
            print("ERR: unknown query", flush=True)


if __name__ == "__main__":
    main()
