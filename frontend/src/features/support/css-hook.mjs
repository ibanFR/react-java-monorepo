/**
 * Node.js module hook — resolves any `.css` import to an empty ES module so
 * that React components can be rendered in the Cucumber/Node.js environment
 * without a bundler.
 */

/**
 * @param {string} specifier
 * @param {object} context
 * @param {function} nextResolve
 */
export function resolve(specifier, context, nextResolve) {
  if (specifier.endsWith('.css')) {
    return { shortCircuit: true, url: 'data:text/css,stub' }
  }
  return nextResolve(specifier, context)
}

/**
 * @param {string} url
 * @param {object} context
 * @param {function} nextLoad
 */
export function load(url, context, nextLoad) {
  if (url === 'data:text/css,stub') {
    return { shortCircuit: true, format: 'module', source: 'export default {}' }
  }
  return nextLoad(url, context)
}

