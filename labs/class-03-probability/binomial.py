#!/usr/bin/env python3
"""
Class 03 assignment — build the binomial PMF from scratch
=========================================================

You will implement the Binomial(n, p) probability mass function with no
numpy and no math.comb shortcut: just the factorial arithmetic from
lecture. The scaffolding (data loading, the stdin/stdout protocol the
autograder speaks, and the p-range check) is already written. You only
fill in the two functions in the YOUR JOB zone.

DATA (data.json, sitting next to this file)
-------------------------------------------
  {
    "variable": "DEATH_EVENT",           # what each 0/1 means
    "description": "...",
    "source": "...",
    "values": [0, 1, 0, 0, 1, ...],      # 299 Bernoulli trials
    "p_hat": 0.321070...                 # observed proportion of 1s
  }
Each value is one Bernoulli trial (a single 0/1). Their sum is one draw
from Binomial(299, p). You do not need the data to answer a query — the
query gives you n, p, and k directly — but it is loaded so you can
sanity-check against the real death rate p_hat.

I/O PROTOCOL (how the autograder talks to you)
----------------------------------------------
The grader launches `python3 binomial.py` and sends one query per line
on stdin. Each line is three whitespace-separated fields:

    <n> <p> <k>

  n   number of trials (int)
  p   success probability per trial (float)
  k   count whose probability you report (int)

For every query line you print exactly one line to stdout:

    OK: <P(X=k)>            # the probability, 6 decimals

If p is outside [0, 1] the query is invalid and you print:

    ERR: invalid p

Anything off-protocol confuses the grader, so do not print extra lines,
banners, or debug text to stdout (use stderr for debugging).

RUN
---
  echo "10 0.5 3" | python3 binomial.py       # -> OK: 0.117188
  python3 test_binomial.py                      # local autograder
"""
import sys, os, json


# ============================================================
# YOUR JOB starts here.
# ============================================================

def n_choose_k(n, k):
    """Return the binomial coefficient C(n, k) = n! / (k! (n-k)!).

    Return 0 when k < 0 or k > n. Do NOT call math.comb — build it with
    a multiplicative loop:  C = prod_{i=0}^{k-1} (n - i) / (i + 1).
    Using the symmetry C(n, k) == C(n, n-k) keeps the loop short.
    """
    # TODO: implement the binomial coefficient with a loop.
    raise NotImplementedError


def binom_pmf(n, p, k):
    """Return the binomial probability  P(X = k).

        P(X = k) = C(n, k) * p**k * (1 - p)**(n - k)

    Return 0.0 when k < 0 or k > n. Handle the edge cases p == 0
    (all mass at k = 0) and p == 1 (all mass at k = n) so 0**0 never
    bites you. Use n_choose_k above.
    """
    # TODO: implement the PMF using n_choose_k().
    raise NotImplementedError

# ============================================================
# YOUR JOB ends here. Leave everything below unchanged.
# ============================================================


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(here, "data.json")) as f:
        _data = json.load(f)          # available as _data if you want p_hat
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        parts = line.split()
        n, p, k = int(parts[0]), float(parts[1]), int(parts[2])
        if not (0.0 <= p <= 1.0):
            print("ERR: invalid p", flush=True)
            continue
        print(f"OK: {binom_pmf(n, p, k):.6f}", flush=True)


if __name__ == "__main__":
    main()
