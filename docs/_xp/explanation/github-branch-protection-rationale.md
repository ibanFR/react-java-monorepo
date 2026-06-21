---
title: GitHub Branch Protection Rationale
parent: XP Concepts
---

# GitHub Branch Protection Rationale
{: .no_toc }

Why the recommended repository protections exist, the risks they mitigate, and how they interact
with continuous integration in a monorepo.
{: .fs-6 .fw-300 }

To apply these settings, follow
[Configure GitHub Repository Protection]({% link _xp/how-to/configure-github-repository-protection.md %}).

## Table of Contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Force-push and deletion risks
{: #force-push-and-deletion-risks }

The default branch (`main`) is the source of truth for the project. Without protection, any collaborator with write
access can rewrite its history with a force push or delete it entirely — actions that are very difficult to recover from
and can corrupt the shared history for every contributor.

| Risk | Consequence |
|------|-------------|
| **Force push** | Rewrites the commit history of `main`. Other contributors' local clones now diverge from the remote, causing confusing conflicts or silent data loss. CI runs attached to the overwritten commits disappear from the audit trail. |
| **Branch deletion** | The `main` branch reference is removed from the remote. Any open pull request targeting `main` is immediately closed, and the default branch of the repository becomes undefined until it is recreated. |

Enabling these two protections is a minimal, zero-friction safeguard: it does not require status checks to pass, does
not block any normal merge workflow, and takes effect instantly.

> If GitHub shows the advisory message *"Protect this branch from force pushing or deletion, or require status checks
> before merging"* on your branch protection rule, enabling the two settings is the lightweight way to satisfy
> that warning without turning on required status checks.

## Why required status checks matter

A status check is a signal that a CI job reports back to GitHub after running on a pull request. GitHub can be
configured to **block merges** until specific status checks have passed. This turns the CI pipeline from an
informational indicator into an enforced quality gate: no code reaches `main` unless it has been built and tested.

Without required status checks, a pull request can be merged even when CI is red — or when CI never ran at all.
This allows broken code to reach `main`, defeats the purpose of the CI pipeline, and often creates extra work
restoring a stable state.

## Required checks in a monorepo
{: #required-checks-in-a-monorepo }

In a monorepo, a second problem appears. GitHub's native `paths` filter on the `pull_request` trigger silently
**skips the entire workflow** when none of the listed paths are changed. A skipped workflow reports no status to
GitHub, so GitHub treats the check as absent rather than as passed. If that check is listed as required, the pull
request is permanently blocked — even for changes that genuinely do not need that job to run (for example, a
documentation-only change that does not touch `backend/**`).

The fix is to keep the `pull_request` trigger unconditional and move the path logic **inside** the workflow, so every
pull request runs the workflow and the workflow itself decides whether to build or to report a lightweight passing
`skip-check`. Either way GitHub always receives a green status for the required check, so the branch protection rule is
satisfied without blocking unrelated pull requests. The concrete workflow shape is documented in
[GitHub CI Path Filtering]({% link _xp/reference/github-ci-path-filtering.md %}).

## Why require a pull request before merging
{: #paths-to-main }

Required status checks only apply to pull request merges. A collaborator with write access can still push commits
directly to `main`, bypassing CI entirely. Requiring a pull request before merging closes this gap: direct pushes
are rejected, so every change must arrive via a PR — and therefore must pass the required status checks.

| Path to `main` | Goes through status checks? |
|----------------|----------------------------|
| Direct `git push origin main` | ❌ No — the push lands immediately |
| Pull request with **no** required status checks | ❌ No — the merge button is always active |
| Pull request **with** required status checks, but direct push still allowed | ❌ Partial — PRs are gated, but direct pushes bypass everything |
| Pull request **with** required status checks **and** direct push blocked | ✅ Yes — every commit on `main` has a successful build |

Once direct pushes to `main` are blocked, the `push` trigger in the CI workflows only fires from the merge commit that
GitHub creates when a PR is merged, never from a direct push — which makes it a reliable hook for post-merge steps such
as tagging a release or deploying to an environment.
