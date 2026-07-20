#!/usr/bin/env python3
"""
Local autograder for the CDF assignment.

Spawns your cdf.py as a subprocess, pipes query lines through stdin,
and compares each reply against a reference computed the same way.
Passing locally is necessary but not sufficient - the Gradescope
grader runs a superset (more grid points, more quantile levels, and a
monotonicity sweep that checks the ECDF never decreases).

  python3 test_cdf.py
"""
import subprocess, sys, os, json, math

HERE = os.path.dirname(os.path.abspath(__file__))
TOL = 1e-6


def ref_ecdf(x, X):
    return sum(1 for xi in X if xi <= x) / len(X)


def ref_quantile(u, X):
    s = sorted(X)
    n = len(s)
    k = math.ceil(n * u)          # 1-indexed rank
    if k < 1:
        k = 1
    if k > n:
        k = n
    return s[k - 1]


def run(queries):
    """Send query lines to cdf.py; return the list of reply lines."""
    proc = subprocess.run(
        [sys.executable, os.path.join(HERE, "cdf.py")],
        input="\n".join(queries) + "\n",
        capture_output=True, text=True, timeout=30,
    )
    if proc.returncode != 0:
        print("cdf.py crashed:\n" + proc.stderr)
        sys.exit(1)
    return proc.stdout.strip().splitlines()


def main():
    X = json.load(open(os.path.join(HERE, "data.json")))["values"]
    lo, hi = min(X), max(X)

    cases = []          # (query, expected_reply, group)

    # ---- GROUP 1: ECDF values, in [0, 1] and correct ----
    for x in (lo - 5, lo, 40.0, 50.0, 60.0, 62.39, 75.0, hi, hi + 5):
        cases.append((f"cdf {x}", f"OK: {ref_ecdf(x, X):.6f}", "ecdf"))

    # ---- GROUP 2: quantile / inverse-transform points ----
    for u in (0.0, 0.05, 0.25, 0.5, 0.75, 0.9, 1.0):
        cases.append((f"quantile {u}", f"OK: {ref_quantile(u, X):.6f}", "quantile"))

    # ---- GROUP 3: protocol (bad queries must be reported, not crash) ----
    protocol = [
        ("median 60",   "ERR: bad query", "protocol"),  # unknown command
        ("quantile 1.5", "ERR: bad query", "protocol"),  # u out of [0,1]
        ("quantile -0.1", "ERR: bad query", "protocol"), # u out of [0,1]
        ("cdf",          "ERR: bad query", "protocol"),  # missing number
        ("cdf abc",      "ERR: bad query", "protocol"),  # non-numeric
    ]

    allcases = cases + protocol
    queries = [q for q, _, _ in allcases]
    replies = run(queries)

    if len(replies) != len(queries):
        print(f"FAIL: sent {len(queries)} queries, got {len(replies)} replies")
        sys.exit(1)

    # per-group tally so students see which dimension is broken
    tally = {}
    passed = failed = 0
    for (q, want, group), got in zip(allcases, replies):
        if want.startswith("OK:") and got.startswith("OK:"):
            ok = abs(float(got[3:]) - float(want[3:])) < TOL
        else:
            ok = (got.strip() == want)
        g = tally.setdefault(group, [0, 0])
        if ok:
            passed += 1; g[0] += 1
        else:
            failed += 1; g[1] += 1
            print(f"FAIL  q='{q}'  want '{want}'  got '{got}'")

    print("\nby group:")
    for g, (p, f) in tally.items():
        print(f"  {g:10s} {p} passed, {f} failed")
    print(f"\n{passed} passed, {failed} failed out of {passed + failed}")
    sys.exit(0 if failed == 0 else 1)


if __name__ == "__main__":
    main()
