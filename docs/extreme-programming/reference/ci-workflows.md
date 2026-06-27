---
title: CI Workflows
layout: default
parent: Reference
grand_parent: Extreme Programming
---

# CI Workflows
{: .no_toc }

Technical description of the GitHub Actions workflows that build and test the "{{ site.title }}"
codebase, step by step.
{: .fs-6 .fw-300 }

For *why* the project runs these workflows, see
[Continuous Integration]({% link extreme-programming/explanation/continuous-integration.md %}).
For the path-filtering pattern they share, see
[GitHub CI Path Filtering]({% link extreme-programming/reference/github-ci-path-filtering.md %}).

## Table of Contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Java Build and Test

Defined in `.github/workflows/java-build-test.yml`. Builds and tests the Java backend.

### Triggers

```yaml
on:
  push:
    branches: [ main ]
    paths:
      - 'backend/**'
      - '.github/workflows/java-build-test.yml'
  pull_request:
    branches: [ main ]
```

- **`push`** runs only when the pushed changes touch `backend/**` or the workflow file itself.
- **`pull_request`** runs on every PR targeting `main` (no `paths` filter); the
  [path-filtering pattern]({% link extreme-programming/reference/github-ci-path-filtering.md %}) decides at run time whether the
  build executes or is skipped, so a required status is always reported.

### `java-build-and-test` job

Runs only when the `filter` job reports backend changes (`if: needs.filter.outputs.backend == 'true'`).

| Step | Action | Notes |
|------|--------|-------|
| Checkout | `actions/checkout@v4` | Clones the repository at the triggering commit. |
| Extract Java version | `mvn help:evaluate -Dexpression=maven.compiler.release -q -DforceStdout` | Reads the Java release from `backend/pom.xml` and writes it to `$GITHUB_OUTPUT`. |
| Set up JDK | `actions/setup-java@v5` | Installs the Eclipse Temurin JDK for the extracted version. `cache: maven` caches `~/.m2`. |
| Build with Maven | `mvn -B package` (in `backend`) | `-B` runs Maven in batch mode. `package` compiles, runs unit tests, and produces the JAR. |
| Upload test results | `actions/upload-artifact@v4` | `if: always()` uploads `backend/target/surefire-reports/` regardless of build outcome. |

### `skip-check` job

Runs when there are no backend changes (`if: needs.filter.outputs.backend != 'true'`). Prints a message and exits
successfully so the required status check passes on PRs that do not touch the backend.

## Frontend Build and Test

Defined in `.github/workflows/frontend-build-test.yml`. Identical in structure to the Java workflow, substituting
`frontend/**` and the `frontend` filter output.

### `react-build-and-test` job

Runs only when the `filter` job reports frontend changes.

| Step | Action | Notes |
|------|--------|-------|
| Checkout | `actions/checkout@v4` | |
| Set up Node.js | `actions/setup-node@v4` | Reads the Node version from `frontend/.nvmrc`. `cache: 'npm'` caches dependencies keyed on `frontend/package-lock.json`. |
| Install dependencies | `npm ci` (in `frontend`) | Installs from `package-lock.json`. |
| Lint | `npm run lint` (in `frontend`) | |
| Build | `npm run build` (in `frontend`) | |
| Run tests | `npm test` (in `frontend`) | |

A `skip-check` job mirrors the Java workflow for PRs that do not touch `frontend/**`.

## Pages deployment

Defined in `.github/workflows/pages.yml`. Builds the Jekyll documentation site and deploys it to GitHub Pages on
every push to `main` under `docs/**`, and on manual `workflow_dispatch`. For setup instructions see
[Publish Docs to GitHub Pages]({% link extreme-programming/how-to/publish-docs-to-github-pages.md %}).

The workflow has two jobs:

| Job | Action | Notes |
|-----|--------|-------|
| `build` | Checkout, `ruby/setup-ruby@v1`, `bundle exec jekyll build`, `actions/upload-pages-artifact@v4` | `bundler-cache: true` installs and caches gems. Builds with the Pages base path and uploads `docs/_site/`. |
| `deploy` | `actions/deploy-pages@v4` | Publishes the artifact to the `github-pages` environment. `needs: build`. |

A `concurrency` group named `pages` with `cancel-in-progress: true` permits only one deployment at a time.
