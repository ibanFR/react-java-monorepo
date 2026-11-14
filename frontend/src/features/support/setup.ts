/**
 * Cucumber support: assertion matchers + per-scenario cleanup.
 *
 * The jsdom DOM environment is set up in jsdom-setup.mjs, which is loaded via
 * `--import` before this module, ensuring that `document.body` exists when
 * @testing-library/dom captures it at import time.
 *
 * This file only needs to:
 *   1. Extend Vitest's standalone `expect` with @testing-library/jest-dom matchers.
 *   2. Register an `After` hook that calls `cleanup()` after every scenario.
 */
import { After } from '@cucumber/cucumber'
import { cleanup } from '@testing-library/react'

// Extends Vitest's `expect` with jest-dom matchers (toBeInTheDocument, toHaveValue, …)
// and augments TypeScript types so that IDE auto-complete works.
import '@testing-library/jest-dom/vitest'

After(function () {
  cleanup()
})
