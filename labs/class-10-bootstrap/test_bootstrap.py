#!/usr/bin/env python3
"""
Local autograder for the bootstrap assignment.

Two kinds of check:
  (A) UNIT   - imports your bootstrap.py and calls resample() directly,
               to confirm a resample is the right size and really drawn
               WITH replacement (not a permutation).
  (B) SPAWN  - launches your bootstrap.py as a subprocess and speaks the
               `ci` protocol, checking the CI brackets the observed
               statistic, is reproducible given the seed, and matches a
               reference computed the same way. Plus one protocol case.

Passing locally is necessary but not sufficient - the Gradescope grader
runs a superset (more B, more seeds, both statistics).

  python3 test_bootstrap.py
"""
import subprocess, sys, os, json, math, importlib.util

HERE = os.path.dirname(os.path.abspath(__file__))
TOL = 1e-3
X = json.load(open(os.path.join(HERE, "data.json")))["values"]


# ---- reference implementation (mirrors the recipe) ----------
def make_lcg(seed):
    # matches lab-base.js / bootstrap.py exactly (float multiply)
    s = float(seed & 0xffffffff)
    def rng():
        nonlocal s
        p = s * 1103515245.0 + 12345.0
        s = float(int(p) % 2147483648)
        return s / 2147483647.0
    return rng

def quantile(sorted_X, p):
    k = (len(sorted_X) - 1) * p
    lo = math.floor(k); hi = min(lo + 1, len(sorted_X) - 1)
    return sorted_X[lo] + (sorted_X[hi] - sorted_X[lo]) * (k - lo)

def statistic(v, name):
    if name == "mean":
        return sum(v) / len(v)
    if name == "median":
        return quantile(sorted(v), 0.5)
    raise ValueError(name)

def ref_ci(X, B, seed, name):
    rng = make_lcg(seed); n = len(X); stats = []
    for _ in range(B):
        rs = [X[int(rng() * n)] for _ in range(n)]
        stats.append(statistic(rs, name))
    stats.sort()
    return quantile(stats, 0.025), quantile(stats, 0.975)


def load_student():
    spec = importlib.util.spec_from_file_location("bootstrap", os.path.join(HERE, "bootstrap.py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def run(queries):
    proc = subprocess.run(
        [sys.executable, os.path.join(HERE, "bootstrap.py")],
        input="\n".join(queries) + "\n",
        capture_output=True, text=True, timeout=60,
    )
    if proc.returncode != 0:
        print("bootstrap.py crashed:\n" + proc.stderr)
        sys.exit(1)
    return proc.stdout.strip().splitlines()


def main():
    passed = failed = 0
    def check(name, ok, detail=""):
        nonlocal passed, failed
        if ok:
            passed += 1
        else:
            failed += 1
            print(f"FAIL  {name}  {detail}")

    n = len(X)
    obs_mean = statistic(X, "mean")
    obs_median = statistic(X, "median")

    # ---- (A) UNIT: resample is valid --------------------------
    try:
        mod = load_student()
        setX = set(X)
        rs = mod.resample(X, make_lcg(7))
        check("resample length == n", len(rs) == n, f"got {len(rs)}")
        check("resample values all drawn from X", all(v in setX for v in rs))
        # With replacement, n draws from n items almost surely differs from a
        # permutation of X. A sampling-WITHOUT-replacement bug returns a
        # permutation, so sorted(resample) == sorted(X) every time.
        differs = any(
            sorted(mod.resample(X, make_lcg(s))) != sorted(X)
            for s in range(1, 6)
        )
        check("resample is WITH replacement (not a permutation)", differs)
    except NotImplementedError:
        check("resample implemented", False, "resample() raised NotImplementedError")
    except Exception as e:  # noqa
        check("resample importable", False, repr(e))

    # ---- (B) SPAWN: the ci protocol ---------------------------
    B, seed = 2000, 42
    queries = [
        f"ci {B} {seed} mean",
        f"ci {B} {seed} median",
        f"ci {B} {seed} mean",        # repeat -> reproducibility
        "ci 500 1 triangular",        # protocol -> ERR
    ]
    replies = run(queries)
    check("one reply per query", len(replies) == len(queries),
          f"sent {len(queries)}, got {len(replies)}")
    if len(replies) != len(queries):
        print(f"\n{passed} passed, {failed} failed"); sys.exit(1)

    def parse(reply):
        assert reply.startswith("OK:"), reply
        lo, hi = reply[3:].split()
        return float(lo), float(hi)

    # CI brackets the observed statistic
    lo_m, hi_m = parse(replies[0])
    lo_md, hi_md = parse(replies[1])
    check("mean CI brackets observed mean", lo_m <= obs_mean <= hi_m,
          f"CI=({lo_m},{hi_m}) obs={obs_mean:.4f}")
    check("median CI brackets observed median", lo_md <= obs_median <= hi_md,
          f"CI=({lo_md},{hi_md}) obs={obs_median:.4f}")

    # reproducible: same seed -> identical reply
    check("reproducible given the seed", replies[0] == replies[2],
          f"'{replies[0]}' vs '{replies[2]}'")

    # within tolerance vs the reference
    rlo_m, rhi_m = ref_ci(X, B, seed, "mean")
    rlo_md, rhi_md = ref_ci(X, B, seed, "median")
    check("mean CI matches reference",
          abs(lo_m - rlo_m) < TOL and abs(hi_m - rhi_m) < TOL,
          f"got ({lo_m},{hi_m}) want ({rlo_m:.4f},{rhi_m:.4f})")
    check("median CI matches reference",
          abs(lo_md - rlo_md) < TOL and abs(hi_md - rhi_md) < TOL,
          f"got ({lo_md},{hi_md}) want ({rlo_md:.4f},{rhi_md:.4f})")

    # protocol: unknown statistic reported, no crash
    check("unknown statistic -> ERR", replies[3].strip() == "ERR: unknown statistic",
          f"got '{replies[3]}'")

    print(f"\n{passed} passed, {failed} failed out of {passed + failed}")
    sys.exit(0 if failed == 0 else 1)


if __name__ == "__main__":
    main()
