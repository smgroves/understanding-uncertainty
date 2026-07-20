#!/usr/bin/env python3
"""
Local autograder for the Central Limit Theorem assignment.

Spawns your clt.py as a subprocess, pipes query lines through stdin, and
checks each reply against what the CLT predicts and against a reference
computed the same way. Passing locally is necessary but not sufficient —
the Gradescope grader runs a superset (more n, more seeds).

  python3 test_clt.py

Checks:
  1. mean_of_means ~= pop_mean                (the mean centers on mu)
  2. sd_of_means   ~= pop_sd / sqrt(n)        (the key CLT relation)
  3. reproducible: same query twice -> identical reply
  4. matches a reference computed with the documented draw method
  5. protocol: n<1 or m<1 -> "ERR: bad query", no crash
"""
import subprocess, sys, os, json, math, random

HERE = os.path.dirname(os.path.abspath(__file__))


def std(values):
    m = sum(values) / len(values)
    return math.sqrt(sum((x - m) ** 2 for x in values) / len(values))


def reference(X, n, m, seed):
    """The intended solution: n draws with replacement via rng.choice,
    averaged, repeated m times. Reproducible given seed."""
    rng = random.Random(seed)
    means = [sum(rng.choice(X) for _ in range(n)) / n for _ in range(m)]
    return sum(means) / m, std(means)


def run(queries):
    proc = subprocess.run(
        [sys.executable, os.path.join(HERE, "clt.py")],
        input="\n".join(queries) + "\n",
        capture_output=True, text=True, timeout=60,
    )
    if proc.returncode != 0:
        print("clt.py crashed:\n" + proc.stderr)
        sys.exit(1)
    return proc.stdout.strip().splitlines()


def parse_ok(line):
    assert line.startswith("OK:"), f"expected OK:, got {line!r}"
    a, b = line[3:].split()
    return float(a), float(b)


def main():
    data = json.load(open(os.path.join(HERE, "data.json")))
    X = data["values"]
    pop_mean = data["pop_mean"]
    pop_sd = data["pop_sd"]

    passed = failed = 0

    def check(name, ok, detail=""):
        nonlocal passed, failed
        if ok:
            passed += 1
            print(f"PASS  {name}")
        else:
            failed += 1
            print(f"FAIL  {name}  {detail}")

    # A big, reproducible run: enough sample means for the Monte-Carlo
    # estimates to be tight, one fixed seed so we can also reproduce it.
    N, M, SEED = 30, 5000, 7
    q = f"means {N} {M} {SEED}"
    r1 = run([q])[0]
    mom, som = parse_ok(r1)

    # 1. mean_of_means centers on the population mean.
    check("mean_of_means ~= pop_mean",
          abs(mom - pop_mean) < 0.20,
          f"got {mom:.4f}, pop_mean {pop_mean:.4f}")

    # 2. sd_of_means follows the standard-error law sigma/sqrt(n).
    se = pop_sd / math.sqrt(N)
    check("sd_of_means ~= pop_sd/sqrt(n)",
          abs(som - se) / se < 0.08,
          f"got {som:.4f}, sigma/sqrt(n) {se:.4f}")

    # 3. Reproducible: the same query again gives an identical reply.
    r2 = run([q])[0]
    check("reproducible (same seed -> same reply)",
          r1 == r2,
          f"first {r1!r}, second {r2!r}")

    # 4. Matches the reference computation (documented draw method) closely.
    ref_mom, ref_som = reference(X, N, M, SEED)
    check("matches reference within tolerance",
          abs(mom - ref_mom) < 1e-4 and abs(som - ref_som) < 1e-4,
          f"got ({mom:.6f}, {som:.6f}), ref ({ref_mom:.6f}, {ref_som:.6f})")

    # 5. Protocol: bad queries are reported, not crashed on.
    prot = run(["means 0 100 1", "means 30 0 1", "hello there"])
    check("protocol: n<1 / m<1 / junk -> ERR: bad query",
          prot == ["ERR: bad query"] * 3,
          f"got {prot!r}")

    print(f"\n{passed} passed, {failed} failed out of {passed + failed}")
    sys.exit(0 if failed == 0 else 1)


if __name__ == "__main__":
    main()
