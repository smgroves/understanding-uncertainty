#!/usr/bin/env python3
"""
Local autograder for the wrangling & robust-statistics assignment.

Spawns wrangling.py as a subprocess and speaks the median/quantile
protocol, checking both functions against a reference implementation
on odd- and even-length lists, plus one protocol case.

Passing locally is necessary but not sufficient - the Gradescope
grader runs a superset (more lists, more fracs).

  python3 test_wrangling.py
"""
import subprocess, sys, os, math, json

HERE = os.path.dirname(os.path.abspath(__file__))
TOL = 1e-6


# ---- reference implementation (mirrors the recipe) ----------
def ref_median(X):
    v = sorted(X)
    n = len(v)
    mid = n // 2
    if mid != n / 2:
        return v[mid]
    return (v[mid - 1] + v[mid]) / 2


def ref_quantile(X, frac):
    v = sorted(X)
    n = len(v)
    idx = max(math.ceil(n * frac) - 1, 0)
    return v[idx]


def run(queries):
    proc = subprocess.run(
        [sys.executable, os.path.join(HERE, "wrangling.py")],
        input="\n".join(queries) + "\n",
        capture_output=True, text=True, timeout=60,
    )
    if proc.returncode != 0:
        print("wrangling.py crashed:\n" + proc.stderr)
        sys.exit(1)
    return proc.stdout.strip().splitlines()


def parse(reply):
    assert reply.startswith("OK:"), reply
    return float(reply[3:])


def main():
    passed = failed = 0

    def check(name, ok, detail=""):
        nonlocal passed, failed
        if ok:
            passed += 1
        else:
            failed += 1
            print(f"FAIL  {name}  {detail}")

    data = json.load(open(os.path.join(HERE, "data.json")))
    price = data["price"]

    odd = [12.0, 34.0, 41.0, 58.0, 1018.0]           # n = 5, the toy set
    even = [12.0, 34.0, 41.0, 58.0, 1018.0, 1500.0]  # n = 6

    def fmt_csv(X):
        return ",".join(str(x) for x in X)

    queries = [
        f"median {fmt_csv(odd)}",
        f"median {fmt_csv(even)}",
        f"median {fmt_csv(price)}",
        "quantile 0.00 " + fmt_csv(odd),
        "quantile 0.25 " + fmt_csv(odd),
        "quantile 0.50 " + fmt_csv(odd),
        "quantile 0.75 " + fmt_csv(odd),
        "quantile 1.00 " + fmt_csv(odd),
        "quantile 0.25 " + fmt_csv(price),
        "quantile 0.75 " + fmt_csv(price),
        "bogus 1,2,3",   # protocol -> ERR
    ]
    replies = run(queries)
    check("one reply per query", len(replies) == len(queries),
          f"sent {len(queries)}, got {len(replies)}")
    if len(replies) != len(queries):
        print(f"\n{passed} passed, {failed} failed"); sys.exit(1)

    # ---- median: odd, even, and the real 250-listing sample ----
    check("median(odd n=5)", abs(parse(replies[0]) - ref_median(odd)) < TOL,
          f"got {replies[0]} want {ref_median(odd):.6f}")
    check("median(even n=6) averages the two middles",
          abs(parse(replies[1]) - ref_median(even)) < TOL,
          f"got {replies[1]} want {ref_median(even):.6f}")
    check("median(price, n=250)", abs(parse(replies[2]) - ref_median(price)) < TOL,
          f"got {replies[2]} want {ref_median(price):.6f}")

    # ---- quantile: every f in {0, .25, .5, .75, 1} on the toy set ----
    fracs = [0.00, 0.25, 0.50, 0.75, 1.00]
    for i, f in enumerate(fracs):
        got = parse(replies[3 + i])
        want = ref_quantile(odd, f)
        check(f"quantile(odd, f={f})", abs(got - want) < TOL, f"got {got} want {want:.6f}")

    # ---- quantile on the real sample (25th/75th -> the IQR) ----
    q25 = parse(replies[8]); q75 = parse(replies[9])
    check("quantile(price, .25) matches reference",
          abs(q25 - ref_quantile(price, 0.25)) < TOL, f"got {q25}")
    check("quantile(price, .75) matches reference",
          abs(q75 - ref_quantile(price, 0.75)) < TOL, f"got {q75}")

    # ---- protocol: unknown query reported, no crash ----
    check("unknown query -> ERR", replies[10].strip() == "ERR: unknown query",
          f"got '{replies[10]}'")

    print(f"\n{passed} passed, {failed} failed out of {passed + failed}")
    sys.exit(0 if failed == 0 else 1)


if __name__ == "__main__":
    main()
