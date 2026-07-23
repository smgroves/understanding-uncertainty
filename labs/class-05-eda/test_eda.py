#!/usr/bin/env python3
"""
Local autograder for the proportions & ECDF assignment.

Spawns eda.py as a subprocess and speaks the proportion/ecdf protocol,
checking both functions against a reference implementation on edge
cases (target absent, target is every label, threshold below the
minimum and at/above the maximum) plus one protocol case.

Passing locally is necessary but not sufficient - the Gradescope
grader runs a superset (more lists, more thresholds).

  python3 test_eda.py
"""
import subprocess, sys, os, math

HERE = os.path.dirname(os.path.abspath(__file__))
TOL = 1e-6


def ref_proportion(labels, target):
    return sum(1 for v in labels if v == target) / len(labels)


def ref_ecdf(values, x):
    return sum(1 for v in values if v <= x) / len(values)


def ref_se(p, n):
    return math.sqrt(p * (1 - p) / n)


def run(queries):
    proc = subprocess.run(
        [sys.executable, os.path.join(HERE, "eda.py")],
        input="\n".join(queries) + "\n",
        capture_output=True, text=True, timeout=60,
    )
    if proc.returncode != 0:
        print("eda.py crashed:\n" + proc.stderr)
        sys.exit(1)
    return proc.stdout.strip().splitlines()


def parse(reply):
    assert reply.startswith("OK:"), reply
    p, s = reply[3:].split()
    return float(p), float(s)


def main():
    passed = failed = 0

    def check(name, ok, detail=""):
        nonlocal passed, failed
        if ok:
            passed += 1
        else:
            failed += 1
            print(f"FAIL  {name}  {detail}")

    labels = ["a", "b", "a", "a", "c", "b"]  # n = 6
    values = [3.0, 1.0, 4.0, 1.0, 5.0, 9.0, 2.0, 6.0]  # n = 8

    queries = [
        "proportion a,b,a,a,c,b a",     # 3/6 = 0.5
        "proportion a,b,a,a,c,b z",     # target absent -> 0
        "proportion a,a,a a",            # target is every label -> 1
        "ecdf 3,1,4,1,5,9,2,6 4",        # 5/8 = 0.625
        "ecdf 3,1,4,1,5,9,2,6 0",        # below minimum -> 0
        "ecdf 3,1,4,1,5,9,2,6 9",        # at maximum -> 1
        "bogus 1,2,3 x",                 # protocol -> ERR
    ]
    replies = run(queries)
    check("one reply per query", len(replies) == len(queries),
          f"sent {len(queries)}, got {len(replies)}")
    if len(replies) != len(queries):
        print(f"\n{passed} passed, {failed} failed"); sys.exit(1)

    # ---- proportion ----
    p0, s0 = parse(replies[0])
    ref_p0 = ref_proportion(labels, "a")
    check("proportion('a') correct", abs(p0 - ref_p0) < TOL, f"got {p0} want {ref_p0}")
    check("proportion('a') se matches sqrt(p(1-p)/n)", abs(s0 - ref_se(p0, len(labels))) < TOL,
          f"got {s0}")

    p1, _ = parse(replies[1])
    check("proportion(absent target) == 0", abs(p1 - 0.0) < TOL, f"got {p1}")

    p2, _ = parse(replies[2])
    check("proportion(target is every label) == 1", abs(p2 - 1.0) < TOL, f"got {p2}")

    # ---- ecdf ----
    f0, sf0 = parse(replies[3])
    ref_f0 = ref_ecdf(values, 4)
    check("ecdf(4) correct", abs(f0 - ref_f0) < TOL, f"got {f0} want {ref_f0}")
    check("ecdf(4) se matches sqrt(F(1-F)/n)", abs(sf0 - ref_se(f0, len(values))) < TOL,
          f"got {sf0}")

    f1, _ = parse(replies[4])
    check("ecdf(below minimum) == 0", abs(f1 - 0.0) < TOL, f"got {f1}")

    f2, _ = parse(replies[5])
    check("ecdf(at maximum) == 1", abs(f2 - 1.0) < TOL, f"got {f2}")

    # ---- protocol ----
    check("unknown query -> ERR", replies[6].strip() == "ERR: unknown query",
          f"got '{replies[6]}'")

    print(f"\n{passed} passed, {failed} failed out of {passed + failed}")
    sys.exit(0 if failed == 0 else 1)


if __name__ == "__main__":
    main()
