---
title: Recommended GitHub Configurations
parent: XP Tutorials
---

# Recommended GitHub Configurations

{: .no_toc }

A collection of repository settings that improve collaboration and keep the codebase clean on GitHub.
{: .fs-6 .fw-300 }

> You must have **Admin** or **Owner** permissions on the repository to access and change any of the settings below.
> All settings are found under **Settings → General → Pull Requests** unless stated otherwise.

## Table of Contents

{: .no_toc .text-delta }

1. TOC
{:toc}

## Automatically delete head branches

When a feature branch is merged into `main`, it has served its purpose. Leaving stale branches around clutters the
repository and can cause confusion about which branches are still active. GitHub provides a built-in setting to
automatically delete the head branch of a pull request as soon as it is merged.

Enabling this setting applies to **all future merges** in the repository — no action is required per pull request.
Any branch that was not automatically deleted (e.g., from merges before the setting was enabled) can be manually
deleted from the **Branches** page or from the closed pull request page.

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

Keeping pull request branches up-to-date reduces merge conflicts and ensures that CI runs against the most recent
state of `main`.

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

The default branch (`main`) is the source of truth for the project. Without protection, any collaborator with write
access can rewrite its history with a force push or delete it entirely — actions that are very difficult to recover from
and can corrupt the shared history for every contributor.

### Why this matters

| Risk | Consequence |
|------|-------------|
| **Force push** | Rewrites the commit history of `main`. Other contributors' local clones now diverge from the remote, causing confusing conflicts or silent data loss. CI runs attached to the overwritten commits disappear from the audit trail. |
| **Branch deletion** | The `main` branch reference is removed from the remote. Any open pull request targeting `main` is immediately closed, and the default branch of the repository becomes undefined until it is recreated. |

Enabling these two protections is a minimal, zero-friction safeguard: it does not require status checks to pass, does
not block any normal merge workflow, and takes effect instantly.

> If GitHub shows the advisory message *"Protect this branch from force pushing or deletion, or require status checks
> before merging"* on your branch protection rule, enabling the two settings below is the lightweight way to satisfy
> that warning without turning on required status checks.

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
