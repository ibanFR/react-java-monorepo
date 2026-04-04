## Commit Message Convention

This repository follows [Semantic Versioning (SemVer)](https://semver.org/) and uses a standardized commit message format to ensure changes are clearly communicated and version increments are consistent.

### Public API (for SemVer purposes)

- **Backend**: The public REST endpoints in `backend/src/main/java/com/ibanfr/*/infrastructure/adapters/in/rest/` (e.g. `AuthResource.java`) and the DTOs they consume/produce (e.g. `LoginRequest.java`).
- **Frontend**: The public React page components and API client modules under `frontend/src/pages/` and `frontend/src/api/`.

### Commit Message Format

```
<header>
<BLANK LINE>
<optional body>
<BLANK LINE>
<footer>
```

### Commit Message Header

```
<type>: <summary>
  │         │
  │         └─⫸ Summary in present tense. Not capitalized. No period at the end.
  │
  └─⫸ Commit Type: feat|fix|refactor|test|build|ci|docs
```

#### Type

| Type         | Description                                                                                                                     |
|--------------|---------------------------------------------------------------------------------------------------------------------------------|
| **feat**     | A new feature                                                                                                                   |
| **fix**      | A bug fix                                                                                                                       |
| **refactor** | A behavior preserving change (neither fixes a bug nor adds a feature)                                                           |
| **test**     | Adding new tests or refactoring existing ones                                                                                   |
| **docs**     | Documentation only changes                                                                                                      |
| **build**    | Changes that affect the build system or external dependencies (`pom.xml`, `package.json`, `docker-compose.yml`)                 |
| **ci**       | Changes to CI configuration files and scripts (`.github/workflows/java-build-test.yml`, `.github/workflows/pages.yml`)          |

#### Summary

- Use the imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize the first letter
- No dot (.) at the end

### Commit Message Body (Optional)

The body should explain the motivation for the change:

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