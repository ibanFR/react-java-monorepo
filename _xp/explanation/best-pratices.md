# Continuous Integration — Best Practices

## 1. Commit frequently to the mainline

Developers integrate code into the shared branch **at least once per day**.
Long-lived feature branches delay integration and compound merge conflicts.
Use **feature flags** to ship incomplete work safely without blocking integration.

## 2. Every commit triggers an automated build and test

CI runs on **every push**, not just on PRs or merges.
The pipeline must deliver fast feedback — target **< 10 minutes** for the core loop.
Slow tests are parallelised or deferred to a separate nightly pipeline.

## 3. Keep the build green — fix broken builds immediately

A broken `main` build is a **team-wide priority**, not an individual problem.
If it cannot be fixed quickly, **revert** the commit rather than leaving the build red.
No one commits on top of a broken build.

## 4. Test at multiple levels (the test pyramid)

```
        /\
       /E2E\          ← few, slow, expensive
      /------\
     /Integr. \       ← moderate
    /------------\
   /  Unit Tests  \   ← many, fast, cheap
  /________________\
```

- **Unit tests** are the foundation: fast, isolated, and numerous.
- **Integration tests** verify component interactions (e.g. REST layer ↔ database).
- **End-to-end tests** are sparse and targeted at critical user journeys.

## 5. Build artifacts once, promote through environments

Build the artifact **once** from source, then promote that exact binary through
dev → staging → production.
Never rebuild from source per environment — what you tested must be what you ship.

## 6. Automate everything — no manual steps in CI

Linting, static analysis, security scanning, test execution, and artifact packaging
are all automated.
Human approval gates belong in **CD** (deployment), not **CI** (integration).

## 7. Make the pipeline visible and actionable

- Failures notify the team immediately (Slack, email, GitHub status checks).
- Pipeline status is always visible on the repository (branch protection badges).
- Failure logs include enough context to diagnose without re-running.

## 8. Test in a production-like environment

- CI runs against ephemeral, isolated environments — not a shared dev server.
- Dependencies (databases, queues) are spun up as containers or in-process mocks.
- Configuration mirrors production as closely as possible.

## 9. Enforce quality gates — don't ship what fails

- **Branch protection rules** prevent merging code that has not passed CI.
- Code coverage thresholds, linting, and security scans are required checks.
- Developers cannot bypass the pipeline under normal circumstances.

## 10. Maintain the pipeline as production code

- Workflow files live in version control alongside application code.
- Pipeline changes go through the same review process as application changes.
- Action versions and base images are pinned to avoid unexpected breakage.

---

## Trunk-Based Development — What Would Need to Be Done

Trunk-based development (TBD) is the branching model that underpins effective CI.
Everyone integrates directly into `main` (the "trunk") frequently, keeping the
mainline always releasable.

### What is currently in place

| Practice | Status |
|---|---|
| Automated build + test on push to `main` | ✅ Both `java-build-test.yml` and `frontend-build-test.yml` run on push |
| Path filtering to skip irrelevant jobs | ✅ `dorny/paths-filter` used in workflows |
| Separate, fast pipelines per module | ✅ Frontend and backend pipelines are independent |
| Test results uploaded as artifacts | ✅ `actions/upload-artifact` used |

### What would need to be added

#### 1. Branch protection on `main`

Configure GitHub branch protection rules for `main`:
- Require status checks to pass before merging (select both CI workflows as required checks).
- Require branches to be up to date before merging.
- Disallow direct pushes to `main` (force all changes through PRs).
- Optionally require at least one approving review.

#### 2. Short-lived feature branches with a strict merge cadence

Establish a team norm that feature branches:
- Live for **at most 1–2 days** before merging.
- Are rebased (or merged) onto the latest `main` before opening a PR.
- Are deleted immediately after merge.

#### 3. Feature flags for incomplete work

Add a lightweight feature flag mechanism (e.g. an environment variable or a
config-driven flag) so that work-in-progress can be integrated into `main`
without being exposed to users.
This removes the need for long-lived branches while keeping `main` releasable.

#### 4. Enforce conventional commit discipline

Add a commit-message linter (e.g. `commitlint` with `husky` pre-commit hook or a
GitHub Actions workflow step) to validate that every commit follows the project's
commit message convention.
This keeps the `main` history clean and enables automated changelog generation.

#### 5. Automated rollback / revert policy

Document and automate the revert process:
- If a CI run on `main` goes red, the breaking commit is reverted automatically
  or within a defined SLA (e.g. 15 minutes).
- Consider a GitHub Actions workflow that opens an automatic revert PR when the
  `main` build fails.

#### 6. Developer local pre-push hooks

Add a `pre-push` git hook (via `husky` for the frontend, or a Maven plugin for the
backend) that runs the fast subset of tests locally before pushing.
This catches obvious failures before they hit CI and keeps the build green.
