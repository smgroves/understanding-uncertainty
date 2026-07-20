#!/usr/bin/env python3
"""
Local autograder for the Monte Carlo assignment.

Spawns your montecarlo.py as a subprocess, pipes query lines through
stdin, and checks each reply. Four things are graded:

  1. MEAN -> TRUTH   the resampled mean lands near the true population
                     mean, within a tolerance that SHRINKS as n grows.
  2. PI  -> TRUTH    the dart-throwing estimate lands near pi, tolerance
                     shrinking with n.
  3. REPRODUCIBLE    the same query with the same seed gives the SAME
                     answer twice (your RNG is seeded, not os-random).
  4. PROTOCOL        a malformed query prints `ERR: bad query`, no crash.

Passing locally is necessary but not sufficient - the Gradescope grader
runs a superset (more n, more seeds, tighter tolerances at large n).

  python3 test_montecarlo.py
"""
import subprocess, sys, os, json, math

HERE = os.path.dirname(os.path.abspath(__file__))


def run(queries):
    """Send query lines to montecarlo.py; return the list of reply lines."""
    proc = subprocess.run(
        [sys.executable, os.path.join(HERE, "montecarlo.py")],
        input="\n".join(queries) + "\n",
        capture_output=True, text=True, timeout=60,
    )
    if proc.returncode != 0:
        print("montecarlo.py crashed:\n" + proc.stderr)
        sys.exit(1)
    return proc.stdout.strip().splitlines()


def main():
    data = json.load(open(os.path.join(HERE, "data.json")))
    X = data["values"]
    truth = data["true_mean"]
    sd = data["std"]

    # Each case: (query, checker(reply)->bool, human description).
    cases = []

    # ---- 1. MEAN -> TRUTH, tolerance shrinks with n --------------
    # A safe tolerance is a generous multiple of the standard error
    # sd/sqrt(n); it tightens automatically as n grows.
    for n, seed in [(200, 3), (2000, 1), (20000, 7)]:
        se = sd / math.sqrt(n)
        tol = 6.0 * se
        cases.append((
            f"mean {n} {seed}",
            (lambda tol: lambda r: r.startswith("OK:") and abs(float(r[3:]) - truth) < tol)(tol),
            f"mean n={n}: within {tol:.3f} of true mean {truth:.3f}",
        ))

    # ---- 2. PI -> TRUTH, tolerance shrinks with n ----------------
    # Standard error of the pi estimate is ~ 4*sqrt(p(1-p))/sqrt(n) with
    # p = pi/4; a 6x-SE band is comfortable and still tightens with n.
    for n, seed in [(1000, 2), (50000, 5), (200000, 9)]:
        se_pi = 4.0 * math.sqrt((math.pi / 4) * (1 - math.pi / 4)) / math.sqrt(n)
        tol = 6.0 * se_pi
        cases.append((
            f"pi {n} {seed}",
            (lambda tol: lambda r: r.startswith("OK:") and abs(float(r[3:]) - math.pi) < tol)(tol),
            f"pi n={n}: within {tol:.3f} of {math.pi:.5f}",
        ))

    # ---- 4. PROTOCOL: malformed queries -> ERR: bad query --------
    for q in ("mean 100", "wobble 10 1", "pi ten 1"):
        cases.append((q, lambda r: r.strip() == "ERR: bad query",
                      f"protocol: '{q}' -> ERR: bad query"))

    queries = [q for q, _, _ in cases]
    replies = run(queries)
    if len(replies) != len(queries):
        print(f"FAIL: sent {len(queries)} queries, got {len(replies)} replies")
        sys.exit(1)

    passed = failed = 0
    for (q, ok, desc), got in zip(cases, replies):
        try:
            good = ok(got)
        except (ValueError, IndexError):
            good = False
        if good:
            passed += 1
        else:
            failed += 1
            print(f"FAIL  q='{q}'  got '{got}'  ({desc})")

    # ---- 3. REPRODUCIBLE: same seed twice -> identical answer ----
    rep = run(["mean 5000 4", "mean 5000 4", "pi 5000 4", "pi 5000 4"])
    for i, label in ((0, "mean"), (2, "pi")):
        if len(rep) > i + 1 and rep[i] == rep[i + 1] and rep[i].startswith("OK:"):
            passed += 1
        else:
            failed += 1
            print(f"FAIL  reproducibility ({label}): {rep[i:i+2] if len(rep)>i+1 else rep}")

    print(f"\n{passed} passed, {failed} failed out of {passed + failed}")
    sys.exit(0 if failed == 0 else 1)


if __name__ == "__main__":
    main()
