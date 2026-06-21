---
title: Run a Pre-Push Build Gate
parent: XP How-To
---

# Run a Pre-Push Build Gate
{: .no_toc }

How to set up a shared `pre-push` git hook that runs the module build and tests locally before a
push reaches `main`, so direct pushes are far less likely to break the pipeline.
{: .fs-6 .fw-300 }

> This is a **best-effort, client-side** gate: it runs on the developer's machine and can be skipped
> with `git push --no-verify`. It does not replace server-side enforcement. For why a direct push
> cannot be gated on CI results, and when to require a pull request instead, see
> [GitHub Branch Protection Rationale]({% link _xp/explanation/github-branch-protection-rationale.md %}#direct-pushes).

## Table of Contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## When to use this

Use a `pre-push` hook when collaborators push directly to `main` (Trunk-Based Development) and you
want each push validated the same way CI validates it — without the ceremony of a pull request. If
the repository instead requires pull requests, the server-side
[required status checks]({% link _xp/how-to/configure-github-repository-protection.md %}#require-status-checks-before-merging)
already cover this, and a hook is optional.

## Add the hook

The hook mirrors the path-filtered CI: it inspects which paths changed in the commits being pushed
and runs **only** the affected module's build, so a docs-only or single-stack push stays fast.

### Steps

1. Create a `.githooks/` directory at the repository root and add an executable `pre-push` file:

   ```bash
   #!/usr/bin/env bash
   # .githooks/pre-push — run the same checks CI runs, for the module that changed.
   set -euo pipefail

   # Commits being pushed, compared against their upstream (falls back to origin/main).
   range="$(git rev-parse --abbrev-ref --symbolic-full-name @{push} 2>/dev/null || echo origin/main)"
   changed="$(git diff --name-only "$range"...HEAD)"

   if grep -q '^backend/' <<< "$changed"; then
     echo "▶ backend changed — running mvn -B package"
     (cd backend && mvn -B package)
   fi

   if grep -q '^frontend/' <<< "$changed"; then
     echo "▶ frontend changed — running lint, build, test"
     (cd frontend && npm ci && npm run lint && npm run build && npm test)
   fi

   echo "✓ pre-push checks passed"
   ```

2. Make it executable and commit it so every collaborator gets the same hook:

   ```bash
   chmod +x .githooks/pre-push
   git add .githooks/pre-push
   git commit -m "build: add pre-push build gate"
   ```

3. Point git at the committed hooks directory. `core.hooksPath` is a **per-clone** setting, so each
   collaborator runs this once after cloning:

   ```bash
   git config core.hooksPath .githooks
   ```

   To make this automatic for the frontend module, add a `prepare` script to `frontend/package.json`
   so `npm install` wires it up:

   ```json
   "scripts": {
     "prepare": "git config core.hooksPath .githooks"
   }
   ```

### What happens next

- On `git push`, the hook runs before any commit reaches the remote. If `mvn -B package` or the
  frontend checks fail, the push is **aborted** and `main` never sees the broken commit.
- A push that touches neither `backend/` nor `frontend/` (for example, docs only) runs no build and
  completes immediately — matching the CI path filters.
- The exit code matters: the hook aborts the push only if a command exits non-zero. `set -euo
  pipefail` ensures the first failing command stops the script.

## Bypassing and its limits

The hook can be skipped with:

```bash
git push --no-verify
```

This is intentional — git hooks are advisory. A `pre-push` gate catches honest mistakes and keeps
`main` green in day-to-day work, but it cannot *enforce* anything against a determined bypass or a
collaborator who has not run `git config core.hooksPath`. When a guarantee is required, move the gate
server-side by [requiring a pull request and status checks]({% link _xp/how-to/configure-github-repository-protection.md %}#require-a-pull-request-before-merging).

**Reference:** [Git Hooks — `pre-push`](https://git-scm.com/docs/githooks#_pre_push) ·
[`core.hooksPath`](https://git-scm.com/docs/git-config#Documentation/git-config.txt-corehooksPath)
