import assert from 'node:assert/strict'
import { Given, When, Then } from '@cucumber/cucumber'
import { appBaseUrl } from '../utils/config.js'
import { selectors } from '../utils/selectors.js'

Given('I open the login page', async function () {
  assert(this.page, 'Expected Playwright page to be initialized')
  await this.page.goto(appBaseUrl(), { waitUntil: 'networkidle', timeout: 30_000 })
})

Then('I should see a {string} heading', async function (headingText) {
  assert(this.page)
  const heading = this.page.locator(selectors.heading)
  await heading.waitFor({ state: 'visible' })
  await assert.equal(await heading.innerText(), headingText)
})

Then('I should see a sign in button', async function () {
  assert(this.page)
  const button = this.page.locator(selectors.submitButton)
  await button.waitFor({ state: 'visible' })
  await assert.equal(await button.innerText(), 'Sign in')
})

When('I type {string} in the username field', async function (value) {
  assert(this.page)
  await this.page.locator(selectors.usernameInput).fill(value)
})

When('I type {string} in the password field', async function (value) {
  assert(this.page)
  await this.page.locator(selectors.passwordInput).fill(value)
})

Then('the username field should contain {string}', async function (expected) {
  assert(this.page)
  await assert.equal(await this.page.inputValue(selectors.usernameInput), expected)
})

Then('the password field should contain {string}', async function (expected) {
  assert(this.page)
  await assert.equal(await this.page.inputValue(selectors.passwordInput), expected)
})

Then('I should not see an alert message', async function () {
  assert(this.page)
  const alerts = this.page.locator('[role="alert"]')
  await assert.equal(await alerts.count(), 0)
})

Then('I should not see a status message', async function () {
  assert(this.page)
  const statuses = this.page.locator('[role="status"]')
  await assert.equal(await statuses.count(), 0)
})
