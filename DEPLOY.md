# Deploying to `smgroves.github.io/understanding-uncertainty`

This folder is a standalone git repo. Publishing is: push it to a GitHub repo
named **`understanding-uncertainty`** and turn on Pages from the `main` branch.
No build step, no Actions, no Jekyll.

## Why it just works

- Every link in the site is **relative** (`../shared/lab-base.css`, `fetch('data.json')`,
  `../class-07-kde/kde.html`), so the whole tree works unchanged when served at
  `/understanding-uncertainty/`.
- The shared assets live in `labs/shared/` (not `_shared/`) — GitHub Pages runs Jekyll,
  which silently drops `_`-prefixed folders. A `.nojekyll` at the root disables Jekyll
  entirely as a backstop.
- `index.html` at the repo root is the landing page Pages serves for the site.

## One-time setup

```bash
# from inside this folder (already a git repo on branch main)
# 1. create the GitHub repo (either on github.com, or with the gh CLI):
gh repo create smgroves/understanding-uncertainty --public --source=. --remote=origin

# 2. push
git push -u origin main
```

If you made the repo on github.com instead of with `gh`:

```bash
git remote add origin https://github.com/smgroves/understanding-uncertainty.git
git push -u origin main
```

Then in the repo's **Settings → Pages**: Source = **Deploy from a branch**,
Branch = **main**, folder = **/ (root)**. Save.

Live in a minute at: **https://smgroves.github.io/understanding-uncertainty/**

## Updating later

Edit, commit, push. That's it — Pages rebuilds on every push to `main`. Because
CSS/JS is cache-busted with `?v=N`, bump the version on any file you change so
students get the update without a hard refresh.

## What is and isn't published

Everything tracked in the repo is publicly fetchable at the site URL. `.gitignore`
keeps the following OUT of the repo:

- **`NOTES.md` (every lab)** — these hold the reference **solutions**. Keep your own
  copies outside the repo, or in a separate private repo.
- `.claude/`, `__pycache__/`, `.DS_Store`.

The student-facing assignment templates (`*.py`) and local autograders (`test_*.py`)
**are** published on purpose — students download and run them. `CLAUDE.md` (authoring
guide for building more labs) is also published; it's harmless, but delete it from the
repo if you'd rather it not be public.
