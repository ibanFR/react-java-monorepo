/**
 * Loaded via `--import` as the very first entry in the node command so that
 * the jsdom globals (window, document, …) exist before @testing-library/dom
 * captures a reference to `document.body` when it is first imported.
 *
 * This must be a plain .mjs file (no TypeScript) so it can run before the
 * tsx/esm loader hook is registered.
 */
import { JSDOM } from 'jsdom'

const { window: win } = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
})

const browserGlobals = {
  window:               win,
  document:             win.document,
  navigator:            win.navigator,
  location:             win.location,
  Node:                 win.Node,
  NodeFilter:           win.NodeFilter,
  NodeList:             win.NodeList,
  Element:              win.Element,
  HTMLElement:          win.HTMLElement,
  HTMLInputElement:     win.HTMLInputElement,
  HTMLFormElement:      win.HTMLFormElement,
  HTMLButtonElement:    win.HTMLButtonElement,
  HTMLHeadingElement:   win.HTMLHeadingElement,
  HTMLLabelElement:     win.HTMLLabelElement,
  Text:                 win.Text,
  Comment:              win.Comment,
  DocumentFragment:     win.DocumentFragment,
  // Node.js 22 already ships native Event & CustomEvent — overriding them with
  // jsdom versions breaks chai's internal EventTarget.dispatchEvent check.
  // Browser-specific event constructors (absent from Node.js) still need jsdom:
  MouseEvent:           win.MouseEvent,
  KeyboardEvent:        win.KeyboardEvent,
  InputEvent:           win.InputEvent,
  FocusEvent:           win.FocusEvent,
  MutationObserver:     win.MutationObserver,
  getComputedStyle:     win.getComputedStyle.bind(win),
  requestAnimationFrame:  (cb) => win.requestAnimationFrame(cb),
  cancelAnimationFrame:   (id) => win.cancelAnimationFrame(id),
}

for (const [key, value] of Object.entries(browserGlobals)) {
  Object.defineProperty(globalThis, key, { value, writable: true, configurable: true })
}

// Provide the minimal Vitest worker-state stub that @vitest/expect needs when
// `expect()` is used outside of the Vitest runner (e.g. inside Cucumber steps).
// Only `filepath` is accessed for the `testPath` getter; the rest is never
// reached during DOM matcher assertions.
if (!globalThis['__vitest_worker__']) {
  globalThis['__vitest_worker__'] = {
    filepath: '',
    current: { test: null },
    config: { snapshotOptions: { updateSnapshot: 'none', snapshotEnvironment: null } },
  }
}

