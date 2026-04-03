# Copilot Cloud Agent Instructions

## Repository Overview

This is a **full-stack monorepo** with three independent modules:

| Directory | Stack | Purpose |
|-----------|-------|---------|
| `frontend/` | React 19 + TypeScript + Vite 8 | Single-page application (login UI) |
| `backend/` | Java 17 + Quarkus 3.8 + Hibernate/Panache | REST API with DDD architecture |
| `docs/` | Jekyll (Ruby) + just-the-docs theme | GitHub Pages documentation site |

The modules are **independently built and tested** — there is no root-level build system.

---

## Quick Reference — Build, Test, Lint

### Frontend (`frontend/`)

```bash
cd frontend
npm install          # Install dependencies (required before first build/test/lint)
npm run lint         # ESLint (flat config in eslint.config.js)
npm run build        # TypeScript compilation + Vite production build
npm test             # Vitest (run once) — uses jsdom environment
npm run dev          # Vite dev server on http://localhost:5173
```

### Backend (`backend/`)

```bash
cd backend
mvn -B test          # Compile + run unit tests (Quarkus starts on port 8081 in test profile)
mvn -B package       # Build JAR (includes tests)
mvn quarkus:dev      # Dev mode on http://localhost:8080 (hot-reload)
```

The Maven wrapper (`./mvnw`) is available but the system Maven works fine.

### Docs (`docs/`)

The docs site is built by a GitHub Actions workflow (`pages.yml`) using Jekyll. There is no local build needed for code changes; edits to `docs/` Markdown files are sufficient.

---

## Architecture — Backend (DDD / Hexagonal)

All backend Java source is under `backend/src/main/java/com/ibanfr/auth/`:

| Layer | Package | Key Classes | Responsibility |
|-------|---------|------------|----------------|
| **Domain** | `domain` | `User` (JPA entity), `UserRepository` (interface) | Aggregate root + repository port |
| **Application** | `application` | `AuthService`, `LoginResult` | Use-case orchestration |
| **Infrastructure** | `infrastructure.adapters.in.rest` | `AuthResource`, `LoginRequest` | JAX-RS primary (inbound) adapter at `/api/auth/` |
| **Infrastructure** | `infrastructure.adapters.out.jpa` | `JpaUserRepository` | Panache secondary (outbound) adapter implementing `UserRepository` |

**Key conventions:**
- `UserRepository` is a domain interface (port); `JpaUserRepository` is the secondary (outbound) adapter in `infrastructure.adapters.out.jpa`.
- `LoginResult` is a value object returned by `AuthService.login()`.
- `LoginRequest` is the REST-layer DTO with `@NotBlank` validation, located in `infrastructure.adapters.in.rest`.
- `AuthResource` is the primary (inbound) adapter; it translates HTTP requests into application use-case calls.
- The single REST endpoint is `POST /api/auth/login`.

### Database

- **Dev/Test**: H2 in-memory (`jdbc:h2:mem:authdb`), auto-created tables, seeded by `backend/src/main/resources/import.sql`.
- **Production**: Swap `quarkus.datasource.*` properties to PostgreSQL (no code changes).
- Config: `backend/src/main/resources/application.properties`.

### Backend Tests

- `AuthResourceTest` — `@QuarkusTest` integration tests using REST-assured; Quarkus boots on port **8081** during testing.
- `AuthResourceIT` — `@QuarkusIntegrationTest` that re-runs the same tests in packaged mode (skipped by default; `skipITs=true`).

---

## Architecture — Frontend

Entry point: `frontend/src/main.tsx` → `App.tsx` → `LoginPage`.

| File | Purpose |
|------|---------|
| `src/main.tsx` | ReactDOM root render with StrictMode |
| `src/App.tsx` | Root component — renders `<LoginPage />` |
| `src/pages/LoginPage.tsx` | Login form (username/password) — submit handler is a stub |
| `src/pages/LoginPage.css` | Scoped styles for the login card |
| `src/setupTests.ts` | Vitest setup — imports `@testing-library/jest-dom`, runs `cleanup()` after each test |

### Frontend Tests

Tests use **Vitest** + **React Testing Library** + **jsdom**.

- Test config is in `vite.config.ts` under the `test` key (using Vitest's Vite plugin integration).
- `globals: true` is set so `describe`, `it`, `expect` are available without imports.
- Test files follow the `*.test.tsx` co-location pattern next to their components.

### Linting

ESLint 9 flat config (`eslint.config.js`) with:
- `typescript-eslint` recommended rules
- `eslint-plugin-react-hooks` (flat recommended)
- `eslint-plugin-react-refresh` (Vite config)
- Only `**/*.{ts,tsx}` files are linted; `dist/` is ignored.

---

## CI / GitHub Actions Workflows

| Workflow | File | Triggers | What it does |
|----------|------|----------|-------------|
| Java Build and Test | `.github/workflows/java-build-test.yml` | Push/PR to `main`/`solution` touching `backend/**` | Sets up JDK 25, runs `mvn -B package` in `backend/` |
| Frontend Build and Test | `.github/workflows/frontend-build-test.yml` | Push/PR to `main`/`solution` touching `frontend/**` | Sets up Node.js, runs lint, build, and tests in `frontend/` |
| Deploy Jekyll to Pages | `.github/workflows/pages.yml` | Push to `main` touching `docs/**` | Builds Jekyll site, deploys to GitHub Pages |

---

## Known Issues and Workarounds

### 1. CI uses JDK 25 while pom.xml targets Java 17

The CI workflow (`java-build-test.yml`) uses `java-version: '25'` in its matrix, while `pom.xml` sets `maven.compiler.release=17`. This works because JDK 25 can compile Java 17 source, but be aware of this version mismatch when debugging CI issues.

---

## Docker

`docker-compose.yml` at the repo root orchestrates both services:
- **backend**: Built from `backend/src/main/docker/Dockerfile.jvm`, exposed on port 8080.
- **frontend**: Uses `node:22-alpine`, mounts `frontend/` volume, exposed on port 5173.
- Backend must be built first: `cd backend && mvn package -DskipTests`.

---

## Coding Conventions

- **Backend**: Standard Java conventions; Javadoc comments on public classes/methods; Jakarta EE annotations for DI (`@Inject`, `@ApplicationScoped`); Jakarta Validation (`@NotBlank`) on DTOs.
- **Frontend**: Functional React components; named exports (`export function LoginPage`); CSS files co-located with components; TypeScript strict mode enabled.
- **No monorepo tooling** (no Nx, Turborepo, or Lerna) — each module is managed independently.

---

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
