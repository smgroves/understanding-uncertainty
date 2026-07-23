#!/usr/bin/env python3
"""
Local autograder for the vectors & inner-product assignment.

Spawns vectors.py as a subprocess and speaks the dot/dmatrix protocol,
checking both functions against a reference implementation, including
an orthogonal-pair case, a self-dot (squared norm) case, a mismatched-
length protocol case, and a distance matrix's diagonal/symmetry.

Passing locally is necessary but not sufficient - the Gradescope
grader runs a superset (more vectors, more points).

  python3 test_vectors.py
"""
import subprocess, sys, os, math

HERE = os.path.dirname(os.path.abspath(__file__))
TOL = 1e-4


# ---- reference implementation (mirrors the recipe) ----------
def ref_dot(x, y):
    return sum(xi * yi for xi, yi in zip(x, y))


def ref_distance(x, y):
    return math.sqrt(sum((xi - yi) ** 2 for xi, yi in zip(x, y)))


def ref_dmatrix(points):
    n = len(points)
    return [[ref_distance(points[i], points[j]) for j in range(n)] for i in range(n)]


def run(queries):
    proc = subprocess.run(
        [sys.executable, os.path.join(HERE, "vectors.py")],
        input="\n".join(queries) + "\n",
        capture_output=True, text=True, timeout=60,
    )
    if proc.returncode != 0:
        print("vectors.py crashed:\n" + proc.stderr)
        sys.exit(1)
    return proc.stdout.strip().splitlines()


def parse_ok(reply):
    assert reply.startswith("OK:"), reply
    return [float(v) for v in reply[3:].split()]


def main():
    passed = failed = 0

    def check(name, ok, detail=""):
        nonlocal passed, failed
        if ok:
            passed += 1
        else:
            failed += 1
            print(f"FAIL  {name}  {detail}")

    toy_points = [[0.0, 0.0], [3.0, 4.0], [6.0, 0.0]]

    queries = [
        "dot 3,4 4,-3",            # orthogonal pair -> 0
        "dot 1,2,3 3,0,-1",        # a second orthogonal pair -> 0
        "dot 3,4 3,4",             # self-dot -> squared norm -> 25
        "dot 1,2 1,2,3",           # mismatched lengths -> ERR
        "dmatrix 0,0;3,4;6,0",     # toy 3-point set
        "bogus 1,2 3,4",           # protocol -> ERR
    ]
    replies = run(queries)
    check("one reply per query", len(replies) == len(queries),
          f"sent {len(queries)}, got {len(replies)}")
    if len(replies) != len(queries):
        print(f"\n{passed} passed, {failed} failed"); sys.exit(1)

    # ---- dot: orthogonal pairs and self-dot ----
    got = parse_ok(replies[0])[0]
    check("dot(orthogonal pair) == 0", abs(got - 0.0) < TOL, f"got {got}")
    got = parse_ok(replies[1])[0]
    check("dot(second orthogonal pair) == 0", abs(got - 0.0) < TOL, f"got {got}")
    got = parse_ok(replies[2])[0]
    check("dot(x, x) == squared norm", abs(got - 25.0) < TOL, f"got {got}")

    # ---- protocol: mismatched lengths and unknown query ----
    check("mismatched vector lengths -> ERR", replies[3].strip() == "ERR: unknown query",
          f"got '{replies[3]}'")
    check("unknown query -> ERR", replies[5].strip() == "ERR: unknown query",
          f"got '{replies[5]}'")

    # ---- distance matrix: shape, diagonal, symmetry, reference ----
    flat = parse_ok(replies[4])
    n = len(toy_points)
    check("dmatrix has n*n entries", len(flat) == n * n, f"got {len(flat)}, want {n*n}")
    if len(flat) == n * n:
        D = [flat[i * n:(i + 1) * n] for i in range(n)]
        check("dmatrix diagonal is zero", all(abs(D[i][i]) < TOL for i in range(n)),
              f"diagonal = {[D[i][i] for i in range(n)]}")
        check("dmatrix is symmetric", all(abs(D[i][j] - D[j][i]) < TOL for i in range(n) for j in range(n)))
        ref = ref_dmatrix(toy_points)
        check("dmatrix matches reference",
              all(abs(D[i][j] - ref[i][j]) < TOL for i in range(n) for j in range(n)),
              f"got {D} want {ref}")

    print(f"\n{passed} passed, {failed} failed out of {passed + failed}")
    sys.exit(0 if failed == 0 else 1)


if __name__ == "__main__":
    main()
