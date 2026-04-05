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

Use **`feat`**, **`fix`**, or **`refactor`** only when **production code** is changed. Production code is anything built and shipped to users:
- Java sources under `backend/src/main/java/`
- TypeScript sources under `frontend/src/` (excluding test files)

For all other changes, use the most specific type below:

| Type         | Description                                                                                                                                          |
|--------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| **feat**     | A new feature — **production code only**                                                                                                             |
| **fix**      | A bug fix — **production code only**                                                                                                                 |
| **refactor** | A behavior-preserving change — **production code only** (neither fixes a bug nor adds a feature)                                                     |
| **test**     | Adding or updating tests (use for any test file change, e.g. `LoginPage.test.tsx`, `AuthResourceTest.java`)                                          |
| **docs**     | Documentation only changes                                                                                                                           |
| **build**    | Changes that affect the build system or external dependencies (`pom.xml`, `package.json`, `docker-compose.yml`)                                      |
| **ci**       | Changes to CI configuration files and scripts (`.github/workflows/java-build-test.yml`, `.github/workflows/pages.yml`)                               |

#### Summary

- Use the imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize the first letter
- No dot (.) at the end
- **Include filenames in the summary when relevant**
  - Prefer: `docs: improve formatting in 01-context.md and 02-containers.md`
  - Over: `docs: improve formatting in context and containers documentation`
  - Prefer: `test: add edge case coverage in LoginPage.test.tsx`
  - Over: `test: add edge case coverage in login page tests`

### Commit Message Body

**Always include a commit message body.** Use bullet points to explain the change:

- **What changed:** Describe the specific modifications made to the codebase — **include the filename(s)** in each 
bullet point when relevant
- **Why it changed:** Explain the business or technical reason for this change
- **How it impacts the system:** Detail any affected modules, layers, or functionality
- **Related decisions:** Reference any architectural decisions (ADRs) or important design choices

**Example — prefer (filenames in body bullets):**

```
docs: improve formatting in 01-context.md and 02-containers.md

* Adjusted line breaks for better readability in user and dependency sections in 01-context.md
* Enhanced table formatting for clarity in 02-containers.md
* Aims to provide a more consistent and user-friendly documentation experience
```

**Instead of (no filenames in body bullets):**

```
docs: improve formatting in 01-context.md and 02-containers.md

* Adjusted line breaks for better readability in user and dependency sections
* Enhanced table formatting for clarity in containers documentation
* Aims to provide a more consistent and user-friendly documentation experience
```