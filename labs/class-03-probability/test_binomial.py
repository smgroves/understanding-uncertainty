#!/usr/bin/env python3
"""
Local autograder for the binomial assignment.

Spawns your binomial.py as a subprocess, pipes query lines through
stdin, and compares each reported probability against a reference
computed the same way. Passing locally is necessary but not sufficient —
the Gradescope grader runs a superset (more (n, p, k) triples, a full
sum-to-1 sweep, a sampler-mean check, and more protocol cases).

  python3 test_binomial.py
"""
import subprocess, sys, os, json, math

HERE = os.path.dirname(os.path.abspath(__file__))
TOL = 1e-6


def ref_pmf(n, p, k):
    """Reference PMF using exact integer C(n,k) via math.comb."""
    if k < 0 or k > n:
        return 0.0
    if p <= 0.0:
        return 1.0 if k == 0 else 0.0
    if p >= 1.0:
        return 1.0 if k == n else 0.0
    return math.comb(n, k) * p ** k * (1 - p) ** (n - k)


def run(queries):
    """Send query lines to binomial.py; return the list of reply lines."""
    proc = subprocess.run(
        [sys.executable, os.path.join(HERE, "binomial.py")],
        input="\n".join(queries) + "\n",
        capture_output=True, text=True, timeout=30,
    )
    if proc.returncode != 0:
        print("binomial.py crashed:\n" + proc.stderr)
        sys.exit(1)
    return proc.stdout.strip().splitlines()


def main():
    cases = []          # (query, expected_reply)

    # ---- GROUP 1: PMF values across a spread of (n, p, k) ----
    triples = [
        (10, 0.5, 0), (10, 0.5, 3), (10, 0.5, 5), (10, 0.5, 10),
        (20, 0.3, 6), (20, 0.3, 0), (20, 0.3, 20),
        (40, 0.32, 13), (40, 0.32, 40),
        (299, 0.321070, 96),          # the heart-failure framing
        (5, 0.0, 0), (5, 1.0, 5), (5, 0.0, 2),   # p at the boundary
    ]
    for (n, p, k) in triples:
        cases.append((f"{n} {p} {k}", f"OK: {ref_pmf(n, p, k):.6f}"))

    # ---- GROUP 2: the PMF must sum to 1 over k = 0..n ----
    # Send every k for a fixed (n, p); we sum the replies afterwards.
    sum_n, sum_p = 25, 0.4
    sum_queries = [f"{sum_n} {sum_p} {k}" for k in range(sum_n + 1)]

    # ---- GROUP 3: protocol — p outside [0, 1] must be reported ----
    protocol = [
        ("10 1.5 3", "ERR: invalid p"),
        ("10 -0.2 3", "ERR: invalid p"),
    ]

    queries = [q for q, _ in cases] + sum_queries + [q for q, _ in protocol]
    replies = run(queries)

    if len(replies) != len(queries):
        print(f"FAIL: sent {len(queries)} queries, got {len(replies)} replies")
        sys.exit(1)

    passed = failed = 0
    idx = 0

    # Group 1 checks
    for (q, want) in cases:
        got = replies[idx]; idx += 1
        ok = want.startswith("OK:") and got.startswith("OK:") and \
            abs(float(got[3:]) - float(want[3:])) < TOL
        passed, failed = _tally(ok, q, want, got, passed, failed)

    # Group 2 check: replies for k=0..n must be OK and sum to ~1
    total = 0.0
    sum_ok = True
    for q in sum_queries:
        got = replies[idx]; idx += 1
        if got.startswith("OK:"):
            total += float(got[3:])
        else:
            sum_ok = False
    sum_ok = sum_ok and abs(total - 1.0) < 1e-5
    passed, failed = _tally(sum_ok, f"sum k=0..{sum_n} of P(X=k)",
                            "1.000000", f"{total:.6f}", passed, failed)

    # Group 3 checks
    for (q, want) in protocol:
        got = replies[idx]; idx += 1
        ok = (got.strip() == want)
        passed, failed = _tally(ok, q, want, got, passed, failed)

    print(f"\n{passed} passed, {failed} failed out of {passed + failed}")
    sys.exit(0 if failed == 0 else 1)


def _tally(ok, q, want, got, passed, failed):
    if ok:
        return passed + 1, failed
    print(f"FAIL  q='{q}'  want '{want}'  got '{got}'")
    return passed, failed + 1


if __name__ == "__main__":
    main()
