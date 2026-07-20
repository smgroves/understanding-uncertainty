# Understanding Uncertainty

Interactive labs for **Understanding Uncertainty** — a first probability and
statistics course for data-science students (Fall 2026, UVA School of Data Science).

**Live:** https://smgroves.github.io/understanding-uncertainty/

Each lab is a single, dependency-free web page: a demo you can touch on arrival, a
from-scratch derivation with live widgets, and a Python assignment with a local
autograder. No build step — plain HTML/CSS/JS.

## Run locally

The pages load data with `fetch`, so serve over http (not `file://`):

```bash
python3 -m http.server
# then open http://localhost:8000/  (or /labs/class-07-kde/kde.html)
```

## Layout

```
index.html            course home
schedule.html         14-week Fall 2026 schedule
labs/
  shared/             shared design system: lab-base.css + lab-base.js
  class-07-kde/       one folder per lab (page, widgets, data, sampler, assignment)
  ...
```

## Deploying

See [DEPLOY.md](DEPLOY.md). In short: push to a GitHub repo named
`understanding-uncertainty` and enable Pages from `main` (`/root`).

## Authoring more labs

`CLAUDE.md` documents the lab-authoring contract (the shared design system,
presentation mode, Think·Pair·Share, glossary, assignment/autograder pattern) and
points at `labs/class-07-kde/` as the reference implementation.
