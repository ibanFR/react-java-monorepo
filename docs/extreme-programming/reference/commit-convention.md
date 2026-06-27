---
title: Commit Message Convention
layout: default
parent: Reference
grand_parent: Extreme Programming
---

# Commit Message Convention

This repository uses the Semantic Versioning (SemVer) scheme to dictate how version numbers are assigned and incremented
for software releases of the `{{ site.title }}` software.

The team adheres to a standardized Commit Message Convention to ensure that changes to the codebase are clearly
communicated and that version increments are consistent with the nature of the changes made.

## Declaring the public API

In this repository, the public API is declared through:

- **Backend**: the public REST endpoints exposed by the JAX-RS resources in the
  `backend/src/main/java/com/ibanfr/*/api/`
  layer (e.g. `AuthResource.java`) and the DTOs they consume and produce (e.g. `LoginRequest.java`).
- **Frontend**: the public React page components and API client modules under `frontend/src/pages/` and
  `frontend/src/api/`.

Changes to these public interfaces are carefully managed to ensure that version increments adhere to the SemVer
guidelines.

## Commit Message Format

Each commit message should adhere to the following format:

```
<header>
<BLANK LINE>
<optional body>
<BLANK LINE>
<footer>
```

## Commit Message Header

The commit message header must conform to the following format:

```
<type>: <summary>
  │         │
  │         └─⫸ Summary in present tense. Not capitalized. No period at the end.
  │
  └─⫸ Commit Type: feat|fix|refactor|test|build|ci|docs
```

### Type

Must be one of the following types:

| Type         | Description                                                                                                                     |
|--------------|---------------------------------------------------------------------------------------------------------------------------------|
| **feat**     | A new feature                                                                                                                   |
| **fix**      | A bug fix                                                                                                                       |
| **refactor** | A behavior preserving change (neither fixes a bug nor adds a feature)                                                           |
| **test**     | Adding new tests or refactoring existing ones                                                                                   |
| **docs**     | Documentation only changes                                                                                                      |
| **build**    | Changes that affect the build system or external dependencies (`pom.xml`, `package.json`, `docker-compose.yml`)                 |
| **ci**       | Changes to CI configuration files and scripts (`.github/workflows/java-build-test.yml`, `frontend-build-test.yml`, `pages.yml`) |

### Summary

Use the summary to provide a succinct description of the change:

- Use the imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize the first letter
- No dot (.) at the end

## Commit Message Body (Optional)

The body should explain the motivation for the change. Provide context and details about what was changed and why:

* **What changed:** Describe the specific modifications made to the codebase
* **Why it changed:** Explain the business or technical reason for this change
* **How it impacts the system:** Detail any affected modules, layers, or functionality
* **Related decisions:** Reference any architectural decisions (ADRs) or important design choices

**Example:**

```
refactor: extract auth API client into dedicated module

* Moved fetch logic out of LoginPage into src/api/auth.ts
* Introduced AuthError class to distinguish API errors from network failures
* LoginPage now depends on the auth module, not on fetch directly
* Improves testability — auth module can be mocked independently in component tests

```

