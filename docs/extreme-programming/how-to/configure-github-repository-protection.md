---
title: Configure GitHub Repository Protection
layout: default
parent: How-to Guides
grand_parent: Extreme Programming
---

# Configure GitHub Repository Protection
{: .no_toc }

How to apply a set of repository settings that keep the codebase clean and protect the
default branch on GitHub.
{: .fs-6 .fw-300 }

> You must have **Admin** or **Owner** permissions on the repository to access and change any of the settings below.
> All settings are found under **Settings → General → Pull Requests** unless stated otherwise.

For the reasoning behind these settings, see
[GitHub Branch Protection Rationale]({% link extreme-programming/explanation/github-branch-protection-rationale.md %}).
For the CI path-filtering pattern these rules depend on, see
[GitHub CI Path Filtering]({% link extreme-programming/reference/github-ci-path-filtering.md %}).

## Table of Contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Automatically delete head branches

When a feature branch is merged into `main`, it has served its purpose. Enable GitHub's built-in
setting to delete the head branch of a pull request as soon as it is merged. The setting applies to
**all future merges** — no action is required per pull request.

### Steps

1. Navigate to the main page of the repository on GitHub and click the **Settings** tab.
2. Scroll down the *General* settings page to the **Pull Requests** section.
3. Check the box labelled **Automatically delete head branches**.

The change is saved instantly — there is no separate *Save* button for this option.

### What happens next

- After each pull request is merged, GitHub deletes the head branch automatically.
- The **merged pull request** page will show a **Restore branch** button, allowing any collaborator to recreate the
  branch if further work is needed (for example, to add a hotfix on top of the same base).
- Branches that are **not yet merged** are never deleted by this setting; only branches whose pull request has been
  fully merged are affected.

### Restoring a deleted branch

If a branch was deleted by mistake, it can be restored from the closed pull request:

1. Navigate to **Pull requests → Closed**.
2. Open the relevant pull request.
3. Click **Restore branch** at the bottom of the conversation timeline.

The branch is recreated at the exact commit SHA it pointed to before deletion.

**Reference:** [Managing the automatic deletion of branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-the-automatic-deletion-of-branches)

---

## Always suggest updating pull request branches

When a pull request's base branch receives new commits after the pull request was opened, the head branch may fall
behind. GitHub can display a prominent **Update branch** button on every open pull request to remind contributors to
rebase or merge the latest changes before their PR is reviewed or merged.

### Steps

1. Navigate to the main page of the repository on GitHub and click the **Settings** tab.
2. Scroll down the *General* settings page to the **Pull Requests** section.
3. Check the box labelled **Always suggest updating pull request branches**.

The change is saved instantly.

### What happens next

- GitHub displays an **Update branch** button on every open pull request whose head branch is behind the base branch.
- Contributors can click **Update branch** to merge the base branch into their head branch directly from the pull
  request page — no local rebase is required.
- The suggestion is informational; contributors are not forced to update before merging.

**Reference:** [Keeping your pull request in sync with the base branch](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/keeping-your-pull-request-in-sync-with-the-base-branch)

---

## Protect the default branch against force pushes and deletion

Protect the default branch (`main`) from history rewrites and accidental deletion. For why these two protections
matter, see [GitHub Branch Protection Rationale]({% link extreme-programming/explanation/github-branch-protection-rationale.md %}#force-push-and-deletion-risks).

### Steps

All settings are found under **Settings → Branches → Branch protection rules**. Edit (or create) the rule that applies
to `main` (or your default branch pattern).

1. Navigate to the main page of the repository on GitHub and click the **Settings** tab.
2. In the left sidebar click **Branches**, then click **Edit** next to the rule for `main` (or **Add branch protection
   rule** if none exists yet, entering `main` as the branch name pattern).
3. Scroll to the **Push restrictions** section and check **Do not allow bypassing the above settings** if you want the
   protection to apply even to administrators.
4. Check **Restrict force pushes** — this blocks all `git push --force` and `git push --force-with-lease` commands
   targeting the protected branch.
5. Check **Do not allow deletions** — this prevents the branch from being deleted via the GitHub UI, the API, or the
   command line.
6. Click **Save changes**.

### What happens next

- Any attempt to force-push to `main` is rejected by GitHub with the error:
  `remote: error: GH006: Protected branch update failed, force push prohibited.`
- Any attempt to delete `main` via `git push origin --delete main` or the GitHub UI is blocked.
- Normal pushes and pull request merges are **not affected** — only destructive rewrites and deletions are prevented.
- Repository admins can still perform force pushes or deletions if the **Allow force pushes** option is granted to
  admins, but checking **Do not allow bypassing the above settings** disables even that escape hatch.

**Reference:** [About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)

---

## Require status checks before merging

Configure GitHub to **block merges** until specific CI status checks have passed, turning the CI pipeline into an
enforced quality gate. This rule depends on the in-workflow path-filtering pattern described in
[GitHub CI Path Filtering]({% link extreme-programming/reference/github-ci-path-filtering.md %}); for why trigger-level `paths`
filters break required checks in a monorepo, see
[GitHub Branch Protection Rationale]({% link extreme-programming/explanation/github-branch-protection-rationale.md %}#required-checks-in-a-monorepo).

### Steps

All settings are found under **Settings → Branches → Branch protection rules**. Edit (or create) the rule for `main`.

1. Navigate to the repository **Settings** tab.
2. In the left sidebar click **Branches**, then click **Edit** next to the `main` rule (or create a new rule).
3. Check **Require status checks to pass before merging**.
4. In the search box that appears, type the name of each job you want to require and select it:
   - `java-build-and-test`
   - `react-build-and-test`

   > **Do not add `skip-check`.** When a required job is skipped (because no relevant files changed),
   > GitHub automatically counts it as passing. Adding `skip-check` as a required check is not needed
   > and would cause PRs to be blocked whenever only one stack's files are changed (since `skip-check`
   > for the other stack would be skipped but not passing from GitHub's perspective).
5. Optionally check **Require branches to be up to date before merging** to ensure CI always runs against the latest
   base branch.
6. Click **Save changes**.

> **Tip:** the job name used in the branch protection rule must match the job `id` in the workflow YAML exactly
> (case-sensitive). GitHub will not offer auto-complete for jobs that have never run, so trigger the workflow at least
> once — by opening a draft pull request — before configuring the rule.

### What happens next

- GitHub blocks the merge button until all required checks report green.
- A PR that breaks the backend build will show a red `java-build-and-test` check and cannot be merged.
- A documentation-only PR will see `skip-check` pass for both workflows and can be merged immediately.

See the [status-reporting matrix]({% link extreme-programming/reference/github-ci-path-filtering.md %}#status-reporting-matrix)
for the exact outcome of each change scenario.

**Reference:** [About required status checks](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-required-status-checks)

---

## Require a pull request before merging

Require a pull request before merging so that direct pushes to `main` are rejected and every change must pass the
required status checks. For the gap this closes, see
[GitHub Branch Protection Rationale]({% link extreme-programming/explanation/github-branch-protection-rationale.md %}#paths-to-main).

### Steps

All settings are found under **Settings → Branches → Branch protection rules**. Edit (or create) the rule for `main`.

1. Navigate to the repository **Settings** tab.
2. In the left sidebar click **Branches**, then click **Edit** next to the `main` rule.
3. Check **Require a pull request before merging**.
4. Optionally increase **Required number of approvals** if your team practices peer review.
5. Click **Save changes**.

> Combine this rule with the **Require status checks to pass before merging** setting (see the section above) to
> ensure every commit on `main` has been built and tested before it arrives.

### What happens next

- Any attempt to push directly to `main` is rejected by GitHub with the error:
  `remote: error: GH006: Protected branch update failed, direct push to protected branch not allowed.`
- All changes must be submitted as pull requests. The PR is only mergeable once all required status checks report
  green.
- Repository admins retain the ability to bypass the rule unless **Do not allow bypassing the above settings** is
  also checked.
- The `push` trigger in the CI workflows continues to function: when a PR is merged, GitHub creates a merge commit
  on `main`, which fires the `push` event. The workflows use this for any post-merge steps (for example, tagging a
  release or deploying to an environment).

**Reference:** [About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches#require-pull-requests-before-merging)
