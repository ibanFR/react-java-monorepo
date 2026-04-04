---
title: Frontend Testing Strategy
parent: XP Reference
---

# Frontend Testing Strategy

{: .no_toc }

A BDD-driven testing strategy for the React frontend, mapped to Martin Fowler's [Test Pyramid] for an optimal balance
of speed, cost, and feedback quality.
{: .fs-6 .fw-300 }

## Table of Contents

{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Overview

This testing strategy adopts a **Behaviour-Driven Development (BDD)** approach where tests are written _before_ the
production code and expressed in terms of user-observable behaviour rather than implementation details. Tests act as
living documentation and drive the design of the application from the outside in.

The strategy is organized around the [Test Pyramid], a model introduced by Mike Cohn and popularized by Martin Fowler,
which advocates for many fast, cheap unit tests at the base, fewer integration/component tests in the middle, and a
small number of end-to-end tests at the top.

```
        /  E2E  \          ← Few:   Slow, expensive, high confidence
       /----------\
      / Component  \       ← Some:  Moderate speed, good confidence
     /--------------\
    /     Unit       \     ← Many:  Fast, cheap, focused
   /------------------\
```

---

## Test Pyramid Layers

### 1. Unit Tests (Base)

| Attribute       | Detail                                        |
|-----------------|-----------------------------------------------|
| **Scope**       | Pure functions, utilities, hooks, value objects |
| **Runner**      | [Vitest]                                      |
| **Speed**       | Milliseconds per test                         |
| **Cost**        | Very low                                      |
| **When to use** | Logic that can be tested without rendering a component |

Unit tests verify the smallest pieces of logic in isolation. They require no DOM, no HTTP calls, and no component
rendering. Examples include form validation rules, data transformations, formatting helpers, and custom React hooks
tested with `renderHook`.

**Example — testing a validation rule:**

```typescript
describe('Username validation', () => {
  it('should reject an empty username', () => {
    expect(validateUsername('')).toBe(false)
  })

  it('should accept a non-empty username', () => {
    expect(validateUsername('admin')).toBe(true)
  })
})
```

### 2. Component Tests (Middle)

| Attribute       | Detail                                                          |
|-----------------|-----------------------------------------------------------------|
| **Scope**       | React components rendered in a simulated DOM                    |
| **Runner**      | [Vitest] + [React Testing Library] + [jsdom]                   |
| **Speed**       | Tens of milliseconds per test                                   |
| **Cost**        | Low                                                             |
| **When to use** | Verifying what the user sees and how the UI responds to actions |

Component tests render a React component into a simulated browser environment (jsdom) and assert against the DOM
from the user's perspective. They use accessible queries (`getByRole`, `getByLabelText`) to find elements and
`userEvent` to simulate realistic user interactions.

This is the **primary testing layer** for the React frontend. Most feature behaviour is verified here because component
tests offer the best trade-off between confidence and speed.

**Example — testing the login form behaviour:**

```typescript
describe('LoginPage — user authentication', () => {
  it('should contain a sign in heading', () => {
    render(<LoginPage />)

    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
  })

  it('user can enter username and password', async () => {
    render(<LoginPage />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/username/i), 'admin')
    await user.type(screen.getByLabelText(/password/i), 'secret')

    expect(screen.getByLabelText(/username/i)).toHaveValue('admin')
    expect(screen.getByLabelText(/password/i)).toHaveValue('secret')
  })
})
```

### 3. End-to-End Tests (Top)

| Attribute       | Detail                                                        |
|-----------------|---------------------------------------------------------------|
| **Scope**       | Complete user journeys through a real browser                 |
| **Runner**      | [Playwright]                                                  |
| **Speed**       | Seconds per test                                              |
| **Cost**        | High (real browser, real network, real backend)               |
| **When to use** | Critical paths that must work across the full stack           |

End-to-end (E2E) tests launch a real browser, navigate to the running application, and interact with it exactly as a
user would. They verify that the frontend, backend, and any external services work together correctly.

Because E2E tests are slow and brittle by nature, keep them to a minimum — cover only the **critical user journeys**
(e.g., successful login, failed login with error message). All other behaviour should be covered by unit and component
tests lower in the pyramid.

**Example — verifying the login journey:**

```typescript
test('user can sign in with valid credentials', async ({ page }) => {
  await page.goto('/login')

  await page.getByLabel(/username/i).fill('admin')
  await page.getByLabel(/password/i).fill('admin')
  await page.getByRole('button', { name: /sign in/i }).click()

  await expect(page.getByRole('status')).toContainText(/welcome/i)
})
```

---

## BDD Development Workflow

The BDD workflow follows an **outside-in** cycle: start with a failing high-level test that describes the desired
behaviour, then implement just enough code to make it pass.

### The Red-Green-Refactor Cycle

```
  ┌──────────────────────────────────────────────────────┐
  │                                                      │
  │   1. RED      Write a failing test that describes    │
  │               the next behaviour to implement        │
  │                          │                           │
  │                          ▼                           │
  │   2. GREEN    Write the simplest production code     │
  │               that makes the test pass               │
  │                          │                           │
  │                          ▼                           │
  │   3. REFACTOR Improve the code structure without     │
  │               changing behaviour (tests stay green)  │
  │                          │                           │
  │                          ▼                           │
  │              Loop back to step 1                     │
  │                                                      │
  └──────────────────────────────────────────────────────┘
```

### Step-by-Step Example

Suppose the next feature is: _"When the user submits invalid credentials, an error message is displayed."_

**Step 1 — RED: Write a failing component test**

```typescript
it('should display an error when credentials are invalid', async () => {
  render(<LoginPage />)
  const user = userEvent.setup()

  await user.type(screen.getByLabelText(/username/i), 'wrong')
  await user.type(screen.getByLabelText(/password/i), 'wrong')
  await user.click(screen.getByRole('button', { name: /sign in/i }))

  expect(await screen.findByRole('alert')).toHaveTextContent(/invalid credentials/i)
})
```

Run the test — it fails because `LoginPage` does not yet display an error alert.

**Step 2 — GREEN: Implement the minimum code**

Update `LoginPage.tsx` to call the authentication API and render an error alert when the response indicates failure.

Run the test again — it passes.

**Step 3 — REFACTOR: Improve the design**

Extract the API call into a dedicated `auth` module, rename variables for clarity, or extract a reusable `Alert`
component. Run the tests after every change to ensure they stay green.

### BDD Writing Guidelines

- **Describe behaviour, not implementation.** Test _what_ the user experiences, not _how_ the code works internally.
- **Use accessible queries.** Prefer `getByRole`, `getByLabelText`, and `getByText` over `getByTestId` or CSS
  selectors, matching how assistive technologies and real users find elements.
- **One behaviour per test.** Each `it` block should verify a single, clearly named behaviour.
- **Use `describe` to group related scenarios.** Nest `describe` blocks to organize tests by feature and context.
- **Name tests as sentences.** Use the pattern `it('should <expected behaviour> when <condition>')` so that test output
  reads as a specification.

---

## Testing Frameworks and Dependencies

### Currently Installed

| Package                        | Version  | Purpose                                      |
|--------------------------------|----------|----------------------------------------------|
| [Vitest]                       | ^4.1.2   | Test runner (fast, Vite-native, ESM-first)   |
| [React Testing Library]        | ^16.3.2  | Component rendering and accessible queries   |
| [@testing-library/jest-dom]    | ^6.9.1   | Custom DOM matchers (`toBeInTheDocument`, etc.) |
| [@testing-library/user-event]  | ^14.6.1  | Realistic user interaction simulation        |
| [jsdom]                        | ^29.0.1  | Simulated browser DOM for component tests    |

### Recommended for E2E (Not Yet Installed)

| Package      | Purpose                                             |
|--------------|-----------------------------------------------------|
| [Playwright] | Cross-browser E2E testing with auto-waiting and tracing |

Playwright is recommended for the E2E layer because it provides a modern, reliable API with built-in auto-waiting,
cross-browser support (Chromium, Firefox, WebKit), and powerful debugging tools (trace viewer, codegen). Install it
when the project is ready to add E2E tests:

```bash
npm init playwright@latest
```

### Configuration

**Vitest** is configured in `vite.config.ts`:

```typescript
test: {
  environment: 'jsdom',
  setupFiles: './src/setupTests.ts',
  globals: true,
}
```

**Setup file** (`src/setupTests.ts`) loads custom DOM matchers and ensures proper cleanup between tests:

```typescript
import { afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';

afterEach(() => cleanup());
```

---

## Running Tests

### Run All Tests (Once)

```bash
cd frontend
npm test
```

This executes `vitest run`, which runs every `*.test.{ts,tsx}` file and exits with a pass/fail status. Use this in CI
pipelines and before committing.

### Run Tests in Watch Mode

```bash
cd frontend
npx vitest
```

Vitest starts in watch mode by default when not invoked via `npm test`. It re-runs affected tests automatically when
source files change — ideal for the Red-Green-Refactor cycle.

### Run a Specific Test File

```bash
cd frontend
npx vitest src/pages/LoginPage.test.tsx
```

### Run Tests Matching a Pattern

```bash
cd frontend
npx vitest --reporter=verbose -t "sign in"
```

The `-t` flag filters tests by name, running only those whose description matches the given pattern.

### View Coverage

```bash
cd frontend
npx vitest run --coverage
```

Generates a coverage report. On first run, Vitest will prompt to install the coverage provider (`@vitest/coverage-v8`).

---

## Test File Conventions

| Convention                  | Detail                                                              |
|-----------------------------|---------------------------------------------------------------------|
| **File naming**             | `<ComponentName>.test.tsx` co-located next to the component         |
| **Test structure**          | `describe` for feature/context grouping, `it` for individual cases  |
| **Assertions**              | Use `@testing-library/jest-dom` matchers for DOM assertions         |
| **User interactions**       | Use `userEvent.setup()` for realistic event simulation              |
| **Queries**                 | Prefer accessible queries: `getByRole` > `getByLabelText` > `getByText` > `getByTestId` |
| **Async behaviour**         | Use `findBy*` queries (returns a promise) for elements that appear asynchronously |

---

[Test Pyramid]: https://martinfowler.com/bliki/TestPyramid.html
[Vitest]: https://vitest.dev/
[React Testing Library]: https://testing-library.com/docs/react-testing-library/intro/
[@testing-library/jest-dom]: https://github.com/testing-library/jest-dom
[@testing-library/user-event]: https://testing-library.com/docs/user-event/intro/
[jsdom]: https://github.com/jsdom/jsdom
[Playwright]: https://playwright.dev/
