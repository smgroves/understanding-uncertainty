#!/usr/bin/env python3
"""
Local autograder for the RNG-from-scratch assignment.

Spawns rng.py as a subprocess and speaks the next/choice protocol,
checking lcg_next for reproducibility and valid range, and choice for
both replacement modes plus a protocol case.

Passing locally is necessary but not sufficient - the Gradescope
grader runs a superset (more states, more seeds).

  python3 test_rng.py
"""
import subprocess, sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
MULTIPLIER = 1103515245
INCREMENT = 12345
MODULUS = 2147483648


def ref_next(state):
    new_state = (MULTIPLIER * state + INCREMENT) % MODULUS
    return new_state, new_state / (MODULUS - 1)


def ref_choice(items, k, seed, replace):
    state = seed
    if replace:
        out = []
        for _ in range(k):
            state, u = ref_next(state)
            out.append(items[int(u * len(items))])
        return out
    pool = list(items)
    out = []
    for _ in range(k):
        state, u = ref_next(state)
        idx = int(u * len(pool))
        out.append(pool.pop(idx))
    return out


def run(queries):
    proc = subprocess.run(
        [sys.executable, os.path.join(HERE, "rng.py")],
        input="\n".join(queries) + "\n",
        capture_output=True, text=True, timeout=60,
    )
    if proc.returncode != 0:
        print("rng.py crashed:\n" + proc.stderr)
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

    items = ["a", "b", "c", "d", "e", "f"]  # n = 6

    queries = [
        "next 12345",
        "next 12345",           # repeat -> reproducibility
        "next 999999999",       # a large state, still valid
        "choice a,b,c,d,e,f 6 7 0",   # without replacement, k == n
        "choice a,b,c,d,e,f 20 7 1",  # with replacement, k > n is fine
        "choice a,b,c,d,e,f 20 7 0",  # without replacement, k > n -> ERR
        "bogus 1 2 3",                # protocol -> ERR
    ]
    replies = run(queries)
    check("one reply per query", len(replies) == len(queries),
          f"sent {len(queries)}, got {len(replies)}")
    if len(replies) != len(queries):
        print(f"\n{passed} passed, {failed} failed"); sys.exit(1)

    def parse_next(reply):
        assert reply.startswith("OK:"), reply
        parts = reply[3:].split()
        return int(parts[0]), float(parts[1])

    # ---- next: reproducibility and correctness ----
    ns1, u1 = parse_next(replies[0])
    ns2, u2 = parse_next(replies[1])
    ref_ns, ref_u = ref_next(12345)
    check("next(12345) matches reference", ns1 == ref_ns and abs(u1 - ref_u) < 1e-6,
          f"got ({ns1},{u1}) want ({ref_ns},{ref_u:.6f})")
    check("next is reproducible for the same state", replies[0] == replies[1],
          f"'{replies[0]}' vs '{replies[1]}'")
    ns3, u3 = parse_next(replies[2])
    check("next(state) uniform is in [0, 1)", 0 <= u3 < 1, f"got {u3}")

    # ---- choice: without replacement, k == n ----
    got6 = replies[3][3:].strip().split(",")
    check("choice without replacement returns k items", len(got6) == 6, f"got {got6}")
    check("choice without replacement is a permutation of items",
          sorted(got6) == sorted(items), f"got {got6}")
    ref6 = ref_choice(items, 6, 7, False)
    check("choice without replacement matches reference", got6 == ref6,
          f"got {got6} want {ref6}")

    # ---- choice: with replacement, k > n allowed ----
    got20 = replies[4][3:].strip().split(",")
    check("choice with replacement returns k items even if k > n", len(got20) == 20,
          f"got {len(got20)}")
    check("choice with replacement only uses valid items",
          all(v in items for v in got20), f"got {got20}")

    # ---- protocol: k > n without replacement, and unknown query ----
    check("k > n without replacement -> ERR", replies[5].strip() == "ERR: unknown query",
          f"got '{replies[5]}'")
    check("unknown query -> ERR", replies[6].strip() == "ERR: unknown query",
          f"got '{replies[6]}'")

    print(f"\n{passed} passed, {failed} failed out of {passed + failed}")
    sys.exit(0 if failed == 0 else 1)


if __name__ == "__main__":
    main()
