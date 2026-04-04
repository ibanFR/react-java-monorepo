# Frontend module

React 19 + TypeScript + Vite frontend for the authentication UI.

## Prerequisites

- Node.js 22+ (see `.nvmrc`)
- npm

## Install

```bash
cd /home/runner/work/react-java-monorepo/react-java-monorepo/frontend
npm ci
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```

## Testing strategy

The frontend uses two complementary test layers:

- **Vitest + React Testing Library** for fast component/unit checks.
- **Cucumber + Playwright** for behavior-driven user-flow checks.

Policy:

- Keep business/user workflows in Cucumber scenarios.
- Keep component-level behavior in Vitest tests.

## Unit tests (Vitest)

```bash
npm test
# or
npm run test:unit
```

## BDD tests (Cucumber)

The BDD suite runs against a local Vite preview server started automatically by `start-server-and-test`.

```bash
npm run bdd
```

### Optional BDD modes

```bash
npm run bdd:headed
npm run bdd:debug
npm run bdd:smoke
npm run bdd:regression
```

### Tags

- `@smoke`: minimal confidence scenarios.
- `@regression`: broader behavior coverage.

## Run all tests

```bash
npm run test:all
```

## File layout for BDD

- `features/*.feature`: Gherkin scenarios.
- `features/step-definitions/*.js`: step implementations.
- `features/support/*.js`: Cucumber world and hooks.
- `features/utils/*.js`: selectors and shared runtime config.

## Reports and diagnostics

BDD runs generate:

- `reports/cucumber/report.json`
- `reports/cucumber/junit.xml`
- `test-artifacts/screenshots/*` (on failure)
- `test-artifacts/traces/*` (on failure)

In CI, these are uploaded as workflow artifacts.
