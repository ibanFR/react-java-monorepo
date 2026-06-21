# AGENTS.md

Shared instructions for any AI coding agent (Claude Code, GitHub Copilot, etc.) working in this repository. Tool-specific entry points (`CLAUDE.md`, `.github/copilot-instructions.md`) reference this file — keep generic guidance here, not duplicated there.

## Repository layout

Full-stack monorepo with three **independently built** modules — there is **no root-level build system** (no Nx/Turborepo/Lerna); manage each module on its own:

| Directory       | Stack                                      | Purpose                            |
|-----------------|--------------------------------------------|------------------------------------|
| `frontend/`     | React 19 + TypeScript + Vite 8             | Single-page login UI               |
| `backend/`      | Java 25 + Quarkus 3.34 + Hibernate/Panache | REST API with hexagonal/DDD design |
| `docs/`         | Jekyll (Ruby) + just-the-docs              | GitHub Pages documentation site    |
| `architecture/` | Structurizr DSL (`workspace.dsl`)          | C4 model + ADRs (`architecture/decisions/`) |

## Commands

Run module commands from inside the module directory.

### Frontend (`frontend/`)
```bash
npm install          # required before first build/test/lint
npm run dev          # Vite dev server → http://localhost:5173
npm run lint         # ESLint 9 flat config (eslint.config.js)
npm run build        # tsc -b + Vite production build
npm test             # Vitest run-once (jsdom)
npx vitest run src/pages/LoginPage.test.tsx   # single test file
npx vitest -t "name"                          # single test by name
```

### Backend (`backend/`)
```bash
mvn quarkus:dev      # dev mode w/ hot-reload → http://localhost:8080 (Swagger UI at /swagger-ui)
mvn -B test          # unit tests (Quarkus boots on port 8081 in test profile)
mvn -B package       # build JAR (runs tests)
mvn test -Dtest=AuthResourceTest               # single test class
mvn test -Dtest=AuthResourceTest#methodName    # single test method
```
`./mvnw` wrapper exists; system Maven also works. `*IT` integration tests (`@QuarkusIntegrationTest`) are skipped by default (`skipITs=true`).

### Docs (`docs/`)
Built by the `pages.yml` GitHub Actions workflow (Jekyll). No local build needed for code changes; editing `docs/` Markdown is sufficient.

### Docker
`docker compose up` runs both services. Backend JAR must be built first: `cd backend && mvn package -DskipTests`. Backend image: `backend/src/main/docker/Dockerfile.jvm` (port 8080); frontend: `node:22-alpine` volume mount (port 5173).

## Backend architecture (hexagonal / DDD)

All sources under `backend/src/main/java/com/ibanfr/<context>/` (currently only `auth`). Each bounded context is layered the same way; dependencies point inward toward `domain`:

| Layer          | Package                           | Examples                          | Role                                  |
|----------------|-----------------------------------|-----------------------------------|---------------------------------------|
| Domain         | `domain`                          | `User` (JPA entity), `UserRepository` (iface) | Aggregate root + repository **port** |
| Application    | `application`                     | `AuthService`, `LoginResult` (VO) | Use-case orchestration                |
| Infrastructure | `infrastructure.adapters.in.rest` | `AuthResource`, `LoginRequest`    | JAX-RS **primary/inbound** adapter at `/api/auth/` |
| Infrastructure | `infrastructure.adapters.out.jpa` | `JpaUserRepository`               | Panache **secondary/outbound** adapter (implements the port) |

- The domain defines `UserRepository` as a port; the JPA adapter implements it. Keep persistence/Hibernate concerns out of `domain`/`application`.
- `LoginResult` is a value object returned by `AuthService.login()`; `LoginRequest` is the REST DTO with `@NotBlank` validation.
- `AuthResource` translates HTTP into application use-case calls. Sole endpoint: `POST /api/auth/login`.
- DI via Jakarta annotations (`@ApplicationScoped`, `@Inject`); DTO validation via Jakarta Validation (`@NotBlank`); Javadoc on public classes/methods.
- DB: H2 in-memory for dev/test (`jdbc:h2:mem:authdb`, seeded by `src/main/resources/import.sql`). Production = swap `quarkus.datasource.*` in `application.properties` to PostgreSQL, **no code changes**.
- Tests: `AuthResourceTest` (`@QuarkusTest`, REST-assured, Quarkus on port 8081); `AuthResourceIT` (`@QuarkusIntegrationTest`, packaged mode, skipped by default).

## Frontend architecture

Entry: `src/main.tsx` (ReactDOM root + StrictMode) → `App.tsx` → `src/pages/LoginPage.tsx`. Functional components with named exports (`export function LoginPage`); CSS co-located per component; TS strict mode. Tests use Vitest + React Testing Library + jsdom, configured under the `test` key in `vite.config.ts` (`globals: true`, setup in `src/setupTests.ts`). Test files co-located as `*.test.tsx`. ESLint flat config lints only `**/*.{ts,tsx}`; `dist/` ignored.

## CI

Path-filtered GitHub Actions on push/PR to `main`: `java-build-test.yml` (backend, `mvn -B package`), `frontend-build-test.yml` (lint+build+test), `pages.yml` (Jekyll deploy on `docs/**`). The Java workflow reads the JDK version from `pom.xml`'s `maven.compiler.release`.

## Conventions (enforced)

- **Branch naming**: every coding task starts on a new branch `<JIRA-ID>-<short-kebab-description>` (e.g. `AUTH-42-add-logout-endpoint`), branched off `main` unless told otherwise. If no Jira ID is given, ask for one before starting.
- **Commits** (`.github/git-commit-instructions.md`): format `<type>: <summary>` where type is `feat|fix|refactor|test|build|ci|docs`. Use `feat`/`fix`/`refactor` **only** when production code changes (`backend/src/main/java/`, `frontend/src/` excluding tests). Summary in imperative, lowercase, no trailing period; include filenames when relevant. Always include a body with bullet points (what/why/impact). Footer **must** contain the Jira link `https://ibanfr.atlassian.net/browse/<JIRA-ID>` extracted from the branch name.
- The repo follows XP / Trunk-Based Development practices (see `docs/_xp/`): integrate to mainline frequently, keep the build green.

## Atlassian Rovo MCP

When connected to atlassian-rovo-mcp:
- **MUST** use Jira project key = GAUZ
- **MUST** use cloudId = "https://ibanfr.atlassian.net" (do NOT call getAccessibleAtlassianResources)
- **MUST** keep search result sets small: pass `limit: 10` for Confluence CQL searches. For Jira JQL searches the tool enforces a 50–100 range, so pass `maxResults: 50` (the minimum).

