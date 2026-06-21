---
title: Continuous Integration
parent: XP Concepts
---

# Continuous Integration
{: .no_toc }

Why this repository practices continuous integration, the problems it prevents, and the reasoning
behind how the pipelines are shaped.
{: .fs-6 .fw-300 }

For the step-by-step description of each workflow, see
[CI Workflows]({% link _xp/reference/ci-workflows.md %}).
To publish the documentation site, see
[Publish Docs to GitHub Pages]({% link _xp/how-to/publish-docs-to-github-pages.md %}).

## Table of Contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Why continuous integration

Continuous integration is the practice of merging every developer's work into a shared `main` branch frequently —
ideally many times a day — and validating each merge automatically. The alternative, letting branches diverge for
days or weeks, leads to *integration hell*: the longer code stays apart, the more its assumptions drift, and the
harder the eventual merge becomes. Conflicts pile up, and defects that touch more than one change are discovered late,
when they are expensive to untangle.

Automated validation on every push and pull request is what makes frequent integration safe. It shifts the discovery
of build breaks and failing tests from "sometime after merge, on someone's machine" to "within minutes, on a neutral
machine, before merge". `main` stays releasable because nothing reaches it without first proving it compiles and
passes its tests. This is the discipline that lets the rest of the XP practices — small steps, refactoring,
collective ownership — operate without fear.

## Why separate pipelines per stack

This is a monorepo: the Java backend and the React frontend live side by side. They have unrelated toolchains, build
times, and failure modes, so the project runs an independent workflow for each rather than one combined pipeline.

The benefit is isolation and speed. A frontend change does not wait on a Maven build, and a backend failure does not
obscure the state of the frontend. Each stack reports its own status, so a reviewer can see at a glance exactly what
broke. The cost — two workflow files to maintain instead of one — is small and worth paying for the clearer signal.

## Why builds are path-filtered

Running both pipelines on every change would waste minutes of CI time validating code that did not change. So each
workflow is scoped to its own directory: the backend pipeline cares about `backend/**`, the frontend pipeline about
`frontend/**`.

This scoping interacts with branch protection in a way specific to monorepos — a naively skipped workflow reports no
status and can permanently block unrelated pull requests. Why the project filters paths *inside* the workflow rather
than on the trigger is explained in
[GitHub Branch Protection Rationale]({% link _xp/explanation/github-branch-protection-rationale.md %}#required-checks-in-a-monorepo),
and the concrete workflow shape in [GitHub CI Path Filtering]({% link _xp/reference/github-ci-path-filtering.md %}).

## Why the pipelines avoid hardcoded versions

A CI pipeline that pins its own copy of the language version will silently drift from what developers actually use.
When the two disagree, "works on my machine" and "works in CI" stop meaning the same thing — exactly the gap CI exists
to close.

The workflows are deliberately built to derive versions from a single source of truth. The Java pipeline reads the
required JDK from `backend/pom.xml` rather than naming a version in the workflow, and the frontend pipeline reads the
Node version from `frontend/.nvmrc`. There is one place to change a version, and CI follows it automatically. For the
same reason, dependency installs are reproducible: Maven and `npm ci` resolve from committed lockfiles, so a build is
not at the mercy of whatever a registry happens to serve that day.

## Why test results are always preserved

When a build fails, the failure itself is the moment you most need detail — and the moment it is easiest to lose,
because a failing job tends to stop early. The Java workflow uploads its test reports unconditionally, even when the
build fails, so the evidence needed to diagnose a failure survives the run that produced it. Fast, well-reported
feedback is what keeps a red build from sitting unaddressed.

## How it fits the wider workflow

Continuous integration is one half of a pair. CI proves that what is being merged is sound; branch protection ensures
nothing reaches `main` without that proof. The status checks these workflows publish are the inputs that the
protection rules require, and the path-filtering design exists precisely so those two systems cooperate in a monorepo.
Read together with [GitHub Branch Protection Rationale]({% link _xp/explanation/github-branch-protection-rationale.md %}),
they describe a single idea: a default branch that is always green, always releasable, and safe to build on.
