/**
 * ESM loader hooks that redirect `.css` imports to an empty module.
 * Runs in Node.js's loader thread; must be plain JavaScript (no TypeScript).
 */

/**
 * @param {string} specifier
 * @param {{ parentURL?: string }} context
 * @param {Function} nextResolve
 */
export function resolve(specifier, context, nextResolve) {
  if (specifier.endsWith('.css')) {
    return { shortCircuit: true, url: 'data:text/javascript,export default undefined' }
  }
  return nextResolve(specifier, context)
}
