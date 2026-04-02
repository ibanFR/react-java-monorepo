---
title: Continuous Integration
nav_order: 2
---

# Continuous Integration

{: .no_toc }

This repository leverages [GitHub Actions] to automate CI/CD workflows for the "{{ site.title }}"
{: .fs-6 .fw-300 }

With each push to the `main` branch, the workflows defined in the `.github/workflows/` directory are triggered to
build, test, and release the software across its Java and .NET implementations.

## Table of Contents

{: .no_toc .text-delta }

1. TOC
{:toc}

## Java workflow

The [`.github/workflows/java-build-test.yml`]({{ site.repository }}/blob/main/.github/workflows/java-build-test.yml) workflow automates the build and test process for the Java implementation of
the "{{ site.title }}" software. 

This workflow ensures that every code change is automatically validated, helping to
catch bugs early and maintain code quality throughout the development lifecycle.

### Workflow Triggers

The workflow is configured to run automatically whenever code is pushed to either the
`main` or `solution` branches, but only if the changes affect files within the [`java/`]({{ site.repository }}/tree/main/java) directory or the workflow file
itself:

```yaml
on:
  push:
    branches: [ main, solution ]
    paths:
      - 'java/**'
      - '.github/workflows/java-build-test.yml'
  pull_request:
    branches: [ main, solution ]
    paths:
      - 'java/**'
```

Second, it triggers when pull requests are opened or updated targeting these same branches with Java-related
changes. 

This path filtering is an optimization that prevents unnecessary workflow runs when unrelated parts of the
repository are modified.

### Build Matrix Strategy

The workflow employs a matrix strategy to test across different Java versions:

```yaml
strategy:
  matrix:
    java-version: [ '25' ]
```

While currently configured for Java 25 only, the matrix structure allows for easy expansion to test against multiple
Java versions simultaneously. You could add additional versions like `['17', '21', '25']` to ensure compatibility across
different Java releases, which is particularly valuable for libraries intended for broad consumption.

### Environment Setup

The workflow begins by checking out the repository code using `actions/checkout@v4`, which clones the repository at the
specific commit that triggered the workflow. Following this, it configures the Java environment:

```yaml
- name: Set up JDK ${{ matrix.java-version }}
  uses: actions/setup-java@v5
  with:
    java-version: ${{ matrix.java-version }}
    distribution: 'temurin'
    cache: maven
```

This step installs the Eclipse Temurin distribution of Java, which is a popular
open-source JDK. 

The `cache: maven` option is particularly important for performance—it caches Maven dependencies
between workflow runs, significantly reducing build times by avoiding redundant downloads of the same libraries.

### Build and Test Execution

The actual build and test phase is executed using Maven:

```yaml
- name: Build with Maven
  run: mvn -B package
  working-directory: java
```

The `mvn -B package` command runs Maven in batch mode (the `-B` flag), which is ideal for CI environments as it
suppresses interactive output and provides cleaner logs. The `package` goal compiles the code, runs all unit tests, and
packages the application into a JAR file. The `working-directory: java` directive ensures Maven runs in the correct
subdirectory where the [`pom.xml`]({{ site.github.repository_url }}/blob/main/java/pom.xml) file is located.

### Test Results Artifact

Finally, the workflow preserves test results for later analysis:

```yaml
- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: test-results
    path: java/target/surefire-reports/
```

The `if: always()` condition is crucial—it ensures test results are uploaded regardless of whether tests pass or fail.
This allows developers to download and examine detailed test reports even when the build fails, making debugging much
easier. 

The artifacts are stored by GitHub Actions and remain available for download from the workflow run page,
typically for 90 days by default.

## Pages workflow

To publish your software documentation to GitHub Pages, configure your repository by following the steps in
[Publishing with a custom GitHub Actions workflow].

After the configuration is complete, the [`.github/workflows/pages.yml`]({{ site.github.repository_url }}/blob/main/.github/workflows/pages.yml) workflow will automatically build and deploy the
documentation site to GitHub Pages whenever changes under the [`docs/`]({{ site.github.repository_url }}/tree/main/docs) directory are pushed to the `main` branch.

[GitHub Actions]: https://docs.github.com/en/actions

[Using secrets in GitHub Actions]: https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions

[Publishing with a custom GitHub Actions workflow]: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-with-a-custom-github-actions-workflow
