import { World, type IWorldOptions, setWorldConstructor, After } from '@cucumber/cucumber'
import { JSDOM } from 'jsdom'
import { cleanup, within, type RenderResult } from '@testing-library/react'
import userEvent, { type UserEvent } from '@testing-library/user-event'

// Bootstrap a jsdom environment so React and React Testing Library work in Node.js.
// This runs once when the module is first loaded, before any scenario executes.
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
})

const { window: jsdomWindow } = dom

// Use Object.defineProperty to safely install jsdom globals, including those
// that Node.js already exposes only via a getter (e.g. navigator).
function installGlobal(name: string, value: unknown) {
  Object.defineProperty(global, name, { value, writable: true, configurable: true })
}

installGlobal('window', jsdomWindow)
installGlobal('document', jsdomWindow.document)
installGlobal('HTMLElement', jsdomWindow.HTMLElement)
installGlobal('HTMLInputElement', jsdomWindow.HTMLInputElement)
installGlobal('HTMLButtonElement', jsdomWindow.HTMLButtonElement)
installGlobal('HTMLFormElement', jsdomWindow.HTMLFormElement)
installGlobal('HTMLLabelElement', jsdomWindow.HTMLLabelElement)
installGlobal('Element', jsdomWindow.Element)
installGlobal('Node', jsdomWindow.Node)
installGlobal('Text', jsdomWindow.Text)
installGlobal('Event', jsdomWindow.Event)
installGlobal('MouseEvent', jsdomWindow.MouseEvent)
installGlobal('KeyboardEvent', jsdomWindow.KeyboardEvent)
installGlobal('InputEvent', jsdomWindow.InputEvent)
installGlobal('FocusEvent', jsdomWindow.FocusEvent)
installGlobal('CustomEvent', jsdomWindow.CustomEvent)
installGlobal('MutationObserver', jsdomWindow.MutationObserver)
installGlobal('Range', jsdomWindow.Range)
installGlobal('getComputedStyle', jsdomWindow.getComputedStyle.bind(jsdomWindow))
installGlobal('requestAnimationFrame', jsdomWindow.requestAnimationFrame.bind(jsdomWindow))
installGlobal('cancelAnimationFrame', jsdomWindow.cancelAnimationFrame.bind(jsdomWindow))

// Required for React Testing Library to wrap state updates in act().
installGlobal('IS_REACT_ACT_ENVIRONMENT', true)

export class LoginWorld extends World {
  renderResult!: RenderResult
  user!: UserEvent

  constructor(options: IWorldOptions) {
    super(options)
    // Pass jsdomWindow.document explicitly because user-event captures
    // globalThis.document at module-load time (before our installGlobal calls run).
    this.user = userEvent.setup({ document: jsdomWindow.document })
  }

  get screen() {
    // `screen` from @testing-library/dom is bound to document at module-load time
    // (before jsdom is available), so we derive it lazily via `within` instead.
    return within(jsdomWindow.document.body)
  }
}

After(function () {
  cleanup()
})

setWorldConstructor(LoginWorld)
