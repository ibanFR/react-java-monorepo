import { World, setWorldConstructor } from '@cucumber/cucumber'
import type { IWorldOptions } from '@cucumber/cucumber'
import type { RenderResult } from '@testing-library/react'
/**
 * Custom Cucumber World that holds the rendered component result for the
 * current scenario so step definitions can share access to the React tree.
 */
export class LoginWorld extends World {
  /** The result of the most recent `render()` call. Set by the Given step. */
  renderResult: RenderResult | undefined
  constructor(options: IWorldOptions) {
    super(options)
  }
}
setWorldConstructor(LoginWorld)
