#!/usr/bin/env python3
"""
Local autograder for the KDE assignment.

Spawns your kde.py as a subprocess, pipes query lines through stdin,
and compares each reported density against a reference computed the
same way. Passing locally is necessary but not sufficient — the
Gradescope grader runs a superset (more grid points, more bandwidths,
and a check that your density integrates to about 1).

  python3 test_kde.py
"""
import subprocess, sys, os, json, math

HERE = os.path.dirname(os.path.abspath(__file__))
TOL = 1e-4


def ref_at(x, X, h, name):
    if name == "gaussian":
        k = lambda z: math.exp(-(z * z) / 2) / math.sqrt(2 * math.pi)
    elif name == "uniform":
        k = lambda z: 0.5 if abs(z) < 1 else 0.0
    else:
        return None
    return sum(k((x - xi) / h) for xi in X) / (len(X) * h)


def run(queries):
    """Send query lines to kde.py; return the list of reply lines."""
    proc = subprocess.run(
        [sys.executable, os.path.join(HERE, "kde.py")],
        input="\n".join(queries) + "\n",
        capture_output=True, text=True, timeout=30,
    )
    if proc.returncode != 0:
        print("kde.py crashed:\n" + proc.stderr)
        sys.exit(1)
    return proc.stdout.strip().splitlines()


def main():
    X = json.load(open(os.path.join(HERE, "data.json")))["values"]

    # ---- CORRECTNESS: density values on a grid, both kernels ----
    cases = []          # (query, expected_reply)
    for name in ("gaussian", "uniform"):
        for x in (2.0, 5.0, 8.0, 12.0, 20.0):
            for h in (2.0, 3.5, 6.0):
                ref = ref_at(x, X, h, name)
                cases.append((f"{x} {h} {name}", f"OK: {ref:.6f}"))

    # ---- PROTOCOL: an unknown kernel must be reported, not crash ----
    protocol = [("5.0 3.5 triangular", "ERR: unknown kernel")]

    queries = [q for q, _ in cases + protocol]
    replies = run(queries)

    if len(replies) != len(queries):
        print(f"FAIL: sent {len(queries)} queries, got {len(replies)} replies")
        sys.exit(1)

    passed = failed = 0
    for (q, want), got in zip(cases + protocol, replies):
        ok = False
        if want.startswith("OK:") and got.startswith("OK:"):
            ok = abs(float(got[3:]) - float(want[3:])) < TOL
        else:
            ok = (got.strip() == want)
        if ok:
            passed += 1
        else:
            failed += 1
            print(f"FAIL  q='{q}'  want '{want}'  got '{got}'")

    print(f"\n{passed} passed, {failed} failed out of {passed + failed}")
    sys.exit(0 if failed == 0 else 1)


if __name__ == "__main__":
    main()
