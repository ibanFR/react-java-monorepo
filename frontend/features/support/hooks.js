import { Before, After } from '@cucumber/cucumber'
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import { isHeadless } from '../utils/config.js'

function sanitizeName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

Before(async function ({ pickle }) {
  const sanitizedScenarioName = sanitizeName(pickle.name)
  const timestamp = Date.now()
  this.artifactBaseName = `${sanitizedScenarioName}-${timestamp}`

  await mkdir('test-artifacts/screenshots', { recursive: true })
  await mkdir('test-artifacts/traces', { recursive: true })
  await mkdir('reports/cucumber', { recursive: true })

  this.browser = await chromium.launch({ headless: isHeadless() })
  this.context = await this.browser.newContext()
  await this.context.tracing.start({ screenshots: true, snapshots: true })
  this.page = await this.context.newPage()

  this.tracePath = `test-artifacts/traces/${this.artifactBaseName}.zip`
  this.screenshotPath = `test-artifacts/screenshots/${this.artifactBaseName}.png`
})

After(async function ({ result }) {
  if (result?.status === 'FAILED' && this.page) {
    await this.page.screenshot({ path: this.screenshotPath, fullPage: true })
    await this.attach(`Screenshot: ${this.screenshotPath}`)
    await this.context?.tracing.stop({ path: this.tracePath })
    await this.attach(`Trace: ${this.tracePath}`)
  } else {
    await this.context?.tracing.stop()
  }

  await this.page?.close()
  await this.context?.close()
  await this.browser?.close()
})
