#!/usr/bin/env python3
"""
Understanding Uncertainty - Vectors & the inner product sampler
(standalone, stdlib only)
------------------------------------------------------------------
The inner product, length, distance, and covariance of the 28-patient
sodium/chloride sample, computed with no numpy. Mirrors sampler.js and
viz.js's VEC.* core line-for-line, and the assignment template
(vectors.py) implements dot() and distance_matrix() the same way.

Usage:
  python3 sampler.py dot <x1,x2,...> <y1,y2,...>
  python3 sampler.py norm <x1,x2,...>
  python3 sampler.py distance <x1,x2,...> <y1,y2,...>
  python3 sampler.py covariance <na|cl> <na|cl>
  python3 sampler.py dmatrix          # full 28x28 distance matrix, na/cl points

Reads the sample from data.json sitting next to this file.
"""
import sys, os, json, math


# ---- Vector operations ----------------------------------------
def dot(x, y):
    return sum(xi * yi for xi, yi in zip(x, y))


def norm(x):
    return math.sqrt(dot(x, x))


def distance(x, y):
    return norm([xi - yi for xi, yi in zip(x, y)])


def mean(X):
    return sum(X) / len(X)


def covariance(X, Y):
    mx, my = mean(X), mean(Y)
    cx = [x - mx for x in X]
    cy = [y - my for y in Y]
    return dot(cx, cy) / len(X)


def distance_matrix(points):
    n = len(points)
    return [[distance(points[i], points[j]) for j in range(n)] for i in range(n)]


# ---- CLI --------------------------------------------------------
def load():
    here = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(here, "data.json")) as f:
        return json.load(f)


def parse_vec(s):
    return [float(v) for v in s.split(",")]


def main():
    argv = sys.argv[1:]
    if not argv:
        sys.stderr.write("usage: python3 sampler.py [dot|norm|distance|covariance|dmatrix] ...\n")
        sys.exit(1)
    cmd = argv[0]

    if cmd == "dot":
        print(f"{dot(parse_vec(argv[1]), parse_vec(argv[2])):.4f}")
    elif cmd == "norm":
        print(f"{norm(parse_vec(argv[1])):.4f}")
    elif cmd == "distance":
        print(f"{distance(parse_vec(argv[1]), parse_vec(argv[2])):.4f}")
    elif cmd == "covariance":
        data = load()
        X, Y = data[argv[1]], data[argv[2]]
        print(f"{covariance(X, Y):.4f}")
    elif cmd == "dmatrix":
        data = load()
        points = list(zip(data["na"], data["cl"]))
        D = distance_matrix([list(p) for p in points])
        sys.stderr.write(f"# n={len(points)}\n")
        for row in D:
            print(" ".join(f"{v:.4f}" for v in row))
    else:
        sys.stderr.write("usage: python3 sampler.py [dot|norm|distance|covariance|dmatrix] ...\n")
        sys.exit(1)


if __name__ == "__main__":
    main()
