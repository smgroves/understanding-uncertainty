#!/usr/bin/env python3
"""
Class 04 assignment - build a random number generator from scratch
======================================================================

You will implement the recurrence behind a seeded pseudorandom number
generator, and a sampling function built on top of it - no `random`
module, no numpy. The scaffolding (the stdin/stdout protocol the
autograder speaks) is already written. You fill in the two functions
in the YOUR JOB zone.

THE RECURRENCE
---------------
A linear congruential generator advances an integer STATE with one
formula and turns that state into a uniform float with another:

    new_state = (multiplier * state + increment) mod modulus
    uniform    = new_state / (modulus - 1)

This lab's constants: multiplier = 1103515245, increment = 12345,
modulus = 2**31 = 2147483648. Same state in, same (new_state, uniform)
out, every time - that determinism is the entire point (see the lab's
"Seeds you can trust" section).

DATA (data.json, sitting next to this file)
--------------------------------------------
  {
    "variable": "Cardiac patient age",
    "source": "...",
    "n": 40,
    "age": [22.0, 81.0, ...]   # patient age in years, length n = 40
  }
This template only ever reads "age" from data.json.

I/O PROTOCOL (how the autograder talks to you)
------------------------------------------------
The grader launches `python3 rng.py` and sends one query per line on
stdin:

    next <state>
    choice <items,comma,sep> <k> <seed> <0|1>

`items` is a comma-separated list of the values to choose from (as
given - treat each entry as a string). The last argument to `choice`
is 1 for with-replacement, 0 for without.

For every query line you print exactly one line to stdout:

    OK: <new_state> <uniform, 6 decimals>     # for `next`
    OK: <k comma-separated items>              # for `choice`

If the query keyword is not recognised, or `choice` is asked for more
items than exist without replacement, print:

    ERR: unknown query

Anything off-protocol confuses the grader, so do not print extra
lines, banners, or debug text to stdout (use stderr for debugging).

RUN
---
  echo "next 12345" | python3 rng.py                # -> OK: 1406932606 0.655154
  echo "choice a,b,c,d 4 7 0" | python3 rng.py        # -> OK: <a permutation of a,b,c,d>
  python3 test_rng.py                                 # local autograder
"""
import sys


MULTIPLIER = 1103515245
INCREMENT = 12345
MODULUS = 2147483648  # 2**31


# ============================================================
# YOUR JOB starts here.
# ============================================================

def lcg_next(state):
    """Advance the generator one step.

    Return (new_state, uniform):
      new_state = (MULTIPLIER * state + INCREMENT) % MODULUS
      uniform    = new_state / (MODULUS - 1), a float in [0, 1)

    Hint: MODULUS - 1 is 2147483647. Dividing by it (not MODULUS)
    matches the reference generator used throughout this lab.
    """
    # TODO: compute new_state and uniform using the formulas above.
    raise NotImplementedError


def choice(items, k, seed, replace):
    """Draw k elements from the list `items`.

    Start a generator at `state = seed` and call lcg_next repeatedly,
    threading the returned new_state into the next call. Use each
    uniform to pick an index: int(uniform * len(pool)).

      - If replace is True: each draw picks from the full `items`
        list again, so the same element can be drawn more than once.
      - If replace is False: remove each drawn element from a working
        copy of the list so it cannot be drawn again. If k is larger
        than len(items), raise ValueError (the caller turns that into
        the ERR: unknown query protocol response).

    Return a list of the k drawn elements, in draw order.
    """
    # TODO: implement with/without-replacement sampling using lcg_next.
    raise NotImplementedError

# ============================================================
# YOUR JOB ends here. Leave everything below unchanged.
# ============================================================


def main():
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        parts = line.split()
        try:
            if parts[0] == "next":
                state = int(parts[1])
                new_state, uniform = lcg_next(state)
                print(f"OK: {new_state} {uniform:.6f}", flush=True)
            elif parts[0] == "choice":
                items = parts[1].split(",")
                k, seed, replace = int(parts[2]), int(parts[3]), parts[4] == "1"
                drawn = choice(items, k, seed, replace)
                print("OK: " + ",".join(drawn), flush=True)
            else:
                print("ERR: unknown query", flush=True)
        except (IndexError, ValueError):
            print("ERR: unknown query", flush=True)


if __name__ == "__main__":
    main()
