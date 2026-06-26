---
title: Publish Docs to GitHub Pages
layout: default
parent: How-to Guides
grand_parent: Extreme Programming
---

# Publish Docs to GitHub Pages
{: .no_toc }

How to publish this repository's documentation site to GitHub Pages using the bundled
`pages.yml` workflow.
{: .fs-6 .fw-300 }

> You must have **Admin** or **Owner** permissions on the repository to change the Pages settings below.

## Table of Contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Configure the publishing source

1. On GitHub, go to **Settings → Pages**.
2. Under **Build and deployment → Source**, select **GitHub Actions**.

This tells GitHub to publish from a workflow rather than from a branch. The repository already includes the
workflow that does the build and deploy, so no further configuration is needed. For the official reference, see
[Publishing with a custom GitHub Actions workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-with-a-custom-github-actions-workflow).

## Trigger a deployment

Once the source is set to **GitHub Actions**, the `.github/workflows/pages.yml` workflow runs automatically
whenever changes under `docs/` are pushed to `main`:

```yaml
on:
  push:
    branches: ["main"]
    paths:
      - "docs/**"
  workflow_dispatch:
```

To deploy without pushing a change — for example, after editing the Pages settings — run it manually:

1. Go to the **Actions** tab.
2. Select **Deploy Jekyll site to Pages**.
3. Click **Run workflow** and choose the `main` branch.

## Verify the deployment

1. Open the **Actions** tab and confirm the latest **Deploy Jekyll site to Pages** run succeeded.
2. The published URL is shown on the workflow run's `deploy` job and under **Settings → Pages**.

For a breakdown of the workflow's `build` and `deploy` jobs, see
[CI Workflows]({% link extreme-programming/reference/ci-workflows.md %}#pages-deployment).
