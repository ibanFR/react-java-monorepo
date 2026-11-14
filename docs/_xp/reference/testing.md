---
title: Testing Strategy
parent: XP Reference
---

# Frontend Testing Strategy

{: .no_toc }

The frontend project uses a two-layer testing approach: **Vitest** unit tests for fast component-level feedback and **Cucumber** BDD scenarios that describe application behaviour in plain language and guide code implementation.
{: .fs-6 .fw-300 }

## Table of Contents

{: .no_toc .text-delta }

1. TOC
{:toc}

## BDD Development Workflow

The project follows a Behaviour-Driven Development (BDD) workflow where Gherkin scenarios are written **before** the production code that satisfies them. The cycle works as follows:

### 1. Write a Scenario (Red)

A new behaviour is described in a `.feature` file using the Given / When / Then syntax:

```gherkin
Scenario: Successful login with valid credentials
  Given I open the login page
  When I type "admin" in the username field
  And I type "secret" in the password field
  And I click the "Sign in" button
  Then I should see a success message
```

Running `npm run test:bdd` at this point produces a failing step because the component does not yet render a success message.

### 2. Implement Step Definitions (if needed)

If the step phrases are new, corresponding step definitions are added under `src/features/step_definitions/`. Step definitions use [React Testing Library] to render components and interact with the DOM:

```tsx
Then('I should see a success message', function (this: LoginWorld) {
  this.screen.getByRole('status')
})
```

`getBy*` queries throw a descriptive error when the element is absent, so no extra assertion library is needed for positive checks. For negative assertions, `queryBy*` is used and the result is checked manually.

### 3. Make the Scenario Pass (Green)

The production component code is updated to satisfy the scenario. For example, after a successful form submission the component renders a `<div role="status">` element.

### 4. Refactor

With the scenario green, the code can be safely refactored while the BDD and unit tests guard against regressions.

### 5. Repeat

New scenarios are added to the feature file to describe the next piece of behaviour, keeping the cycle going.

{: .warning }
Feature files intentionally contain both **passing** and **failing** scenarios. The failing scenarios document the behaviour that must be implemented next — they are the "to-do list" that drives development.

## Testing Frameworks and Dependencies

| Dependency | Version | Role |
|---|---|---|
| [Vitest] | 4.x | Unit test runner (Vite-native, fast HMR-aware) |
| [@testing-library/react] | 16.x | Renders React components and provides DOM queries |
| [@testing-library/jest-dom] | 6.x | Custom matchers (`toBeInTheDocument`, `toHaveValue`, …) |
| [@testing-library/user-event] | 14.x | Simulates realistic user interactions (typing, clicking) |
| [jsdom] | 29.x | JavaScript DOM implementation for Node.js |
| [@cucumber/cucumber] | 12.x | Cucumber BDD framework — parses `.feature` files and runs step definitions |
| [tsx] | 4.x | TypeScript + JSX execution for Node.js (used to run Cucumber with `.tsx` step definitions) |

All testing dependencies are declared as `devDependencies` in `frontend/package.json`.

## Project Structure

```
frontend/
├── cucumber.js                        # Cucumber configuration
├── tsconfig.cucumber.json             # TypeScript config for Cucumber
├── vite.config.ts                     # Vitest configuration (test section)
└── src/
    ├── setupTests.ts                  # Vitest setup — jest-dom matchers + cleanup
    ├── pages/
    │   ├── LoginPage.tsx              # Component under test
    │   └── LoginPage.test.tsx         # Vitest unit tests
    └── features/
        ├── login.feature              # Gherkin scenarios
        ├── step_definitions/
        │   └── login.steps.tsx        # Step implementations
        └── support/
            ├── world.ts               # LoginWorld class — jsdom bootstrap
            ├── css-loader.mjs         # ESM hook entry point
            └── css-loader-hooks.mjs   # Stubs .css imports for Node.js
```

## Running the Tests

### Unit Tests (Vitest)

```bash
cd frontend
npm test
```

Runs all `*.test.tsx` files once via Vitest in jsdom mode. The setup file (`src/setupTests.ts`) imports jest-dom matchers and cleans up the DOM after each test.

### BDD Tests (Cucumber)

```bash
cd frontend
npm run test:bdd
```

This command starts Cucumber with TypeScript support via `tsx` and a custom ESM hook that stubs `.css` imports. It reads `cucumber.js` for configuration, which tells Cucumber where to find feature files, the World constructor, and step definitions.

**Expected output** while scenarios are still guiding implementation:

```
4 scenarios (2 failed, 2 passed)
18 steps (2 failed, 16 passed)
```

The two failing scenarios (`Successful login with valid credentials` and `Failed login with invalid credentials`) represent the next behaviour to implement. Once the component handles form submission and renders feedback, those scenarios turn green.

### Running Both

```bash
cd frontend
npm test && npm run test:bdd
```

[Vitest]: https://vitest.dev/
[@testing-library/react]: https://testing-library.com/docs/react-testing-library/intro
[@testing-library/jest-dom]: https://github.com/testing-library/jest-dom
[@testing-library/user-event]: https://testing-library.com/docs/user-event/intro
[jsdom]: https://github.com/jsdom/jsdom
[@cucumber/cucumber]: https://github.com/cucumber/cucumber-js
[tsx]: https://tsx.is/
[React Testing Library]: https://testing-library.com/docs/react-testing-library/intro
