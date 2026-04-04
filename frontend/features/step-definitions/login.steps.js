import assert from 'node:assert/strict'
import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from 'playwright/test'
import { appBaseUrl, NAVIGATION_TIMEOUT_MS } from '../utils/config.js'
import { selectors } from '../utils/selectors.js'

Given('I open the login page', async function () {
  assert(this.page, 'Expected Playwright page to be initialized')
  await this.page.goto(appBaseUrl(), { waitUntil: 'networkidle', timeout: NAVIGATION_TIMEOUT_MS })
})

Then('I should see a {string} heading', async function (headingText) {
  assert(this.page)
  const heading = this.page.locator(selectors.heading)
  await expect(heading).toHaveText(headingText)
})

Then('I should see a sign in button', async function () {
  assert(this.page)
  const button = this.page.locator(selectors.submitButton)
  await expect(button).toHaveText('Sign in')
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
  await expect(this.page.locator(selectors.usernameInput)).toHaveValue(expected)
})

Then('the password field should contain {string}', async function (expected) {
  assert(this.page)
  await expect(this.page.locator(selectors.passwordInput)).toHaveValue(expected)
})

Then('I should not see an alert message', async function () {
  assert(this.page)
  const alerts = this.page.locator('[role="alert"]')
  await expect(alerts).toHaveCount(0)
})

Then('I should not see a status message', async function () {
  assert(this.page)
  const statuses = this.page.locator('[role="status"]')
  await expect(statuses).toHaveCount(0)
})
