# Frontend Testing

This document describes the testing strategy, frameworks, and dependencies for the
`frontend/` module, and explains how to run the test suites.

---

## Testing strategy

The frontend uses **two complementary layers** of testing:

| Layer | Tool | Scope | File pattern |
|-------|------|-------|--------------|
| **Component tests** | Vitest + React Testing Library | Unit-level — one component at a time, no real browser | `src/**/*.test.tsx` |
| **BDD acceptance tests** | Cucumber.js | Behaviour-level — human-readable Gherkin scenarios driven by the same RTL helpers | `src/features/**/*.feature` |

### Component tests (Vitest)

Component tests verify the rendering and interaction behaviour of individual React
components in isolation.  They run in a jsdom environment provided by Vitest, so they
are fast and require no browser.

- Render a component with `render()` from `@testing-library/react`.
- Query the DOM through accessible roles and labels (`getByRole`, `getByLabelText`, …)
  — this mirrors what a real user or assistive technology would see.
- Simulate user input with `userEvent` from `@testing-library/user-event`.
- Assert with `expect(…).toBeInTheDocument()`, `toHaveValue()`, etc. from
  `@testing-library/jest-dom`.
- `cleanup()` is called automatically after every test via `src/setupTests.ts`.

### BDD acceptance tests (Cucumber)

Cucumber scenarios are written in Gherkin by expressing requirements in plain
English.  Each `Given / When / Then` step is backed by a TypeScript step-definition
that uses the same React Testing Library helpers as the component tests.

- Feature files live in `src/features/**/*.feature`.
- Step definitions live in `src/features/step-definitions/**/*.tsx`.
- The custom `LoginWorld` class (see `src/features/support/world.ts`) carries
  per-scenario state (the rendered component) between steps.
- Because Cucumber runs in plain Node.js (not a browser), a jsdom environment is
  bootstrapped via `--import` hooks before any test module is loaded — see
  [How the Cucumber runner is wired](#how-the-cucumber-runner-is-wired).

---

## Frameworks and dependencies

### Runtime test dependencies

| Package | Version | Role |
|---------|---------|------|
| `vitest` | `^4.1.2` | Test runner and assertion engine for component tests |
| `@testing-library/react` | `^16.3.2` | `render()` and component query utilities |
| `@testing-library/user-event` | `^14.6.1` | High-level user interaction simulation (type, click, …) |
| `@testing-library/jest-dom` | `^6.9.1` | Custom DOM matchers (`toBeInTheDocument`, `toHaveValue`, …) |
| `jsdom` | `^29.0.1` | In-process browser DOM for Vitest and Cucumber |
| `@cucumber/cucumber` | `^12.7.0` | BDD runner — Gherkin parser, step registry, hooks |
| `tsx` | `^4.21.0` | On-the-fly TypeScript/TSX execution for Cucumber (esbuild-backed) |

### Supporting dev dependencies (not test-specific)

| Package | Version | Role |
|---------|---------|------|
| `vite` / `@vitejs/plugin-react` | `^8.0.1` / `^6.0.1` | Build tool; also hosts Vitest |
| `typescript` | `~5.9.3` | Static type checking |
| `eslint` + plugins | `^9.39.4` | Linting (separate from testing) |

---

## Directory structure

```
frontend/
├── cucumber.json                        # Cucumber runner configuration
├── tsconfig.cucumber.json               # TypeScript config used by tsx for Cucumber
├── vite.config.ts                       # Vitest configuration (under the `test` key)
├── src/
│   ├── setupTests.ts                    # Vitest global setup (jest-dom + cleanup)
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   └── LoginPage.test.tsx           # ← component tests live next to the component
│   └── features/
│       ├── login.feature                # ← Gherkin feature files
│       ├── step-definitions/
│       │   └── login.steps.tsx          # ← step implementations (Given/When/Then)
│       └── support/
│           ├── world.ts                 # Custom Cucumber World (per-scenario state)
│           ├── setup.ts                 # jest-dom matchers + After cleanup hook
│           ├── jsdom-setup.mjs          # DOM globals injected before any module loads
│           ├── css-hook.mjs             # Node.js module hook — stubs .css imports
│           └── register-css-hook.mjs   # Registers css-hook.mjs via node:module
```

---

## Running the tests

### Prerequisites

```bash
cd frontend
npm install          # install all dependencies before the first run
```

Node.js ≥ 22 is required (see `engines` in `package.json`).

### Component tests (Vitest)

```bash
npm test             # run once and exit
```

Vitest picks up every file matching `src/**/*.test.{ts,tsx}`, runs them inside a
jsdom environment, and prints a summary.  No server or browser is required.

Example output:

```
 ✓ src/pages/LoginPage.test.tsx (4 tests) 154ms
 Test Files  1 passed (1)
      Tests  4 passed (4)
```

### BDD acceptance tests (Cucumber)

```bash
npm run test:cucumber
```

Cucumber reads `cucumber.json`, loads the feature files and step definitions via the
Node.js `--import` hook chain, and runs the scenarios.

Example output:

```
4 scenarios (4 passed)
11 steps (11 passed)
0m00.171s
```

An HTML report is written to `cucumber-report.html` after every run.

### Running both suites

```bash
npm test && npm run test:cucumber
```

---

## Configuration

### Vitest (`vite.config.ts`)

```ts
test: {
  environment: 'jsdom',        // simulate the browser DOM
  setupFiles: './src/setupTests.ts',  // runs before every test file
  globals: true,               // describe / it / expect available without imports
}
```

`src/setupTests.ts` imports `@testing-library/jest-dom` (extends `expect` with DOM
matchers) and registers `cleanup()` to unmount components after each test.

### Cucumber (`cucumber.json`)

```json
{
  "default": {
    "paths": ["src/features/**/*.feature"],
    "import": [
      "src/features/support/setup.ts",
      "src/features/support/world.ts",
      "src/features/step-definitions/**/*.tsx"
    ],
    "format": ["progress-bar", "html:cucumber-report.html"]
  }
}
```

### How the Cucumber runner is wired

The `test:cucumber` script passes three `--import` entries to Node.js **in order**:

```
node
  --import ./src/features/support/jsdom-setup.mjs
  --import tsx/esm
  --import ./src/features/support/register-css-hook.mjs
  ./node_modules/.bin/cucumber-js
```

| Entry | Why it must be in this position |
|-------|---------------------------------|
| `jsdom-setup.mjs` | Patches `globalThis` with `window`, `document`, `HTMLElement`, etc. **before** any test module is imported. `@testing-library/dom` captures `document.body` at import time, so the DOM must already exist. |
| `tsx/esm` | Registers the TypeScript/JSX transform so that `.ts` / `.tsx` step-definition files are compiled on-the-fly by esbuild. |
| `register-css-hook.mjs` | Registers a Node.js module hook that intercepts `.css` imports and returns an empty ES module. Because Node.js hooks run in LIFO order, this hook executes **before** the tsx hook and prevents tsx from choking on CSS files. |

`TSX_TSCONFIG_PATH=tsconfig.cucumber.json` is also set so that tsx picks up
`"jsx": "react-jsx"` (the automatic JSX runtime) for all source files.

---

## Writing tests

### Adding a component test

Create a `*.test.tsx` file next to the component.  Vitest will discover it
automatically.

```tsx
// src/pages/MyPage.test.tsx
import { render, screen } from '@testing-library/react'
import { MyPage } from './MyPage'

describe('MyPage', () => {
  it('renders the page title', () => {
    render(<MyPage />)
    expect(screen.getByRole('heading', { name: /my page/i })).toBeInTheDocument()
  })
})
```

### Adding a Cucumber scenario

1. Add a `Scenario` to an existing `.feature` file, or create a new
   `src/features/<name>.feature`.
2. Implement any new steps in a `src/features/step-definitions/<name>.steps.tsx`
   file, following the `Given / When / Then` functions pattern.
3. Use `this: LoginWorld` (TypeScript `this`-parameter annotation) to access the
   shared `renderResult` between steps — Cucumber passes the World as the function
   context, not as an argument.

```tsx
// src/features/step-definitions/example.steps.tsx
import { Then } from '@cucumber/cucumber'
import { screen } from '@testing-library/react'
import { expect } from 'vitest'
import type { LoginWorld } from '../support/world.ts'

Then('I should see a {string} link', function (this: LoginWorld, text: string) {
  expect(screen.getByRole('link', { name: new RegExp(text, 'i') })).toBeInTheDocument()
})
```

