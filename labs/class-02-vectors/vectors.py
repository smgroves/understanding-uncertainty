#!/usr/bin/env python3
"""
Class 02 assignment - the inner product and the distance matrix
==================================================================

You will implement the inner product from scratch, with no numpy, and
build a distance matrix on top of it - the same "computing distance
matrices" exercise from lecture. The scaffolding (the stdin/stdout
protocol the autograder speaks) is already written. You fill in the
two functions in the YOUR JOB zone.

WHY THESE TWO
-------------
Every quantity on the lab page - length, distance, covariance, matrix
multiplication - reduces to one operation: multiply matching entries,
add the results. `dot` is that operation. `distance_matrix` shows it
scales from "one pair of vectors" to "every pair in a dataset" without
changing the underlying formula at all.

DATA (data.json, sitting next to this file)
--------------------------------------------
  {
    "variable": "Cardiac patient electrolytes",
    "source": "...",
    "n": 28,
    "na": [139.0, 135.0, ...],   # sodium reading per patient, length n
    "cl": [93.0, 102.0, ...],    # chloride reading per patient, length n
    "hr": [...], "outcome": [...],
    "rows": [ {"na": ..., "cl": ..., "hr": ..., "outcome": ...}, ... ]
  }
This template only ever reads "na" and "cl" from data.json.

I/O PROTOCOL (how the autograder talks to you)
------------------------------------------------
The grader launches `python3 vectors.py` and sends one query per line
on stdin:

    dot <x1,x2,...> <y1,y2,...>
    dmatrix <p1x,p1y;p2x,p2y;...>

For every query line you print exactly one line to stdout:

    OK: <value>                       # dot: one number, 6 decimals
    OK: <d00> <d01> ... <d(n-1)(n-1)> # dmatrix: n*n distances, row-major,
                                       #   space-separated, 6 decimals each

If the query keyword is not recognised, or the two vectors passed to
`dot` have different lengths, print:

    ERR: unknown query

Anything off-protocol confuses the grader, so do not print extra
lines, banners, or debug text to stdout (use stderr for debugging).

RUN
---
  echo "dot 3,4 4,-3" | python3 vectors.py           # -> OK: 0.000000
  echo "dmatrix 0,0;3,4" | python3 vectors.py         # -> OK: 0.000000 5.000000 5.000000 0.000000
  python3 test_vectors.py                             # local autograder
"""
import sys, math


# ============================================================
# YOUR JOB starts here.
# ============================================================

def dot(x, y):
    """Return the inner product of two equal-length lists x and y:
    sum_i x[i] * y[i].

    Raise ValueError if len(x) != len(y) - the caller (main, below)
    turns that into the ERR: unknown query protocol response.
    """
    # TODO: check the lengths match, then return the summed products.
    raise NotImplementedError


def distance_matrix(points):
    """Given a list of n 2-D points (each a 2-element list [x, y]),
    return the n x n list of lists D where D[i][j] is the Euclidean
    distance between points[i] and points[j].

    Hint: the distance between points[i] and points[j] is
      sqrt(dot(diff, diff))
    where diff = [points[i][0] - points[j][0], points[i][1] - points[j][1]].
    Use your dot() function - do not recompute the sum of squares by hand.
    """
    # TODO: build and return the n x n distance matrix using dot().
    raise NotImplementedError

# ============================================================
# YOUR JOB ends here. Leave everything below unchanged.
# ============================================================


def parse_points(s):
    return [[float(v) for v in p.split(",")] for p in s.split(";")]


def main():
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        parts = line.split()
        try:
            if parts[0] == "dot":
                x = [float(v) for v in parts[1].split(",")]
                y = [float(v) for v in parts[2].split(",")]
                print(f"OK: {dot(x, y):.6f}", flush=True)
            elif parts[0] == "dmatrix":
                points = parse_points(parts[1])
                D = distance_matrix(points)
                flat = [v for row in D for v in row]
                print("OK: " + " ".join(f"{v:.6f}" for v in flat), flush=True)
            else:
                print("ERR: unknown query", flush=True)
        except (IndexError, ValueError):
            print("ERR: unknown query", flush=True)


if __name__ == "__main__":
    main()
