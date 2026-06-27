---
title: GitHub CI Path Filtering
layout: default
parent: Reference
grand_parent: Extreme Programming
---

# GitHub CI Path Filtering

This repository keeps the `pull_request` trigger unconditional and performs path filtering **inside** the
workflow using [`dorny/paths-filter`](https://github.com/dorny/paths-filter), so that every pull request always
reports a status for each required check. The rationale for this pattern is described in
[GitHub Branch Protection Rationale]({% link extreme-programming/explanation/github-branch-protection-rationale.md %}#required-checks-in-a-monorepo);
the settings that consume it are in
[Configure GitHub Repository Protection]({% link extreme-programming/how-to/configure-github-repository-protection.md %}#require-status-checks-before-merging).

## Workflow structure

Both CI workflows in this repository use this pattern. The example below is `java-build-test.yml`;
`frontend-build-test.yml` is identical in structure (substituting `frontend/**` and `react-build-and-test`).

```yaml
# .github/workflows/java-build-test.yml  (frontend-build-test.yml is identical in structure)
on:
  push:
    branches: [ main ]
    paths:
      - 'backend/**'
      - '.github/workflows/java-build-test.yml'
  pull_request:
    branches: [ main ]          # no paths filter here

jobs:
  filter:
    runs-on: ubuntu-latest
    outputs:
      backend: ${{ steps.changes.outputs.backend }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v3
        id: changes
        with:
          filters: |
            backend:
              - 'backend/**'

  java-build-and-test:
    needs: filter
    if: needs.filter.outputs.backend == 'true'
    # ... full build steps ...

  skip-check:
    needs: filter
    if: needs.filter.outputs.backend != 'true'
    runs-on: ubuntu-latest
    steps:
      - run: echo "No backend changes, skipping the build"
```

- If the relevant directory was changed → the build and test job runs.
- Otherwise → the lightweight `skip-check` job runs, prints an explanatory message, and exits successfully.

The `push` trigger retains its `paths` filter for post-merge runs (for example, to trigger a deployment after a
PR is merged).

## Status-reporting matrix
{: #status-reporting-matrix }

| Scenario | `filter` job | Build job | Status reported |
|----------|-------------|-----------|-----------------|
| PR touches `backend/**` | runs, output `true` | `java-build-and-test` runs | ✅ pass / ❌ fail |
| PR does **not** touch `backend/**` | runs, output `false` | skipped | `skip-check` → ✅ pass |
| PR touches `frontend/**` | runs, output `true` | `react-build-and-test` runs | ✅ pass / ❌ fail |
| PR does **not** touch `frontend/**` | runs, output `false` | skipped | `skip-check` → ✅ pass |

## Required-check configuration

| Job | Add as required check? |
|-----|------------------------|
| `java-build-and-test` | ✅ Yes |
| `react-build-and-test` | ✅ Yes |
| `skip-check` | ❌ No — a skipped required job is counted as passing by GitHub; requiring `skip-check` would block PRs that change only one stack |

> The job name used in the branch protection rule must match the job `id` in the workflow YAML exactly
> (case-sensitive). GitHub does not offer auto-complete for jobs that have never run — trigger the workflow at least
> once (for example, by opening a draft pull request) before configuring the rule.
