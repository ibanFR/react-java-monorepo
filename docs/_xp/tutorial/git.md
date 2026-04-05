---
title: GitHub Tutorial
parent: XP Tutorials
---

# Automatically Delete Branches After Merge

{: .no_toc }

Keep your repository clean by configuring GitHub to automatically delete head branches once a pull request is merged.
{: .fs-6 .fw-300 }

## Table of Contents

{: .no_toc .text-delta }

1. TOC
{:toc}

## Overview

When a feature branch is merged into `main`, it has served its purpose. Leaving stale branches around clutters the
repository and can cause confusion about which branches are still active. GitHub provides a built-in setting to
automatically delete the head branch of a pull request as soon as it is merged.

Enabling this setting applies to **all future merges** in the repository — no action is required per pull request.
Any branch that was not automatically deleted (e.g., from merges before the setting was enabled) can be manually
deleted from the **Branches** page or from the closed pull request page.

## Steps

### 1. Open the repository settings

Navigate to the main page of the repository on GitHub and click the **Settings** tab in the top navigation bar.

> You must have **Admin** or **Owner** permissions on the repository to access and change these settings.

### 2. Locate the "Pull Requests" section

Scroll down the *General* settings page until you reach the **Pull Requests** section.

### 3. Enable automatic branch deletion

Check the box labelled **Automatically delete head branches**.

Once enabled, GitHub will automatically delete the head branch of every pull request immediately after it is merged.

### 4. Verify the setting is saved

The change is saved instantly — there is no separate *Save* button for this option. You can confirm it is active
because the checkbox will remain checked after the page is refreshed.

## What happens next

- After each pull request is merged, GitHub deletes the head branch automatically.
- The **merged pull request** page will show a **Restore branch** button, allowing any collaborator to recreate the
  branch if further work is needed (for example, to add a hotfix on top of the same base).
- Branches that are **not yet merged** are never deleted by this setting; only branches whose pull request has been
  fully merged are affected.

## Restoring a deleted branch

If a branch was deleted by mistake, it can be restored from the closed pull request:

1. Navigate to **Pull requests → Closed**.
2. Open the relevant pull request.
3. Click **Restore branch** at the bottom of the conversation timeline.

The branch is recreated at the exact commit SHA it pointed to before deletion.

## Related resources

- [GitHub Docs — Managing the automatic deletion of branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-the-automatic-deletion-of-branches)
- [Commit Message Convention]({{ site.baseurl }}{% link _xp/reference/commit-convention.md %})
