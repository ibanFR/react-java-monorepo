/**
 * Node.js ESM hook that stubs CSS imports so React components can be loaded
 * in a Cucumber (Node.js) context without a bundler.
 *
 * Loaded via `--import ./src/features/support/css-loader.mjs` before Cucumber starts.
 */
import { register } from 'node:module'

register('./css-loader-hooks.mjs', import.meta.url)
